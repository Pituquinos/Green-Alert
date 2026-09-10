import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { GeoModule } from './modules/geo/geo.module';
@Module({
  imports: [
    ConfigurationModule.forService('geo-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    GeoModule,
  ],
})
export class AppModule {}
