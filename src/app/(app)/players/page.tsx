export const dynamic = "force-dynamic";

import { getPlayers } from "@/lib/queries/players";
import CreatePlayerDialog from "@/components/create-player-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Players</h1>
        <CreatePlayerDialog />
      </div>

      {players.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No players yet. Add some to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player: Record<string, unknown>) => (
              <TableRow key={player.id as string}>
                <TableCell className="font-medium">{player.name as string}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
