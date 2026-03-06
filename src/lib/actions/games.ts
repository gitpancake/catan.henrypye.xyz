"use server";

import { supabase } from "@/lib/supabase";
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
  const parsed = CreateGameSchema.parse(input);

  const { data: game, error: gameError } = await supabase
    .from("catan_games")
    .insert({
      league_id: parsed.leagueId,
      played_at: parsed.playedAt,
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
