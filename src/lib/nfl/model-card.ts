import { ASSUMPTIONS } from "./audit";
import { KELLY_FRACTION, MAX_GAME_UNITS } from "./sizing";
import { MAX_BANKROLL_PCT, MIN_EV } from "./config";

export const MODEL_CARD = {
  version: ASSUMPTIONS.version,
  edge: `Post-vig expected value of at least ${MIN_EV * 100}% at the stored price. A prediction of who wins is not a wager.`,
  inputs: [
    "Public board prices for spread, total, and moneyline when Pinnacle, FanDuel, Bovada, or DraftKings return. Reference is that order. The ticket takes the best American price at the same number.",
    "Seeded Week 3 sheet open, used only as a prior mark — not a book open and not a close",
    "Public tickets / handle split (seeded)",
    "Referee crew tendencies (seeded)",
    "Weather and altitude overlays (seeded)",
    "Injury / out tags the operator toggles",
    "Closed Weeks 1–2 ledger for Bayesian priors",
  ],
  exclusions: [
    "Player props and parlays from a sportsbook",
    "Player-level tracking or snap counts from a vendor",
    "Closing number at kickoff",
    "Other sports",
    "Any ticket sent to a sportsbook",
  ],
  simulation: [
    "Expected scores invert the posted spread and total, so the market sets the level",
    "The engine moves off the line only on information the line could not carry at posting: weather, altitude, officiating crew, slot, and operator-confirmed outs",
    "Money composition adds a fade tilt: tickets lopsided to one side while the handle leans the other. Public money, sharp money and reverse line movement all enter through this term",
    "A reverse line move zeroes the tilt: the line already moved against the crowd, so fading again would count the same move twice",
    "No team-rating term and no raw line-move term. Both are already inside the current price, so re-applying them double-counts. A rating is a z-scored scoring margin built from the same record the spread prices",
    `${ASSUMPTIONS.defaultSims.toLocaleString()} default paths, operator-capped higher`,
    "Cover probability on the spread; totals from the same paths",
    "Props: passing yards ~ normal; sacks ~ Poisson",
    "Parlays: joint from shared paths, with a correlation haircut and same-game ban on 3-leg",
  ],
  sizing: [
    `Full Kelly, then ${KELLY_FRACTION.toFixed(2)}× (half-Kelly)`,
    `Hard cap ${MAX_BANKROLL_PCT * 100}% of bankroll per ticket (3 units at 1u = 1%)`,
    `Per-game cap ${MAX_GAME_UNITS}u; correlated same-game tickets scale down`,
    "Size uses the conservative probability, not the sim point",
  ],
  failures: [
    "Hot streaks inflate a posterior if left uncapped — we do not inflate on a heater",
    "Seeded tape is not CLV versus a real close",
    "Props and model parlays have no live book price, so they are not recommendations",
    "Two weeks is not a season. Calibration vs climate can be negative while hit rate is high",
    "A no-bet run is still a run. Pass is a position",
    "Being market-anchored means the engine does not claim a team is better than the line says. Any edge it reports has to come from weather, crew, slot, or outs — when none of those apply, the honest output is a pass",
    "Settlement is the ESPN scoreboard final for sides and totals. The archive string is not the grade. Props and parlays are not on that feed",
    "Close CLV is the DraftKings close on ESPN when the game is final. The recorded open CLV is not that number, and line plus CLV is not a close",
  ],
} as const;
