import { buildTape } from "@/lib/nfl/tape";
import type { NflGame } from "@/lib/nfl/types";
import { formatSpread } from "@/lib/utils";

export function LineTape({ game }: { game: NflGame }) {
  const tape = buildTape(game);
  const xs = tape.map((_, i) => i);
  const ys = tape.map((p) => p.spread);
  const min = Math.min(...ys) - 0.6;
  const max = Math.max(...ys) + 0.6;
  const w = 320;
  const h = 72;
  const pad = 8;
  const xAt = (i: number) => pad + (i / Math.max(1, xs.length - 1)) * (w - pad * 2);
  const yAt = (v: number) => pad + ((max - v) / Math.max(0.01, max - min)) * (h - pad * 2);
  const d = ys.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const last = tape[tape.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full text-foreground" role="img" aria-label="Spread tape">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {tape.map((p, i) => (
          <circle key={p.t} cx={xAt(i)} cy={yAt(p.spread)} r="2.4" fill="currentColor" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
        {tape.map((p) => (
          <span key={p.t} className="flex flex-col items-center">
            <span>{p.t}</span>
            <span className="text-foreground">{formatSpread(p.spread)}</span>
          </span>
        ))}
      </div>
      {last ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Total {game.line.books?.length ? `sheet ${formatSpread(game.line.totalOpen).replace("+", "")} · ref ${game.line.total}` : `${formatSpread(game.line.totalOpen).replace("+", "")} → ${game.line.total}`}
          {game.line.priceBook ? ` · ${game.line.priceBook}` : ""}. {game.line.books?.length ? "Not a close." : ""}
        </p>
      ) : null}
    </div>
  );
}
