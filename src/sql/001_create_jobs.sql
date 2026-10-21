CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  description TEXT,
  match_score INTEGER CHECK (
    match_score BETWEEN 0 AND 100
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (source, external_id)
);
