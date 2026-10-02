import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INCLUDED,
  NEVER,
  PLANS,
  ROADMAP,
  formatPrice,
  loadWaitlist,
  saveWaitlist,
  type PlanId,
} from "@/lib/product";
import { LAUNCH_GATES, PILOT_CRITERIA, PILOT_SEATS } from "@/lib/launch-gates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const METHOD = [
  {
    n: "01",
    title: "Market behavior",
    body: "Opening and closing numbers, movement, steam, and the shape of the money.",
  },
  {
    n: "02",
    title: "Conditions",
    body: "Handle versus tickets, weather, and the situational context of the game.",
  },
  {
    n: "03",
    title: "Officiating",
    body: "The crew, its tendencies, and how it has called similar games.",
  },
  {
    n: "04",
    title: "Probability model",
    body: "A bet, a lean, or a pass — sized in units, then reviewed after the game grades.",
  },
] as const;

function Home() {
  const [plan, setPlan] = useState<PlanId>("season");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState<ReturnType<typeof loadWaitlist>>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-20">
      {/* Hero */}
      <section className="flex min-h-[calc(100dvh-14rem)] flex-col justify-center gap-8 py-10">
        <div className="space-y-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            SyndicateSports Pilot · 2026 NFL
          </p>
          <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            <span className="block sm:inline">Syndicate</span>
            <span className="block sm:inline">Sports</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Every take. Including the misses.
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
            SyndicateSports does not treat any single signal as a win. It combines market behavior, conditions,
            officiating, and a probability model into a bet, a lean, or a pass — then reviews which assumptions
            held, which broke, and whether a weight actually moved. The desk prices the current week from posted
            books. Paper only. No charge. No proven edge. 21+.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/record">The card</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/slate">The desk</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/gates">Launch gates</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="warn">Pilot</Badge>
          <span>Paper only</span>
          <span>·</span>
          <span>No charge</span>
          <span>·</span>
          <span>21+</span>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid max-w-3xl gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">The card</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sides and totals only when a book posts the price. Props and parlays stay off the card until then.
            Losses remain public.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SU board</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A straight-up winner on all 16 games. Graded separately from the card.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Pilot</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Founding pilot pricing is not active. $79 and $399 are target rates only, after Gates 1–7. No charge.
            No proven edge.
          </p>
        </div>
      </section>

      {/* The card */}
      <section id="card" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The card</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            This week’s plays, and the unit size we would actually bet.
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            Live-book sides and totals that clear the hurdle, sized in units. Props and model parlays are not
            recommendations. The public record stays complete — including the losses.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Included</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {INCLUDED.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-profit" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Not included</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {NEVER.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-loss" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The desk */}
      <section id="desk" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The desk</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            What the market is doing, and why.
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            The desk is the evidence behind the card — the movement, the money, the conditions, and the
            officials, read together rather than as any single signal.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Market</p>
            <h3 className="mt-2 text-sm font-medium">Line movement, steam, and RLM</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Where the number opened, where it moved, and whether the move looks like sharp money or public
              handle. Steam and reverse line movement are read as context, not as a win.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Conditions</p>
            <h3 className="mt-2 text-sm font-medium">Handle vs tickets, referees, weather</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Money versus ticket counts, the officiating crew and its tendencies, and the weather that changes
              how a game is played. Each is a weight in the model, not a headline.
            </p>
          </div>
        </div>
      </section>

      {/* Method */}
      <section id="method" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Method</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            One model, four inputs, a bet, a lean, or a pass.
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            No single signal is treated as a win. The model combines the inputs, produces a decision, and then
            the review grades which assumptions held and which broke.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.map((step) => (
            <div key={step.n} className="rounded-xl border border-border bg-card p-5">
              <p className="font-mono text-xs text-muted-foreground">{step.n}</p>
              <h3 className="mt-2 text-sm font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Pricing</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            Founding pilot pricing is not active.
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            $79 monthly and $399 seasonal are target rates for a future launch only after the data, audit, and
            validation gates are satisfied. Joining the waitlist reserves no product access, creates no charge,
            and makes no performance claim.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(PLANS) as PlanId[]).map((id) => {
            const p = PLANS[id];
            return (
              <div
                key={id}
                className={cn(
                  "rounded-xl border bg-card p-5",
                  id === "season" ? "border-foreground" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{p.name}</p>
                  <Badge variant="outline">target</Badge>
                </div>
                <p className="mt-3 font-mono text-3xl tabular-nums leading-none">
                  {formatPrice(p.price)}
                  <span className="text-sm text-muted-foreground">/{p.cadence}</span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Target rate · not active · not reserved
                </p>
              </div>
            );
          })}
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These figures are targets, not an offer. Monthly is the in-season card. Season runs through preseason
          week 1, then win totals and futures, if we ever bill. Neither number is for sale.{" "}
          <Link to="/plans" className="underline">
            See the full plans page
          </Link>
          .
        </p>
      </section>

      {/* Launch gates */}
      <section id="gates" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Launch gates</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">Paid stays closed.</h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            Paid launch requires Gates 1–7 passed. Gate 8 stays a measured, continuing requirement — pilot
            feedback is an input into billing, not a box that has to stay checked forever. Founding rates are
            targets only. They are not active.
          </p>
        </div>
        <ol className="space-y-3">
          {LAUNCH_GATES.map((g) => (
            <li key={g.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Gate {g.n}
                    {g.blocksPaid ? " · required to bill" : " · continuing"}
                  </p>
                  <h3 className="mt-1 text-sm font-medium">{g.title}</h3>
                </div>
                <Badge variant={g.status === "pass" ? "profit" : g.status === "partial" ? "warn" : "outline"}>
                  {g.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.must}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          <Link to="/gates" className="underline">
            Live gate status
          </Link>
          {" · "}
          <Link to="/learn" className="underline">
            Model card
          </Link>
        </p>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-20 space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Roadmap</p>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">Where this is going.</h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            Nothing here is promised. It is the order in which the product intends to earn the right to exist.
          </p>
        </div>
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

      {/* Waitlist */}
      <section id="waitlist" className="scroll-mt-20">
        <div className="max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-medium">{PILOT_SEATS} pilot research seats</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Research recruitment, not a commercial funnel. Noting interest reserves no access, creates no charge,
            and makes no performance claim. 21+ confirmation. This form does not take a card, a deposit, or a
            promise of profit.
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
                {joined.email} · interest in {PLANS[joined.plan].name} target{" "}
                {formatPrice(PLANS[joined.plan].price)}. No access reserved. No charge.
              </span>
            </p>
          ) : (
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {(Object.keys(PLANS) as PlanId[]).map((id) => {
                    const p = PLANS[id];
                    const on = plan === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPlan(id)}
                        className={cn(
                          "rounded-lg border p-3 text-left transition-colors",
                          on ? "border-foreground bg-muted" : "border-border bg-background hover:border-foreground/40",
                        )}
                      >
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {formatPrice(p.price)}/{p.cadence} · target
                        </p>
                      </button>
                    );
                  })}
                </div>
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
        </div>
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
