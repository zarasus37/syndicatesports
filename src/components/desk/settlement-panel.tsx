import { gradeTickets, SETTLEMENT_RULES } from "@/lib/nfl/box";
import { ARCHIVE } from "@/lib/nfl/history";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { Button } from "@/components/ui/button";

export function SettlementPanel() {
  const box = useDesk((s) => s.box);
  const loading = useDesk((s) => s.boxLoading);
  const loadBox = useDesk((s) => s.loadBox);
  const grades = gradeTickets(ARCHIVE, box);
  const sides = grades.filter((t) => t.week < WEEK && (t.kind === "spread" || t.kind === "total"));
  const graded = sides.filter((t) => t.settlementSource && (t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push" || t.boxResult === "void"));
  const uncovered = grades.filter((t) => t.boxResult === "uncovered");
  const disagree = sides.filter((t) => t.agrees === false);
  const week3 = box?.games.filter((g) => g.week === WEEK) ?? [];
  const finals = week3.filter((g) => g.status === "final").length;

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Box score</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {box
              ? `${box.source} · ${box.fetchedAt}. Public scoreboard, not an official league feed and not a close.`
              : loading
                ? "Asking the scoreboard."
                : "No scoreboard yet. The archive is not a settlement."}
          </p>
        </div>
        <Button variant="secondary" disabled={loading} onClick={() => loadBox(true)}>
          {loading ? "Checking" : "Check the scoreboard"}
        </Button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{SETTLEMENT_RULES}</p>
      {box?.errors.length ? <p className="mt-3 text-sm text-warn">{box.errors.join(" · ")}. No grade was invented.</p> : null}
      {box && !box.errors.length ? (
        <p className="mt-3 text-sm leading-relaxed">
          {graded.length} of {sides.length} closed sides and totals graded.
          {disagree.length ? ` ${disagree.length} disagreed with the archive. The scoreboard is the grade.` : " None disagreed with the archive."}{" "}
          {uncovered.length} prop and parlay rows are not grades. Week {WEEK}: {finals} final, {week3.length - finals} not final. This check does not move a weight.
        </p>
      ) : null}
      {disagree.length ? (
        <ul className="mt-3 space-y-1 text-sm text-warn">
          {disagree.map((t) => (
            <li key={t.id}>
              {t.side} · archive {t.recorded} · scoreboard {t.boxResult} · {t.score}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
