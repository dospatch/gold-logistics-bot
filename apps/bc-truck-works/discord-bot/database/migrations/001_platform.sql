CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT 'ATS' CHECK (game IN ('ATS','ETS2','UNKNOWN')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','offline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS servers_owner_idx ON servers(owner_id);
CREATE INDEX IF NOT EXISTS servers_status_idx ON servers(status);

DROP TRIGGER IF EXISTS servers_set_updated_at ON servers;
CREATE TRIGGER servers_set_updated_at
BEFORE UPDATE ON servers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  product TEXT NOT NULL DEFAULT 'BC TRUCK WORKS',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','expired','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS licenses_user_idx ON licenses(user_id);
CREATE INDEX IF NOT EXISTS licenses_status_idx ON licenses(status);

CREATE TABLE IF NOT EXISTS server_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  agent_id TEXT,
  agent_version TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(server_id, agent_id)
);

CREATE INDEX IF NOT EXISTS server_connections_last_seen_idx ON server_connections(last_seen DESC);
