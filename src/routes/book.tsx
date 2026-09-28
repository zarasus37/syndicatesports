import { createFileRoute, Link } from "@tanstack/react-router";
import { analyzeBook } from "@/lib/nfl/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDesk } from "@/lib/nfl/store";
import { americanOdds, cn, formatPct, formatSigned } from "@/lib/utils";

export const Route = createFileRoute("/book")({ component: BookPage });

function BookPage() {
  const tickets = useDesk((s) => s.tickets) ?? [];
  const bankroll = useDesk((s) => s.bankroll) ?? 10000;
  const seed = useDesk((s) => s.seed);
  const paperAllPlus = useDesk((s) => s.paperAllPlus);
  const voidTicket = useDesk((s) => s.voidTicket);
  const clearBook = useDesk((s) => s.clearBook);
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const runId = useDesk((s) => s.runId);
  const runPhase = useDesk((s) => s.runPhase);
  const stats = analyzeBook(tickets, bankroll, seed);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Paper tickets</p>
        <h1 className="text-3xl font-medium tracking-tight">Paper book</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Half-Kelly, 3-unit cap. Tickets are simulated only — nothing is sent to a sportsbook. After the card is locked, void, clear, and another paper append a refusal. The original price stays.
        </p>
        {runPhase === "locked" ? (
          <p className="font-mono text-xs text-muted-foreground">Card locked. Void and clear are refused. Settlement source is still empty.</p>
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi label="Tickets" value={String(stats.n)} hint="paper · not live" />
        <Kpi label="In action" value={formatPct(stats.maxExposure)} hint={`$${Math.round(stats.stake).toLocaleString()}`} />
        <Kpi label="Hold" value={formatSigned(stats.roi * 100) + "%"} hint="expected on staked units" profit={stats.roi > 0} />
        <Kpi label="Ruin" value={formatPct(stats.ruin)} hint="24-week path" warn={stats.ruin > 0.05} />
      </section>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => paperAllPlus()} disabled={!lastRunAt} variant="secondary">
          Paper the plus
        </Button>
        <Button onClick={() => clearBook()} variant="ghost" disabled={!tickets.length}>
          Clear book
        </Button>
      </div>

      {tickets.filter((t) => !t.voidedAt).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {!lastRunAt
            ? "No run yet. Run the desk to generate a paper card."
            : `Run priced. No qualifying tickets met the 3% post-juice threshold. ${runId ?? ""} · 0.00u gross.`}
        </p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className={cn("rounded-xl border border-border bg-card p-4", t.voidedAt && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={t.kind === "parlay" ? "warn" : "outline"}>{t.kind}</Badge>
                    {t.voidedAt ? <Badge variant="outline">void</Badge> : null}
                    <span className="text-sm font-medium">{t.side}</span>
                  </div>
                  {t.gameId ? (
                    <Link to="/game/$gameId" params={{ gameId: t.gameId }} className="mt-1 block text-sm text-muted-foreground hover:underline">
                      {t.label}
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{t.label}</p>
                  )}
                  {t.source ? <p className="mt-1 font-mono text-xs text-muted-foreground">{t.source}</p> : null}
                </div>
                <Button variant="ghost" size="sm" onClick={() => voidTicket(t.id)} disabled={Boolean(t.voidedAt)}>
                  {t.voidedAt ? "Voided" : "Void"}
                </Button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4">
                <Cell k="Stake" v={`$${t.stake}`} />
                <Cell k="Price" v={americanOdds(t.price)} />
                <Cell k="Win p" v={formatPct(t.prob)} />
                <Cell k="EV" v={formatSigned(t.ev * 100) + "%"} profit={t.ev >= 0.03} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-medium">Book report</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Mini k="Median bankroll" v={`$${Math.round(stats.medianEnd).toLocaleString()}`} />
          <Mini k="P(down)" v={formatPct(stats.pDown)} />
          <Mini k="E[profit]" v={`$${Math.round(stats.expectedProfit).toLocaleString()}`} />
          <Mini k="Bankroll" v={`$${bankroll.toLocaleString()}`} />
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          We don’t send this slip to a sportsbook. 21+. If gambling is a problem, call 1-800-GAMBLER.
        </p>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  profit,
  warn,
}: {
  label: string;
  value: string;
  hint: string;
  profit?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono text-2xl tabular-nums leading-none ${profit ? "text-profit" : warn ? "text-warn" : ""}`}>
        {value}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Cell({ k, v, profit }: { k: string; v: string; profit?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={profit ? "mt-1 text-profit" : "mt-1"}>{v}</div>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-mono text-sm tabular-nums">{v}</div>
    </div>
  );
}
