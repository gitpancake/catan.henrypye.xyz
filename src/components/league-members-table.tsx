"use client";

import { useState } from "react";
import { removeMember, updateMemberRole } from "@/lib/actions/leagues";
import type { LeagueMember } from "@/lib/queries/members";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default function LeagueMembersTable({
  leagueId,
  members,
  isOwner,
  currentUid,
}: {
  leagueId: string;
  members: LeagueMember[];
  isOwner: boolean;
  currentUid: string;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setRemoving(memberId);
    try {
      await removeMember(leagueId, memberId);
      toast.success("Member removed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member"
      );
    } finally {
      setRemoving(null);
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: "co-owner" | "participant"
  ) => {
    setChangingRole(memberId);
    try {
      await updateMemberRole(leagueId, memberId, newRole);
      toast.success("Role updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update role"
      );
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs uppercase tracking-wide">
            Member
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide">
            Role
          </TableHead>
          {isOwner && (
            <TableHead className="text-right text-xs uppercase tracking-wide">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  {member.photoURL && (
                    <AvatarImage
                      src={member.photoURL}
                      alt={member.displayName ?? ""}
                    />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.displayName, member.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {member.displayName ?? member.email ?? member.firebase_uid}
                  </p>
                  {member.displayName && member.email && (
                    <p className="text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {isOwner && member.role !== "owner" ? (
                <Select
                  value={member.role}
                  onValueChange={(v) =>
                    handleRoleChange(member.id, v as "co-owner" | "participant")
                  }
                  disabled={changingRole === member.id}
                >
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co-owner">Co-owner</SelectItem>
                    <SelectItem value="participant">Participant</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  variant={
                    member.role === "owner"
                      ? "default"
                      : member.role === "co-owner"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {member.role}
                </Badge>
              )}
            </TableCell>
            {isOwner && (
              <TableCell className="text-right">
                {member.role !== "owner" &&
                  member.firebase_uid !== currentUid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                    >
                      {removing === member.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
