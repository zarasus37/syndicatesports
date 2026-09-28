import { KELLY_CAP, MAX_BANKROLL_PCT, MIN_EV } from "./config";
import { bestTake } from "./card";
import { MODEL_VERSION } from "./desk-meta";
import { kellyFraction } from "./odds";
import { PROPS } from "./slate";
import type { GameSimResult, PaperTicket, ParlayTicket, PropSim } from "./types";

export function paperStake(kelly: number, ev: number, bankroll: number, cap = MAX_BANKROLL_PCT): number {
  if (ev < MIN_EV) return 0;
  const fraction = Math.min(KELLY_CAP, cap, Math.max(0, kelly));
  const raw = Math.round(fraction * bankroll);
  const ceiling = Math.round(cap * bankroll);
  return Math.max(0, Math.min(raw, ceiling));
}

export function straightTicket(result: GameSimResult, bankroll: number, label: string): PaperTicket | null {
  const bet = bestTake(result);
  if (!bet) return null;
  const stake = paperStake(bet.kelly, bet.ev, bankroll);
  if (stake <= 0) return null;
  return {
    id: `s-${result.gameId}-${bet.side}`,
    placedAt: Date.now(),
    kind: "straight",
    gameId: result.gameId,
    label,
    side: bet.side,
    stake,
    price: bet.price,
    ev: bet.ev,
    prob: bet.prob,
    modelVersion: MODEL_VERSION,
  };
}

export function parlayTicket(ticket: ParlayTicket, bankroll: number): PaperTicket | null {
  const kelly = Math.min(0.01, Math.max(0, ticket.ev) * 0.25);
  const stake = Math.round(kelly * bankroll);
  if (stake <= 0 || ticket.ev < MIN_EV) return null;
  return {
    id: `p-${ticket.id}`,
    placedAt: Date.now(),
    kind: "parlay",
    label: ticket.legs.map((l) => l.side).join(" / "),
    side: "3-leg",
    stake,
    price: ticket.offeredAmerican,
    ev: ticket.ev,
    prob: ticket.joint,
    modelVersion: MODEL_VERSION,
  };
}

export function propTicket(sim: PropSim, bankroll: number): PaperTicket | null {
  if (sim.pick === "pass") return null;
  const line = PROPS.find((p) => p.id === sim.id);
  if (!line) return null;
  const over = sim.pick === "over";
  const price = over ? line.overPrice : line.underPrice;
  const prob = over ? sim.pOver : 1 - sim.pOver;
  const ev = over ? sim.evOver : sim.evUnder;
  const kelly = kellyFraction(prob, price);
  const stake = paperStake(kelly, ev, bankroll);
  if (stake <= 0) return null;
  return {
    id: `prop-${sim.id}`,
    placedAt: Date.now(),
    kind: "prop",
    gameId: line.gameId,
    label: `${line.player} ${over ? "over" : "under"} ${line.line}`,
    side: `${over ? "Over" : "Under"} ${line.line}`,
    stake,
    price,
    ev,
    prob,
    modelVersion: MODEL_VERSION,
  };
}

export function upsertTicket(existing: PaperTicket[], next: PaperTicket): PaperTicket[] {
  const without = existing.filter((t) => t.id !== next.id);
  return [next, ...without].slice(0, 80);
}
