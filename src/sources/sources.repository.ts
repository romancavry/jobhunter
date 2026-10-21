
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceType } from './dto/create-source.dto.js';

export interface JobSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class SourcesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<JobSource[]> {
    return this.db.query<JobSource>(`
      SELECT *
      FROM job_sources
      ORDER BY created_at DESC
    `);
  }

  async findOne(id: string): Promise<JobSource | null> {
    const [source] = await this.db.query<JobSource>(
      'SELECT * FROM job_sources WHERE id = $1',
      [id],
    );

    return source ?? null;
  }

  async create(data: CreateSourceDto): Promise<JobSource> {
    const [source] = await this.db.query<JobSource>(
      `
      INSERT INTO job_sources (
        name, type, url, enabled, settings
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        data.name,
        data.type,
        data.url,
        data.enabled ?? true,
        JSON.stringify(data.settings ?? {}),
      ],
    );

    return source;
  }

  async update(
    id: string,
    data: UpdateSourceDto,
  ): Promise<JobSource | null> {
    const [source] = await this.db.query<JobSource>(
      `
      UPDATE job_sources
      SET
        name = COALESCE($2, name),
        type = COALESCE($3, type),
        url = COALESCE($4, url),
        enabled = COALESCE($5, enabled),
        settings = COALESCE($6, settings),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        data.name ?? null,
        data.type ?? null,
        data.url ?? null,
        data.enabled ?? null,
        data.settings === undefined
          ? null
          : JSON.stringify(data.settings),
      ],
    );

    return source ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.query<{ id: string }>(
      'DELETE FROM job_sources WHERE id = $1 RETURNING id',
      [id],
    );

    return rows.length > 0;
  }
}
