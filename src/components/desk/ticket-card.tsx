import { Badge } from "@/components/ui/badge";
import { findGame } from "@/lib/nfl/box";
import { buildAudit } from "@/lib/nfl/integrity";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { sizeBreakdown } from "@/lib/nfl/sizing";
import type { CardPlay } from "@/lib/nfl/ticket";
import { americanOdds, formatPct, formatSigned, formatUnits } from "@/lib/utils";

const STATUS: Record<CardPlay["status"], string> = {
  "paper-eligible": "Paper eligible · not locked",
  papered: "On the paper book",
  locked: "Locked pending kickoff",
};

const INTEGRITY: Record<string, "profit" | "warn" | "loss" | "outline"> = {
  valid: "profit",
  open: "outline",
  invalid: "loss",
  corrected: "warn",
  void: "warn",
};

function stamp(n: number | null) {
  if (!n) return "—";
  return new Date(n).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketCard({ play }: { play: CardPlay; onPaper?: () => void }) {
  const s = play.size ?? sizeBreakdown(play.modelP, play.price);
  const audit = play.audit ?? buildAudit(play);
  const box = useDesk((st) => st.box);
  const game = box && play.matchup ? findGame(box, play.matchup, WEEK) : null;
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={play.kind === "prop" ? "outline" : play.kind === "parlay" ? "warn" : "profit"}>{play.kind}</Badge>
            <span className="text-sm font-medium">{play.market}</span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{play.runId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={INTEGRITY[audit.integrity] ?? "outline"}>{audit.integrity}</Badge>
          <Badge variant="outline">{STATUS[play.status]}</Badge>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs sm:grid-cols-4">
        <Row k="Price" v={americanOdds(play.price)} />
        <Row k="Book / source" v={play.source} />
        <Row k="Model p" v={formatPct(play.modelP)} />
        <Row k="Implied p" v={formatPct(play.impliedP)} />
        <Row k="Post-vig EV" v={formatSigned(play.ev * 100) + "%"} profit={play.ev >= 0.03} />
        <Row k="Full Kelly" v={formatPct(s.full)} />
        <Row k="Half-Kelly" v={`${s.fraction.toFixed(2)}× · ${formatPct(s.half)}`} />
        <Row
          k="Final stake"
          v={s.capped ? `${formatUnits(play.units)} · capped at ${formatPct(s.cap)}` : `${formatUnits(play.units)} / ${formatPct(play.units / 100)} BR`}
        />
        <Row k="Model" v={play.modelVersion} />
        <Row k="Priced" v={stamp(play.pricedAt)} />
      </dl>
      {s.capped ? (
        <p className="mt-2 text-sm text-muted-foreground">Capped at the configured 3.0% bankroll maximum. Half-Kelly was {formatPct(s.half)}.</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {audit.integrity === "valid"
          ? `Valid only if priced ${stamp(audit.recommendationTimestamp)} ≤ lock ${stamp(audit.cardLockTimestamp)} < sheet kickoff ${stamp(audit.kickoffTimestamp)}.`
          : audit.integrity === "invalid"
            ? `Invalid. Recommendation must be at or before the lock, and the lock must be before sheet kickoff ${stamp(audit.kickoffTimestamp)}.`
            : audit.integrity === "void"
              ? "Void keeps the original price and a reason. It is not a locked recommendation."
              : `Open. A lock counts only before sheet kickoff ${stamp(audit.kickoffTimestamp)}. Settlement stays empty.`}
      </p>
      {game && game.status !== "final" && !audit.settlementSource ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Not settled. {game.away} @ {game.home} is {game.statusName}. A 0–0 pregame score is not a result.
        </p>
      ) : null}
      <details className="mt-3 border-t border-border pt-3">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Integrity record
        </summary>
        <dl className="mt-3 grid grid-cols-1 gap-y-2 font-mono text-xs sm:grid-cols-2">
          <Row k="ticket_id" v={audit.ticketId} />
          <Row k="card_id" v={audit.cardId} />
          <Row k="market_id" v={audit.marketId} />
          <Row k="model_version" v={audit.modelVersion} />
          <Row k="input_snapshot_hash" v={audit.inputSnapshotHash} />
          <Row k="odds_source" v={audit.oddsSource} />
          <Row k="source_timestamp" v={stamp(audit.sourceTimestamp)} />
          <Row k="recommendation_timestamp" v={stamp(audit.recommendationTimestamp)} />
          <Row k="card_lock_timestamp" v={stamp(audit.cardLockTimestamp)} />
          <Row k="kickoff_timestamp" v={stamp(audit.kickoffTimestamp)} />
          <Row k="lock_actor" v={audit.lockActor ?? "—"} />
          <Row k="settlement" v={audit.settlementSource ? `${audit.settlementSource} · ${stamp(audit.settlementTimestamp)}` : "—"} />
        </dl>
        {audit.voidReason ? <p className="mt-2 text-xs text-warn">Void reason: {audit.voidReason}. Original retained.</p> : null}
        <ol className="mt-3 space-y-1 text-xs text-muted-foreground">
          {audit.events.map((e, i) => (
            <li key={`${e.type}-${e.at}-${i}`}>
              {stamp(e.at)} · {e.type} · {e.actor} · {e.note}
            </li>
          ))}
        </ol>
      </details>
    </article>
  );
}

function Row({ k, v, profit }: { k: string; v: string; profit?: boolean }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={profit ? "mt-0.5 text-profit" : "mt-0.5"}>{v}</dd>
    </div>
  );
}