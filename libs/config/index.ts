import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const SERVICE_PORTS = {
  'api-gateway': 3000,
  'auth-service': 3001,
  'users-service': 3002,
  'reports-service': 3003,
  'geo-service': 3004,
  'evidence-service': 3005,
  'notifications-service': 3006,
  'analytics-service': 3007,
} as const;
export type ServiceName = keyof typeof SERVICE_PORTS;
export function validateEnvironment(env: Record<string, unknown>, service: ServiceName) {
  const port = Number(
    env[service.replaceAll('-', '_').toUpperCase() + '_PORT'] ?? SERVICE_PORTS[service],
  );
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid service port');
  const nodeEnv = String(env.NODE_ENV ?? 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('Invalid NODE_ENV');
  const database = service === 'api-gateway' ? undefined : service.replace('-service', '');
  const mongoUri = database
    ? String(env['MONGO_' + database.toUpperCase() + '_URI'] ?? '')
    : undefined;
  if (database && !/^mongodb(\+srv)?:\/\//.test(mongoUri ?? ''))
    throw new Error('Missing or invalid MongoDB URI');
  const rabbitUri = String(env.RABBITMQ_URI ?? '');
  if (database && !/^amqps?:\/\//.test(rabbitUri))
    throw new Error('Missing or invalid RabbitMQ URI');
  return {
    ...env,
    NODE_ENV: nodeEnv,
    SERVICE_NAME: service,
    PORT: port,
    MONGO_URI: mongoUri,
    RABBITMQ_URI: rabbitUri,
  };
}
@Module({})
export class ConfigurationModule {
  static forService(service: ServiceName): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          validate: (env) => validateEnvironment(env, service),
        }),
      ],
      exports: [ConfigModule],
    };
  }
}
