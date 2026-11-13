CREATE TABLE IF NOT EXISTS autopost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type TEXT NOT NULL UNIQUE CHECK (post_type IN ('server_recruitment','convoy','vtc_recruitment','changelog','maintenance')),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  interval_hours NUMERIC(10,2) NOT NULL DEFAULT 24,
  channel_ids TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('steam','truckersmp','other')),
  platform_id TEXT,
  display_name TEXT NOT NULL,
  account_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  currently_online BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(server_id, platform, platform_id)
);

CREATE INDEX IF NOT EXISTS player_presence_server_online_idx ON player_presence(server_id, currently_online);
CREATE INDEX IF NOT EXISTS player_presence_name_idx ON player_presence(LOWER(display_name));
