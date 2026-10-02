import type { TeamAbbr } from "./types";

/**
 * Per-team game-score variance, derived from results rather than typed in.
 *
 * `variance` is the primary driver of each game's margin width:
 *
 *     vol = BASE_STD * sqrt((variance(home) + variance(away)) / 2)
 *
 * so once the Denver chaos engine and the tail-amplification rule were
 * removed, this field was the main determinant of how wide every simulated
 * margin distribution ran — and every value in `teams.ts` was hand-set. Live
 * form updates overwrote `ratingZ`, `pf` and `pa` but never this, so the
 * number was permanently whatever someone decided in a code review.
 *
 * What it measures: the standard deviation of a team's scoring margin across
 * its completed games. A team that swings from +20 to -14 is genuinely harder
 * to project than one that grinds out 17-14 every week, and that difference is
 * measurable rather than narrative.
 *
 * Two guards, both of which matter:
 *
 * 1. **Shrinkage toward neutral.** A sample SD from n games has a relative
 *    standard error of about `1 / sqrt(2n - 1)`, so the fraction of the
 *    estimate that is not noise is `1 - 1/sqrt(2n - 1)`. That is used directly
 *    as the trust weight rather than a fitted constant, and the deviation from
 *    1.0 is scaled by it. At four games a team is trusted at 40%, at sixteen at
 *    82% — and never fully, because per-team variance stays noisy all season.
 *
 * 2. **Neutral below three games.** Three points do not describe a
 *    distribution. Below the floor the multiplier stays exactly 1.0 and the
 *    model runs on league-average width rather than a bad estimate.
 *
 * Note this is descriptive, not a skill claim, so shrinkage is symmetric: a
 * team is pulled toward 1.0 from either side in proportion to how little we
 * actually know. That is different from the one-way guard on betting
 * haircuts, where a short hot streak must not inflate a weight.
 */

/** Games needed before a margin SD describes anything. */
export const MIN_VARIANCE_GAMES = 3;

/**
 * Hard bounds on the multiplier. A noisy estimate must not reach the sim.
 *
 * The band is set by measurement, not taste. Against the 128 completed games
 * of the 2026 season, per-team margin SD ratios to the league average span
 * 0.46 to 1.54 — genuine, large differences. Shrunk by ~0.75 trust those land
 * near 0.61 and 1.39.
 *
 *   band [0.80, 1.25]  ->  9 of 32 teams (28%) pinned on the bound
 *   band [0.70, 1.40]  ->  2 of 32 teams  (6%) pinned on the bound
 *
 * At the tighter band the clamp stops being a safety rail and becomes the
 * mechanism — it would be flattening a real distribution rather than catching
 * outliers. These are the shipped numbers. In game terms they put the margin
 * standard deviation between 11.3 and 16.0 points depending on the two teams'
 * measured volatility, which spans real NFL game margins.
 */
export const VARIANCE_MIN = 0.7;
export const VARIANCE_MAX = 1.4;

/** Ceiling on trust: per-team variance never earns full confidence in a season. */
export const MAX_TRUST = 0.9;

export interface VarianceRead {
  abbr: TeamAbbr;
  games: number;
  /** Raw ratio of this team's margin SD to the league average. */
  raw: number;
  /** 0 when there are no games, rising toward MAX_TRUST as games accumulate. */
  trust: number;
  /** What the engine uses. Exactly 1 when there is no usable data. */
  value: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Fraction of a sample SD that is signal rather than sampling error. */
export function sdTrust(games: number): number {
  if (games < MIN_VARIANCE_GAMES) return 0;
  return clamp(1 - 1 / Math.sqrt(2 * games - 1), 0, MAX_TRUST);
}

function sampleSd(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/**
 * League baseline: the mean of the per-team margin SDs, taken only over teams
 * that clear the minimum. Using the mean of the per-team values (rather than
 * the SD of every individual margin) keeps the reference on the same scale as
 * the thing being compared, so a league-average team lands on 1.0 by
 * construction.
 */
export function leagueBaseline(margins: Map<TeamAbbr, number[]>): number {
  const sds = [...margins.values()].filter((xs) => xs.length >= MIN_VARIANCE_GAMES).map(sampleSd).filter((s) => s > 0);
  if (!sds.length) return 0;
  return sds.reduce((s, x) => s + x, 0) / sds.length;
}

/**
 * Derive a variance multiplier for every team with margin history.
 *
 * Teams with no usable history are omitted rather than reported as 1.0, so the
 * caller can tell "neutral because unknown" apart from "measured as exactly
 * average".
 */
export function deriveVariance(margins: Map<TeamAbbr, number[]>): VarianceRead[] {
  const baseline = leagueBaseline(margins);
  if (baseline <= 0) return [];

  const out: VarianceRead[] = [];
  for (const [abbr, xs] of margins) {
    const games = xs.length;
    if (games < MIN_VARIANCE_GAMES) continue;
    const sd = sampleSd(xs);
    if (sd <= 0) continue;
    const raw = sd / baseline;
    const trust = sdTrust(games);
    // Shrink the deviation from neutral, then bound it.
    const value = clamp(1 + (raw - 1) * trust, VARIANCE_MIN, VARIANCE_MAX);
    out.push({ abbr, games, raw, trust, value });
  }
  return out.sort((a, b) => b.value - a.value);
}

/** Human-readable copy for the desk, so the number can be argued with. */
export function varianceNote(read: VarianceRead, baseline: number): string {
  const dir = read.value > 1.02 ? "wide" : read.value < 0.98 ? "tight" : "average";
  return `${read.games} games · margin SD ${(read.raw * baseline).toFixed(1)} vs league ${baseline.toFixed(1)} · ${dir} (${read.value.toFixed(2)}×, trust ${(read.trust * 100).toFixed(0)}%)`;
}
