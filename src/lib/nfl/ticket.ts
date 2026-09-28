import { MODEL_VERSION, ODDS_SOURCE } from "./desk-meta";
import { MIN_EV } from "./config";
import { buildAudit, type TicketAudit } from "./integrity";
import { executionQuote, isLiveBook } from "./books";
import { evFromProb, impliedProb } from "./odds";
import { getGame } from "./slate";
import { sizeBreakdown, type SizeBreakdown } from "./sizing";
import { PROPS } from "./slate";
import { bestTake, liveTrueCard } from "./card";
import type { GameSimResult, LedgerTicket, NflGame, PaperTicket, ParlayTicket, PropSim, SimPick } from "./types";

export type CardKind = "spread" | "total" | "prop" | "parlay";
export type CardStatus = "paper-eligible" | "papered" | "locked";

export interface CardPlay {
  id: string;
  kind: CardKind;
  market: string;
  selection: string;
  line: number;
  price: number;
  source: string;
  modelP: number;
  impliedP: number;
  ev: number;
  units: number;
  bankrollPct: number;
  size: SizeBreakdown;
  modelVersion: string;
  pricedAt: number;
  runId: string;
  status: CardStatus;
  gameId?: string;
  matchup?: string;
  audit: TicketAudit;
}

export function statusOf(id: string, papered: Set<string>, locked: boolean): CardStatus {
  if (locked) return "locked";
  if (papered.has(id)) return "papered";
  return "paper-eligible";
}

function base(
  id: string,
  kind: CardKind,
  market: string,
  selection: string,
  line: number,
  price: number,
  modelP: number,
  ev: number,
  runId: string,
  pricedAt: number,
  papered: Set<string>,
  locked: boolean,
  extra: Partial<CardPlay>,
): CardPlay {
  const size = sizeBreakdown(modelP, price);
  const play: CardPlay = {
    id,
    kind,
    market,
    selection,
    line,
    price,
    source: ODDS_SOURCE,
    modelP,
    impliedP: impliedProb(price),
    ev,
    units: size.units,
    bankrollPct: size.units,
    size,
    modelVersion: MODEL_VERSION,
    pricedAt,
    runId,
    status: statusOf(id, papered, locked),
    audit: undefined as unknown as TicketAudit,
    ...extra,
  };
  play.audit = buildAudit(play);
  return play;
}

export function playFromSide(
  pick: SimPick,
  gameId: string,
  matchup: string,
  runId: string,
  pricedAt: number,
  papered: Set<string>,
  locked: boolean,
): CardPlay | null {
  const quoted = gameId ? getGame(gameId) : undefined;
  const shop = quoted ? executionQuote(quoted, pick.market === "total" ? "total" : "spread", pick.side, pick.line) : null;
  if (!shop) return null;
  const price = shop.price;
  const ev = evFromProb(pick.prob, price);
  if (ev < MIN_EV) return null;
  return base(
    `s-${gameId}-${pick.side}`,
    pick.market === "total" ? "total" : "spread",
    `${matchup} ${pick.side}`,
    pick.side,
    pick.line,
    price,
    pick.prob,
    ev,
    runId,
    pricedAt,
    papered,
    locked,
    { gameId, matchup, source: `${shop.book} · ${shop.at}` },
  );
}

export function playFromProp(sim: PropSim, runId: string, pricedAt: number, papered: Set<string>, locked: boolean): CardPlay | null {
  if (sim.pick === "pass") return null;
  const line = PROPS.find((p) => p.id === sim.id);
  if (!line) return null;
  const over = sim.pick === "over";
  const price = over ? line.overPrice : line.underPrice;
  const modelP = over ? sim.pOver : 1 - sim.pOver;
  const ev = over ? sim.evOver : sim.evUnder;
  return base(
    `prop-${sim.id}`,
    "prop",
    `${line.player} ${line.market} ${over ? "over" : "under"} ${line.line}`,
    `${over ? "Over" : "Under"} ${line.line}`,
    line.line,
    price,
    modelP,
    ev,
    runId,
    pricedAt,
    papered,
    locked,
    { gameId: line.gameId, matchup: `${line.team} · ${line.player}` },
  );
}

export function playFromParlay(p: ParlayTicket, runId: string, pricedAt: number, papered: Set<string>, locked: boolean): CardPlay {
  return base(
    `p-${p.id}`,
    "parlay",
    p.legs.map((l) => l.side).join(" / "),
    p.kind === "sgp" ? "SGP" : "3-leg",
    0,
    p.offeredAmerican,
    p.joint,
    p.ev,
    runId,
    pricedAt,
    papered,
    locked,
    { gameId: p.legs[0]?.gameId, matchup: p.legs.map((l) => l.label).join(" · ") },
  );
}

export function ledgerFromPlay(play: CardPlay, week: number): LedgerTicket {
  return {
    id: play.id,
    week,
    kind: play.kind,
    matchup: play.matchup ?? play.market,
    side: play.selection,
    line: play.line,
    price: play.price,
    prob: play.modelP,
    ev: play.ev,
    tags: [],
    clv: 0,
    result: "pending",
    reasons: [],
  };
}

export function paperIds(tickets: PaperTicket[]) {
  return new Set(tickets.filter((t) => !t.voidedAt).map((t) => t.id));
}

export function paperFromPlay(play: CardPlay, bankroll: number): PaperTicket {
  return {
    id: play.id,
    placedAt: play.pricedAt,
    kind: play.kind === "parlay" ? "parlay" : play.kind === "prop" ? "prop" : "straight",
    gameId: play.gameId,
    label: play.market,
    side: play.selection,
    stake: Math.round(play.units * 0.01 * bankroll),
    price: play.price,
    ev: play.ev,
    prob: play.modelP,
    modelVersion: play.modelVersion,
    source: play.source,
  };
}

export function collectPlays(
  results: GameSimResult[],
  parlays: ParlayTicket[],
  props: PropSim[],
  games: NflGame[],
  runId: string,
  pricedAt: number,
  locked: boolean,
): CardPlay[] {
  const live = liveTrueCard(results, parlays, props, games);
  const papered = new Set<string>();
  const sides = live.takes
    .map((t) => {
      const r = results.find((x) => x.gameId === t.gameId);
      const pick = r ? bestTake(r) : null;
      if (!pick) return null;
      return playFromSide(pick, t.gameId, t.matchup, runId, pricedAt, papered, locked);
    })
    .filter((p): p is CardPlay => Boolean(p && isLiveBook(p.source) && (p.kind === "spread" || p.kind === "total")));
  return sides.map((p) => ({ ...p, status: locked ? "locked" : "papered" }));
}
