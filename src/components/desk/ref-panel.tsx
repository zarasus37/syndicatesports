import { analyzeRef, LEAGUE_FLAGS, refTone } from "@/lib/nfl/refs";
import { team } from "@/lib/nfl/teams";
import type { NflGame } from "@/lib/nfl/types";
import { Badge } from "@/components/ui/badge";
import { formatPct, formatSigned } from "@/lib/utils";

export function RefPanel({ game }: { game: NflGame }) {
  const read = analyzeRef(game);
  const { crew } = read;
  const home = team(game.home);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Referee</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {crew.name}. {crew.note ?? `${crew.style === "whistle" ? "Whistle" : crew.style === "let-play" ? "Let-play" : "Standard"} crew.`}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular-nums leading-none">{read.score}</div>
          <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">crew</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={refTone(read.grade)}>{read.grade}</Badge>
        {read.totalLean !== "even" ? <Badge variant={read.totalLean === "over" ? "warn" : "outline"}>{read.totalLean}</Badge> : null}
        {read.sideLean === "home" ? <Badge variant="outline">home {home.abbr}</Badge> : null}
        {read.passLean === "up" ? <Badge variant="warn">DPI</Badge> : read.passLean === "down" ? <Badge variant="outline">tight DPI</Badge> : null}
        {read.sackLean === "down" ? <Badge variant="outline">sacks down</Badge> : read.sackLean === "up" ? <Badge variant="warn">sacks live</Badge> : null}
      </div>
      <dl className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4">
        <Stat k="Flags / g" v={crew.flagsPerGame.toFixed(1)} hint={`lg ${LEAGUE_FLAGS}`} />
        <Stat k="DPI / g" v={crew.dpiPerGame.toFixed(1)} />
        <Stat k="Home ATS" v={formatPct(crew.homeAts, 0)} />
        <Stat k="Overs" v={formatPct(crew.overPct, 0)} />
      </dl>
      {read.conflict ? <p className="text-sm text-warn">{read.conflict}</p> : null}
      {read.tells.length === 0 ? (
        <p className="text-sm text-muted-foreground">League-average crew. No overlay from the whistle.</p>
      ) : (
        <ul className="divide-y divide-border">
          {read.tells.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm">{t.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">+{t.pts}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="font-mono text-xs text-muted-foreground">
        Total lean {formatSigned(crew.totalLean)} · holding {crew.holding} · PF {crew.personalFouls.toFixed(1)}/g
      </p>
    </div>
  );
}

function Stat({ k, v, hint }: { k: string; v: string; hint?: string }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-foreground">
        {v}
        {hint ? <span className="ml-1 text-muted-foreground">{hint}</span> : null}
      </dd>
    </div>
  );
}
