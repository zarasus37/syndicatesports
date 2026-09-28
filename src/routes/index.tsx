import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Cover });

function Cover() {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col justify-center gap-10 py-8">
      <section className="space-y-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SyndicateSports Pilot · 2026 NFL</p>
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
          held, which broke, and whether a weight actually moved. Pilot. No charge. No proven
          edge. 21+.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/record">The card</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/slate">The desk</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/gates">Launch gates</Link>
        </Button>
      </section>

      <section className="grid max-w-3xl gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">The card</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sides and totals only when a book posts the price. Props and parlays stay off the card until then. Losses remain public.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">SU board</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Straight-up winner on all 16 games. Graded separately from the card.
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

      <p className="text-sm text-muted-foreground">
        If gambling is a problem, call 1-800-GAMBLER.{" "}
        <Badge variant="warn">Pilot</Badge>
      </p>
    </div>
  );
}
