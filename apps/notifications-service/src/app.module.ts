import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { NotificationsModule } from './modules/notifications/notifications.module';
@Module({
  imports: [
    ConfigurationModule.forService('notifications-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    NotificationsModule,
  ],
})
export class AppModule {}
