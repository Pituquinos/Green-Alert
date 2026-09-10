import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { EvidenceModule } from './modules/evidence/evidence.module';
@Module({
  imports: [
    ConfigurationModule.forService('evidence-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    EvidenceModule,
  ],
})
export class AppModule {}
