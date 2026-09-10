import { Injectable, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpConnectionManager, ChannelWrapper, connect } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { DomainEvent, EventName } from '@app/contracts';
import { EVENTS_EXCHANGE } from '@app/common';
@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);
  private connection!: AmqpConnectionManager;
  private publisher!: ChannelWrapper;
  private readonly consumers: ChannelWrapper[] = [];
  constructor(private readonly config: ConfigService) {}
  async onModuleInit(): Promise<void> {
    this.connection = connect([this.config.getOrThrow<string>('RABBITMQ_URI')], {
      heartbeatIntervalInSeconds: 5,
      reconnectTimeInSeconds: 5,
    });
    this.connection.on('disconnect', () => this.logger.warn('RabbitMQ disconnected; reconnecting'));
    this.publisher = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
        await channel.assertExchange(EVENTS_EXCHANGE + '.dead', 'topic', { durable: true });
      },
    });
    await this.publisher.waitForConnect();
  }
  async publish<K extends EventName>(event: DomainEvent<K>): Promise<void> {
    await this.publisher.publish(EVENTS_EXCHANGE, event.type, event, {
      persistent: true,
      contentType: 'application/json',
      messageId: event.id,
      correlationId: event.correlationId,
      timeout: 10000,
    });
  }
  async subscribe<K extends EventName>(
    consumer: string,
    bindings: K[],
    validate: (value: unknown) => value is DomainEvent<K>,
    handler: (event: DomainEvent<K>) => Promise<void>,
  ): Promise<void> {
    if (!/^[a-z0-9-]+$/.test(consumer) || bindings.length === 0)
      throw new Error('Invalid consumer configuration');
    const service = this.config.getOrThrow<string>('SERVICE_NAME');
    const queue = 'greenalert.' + service + '.' + consumer;
    const wrapper = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
        await channel.assertExchange(EVENTS_EXCHANGE + '.dead', 'topic', { durable: true });
        await channel.assertQueue(queue + '.dead', { durable: true });
        await channel.bindQueue(queue + '.dead', EVENTS_EXCHANGE + '.dead', queue);
        await channel.assertQueue(queue, {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': EVENTS_EXCHANGE + '.dead',
            'x-dead-letter-routing-key': queue,
          },
        });
        for (const binding of bindings) await channel.bindQueue(queue, EVENTS_EXCHANGE, binding);
        await channel.prefetch(10);
        await channel.consume(
          queue,
          (message: ConsumeMessage | null) => {
            if (message) void this.handleMessage(channel, message, bindings, validate, handler);
          },
          { noAck: false },
        );
      },
    });
    this.consumers.push(wrapper);
    await wrapper.waitForConnect();
  }
  private async handleMessage<K extends EventName>(
    channel: ConfirmChannel,
    message: ConsumeMessage,
    bindings: K[],
    validate: (value: unknown) => value is DomainEvent<K>,
    handler: (event: DomainEvent<K>) => Promise<void>,
  ): Promise<void> {
    try {
      const value: unknown = JSON.parse(message.content.toString('utf8'));
      if (
        !validate(value) ||
        !bindings.includes(value.type) ||
        value.type !== message.fields.routingKey
      ) {
        throw new Error('Invalid event');
      }
      await handler(value);
      channel.ack(message);
    } catch {
      this.logger.warn('Event rejected; sent to dead-letter queue');
      try {
        channel.nack(message, false, false);
      } catch {
        /* Closed channel: broker will redeliver. */
      }
    }
  }
  async onModuleDestroy(): Promise<void> {
    await Promise.allSettled(this.consumers.map((channel) => channel.close()));
    if (this.publisher) await this.publisher.close();
    if (this.connection) await this.connection.close();
  }
}
@Module({ providers: [MessagingService], exports: [MessagingService] })
export class MessagingModule {}
