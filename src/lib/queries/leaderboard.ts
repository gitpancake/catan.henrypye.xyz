import { supabase } from "@/lib/supabase";

export interface LeaderboardRow {
  player_id: string;
  player_name: string;
  league_id: string;
  games_played: number;
  total_vp: number;
  avg_vp: number;
  total_settlements: number;
  total_cities: number;
  longest_road_count: number;
  largest_army_count: number;
  total_dev_points: number;
  total_dev_card_vp: number;
  wins: number;
}

export async function getLeaderboard(leagueId: string): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase
    .from("catan_leaderboard")
    .select("*")
    .eq("league_id", leagueId)
    .order("total_vp", { ascending: false });
  if (error) throw error;
  return data as LeaderboardRow[];
}

export async function getLeaderboardStats(leagueId: string) {
  const rows = await getLeaderboard(leagueId);

  const totalGames = rows.length > 0 ? Math.max(...rows.map((r) => r.games_played)) : 0;
  const totalPlayers = rows.length;
  const leader = rows[0] ?? null;
  const mostWins = rows.length > 0
    ? rows.reduce((best, r) => (r.wins > best.wins ? r : best), rows[0])
    : null;

  return { totalGames, totalPlayers, leader, mostWins, rows };
}
