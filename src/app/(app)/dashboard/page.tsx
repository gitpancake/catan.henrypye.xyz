export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { getLeagues } from "@/lib/queries/leagues";
import { getLeaderboardStats } from "@/lib/queries/leaderboard";
import LeagueSelector from "@/components/league-selector";
import SummaryCards from "@/components/summary-cards";
import LeaderboardTable from "@/components/leaderboard-table";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;
  const leagues = await getLeagues(session.uid);
  const currentLeagueId = params.league ?? leagues[0]?.id ?? null;

  const stats = currentLeagueId
    ? await getLeaderboardStats(currentLeagueId)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Suspense fallback={<Skeleton className="h-9 w-[200px]" />}>
          <LeagueSelector
            leagues={leagues}
            currentLeagueId={currentLeagueId}
          />
        </Suspense>
      </div>

      {stats && (
        <>
          <SummaryCards
            totalGames={stats.totalGames}
            totalPlayers={stats.totalPlayers}
            leader={stats.leader}
            mostWins={stats.mostWins}
          />

          <div className="mt-6">
            <LeaderboardTable rows={stats.rows} />
          </div>
        </>
      )}

      {!stats && leagues.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No leagues yet. Create one to get started.
        </div>
      )}
    </div>
  );
}
