import { americanToDecimal } from "./odds";
import { mulberry32 } from "./rng";
import type { GameSimResult, PaperTicket } from "./types";

export interface BookAnalytics {
  n: number;
  stake: number;
  expectedProfit: number;
  roi: number;
  ruin: number;
  pDown: number;
  medianEnd: number;
  maxExposure: number;
}

export function analyzeBook(tickets: PaperTicket[], bankroll: number, seed = 1): BookAnalytics {
  const live = tickets.filter((t) => !t.voidedAt);
  const stake = live.reduce((s, t) => s + t.stake, 0);
  const expectedProfit = live.reduce((s, t) => s + t.ev * t.stake, 0);
  const roi = stake > 0 ? expectedProfit / stake : 0;
  if (!live.length) {
    return { n: 0, stake: 0, expectedProfit: 0, roi: 0, ruin: 0, pDown: 0, medianEnd: bankroll, maxExposure: 0 };
  }

  const rng = mulberry32(seed);
  const PATHS = 2200;
  const WEEKS = 24;
  let ruinN = 0;
  let downN = 0;
  const ends: number[] = new Array(PATHS);

  for (let p = 0; p < PATHS; p++) {
    let br = bankroll;
    let ruined = false;
    for (let w = 0; w < WEEKS && !ruined; w++) {
      for (const t of live) {
        if (br < t.stake) {
          ruined = true;
          break;
        }
        const dec = americanToDecimal(t.price);
        if (rng() < t.prob) br += t.stake * (dec - 1);
        else br -= t.stake;
        if (br <= bankroll * 0.05) {
          ruined = true;
          break;
        }
      }
    }
    if (ruined) ruinN += 1;
    if (br < bankroll) downN += 1;
    ends[p] = br;
  }
  ends.sort((a, b) => a - b);

  return {
    n: live.length,
    stake,
    expectedProfit,
    roi,
    ruin: ruinN / PATHS,
    pDown: downN / PATHS,
    medianEnd: ends[Math.floor(ends.length / 2)] ?? bankroll,
    maxExposure: stake / Math.max(1, bankroll),
  };
}

export function meanClv(results: GameSimResult[]): number {
  if (!results.length) return 0;
  return results.reduce((s, r) => s + r.clvPts, 0) / results.length;
}

export function pipelineHealth(
  results: GameSimResult[],
  sims: number,
  runMs: number | null,
): {
  cadenceMin: number;
  sims: number;
  latencyMs: number;
  errorRate: number;
  drift: number;
  flagged: number;
  plusEv: number;
} {
  const residuals = results.map((r) => Math.abs(r.anomaly.snapshot.residualZ));
  const drift = residuals.length ? residuals.reduce((s, z) => s + z, 0) / residuals.length : 0;
  return {
    cadenceMin: 5,
    sims,
    latencyMs: runMs ?? Math.round(sims * 0.04),
    errorRate: 0,
    drift,
    flagged: results.filter((r) => r.anomaly.state !== "normal").length,
    plusEv: results.filter((r) => r.pick.ev >= 0.03).length,
  };
}
