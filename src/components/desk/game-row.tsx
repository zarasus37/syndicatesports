import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { isPrime, gameSlot } from "@/lib/nfl/conditions";
import { flagTone } from "@/lib/nfl/flags";
import { pickLabel } from "@/lib/nfl/labels";
import { bestTake } from "@/lib/nfl/card";
import { publicRead } from "@/lib/nfl/public";
import { analyzeRef, isRefFlag, refTone } from "@/lib/nfl/refs";
import { sharpTone } from "@/lib/nfl/sharp";
import { getGame } from "@/lib/nfl/slate";
import { team } from "@/lib/nfl/teams";
import type { GameSimResult } from "@/lib/nfl/types";
import { americanOdds, cn, formatPct, formatSigned } from "@/lib/utils";

export function GameRow({ result, rank, onCard }: { result: GameSimResult; rank: number; onCard?: boolean }) {
  const game = getGame(result.gameId);
  if (!game) return null;
  const away = team(game.away);
  const home = team(game.home);
  const ev = result.pick.ev;
  const bet = bestTake(result);
  const plus = onCard ?? Boolean(bet);
  const den = game.home === "DEN" || game.away === "DEN";
  const pub = publicRead(game);
  const sharp = result.sharp;
  const slot = gameSlot(game);
  const wind = game.weather.roof !== "dome" && (game.weather.windMph ?? 0) >= 12;
  const heat = game.weather.roof !== "dome" && (game.weather.tempF ?? 0) >= 86;
  const ref = analyzeRef(game);

  return (
    <Link
      to="/game/$gameId"
      params={{ gameId: game.id }}
      className="group block rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-border)] transition-[transform,background-color] duration-150 hover:bg-background-elevated sm:p-4"
    >
      <div className="flex items-start gap-3">
        <span className="w-5 pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <i className="size-1.5 rounded-full" style={{ background: away.color }} />
              {away.abbr}
              <span className="text-muted-foreground">@</span>
              <i className="size-1.5 rounded-full" style={{ background: home.color }} />
              {home.abbr}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{game.kickoffLabel}</span>
            {result.steam !== "stable" ? (
              <Badge variant={result.steam === "rlm" ? "loss" : "warn"}>
                {result.steam} {formatSigned(result.steamPts)}
              </Badge>
            ) : null}
            {sharp && sharp.grade !== "none" ? (
              <Badge variant={sharpTone(sharp.grade)}>
                {sharp.grade}
                {sharp.lean ? ` ${sharp.lean}` : ""}
              </Badge>
            ) : result.anomaly.state !== "normal" ? (
              <Badge variant={flagTone(result.anomaly.state)}>{result.anomaly.state}</Badge>
            ) : null}
            {den ? <Badge variant="outline">chaos</Badge> : null}
            {isPrime(slot) ? <Badge variant="outline">{slot.toUpperCase()}</Badge> : null}
            {slot === "intl" ? <Badge variant="outline">intl</Badge> : null}
            {wind ? <Badge variant="outline">wind {game.weather.windMph}</Badge> : null}
            {heat ? <Badge variant="outline">{game.weather.tempF}°</Badge> : null}
            {isRefFlag(ref) ? (
              <Badge variant={refTone(ref.grade)}>
                {ref.totalLean !== "even" ? ref.totalLean : ref.grade}
              </Badge>
            ) : null}
            {pub.contrarian && sharp?.grade === "none" ? <Badge variant="warn">split</Badge> : null}
            {result.keyCall && result.keyCall.action !== "hold" && result.keyCall.worth ? (
              <Badge variant="warn">
                {result.keyCall.action} {result.keyCall.to}
              </Badge>
            ) : null}
            {result.outsApplied?.length ? <Badge variant="loss">{result.outsApplied.length} out</Badge> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-sm">
              {bet ? (
                <>
                  <span className="text-muted-foreground">Card </span>
                  <span className="font-medium">{pickLabel(game, bet)}</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Pass · lean </span>
                  <span>{pickLabel(game, result.pick)}</span>
                </>
              )}
            </span>
            <span className={cn("font-mono text-sm tabular-nums", plus ? "text-profit" : "text-muted-foreground")}>
              EV {formatSigned((bet ?? result.pick).ev * 100)}%
            </span>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {formatPct(result.pick.prob)}
              {plus ? ` · K ${formatPct(result.pick.kelly)}` : " · no size"}
              {Math.abs(result.clvPts) >= 0.5 ? ` · CLV open ${formatSigned(result.clvPts)}` : ""}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              tix {pub.publicPct}% {pub.publicTeam}
              {pub.contrarian ? ` · $ ${pub.sharpLean === "home" ? home.abbr : away.abbr}` : ""}
            </span>
          </div>
          {game.line.books?.length ? (
            <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
              Ref {game.line.priceBook} {home.abbr} {formatSigned(game.line.spread)} {americanOdds(game.line.spreadPrice)} · o/u {game.line.total}
              {" · "}
              {game.line.books
                .map((b) => `${b.book === "Pinnacle" ? "PIN" : b.book === "FanDuel" ? "FD" : b.book === "Bovada" ? "BV" : "DK"} ${formatSigned(b.spread)}`)
                .join(" ")}
            </p>
          ) : (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">Sheet line · not a live book</p>
          )}
        </div>
        <div className="hidden text-right sm:block">
          <div className="font-mono text-lg tabular-nums leading-none">
            {sharp && sharp.grade !== "none" ? sharp.score : `${result.confidence.toFixed(1)}/10`}
          </div>
          <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {sharp && sharp.grade !== "none" ? "sharp" : signalLabel(result.confidence)}
          </div>
        </div>
      </div>
    </Link>
  );
}

function signalLabel(score: number) {
  if (score >= 6) return "signal high";
  if (score >= 3) return "signal med";
  return "signal low";
}
