import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  classCounts,
  MISS_CLASS_META,
  reviewTickets,
  type MissClass,
  type TicketReview,
} from "@/lib/nfl/review";
import type { LearnedPriors } from "@/lib/nfl/priors";
import type { LedgerTicket } from "@/lib/nfl/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: MissClass | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "held", label: "Held" },
  { id: "misread-market", label: "Market" },
  { id: "stale-pricing", label: "Stale price" },
  { id: "model-error", label: "Model" },
  { id: "over-weighted-context", label: "Context" },
  { id: "variance", label: "Variance" },
  { id: "open", label: "Open" },
];

export function ReviewBoard({ rows, priors }: { rows: LedgerTicket[]; priors: LearnedPriors }) {
  const reviews = useMemo(() => reviewTickets(rows, priors), [rows, priors]);
  const counts = useMemo(() => classCounts(reviews), [reviews]);
  const [filter, setFilter] = useState<MissClass | "all">("all");
  const shown = filter === "all" ? reviews : reviews.filter((r) => r.missClass === filter);
  const weeks = groupWeeks(shown);
  const [open, setOpen] = useState<number | null>(weeks[0]?.week ?? null);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">Post-week review</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each closed ticket keeps the stored price, the factor stack that put it on the card, what the result
          did to those assumptions, and whether a weight actually moved. A hit is not a rewrite. Two weeks is
          not a season.
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-4">
        {[
          ["Observe", "Market, conditions, crew, slot."],
          ["Model", "Probability versus the price, juice in."],
          ["Decide", "Bet, lean, or pass. Size is capped."],
          ["Review", "What held, what broke, what changed."],
        ].map(([title, body], i) => (
          <li key={title} className="rounded-xl border border-border bg-card p-3">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">0{i + 1} {title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f.id === "all" ? reviews.length : counts[f.id];
          if (f.id !== "all" && n === 0) return null;
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                const next = f.id === "all" ? reviews : reviews.filter((r) => r.missClass === f.id);
                const top = [...new Set(next.map((r) => r.ticket.week))].sort((a, b) => b - a)[0];
                setOpen(top ?? null);
              }}
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-md border px-2.5 font-mono text-xs uppercase tracking-wider",
                on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="tabular-nums">{n}</span>
            </button>
          );
        })}
      </div>

      {filter !== "all" ? (
        <p className="text-sm text-muted-foreground">{MISS_CLASS_META[filter].detail}</p>
      ) : null}

      {weeks.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Nothing in this class.
        </p>
      ) : (
        <div className="space-y-2">
          {weeks.map((wk) => {
            const shownWeek = open === wk.week;
            return (
              <div key={wk.week} className="rounded-xl border border-border bg-card">
                <button
                  type="button"
                  aria-expanded={shownWeek}
                  onClick={() => setOpen(shownWeek ? null : wk.week)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="text-sm font-medium">
                    Week {wk.week}
                    {wk.open ? <span className="ml-2 font-normal text-muted-foreground">not graded</span> : null}
                  </span>
                  <span className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                    {wk.held} held · {wk.missed} miss
                    <ChevronDown className={cn("size-4 transition-transform", shownWeek && "rotate-180")} strokeWidth={1.75} />
                  </span>
                </button>
                {shownWeek ? (
                  <ul className="space-y-3 border-t border-border px-4 py-3">
                    {wk.rows.map((r) => (
                      <ReviewCard key={r.ticket.id} review={r} />
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: TicketReview }) {
  const t = review.ticket;
  const meta = MISS_CLASS_META[review.missClass];
  const badge =
    review.missClass === "held" ? "profit" : review.missClass === "open" ? "outline" : review.missClass === "variance" ? "outline" : "loss";
  return (
    <li className="rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={t.result === "win" ? "profit" : t.result === "loss" ? "loss" : "outline"}>{t.result}</Badge>
        <Badge variant="outline">{t.kind}</Badge>
        <Badge variant={badge}>{meta.label}</Badge>
        {review.also.map((c) => (
          <Badge key={c} variant="outline">
            also {MISS_CLASS_META[c].label}
          </Badge>
        ))}
        <span className="text-sm font-medium">{t.matchup}</span>
      </div>
      <p className="mt-2 font-mono text-xs leading-relaxed text-foreground">{review.priceLine}</p>
      <p className="mt-1 text-sm text-muted-foreground">{review.outcome}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-1 pr-3 font-medium">Signal</th>
              <th className="py-1 pr-3 font-medium">Role</th>
              <th className="py-1 pr-3 font-medium">Weight</th>
              <th className="py-1 font-medium">Read</th>
            </tr>
          </thead>
          <tbody>
            {review.factors.map((f) => (
              <tr key={f.signal} className="border-t border-border">
                <td className="py-1.5 pr-3">{f.signal}</td>
                <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">{f.role}</td>
                <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">{f.weight}</td>
                <td className="py-1.5 text-muted-foreground">{f.read}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Held</dt>
          <dd className="mt-1 space-y-1 text-sm">
            {review.held.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Failed</dt>
          <dd className="mt-1 space-y-1 text-sm text-muted-foreground">
            {review.failed.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-sm">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Afterward </span>
        {review.change}
      </p>
    </li>
  );
}

function groupWeeks(rows: TicketReview[]) {
  const weeks = [...new Set(rows.map((r) => r.ticket.week))].sort((a, b) => b - a);
  return weeks.map((week) => {
    const xs = rows.filter((r) => r.ticket.week === week);
    return {
      week,
      rows: xs,
      held: xs.filter((r) => r.missClass === "held").length,
      missed: xs.filter((r) => r.missClass !== "held" && r.missClass !== "open").length,
      open: xs.every((r) => r.missClass === "open"),
    };
  });
}
