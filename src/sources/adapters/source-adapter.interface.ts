export interface ParsedJob {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
}

export interface SourceConfig {
  id: string;
  type: string;
  url: string;
  enabled: boolean;
  settings: Record<string, unknown>;
}

export interface SourceAdapter {
  fetchJobs(source: SourceConfig): Promise<ParsedJob[]>;
}
