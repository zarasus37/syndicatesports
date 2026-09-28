import { MAX_BANKROLL_PCT } from "./config";
import { americanToDecimal } from "./odds";

export const KELLY_FRACTION = 0.5;
export const MAX_GAME_UNITS = 6;

export interface SizeBreakdown {
  full: number;
  fraction: number;
  half: number;
  cap: number;
  capped: boolean;
  final: number;
  units: number;
}

export function fullKelly(p: number, american: number) {
  const b = americanToDecimal(american) - 1;
  if (b <= 0) return 0;
  return Math.max(0, (b * p - (1 - p)) / b);
}

export function sizeBreakdown(p: number, american: number): SizeBreakdown {
  const full = fullKelly(p, american);
  const half = full * KELLY_FRACTION;
  const cap = MAX_BANKROLL_PCT;
  const final = Math.min(half, cap);
  const units = Math.round((final / 0.01) * 4) / 4;
  return {
    full,
    fraction: KELLY_FRACTION,
    half,
    cap,
    capped: half > cap + 1e-9,
    final,
    units: units > 0 ? Math.max(0.25, units) : 0,
  };
}

export interface PortfolioRead {
  gross: number;
  corrAdj: number;
  maxGame: { gameId: string; units: number } | null;
  over: boolean;
  scaled: boolean;
}

export function portfolioOf(plays: { gameId?: string; units: number }[]): PortfolioRead {
  const byGame: Record<string, number> = {};
  let gross = 0;
  let corrAdj = 0;
  for (const p of plays) {
    gross += p.units;
    const g = p.gameId ?? "_";
    byGame[g] = (byGame[g] ?? 0) + p.units;
  }
  for (const [g, u] of Object.entries(byGame)) {
    if (g === "_") {
      corrAdj += u;
      continue;
    }
    // first unit at 100%, remainder at 50% — same-game correlation haircut
    corrAdj += Math.min(u, u * 0.5 + Math.min(u, 3) * 0.5);
  }
  let maxGame: PortfolioRead["maxGame"] = null;
  for (const [g, u] of Object.entries(byGame)) {
    if (g === "_") continue;
    if (!maxGame || u > maxGame.units) maxGame = { gameId: g, units: u };
  }
  const over = Boolean(maxGame && maxGame.units > MAX_GAME_UNITS + 1e-9);
  return { gross, corrAdj, maxGame, over, scaled: false };
}

/** Scale any game over MAX_GAME_UNITS down to the cap. */
export function capGameExposure<T extends { gameId?: string; units: number; bankrollPct: number }>(plays: T[]): { plays: T[]; read: PortfolioRead } {
  const byGame: Record<string, T[]> = {};
  for (const p of plays) {
    const g = p.gameId ?? "_";
    (byGame[g] ??= []).push(p);
  }
  let scaled = false;
  const out: T[] = [];
  for (const [g, xs] of Object.entries(byGame)) {
    const sum = xs.reduce((s, x) => s + x.units, 0);
    if (g !== "_" && sum > MAX_GAME_UNITS) {
      const k = MAX_GAME_UNITS / sum;
      scaled = true;
      for (const x of xs) {
        const units = Math.round(x.units * k * 4) / 4;
        out.push({ ...x, units, bankrollPct: units });
      }
    } else {
      out.push(...xs);
    }
  }
  const read = { ...portfolioOf(out), scaled };
  return { plays: out, read };
}
