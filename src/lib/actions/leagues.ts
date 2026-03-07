"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserRole } from "@/lib/queries/members";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateLeagueSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createLeague(input: z.infer<typeof CreateLeagueSchema>) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const parsed = CreateLeagueSchema.parse(input);

  const { data, error } = await supabase
    .from("catan_leagues")
    .insert({ name: parsed.name, created_by: session.uid })
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase.from("catan_league_members").insert({
    league_id: data.id,
    firebase_uid: session.uid,
    role: "owner",
  });

  revalidatePath("/dashboard");
  revalidatePath("/leagues");
  return data;
}

const InviteMemberSchema = z.object({
  leagueId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["co-owner", "participant"]),
});

export async function inviteMember(
  input: z.infer<typeof InviteMemberSchema>
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const parsed = InviteMemberSchema.parse(input);

  // Check caller has permission (owner or co-owner)
  const callerRole = await getUserRole(parsed.leagueId, session.uid);
  if (!callerRole || callerRole === "participant") {
    throw new Error("You don't have permission to invite members");
  }

  // Only owners can invite co-owners
  if (parsed.role === "co-owner" && callerRole !== "owner") {
    throw new Error("Only owners can invite co-owners");
  }

  // Look up Firebase user by email
  let targetUser;
  try {
    targetUser = await adminAuth.getUserByEmail(parsed.email);
  } catch {
    throw new Error("No user found with that email address");
  }

  const { error } = await supabase.from("catan_league_members").insert({
    league_id: parsed.leagueId,
    firebase_uid: targetUser.uid,
    role: parsed.role,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("User is already a member of this league");
    }
    throw error;
  }

  revalidatePath(`/leagues/${parsed.leagueId}`);
  revalidatePath("/leagues");
}

export async function removeMember(leagueId: string, memberId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const callerRole = await getUserRole(leagueId, session.uid);
  if (callerRole !== "owner") {
    throw new Error("Only owners can remove members");
  }

  const { error } = await supabase
    .from("catan_league_members")
    .delete()
    .eq("id", memberId)
    .eq("league_id", leagueId);

  if (error) throw error;

  revalidatePath(`/leagues/${leagueId}`);
  revalidatePath("/leagues");
}

export async function updateMemberRole(
  leagueId: string,
  memberId: string,
  newRole: "co-owner" | "participant"
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const callerRole = await getUserRole(leagueId, session.uid);
  if (callerRole !== "owner") {
    throw new Error("Only owners can change member roles");
  }

  const { error } = await supabase
    .from("catan_league_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("league_id", leagueId);

  if (error) throw error;

  revalidatePath(`/leagues/${leagueId}`);
}

export async function deleteLeague(leagueId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const callerRole = await getUserRole(leagueId, session.uid);
  if (callerRole !== "owner") {
    throw new Error("Only the owner can delete a league");
  }

  // Delete scores for all games in this league
  const { data: games } = await supabase
    .from("catan_games")
    .select("id")
    .eq("league_id", leagueId);

  if (games && games.length > 0) {
    const gameIds = games.map((g: Record<string, unknown>) => g.id as string);
    await supabase.from("catan_scores").delete().in("game_id", gameIds);
    await supabase.from("catan_games").delete().eq("league_id", leagueId);
  }

  // Delete members and league
  await supabase.from("catan_league_members").delete().eq("league_id", leagueId);
  const { error } = await supabase.from("catan_leagues").delete().eq("id", leagueId);
  if (error) throw error;

  revalidatePath("/leagues");
  revalidatePath("/games");
  revalidatePath("/dashboard");
}

export async function leaveLeague(leagueId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const callerRole = await getUserRole(leagueId, session.uid);
  if (callerRole === "owner") {
    throw new Error("Owners cannot leave their league. Transfer ownership first.");
  }

  const { error } = await supabase
    .from("catan_league_members")
    .delete()
    .eq("league_id", leagueId)
    .eq("firebase_uid", session.uid);

  if (error) throw error;

  revalidatePath("/leagues");
  revalidatePath("/dashboard");
}
