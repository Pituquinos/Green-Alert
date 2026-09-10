import 'reflect-metadata';
import { bootstrap } from '@app/common';
import { AppModule } from './app.module';
void bootstrap(AppModule, 'users-service');
