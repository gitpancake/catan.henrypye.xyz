import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { LeaderboardRow } from "@/lib/queries/leaderboard";

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
}

export default function LeaderboardTable({ rows }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No games recorded yet. Enter some results to see the leaderboard.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-xs uppercase tracking-wide">#</TableHead>
          <TableHead className="text-xs uppercase tracking-wide">Player</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Games</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Total VP</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Avg VP</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Wins</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Settlements</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Cities</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Longest Road</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Largest Army</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Dev Points</TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wide">Dev Card VP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow
            key={row.player_id}
            className={i === 0 ? "bg-catan-gold/5 border-l-2 border-l-catan-gold" : ""}
          >
            <TableCell className="font-mono text-sm text-muted-foreground">
              {i + 1}
            </TableCell>
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {row.player_name}
                {i === 0 && <Trophy className="size-3.5 text-catan-gold" />}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">{row.games_played}</TableCell>
            <TableCell className="text-right font-mono text-sm font-semibold">{row.total_vp}</TableCell>
            <TableCell className="text-right font-mono text-sm">{row.avg_vp}</TableCell>
            <TableCell className="text-right font-mono text-sm">{row.wins}</TableCell>
            <TableCell className="text-right font-mono text-sm">{row.total_settlements}</TableCell>
            <TableCell className="text-right font-mono text-sm">{row.total_cities}</TableCell>
            <TableCell className="text-right">
              {row.longest_road_count > 0 && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {row.longest_road_count}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              {row.largest_army_count > 0 && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {row.largest_army_count}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">{row.total_dev_points}</TableCell>
            <TableCell className="text-right font-mono text-sm">{row.total_dev_card_vp}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
