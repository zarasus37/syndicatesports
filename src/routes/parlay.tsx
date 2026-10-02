import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useDesk } from "@/lib/nfl/store";
import { americanOdds, formatPct, formatSigned } from "@/lib/utils";

export const Route = createFileRoute("/parlay")({ component: ParlayPage });

function ParlayPage() {
  const parlays = useDesk((s) => s.parlays) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Same-game and 3-leg</p>
        <h1 className="text-3xl font-medium tracking-tight">Parlays</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Model construction from the same paths. Not a posted book price, so not a recommendation and not on the paper card. Nothing here is sent to a sportsbook.
        </p>
      </section>

      {!lastRunAt ? (
        <p className="text-sm text-muted-foreground">Run the slate to build the model tickets. They are still not recommendations.</p>
      ) : parlays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Not enough plus-EV sides this cycle to print a 3-leg.</p>
      ) : (
        <div className="space-y-3">
          {parlays.map((t, i) => {
            return (
              <article key={t.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {t.kind === "sgp" ? "Same-game" : "Ticket"} {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-1 font-mono text-lg tabular-nums text-profit">
                      {formatSigned(t.ev * 100)}% EV
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{americanOdds(t.offeredAmerican)}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      fair {americanOdds(t.fairAmerican)}
                    </div>
                  </div>
                </div>
                <ol className="mt-4 space-y-2">
                  {t.legs.map((leg) => (
                    <li key={`${leg.gameId}-${leg.side}`} className="flex items-center justify-between gap-3 text-sm">
                      <Link
                        to="/game/$gameId"
                        params={{ gameId: leg.gameId }}
                        className="min-w-0 truncate hover:underline"
                      >
                        {leg.label} · {leg.side}
                      </Link>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatPct(leg.prob)} · {americanOdds(leg.price)}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">joint {formatPct(t.joint)}</Badge>
                  <Badge variant="outline">{t.jointMethod}</Badge>
                  {t.corrPenalty > 0.001 ? <Badge variant="outline">ρ −{formatPct(t.corrPenalty)}</Badge> : null}
                  <Badge variant="outline">not a recommendation</Badge>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
