export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth";
import { getLeague } from "@/lib/queries/leagues";
import { getLeagueMembers, getUserRole } from "@/lib/queries/members";
import InviteMemberDialog from "@/components/invite-member-dialog";
import LeagueMembersTable from "@/components/league-members-table";
import LeaveLeagueButton from "@/components/leave-league-button";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeagueDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;
  const league = await getLeague(id);
  if (!league) notFound();

  const userRole = await getUserRole(id, session.uid);
  if (!userRole) redirect("/leagues");

  const members = await getLeagueMembers(id);
  const isOwner = userRole === "owner";
  const canInvite = isOwner || userRole === "co-owner";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">{league.name as string}</h1>
        <div className="flex items-center gap-2">
          {canInvite && (
            <InviteMemberDialog
              leagueId={id}
              canInviteCoOwner={isOwner}
            />
          )}
          {!isOwner && <LeaveLeagueButton leagueId={id} />}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Members ({members.length})
        </h2>
        <LeagueMembersTable
          leagueId={id}
          members={members}
          isOwner={isOwner}
          currentUid={session.uid}
        />
      </div>
    </div>
  );
}
