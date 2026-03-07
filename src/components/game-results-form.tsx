"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createGame } from "@/lib/actions/games";
import { toast } from "sonner";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
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

interface Player {
  id: string;
  name: string;
}

interface ScoreEntry {
  playerId: string;
  playerName: string;
  settlements: number;
  cities: number;
  longestRoad: boolean;
  largestArmy: boolean;
  devCardVp: number;
}

function calcVp(s: Omit<ScoreEntry, "playerId" | "playerName">) {
  return (
    s.settlements * 1 +
    s.cities * 2 +
    s.devCardVp +
    (s.longestRoad ? 2 : 0) +
    (s.largestArmy ? 2 : 0)
  );
}

interface GameResultsFormProps {
  leagues: League[];
  players: Player[];
}

function Stepper({
  value,
  onChange,
  min = 0,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="size-8 rounded-md border border-input bg-background flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="font-mono text-sm font-semibold w-6 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={max !== undefined && value >= max}
          className="size-8 rounded-md border border-input bg-background flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function ToggleChip({
  checked,
  onChange,
  label,
  vp,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  vp: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-colors ${
        checked
          ? "border-primary bg-primary/10 text-foreground"
          : "border-input bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
      <span className="font-mono text-xs">+{vp}</span>
    </button>
  );
}

export default function GameResultsForm({ leagues, players }: GameResultsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [leagueId, setLeagueId] = useState<string>("");
  const [playedAt, setPlayedAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [settlements, setSettlements] = useState(0);
  const [cities, setCities] = useState(0);
  const [longestRoad, setLongestRoad] = useState(false);
  const [largestArmy, setLargestArmy] = useState(false);
  const [devCardVp, setDevCardVp] = useState(0);

  const currentVp = calcVp({ settlements, cities, longestRoad, largestArmy, devCardVp });

  const addedPlayerIds = new Set(scores.map((s) => s.playerId));
  const availablePlayers = players.filter((p) => !addedPlayerIds.has(p.id));

  const resetScoreForm = () => {
    setSelectedPlayerId("");
    setSettlements(0);
    setCities(0);
    setLongestRoad(false);
    setLargestArmy(false);
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
        settlements,
        cities,
        longestRoad,
        largestArmy,
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
            victoryPoints: calcVp(s),
            settlements: s.settlements,
            cities: s.cities,
            longestRoad: s.longestRoad,
            largestArmy: s.largestArmy,
            devPoints: 0,
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

        {selectedPlayerId && (
          <>
            {/* Steppers row */}
            <div className="flex items-center justify-between py-2">
              <Stepper
                label="Settlements"
                value={settlements}
                onChange={setSettlements}
                max={5}
              />
              <Stepper
                label="Cities"
                value={cities}
                onChange={setCities}
                max={4}
              />
              <Stepper
                label="Dev Card VP"
                value={devCardVp}
                onChange={setDevCardVp}
                max={5}
              />
            </div>

            {/* Toggle chips */}
            <div className="flex gap-3">
              <ToggleChip
                checked={longestRoad}
                onChange={setLongestRoad}
                label="Longest Road"
                vp={2}
              />
              <ToggleChip
                checked={largestArmy}
                onChange={setLargestArmy}
                label="Largest Army"
                vp={2}
              />
            </div>

            {/* VP total + add */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold">{currentVp}</span>
                <span className="text-xs text-muted-foreground">VP</span>
              </div>
              <Button onClick={addScore} size="sm">
                <Plus className="size-4 mr-1" />
                Add
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Scores list */}
      {scores.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            {scores.map((s) => {
              const vp = calcVp(s);
              return (
                <div
                  key={s.playerId}
                  className="flex items-center justify-between py-2 px-3 rounded-md border border-input"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold w-7">{vp}</span>
                    <div>
                      <p className="text-sm font-medium">{s.playerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {[
                          s.settlements > 0 && `${s.settlements}S`,
                          s.cities > 0 && `${s.cities}C`,
                          s.devCardVp > 0 && `${s.devCardVp}DV`,
                          s.longestRoad && "LR",
                          s.largestArmy && "LA",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeScore(s.playerId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              );
            })}
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
          `Submit Game${scores.length >= 2 ? ` (${scores.length} players)` : ""}`
        )}
      </Button>
    </div>
  );
}
