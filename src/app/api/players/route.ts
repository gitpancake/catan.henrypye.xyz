import { getSession } from "@/lib/auth";
import { getPlayers } from "@/lib/queries/players";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const players = await getPlayers();
    return Response.json(players);
  } catch {
    return Response.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
