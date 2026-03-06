"use server";

import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { getUserRole } from "@/lib/queries/members";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ScoreSchema = z.object({
  playerId: z.string().uuid(),
  victoryPoints: z.number().int().min(0),
  settlements: z.number().int().min(0),
  cities: z.number().int().min(0),
  longestRoad: z.boolean(),
  largestArmy: z.boolean(),
  devPoints: z.number().int().min(0),
});

const CreateGameSchema = z.object({
  leagueId: z.string().uuid(),
  playedAt: z.string(),
  scores: z.array(ScoreSchema).min(2),
});

export async function createGame(input: z.infer<typeof CreateGameSchema>) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const parsed = CreateGameSchema.parse(input);

  // Check permission: must be owner or co-owner
  const role = await getUserRole(parsed.leagueId, session.uid);
  if (!role || role === "participant") {
    throw new Error("You don't have permission to enter results for this league");
  }

  const { data: game, error: gameError } = await supabase
    .from("catan_games")
    .insert({
      league_id: parsed.leagueId,
      played_at: parsed.playedAt,
      created_by: session.uid,
    })
    .select()
    .single();

  if (gameError) throw gameError;

  const scoreRows = parsed.scores.map((s) => ({
    game_id: game.id,
    player_id: s.playerId,
    victory_points: s.victoryPoints,
    settlements: s.settlements,
    cities: s.cities,
    longest_road: s.longestRoad,
    largest_army: s.largestArmy,
    dev_points: s.devPoints,
  }));

  const { error: scoresError } = await supabase
    .from("catan_scores")
    .insert(scoreRows);

  if (scoresError) throw scoresError;

  revalidatePath("/dashboard");
  revalidatePath("/games");
  return game;
}
