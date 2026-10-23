import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SourcesRepository } from './sources.repository.js';
import { CreateSourceDto, SourceType } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceAdapter } from './adapters/source-adapter.interface.js';
import { XingAdapter } from './adapters/xing.adapter.js';
import { JobsRepository } from '../jobs/jobs.repository.js';

@Injectable()
export class SourcesService {
  constructor(
    private readonly repository: SourcesRepository,
    private readonly xingAdapter: XingAdapter,
    private readonly jobsRepository: JobsRepository,
  ) {}

  private getAdapter(type: SourceType): SourceAdapter {
    switch (type) {
      case SourceType.XING:
        return this.xingAdapter;
      default:
        throw new BadRequestException(`Unsupported type: ${type}`);
    }
  }

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const source = await this.repository.findOne(id);

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  create(data: CreateSourceDto) {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateSourceDto) {
    const source = await this.repository.update(id, data);

    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return source;
  }

  async delete(id: string) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Source not found');
    }

    return { success: true };
  }

  async sync(id: string) {
    const source = await this.findOne(id);

    if (!source.enabled) {
      throw new BadRequestException('Source is disabled');
    }

    const adapter = this.getAdapter(source.type);

    if (!adapter) {
      throw new BadRequestException('Adapter not found');
    }

    const jobs = await adapter.fetchJobs(source);

    const saved = await this.jobsRepository.upsertMany(source.id, jobs);

    return {
      sourceId: source.id,
      fetched: jobs.length,
      saved,
    };
  }
}
