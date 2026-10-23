import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

import type {
  ParsedJob,
  SourceAdapter,
  SourceConfig,
} from './source-adapter.interface.js';

@Injectable()
export class XingAdapter implements SourceAdapter {
  async fetchJobs(source: SourceConfig): Promise<ParsedJob[]> {
    const response = await fetch(source.url, {
      headers: {
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`XING returned ${response.status}`);
    }

    return this.parseJobs(await response.text());
  }

  parseJobs(html: string): ParsedJob[] {
    const $ = cheerio.load(html);

    const jobs = new Map<string, ParsedJob>();

    $('article[class*="job-teaser-list-item-styles__Card"]').each(
      (_, element) => {
        const card = $(element);

        const title = card
          .find('[data-testid="job-teaser-list-title"]')
          .first()
          .text()
          .trim();

        const company = card
          .find('[class*="job-teaser-list-item-styles__Company"]')
          .first()
          .text()
          .trim();

        const locationElement = card
          .find('[class*="multi-location-display-styles__Container"] p')
          .first()
          .clone();

        locationElement.find('b').remove();

        const location = locationElement.text().trim();

        const description = card
          .find('ul[class*="summary__List"] li')
          .map((_, li) => $(li).text().trim())
          .get()
          .join('\n');

        const href = card.find('a[href^="/jobs/"]').first().attr('href');

        if (!title || !company || !href) return;

        const url = new URL(href, 'https://www.xing.com');

        if (
          url.hostname !== 'www.xing.com' ||
          !/^\/jobs\/[^/]+$/.test(url.pathname)
        ) {
          return;
        }

        url.search = '';
        url.hash = '';

        const externalId = url.pathname.match(/-(\d+)$/)?.[1] ?? url.toString();

        jobs.set(externalId, {
          externalId,
          title,
          company,
          location,
          description,
          url: url.toString(),
        });
      },
    );

    return [...jobs.values()];
  }
}
