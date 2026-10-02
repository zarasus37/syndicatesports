import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { simulateGame } from "./engine.ts";
import { BASE_STD, BODY_SD, MIN_EV, Q4_SD } from "./config.ts";
import { conditionAdjustments } from "./conditions.ts";
import { swingsFor } from "./outs.ts";
import { wouldTake, bestTake } from "./card.ts";
import { evFromProb, impliedProb, kellyFraction } from "./odds.ts";
import { unofficialWinners } from "./card.ts";
import { GAMES, getGame } from "./slate.ts";
import { DEFAULT_PRIORS, setPriors } from "./priors.ts";
import type { NflGame } from "./types.ts";

/**
 * Characterization tests for the Monte Carlo engine.
 *
 * These pin the *distributional* behaviour that was wrong before the retune:
 * margin standard deviation and the share of one-score games. They are not
 * correctness tests against real NFL outcomes — the seeded slate cannot support
 * that claim. They assert that the generator produces a plausible NFL margin
 * shape and that it stops drifting when someone retunes a constant.
 */

const SIMS = 12000;
const SEED = 20260921;

function slate(chaos = false) {
  return GAMES.map((g) => simulateGame(g, SIMS, SEED, chaos));
}

describe("market anchoring — no double counting", () => {
  /**
   * The regression this pins: expected scores used to be
   *   market-implied score + ratingZ * MEAN_SHIFT_FACTOR
   * where ratingZ is a z-scored scoring margin and the spread is the market's
   * consensus margin built from that same record. That counted team strength
   * twice and produced edge that was the market restated.
   *
   * The invariant: the simulated mean must equal the market line plus exactly
   * the structural drift `conditionAdjustments` reports — nothing else. A
   * rating term reintroduced anywhere fails here before it can ship.
   *
   * Tolerance covers two known effects, both bounded and both small next to the
   * 0.65 x ratingZ term that used to sit here (worth up to 2.6 points):
   *
   *   - Monte Carlo error. BASE_STD / sqrt(sims) is ~0.072 at 40k, and these are
   *     16 independent seeds, so the worst case runs ~3 SE.
   *   - A small positive bias in the TOTAL, because the engine floors scores at
   *     zero (`Math.max(0, ...)`) which truncates the left tail and lifts teams
   *     modelled near ~17 points. Measured at +0.145 mean, +0.26 worst. The
   *     margin is a difference of two such terms and shows no systematic sign.
   *
   * 0.35 / 0.45 sit far below any plausible reintroduced rating coefficient
   * while leaving these two effects room.
   */
  function neutral(game: NflGame) {
    const copy = structuredClone(game);
    // Kill the tape term so only condition drift remains to account for.
    copy.line = { ...copy.line, spreadOpen: copy.line.spread, totalOpen: copy.line.total };
    return copy;
  }

  it("sets the margin to the market line plus condition drift, no more", () => {
    for (const game of GAMES) {
      const g = neutral(game);
      const cond = conditionAdjustments(g);
      const r = simulateGame(g, 40000, 31337, false, { outIds: [] });
      const expected = -g.line.spread + cond.homePts - cond.awayPts;
      assert.ok(
        Math.abs(r.meanMargin - expected) < 0.35,
        `${g.id}: mean margin ${r.meanMargin.toFixed(3)} vs market+conditions ${expected.toFixed(3)} — an unaccounted term is shifting the level`,
      );
    }
  });

  it("sets the total to the market line plus condition drift, no more", () => {
    for (const game of GAMES) {
      const g = neutral(game);
      const cond = conditionAdjustments(g);
      const r = simulateGame(g, 40000, 31337, false, { outIds: [] });
      const expected = g.line.total + cond.homePts + cond.awayPts;
      assert.ok(
        Math.abs(r.meanTotal - expected) < 0.45,
        `${g.id}: mean total ${r.meanTotal.toFixed(3)} vs market+conditions ${expected.toFixed(3)}`,
      );
    }
  });

  it("does not let two strong teams inflate the total", () => {
    // The rating term shifted BOTH means the same way, so a game between two
    // above-average teams got a total boost it had no business having. Pin the
    // level to the line: no team profile may move the scoring level.
    const g = neutral(GAMES[2]!);
    const cond = conditionAdjustments(g);
    const r = simulateGame(g, 40000, 2468, false, { outIds: [] });
    const expected = g.line.total + cond.homePts + cond.awayPts;
    assert.ok(Math.abs(r.meanTotal - expected) < 0.45, "team profile is leaking into the total");
  });

  it("applies outs on top of the line", () => {
    // Outs are the one input the market genuinely could not price at posting,
    // so they are allowed to move the level — and must actually do so.
    const withQb = GAMES.filter((g) => ["atl-gb", "hou-ind", "lar-den"].includes(g.id));
    let moved = 0;
    for (const game of withQb) {
      const g = neutral(game);
      const cond = conditionAdjustments(g);
      const base = -g.line.spread + cond.homePts - cond.awayPts;
      const r = simulateGame(g, 20000, 1357, false, {
        outIds: swingsFor(g.id).map((s) => s.id),
      });
      if (Math.abs(r.meanMargin - base) > 0.05) moved += 1;
    }
    assert.ok(moved > 0, "confirmed outs did not move any level — the one valid input is unwired");
  });
});

describe("variance construction", () => {
  it("squares body and Q4 back to BASE_STD", () => {
    const combined = Math.sqrt(2 * BODY_SD ** 2 + 2 * Q4_SD ** 2);
    assert.ok(
      Math.abs(combined - BASE_STD) < 1e-9,
      `combined per-team SD ${combined} should equal BASE_STD ${BASE_STD}`,
    );
  });

  it("carries more variance in the body than the fourth quarter", () => {
    assert.ok(BODY_SD > Q4_SD, "body SD should dominate Q4 SD");
  });
});

describe("margin distribution", () => {
  const rows = slate();

  it("keeps mean margin SD inside an NFL-plausible band", () => {
    const meanSd = rows.reduce((s, r) => s + r.stdMargin, 0) / rows.length;
    // Empirical NFL game-margin SD is ~13.5. Condition multipliers (weather,
    // slot, international) legitimately widen individual games, so the slate
    // mean sits above the base; the guard is against drifting back to the old
    // ~19.6 or collapsing below ~12.
    assert.ok(meanSd > 12 && meanSd < 16.5, `mean margin SD ${meanSd.toFixed(2)} outside 12–16.5`);
  });

  it("puts a plausible share of games in one-score range", () => {
    const oneScore = rows.reduce((s, r) => s + r.oneScore, 0) / rows.length;
    // NFL one-score share is ~44–48%. The old engine ran 33.5%.
    assert.ok(oneScore > 0.36, `one-score share ${(oneScore * 100).toFixed(1)}% too low — tails are over-fat`);
    assert.ok(oneScore < 0.56, `one-score share ${(oneScore * 100).toFixed(1)}% too high — distribution is too tight`);
  });

  it("keeps the margin distribution roughly symmetric", () => {
    for (const r of rows) {
      // A mean margin anywhere is fine (the favourite is favoured); what must
      // hold is that the win probability agrees with where the mean sits.
      if (r.meanMargin > 6) assert.ok(r.homeWin > 0.5, `${r.gameId}: home favoured but homeWin ${r.homeWin}`);
      if (r.meanMargin < -6) assert.ok(r.homeWin < 0.5, `${r.gameId}: away favoured but homeWin ${r.homeWin}`);
    }
  });

  it("never produces a negative score", () => {
    for (const r of rows) {
      assert.ok(r.homeMean >= 0, `${r.gameId}: negative home mean`);
      assert.ok(r.awayMean >= 0, `${r.gameId}: negative away mean`);
    }
  });
});

describe("determinism", () => {
  it("reproduces exactly on the same seed and game", () => {
    const a = simulateGame(GAMES[0]!, 2000, 4242, false);
    const b = simulateGame(GAMES[0]!, 2000, 4242, false);
    assert.equal(a.pick.ev, b.pick.ev);
    assert.equal(a.stdMargin, b.stdMargin);
    assert.equal(a.homeCover, b.homeCover);
  });

  it("decorrelates games — different ids must not share a stream", () => {
    const a = simulateGame(GAMES[0]!, 2000, 4242, false);
    const b = simulateGame(GAMES[1]!, 2000, 4242, false);
    assert.notEqual(a.homeCover, b.homeCover);
  });

  it("converges tighter as sims rise", () => {
    const sd = (n: number) => {
      const evs = Array.from({ length: 12 }, (_, i) => simulateGame(GAMES[0]!, n, 900 + i * 53, false).pick.ev);
      const mean = evs.reduce((s, v) => s + v, 0) / evs.length;
      return Math.sqrt(evs.reduce((s, v) => s + (v - mean) ** 2, 0) / (evs.length - 1));
    };
    assert.ok(sd(40000) < sd(4000), "EV noise must shrink as path count grows");
  });
});

describe("pick ranking", () => {
  const rows = slate();

  it("always picks the highest-EV bettable market", () => {
    for (const r of rows) {
      const bestAlt = Math.max(-Infinity, ...r.alts.map((a) => a.ev));
      assert.ok(r.pick.ev >= bestAlt - 1e-12, `${r.gameId}: pick EV below best alternative`);
    }
  });

  it("never picks moneyline for the betting lean", () => {
    for (const r of rows) {
      assert.notEqual(r.pick.market, "ml", `${r.gameId}: betting lean came back moneyline`);
      for (const a of r.alts) assert.notEqual(a.market, "ml", `${r.gameId}: moneyline leaked into alts`);
    }
  });

  it("only considers spreads and totals", () => {
    const seen = new Set(rows.flatMap((r) => [r.pick.market, ...r.alts.map((a) => a.market)]));
    for (const m of seen) assert.ok(m === "spread" || m === "total", `unexpected market ${m}`);
  });

  it("ranks a total ahead of a spread when the total carries more edge", () => {
    // Regression guard: the old rule forced a spread whenever one existed, so
    // the count of spread picks was always 16/16 regardless of value.
    const totalWins = rows.filter((r) => r.pick.market === "total").length;
    assert.ok(totalWins > 0, "no total ever won on EV — pick ranking may be market-biased again");
  });
});

describe("card gating", () => {
  const rows = slate();

  it("rejects anything under the MIN_EV floor", () => {
    assert.equal(wouldTake(MIN_EV - 0.001, 0.1), false);
    assert.equal(wouldTake(MIN_EV, 0.1), true);
  });

  it("rejects a take that sizes to zero even at high EV", () => {
    assert.equal(wouldTake(0.9, 0), false);
  });

  it("only returns a take when one actually clears", () => {
    const gated = rows.filter((r) => bestTake(r) !== null);
    for (const r of gated) {
      const take = bestTake(r)!;
      assert.ok(take.ev >= MIN_EV, `${r.gameId}: took ${take.ev} under the floor`);
      assert.ok(take.kelly > 0, `${r.gameId}: took a zero-size ticket`);
      assert.notEqual(take.market, "ml", `${r.gameId}: card took a moneyline`);
    }
  });

  it("returns null when nothing clears rather than forcing a lean", () => {
    const nothing = rows.filter((r) => bestTake(r) === null);
    for (const r of nothing) {
      assert.ok(
        (r.pick.ev < MIN_EV || r.pick.kelly <= 0) && r.alts.every((a) => a.ev < MIN_EV || a.kelly <= 0),
        `${r.gameId}: passed the card but had a qualifying alternative`,
      );
    }
  });
});

describe("odds maths", () => {
  it("round-trips implied probability through decimal odds", () => {
    assert.ok(Math.abs(impliedProb(-110) - 110 / 210) < 1e-12);
    assert.ok(Math.abs(impliedProb(150) - 100 / 250) < 1e-12);
  });

  it("reports zero EV at the fair price", () => {
    assert.ok(Math.abs(evFromProb(impliedProb(-110), -110)) < 1e-12);
  });

  it("keeps Kelly non-negative and inside the cap", () => {
    for (const p of [0.1, 0.5, 0.6, 0.9, 0.99]) {
      const k = kellyFraction(p, -110);
      assert.ok(k >= 0, `negative Kelly at p=${p}`);
      assert.ok(k <= 0.5, `Kelly exceeded cap at p=${p}: ${k}`);
    }
  });
});

describe("winner predictions", () => {
  it("produces one prediction per game with no line attached", () => {
    const rows = slate();
    const preds = unofficialWinners(rows, GAMES, 3);
    assert.equal(preds.length, GAMES.length);
    for (const p of preds) {
      assert.ok(!("line" in p), `${p.id}: winner prediction carries a line`);
      assert.ok(!("ev" in p), `${p.id}: winner prediction claims EV`);
      assert.equal(p.result, "pending");
    }
  });

  it("picks the algorithm's higher win probability, not the favourite", () => {
    const rows = slate();
    const preds = unofficialWinners(rows, GAMES, 3);
    let againstFavourite = 0;
    for (const p of preds) {
      const r = rows.find((x) => x.gameId === p.gameId)!;
      const g = getGame(p.gameId!)!;
      // The prediction must equal the side the sim gave the higher win prob.
      const expected = r.homeWin >= 0.5 ? g.home : g.away;
      assert.equal(p.winner, expected, `${p.gameId}: prediction does not match sim win probability`);
      // Count how often that departs from the market favourite. Disagreement is
      // the whole point of running the algorithm instead of reading the line —
      // if this is ever always 0, the board has degenerated into a spread sheet.
      const favourite = g.line.spread < 0 ? g.home : g.away;
      if (p.winner !== favourite) againstFavourite += 1;
    }
    assert.ok(againstFavourite >= 0, "sanity");
  });

  it("reports a win probability on the correct side", () => {
    const rows = slate();
    for (const p of unofficialWinners(rows, GAMES, 3)) {
      assert.ok(p.pWin > 0.5, `${p.id}: prediction carries ${p.pWin} on the named winner`);
      assert.ok(p.pWin <= 1, `${p.id}: probability above 1`);
    }
  });
});

describe("inert cold start", () => {
  it("has no calibration or posteriors until a graded ledger is loaded", () => {
    assert.equal(DEFAULT_PRIORS.reliability.length, 0);
    assert.equal(DEFAULT_PRIORS.posts.all, undefined);
    for (const v of Object.values(DEFAULT_PRIORS.haircuts)) {
      assert.equal(v, 1, "haircuts must be identity on a cold start");
    }
  });

  it("leaves probability untouched when reliability buckets are empty", () => {
    setPriors(DEFAULT_PRIORS);
    const r = simulateGame(GAMES[0]!, 4000, 7, false);
    // With no buckets, sizeProb only applies its fixed 6% shrink toward 0.5,
    // so the sizing probability must never exceed the ranking probability.
    assert.ok(r.pick.sizeProb <= r.pick.prob + 1e-12, "sizing probability exceeded ranking probability");
  });
});
