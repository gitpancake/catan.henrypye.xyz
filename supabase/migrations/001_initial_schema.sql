-- Catan Leaderboard Schema
-- All tables prefixed with catan_ for shared Supabase instance

create table catan_users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text not null unique,
  username text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table catan_leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  created_by uuid references catan_users(id)
);

create table catan_players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table catan_games (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references catan_leagues(id) on delete cascade,
  played_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references catan_users(id)
);

create table catan_scores (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references catan_games(id) on delete cascade,
  player_id uuid not null references catan_players(id) on delete cascade,
  victory_points integer not null default 0 check (victory_points >= 0),
  settlements integer not null default 0 check (settlements >= 0),
  cities integer not null default 0 check (cities >= 0),
  longest_road boolean not null default false,
  largest_army boolean not null default false,
  dev_points integer not null default 0 check (dev_points >= 0),
  created_at timestamptz not null default now(),
  unique(game_id, player_id)
);

-- Indexes for common queries
create index idx_catan_games_league on catan_games(league_id);
create index idx_catan_scores_game on catan_scores(game_id);
create index idx_catan_scores_player on catan_scores(player_id);
create index idx_catan_games_played_at on catan_games(played_at desc);

-- Leaderboard aggregation view (replaces JS hydration logic from old API)
create or replace view catan_leaderboard as
select
  s.player_id,
  p.name as player_name,
  g.league_id,
  count(distinct s.game_id) as games_played,
  sum(s.victory_points) as total_vp,
  round(avg(s.victory_points)::numeric, 1) as avg_vp,
  sum(s.settlements) as total_settlements,
  sum(s.cities) as total_cities,
  sum(case when s.longest_road then 1 else 0 end) as longest_road_count,
  sum(case when s.largest_army then 1 else 0 end) as largest_army_count,
  sum(s.dev_points) as total_dev_points,
  count(distinct s.game_id) filter (
    where s.victory_points = (
      select max(s2.victory_points)
      from catan_scores s2
      where s2.game_id = s.game_id
    )
  ) as wins
from catan_scores s
join catan_players p on p.id = s.player_id
join catan_games g on g.id = s.game_id
group by s.player_id, p.name, g.league_id;
