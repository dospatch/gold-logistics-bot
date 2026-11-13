CREATE TABLE IF NOT EXISTS server_telemetry (
  server_id UUID PRIMARY KEY REFERENCES servers(id) ON DELETE CASCADE,
  game TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (game IN ('ATS','ETS2','UNKNOWN')),
  connected BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS server_telemetry_updated_at_idx ON server_telemetry (updated_at DESC);