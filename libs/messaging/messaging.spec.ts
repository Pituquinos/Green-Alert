import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { createEvent, DomainEvent } from '@app/contracts';
import { MessagingService } from './index';
jest.mock('amqp-connection-manager', () => ({ connect: jest.fn() }));
describe('event delivery policy', () => {
  it('confirms publishing, acknowledges success and dead-letters invalid or failed events', async () => {
    let receive: ((message: ConsumeMessage | null) => void) | undefined;
    const channel = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      prefetch: jest.fn(),
      consume: jest.fn((_queue: string, callback: (message: ConsumeMessage | null) => void) => {
        receive = callback;
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    };
    const publish = jest.fn().mockResolvedValue(true);
    const connection = {
      on: jest.fn(),
      close: jest.fn(),
      createChannel: ({ setup }: { setup: (channel: ConfirmChannel) => Promise<void> }) => {
        const ready = setup(channel as unknown as ConfirmChannel);
        return { waitForConnect: () => ready, publish, close: jest.fn() };
      },
    };
    jest.mocked(connect).mockReturnValue(connection as unknown as ReturnType<typeof connect>);
    const service = new MessagingService(
      new ConfigService({ SERVICE_NAME: 'analytics-service', RABBITMQ_URI: 'amqp://localhost' }),
    );
    await service.onModuleInit();
    const event = createEvent(
      'report.created',
      { reportId: '1', citizenId: '2', categoryId: '3' },
      'reports-service',
    );
    await service.publish(event);
    expect(publish).toHaveBeenCalledWith(
      'greenalert.events',
      'report.created',
      event,
      expect.objectContaining({ persistent: true, messageId: event.id }),
    );
    const handler = jest.fn().mockResolvedValue(undefined);
    const validate = (value: unknown): value is DomainEvent<'report.created'> =>
      typeof value === 'object' && value !== null && 'id' in value && 'type' in value;
    await service.subscribe('dashboard', ['report.created'], validate, handler);
    const deliver = async (content: string) => {
      receive?.({
        content: Buffer.from(content),
        fields: { routingKey: 'report.created' },
      } as ConsumeMessage);
      await new Promise((resolve) => setImmediate(resolve));
    };
    await deliver(JSON.stringify(event));
    expect(channel.ack).toHaveBeenCalledTimes(1);
    await deliver('invalid json');
    handler.mockRejectedValueOnce(new Error('Database unavailable'));
    await deliver(JSON.stringify(event));
    expect(channel.nack).toHaveBeenCalledTimes(2);
    expect(channel.nack).toHaveBeenLastCalledWith(expect.anything(), false, false);
    await service.onModuleDestroy();
  });
});
