import { supabase } from "@/lib/supabase";
import { resolveFirebaseUsers } from "@/lib/firebase-users";

export type LeagueMemberRole = "owner" | "co-owner" | "participant";

export interface LeagueMember {
  id: string;
  league_id: string;
  firebase_uid: string;
  role: LeagueMemberRole;
  created_at: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export async function getLeagueMembers(
  leagueId: string
): Promise<LeagueMember[]> {
  const { data, error } = await supabase
    .from("catan_league_members")
    .select("*")
    .eq("league_id", leagueId)
    .order("created_at");

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const uids = data.map((m: Record<string, unknown>) => m.firebase_uid as string);
  const users = await resolveFirebaseUsers(uids);

  return data.map((m: Record<string, unknown>) => {
    const userInfo = users.get(m.firebase_uid as string);
    return {
      id: m.id as string,
      league_id: m.league_id as string,
      firebase_uid: m.firebase_uid as string,
      role: m.role as LeagueMemberRole,
      created_at: m.created_at as string,
      displayName: userInfo?.displayName ?? null,
      email: userInfo?.email ?? null,
      photoURL: userInfo?.photoURL ?? null,
    };
  });
}

export async function getUserRole(
  leagueId: string,
  firebaseUid: string
): Promise<LeagueMemberRole | null> {
  const { data, error } = await supabase
    .from("catan_league_members")
    .select("role")
    .eq("league_id", leagueId)
    .eq("firebase_uid", firebaseUid)
    .single();

  if (error || !data) return null;
  return data.role as LeagueMemberRole;
}
