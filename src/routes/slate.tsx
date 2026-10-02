import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GameRow } from "@/components/desk/game-row";
import { RunBar } from "@/components/desk/run-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/desk/ticket-card";
import { activeGames, getGame } from "@/lib/nfl/slate";
import { MIN_EV } from "@/lib/nfl/config";
import { isAnomalyFlag, isTapeFlag } from "@/lib/nfl/flags";
import { diffSnapshots } from "@/lib/nfl/audit";
import { gameSlot, isPrime } from "@/lib/nfl/slot";
import { isPublicFlag } from "@/lib/nfl/public";
import { analyzeRef, isRefFlag, refTone } from "@/lib/nfl/refs";
import { isSharpFlag, sharpTone } from "@/lib/nfl/sharp";
import { useDesk } from "@/lib/nfl/store";
import { team } from "@/lib/nfl/teams";
import type { GameSimResult } from "@/lib/nfl/types";
import { cn, formatScore, formatSigned } from "@/lib/utils";

export const Route = createFileRoute("/slate")({ component: Home });

type Filter = "all" | "plus" | "near" | "pass" | "steam" | "anomaly" | "public" | "sharp" | "refs" | "prime" | "thu" | "totals";

function Home() {
  const results = useDesk((s) => s.results) ?? {};
  const order = useDesk((s) => s.order) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const tickets = useDesk((s) => s.tickets) ?? [];
  const snaps = useDesk((s) => s.snaps) ?? [];
  const plays = useDesk((s) => s.plays) ?? [];
  const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
  const oddsFetchedAt = useDesk((s) => s.oddsFetchedAt);
  const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
  const [filter, setFilter] = useState<Filter>("all");
  const ranked = order.map((id) => results[id]).filter((r): r is GameSimResult => Boolean(r));
  const cardIds = new Set(plays.map((p) => p.gameId).filter((id): id is string => Boolean(id)));
  const onCard = cardIds;
  const plus = ranked.filter((r) => cardIds.has(r.gameId));
  const steam = ranked.filter(isTapeFlag);
  const flagged = ranked.filter(isAnomalyFlag);
  const publicFades = ranked.filter((r) => {
    const g = getGame(r.gameId);
    return g ? isPublicFlag(g) : false;
  });
  const sharps = ranked.filter((r) => r.sharp && isSharpFlag(r.sharp));
  const topSharps = [...ranked]
    .filter((r) => r.sharp && r.sharp.grade !== "none")
    .sort((a, b) => (b.sharp?.score ?? 0) - (a.sharp?.score ?? 0))
    .slice(0, 5);
  const top = plays[0];
  const shown = ranked.filter((r) => {
    if (filter === "plus") return onCard.has(r.gameId);
    if (filter === "near") return !onCard.has(r.gameId) && r.pick.ev > 0 && r.pick.ev < MIN_EV;
    if (filter === "pass") return !onCard.has(r.gameId);
    if (filter === "totals") return r.pick.market === "total";
    if (filter === "prime" || filter === "thu") {
      const g = getGame(r.gameId);
      if (!g) return false;
      const slot = gameSlot(g);
      if (filter === "thu") return slot === "tnf";
      return isPrime(slot);
    }
    if (filter === "steam") return isTapeFlag(r);
    if (filter === "anomaly") return isAnomalyFlag(r);
    if (filter === "public") {
      const g = getGame(r.gameId);
      return g ? isPublicFlag(g) : false;
    }
    if (filter === "sharp") return r.sharp ? isSharpFlag(r.sharp) : false;
    if (filter === "refs") {
      const g = getGame(r.gameId);
      return g ? isRefFlag(analyzeRef(g)) : false;
    }
    return true;
  });
  const near = ranked.filter((r) => !onCard.has(r.gameId) && r.pick.ev > 0 && r.pick.ev < MIN_EV);
  const cardN = plays.length;
  const slateGames = activeGames();
  const featured = slateGames.filter((g) => g.featured);
  const refBoard = slateGames.map((g) => ({ game: g, ref: analyzeRef(g) }))
    .filter((x) => x.ref.grade !== "quiet")
    .sort((a, b) => b.ref.score - a.ref.score);
  const refFlags = refBoard.filter((x) => isRefFlag(x.ref));
  const topCrews = refBoard.slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The desk</p>
        <h1 className="max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">
          Rank the number. Not the score.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Only a plus-EV ticket at a posted book price is a wager. Sharp, steam, and refs are context. Predictions for all 16 sit on{" "}
          <Link to="/record" className="text-foreground underline">
            Record
          </Link>
          . Line movement, steam, RLM, handle vs tickets, then unit size.{" "}
          <Link to="/plans" className="text-foreground underline">
            Beta
          </Link>
          . 21+.
        </p>
      </section>

      <RunBar />

      {lastRunAt ? (
        <section className="rounded-xl border border-foreground bg-card p-4 sm:p-5">
          {cardN === 0 ? (
            <>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Decision</p>
              <h2 className="mt-1 text-xl font-medium tracking-tight">No qualifying wagers this run.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {dataMode === "live-books"
                  ? `No spread or total cleared ${MIN_EV * 100}% after juice at a posted price from ${oddsBooks.join(", ") || "the board"}. Props and model parlays are not live books, so they are not on the card.`
                  : "Live books did not return a board. The seeded sheet is on screen for research only. Nothing on it is a recommendation."}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Decision</p>
              <h2 className="mt-1 text-xl font-medium tracking-tight">
                {cardN} play{cardN === 1 ? "" : "s"} clear {MIN_EV * 100}% after juice.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Game markets {plays.filter((p) => p.kind === "spread" || p.kind === "total").length} · props{" "}
                {plays.filter((p) => p.kind === "prop").length} · parlays {plays.filter((p) => p.kind === "parlay").length}.
                Paper card {cardN}. Each ticket stores the book, the fetch time, and that price.
                {oddsFetchedAt ? ` Board ${oddsFetchedAt}.` : ""}
              </p>
              <div className="mt-4 space-y-2">
                {plays.map((play) => (
                  <TicketCard key={play.id} play={play} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          label="Game markets"
          value={lastRunAt ? String(plays.filter((p) => p.kind === "spread" || p.kind === "total").length) : "—"}
          hint="sides / totals on the card"
        />
        <Kpi label="Props" value={lastRunAt ? String(plays.filter((p) => p.kind === "prop").length) : "—"} hint="not a live book" />
        <Kpi label="Parlays" value={lastRunAt ? String(plays.filter((p) => p.kind === "parlay").length) : "—"} hint="not a posted price" />
        <Kpi label="Paper card" value={lastRunAt ? String(cardN) : "—"} hint={`≥ ${MIN_EV * 100}% after juice`} />
      </section>

      {topSharps.length > 0 && lastRunAt ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Observed: sharp money</h2>
          <p className="text-sm text-muted-foreground">Diagnostic. Ticket/handle split and RLM — not a wager by itself.</p>
          <ol className="grid gap-2 sm:grid-cols-5">
            {topSharps.map((r) => {
              const g = getGame(r.gameId);
              if (!g || !r.sharp) return null;
              const lean = r.sharp.lean;
              return (
                <li key={r.gameId}>
                  <Link
                    to="/game/$gameId"
                    params={{ gameId: r.gameId }}
                    className="block rounded-xl border border-border bg-card p-3 hover:bg-background-elevated"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {team(g.away).abbr} @ {team(g.home).abbr}
                      </span>
                      <Badge variant={sharpTone(r.sharp.grade)}>{r.sharp.grade}</Badge>
                    </div>
                    <p className="mt-2 text-sm">{lean ? `Lean ${lean}` : "No clean lean"}</p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                      {formatScore(r.sharp.score)} · {r.sharp.fired.length} tell{r.sharp.fired.length === 1 ? "" : "s"}
                      {onCard.has(r.gameId) ? "" : " · pass"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {topCrews.length > 0 && lastRunAt ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Observed: referees</h2>
          <p className="text-sm text-muted-foreground">Crew tells. Not a reason to write a ticket on its own.</p>
          <ol className="grid gap-2 sm:grid-cols-5">
            {topCrews.map(({ game: g, ref }) => (
              <li key={g.id}>
                <Link
                  to="/game/$gameId"
                  params={{ gameId: g.id }}
                  className="block rounded-xl border border-border bg-card p-3 hover:bg-background-elevated"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{ref.crew.name.split(" ").slice(-1)[0]}</span>
                    <Badge variant={refTone(ref.grade)}>{ref.grade}</Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {team(g.away).abbr} @ {team(g.home).abbr}
                  </p>
                  <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                    {formatScore(ref.score)} · {ref.totalLean === "even" ? `${ref.crew.flagsPerGame.toFixed(1)} flg` : ref.totalLean}
                    {ref.passLean === "up" ? " · DPI" : ""}
                    {ref.sackLean === "up" ? " · sacks" : ref.sackLean === "down" ? " · hold" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {featured.length > 0 && lastRunAt ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Watch list</h2>
          <p className="text-sm text-muted-foreground">Prime / featured kickoffs. Still a pass unless it is on the card.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {featured.map((g) => {
              const r = results[g.id];
              const away = team(g.away);
              const home = team(g.home);
              if (!r) return null;
              return (
                <Link
                  key={g.id}
                  to="/game/$gameId"
                  params={{ gameId: g.id }}
                  className="rounded-xl border border-border bg-card p-4 hover:bg-background-elevated"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {away.abbr} @ {home.abbr}
                    </span>
                    {r.steam !== "stable" ? (
                      <Badge variant={r.steam === "rlm" ? "loss" : "warn"}>{r.steam}</Badge>
                    ) : r.anomaly.state !== "normal" ? (
                      <Badge variant="warn">{r.anomaly.state}</Badge>
                    ) : (
                      <Badge variant="outline">{g.network}</Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{onCard.has(r.gameId) ? r.pick.side : `Pass · ${r.pick.side}`}</p>
                  <p className={cn("mt-1 font-mono text-sm tabular-nums", onCard.has(r.gameId) ? "text-profit" : "text-muted-foreground")}>
                    EV {formatSigned(r.pick.ev * 100)}%
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {lastRunAt && snaps.length >= 2 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium">Simulation variance since prior run</h2>
          <p className="text-sm text-muted-foreground">
            Same seeded inputs. Output moved because of a new sim seed, or path count — not a live market move.
          </p>
          {(() => {
            const deltas = diffSnapshots(snaps[1], snaps[0]!);
            if (!deltas.length) return <p className="text-sm text-muted-foreground">No material change.</p>;
            return (
              <ul className="space-y-1.5">
                {deltas.slice(0, 8).map((d) => {
                  const g = getGame(d.id);
                  return (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm">
                      <Link to="/game/$gameId" params={{ gameId: d.id }} className="hover:underline">
                        {g ? `${team(g.away).abbr} @ ${team(g.home).abbr}` : d.id}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">
                        {d.sideFrom} → {d.sideTo} · {formatSigned(d.evFrom * 100)}% → {formatSigned(d.evTo * 100)}%
                        {d.takeFrom !== d.takeTo ? (d.takeTo ? " · onto card" : " · off card") : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          })()}
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Full slate</h2>
          <p className="text-sm text-muted-foreground">Research view. Pass means we would not bet it.</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-muted-foreground">
              {shown.length}/{slateGames.length}
            </p>
            {lastRunAt ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/book">Open the book ({tickets.filter((t) => !t.voidedAt).length})</Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All", ranked.length],
              ["plus", "Card", plus.length],
              ["near", "Near", near.length],
              ["pass", "Pass", Math.max(0, ranked.length - plus.length)],
              ["prime", "Prime", ranked.filter((r) => {
                const g = getGame(r.gameId);
                return g ? isPrime(gameSlot(g)) : false;
              }).length],
              ["thu", "TNF", ranked.filter((r) => {
                const g = getGame(r.gameId);
                return g ? gameSlot(g) === "tnf" : false;
              }).length],
              ["totals", "Totals", ranked.filter((r) => r.pick.market === "total").length],
              ["sharp", "Sharps", sharps.length],
              ["refs", "Refs", refFlags.length],
              ["steam", "Steam", steam.length],
              ["public", "Public", publicFades.length],
              ["anomaly", "Flags", flagged.length],
            ] as const
          ).map(([id, label, n]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "h-10 min-h-10 rounded-md px-3 text-sm",
                filter === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
              )}
            >
              {label}
              {lastRunAt ? <span className="ml-1 font-mono text-xs">{n}</span> : null}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shown.length === 0 ? (
            <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              {lastRunAt ? "Nothing matches this filter." : "Run the slate to get a number."}
            </p>
          ) : (
            shown.map((r, i) => <GameRow key={r.gameId} result={r} rank={i + 1} onCard={onCard.has(r.gameId)} />)
          )}
        </div>
      </section>

      {top ? (
        <p className="text-sm text-muted-foreground">
          Top ticket {top.market} · EV {formatSigned(top.ev * 100)}% · {top.source}
        </p>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl tabular-nums leading-none">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
