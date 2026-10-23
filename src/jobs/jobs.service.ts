import { Injectable, NotFoundException } from '@nestjs/common';

import { JobsRepository } from './jobs.repository.js';
import { CreateJobDto } from './dto/create-job.dto.js';

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  findAll() {
    return this.jobsRepository.findAll();
  }

  async findOne(id: string) {
    const job = await this.jobsRepository.findOne(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  create(data: CreateJobDto) {
    return this.jobsRepository.create(data);
  }
}
