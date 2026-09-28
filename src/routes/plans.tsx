import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INCLUDED, NEVER, PLANS, ROADMAP, SEASON_EXTRA, formatPrice, loadWaitlist, saveWaitlist, type PlanId } from "@/lib/product";
import { gateTally, PILOT_CRITERIA, PILOT_SEATS, useLaunchGates } from "@/lib/launch-gates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plans")({ component: PlansPage });

function PlansPage() {
  const gates = useLaunchGates();
  const tally = gateTally(gates);
  const [plan, setPlan] = useState<PlanId>("season");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState<ReturnType<typeof loadWaitlist>>(null);
  const [error, setError] = useState<string | null>(null);
  const selected = PLANS[plan];

  useEffect(() => {
    setJoined(loadWaitlist());
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setError("That email doesn’t look live.");
      return;
    }
    const entry = { email: next, plan, at: Date.now(), attest21: true as const, pilot: true as const };
    saveWaitlist(entry);
    setJoined(entry);
    setError(null);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SyndicateSports · 2026</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">Founding pilot pricing is not active.</h1>
          <Badge variant="warn">Not a checkout</Badge>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
          $79 monthly and $399 seasonal are target rates for a future launch only after the data, audit, and
          validation gates are satisfied. Joining the waitlist reserves no product access, creates no charge,
          and makes no performance claim.
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Paid launch requires Gates 1–7 ({tally.requiredPass}/{tally.requiredN} pass). Gate 8 is
          continuing.{" "}
          <Link to="/gates" className="underline">
            See the gates
          </Link>
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const p = PLANS[id];
          const on = plan === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPlan(id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                on ? "border-foreground bg-card" : "border-border bg-card hover:border-foreground/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{p.name}</p>
                {id === "season" ? <Badge variant="outline">target</Badge> : <Badge variant="outline">target</Badge>}
              </div>
              <p className="mt-2 font-mono text-2xl tabular-nums leading-none">
                {formatPrice(p.price)}
                <span className="text-sm text-muted-foreground">/{p.cadence}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">Target rate · not active · not reserved</p>
            </button>
          );
        })}
      </section>

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        These figures are targets, not an offer. Monthly is the in-season card. Season runs through preseason
        week 1, then win totals and futures, if we ever bill. Eleven months of the monthly target is $869 and
        still excludes the spring markets. Neither number is for sale.
      </p>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-medium">{PILOT_SEATS} pilot research seats</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Research recruitment, not a commercial funnel. {formatPrice(selected.price)}/{selected.cadence} is a
          target you may note an interest in. It does not reserve the rate, the product, or a seat count.
        </p>
        <ul className="mt-3 max-w-xl list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          {PILOT_CRITERIA.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {joined ? (
          <p className="mt-4 text-sm">
            <Badge variant="outline">noted</Badge>
            <span className="ml-2">
              {joined.email} · interest in {PLANS[joined.plan].name} target {formatPrice(PLANS[joined.plan].price)}.
              No access reserved. No charge.
            </span>
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <label htmlFor="wait-email" className="sr-only">
                Email
              </label>
              <Input
                id="wait-email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error ? <p className="mt-1 text-xs text-loss">{error}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">
                21+ confirmation. This form does not take a card, a deposit, or a promise of profit.
              </p>
            </div>
            <Button type="submit" className="min-h-11 shrink-0">
              Note interest
            </Button>
          </form>
        )}
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium">Included</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {INCLUDED.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {SEASON_EXTRA.map((line) => (
              <li key={line}>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Season · </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium">Not included</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {NEVER.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Roadmap</h2>
        <ol className="grid gap-2 sm:grid-cols-2">
          {ROADMAP.map((step, i) => (
            <li
              key={step.id}
              className={cn(
                "rounded-xl border px-4 py-3",
                step.current ? "border-foreground bg-card" : "border-border bg-card",
              )}
            >
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {String(i + 1).padStart(2, "0")} · {step.when}
              </p>
              <p className="mt-1 text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-sm text-muted-foreground">
        We do not place wagers. 21+. If gambling is a problem, call 1-800-GAMBLER.{" "}
        <Link to="/legal" className="underline">
          Terms
        </Link>
        .
      </p>
    </div>
  );
}
