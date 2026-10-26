import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';

export interface Job {
  id: string;
  source: string;
  external_id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  description: string | null;
  match_score: number | null;
  created_at: Date;
}

@Injectable()
export class JobsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Job[]> {
    return this.db.query<Job>(`
      SELECT *
      FROM jobs
      ORDER BY created_at DESC
    `);
  }

  async findOne(id: string): Promise<Job | null> {
    const [job] = await this.db.query<Job>('SELECT * FROM jobs WHERE id = $1', [
      id,
    ]);

    return job ?? null;
  }

  async create(data: CreateJobDto): Promise<Job> {
    const [job] = await this.db.query<Job>(
      `
      INSERT INTO jobs (
        source,
        external_id,
        title,
        company,
        location,
        url,
        description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.source,
        data.externalId,
        data.title,
        data.company,
        data.location ?? null,
        data.url,
        data.description ?? null,
      ],
    );

    return job;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.query<{ id: string }>(
      'DELETE FROM jobs WHERE id = $1 RETURNING id',
      [id],
    );

    return rows.length > 0;
  }
}
