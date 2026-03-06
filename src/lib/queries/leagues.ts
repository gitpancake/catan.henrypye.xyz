import { supabase } from "@/lib/supabase";

export async function getLeagues(firebaseUid?: string) {
  if (firebaseUid) {
    // Get leagues the user is a member of, with their role
    const { data: memberships, error: memberError } = await supabase
      .from("catan_league_members")
      .select("league_id, role")
      .eq("firebase_uid", firebaseUid);

    if (memberError) throw memberError;
    if (!memberships || memberships.length === 0) return [];

    const leagueIds = memberships.map(
      (m: Record<string, unknown>) => m.league_id as string
    );

    const { data, error } = await supabase
      .from("catan_leagues")
      .select("*")
      .in("id", leagueIds)
      .order("name");

    if (error) throw error;

    // Attach role to each league
    const roleMap = new Map(
      memberships.map((m: Record<string, unknown>) => [
        m.league_id as string,
        m.role as string,
      ])
    );

    return (data ?? []).map((league: Record<string, unknown>) => ({
      ...league,
      userRole: roleMap.get(league.id as string) ?? null,
    }));
  }

  // Fallback: return all leagues (no filtering)
  const { data, error } = await supabase
    .from("catan_leagues")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getLeague(id: string) {
  const { data, error } = await supabase
    .from("catan_leagues")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
