import { Injectable } from '@nestjs/common';

import type {
  ParsedJob,
  SourceAdapter,
  SourceConfig,
} from './source-adapter.interface.js';

import { XING_JOB_SEARCH_QUERY } from './xing-query.js';

const XING_GRAPHQL_URL = 'https://www.xing.com/graphql/api';

interface XingJob {
  id: string;
  title: string;
  url: string;
  companyInfo?: {
    companyNameOverride?: string | null;
  } | null;
  location?: {
    city?: string | null;
  } | null;
  summary?: {
    content?: {
      keyResponsibilities?: string[] | null;
    } | null;
  } | null;
}

interface XingSearchResponse {
  data?: {
    jobSearchByQuery?: {
      total: number;
      collection: Array<{
        jobDetail: XingJob | null;
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

interface XingSettings {
  keywords?: string[];
  location?: string;
  maxPages?: number;
}

@Injectable()
export class XingAdapter implements SourceAdapter {
  async fetchJobs(source: SourceConfig): Promise<ParsedJob[]> {
    const { keywords = [], maxPages = 1 } = source.settings as XingSettings;

    const jobs = new Map<string, ParsedJob>();

    for (let page = 0; page < maxPages; page++) {
      const response = await fetch(XING_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          operationName: 'JobSearchByQuery',
          variables: {
            query: {
              keywords: keywords.join(' '),
            },
            consumer: 'loggedin.web.jobs.conv_search_results.center',
            limit: 20,
            offset: page * 20,
            searchMode: 'SEMANTIC',
          },
          query: XING_JOB_SEARCH_QUERY,
        }),
        signal: AbortSignal.timeout(15000),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('XING GRAPHQL ERROR:', {
          status: response.status,
          url: response.url,
          body: responseText.slice(0, 3000),
        });

        throw new Error(`XING GraphQL HTTP ${response.status}`);
      }

      const result = JSON.parse(responseText) as XingSearchResponse;

      if (result.errors?.length) {
        throw new Error(
          `XING GraphQL: ${result.errors.map((e) => e.message).join(', ')}`,
        );
      }

      const search = result.data?.jobSearchByQuery;

      if (!search) {
        throw new Error('XING GraphQL returned no search data');
      }

      for (const item of search.collection) {
        const job = item.jobDetail;

        if (!job?.id || !job.title || !job.url) continue;

        const externalId = String(job.id);

        jobs.set(externalId, {
          externalId,
          title: job.title,
          company: job.companyInfo?.companyNameOverride ?? 'Unknown',
          location: job.location?.city ?? undefined,
          url: new URL(job.url, 'https://www.xing.com').toString(),
          description:
            job.summary?.content?.keyResponsibilities?.join('\n') ?? undefined,
        });
      }

      if (search.collection.length < 20) break;
    }

    return [...jobs.values()];
  }
}
