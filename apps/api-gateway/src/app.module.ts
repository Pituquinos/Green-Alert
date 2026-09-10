import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
@Module({ imports: [ConfigurationModule.forService('api-gateway'), HealthModule] })
export class AppModule {}
