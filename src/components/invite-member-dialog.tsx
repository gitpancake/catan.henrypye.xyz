"use client";

import { useState } from "react";
import { inviteMember } from "@/lib/actions/leagues";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InviteMemberDialog({
  leagueId,
  canInviteCoOwner,
}: {
  leagueId: string;
  canInviteCoOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"co-owner" | "participant">("participant");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await inviteMember({ leagueId, email, role });
      toast.success(`Invited ${email} as ${role}`);
      setEmail("");
      setRole("participant");
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to invite member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4 mr-1" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "co-owner" | "participant")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canInviteCoOwner && (
                  <SelectItem value="co-owner">Co-owner</SelectItem>
                )}
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" disabled={submitting || !email} className="w-full">
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-1" />
            ) : null}
            Invite Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
