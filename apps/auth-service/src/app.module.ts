import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigurationModule.forService('auth-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    AuthModule,
  ],
})
export class AppModule {}
