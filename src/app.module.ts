import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JobsModule } from './jobs/jobs.module.js';
import { DatabaseService } from './database/database.service.js';
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'project-name',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JobsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
