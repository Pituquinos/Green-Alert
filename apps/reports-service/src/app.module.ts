import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@app/config';
import { HealthModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MessagingModule } from '@app/messaging';
import { ReportsModule } from './modules/reports/reports.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
@Module({
  imports: [
    ConfigurationModule.forService('reports-service'),
    HealthModule,
    DatabaseModule,
    MessagingModule,
    ReportsModule,
    CategoriesModule,
    AssignmentsModule,
  ],
})
export class AppModule {}
