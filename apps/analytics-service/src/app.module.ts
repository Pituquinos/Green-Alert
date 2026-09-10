import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { AnalyticsModule } from './modules/analytics/analytics.module';
@Module({
  imports: [
    ConfigurationModule.forService('analytics-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
