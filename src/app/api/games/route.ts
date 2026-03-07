import { getSession } from "@/lib/auth";
import { getUserRole } from "@/lib/queries/members";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const ScoreSchema = z.object({
  playerId: z.string().uuid(),
  victoryPoints: z.number().int().min(0),
  settlements: z.number().int().min(0),
  cities: z.number().int().min(0),
  longestRoad: z.boolean(),
  largestArmy: z.boolean(),
  devPoints: z.number().int().min(0),
  devCardVp: z.number().int().min(0),
});

const CreateGameSchema = z.object({
  leagueId: z.string().uuid(),
  playedAt: z.string(),
  scores: z.array(ScoreSchema).min(2),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateGameSchema.parse(body);

    const role = await getUserRole(parsed.leagueId, session.uid);
    if (!role || role === "participant") {
      return Response.json(
        { error: "You don't have permission to enter results for this league" },
        { status: 403 }
      );
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
      dev_card_vp: s.devCardVp,
    }));

    const { error: scoresError } = await supabase
      .from("catan_scores")
      .insert(scoreRows);

    if (scoresError) throw scoresError;

    return Response.json(game);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: err.issues }, { status: 400 });
    }
    return Response.json({ error: "Failed to create game" }, { status: 500 });
  }
}
