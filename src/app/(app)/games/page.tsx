export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { getGames } from "@/lib/queries/games";
import { getLeagues } from "@/lib/queries/leagues";
import LeagueSelector from "@/components/league-selector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function GamesPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;
  const leagues = await getLeagues(session.uid);
  const currentLeagueId = params.league ?? leagues[0]?.id ?? null;

  const games = currentLeagueId
    ? await getGames(currentLeagueId)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Games</h1>
        <Suspense fallback={<Skeleton className="h-9 w-[200px]" />}>
          <LeagueSelector leagues={leagues} currentLeagueId={currentLeagueId} />
        </Suspense>
      </div>

      {games.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No games recorded yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">League</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Players</TableHead>
              <TableHead className="text-xs uppercase tracking-wide">Winner</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">VP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game: Record<string, unknown>) => {
              const scores = (game.catan_scores as Array<Record<string, unknown>>) ?? [];
              const winner = scores.length > 0
                ? scores.reduce((best: Record<string, unknown>, s: Record<string, unknown>) =>
                    (s.victory_points as number) > (best.victory_points as number) ? s : best
                  , scores[0])
                : null;
              const winnerName = winner
                ? (winner.catan_players as Record<string, string>)?.name ?? "—"
                : "—";

              return (
                <TableRow key={game.id as string}>
                  <TableCell className="font-mono text-sm">
                    <Link
                      href={`/games/${game.id}`}
                      className="hover:underline hover:text-foreground"
                    >
                      {format(new Date(game.played_at as string), "MMM d, yyyy")}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {(game.catan_leagues as Record<string, string>)?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {scores.length}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{winnerName}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {winner ? (winner.victory_points as number) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
