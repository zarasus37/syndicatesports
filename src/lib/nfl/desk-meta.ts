import { ARCHIVE } from "./history";
import { WEEK } from "./slate";

export const DESK_ENV = "sandbox" as const;
export const MODEL_VERSION = "2026.w3.beta.1";
export const ODDS_SOURCE = "Seeded Week 3 sheet — not a live book";
export const DATA_SOURCE = "generated";
export const PRODUCTION = "not connected";
export const MARKET_AS_OF = "2026-09-22T12:00:00-05:00";

export function gradedArchiveN() {
  return ARCHIVE.filter((t) => t.result === "win" || t.result === "loss").length;
}

export function archiveWeeks() {
  return [...new Set(ARCHIVE.map((t) => t.week))].sort((a, b) => a - b);
}

export function evidenceCopy() {
  const n = gradedArchiveN();
  const weeks = archiveWeeks();
  return {
    sample: `${n} graded tickets · ${weeks.length} week${weeks.length === 1 ? "" : "s"}`,
    maturity: "Preliminary — too small for a stable ROI",
    validation: "CLV vs the open, calibration, out-of-sample. Kickoff close is not live yet.",
    units: "Realized units are high-variance. Do not extrapolate.",
    week: WEEK,
  };
}
