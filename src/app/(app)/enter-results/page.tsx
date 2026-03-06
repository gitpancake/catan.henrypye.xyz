export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { getLeagues } from "@/lib/queries/leagues";
import { getPlayers } from "@/lib/queries/players";
import GameResultsForm from "@/components/game-results-form";
import { redirect } from "next/navigation";

export default async function EnterResultsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const [allLeagues, players] = await Promise.all([
    getLeagues(session.uid),
    getPlayers(),
  ]);

  // Only show leagues where user is owner or co-owner
  const leagues = allLeagues.filter(
    (l: Record<string, unknown>) =>
      l.userRole === "owner" || l.userRole === "co-owner"
  );

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Enter Results</h1>
      {leagues.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          You need to be an owner or co-owner of a league to enter results.
        </div>
      ) : (
        <GameResultsForm leagues={leagues} players={players} />
      )}
    </div>
  );
}
