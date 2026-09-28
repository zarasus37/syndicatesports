import { buildLedger, ledgerSplit } from "@/lib/nfl/ledger";
import { calibrate, maxDrawdown } from "@/lib/nfl/learn";
import { ARCHIVE } from "@/lib/nfl/history";
import { gradeTickets } from "@/lib/nfl/box";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { volumeReport } from "@/lib/nfl/volume";
import { formatSigned, formatUnits } from "@/lib/utils";

function pts(n: number | null) {
  return n == null ? "—" : `${formatSigned(n)} pts`;
}

export function LedgerPanel() {
  const box = useDesk((s) => s.box);
  const grades = gradeTickets(ARCHIVE, box);
  const lines = buildLedger(grades, box).filter((t) => t.week < WEEK);
  const split = ledgerSplit(lines);
  const settled = lines.filter((t) => (t.kind === "spread" || t.kind === "total") && (t.result === "win" || t.result === "loss" || t.result === "push"));
  const brier = box ? calibrate(grades.filter((t) => t.week < WEEK && (t.kind === "spread" || t.kind === "total"))).brier : null;
  const dd = box ? maxDrawdown(grades.filter((t) => t.week < WEEK && (t.result === "win" || t.result === "loss"))) : null;
  const open = settled.map((t) => t.openClv).filter((n): n is number => n != null);
  const close = settled.map((t) => t.closeClv).filter((n): n is number => n != null);
  const openMean = open.length ? open.reduce((s, n) => s + n, 0) / open.length : null;
  const closeMean = close.length ? close.reduce((s, n) => s + n, 0) / close.length : null;
  const plays = useDesk((s) => s.plays) ?? [];
  const volume = volumeReport(plays);

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-medium">Performance ledger</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Open CLV is the number recorded on the ticket. It is not recomputed. Close CLV is the stored number against the DraftKings close on ESPN, and only after a final. One book. Not Pinnacle. A blank close is missing, not the ticket line plus the open CLV. Props stay out of realized.
      </p>
      {!box ? (
        <p className="mt-3 text-sm text-muted-foreground">Waiting on the scoreboard. Nothing below is a close.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Cell k="Open CLV" v={pts(openMean)} hint="recorded mean" />
            <Cell k="Close CLV" v={close.length === settled.length ? pts(closeMean) : "—"} hint={close.length === settled.length ? "DraftKings close" : `${close.length} of ${settled.length} closes`} />
            <Cell k="Brier" v={brier == null ? "—" : brier.toFixed(3)} hint="sides and totals" />
            <Cell k="Max DD" v={dd == null ? "—" : formatUnits(dd, true)} hint="scoreboard order" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium">Market</th>
                  <th className="px-2 py-2 font-medium">n</th>
                  <th className="px-2 py-2 font-medium">Expected</th>
                  <th className="px-2 py-2 font-medium">Realized</th>
                  <th className="px-2 py-2 font-medium">Open CLV</th>
                  <th className="px-2 py-2 font-medium">Close CLV</th>
                  <th className="px-2 py-2 font-medium">DD</th>
                </tr>
              </thead>
              <tbody>
                {split.map((s) => (
                  <tr key={s.kind} className="border-b border-border last:border-0">
                    <td className="px-2 py-2">{s.kind}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "0 graded" : s.n}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "—" : formatUnits(s.expected, true)}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "—" : formatUnits(s.realized, true)}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "—" : pts(s.openClv)}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "—" : s.closeN === s.n ? pts(s.closeClv) : "—"}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{s.kind === "prop" ? "—" : formatUnits(s.drawdown, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {settled.length} sides and totals in the archive. Expected {formatUnits(settled.reduce((s, t) => s + t.expected, 0), true)}. Realized {formatUnits(settled.reduce((s, t) => s + t.realized, 0), true)}. That book is not Gate 6. Gate 6 is {volume.completedWeeks} of {volume.seasonWeeks} locked weeks later settled. Week {WEEK} is not in this book. Not a proven edge.
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground">Each ticket</summary>
            <ul className="mt-3 space-y-2">
              {lines.filter((t) => t.kind === "spread" || t.kind === "total").map((t) => (
                <li key={t.id} className="text-sm">
                  <span className="font-medium">{t.side}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {t.result} · EV {formatSigned(t.ev * 100)}% · {formatUnits(t.realized, true)} · open {pts(t.openClv)} · close {pts(t.closeClv)}
                  </span>
                  {t.closeSource ? <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{t.closeSource}</span> : null}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}

function Cell({ k, v, hint }: { k: string; v: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{v}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
