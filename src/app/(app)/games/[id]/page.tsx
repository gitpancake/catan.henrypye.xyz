export const dynamic = "force-dynamic";

import { format } from "date-fns";
import { getSession } from "@/lib/auth";
import { getGame } from "@/lib/queries/games";
import { getUserRole } from "@/lib/queries/members";
import { deleteGame } from "@/lib/actions/games";
import DeleteButton from "@/components/delete-button";
import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  const game = await getGame(id);
  const leagueId = game.league_id as string;
  const userRole = session ? await getUserRole(leagueId, session.uid) : null;
  const canDelete = userRole === "owner" || userRole === "co-owner";

  const scores = (game.catan_scores as Array<Record<string, unknown>>) ?? [];
  const sorted = [...scores].sort(
    (a, b) => (b.victory_points as number) - (a.victory_points as number)
  );
  const maxVP = sorted.length > 0 ? (sorted[0].victory_points as number) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold">
          Game — {format(new Date(game.played_at as string), "MMMM d, yyyy")}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">
            {(game.catan_leagues as Record<string, string>)?.name}
          </p>
          {canDelete && (
            <DeleteButton
              onDelete={deleteGame.bind(null, id)}
              confirmMessage="Delete this game? This cannot be undone."
              variant="full"
              redirectTo="/games"
            />
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs uppercase tracking-wide">Player</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">VP</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Settlements</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Cities</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Longest Road</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Largest Army</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Dev Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((score) => {
            const isWinner = (score.victory_points as number) === maxVP;
            return (
              <TableRow
                key={score.id as string}
                className={isWinner ? "bg-catan-gold/5 border-l-2 border-l-catan-gold" : ""}
              >
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {(score.catan_players as Record<string, string>)?.name}
                    {isWinner && <Trophy className="size-3.5 text-catan-gold" />}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {score.victory_points as number}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {score.settlements as number}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {score.cities as number}
                </TableCell>
                <TableCell className="text-right">
                  {(score.longest_road as boolean) && (
                    <Badge variant="secondary" className="font-mono text-xs">Yes</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(score.largest_army as boolean) && (
                    <Badge variant="secondary" className="font-mono text-xs">Yes</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {score.dev_points as number}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
