import { Module } from '@nestjs/common';
import { SourcesController } from './sources.controller.js';
import { SourcesService } from './sources.service.js';
import { SourcesRepository } from './sources.repository.js';

@Module({
  controllers: [SourcesController],
  providers: [SourcesService, SourcesRepository],
})
export class SourcesModule {}