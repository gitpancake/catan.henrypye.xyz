"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  confirmMessage: string;
  redirectTo?: string;
  variant?: "icon" | "full";
}

export default function DeleteButton({
  onDelete,
  confirmMessage,
  redirectTo,
  variant = "icon",
}: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!window.confirm(confirmMessage)) return;

    setDeleting(true);
    try {
      await onDelete();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (variant === "full") {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={handleClick}
        disabled={deleting}
      >
        <Trash2 className="size-3.5" />
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={deleting}
      className="size-8 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
