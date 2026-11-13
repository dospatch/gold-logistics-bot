CREATE TABLE IF NOT EXISTS driver_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('ATS','ETS2')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  truck_name TEXT,
  cargo TEXT,
  route_name TEXT,
  income NUMERIC(12,2) NOT NULL DEFAULT 0,
  odometer_start_km NUMERIC(14,3),
  odometer_end_km NUMERIC(14,3),
  miles NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (miles >= 0),
  fuel_start NUMERIC(12,3),
  fuel_end NUMERIC(12,3),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (odometer_end_km IS NULL OR odometer_start_km IS NULL OR odometer_end_km >= odometer_start_km),
  CHECK ((status = 'active' AND ended_at IS NULL) OR (status <> 'active' AND ended_at IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS driver_trips_one_active_idx
  ON driver_trips(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS driver_trips_user_started_idx
  ON driver_trips(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS driver_trips_game_idx
  ON driver_trips(game);

DROP TRIGGER IF EXISTS driver_trips_set_updated_at ON driver_trips;
CREATE TRIGGER driver_trips_set_updated_at
BEFORE UPDATE ON driver_trips
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
