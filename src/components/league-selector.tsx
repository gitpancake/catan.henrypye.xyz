"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface League {
  id: string;
  name: string;
}

interface LeagueSelectorProps {
  leagues: League[];
  currentLeagueId: string | null;
}

export default function LeagueSelector({
  leagues,
  currentLeagueId,
}: LeagueSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("league", value);
    router.push(`?${params.toString()}`);
  };

  if (leagues.length === 0) return null;

  return (
    <Select value={currentLeagueId ?? undefined} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select league" />
      </SelectTrigger>
      <SelectContent>
        {leagues.map((league) => (
          <SelectItem key={league.id} value={league.id}>
            {league.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
