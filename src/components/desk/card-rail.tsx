import { Link } from "@tanstack/react-router";
import { MODEL_VERSION } from "@/lib/nfl/desk-meta";
import { MAX_GAME_UNITS, portfolioOf } from "@/lib/nfl/sizing";
import { useDesk } from "@/lib/nfl/store";
import { formatUnits } from "@/lib/utils";

export function CardRail() {
  const plays = useDesk((s) => s.plays) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
  const runId = useDesk((s) => s.runId);
  if (!lastRunAt) return null;
  const port = portfolioOf(plays);
  const n = plays.length;
  const gameLabel = port.maxGame ? `${port.maxGame.gameId.toUpperCase()} ${port.maxGame.units.toFixed(2)}u` : "—";
  return (
    <div className="border-b border-border bg-card/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          <span className="text-foreground">Paper card · {n}</span>
          <span className="ml-3">Gross {formatUnits(port.gross)}</span>
          <span className="ml-3">Corr-adj {formatUnits(port.corrAdj)}</span>
          <span className="ml-3">Game {gameLabel}</span>
          <span className="ml-3">Cap {MAX_GAME_UNITS.toFixed(1)}u/game</span>
          <span className={port.over ? "ml-3 text-warn" : "ml-3"}>{port.over ? "Over concentration" : "Within cap"}</span>
        </span>
        <span className="flex flex-wrap gap-3">
          <span>model {MODEL_VERSION}</span>
          <span>data {dataMode}</span>
          {runId ? <span className="hidden sm:inline">{runId}</span> : null}
          <Link to="/book" className="text-foreground hover:underline">
            Book
          </Link>
        </span>
      </div>
    </div>
  );
}