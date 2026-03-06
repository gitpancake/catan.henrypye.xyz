export const dynamic = "force-dynamic";

import { getLeagues } from "@/lib/queries/leagues";
import { getGames } from "@/lib/queries/games";
import CreateLeagueDialog from "@/components/create-league-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LeaguesPage() {
  const leagues = await getLeagues();

  // Get game counts per league
  const allGames = await getGames();
  const gameCountByLeague: Record<string, number> = {};
  for (const game of allGames) {
    const lid = game.league_id as string;
    gameCountByLeague[lid] = (gameCountByLeague[lid] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Leagues</h1>
        <CreateLeagueDialog />
      </div>

      {leagues.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No leagues yet. Create one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Games</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league: Record<string, unknown>) => (
              <TableRow key={league.id as string}>
                <TableCell className="font-medium">{league.name as string}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {gameCountByLeague[league.id as string] ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
