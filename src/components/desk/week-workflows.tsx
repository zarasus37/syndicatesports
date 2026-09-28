import { weekWorkflows, type WorkflowState } from "@/lib/nfl/workflows";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { allWinners, completedPickRecord } from "@/lib/nfl/winners";
import { cn } from "@/lib/utils";

const STATE: Record<WorkflowState, string> = {
  on: "On",
  open: "Open",
  waiting: "Waiting",
  held: "Held",
};

export function WeekWorkflows() {
  const tape = useDesk((s) => s.tape) ?? [];
  const tapeAt = useDesk((s) => s.tapeAt);
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const plays = useDesk((s) => s.plays) ?? [];
  const predictions = useDesk((s) => s.predictions) ?? [];
  const runPhase = useDesk((s) => s.runPhase);
  const box = useDesk((s) => s.box);
  const lockedWinners = useDesk((s) => s.lockedWinners) ?? [];
  const prior = (box?.games ?? []).filter((game) => game.week === WEEK - 1);
  const current = (box?.games ?? []).filter((game) => game.week === WEEK);
  const picks = completedPickRecord(allWinners(lockedWinners));
  const rows = weekWorkflows({
    week: WEEK,
    tapePrints: tape.length,
    tapeAt,
    priced: Boolean(lastRunAt),
    tickets: plays.filter((play) => play.kind === "spread" || play.kind === "total").length,
    predictions: predictions.length,
    locked: runPhase === "locked" || plays.some((play) => play.audit?.cardLockTimestamp),
    priorFinal: prior.filter((game) => game.status === "final").length,
    priorGames: prior.length,
    weekFinal: current.filter((game) => game.status === "final").length,
    weekGames: current.length,
    pickWeeks: picks.weeks,
    pickHits: picks.hits,
    pickLosses: picks.losses,
  });

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">Workflows</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The week, in order. Each line is what the desk is doing now. None of these place a bet.
        </p>
      </div>
      <ol className="grid gap-2">
        {rows.map((row, index) => (
          <li key={row.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-sm font-medium">{row.name}</h3>
              </div>
              <span
                className={cn(
                  "font-mono text-xs uppercase tracking-wider",
                  row.state === "open" ? "text-warn" : "text-muted-foreground",
                )}
              >
                {STATE[row.state]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{row.does}</p>
            <p className="mt-2 text-sm">{row.now}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
