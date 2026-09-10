import { Type, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ServiceName } from '@app/config';
import { API_PREFIX } from '../constants';
import { SafeExceptionFilter } from '../exceptions/http-exception.filter';
export async function bootstrap(module: Type<unknown>, service: ServiceName): Promise<void> {
  const app = await NestFactory.create(module);
  const config = app.get(ConfigService);
  app.enableShutdownHooks();
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new SafeExceptionFilter());
  if (service === 'api-gateway') app.setGlobalPrefix(API_PREFIX);
  await app.listen(config.getOrThrow<number>('PORT'), '0.0.0.0');
}
