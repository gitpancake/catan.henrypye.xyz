-- Migration: Drop catan_users, add league membership with roles
-- Firebase Auth is now the sole source of user identity

-- Drop FK constraints referencing catan_users
ALTER TABLE catan_leagues DROP CONSTRAINT IF EXISTS catan_leagues_created_by_fkey;
ALTER TABLE catan_games DROP CONSTRAINT IF EXISTS catan_games_created_by_fkey;

-- Change created_by from uuid to text (stores firebase_uid directly)
ALTER TABLE catan_leagues ALTER COLUMN created_by TYPE text USING created_by::text;
ALTER TABLE catan_games ALTER COLUMN created_by TYPE text USING created_by::text;

-- Drop catan_users table
DROP TABLE IF EXISTS catan_users;

-- League membership table with roles
CREATE TABLE catan_league_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES catan_leagues(id) ON DELETE CASCADE,
  firebase_uid text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'co-owner', 'participant')) DEFAULT 'participant',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(league_id, firebase_uid)
);

CREATE INDEX idx_catan_league_members_uid ON catan_league_members(firebase_uid);
CREATE INDEX idx_catan_league_members_league ON catan_league_members(league_id);
