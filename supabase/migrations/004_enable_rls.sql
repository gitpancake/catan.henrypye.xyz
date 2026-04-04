-- Enable RLS on all catan tables with deny-anon policies.
-- The app uses Firebase Auth (not Supabase Auth) and a service role key
-- for all server-side queries, which bypasses RLS entirely.
-- These policies exist as defense-in-depth: if the anon key is ever
-- used by mistake, no data is exposed.

-- Enable RLS
ALTER TABLE catan_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE catan_league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE catan_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE catan_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE catan_scores ENABLE ROW LEVEL SECURITY;

-- Deny all access for anon role (default deny is implicit with RLS enabled
-- and no permissive policies, but explicit policies make intent clear)
CREATE POLICY deny_anon_leagues ON catan_leagues
  FOR ALL USING (false);

CREATE POLICY deny_anon_league_members ON catan_league_members
  FOR ALL USING (false);

CREATE POLICY deny_anon_players ON catan_players
  FOR ALL USING (false);

CREATE POLICY deny_anon_games ON catan_games
  FOR ALL USING (false);

CREATE POLICY deny_anon_scores ON catan_scores
  FOR ALL USING (false);
