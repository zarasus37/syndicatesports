import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AuditPanel } from "@/components/desk/audit-panel";
import { EvidenceBand } from "@/components/desk/evidence-band";
import { SettlementPanel } from "@/components/desk/settlement-panel";
import { LedgerPanel } from "@/components/desk/ledger-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/desk/ticket-card";
import { bestTake, liveTrueCard } from "@/lib/nfl/card";
import { paperIds, playFromParlay, playFromProp, playFromSide } from "@/lib/nfl/ticket";
import { MIN_EV } from "@/lib/nfl/config";
import { allTickets, calibrate, cardUnits, maxDrawdown, segmentBook, sizeUnits, ticketPnl, ticketUnits } from "@/lib/nfl/learn";
import { gradeTickets } from "@/lib/nfl/box";
import { pnlSplit } from "@/lib/nfl/audit";
import { GAMES, PROPS, WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import type { LedgerTicket } from "@/lib/nfl/types";
import { allWinners, completedPickRecord, winnerBands, winnerRecord } from "@/lib/nfl/winners";
import { cn, formatPct, formatSigned, formatUnits } from "@/lib/utils";

export const Route = createFileRoute("/record")({ component: RecordPage });

function RecordPage() {
  const results = useDesk((s) => s.results) ?? {};
  const parlays = useDesk((s) => s.parlays) ?? [];
  const props = useDesk((s) => s.props) ?? [];
  const plays = useDesk((s) => s.plays) ?? [];
  const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
  const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
  const predictions = useDesk((s) => s.predictions) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const runId = useDesk((s) => s.runId) ?? "pending";
  const paperProp = useDesk((s) => s.paperProp);
  const paperGame = useDesk((s) => s.paperGame);
  const paperParlay = useDesk((s) => s.paperParlay);
  const tickets = useDesk((s) => s.tickets) ?? [];
  const running = useDesk((s) => s.running);
  const runPhase = useDesk((s) => s.runPhase);
  const lockWeek = useDesk((s) => s.lockWeek);
  const journal = useDesk((s) => s.journal) ?? [];
  const locked = useDesk((s) => s.locked) ?? [];
  const box = useDesk((s) => s.box);
  const lockedWinners = useDesk((s) => s.lockedWinners) ?? [];

  const slate = Object.values(results);
  const live = liveTrueCard(slate, parlays, props, GAMES);
  const named = lockedWinners.filter((w) => w.week === WEEK);
  const weekWinners = named.length === 16 ? named : predictions.filter((w) => w.week === WEEK);
  const cardRows = gradeTickets(allTickets(locked), box);
  const cal = calibrate(cardRows);
  const winRows = allWinners(lockedWinners);
  const wins = winnerRecord(winRows);
  const picks = completedPickRecord(winRows);
  const bands = winnerBands(winRows);
  const closedCard = cardRows.filter((t) => t.week < WEEK);
  const book = cardUnits(closedCard);
  const dd = maxDrawdown(closedCard);
  const segs = segmentBook(closedCard);
  const split = pnlSplit(closedCard);
  const cardWeeks = groupCardByWeek(closedCard);
  const pendingCard = cardRows.filter((t) => t.week === WEEK);
  const earliestKick = plays.reduce<number | null>((min, p) => {
    const kick = p.audit?.kickoffTimestamp;
    if (!kick) return min;
    return min == null ? kick : Math.min(min, kick);
  }, null);
  const lockNote = journal.find((e) => e.type === "locked" || e.note.startsWith("LOCK_REFUSED"))?.note;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The record</p>
        <h1 className="max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
          Every take. Including the misses.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Two records. The card is the sides and totals we would bet, only at a posted book price, sized in units.
          The SU board is who we pick to win each of the 16 games. It is graded, and it is not the card. 21+.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-medium">How to read this</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="text-foreground">Edge</span> — our probability versus the price, juice included. A
            −9 favorite can be likely to win the game and still be a poor bet against the spread.
          </li>
          <li>
            <span className="text-foreground">The card</span> — tickets we would actually place this week.
            Not every game. If it is not here, we would not bet it.
          </li>
          <li>
            <span className="text-foreground">SU board</span> — who we pick to win each of the 16. Predictions,
            not bets. Graded so the model has a full-slate record.
          </li>
          <li>
            <span className="text-foreground">Review</span> — after a week grades, each ticket is checked for
            what held, what broke, and whether a weight moved.{" "}
            <Link to="/learn" className="underline">
              Open the review
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <Kpi label="Graded" value={cal.n ? String(cal.n) : "—"} hint={box ? "scoreboard · prop and parlay excluded" : "archive · not settled this session"} />
        <Kpi label="CLV open" value={cal.n ? formatSigned(cal.clv) : "—"} hint="recorded on the ticket · not a close" profit={cal.clv > 0} />
        <Kpi label="Brier" value={cal.n ? cal.brier.toFixed(3) : "—"} hint="card calibration · lower is sharper" />
        <Kpi label="Max DD" value={cal.n ? formatUnits(dd, true) : "—"} hint={segs.map((s) => `${s.kind} ${s.n}`).join(" · ")} warn={dd < -5} />
        <Kpi
          label="Weekly pick predictions"
          value={picks.weeks ? `${picks.hits}–${picks.losses}` : "—"}
          hint="total weekly pick W/L record"
        />
      </section>

      <EvidenceBand />

      <SettlementPanel />

      <LedgerPanel />

      <AuditPanel rows={cardRows} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Week {WEEK} card</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Only the live-book sides and totals we would bet. Plus-{MIN_EV * 100}% after juice, then half-Kelly capped at 3%. Props and model parlays are not on this card. Lock is one stamp for the whole card. It counts only when every open ticket has its recommendation at or before the lock, and the lock is before that ticket’s sheet kickoff
              {earliestKick ? ` (earliest ${new Date(earliestKick).toISOString()})` : ""}. A later relock, void, paper, or clear is refused and the original stays. This week’s games are not final, so the settlement stamp stays empty.
            </p>
          </div>
          <Button onClick={() => lockWeek()} disabled={running || plays.length === 0} variant="secondary">
            {runPhase === "locked" ? "Relock refused" : "Lock the card"}
          </Button>
        </div>
        {lockNote ? <p className="font-mono text-xs text-muted-foreground">{lockNote}</p> : null}
        {!lastRunAt && !plays.length ? (
          <p className="text-sm text-muted-foreground">
            {running ? "Getting this week’s numbers…" : "No run yet. Run the desk to generate a paper card."}
          </p>
        ) : plays.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">
              {dataMode === "live-books"
                ? `Run priced from ${oddsBooks.join(", ") || "the board"} — no qualifier met the 3% post-juice hurdle.`
                : "Live books did not return. Seeded prices were not written as recommendations."}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {runId} · 0 tickets · {weekWinners.length} of 16 SU predictions · NO_QUALIFYING_EDGES
              {lastRunAt ? ` · ${new Date(lastRunAt).toLocaleTimeString()}` : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Game markets {plays.filter((p) => p.kind === "spread" || p.kind === "total").length} · props{" "}
              {plays.filter((p) => p.kind === "prop").length} · parlays {plays.filter((p) => p.kind === "parlay").length}.
              Auto-written to the paper book.
            </p>
            {plays.map((play) => (
              <TicketCard key={play.id} play={play} />
            ))}
          </div>
        )}
        {pendingCard.length > 0 ? (
          <p className="font-mono text-xs text-muted-foreground">Card locked · {pendingCard.length} tickets pending kickoff.</p>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-medium">SU calibration</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Straight-up board only. Hit rate counts winners. Skill grades the probabilities — a 70% lean that
          dogs it hurts more than a coin flip.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi
            label="Hit"
            value={wins.n ? formatPct(wins.hitRate) : "—"}
            hint={`priced at ${wins.n ? formatPct(wins.exp) : "—"}`}
            profit={wins.n ? wins.hitRate >= wins.exp : undefined}
          />
          <Kpi label="Brier" value={wins.n ? wins.brier.toFixed(3) : "—"} hint="lower = sharper" />
          <Kpi label="Log loss" value={wins.n ? wins.logloss.toFixed(3) : "—"} hint="punishes a bad 70" />
          <Kpi
            label="Skill vs climate"
            value={wins.n ? formatPct(wins.skill) : "—"}
            hint="vs sample hit rate as a constant"
            profit={wins.skill > 0}
          />
        </div>
        {wins.n ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Hit rate {formatPct(wins.hitRate)} is winners, not skill. Model Brier {wins.brier.toFixed(3)} vs a coin
            ({wins.brierBase.toFixed(3)}, skill {formatPct(wins.skillVsCoin)}) and vs always saying the sample rate{" "}
            {formatPct(wins.hitRate)} ({wins.brierClimate.toFixed(3)}, skill {formatPct(wins.skill)}). n={wins.n}.
            Negative skill vs climate means the probabilities are not yet sharper than “it hits this often.”
          </p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {bands.map((b) => (
            <li key={b.id}>
              <div className="flex justify-between gap-2 text-sm">
                <span>
                  {b.label}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {formatPct(b.lo)}–{formatPct(Math.min(1, b.hi))}
                  </span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {b.n ? `${b.hits}–${b.losses} · ${formatPct(b.hitRate)} hit · p ${formatPct(b.exp)}` : "—"}
                </span>
              </div>
              <div className="relative mt-1.5 h-2 rounded-full bg-muted">
                <i
                  className="absolute top-0 h-2 rounded-full bg-foreground/35"
                  style={{ width: `${Math.min(100, b.exp * 100)}%` }}
                />
                {b.n ? (
                  <i
                    className="absolute top-[-2px] h-3 w-0.5 bg-foreground"
                    style={{ left: `${Math.min(100, b.hitRate * 100)}%` }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Week {WEEK} predictions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Who was named to win each game. Not a bet. A stored name stays. A later run does not replace it after the fact.
            </p>
          </div>
          <Badge variant="outline">{weekWinners.length || 0} of 16</Badge>
        </div>
        {!lastRunAt ? (
          <p className="text-sm text-muted-foreground">
            {running ? "Getting numbers on the 16…" : "Desk hasn’t priced this week."}{" "}
            {!running ? (
              <Link to="/slate" className="underline">
                Open the desk
              </Link>
            ) : null}
          </p>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-2">
            {weekWinners.map((w, i) => (
              <li key={w.id}>
                {w.gameId ? (
                  <Link
                    to="/game/$gameId"
                    params={{ gameId: w.gameId }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-background-elevated"
                  >
                    <span className="text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <Badge variant="outline" className="ml-2">pred</Badge>
                      <span className="ml-2 font-medium">{w.winner}</span>
                      <span className="ml-2 text-muted-foreground">{w.matchup}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatPct(w.pWin)}</span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                    <span className="text-sm">
                      <span className="font-medium">{w.winner}</span>
                      <span className="ml-2 text-muted-foreground">{w.matchup}</span>
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{formatPct(w.pWin)}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Slate sheet</h2>
        <p className="text-sm text-muted-foreground">Every game’s lean. BET is on the card. PASS is not a wager.</p>
        {!lastRunAt ? (
          <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {running ? "Working the numbers…" : "No number yet this session."}
          </p>
        ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Matchup</th>
                <th className="px-3 py-2 font-medium">Lean</th>
                <th className="px-3 py-2 font-medium">Edge</th>
                <th className="px-3 py-2 font-medium">Units</th>
                <th className="px-3 py-2 font-medium">Card</th>
              </tr>
            </thead>
            <tbody>
              {live.sheet.map((r) => (
                <tr key={r.gameId} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <Link to="/game/$gameId" params={{ gameId: r.gameId }} className="hover:underline">
                      {r.matchup}
                    </Link>
                    <div className="font-mono text-xs text-muted-foreground">{r.kickoff}</div>
                  </td>
                  <td className="px-3 py-2">{r.side}</td>
                  <td className={cn("px-3 py-2 font-mono tabular-nums", r.ev >= MIN_EV ? "text-profit" : "text-muted-foreground")}>
                    {formatSigned(r.ev * 100)}%
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                    {r.take ? formatUnits(sizeUnits(r.kelly)) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.take ? (
                      <Badge variant="profit">bet</Badge>
                    ) : (
                      <Badge variant="outline">pass</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Weekly team projections</h2>
        <p className="text-sm text-muted-foreground">
          Closed cards, Weeks 1–{WEEK - 1}. Units in, units out.
        </p>
        <ClosedCardWeeks weeks={cardWeeks} />
      </section>

      <p className="text-sm text-muted-foreground">
        We don’t fire a wager for you. If gambling is a problem, call 1-800-GAMBLER.
      </p>
    </div>
  );
}

function ClosedCardWeeks({
  weeks,
}: {
  weeks: { week: number; rows: LedgerTicket[]; hits: number; losses: number; pnl: number }[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {weeks.map((wk) => {
        const shown = open === wk.week;
        return (
          <div key={wk.week} className="rounded-xl border border-border bg-card">
            <button
              type="button"
              aria-expanded={shown}
              onClick={() => setOpen(shown ? null : wk.week)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm font-medium">Week {wk.week}</span>
              <span className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                {wk.hits}–{wk.losses} · {formatUnits(wk.pnl, true)}
                <ChevronDown
                  className={cn("size-4 transition-transform", shown && "rotate-180")}
                  strokeWidth={1.75}
                />
              </span>
            </button>
            {shown ? (
              <ul className="space-y-2 border-t border-border px-4 py-3">
                {wk.rows.map((t) => (
                  <li key={t.id} className="rounded-lg border border-border bg-background px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={t.result === "win" ? "profit" : t.result === "loss" ? "loss" : "outline"}>{t.result}</Badge>
                      <Badge variant="outline">{t.kind}</Badge>
                      <span className="text-sm font-medium">{t.side}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.matchup} · {t.score ?? "no final"} · {formatUnits(ticketUnits(t))} · {formatUnits(ticketPnl(t), true)}
                    </p>
                    {"settlementSource" in t && t.settlementSource ? (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{String(t.settlementSource)}</p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">No scoreboard grade on this row.</p>
                    )}
                    {"settlementNote" in t && t.settlementNote ? <p className="mt-1 text-xs text-muted-foreground">{String(t.settlementNote)}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function groupCardByWeek(rows: LedgerTicket[]) {
  const weeks = [...new Set(rows.map((t) => t.week))].sort((a, b) => b - a);
  return weeks.map((week) => {
    const xs = rows.filter((t) => t.week === week);
    const g = xs.filter((t) => t.result === "win" || t.result === "loss");
    const hits = g.filter((t) => t.result === "win").length;
    const units = cardUnits(xs);
    return { week, rows: xs, hits, losses: g.length - hits, pnl: units.pnl, risked: units.risked };
  });
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
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-2xl tabular-nums leading-none",
          profit === true ? "text-profit" : profit === false ? "text-loss" : warn ? "text-warn" : "",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
