export const DEFAULT_SIMS = 12_000;
export const MAX_SIMS = 80_000;

/**
 * League margin standard deviation, in points, BEFORE per-team variance and
 * condition multipliers. Empirical NFL game-margin SD is ~13.5.
 *
 * The sim is constructed so this is the *realised* SD of the scoring margin:
 * variance is split across body and fourth quarter so the two together square
 * back to BASE_STD rather than inflating past it.
 */
export const BASE_STD = 13.5;

/** Share of BASE_STD variance carried by the first three quarters. */
export const BODY_VAR_SHARE = 0.9;
/** Per team, so body+Q4 combine to exactly BASE_STD of margin SD. */
export const BODY_SD = BASE_STD * Math.sqrt(BODY_VAR_SHARE) / Math.SQRT2;
export const Q4_SD = BASE_STD * Math.sqrt(1 - BODY_VAR_SHARE) / Math.SQRT2;

export const MIN_EV = 0.03;

/**
 * Points of margin the model shifts, per unit of money-composition pressure.
 *
 * Derived rather than fitted: near the money line, cover probability moves
 * about 0.0296 per point of margin shift at a 13.5pt league SD, so 1.5 points
 * is worth roughly 4.4 points of cover probability — just under the ~5pp a
 * textbook public fade is assumed to be worth, since fade edges decay. See
 * `public.moneyRead` for the derivation and the RLM suppression rule.
 */
export const FADE_POINTS = 1.5;/** Max spread/total tickets on the live card. Props and parlays are separate. */
export const MAX_CARD_SIDES = 6;
export const KELLY_CAP = 0.5;
export const MAX_BANKROLL_PCT = 0.03;
export const KEY_NUMBERS = [3, 7, 10];
export const DEFAULT_BANKROLL = 10_000;

export const ANOMALY_WEIGHTS = {
  leadLag: 10,
  steam: 10,
  defended: 5,
  outlier: 15,
  residualZ: 15,
  persist: 15,
  div: 10,
  tilt: 10,
  prop: 5,
  weather: 5,
} as const;

export const ANOMALY_THRESHOLDS = {
  info: 60,
  outlier: 70,
  critical: 82,
} as const;
