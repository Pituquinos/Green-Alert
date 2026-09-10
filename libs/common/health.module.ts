import { Controller, Get, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Controller('health')
class HealthController {
  constructor(private readonly config: ConfigService) {}
  @Get() health() {
    return { status: 'ok', service: this.config.get<string>('SERVICE_NAME'), scope: 'liveness' };
  }
}
@Module({ controllers: [HealthController] })
export class HealthModule {}
