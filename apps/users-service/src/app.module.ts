import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { UsersModule } from './modules/users/users.module';
@Module({
  imports: [
    ConfigurationModule.forService('users-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    UsersModule,
  ],
})
export class AppModule {}
