import { getSession } from "@/lib/auth";
import { getLeagues } from "@/lib/queries/leagues";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const leagues = await getLeagues(session.uid);
    return Response.json(leagues);
  } catch {
    return Response.json({ error: "Failed to fetch leagues" }, { status: 500 });
  }
}
