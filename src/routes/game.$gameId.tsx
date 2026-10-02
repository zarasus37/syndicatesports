import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LineTape } from "@/components/desk/line-tape";
import { MarginChart } from "@/components/desk/margin-chart";
import { ConditionsPanel } from "@/components/desk/conditions-panel";
import { WhyLedger } from "@/components/desk/why-ledger";
import { diffSnapshots, type SlateSnapshot } from "@/lib/nfl/audit";
import { OutsPanel } from "@/components/desk/outs-panel";
import { PublicSplit } from "@/components/desk/public-split";
import { RefPanel } from "@/components/desk/ref-panel";
import { SharpPanel } from "@/components/desk/sharp-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MIN_EV } from "@/lib/nfl/config";
import { bestTake } from "@/lib/nfl/card";
import { paperStake } from "@/lib/nfl/execution";
import { pickLabel } from "@/lib/nfl/labels";
import { conditionAdjustments, isPrime } from "@/lib/nfl/conditions";
import { publicRead } from "@/lib/nfl/public";
import { analyzeRef, refTone } from "@/lib/nfl/refs";
import { analyzeSharp, sharpTone } from "@/lib/nfl/sharp";
import { getGame } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { team } from "@/lib/nfl/teams";
import { cn, formatPct, formatSigned, formatSpread } from "@/lib/utils";

export const Route = createFileRoute("/game/$gameId")({ component: GamePage });

function GamePage() {
  const { gameId } = Route.useParams();
  const game = getGame(gameId);
  const result = useDesk((s) => s.results?.[gameId]);
  const bankroll = useDesk((s) => s.bankroll) ?? 10000;
  const run = useDesk((s) => s.run);
  const chaos = useDesk((s) => s.chaos);
  const paperGame = useDesk((s) => s.paperGame);
  const tickets = useDesk((s) => s.tickets) ?? [];
  const plays = useDesk((s) => s.plays) ?? [];
  const snaps = useDesk((s) => s.snaps) ?? [];
  const onCard = plays.some((p) => p.gameId === gameId);
  const papered = tickets.some((t) => t.gameId === gameId && !t.voidedAt);

  if (!game) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-medium">Game not on the slate</h1>
        <Button asChild variant="outline">
          <Link to="/slate">Back</Link>
        </Button>
      </div>
    );
  }

  const away = team(game.away);
  const home = team(game.home);
  const bet = result ? bestTake(result) : null;
  const stake = result && bet ? paperStake(bet.kelly, bet.ev, bankroll) : 0;
  const denGame = game.home === "DEN" || game.away === "DEN";
  const pub = publicRead(game);
  const sharp = result?.sharp ?? analyzeSharp(game);
  const cond = conditionAdjustments(game);
  const ref = analyzeRef(game);

  return (
    <div className="space-y-6">
      <Link
        to="/slate"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Slate
      </Link>

      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {game.kickoffLabel} · {game.network} · {game.weather.venue}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">
          {away.name} <span className="text-muted-foreground">at</span> {home.name}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{away.record}</Badge>
          <Badge variant="outline">{home.record}</Badge>
          <Badge>{formatSpread(game.line.spread)} home</Badge>
          <Badge>O/U {game.line.total}</Badge>
          {game.weather.note ? <Badge variant="warn">{game.weather.note}</Badge> : null}
          {isPrime(cond.slot) || cond.slot === "intl" ? <Badge variant="warn">{cond.slotLabel}</Badge> : null}
          <Badge variant="outline">{cond.crew.name}</Badge>
          {ref.grade !== "quiet" ? (
            <Badge variant={refTone(ref.grade)}>
              {ref.grade}
              {ref.totalLean !== "even" ? ` ${ref.totalLean}` : ""}
            </Badge>
          ) : null}
          {denGame ? <Badge variant="warn">chaos engine</Badge> : null}
          {result?.steam && result.steam !== "stable" ? (
            <Badge variant={result.steam === "rlm" ? "loss" : "warn"}>
              {result.steam} {formatSigned(result.steamPts)}
            </Badge>
          ) : null}
          {result?.anomaly && result.anomaly.state !== "normal" ? (
            <Badge variant={result.anomaly.state === "critical" ? "loss" : "warn"}>{result.anomaly.state}</Badge>
          ) : null}
          {pub.contrarian ? (
            <Badge variant="warn">ticket/handle split</Badge>
          ) : pub.fade ? (
            <Badge variant="outline">
              {pub.publicPct}% tickets {pub.publicTeam}
            </Badge>
          ) : null}
          {sharp.grade !== "none" ? (
            <Badge variant={sharpTone(sharp.grade)}>
              {sharp.grade}
              {sharp.lean ? ` ${sharp.lean}` : ""}
            </Badge>
          ) : null}
        </div>
      </header>

      {!result ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No number on this board yet.
          <div className="mt-3">
            <Button onClick={() => run()}>Get a number</Button>
          </div>
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-4">
            <Stat label="Projected" value={`${result.awayMean.toFixed(1)}–${result.homeMean.toFixed(1)}`} hint="away–home" />
            <Stat label="Home cover" value={formatPct(result.homeCover)} hint={`${home.abbr} ${formatSpread(game.line.spread)}`} />
            <Stat
              label="Edge"
              value={formatSigned(result.pick.ev * 100) + "%"}
              hint={pickLabel(game, result.pick)}
              profit={result.pick.ev >= MIN_EV}
            />
            <Stat
              label="Stake"
              value={`$${stake}`}
              hint={
                result.pick.kelly <= 0
                  ? "q10 Kelly is 0 — print only"
                  : `q10 Kelly ${formatPct(Math.min(0.03, result.pick.kelly))} · size p ${formatPct(result.pick.sizeProb)}`
              }
            />
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => paperGame(game.id)}
              disabled={!onCard}
              variant={papered ? "secondary" : "default"}
            >
              {onCard ? (papered ? "Update paper ticket" : "Paper this side") : "Not a recommendation"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/agents" search={{ game: game.id, agent: "montecarlo" }}>
                Stress this game
              </Link>
            </Button>
            <p className="self-center font-mono text-xs text-muted-foreground">
              CLV {formatSigned(result.clvPts)} pts vs open · rank p {formatPct(result.pick.prob)}
            </p>
          </div>

          {result.keyCall ? (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium">Key number</h2>
              <p className="mt-1 text-sm">
                {result.keyCall.action !== "hold" ? (
                  <span className={result.keyCall.worth ? "text-profit" : ""}>
                    {result.keyCall.action} {result.keyCall.from} → {result.keyCall.to}
                    {result.keyCall.worth ? ` · EV ${formatSigned(result.keyCall.evLift * 100)}%` : " · does not print"}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{result.keyCall.note}</span>
                )}
              </p>
              {result.keyCall.action !== "hold" ? (
                <p className="mt-1 text-sm text-muted-foreground">{result.keyCall.note}</p>
              ) : null}
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium">Outs</h2>
            <p className="mt-1 text-sm text-muted-foreground">Toggle a starter. This game re-runs. Props follow.</p>
            <div className="mt-3">
              <OutsPanel gameId={game.id} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Margin distribution</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {result.sims.toLocaleString()} paths · σ {result.stdMargin.toFixed(1)}
              </span>
            </div>
            <MarginChart histogram={result.histogram} line={game.line.spread} home={home.abbr} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Mini k="One-score" v={formatPct(result.oneScore)} />
              <Mini k={`${home.abbr} by 7+`} v={formatPct(result.homeWinBy7)} />
              <Mini k={`${away.abbr} by 7+`} v={formatPct(result.awayWinBy7)} />
              <Mini k="Chaos triggers" v={chaos ? formatPct(result.chaosTriggers) : "off"} />
            </div>
            {denGame && chaos ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Profile {result.chaosProfile.replace(/_/g, " ")}. Giants mode fires if Denver trails by 14+ in
                Q4 (30% chance of a 21-point burst). Clutch luck adds 0 / 3 / 7 in one-score games.
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="text-sm font-medium">Market vs model</h2>
            <ul className="mt-3 divide-y divide-border">
              {[result.pick, ...result.alts].map((a) => (
                <li key={`${a.market}-${a.side}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{a.side}</span>
                  <span className="flex items-center gap-4 font-mono text-xs tabular-nums">
                    <span className="text-muted-foreground">{formatPct(a.prob)}</span>
                    <span className={cn(a.ev >= MIN_EV ? "text-profit" : "text-muted-foreground")}>
                      {formatSigned(a.ev * 100)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <SharpPanel sharp={sharp} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <PublicSplit game={game} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <RefPanel game={game} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <WhyLedger game={game} result={result} />
              {snaps.length >= 2 ? (
                <SnapLine gameId={game.id} snaps={snaps} />
              ) : null}
              <ConditionsPanel game={game} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium">Tape</h2>
              {game.line.books?.length ? (
                <>
                  <p className="mt-2 font-mono text-sm">
                    Sheet open {formatSpread(game.line.spreadOpen)} · reference {formatSpread(game.line.spread)} {game.line.priceBook}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Open is the DraftKings posted open. Reference is {game.line.priceBook} at fetch time, not a closing number. A gap across books is not steam.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 font-mono text-sm">
                    Open {formatSpread(game.line.spreadOpen)} → now {formatSpread(game.line.spread)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.steam === "stable"
                      ? "Line is stable inside 1.5 points of the open."
                      : result.steam === "steam"
                        ? `Steam with ${pub.publicPct}% of tickets on ${pub.publicTeam}.`
                        : `Reverse line move. ${pub.publicPct}% of tickets on ${pub.publicTeam}, number going the other way.`}
                    {" "}Sheet line only — not a live book.
                  </p>
                </>
              )}
              <div className="mt-4">
                <LineTape game={game} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.anomaly.signals.map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
                <Badge variant={result.anomaly.state === "normal" ? "default" : "warn"}>
                  score {result.anomaly.score.toFixed(0)} · {result.anomaly.state}
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium">Point buy</h2>
              {result.pointBuy.filter((b) => b.key || b.worth).length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No key-number buy prints on this number.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm">
                  {result.pointBuy
                    .filter((b) => b.key || b.worth)
                    .map((b) => (
                      <li key={b.to} className="flex justify-between gap-3 font-mono text-xs">
                        <span>
                          to {formatSpread(b.to)} {b.key ? "key" : ""}
                        </span>
                        <span className={b.worth ? "text-profit" : "text-muted-foreground"}>
                          {formatPct(b.cover)} · {formatSigned(b.deltaPts)} pts
                        </span>
                      </li>
                    ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted-foreground">{game.notes.join(" ")}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  profit,
}: {
  label: string;
  value: string;
  hint: string;
  profit?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 font-mono text-2xl tabular-nums leading-none", profit && "text-profit")}>{value}</div>
      <div className="mt-2 truncate text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="font-mono text-sm tabular-nums">{v}</div>
    </div>
  );
}

function SnapLine({ gameId, snaps }: { gameId: string; snaps: SlateSnapshot[] }) {
  const deltas = diffSnapshots(snaps[1], snaps[0]!).filter((d) => d.id === gameId);
  if (!deltas.length) {
    return <p className="mt-3 text-sm text-muted-foreground">No change vs the last snapshot.</p>;
  }
  const d = deltas[0]!;
  return (
    <p className="mt-3 font-mono text-xs text-muted-foreground">
      Since last run: {d.sideFrom} {formatSigned(d.evFrom * 100)}% → {d.sideTo} {formatSigned(d.evTo * 100)}%
      {d.takeFrom !== d.takeTo ? (d.takeTo ? " · onto the card" : " · off the card") : ""}
    </p>
  );
}
