"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveLeague } from "@/lib/actions/leagues";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LeaveLeagueButton({
  leagueId,
}: {
  leagueId: string;
}) {
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this league?")) return;

    setLeaving(true);
    try {
      await leaveLeague(leagueId);
      toast.success("Left league");
      router.push("/leagues");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to leave league"
      );
    } finally {
      setLeaving(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLeave} disabled={leaving}>
      {leaving ? (
        <Loader2 className="size-4 animate-spin mr-1" />
      ) : (
        <LogOut className="size-4 mr-1" />
      )}
      Leave
    </Button>
  );
}
