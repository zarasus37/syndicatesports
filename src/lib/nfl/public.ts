import { FADE_POINTS } from "./config";
import type { NflGame, TeamAbbr } from "./types";

export const PUBLIC_FADE = 65;
export const PUBLIC_LEAN = 58;
export const SPLIT_SHARP = 12;

export interface PublicRead {
  ticketsHome: number;
  handleHome: number;
  ticketsAway: number;
  handleAway: number;
  ticketsOver: number;
  handleOver: number;
  splitHome: number;
  publicSide: "home" | "away";
  publicPct: number;
  publicTeam: TeamAbbr;
  fade: "home" | "away" | null;
  sharpLean: "home" | "away" | "even";
  contrarian: boolean;
}

export function publicRead(game: NflGame): PublicRead {
  const ticketsHome = game.public.ticketsHome;
  const handleHome = game.public.handleHome;
  const ticketsAway = 100 - ticketsHome;
  const handleAway = 100 - handleHome;
  const splitHome = handleHome - ticketsHome;
  const publicSide: "home" | "away" = ticketsHome >= 50 ? "home" : "away";
  const publicPct = Math.max(ticketsHome, ticketsAway);
  const fade = publicPct >= PUBLIC_FADE ? publicSide : null;
  const sharpLean: PublicRead["sharpLean"] =
    splitHome >= SPLIT_SHARP ? "home" : splitHome <= -SPLIT_SHARP ? "away" : "even";
  const contrarian = fade !== null && sharpLean !== "even" && sharpLean !== fade;
  return {
    ticketsHome,
    handleHome,
    ticketsAway,
    handleAway,
    ticketsOver: game.public.ticketsOver,
    handleOver: game.public.handleOver,
    splitHome,
    publicSide,
    publicPct,
    publicTeam: publicSide === "home" ? game.home : game.away,
    fade,
    sharpLean,
    contrarian,
  };
}

export function isPublicFlag(game: NflGame): boolean {
  const p = publicRead(game);
  return p.fade !== null || p.contrarian;
}

export function againstPublic(game: NflGame, moveTowardHome: boolean): boolean {
  const p = publicRead(game);
  if (p.publicPct < PUBLIC_LEAN) return false;
  if (p.publicSide === "home") return !moveTowardHome;
  return moveTowardHome;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export interface MoneyRead {
  /** Points added to the HOME mean. Negative leans away from a crowded home. */
  tiltPts: number;
  /** 0..1 combined ticket concentration and handle divergence. */
  pressure: number;
  /** True when the line already moved against the crowd (RLM) — no fade owed. */
  lineMovedAgainstPublic: boolean;
  note: string;
}

/**
 * Read the *composition* of the money and turn it into a margin tilt.
 *
 * The size of a line move is not usable as an input: the engine anchors to
 * `line.spread`, which is the current price and already contains the entire
 * move, so re-applying it double-counts (the same failure as the old team
 * rating term). What a closing line genuinely cannot encode is **who moved
 * it**, and that is where the independent edge is:
 *
 *   - Tickets crowd one side but handle leans the other way. The crowd is
 *     over-weighted relative to the money, which is the classic fade.
 *   - If the line then followed the crowd, the market agreed with them and the
 *     tilt stands.
 *   - If the line already moved *against* the crowd (reverse line movement),
 *     the market has done the correcting. The tilt drops to zero, because
 *     leaning away from the crowd a second time would count the same move
 *     twice. The line already carries it.
 *
 * Tilt is in points of margin. `FADE_POINTS` is derived, not guessed: near the
 * money line the cover probability moves ~0.0296 per point of margin shift at
 * a 13.5pt league SD, so 1.5 points is worth about 4.4 points of cover
 * probability — a shade under the ~5pp a textbook fade is assumed to be worth,
 * because fade edges decay. Treat it as an assumption the ledger should
 * eventually falsify, not a fitted number.
 */
export function moneyRead(game: NflGame): MoneyRead {
  const p = publicRead(game);
  const publicSide = p.publicSide === "home" ? 1 : -1;

  // Ticket concentration. Nothing to fade at 52%; full pressure by 75%.
  const concentration = clamp01((p.publicPct - 52) / 23);

  // `splitHome` is handle minus tickets on the home side. Scaled so a handle
  // leaning off the public side scores positive.
  const handleGap = -publicSide * p.splitHome;
  const divergence = clamp01(handleGap / 12);

  const pressure = concentration * divergence;

  const movePts = game.line.spread - game.line.spreadOpen;
  const movedTowardPublic = (publicSide === 1 && movePts < 0) || (publicSide === -1 && movePts > 0);
  const lineMovedAgainstPublic = Math.abs(movePts) >= 1 && !movedTowardPublic;

  // Normalise away a signed zero — `-1 * 0 * 1.5` is -0, which is not `0` under
  // strict equality and would leak into the sim and the ledger.
  const tiltPts = (lineMovedAgainstPublic ? 0 : -publicSide * pressure * FADE_POINTS) + 0;

  // Name the side the money is actually on. When the handle leans off the
  // crowd the money is on the *opposite* side to the tickets, so this has to
  // be resolved against the public side rather than against "home".
  const moneyTeam = handleGap > 0 ? (publicSide === 1 ? game.away : game.home) : p.publicTeam;
  const note = lineMovedAgainstPublic
    ? `Line already moved against ${p.publicPct}% ${p.publicTeam} tickets. That correction is in the price — no second fade.`
    : pressure > 0
      ? `${p.publicPct}% of tickets on ${p.publicTeam}; handle leans ${moneyTeam} (${Math.abs(p.splitHome)} pts off the crowd). Fading toward ${moneyTeam}.`
      : `${p.publicPct}% of tickets on ${p.publicTeam}. Handle ${
          handleGap > 0 ? "leans the other way but the crowd is too even" : "agrees with the crowd"
        } — nothing worth fading.`;

  return { tiltPts, pressure, lineMovedAgainstPublic, note };
}
