import { createFileRoute, Link } from "@tanstack/react-router";
import { EvidenceBand } from "@/components/desk/evidence-band";
import { ReviewBoard } from "@/components/desk/review-board";
import { SettlementPanel } from "@/components/desk/settlement-panel";
import { ASSUMPTIONS } from "@/lib/nfl/audit";
import { Button } from "@/components/ui/button";
import { gradeTickets } from "@/lib/nfl/box";
import { MODEL_CARD } from "@/lib/nfl/model-card";
import { allTickets, calibrate, maxDrawdown, segmentBook } from "@/lib/nfl/learn";
import { boardMorning } from "@/lib/nfl/cycle";
import { tapeHolding } from "@/lib/nfl/line-tape";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { cn, formatPct, formatSigned } from "@/lib/utils";

export const Route = createFileRoute("/learn")({ component: LearnPage });

function LearnPage() {
  const locked = useDesk((s) => s.locked) ?? [];
  const box = useDesk((s) => s.box);
  const priors = useDesk((s) => s.priors);
  const lockWeek = useDesk((s) => s.lockWeek);
  const plays = useDesk((s) => s.plays) ?? [];
  const runPhase = useDesk((s) => s.runPhase);
  const journal = useDesk((s) => s.journal) ?? [];
  const tape = useDesk((s) => s.tape) ?? [];
  const holding = tapeHolding(tape);
  const finished = (box?.games ?? []).filter((g) => g.week === WEEK - 1);
  const finishedFinal = finished.filter((g) => g.status === "final").length;
  const cycle = boardMorning();
  const rows = gradeTickets(allTickets(locked), box);
  const cal = calibrate(rows);
  const closed = rows.filter((t) => t.week < WEEK);
  const lockNote = journal.find((e) => e.type === "locked" || e.note.startsWith("LOCK_REFUSED"))?.note;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The loop</p>
        <h1 className="text-3xl font-medium tracking-tight">Review</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          SyndicateSports does not treat any single signal as a win. It combines market behavior, conditions,
          officiating, and a probability model into a bet, a lean, or a pass, then checks where that decision
          held or failed. Weights move only when the posterior clears the prior. CLV here is versus the open,
          not a kickoff close. Two graded weeks. No proven edge.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          label="CLV posterior"
          value={formatSigned(priors.clvPost.mean)}
          hint={`vs open · 80% [${formatSigned(priors.clvPost.q10)}, ${formatSigned(priors.clvPost.q90)}]`}
          profit={priors.clvPost.mean > 0}
        />
        <Kpi label="Brier" value={cal.brier.toFixed(3)} hint="sharpness" />
        <Kpi label="ATS" value={`${cal.hits}–${cal.losses}`} hint={`${formatPct(cal.hitRate)} vs ${formatPct(cal.exp)} priced`} profit={cal.hitRate >= cal.exp} />
        <Kpi label="Graded" value={String(cal.n)} hint={box ? "scoreboard · prop and parlay excluded" : "archive · not settled this session"} />
      </section>

      <EvidenceBand />

      <SettlementPanel />

      <ReviewBoard rows={rows} priors={priors} />

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Versioned assumptions</h2>
        <p className="mt-1 text-sm text-muted-foreground">What this model run is allowed to do. Weights stay 1.00x until the sample is large enough to move them.</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd>{ASSUMPTIONS.version}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Min EV</dt>
            <dd>{ASSUMPTIONS.minEv * 100}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Card cap</dt>
            <dd>{ASSUMPTIONS.maxCardSides} sides</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Mean shift</dt>
            <dd>{ASSUMPTIONS.meanShift}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bankroll cap</dt>
            <dd>{ASSUMPTIONS.bankrollCap * 100}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Default paths</dt>
            <dd>{ASSUMPTIONS.defaultSims.toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Held for learning</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {cycle.label} Picks use Week {WEEK} only. {finished.length ? `Week ${WEEK - 1} on the scoreboard: ${finishedFinal} of ${finished.length} final.` : "The finished week is graded from the scoreboard, not from the Sunday whistle."} A look-ahead print is held and is not a pick. A print does not move a weight.
        </p>
        {holding.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing stored yet.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {holding.map((row) => (
              <li key={row.week ?? "x"}>
                {row.week == null ? "Week not on the scoreboard" : `Week ${row.week}`}
                {row.week === WEEK ? " · on the card" : " · not on the card"} · {row.games} book-games · {row.prints} prints
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Model card · {MODEL_CARD.version}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Edge: {MODEL_CARD.edge}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Block title="Inputs" items={[...MODEL_CARD.inputs]} />
          <Block title="Exclusions" items={[...MODEL_CARD.exclusions]} />
          <Block title="Simulation" items={[...MODEL_CARD.simulation]} />
          <Block title="Sizing" items={[...MODEL_CARD.sizing]} />
        </div>
        <div className="mt-4">
          <Block title="Known failure modes" items={[...MODEL_CARD.failures]} />
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Drawdown on closed card {formatSigned(maxDrawdown(closed))}u ·{" "}
          {segmentBook(closed)
            .map((s) => `${s.kind} ${s.n}`)
            .join(" · ")}{" "}
          ·{" "}
          <Link to="/gates" className="underline">
            Launch gates
          </Link>
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Reliability</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          When we said 60%, did it hit 60%? Thin buckets barely move the needle.
        </p>
        <ul className="mt-4 space-y-3">
          {(priors.reliability ?? []).map((b) => (
            <li key={`${b.lo}-${b.hi}`}>
              <div className="flex justify-between gap-2 font-mono text-xs tabular-nums text-muted-foreground">
                <span>
                  {formatPct(b.lo)}–{formatPct(b.hi)} · n={b.n}
                </span>
                <span>
                  model {formatPct(b.exp)} · hit {formatPct(b.hit)}
                </span>
              </div>
              <div className="relative mt-1.5 h-2 rounded-full bg-muted">
                <i className="absolute top-0 h-2 rounded-full bg-foreground/35" style={{ width: `${Math.min(100, b.exp * 100)}%` }} />
                <i className="absolute top-[-2px] h-3 w-0.5 bg-foreground" style={{ left: `${Math.min(100, b.hit * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Bayesian update</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prior Beta(μ₀·10, (1−μ₀)·10). Posterior after weeks {priors.fromWeek}–{priors.toWeek}. The multiplier
          is what the next slate actually uses. Bars are 80% credible.
        </p>
        <ul className="mt-4 space-y-3">
          {["rlm", "steam", "tnf", "public-fade", "whistle-over", "chaos", "wind", "all"].map((tag) => {
            const p = priors.posts[tag];
            if (!p) return null;
            return (
              <li key={tag}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm">{tag}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {p.hits}/{p.n} raw {formatPct(p.raw)} → post {formatPct(p.mean)} · {p.mult.toFixed(2)}×
                  </span>
                </div>
                <CiBar lo={p.q10} hi={p.q90} mean={p.mean} prior={p.priorMean} />
              </li>
            );
          })}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4">
          <div>
            <dt className="uppercase tracking-wider text-muted-foreground">CLV μ</dt>
            <dd className={cn("mt-1", priors.clvPost.mean > 0 ? "text-profit" : "")}>
              {formatSigned(priors.clvPost.mean)} [{formatSigned(priors.clvPost.q10)}, {formatSigned(priors.clvPost.q90)}]
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-muted-foreground">P(beat prior)</dt>
            <dd className="mt-1">{priors.posts.all ? formatPct(priors.posts.all.pBeat) : "—"}</dd>
          </div>
        </dl>
        {priors.missPost.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Miss modes (Dirichlet)</p>
            <ul className="mt-2 space-y-1.5">
              {priors.missPost.slice(0, 5).map((m) => (
                <li key={m.reason} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{m.reason}</span>
                  <span className="font-mono text-xs tabular-nums">{formatPct(m.mean)} · n={m.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {priors.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Engine multipliers</h2>
        <p className="mt-1 text-sm text-muted-foreground">Haircuts the next run actually eats.</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4">
          {Object.entries(priors.haircuts).map(([k, v]) => (
            <div key={k}>
              <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
              <dd className={cn("mt-1", v < 1 ? "text-warn" : v > 1 ? "text-profit" : "")}>{v.toFixed(2)}×</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Where we were off</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Tag</th>
                <th className="px-3 py-2 font-medium">n</th>
                <th className="px-3 py-2 font-medium">Hit</th>
                <th className="px-3 py-2 font-medium">Expected</th>
                <th className="px-3 py-2 font-medium">Edge</th>
                <th className="px-3 py-2 font-medium">Post</th>
              </tr>
            </thead>
            <tbody>
              {cal.tags.map((t) => (
                <tr key={t.tag} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">{t.tag}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{t.n}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{t.hits}/{t.n}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{formatPct(t.exp)}</td>
                  <td className={cn("px-3 py-2 font-mono tabular-nums", t.edge >= 0 ? "text-profit" : "text-loss")}>
                    {formatSigned(t.edge * 100)}
                  </td>
                  <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                    {priors.posts[t.tag] ? formatPct(priors.posts[t.tag]!.mean) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Week {WEEK} card</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Lock only the live-book sides and totals on this card. Props and model parlays are not recommendations. The stamp has to land before each ticket’s sheet kickoff. Grades and a settlement source are Gate 3, not this lock.
            </p>
          </div>
          <Button onClick={() => lockWeek()} disabled={plays.length === 0} variant="secondary">
            {runPhase === "locked" ? "Relock refused" : `Lock this week (${plays.length})`}
          </Button>
        </div>
        {lockNote ? <p className="font-mono text-xs text-muted-foreground">{lockNote}</p> : null}
        {plays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No live-book recommendation is on the card, so there is nothing to lock.</p>
        ) : (
          <ul className="space-y-2">
            {plays.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3">
                <span className="text-sm">
                  {t.selection}
                  <span className="ml-2 text-muted-foreground">{t.market}</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {t.audit?.integrity ?? "open"} · {formatPct(t.modelP)} · EV {formatSigned(t.ev * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="font-mono text-xs text-muted-foreground">
        Closed archive {closed.length} tickets · {cal.byWeek.map((w) => `W${w.week} ${w.hits}/${w.n}`).join(" · ")} ·{" "}
        <Link to="/agents" className="underline">
          Agents
        </Link>
      </p>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CiBar({ lo, hi, mean, prior }: { lo: number; hi: number; mean: number; prior: number }) {
  const pct = (x: number) => `${Math.min(100, Math.max(0, x * 100))}%`;
  return (
    <div className="relative mt-1.5 h-2 rounded-full bg-muted">
      <i
        className="absolute top-0 h-2 rounded-full bg-foreground/40"
        style={{ left: pct(lo), width: pct(hi - lo) }}
      />
      <i className="absolute top-[-2px] h-3 w-0.5 bg-foreground" style={{ left: pct(mean) }} />
      <i className="absolute top-[-2px] h-3 w-px bg-warn" style={{ left: pct(prior) }} />
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  profit,
}: {
  label: string;
  value: string;
  hint: string;
  profit?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl tabular-nums leading-none", profit ? "text-profit" : "")}>{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
