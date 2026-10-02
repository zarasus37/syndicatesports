import { publicRead } from "@/lib/nfl/public";
import { team } from "@/lib/nfl/teams";
import type { NflGame, TeamProfile } from "@/lib/nfl/types";
import { cn } from "@/lib/utils";

export function PublicSplit({ game }: { game: NflGame }) {
  const p = publicRead(game);
  const away = team(game.away);
  const home = team(game.home);
  const unposted =
    game.public.ticketsHome === 50 &&
    game.public.handleHome === 50 &&
    game.public.ticketsOver === 50 &&
    game.public.handleOver === 50;
  const lean = unposted
    ? "Ticket and handle splits are not posted. Shown at 50."
    : p.contrarian
    ? `Public on ${p.publicTeam}. Handle is on the other side.`
    : p.fade
      ? `Public fade: ${p.publicPct}% of tickets on ${p.publicTeam}.`
      : p.publicPct >= 58
        ? `${p.publicPct}% of tickets on ${p.publicTeam}. Handle is aligned.`
        : "Tickets and handle are balanced.";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium">Public betting</h2>
        <p className="mt-1 text-sm text-muted-foreground">{lean}</p>
      </div>
      <SplitRow label="Tickets" awayPct={p.ticketsAway} homePct={p.ticketsHome} away={away} home={home} />
      <SplitRow label="Handle" awayPct={p.handleAway} homePct={p.handleHome} away={away} home={home} />
      <div className="border-t border-border pt-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Total</p>
        <div className="mt-3 space-y-3">
          <SplitRow
            label="Tickets"
            awayPct={p.ticketsOver}
            homePct={100 - p.ticketsOver}
            awayLabel="Over"
            homeLabel="Under"
            awayColor="var(--color-warn)"
            homeColor="var(--color-profit)"
          />
          <SplitRow
            label="Handle"
            awayPct={p.handleOver}
            homePct={100 - p.handleOver}
            awayLabel="Over"
            homeLabel="Under"
            awayColor="var(--color-warn)"
            homeColor="var(--color-profit)"
          />
        </div>
      </div>
    </div>
  );
}

function SplitRow({
  label,
  awayPct,
  homePct,
  away,
  home,
  awayLabel,
  homeLabel,
  awayColor,
  homeColor,
}: {
  label: string;
  awayPct: number;
  homePct: number;
  away?: TeamProfile;
  home?: TeamProfile;
  awayLabel?: string;
  homeLabel?: string;
  awayColor?: string;
  homeColor?: string;
}) {
  const left = awayLabel ?? away?.abbr ?? "Away";
  const right = homeLabel ?? home?.abbr ?? "Home";
  const leftColor = awayColor ?? away?.color ?? "var(--color-muted-foreground)";
  const rightColor = homeColor ?? home?.color ?? "var(--color-foreground)";
  const publicHeavy = Math.max(awayPct, homePct) >= 65;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-xs tabular-nums">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(publicHeavy && awayPct >= homePct ? "text-foreground" : "text-muted-foreground")}>
          {awayPct}% {left}
        </span>
        <span className={cn("text-right", publicHeavy && homePct > awayPct ? "text-foreground" : "text-muted-foreground")}>
          {homePct}% {right}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0" style={{ width: `${awayPct}%`, background: leftColor }} />
        <div className="absolute inset-y-0 right-0" style={{ width: `${homePct}%`, background: rightColor }} />
        <div className="absolute inset-y-0 left-1/2 z-10 w-px bg-background" />
      </div>
    </div>
  );
}
