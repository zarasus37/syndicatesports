import type { LedgerTicket } from "./types";

/**
 * BETTING RECORD — Track 1 of 2.
 *
 * Closed sides and totals the desk actually stood behind, at the posted price
 * that cleared `MIN_EV` and sized to a non-zero Kelly. Each row is one ticket,
 * with the probability and EV the model held at lock time.
 *
 * Deliberately empty. The record was reset when the scoring model was retuned
 * (variance construction corrected, tail-amplification rule removed, pick
 * ranking changed to pure-EV). Seeded Weeks 1–2 rows were produced by the old
 * engine and are not comparable to anything this build produces, so they are
 * not carried forward. Live weeks append here as each card locks.
 *
 * The sibling track — straight-up winner predictions for every game on the
 * slate — is `WINNER_ARCHIVE` in `winners.ts`. The two are graded and reported
 * separately; neither feeds the other.
 */
export const ARCHIVE: LedgerTicket[] = [];
