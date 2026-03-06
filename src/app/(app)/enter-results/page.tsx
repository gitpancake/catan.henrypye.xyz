export const dynamic = "force-dynamic";

import { getLeagues } from "@/lib/queries/leagues";
import { getPlayers } from "@/lib/queries/players";
import GameResultsForm from "@/components/game-results-form";

export default async function EnterResultsPage() {
  const [leagues, players] = await Promise.all([getLeagues(), getPlayers()]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Enter Results</h1>
      <GameResultsForm leagues={leagues} players={players} />
    </div>
  );
}
