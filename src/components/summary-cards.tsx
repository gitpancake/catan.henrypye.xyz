import { Card, CardContent } from "@/components/ui/card";
import type { LeaderboardRow } from "@/lib/queries/leaderboard";

interface SummaryCardProps {
  label: string;
  value: string | number;
  color?: string;
}

function SummaryCard({ label, value, color }: SummaryCardProps) {
  return (
    <Card className="min-w-0">
      <CardContent className="px-4 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={`mt-1 font-mono text-lg font-semibold truncate lg:text-xl ${color ?? "text-foreground"}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardsProps {
  totalGames: number;
  totalPlayers: number;
  leader: LeaderboardRow | null;
  mostWins: LeaderboardRow | null;
}

export default function SummaryCards({
  totalGames,
  totalPlayers,
  leader,
  mostWins,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <SummaryCard label="Total Games" value={totalGames} />
      <SummaryCard label="Players" value={totalPlayers} />
      <SummaryCard
        label="Current Leader"
        value={leader ? `${leader.player_name} (${leader.total_vp} VP)` : "—"}
        color="text-catan-gold"
      />
      <SummaryCard
        label="Most Wins"
        value={mostWins ? `${mostWins.player_name} (${mostWins.wins})` : "—"}
        color="text-positive"
      />
    </div>
  );
}
