import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller.js';
import { SourcesService } from './sources.service.js';
import { SourcesRepository } from './sources.repository.js';
import { XingAdapter } from './adapters/xing.adapter.js';
import { JobsModule } from '../jobs/jobs.module.js';

@Module({
  imports: [JobsModule],
  controllers: [SourcesController],
  providers: [SourcesService, SourcesRepository, XingAdapter],
})
export class SourcesModule {}
