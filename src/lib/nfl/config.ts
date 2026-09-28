export const DEFAULT_SIMS = 12_000;
export const MAX_SIMS = 80_000;
export const BASE_STD = 13.5;
export const HOME_FIELD = 1.6;
export const RATING_TO_POINTS = 3.15;
export const MEAN_SHIFT_FACTOR = 0.65;
export const VAR_INFLATION = 0.3;
export const TAIL_PM7 = 1.5;
export const MIN_EV = 0.03;
/** Max spread/total tickets on the live card. Props and parlays are separate. */
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
