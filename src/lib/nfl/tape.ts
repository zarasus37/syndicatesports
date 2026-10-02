import type { NflGame } from "./types";

export interface TapePoint {
  t: string;
  spread: number;
  total: number;
}

/** Reconstruct a 24h tape from open → current using the feature windows. */
export function buildTape(game: NflGame): TapePoint[] {
  const s0 = game.line.spreadOpen;
  const s1 = game.line.spread;
  const tot0 = game.line.totalOpen;
  const tot1 = game.line.total;
  if (game.line.books?.length) {
    return [
      { t: "Sheet", spread: s0, total: tot0 },
      { t: "Ref", spread: s1, total: tot1 },
    ];
  }
  const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
  // Small wiggle so the last hour isn't a straight line.
  const wiggle = Math.sign(s1 - s0) * 0.15;
  return [
    { t: "Open", spread: s0, total: tot0 },
    { t: "−24h", spread: lerp(s0, s1, 0.12), total: lerp(tot0, tot1, 0.1) },
    { t: "−6h", spread: lerp(s0, s1, 0.48), total: lerp(tot0, tot1, 0.4) },
    { t: "−90m", spread: lerp(s0, s1, 0.78) + wiggle, total: lerp(tot0, tot1, 0.82) },
    { t: "−15m", spread: s1, total: tot1 },
  ];
}

export function clvPts(game: NflGame, pickingHome: boolean, market: "spread" | "total" | "ml", side: string): number {
  if (game.line.books?.length) return 0;
  if (market === "total") {
    const move = game.line.total - game.line.totalOpen;
    return side.startsWith("Over") ? move : -move;
  }
  const move = game.line.spread - game.line.spreadOpen;
  return pickingHome ? -move : move;
}
