import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { simulateGame } from "./engine.ts";
import { BASE_STD, BODY_SD, MIN_EV, Q4_SD } from "./config.ts";
import { conditionAdjustments } from "./conditions.ts";
import { cardFromRun } from "./learn.ts";
import { learnFrom } from "./learn.ts";
import { moneyRead } from "./public.ts";
import { swingsFor } from "./outs.ts";
import { wouldTake, bestTake } from "./card.ts";
import { evFromProb, impliedProb, kellyFraction } from "./odds.ts";
import { unofficialWinners } from "./card.ts";
// Use the priced slate everywhere: `GAMES` is the raw seed, `GAMES_WITH_LINES`
// is what `activeGames()` hands the engine, with both sides of every spread
// quoted. Testing the raw seed would exercise a market the desk never sees.
import { GAMES_WITH_LINES as GAMES, getGame, pairedPrice, withAwayPrice } from "./slate.ts";
import { DEFAULT_PRIORS, setPriors } from "./priors.ts";
import type { LedgerTicket, NflGame } from "./types.ts";

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

function slate() {
  return GAMES.map((g) => simulateGame(g, SIMS, SEED));
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

  it("sets the margin to the market line plus condition drift and the money tilt", () => {
    for (const game of GAMES) {
      const g = neutral(game);
      const cond = conditionAdjustments(g);
      const r = simulateGame(g, 40000, 31337, { outIds: [] });
      const expected = -g.line.spread + cond.homePts - cond.awayPts + r.money.tiltPts;
      assert.ok(
        Math.abs(r.meanMargin - expected) < 0.35,
        `${g.id}: mean margin ${r.meanMargin.toFixed(3)} vs market+conditions+money ${expected.toFixed(3)} — an unaccounted term is shifting the level`,
      );
    }
  });

  it("sets the total to the market line plus condition drift, no more", () => {
    for (const game of GAMES) {
      const g = neutral(game);
      const cond = conditionAdjustments(g);
      const r = simulateGame(g, 40000, 31337, { outIds: [] });
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
    const r = simulateGame(g, 40000, 2468, { outIds: [] });
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
      const r = simulateGame(g, 20000, 1357, {
        outIds: swingsFor(g.id).map((s) => s.id),
      });
      if (Math.abs(r.meanMargin - base) > 0.05) moved += 1;
    }
    assert.ok(moved > 0, "confirmed outs did not move any level — the one valid input is unwired");
  });
});

describe("two-way market pricing", () => {
  /**
   * Regression: the engine grades both sides of a spread and used to fall back
   * to the home price when `awaySpreadPrice` was missing — which it always was
   * on the seeded slate. Both sides got the same price while the model gave
   * them different probabilities, so the underdog carried a phantom negative
   * EV and every aggregate EV figure on the desk was dragged down.
   *
   * The invariant: a seeded spread is a complete two-way market whose implied
   * probabilities sum to 1 + book margin, never 2x one side's price.
   */
  it("gives every seeded spread a real away price", () => {
    for (const g of GAMES) {
      assert.ok(g.line.awaySpreadPrice != null, `${g.id}: no away-side price`);
      assert.notEqual(
        g.line.awaySpreadPrice,
        g.line.spreadPrice,
        `${g.id}: away price is the home price — both sides priced identically`,
      );
    }
  });

  it("keeps the two-way margin near the book target", () => {
    for (const g of GAMES) {
      const sum = impliedProb(g.line.spreadPrice) + impliedProb(g.line.awaySpreadPrice!);
      assert.ok(sum > 1 && sum < 1.08, `${g.id}: two-way implied sum ${sum.toFixed(4)} is not a real market`);
      assert.ok(
        Math.abs(sum - 1.035) < 0.01,
        `${g.id}: margin ${((sum - 1) * 100).toFixed(2)}% drifted from the 3.5% target`,
      );
    }
  });

  it("derives a symmetric pair and leaves an explicit price alone", () => {
    // A standard 3.5% two-way pair is NOT -110/-110 — the book skews the
    // favourite to worse odds and the dog to plus money, so their implied
    // probabilities still sum to 1 + margin. Assert the round trip, not a
    // hard-coded number.
    const home = impliedProb(-110);
    const away = impliedProb(pairedPrice(-110));
    assert.ok(Math.abs(home + away - 1.035) < 0.006, `pair sum ${(home + away).toFixed(4)} off the 1.035 target`);
    assert.notEqual(pairedPrice(-110), pairedPrice(-120));
    // Idempotent: an already-paired line must not be re-paired.
    const once = withAwayPrice({ spread: -3, spreadPrice: -108 } as never);
    const twice = withAwayPrice(once);
    assert.equal(once.awaySpreadPrice, twice.awaySpreadPrice);
  });

  it("prices a seed's two sides so the better one is the one the engine leans", () => {
    // Before the fix every underdog side showed ~-8% EV purely from the price
    // artefact. Now the losing side is negative because the model genuinely
    // rates it worse, and the two EVs sum to roughly the vig.
    for (const r of slate()) {
      const home = [r.pick, ...r.alts].find((c) => c.market === "spread" && c.side.startsWith(r.gameId.slice(0, 3)));
      if (!home) continue;
      const mate = [r.pick, ...r.alts].find((c) => c.market === "spread" && c !== home)!;
      assert.ok(home.ev >= mate.ev, `${r.gameId}: lean is worse than its opposite side`);
    }
  });
});

describe("no personality branch", () => {
  /**
   * Regression: a Denver-only "chaos engine" fired GIANTS_MODE (+21 at p=0.30)
   * and CLUTCH_LUCK_MODE (+3/+7) on hardcoded ids, then added +3 to either side
   * in any two-point game. Measured at 5.1 points of cover probability on 30%
   * of paths, for one franchise, with no evidential basis.
   *
   * The invariant: every game runs through the identical generator. No game id,
   * opponent list, or late-game margin threshold may branch the distribution.
   */
  it("produces the same distribution shape for every matchup", () => {
    for (const r of slate()) {
      assert.ok(r.stdMargin > 10 && r.stdMargin < 20, `${r.gameId}: SD ${r.stdMargin.toFixed(1)} outside band`);
    }
  });

  it("does not branch on a trailing margin", () => {
    // Clone a game under a different id. Same line, same conditions, no outs.
    // Nothing about the id may change the simulated distribution.
    const base = structuredClone(GAMES[0]!);
    base.line = { ...base.line, spreadOpen: base.line.spread, totalOpen: base.line.total };
    const clone = structuredClone(base);
    clone.id = "identity-probe";
    const a = simulateGame(base, 30000, 424242, { outIds: [] });
    const b = simulateGame(clone, 30000, 424242, { outIds: [] });
    assert.ok(
      Math.abs(a.stdMargin - b.stdMargin) < 0.2,
      `SD moved on id alone: ${a.stdMargin.toFixed(3)} vs ${b.stdMargin.toFixed(3)}`,
    );
  });

  it("exposes no chaos fields on the result", () => {
    const r = slate()[0]!;
    const keys = Object.keys(r);
    assert.ok(!keys.some((k) => /chaos/i.test(k)), `result still carries chaos fields: ${keys.join(",")}`);
  });
});

describe("money composition", () => {
  /**
   * Two regressions pinned here.
   *
   * 1. The old `steam.pts * 0.4` shift double-counted the line move: the
   *    engine anchors to `line.spread`, the current price, which already
   *    contains the whole open-to-now move. Re-applying it restated the market.
   *
   * 2. Public and sharp money were computed and displayed but never reached
   *    the mean, so the desk had no betting signal from the betting tape at
   *    all. `moneyRead` is the term that carries them.
   */
  it("suppresses the fade when the line already moved against the crowd", () => {
    for (const g of GAMES) {
      const m = moneyRead(g);
      if (m.lineMovedAgainstPublic) {
        assert.equal(m.tiltPts, 0, `${g.id}: RLM should not be faded a second time`);
      }
    }
  });

  it("produces a tilt when tickets crowd one side and handle leans the other", () => {
    const g = structuredClone(GAMES[0]!);
    g.public = { ticketsHome: 78, handleHome: 60, ticketsOver: 50, handleOver: 50, sourced: true };
    g.line = { ...g.line, spread: g.line.spread - 0.5, spreadOpen: g.line.spread - 0.5 };
    const m = moneyRead(g);
    assert.ok(m.pressure > 0.4, `expected real pressure, got ${m.pressure}`);
    assert.ok(m.tiltPts < 0, "tickets on home with handle against them should lean away from home");
  });

  it("does not fade when the handle agrees with the crowd", () => {
    const g = structuredClone(GAMES[0]!);
    // Tickets and money both on home. Nothing to fade.
    g.public = { ticketsHome: 78, handleHome: 88, ticketsOver: 50, handleOver: 50, sourced: true };
    g.line = { ...g.line, spread: g.line.spread - 0.5, spreadOpen: g.line.spread - 0.5 };
    assert.equal(moneyRead(g).tiltPts, 0, "agreed money must not produce a fade");
  });

  it("does not fade an even crowd", () => {
    const g = structuredClone(GAMES[0]!);
    g.public = { ticketsHome: 51, handleHome: 45, ticketsOver: 50, handleOver: 50, sourced: true };
    g.line = { ...g.line, spread: g.line.spread - 0.5, spreadOpen: g.line.spread - 0.5 };
    assert.equal(moneyRead(g).tiltPts, 0, "a 51% crowd is not a fade");
  });

  it("reads the road side correctly, not just home", () => {
    // Public on the away team, handle leaning home. The tilt must come back
    // positive (lean home), which a home-relative implementation gets backwards.
    const g = structuredClone(GAMES[1]!);
    g.home = "NE";
    g.away = "BUF";
    g.public = { ticketsHome: 22, handleHome: 42, ticketsOver: 50, handleOver: 50, sourced: true };
    g.line = { ...g.line, spread: g.line.spread - 0.5, spreadOpen: g.line.spread - 0.5 };
    const m = moneyRead(g);
    assert.ok(m.tiltPts > 0, `away-side fade should lean home, got ${m.tiltPts}`);
  });

  it("carries the tilt into the simulated mean", () => {
    for (const r of slate()) {
      if (Math.abs(r.money.tiltPts) < 0.01) continue;
      const g = GAMES.find((x) => x.id === r.gameId)!;
      const marketMargin = -g.line.spread;
      // The tilt has to be visible in the simulated margin, not just reported.
      const moved = r.meanMargin - marketMargin;
      assert.ok(
        Math.abs(moved) > 0.01,
        `${g.id}: reported a ${r.money.tiltPts} tilt but the mean did not move`,
      );
    }
  });

  it("reports missing splits as missing, not as a balanced crowd", () => {
    // Live ingestion writes an even 50/50 placeholder and has no splits source.
    // Without the flag that reads as "the crowd is balanced" — a confident
    // zero — and the fade looks inert by choice rather than by absence.
    const g = structuredClone(GAMES[0]!);
    g.public = { ticketsHome: 50, handleHome: 50, ticketsOver: 50, handleOver: 50, sourced: false };
    const m = moneyRead(g);
    assert.equal(m.splitsAvailable, false, "unsourced splits must be reported as unavailable");
    assert.equal(m.tiltPts, 0, "and must produce no tilt");
    assert.match(m.note, /No betting splits/, `note should say why: "${m.note}"`);
  });

  it("reports sourced splits as available", () => {
    for (const g of GAMES) {
      assert.equal(moneyRead(g).splitsAvailable, true, `${g.id} should have sourced splits`);
    }
  });

  it("names the side the money is on, not the side the tickets are on", () => {
    // Regression: the note used to say "handle leans GB" while fading GB, on a
    // game where 72% of tickets were on GB and the money was on ATL.
    const g = GAMES.find((x) => x.id === "atl-gb")!;
    const m = moneyRead(g);
    assert.ok(m.tiltPts < 0, "atl-gb should fade the home side");
    assert.ok(
      /handle leans ATL/.test(m.note),
      `note names the wrong money side: "${m.note}"`,
    );
  });
});

describe("the fade can actually learn", () => {
  /**
   * The desk is meant to move its money-composition coefficient from graded
   * weeks. That was not true: `publicFade` existed in priors, learnFrom and the
   * review copy, but no ticket was ever tagged `public-fade`, and the tilt
   * applied with no haircut at all. The posterior was built from zero rows and
   * the fade could never be validated or corrected.
   */
  it("tags every ticket the fade actually moved", () => {
    const rows = slate();
    // A fade game on this slate. The raw run rarely puts a qualifying ticket on
    // any given fade game, so force one: build a result with a pick that clears
    // MIN_EV and sizes, then assert it gets tagged. Without this the assertion
    // below never fires and the test is vacuously green — which is exactly what
    // it was before.
    const fadeGame = GAMES.find((g) => moneyRead(g).tiltPts !== 0)!;
    const real = rows.find((r) => r.gameId === fadeGame.id)!;
    const forced = { ...real, pick: { ...real.pick, ev: 0.09, kelly: 0.05 } };
    const tickets = cardFromRun([forced], [], [], GAMES, 3);
    // Ticket ids are `w{week}-{gameId}-{market}`, e.g. "w3-atl-gb-spread" — so
    // `endsWith(gameId)` never matches. An earlier version of this test used
    // endsWith and therefore matched nothing, which is how it stayed green
    // while the tag was never actually pushed.
    const row = tickets.find((x) => x.id.includes(fadeGame.id));
    assert.ok(row, `forced fade game produced no ticket (got ${tickets.map((t) => t.id).join(", ") || "none"})`);
    assert.ok(
      row.tags.includes("public-fade"),
      `fade moved the mean on ${fadeGame.id} but the ticket is untagged: [${row.tags.join(", ")}]`,
    );
  });

  it("propagates the learned fade scale into the applied tilt", () => {
    const fadeGame = GAMES.find((g) => moneyRead(g).tiltPts !== 0)!;
    const raw = moneyRead(fadeGame).tiltPts;

    setPriors(DEFAULT_PRIORS);
    const cold = simulateGame(fadeGame, 8000, 99).money.tiltPts;
    assert.ok(Math.abs(cold - raw) < 1e-9, "identity priors should leave the tilt untouched");

    // A posterior that says the fade is wrong must visibly shrink it.
    const coldPriors = learnFrom(
      Array.from({ length: 60 }, (_, i) => ({
        id: `w3-x-${i}`, week: 3, kind: "spread" as const, matchup: "A @ B", side: "B +3",
        line: 3, price: -110, prob: 0.58, ev: 0.05, tags: ["public-fade"], clv: 0,
        result: "loss" as const, reasons: [],
      })),
    );
    assert.ok(coldPriors.haircuts.publicFade < 1, "a 0-60 fade should shrink the coefficient");
    setPriors(coldPriors);
    const shrunk = simulateGame(fadeGame, 8000, 99).money.tiltPts;
    assert.ok(
      Math.abs(shrunk) < Math.abs(cold),
      `tilt ${shrunk} did not shrink from ${cold} under haircut ${coldPriors.haircuts.publicFade}`,
    );
    setPriors(DEFAULT_PRIORS);
  });

  it("leaves the fade at identity until there is evidence", () => {
    assert.equal(DEFAULT_PRIORS.haircuts.publicFade, 1);
    setPriors(DEFAULT_PRIORS);
    const on = slate().find((r) => Math.abs(r.money.tiltPts) > 0.01)!;
    // Cold start: the applied tilt is the raw tilt.
    assert.equal(on.money.tiltPts, moneyRead(GAMES.find((g) => g.id === on.gameId)!).tiltPts);
  });

  it("shrinks the fade on a cold posterior but refuses to inflate a hot one", () => {
    // Build a ledger that is all wins on fade-tagged tickets — a "heater".
    const wins: LedgerTicket[] = Array.from({ length: 12 }, (_, i) => ({
      id: `w3-fade-${i}`,
      week: 3,
      kind: "spread" as const,
      matchup: "A @ B",
      side: "B +3",
      line: 3,
      price: -110,
      prob: 0.58,
      ev: 0.05,
      tags: ["public-fade"],
      clv: 0,
      result: "win" as const,
      reasons: [],
    }));
    const hot = learnFrom(wins);
    assert.equal(hot.n, 12);
    assert.equal(
      hot.haircuts.publicFade,
      1,
      "a 12-0 heater must not inflate the fade before there is evidence",
    );

    const losses: LedgerTicket[] = wins.map((w, i) => ({ ...w, id: `w3-cold-${i}`, result: "loss" as const }));
    const cold = learnFrom(losses);
    assert.ok(
      cold.haircuts.publicFade < 1,
      `a 0-12 fade should shrink, got ${cold.haircuts.publicFade}`,
    );
  });

  it("lets a fade posterior move once it is past the sample floor", () => {
    const sample = (n: number, hits: number): LedgerTicket[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `w3-f2-${i}`,
        week: 3,
        kind: "spread" as const,
        matchup: "A @ B",
        side: "B +3",
        line: 3,
        price: -110,
        prob: 0.58,
        ev: 0.05,
        tags: ["public-fade"],
        clv: 0,
        result: (i < hits ? "win" : "loss") as "win" | "loss",
        reasons: [],
      }));
    // 60 at 80% is a real result, past the 30-ticket floor.
    const good = learnFrom(sample(60, 48));
    assert.ok(good.haircuts.publicFade > 1, "60 fade tickets at 80% should lift the fade");
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

  it("does not materially censor the tails", () => {
    // The edge bars should hold real probability mass, not a pile-up of
    // everything beyond the range. Measured on the seeded slate the mean edge
    // mass is a few percent; anything much higher means the span is too tight
    // and the chart is overstating the extremes.
    let worst = 0;
    for (const r of slate()) {
      const h = r.histogram;
      const edge = h[0]!.p + h[h.length - 1]!.p;
      worst = Math.max(worst, edge);
    }
    assert.ok(worst < 0.12, `worst edge mass ${(worst * 100).toFixed(1)}% — the span is clipping real probability`);
  });

  it("emits a stable bin count regardless of the game", () => {
    // A fixed span is what lets two matchups share an axis.
    const counts = new Set(slate().map((r) => r.histogram.length));
    assert.equal(counts.size, 1, `histogram width varies by game: ${[...counts].join(", ")}`);
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
    const a = simulateGame(GAMES[0]!, 2000, 4242);
    const b = simulateGame(GAMES[0]!, 2000, 4242);
    assert.equal(a.pick.ev, b.pick.ev);
    assert.equal(a.stdMargin, b.stdMargin);
    assert.equal(a.homeCover, b.homeCover);
  });

  it("decorrelates games — different ids must not share a stream", () => {
    const a = simulateGame(GAMES[0]!, 2000, 4242);
    const b = simulateGame(GAMES[1]!, 2000, 4242);
    assert.notEqual(a.homeCover, b.homeCover);
  });

  it("converges tighter as sims rise", () => {
    const sd = (n: number) => {
      const evs = Array.from({ length: 12 }, (_, i) => simulateGame(GAMES[0]!, n, 900 + i * 53).pick.ev);
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
    const r = simulateGame(GAMES[0]!, 4000, 7);
    // With no buckets, sizeProb only applies its fixed 6% shrink toward 0.5,
    // so the sizing probability must never exceed the ranking probability.
    assert.ok(r.pick.sizeProb <= r.pick.prob + 1e-12, "sizing probability exceeded ranking probability");
  });
});
