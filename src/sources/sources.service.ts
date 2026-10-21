
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SourcesRepository } from './sources.repository.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@Injectable()
export class SourcesService {
  constructor(
    private readonly repository: SourcesRepository,
  ) {}

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
}
