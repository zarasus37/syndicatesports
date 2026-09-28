import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { gateTally, useLaunchGates } from "@/lib/launch-gates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gates")({ component: GatesPage });

const TONE: Record<string, "profit" | "warn" | "outline"> = {
  pass: "profit",
  partial: "warn",
  fail: "outline",
};

function GatesPage() {
  const gates = useLaunchGates();
  const t = gateTally(gates);
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Minimum launch gate</p>
        <h1 className="text-3xl font-medium tracking-tight">Paid stays closed.</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Paid launch requires Gates 1–7 passed. Gate 8 stays a measured, continuing requirement — pilot
          feedback is an input into billing, not a box that has to stay checked forever. {t.requiredPass} of{" "}
          {t.requiredN} required gates pass. Founding rates are targets only. They are not active.
        </p>
      </section>

      <ol className="space-y-3">
        {gates.map((g) => (
          <li key={g.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Gate {g.n}
                  {g.blocksPaid ? " · required to bill" : " · continuing"}
                </p>
                <h2 className="mt-1 text-sm font-medium">{g.title}</h2>
              </div>
              <Badge variant={TONE[g.status]}>{g.status}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.must}</p>
            <p className={cn("mt-2 text-sm leading-relaxed", g.status === "fail" ? "text-warn" : "text-foreground")}>
              Now: {g.now}
            </p>
          </li>
        ))}
      </ol>

      <p className="text-sm text-muted-foreground">
        <Link to="/plans" className="underline">
          Request a pilot seat
        </Link>
        {" · "}
        <Link to="/learn" className="underline">
          Model card
        </Link>
        {" · "}
        <Link to="/legal" className="underline">
          Terms
        </Link>
      </p>
    </div>
  );
}
