"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick} className="size-8">
      <RefreshCw className={`size-3.5 ${spinning ? "animate-spin" : ""}`} />
    </Button>
  );
}
