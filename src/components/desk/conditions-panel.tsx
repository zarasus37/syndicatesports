import { conditionAdjustments, isPrime } from "@/lib/nfl/conditions";
import { team } from "@/lib/nfl/teams";
import type { NflGame } from "@/lib/nfl/types";
import { Badge } from "@/components/ui/badge";
import { formatSigned } from "@/lib/utils";

export function ConditionsPanel({ game }: { game: NflGame }) {
  const adj = conditionAdjustments(game);
  const away = team(game.away);
  const home = team(game.home);
  const wx = game.weather;
  const outdoor = wx.roof === "open" || wx.roof === "neutral";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium">Conditions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {adj.slotLabel}. {adj.crew.name} on the crew. Overlay hits the mean and the props — market number is the base.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={isPrime(adj.slot) || adj.slot === "intl" ? "warn" : "outline"}>{adj.slotLabel}</Badge>
        <Badge variant="outline">{adj.crew.name}</Badge>
        {outdoor && (wx.windMph ?? 0) >= 12 ? <Badge variant="warn">wind {wx.windMph} mph</Badge> : null}
        {outdoor && (wx.tempF ?? 0) >= 86 ? <Badge variant="warn">{wx.tempF}°F</Badge> : null}
        {game.home === "DEN" && outdoor ? <Badge variant="warn">altitude</Badge> : null}
        {adj.crew.dpi === "high" ? <Badge variant="warn">high DPI</Badge> : null}
        {adj.crew.dpi === "low" ? <Badge variant="outline">lets them play</Badge> : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
        <Item k={`${away.abbr} overlay`} v={formatSigned(adj.awayPts)} />
        <Item k={`${home.abbr} overlay`} v={formatSigned(adj.homePts)} />
        <Item k="Vol" v={`${adj.volMult.toFixed(2)}×`} />
        <Item k="Flags / g" v={adj.crew.flagsPerGame.toFixed(1)} />
      </dl>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {adj.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      {wx.note ? <p className="text-xs text-muted-foreground">{wx.venue} · {wx.note}</p> : null}
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-foreground">{v}</dd>
    </div>
  );
}
