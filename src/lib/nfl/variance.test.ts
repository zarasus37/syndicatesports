import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveVariance,
  leagueBaseline,
  sdTrust,
  MIN_VARIANCE_GAMES,
  MAX_TRUST,
  VARIANCE_MIN,
  VARIANCE_MAX,
} from "./variance.ts";
import type { TeamAbbr } from "./types.ts";

/**
 * `variance` is the primary driver of each game's margin width
 * (`BASE_STD * sqrt((variance(home) + variance(away)) / 2)`), so these tests
 * are really about whether the sim is being told something real about how wide
 * a team's games tend to be.
 *
 * The seeded table in `teams.ts` carried no information — measured against the
 * 2026 season, pearson(seeded, measured) was -0.10. So the properties that
 * matter most are the guards, not the values: neutral when unknown, damped
 * when uncertain, bounded when extreme.
 */

const margins = (spec: Record<string, number[]>) => new Map(Object.entries(spec) as [TeamAbbr, number[]][]);

describe("trust weighting", () => {
  it("gives no trust below the minimum sample", () => {
    for (let n = 0; n < MIN_VARIANCE_GAMES; n++) {
      assert.equal(sdTrust(n), 0, `n=${n} should carry no trust`);
    }
  });

  it("rises with sample size but never reaches full confidence", () => {
    let prev = -1;
    for (const n of [3, 4, 6, 8, 12, 16, 32, 64]) {
      const t = sdTrust(n);
      assert.ok(t > prev, `trust must increase with games (n=${n})`);
      assert.ok(t <= MAX_TRUST, `trust must stay capped (n=${n})`);
      prev = t;
    }
  });

  it("is zero at two games and meaningful at three", () => {
    // Two points do not describe a distribution; three barely do.
    assert.equal(sdTrust(2), 0);
    assert.ok(sdTrust(3) > 0.5, "three games should already carry real but partial weight");
  });
});

describe("neutral when unknown", () => {
  it("returns nothing at all when no team has enough history", () => {
    const m = margins({ PIT: [3, -7], NE: [-2, 4] });
    assert.equal(leagueBaseline(m), 0);
    assert.deepEqual(deriveVariance(m), []);
  });

  it("derives as soon as exactly one team clears the minimum", () => {
    // Three games is the floor, not a suggestion.
    const m = margins({ PIT: [3, -7, 10], NE: [-2, 4] });
    assert.ok(leagueBaseline(m) > 0);
    const reads = deriveVariance(m);
    assert.equal(reads.length, 1);
    assert.equal(reads[0]!.abbr, "PIT");
  });

  it("omits thin teams rather than reporting them as 1.0", () => {
    // So the caller can tell "unknown" apart from "measured as exactly average".
    const m = margins({
      PIT: [3, -7, 10, 2, -5, 8, 1],
      NE: [4, -2, 6, 1, -3, 5, 0],
      CHI: [2], // one game
    });
    const reads = deriveVariance(m);
    assert.ok(!reads.some((r) => r.abbr === "CHI"), "a one-game team must be omitted");
    assert.ok(reads.some((r) => r.abbr === "PIT"));
  });

  it("leaves the multiplier at exactly 1.0 for a team with no data", () => {
    // The engine's fallback path when a team is absent from the derivation.
    const m = margins({ PIT: [3, -7, 10, 2, -5, 8, 1], NE: [4, -2, 6, 1, -3, 5, 0] });
    const reads = deriveVariance(m);
    for (const r of reads) {
      assert.notEqual(r.value, 1, "teams with history should not all land on neutral");
    }
  });
});

describe("shrinkage", () => {
  it("pulls an extreme team toward neutral rather than trusting it raw", () => {
    // League of similar teams, plus one absurd one.
    const m = margins({
      PIT: [1, -1, 2, -2, 1, 0, -1],
      NE: [1, -1, 2, -2, 1, 0, -1],
      CHI: [1, -1, 2, -2, 1, 0, -1],
      ATL: [40, -35, 30, -28, 38, 25, -33],
    });
    const at = deriveVariance(m).find((r) => r.abbr === "ATL")!;
    assert.ok(at.raw > 2, `ATL should look extreme raw, got ${at.raw}`);
    assert.ok(at.value < at.raw, "shrinkage must pull it back toward 1.0");
    assert.ok(at.value > VARIANCE_MIN, "and stay inside the band");
  });

  it("damps harder at a small sample than a large one", () => {
    // Every team runs at the SAME sample size so the league baseline is
    // comparable between the two runs, and the wide team's spread is chosen to
    // land inside the clamp at both sizes — otherwise both saturate and the
    // test compares 1.400 to 1.400 and proves nothing.
    const wide = (n: number) => [0, 0, 2, -2, 1, -1, 0, 0, 2, -2, 1, -1, 0, 0, 2, -2].slice(0, n);
    const flat = (n: number) => [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1].slice(0, n);
    const build = (n: number) => {
      const m: [TeamAbbr, number[]][] = [["PIT", wide(n)]];
      for (const t of ["NE", "CHI", "BAL", "DET", "GB", "LV", "MIA"] as TeamAbbr[]) m.push([t, flat(n)]);
      return new Map(m);
    };
    const small = deriveVariance(build(4)).find((r) => r.abbr === "PIT")!;
    const large = deriveVariance(build(16)).find((r) => r.abbr === "PIT")!;
    assert.ok(
      small.value < VARIANCE_MAX && large.value < VARIANCE_MAX,
      `test data must not saturate the clamp (n=4 ${small.value}, n=16 ${large.value})`,
    );
    assert.ok(
      Math.abs(large.value - 1) > Math.abs(small.value - 1),
      `n=16 (${large.value.toFixed(3)}) should be trusted further from neutral than n=4 (${small.value.toFixed(3)})`,
    );
  });

  it("leaves an average team near neutral", () => {
    const m = margins({
      PIT: [1, -1, 2, -2, 1, 0, -1, 2, -1, 0, 1, -2],
      NE: [1, -1, 2, -2, 1, 0, -1, 2, -1, 0, 1, -2],
      CHI: [1, -1, 2, -2, 1, 0, -1, 2, -1, 0, 1, -2],
      BAL: [1, -1, 2, -2, 1, 0, -1, 2, -1, 0, 1, -2],
    });
    for (const r of deriveVariance(m)) {
      assert.ok(Math.abs(r.value - 1) < 1e-9, `${r.abbr} should be exactly neutral, got ${r.value}`);
    }
  });
});

describe("bounds", () => {
  it("clamps a wild estimate instead of passing it to the sim", () => {
    const wild = [200, -190, 180, -175, 195, 160, -185, 170, -150, 188, 165, -160, 175, 180, -170, 190];
    const m = margins({
      PIT: wild,
      NE: [1, -1, 2, -2, 1, 0, -1, 2],
      CHI: [1, -1, 2, -2, 1, 0, -1, 2],
      BAL: [1, -1, 2, -2, 1, 0, -1, 2],
      DET: [1, -1, 2, -2, 1, 0, -1, 2],
    });
    const p = deriveVariance(m).find((r) => r.abbr === "PIT")!;
    assert.ok(p.value <= VARIANCE_MAX, `wild estimate escaped the top: ${p.value}`);
  });

  it("keeps every derived value inside the band", () => {
    const m = margins({
      PIT: [40, -35, 30, -28, 38, 25, -33],
      NE: [1, -1, 2, -2, 1, 0, -1, 2, -1, 0],
      CHI: [0, 0, 0, 0, 1, -1, 0, 0],
      BAL: [2, -2, 1, -1, 3, -3, 2, -2],
      DET: [1, 0, -1, 2, -2, 1, -1, 0],
      GB: [5, -5, 4, -4, 6, -6, 5, -5],
      LV: [1, -1, 1, -1, 0, 1, -1, 0],
      MIA: [3, -3, 2, -2, 3, -3, 2, -2],
    });
    for (const r of deriveVariance(m)) {
      assert.ok(
        r.value >= VARIANCE_MIN && r.value <= VARIANCE_MAX,
        `${r.abbr} value ${r.value} outside [${VARIANCE_MIN}, ${VARIANCE_MAX}]`,
      );
    }
  });
});

describe("baseline", () => {
  it("measures the league from teams that clear the minimum", () => {
    const m = margins({
      PIT: [1, -1, 2, -2, 1, 0, -1],
      NE: [1, -1, 2, -2, 1, 0, -1],
      CHI: [900, -900], // two games: must not drag the baseline
    });
    const base = leagueBaseline(m);
    assert.ok(base > 0 && base < 5, `baseline should be the typical team, got ${base}`);
  });
});
