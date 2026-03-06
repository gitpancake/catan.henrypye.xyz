import { supabase } from "@/lib/supabase";

export async function getGames(leagueId?: string) {
  let query = supabase
    .from("catan_games")
    .select(`
      *,
      catan_leagues(name),
      catan_scores(
        *,
        catan_players(name)
      )
    `)
    .order("played_at", { ascending: false });

  if (leagueId) {
    query = query.eq("league_id", leagueId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getGame(id: string) {
  const { data, error } = await supabase
    .from("catan_games")
    .select(`
      *,
      catan_leagues(name),
      catan_scores(
        *,
        catan_players(name)
      )
    `)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
