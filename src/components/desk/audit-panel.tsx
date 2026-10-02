import { ASSUMPTIONS, downloadCsv, ledgerCsv, pnlSplit } from "@/lib/nfl/audit";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import type { LedgerTicket } from "@/lib/nfl/types";
import { formatUnits } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AuditPanel({ rows }: { rows: LedgerTicket[] }) {
  const split = pnlSplit(rows);
  const journal = useDesk((s) => s.journal) ?? [];
  const phase = useDesk((s) => s.runPhase);
  const box = useDesk((s) => s.box);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Audit</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Realized vs expected, in units. 80% interval on the mean of each ticket. Model {ASSUMPTIONS.version}.
            State: {phase}.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => downloadCsv(`syndicate-w1-${WEEK}-card.csv`, ledgerCsv(rows, box))}
          disabled={false}
        >
          Download CSV
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label="Expected"
          value={split.n ? formatUnits(split.sumE, true) : "—"}
          hint={split.n ? `sum of units × EV · ${formatUnits(split.risked)} risked` : "priced edge"}
        />
        <Stat
          label="Realized"
          value={split.n ? formatUnits(split.sumR, true) : "—"}
          hint={split.n > 1 ? `80% [${formatUnits(split.realized.lo * split.n, true)}, ${formatUnits(split.realized.hi * split.n, true)}] · do not extrapolate` : "high variance"}
          profit={split.sumR > 0}
        />
        <Stat label="Min EV" value={`${ASSUMPTIONS.minEv * 100}%`} hint="post-juice hurdle" />
        <Stat
          label="Level"
          value={ASSUMPTIONS.marketAnchored ? "market" : "model"}
          hint="ratings excluded — no double count"
        />
      </div>
      {journal.length ? (
        <ol className="space-y-1.5">
          {journal.slice(0, 8).map((e) => (
            <li key={`${e.at}-${e.type}-${e.note}`} className="flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground">
              <span>
                {e.type} · {e.note}
              </span>
              <span>{new Date(e.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No session journal yet. Runs, locks, voids, and paper tickets append here. Archive grades are immutable.</p>
      )}
    </section>
  );
}

function Stat({
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
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg tabular-nums ${profit ? "text-profit" : profit === false ? "text-loss" : ""}`}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
