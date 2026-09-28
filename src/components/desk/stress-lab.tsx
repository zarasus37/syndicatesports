import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SLATE } from "@/lib/nfl/slate";
import { SHOCKS, stressGame, type ShockKind, type StressReport } from "@/lib/nfl/stress";
import { useDesk } from "@/lib/nfl/store";
import { team } from "@/lib/nfl/teams";
import { cn, formatPct, formatSigned } from "@/lib/utils";

export function StressLab({ initialGameId }: { initialGameId?: string }) {
  const featured = SLATE.find((g) => g.id === initialGameId) ?? SLATE.find((g) => g.featured) ?? SLATE[0]!;
  const [gameId, setGameId] = useState(featured.id);
  const [kind, setKind] = useState<ShockKind>("steam_dog");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<StressReport | null>(null);
  const [right, setRight] = useState<StressReport | null>(null);
  const [slot, setSlot] = useState<"left" | "right">("left");
  useEffect(() => {
    if (initialGameId && SLATE.some((g) => g.id === initialGameId)) {
      setGameId(initialGameId);
      setLeft(null);
      setRight(null);
    }
  }, [initialGameId]);
  const sims = useDesk((s) => s.sims) ?? 12000;
  const chaos = useDesk((s) => s.chaos) ?? true;
  const seed = useDesk((s) => s.seed) ?? 20260921;
  const game = useMemo(() => SLATE.find((g) => g.id === gameId) ?? featured, [gameId, featured]);

  function run(target: "left" | "right") {
    setBusy(true);
    setSlot(target);
    window.setTimeout(() => {
      const next = stressGame(game, kind, sims, seed, chaos);
      if (target === "left") setLeft(next);
      else setRight(next);
      setBusy(false);
    }, 30);
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-medium">Scenario lab</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shock a clone. Pin two scenarios side by side. The live card does not move.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-h-11 flex-1 items-center gap-2 text-sm">
          <span className="shrink-0 text-muted-foreground">Game</span>
          <select
            className="h-11 min-h-11 w-full rounded-md border border-border bg-background px-2 font-mono text-sm"
            value={gameId}
            onChange={(e) => {
              setGameId(e.target.value);
              setLeft(null);
              setRight(null);
            }}
          >
            {SLATE.map((g) => (
              <option key={g.id} value={g.id}>
                {team(g.away).abbr} @ {team(g.home).abbr}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={() => run("left")} disabled={busy} className="min-h-11 sm:w-auto">
          {busy && slot === "left" ? "Pricing A…" : "Run as A"}
        </Button>
        <Button onClick={() => run("right")} disabled={busy} variant="secondary" className="min-h-11 sm:w-auto">
          {busy && slot === "right" ? "Pricing B…" : "Run as B"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SHOCKS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setKind(s.id)}
            className={cn(
              "min-h-11 rounded-md px-3 text-left text-sm transition-colors",
              kind === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{SHOCKS.find((s) => s.id === kind)?.blurb}</p>

      {left || right ? (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {left ? (
              <ShockCard title={`A · ${left.note}`} side={left.after} highlight={left.pickChanged} />
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">Scenario A empty.</p>
            )}
            {right ? (
              <ShockCard title={`B · ${right.note}`} side={right.after} highlight={right.pickChanged} />
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">Scenario B empty.</p>
            )}
          </div>
          {left && right ? (
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <Delta k="EV A−B" v={formatSigned((left.after.ev - right.after.ev) * 100) + " pts"} up={left.after.ev > right.after.ev} />
              <Delta k="Cover A−B" v={formatSigned((left.after.cover - right.after.cover) * 100) + " pp"} up={left.after.cover > right.after.cover} />
              <Delta k="Win A−B" v={formatSigned((left.after.win - right.after.win) * 100) + " pp"} up={left.after.win > right.after.win} />
            </div>
          ) : left ? (
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <Delta k="EV" v={formatSigned(left.deltaEv * 100) + " pts"} up={left.deltaEv > 0} />
              <Delta k="Home cover" v={formatSigned(left.deltaCover * 100) + " pp"} up={left.deltaCover > 0} />
              <Delta k="Home win" v={formatSigned(left.deltaWin * 100) + " pp"} up={left.deltaWin > 0} />
            </div>
          ) : null}
          <Link to="/game/$gameId" params={{ gameId: game.id }} className="inline-flex min-h-11 items-center text-sm underline">
            Open {team(game.away).abbr} @ {team(game.home).abbr}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function ShockCard({
  title,
  side,
  highlight,
}: {
  title: string;
  side: StressReport["before"];
  highlight?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border border-border p-3", highlight && "border-warn/40")}>
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-2 text-sm font-medium">{side.pick}</div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
        <div>
          EV <span className="text-foreground">{formatSigned(side.ev * 100)}%</span>
        </div>
        <div>
          cover <span className="text-foreground">{formatPct(side.cover)}</span>
        </div>
        <div>
          win <span className="text-foreground">{formatPct(side.win)}</span>
        </div>
        <div>
          total <span className="text-foreground">{side.total.toFixed(1)}</span>
        </div>
        <div className="col-span-2">
          {side.steam} · {side.anomaly}
        </div>
      </dl>
    </div>
  );
}

function Delta({ k, v, up }: { k: string; v: string; up: boolean }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-muted-foreground">{k}</div>
      <div className={cn("mt-1 tabular-nums", up ? "text-profit" : "text-loss")}>{v}</div>
    </div>
  );
}
