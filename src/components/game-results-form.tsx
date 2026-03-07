"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createGame } from "@/lib/actions/games";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
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

interface League {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
}

interface ScoreEntry {
  playerId: string;
  playerName: string;
  victoryPoints: number;
  settlements: number;
  cities: number;
  longestRoad: boolean;
  largestArmy: boolean;
  devPoints: number;
  devCardVp: number;
}

interface GameResultsFormProps {
  leagues: League[];
  players: Player[];
}

export default function GameResultsForm({ leagues, players }: GameResultsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [leagueId, setLeagueId] = useState<string>("");
  const [playedAt, setPlayedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  // Current score entry form state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [vp, setVp] = useState(0);
  const [settlements, setSettlements] = useState(0);
  const [cities, setCities] = useState(0);
  const [longestRoad, setLongestRoad] = useState(false);
  const [largestArmy, setLargestArmy] = useState(false);
  const [devPoints, setDevPoints] = useState(0);
  const [devCardVp, setDevCardVp] = useState(0);

  const addedPlayerIds = new Set(scores.map((s) => s.playerId));
  const availablePlayers = players.filter((p) => !addedPlayerIds.has(p.id));

  const resetScoreForm = () => {
    setSelectedPlayerId("");
    setVp(0);
    setSettlements(0);
    setCities(0);
    setLongestRoad(false);
    setLargestArmy(false);
    setDevPoints(0);
    setDevCardVp(0);
  };

  const addScore = () => {
    if (!selectedPlayerId) return;
    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    setScores((prev) => [
      ...prev,
      {
        playerId: player.id,
        playerName: player.name,
        victoryPoints: vp,
        settlements,
        cities,
        longestRoad,
        largestArmy,
        devPoints,
        devCardVp,
      },
    ]);
    resetScoreForm();
  };

  const removeScore = (playerId: string) => {
    setScores((prev) => prev.filter((s) => s.playerId !== playerId));
  };

  const handleSubmit = () => {
    if (!leagueId || scores.length < 2) {
      toast.error("Select a league and add at least 2 players");
      return;
    }

    startTransition(async () => {
      try {
        await createGame({
          leagueId,
          playedAt: new Date(playedAt).toISOString(),
          scores: scores.map((s) => ({
            playerId: s.playerId,
            victoryPoints: s.victoryPoints,
            settlements: s.settlements,
            cities: s.cities,
            longestRoad: s.longestRoad,
            largestArmy: s.largestArmy,
            devPoints: s.devPoints,
            devCardVp: s.devCardVp,
          })),
        });
        toast.success("Game recorded!");
        router.push("/dashboard");
      } catch (err) {
        toast.error("Failed to save game");
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Game info */}
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Date</FieldLabel>
          <Input
            type="date"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
            className="font-mono"
          />
        </Field>
        <Field>
          <FieldLabel>League</FieldLabel>
          <Select value={leagueId} onValueChange={setLeagueId}>
            <SelectTrigger>
              <SelectValue placeholder="Select league" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Separator />

      {/* Add player score */}
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium">Add Player Score</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a player and enter their score breakdown.
          </p>
        </div>

        <Field>
          <FieldLabel>Player</FieldLabel>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Victory Points</FieldLabel>
            <Input
              type="number"
              min={0}
              value={vp}
              onChange={(e) => setVp(Number(e.target.value))}
              className="font-mono"
            />
            <FieldDescription>Total VP for this player.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Settlements</FieldLabel>
            <Input
              type="number"
              min={0}
              value={settlements}
              onChange={(e) => setSettlements(Number(e.target.value))}
              className="font-mono"
            />
          </Field>
          <Field>
            <FieldLabel>Cities</FieldLabel>
            <Input
              type="number"
              min={0}
              value={cities}
              onChange={(e) => setCities(Number(e.target.value))}
              className="font-mono"
            />
          </Field>
          <Field>
            <FieldLabel>Dev Card VP</FieldLabel>
            <Input
              type="number"
              min={0}
              value={devCardVp}
              onChange={(e) => setDevCardVp(Number(e.target.value))}
              className="font-mono"
            />
            <FieldDescription>VP from dev cards (e.g. Chapel).</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Dev Cards Played</FieldLabel>
            <Input
              type="number"
              min={0}
              value={devPoints}
              onChange={(e) => setDevPoints(Number(e.target.value))}
              className="font-mono"
            />
            <FieldDescription>Total dev cards played.</FieldDescription>
          </Field>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="longest-road"
              checked={longestRoad}
              onCheckedChange={(v) => setLongestRoad(v === true)}
            />
            <label htmlFor="longest-road" className="text-sm">
              Longest Road
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="largest-army"
              checked={largestArmy}
              onCheckedChange={(v) => setLargestArmy(v === true)}
            />
            <label htmlFor="largest-army" className="text-sm">
              Largest Army
            </label>
          </div>
        </div>

        <Button
          onClick={addScore}
          disabled={!selectedPlayerId}
          variant="outline"
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Add Score
        </Button>
      </div>

      {/* Scores list */}
      {scores.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-3">
              Scores ({scores.length} player{scores.length !== 1 ? "s" : ""})
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase tracking-wide">Player</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">VP</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">S</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">C</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">LR</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">LA</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">Dev</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide">DV</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((s) => (
                  <TableRow key={s.playerId}>
                    <TableCell className="font-medium">{s.playerName}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">{s.victoryPoints}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.settlements}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.cities}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.longestRoad ? "Y" : ""}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.largestArmy ? "Y" : ""}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.devPoints}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{s.devCardVp}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeScore(s.playerId)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isPending || scores.length < 2 || !leagueId}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          "Submit Game"
        )}
      </Button>
    </div>
  );
}
