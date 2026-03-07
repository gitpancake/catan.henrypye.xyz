export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getLeagues } from "@/lib/queries/leagues";
import { getGames } from "@/lib/queries/games";
import CreateLeagueDialog from "@/components/create-league-dialog";
import InviteMemberDialog from "@/components/invite-member-dialog";
import DeleteButton from "@/components/delete-button";
import { deleteLeague } from "@/lib/actions/leagues";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";

export default async function LeaguesPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const leagues = await getLeagues(session.uid);

  // Get game counts per league
  const allGames = await getGames();
  const gameCountByLeague: Record<string, number> = {};
  for (const game of allGames) {
    const lid = game.league_id as string;
    gameCountByLeague[lid] = (gameCountByLeague[lid] ?? 0) + 1;
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default" as const;
      case "co-owner":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

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
              <TableHead className="text-xs uppercase tracking-wide">Role</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide">Games</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.map((league: Record<string, unknown>) => {
              const role = league.userRole as string;
              const canInvite = role === "owner" || role === "co-owner";
              return (
                <TableRow key={league.id as string}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/leagues/${league.id}`}
                      className="hover:underline"
                    >
                      {league.name as string}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(role)}>
                      {role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {gameCountByLeague[league.id as string] ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canInvite && (
                        <InviteMemberDialog
                          leagueId={league.id as string}
                          canInviteCoOwner={role === "owner"}
                        />
                      )}
                      {role === "owner" && (
                        <DeleteButton
                          onDelete={deleteLeague.bind(null, league.id as string)}
                          confirmMessage={`Delete "${league.name}"? All games and scores in this league will be permanently deleted.`}
                        />
                      )}
                    </div>
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
