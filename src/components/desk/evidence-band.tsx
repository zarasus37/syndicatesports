import { evidenceCopy } from "@/lib/nfl/desk-meta";
import { gradeTickets } from "@/lib/nfl/box";
import { allTickets } from "@/lib/nfl/learn";
import { useDesk } from "@/lib/nfl/store";

export function EvidenceBand() {
  const e = evidenceCopy();
  const box = useDesk((s) => s.box);
  const locked = useDesk((s) => s.locked) ?? [];
  const grades = box ? gradeTickets(allTickets(locked), box) : [];
  const n = grades.filter((t) => t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push").length;
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-medium">Evidence status</h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Tracked sample</dt>
          <dd className="mt-1 text-muted-foreground">
            {box ? `${n} scoreboard grades · props and parlays excluded` : `${e.sample} · archive, not a scoreboard grade`}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Maturity</dt>
          <dd className="mt-1 text-muted-foreground">{e.maturity}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Primary validation</dt>
          <dd className="mt-1 text-muted-foreground">
            {box ? "ESPN final, overtime included. Not a kickoff close." : e.validation}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Units</dt>
          <dd className="mt-1 text-muted-foreground">{e.units}</dd>
        </div>
      </dl>
    </section>
  );
}
