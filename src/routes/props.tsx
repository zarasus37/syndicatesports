import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PROPS } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { cn, formatPct, formatSigned } from "@/lib/utils";

export const Route = createFileRoute("/props")({ component: PropsPage });

function PropsPage() {
  const list = useDesk((s) => s.props) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const runId = useDesk((s) => s.runId) ?? "pending";
  const results = useDesk((s) => s.results) ?? {};
  const plays = useDesk((s) => s.plays) ?? [];
  const byId = Object.fromEntries(list.map((p) => [p.id, p]));
  const approved = plays.filter((p) => p.kind === "prop");

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Player markets</p>
        <h1 className="text-3xl font-medium tracking-tight">Props</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Research board only. These numbers are the seeded prop sheet, not a live book. They are not recommendations and they are not on the paper card. A prop needs a posted price, a book, and a timestamp before it can clear 3%.
        </p>
      </section>

      {approved.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">{approved.length} props on the card</h2>
          {approved.map((play) => (
            <article key={play.id} className="rounded-xl border border-border bg-card p-4 text-sm">
              {play.market} · {play.source} · {play.price}
            </article>
          ))}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          {!lastRunAt
            ? "No run yet. Props stay off the card until a book posts the number."
            : `Run ${runId} priced. No prop is a recommendation. The board below is the seeded sheet, not a live book.`}
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Board</h2>
        {PROPS.map((line) => {
          const sim = byId[line.id];
          const pick = sim?.pick ?? "pass";
          const game = results[line.gameId];
          return (
            <article key={line.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to="/game/$gameId" params={{ gameId: line.gameId }} className="text-sm font-medium hover:underline">
                    {line.player}
                  </Link>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {line.team} · {line.market} {line.line} · {line.dist}
                    {sim?.weatherNote ? ` · ${sim.weatherNote}` : ""}
                  </div>
                </div>
                <Badge variant={pick === "pass" ? "default" : "profit"}>{pick}</Badge>
              </div>
              {lastRunAt && sim ? (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4">
                    <Cell k="Mean" v={sim.mean.toFixed(1)} />
                    <Cell k="Median" v={sim.median.toFixed(1)} />
                    <Cell k="P(over)" v={formatPct(sim.pOver)} />
                    <Cell k="Over / under" v={`${line.overPrice} / ${line.underPrice}`} />
                    <Cell k="EV over" v={formatSigned(sim.evOver * 100) + "%"} profit={sim.evOver >= 0.03} />
                    <Cell k="EV under" v={formatSigned(sim.evUnder * 100) + "%"} profit={sim.evUnder >= 0.03} />
                    <Cell k="Source" v="Seeded sheet · not a live book" />
                    <Cell k="Lock" v="Kickoff · official box" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Volume sensitivity: {sim.weatherNote ?? "No weather tax."}{" "}
                    {game ? `Game lean ${game.pick.side} · EV ${formatSigned(game.pick.ev * 100)}%. Not a wager.` : null}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Waiting on a slate run.</p>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Cell({ k, v, profit }: { k: string; v: string; profit?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={cn("mt-1", profit && "text-profit")}>{v}</div>
    </div>
  );
}
