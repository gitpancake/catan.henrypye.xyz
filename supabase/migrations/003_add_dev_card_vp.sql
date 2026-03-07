-- Add dev_card_vp column to track VP from development cards (e.g. Chapel, Library)
ALTER TABLE catan_scores
  ADD COLUMN dev_card_vp integer NOT NULL DEFAULT 0 CHECK (dev_card_vp >= 0);

-- Recreate leaderboard view to include dev_card_vp
DROP VIEW IF EXISTS catan_leaderboard;
CREATE VIEW catan_leaderboard AS
SELECT
  s.player_id,
  p.name AS player_name,
  g.league_id,
  count(DISTINCT s.game_id) AS games_played,
  sum(s.victory_points) AS total_vp,
  round(avg(s.victory_points)::numeric, 1) AS avg_vp,
  sum(s.settlements) AS total_settlements,
  sum(s.cities) AS total_cities,
  sum(CASE WHEN s.longest_road THEN 1 ELSE 0 END) AS longest_road_count,
  sum(CASE WHEN s.largest_army THEN 1 ELSE 0 END) AS largest_army_count,
  sum(s.dev_points) AS total_dev_points,
  sum(s.dev_card_vp) AS total_dev_card_vp,
  count(DISTINCT s.game_id) FILTER (
    WHERE s.victory_points = (
      SELECT max(s2.victory_points)
      FROM catan_scores s2
      WHERE s2.game_id = s.game_id
    )
  ) AS wins
FROM catan_scores s
JOIN catan_players p ON p.id = s.player_id
JOIN catan_games g ON g.id = s.game_id
GROUP BY s.player_id, p.name, g.league_id;
