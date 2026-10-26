import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import type {
  ParsedJob,
  SourceAdapter,
  SourceConfig,
} from './source-adapter.interface.js';

type IndeedSettings = {
  maxPages?: number;
  query?: Record<string, string | number | boolean>;
};

@Injectable()
export class IndeedAdapter implements SourceAdapter {
  async fetchJobs(source: SourceConfig): Promise<ParsedJob[]> {
    const { maxPages = 1, query = {} } =
      source.settings as IndeedSettings;

    const jobs = new Map<string, ParsedJob>();
    const pages = Math.min(Math.max(Number(maxPages) || 1, 1), 10);

    for (let page = 0; page < pages; page++) {
      const url = new URL(source.url);

      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, String(value));
      }

      url.searchParams.set('start', String(page * 10));

      const response = await fetch(url, {
        headers: {
          Accept: 'text/html',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`Indeed HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const cards = $('.job_seen_beacon, [data-jk]');

      if (!cards.length) {
        throw new Error(
          'Indeed returned no recognizable job cards. ' +
          'The page may be blocked or its HTML structure may have changed.',
        );
      }

      cards.each((_, element) => {
        const card = $(element);

        const link = card.find('a.jcs-JobTitle').first();

        const externalId =
          card.attr('data-jk') ??
          link.attr('data-jk');

        const title =
          link.find('span[title]').attr('title') ??
          link.text().trim();

        const company = card
          .find('[data-testid="company-name"]')
          .first()
          .text()
          .trim();

        const location = card
          .find('[data-testid="text-location"]')
          .first()
          .text()
          .trim();

        if (!externalId || !title) return;

        jobs.set(externalId, {
          externalId,
          title,
          company: company || 'Unknown',
          location: location || undefined,
          url: `https://de.indeed.com/viewjob?jk=${encodeURIComponent(externalId)}`,
        });
      });

      if (cards.length < 10) break;
    }

    return [...jobs.values()];
  }
}