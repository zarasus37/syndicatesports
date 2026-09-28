import { americanToDecimal, evFromProb, probToAmerican } from "./odds";
import { mulberry32 } from "./rng";
import { teamNick } from "./teams";
import type { GameSimResult, NflGame, ParlayTicket, PathSample, SimPick } from "./types";

const OFFERED_3LEG = 600;

function gamePick(sim: GameSimResult, games: NflGame[]): { game: NflGame; pick: SimPick; sim: GameSimResult } | null {
  const game = games.find((g) => g.id === sim.gameId);
  if (!game) return null;
  const spreadPicks = [sim.pick, ...sim.alts].filter((p) => p.market === "spread");
  const best = [...spreadPicks].sort((a, b) => b.ev - a.ev)[0];
  if (!best || best.ev < 0.015) return null;
  return { game, pick: best, sim };
}

function normCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const s = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + s * y);
}

function gauss(): () => number {
  const rng = mulberry32(20260921);
  return () => {
    const u = Math.max(1e-12, rng());
    const v = Math.max(1e-12, rng());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

/** Gaussian copula joint for weather-linked totals. Independent legs stay a product. */
function copulaJoint(ps: number[], linked: boolean[]): number {
  const n = ps.length;
  const product = ps.reduce((a, b) => a * b, 1);
  if (!linked.some(Boolean) || linked.filter(Boolean).length < 2) return product;
  const draw = gauss();
  const rho = 0.12;
  const N = 2500;
  let hits = 0;
  for (let i = 0; i < N; i++) {
    const z0 = draw();
    let ok = true;
    for (let j = 0; j < n; j++) {
      const z = linked[j] ? rho * z0 + Math.sqrt(1 - rho * rho) * draw() : draw();
      if (normCdf(z) > ps[j]!) {
        ok = false;
        break;
      }
    }
    if (ok) hits += 1;
  }
  return hits / N;
}

function pathHit(paths: PathSample[], pick: SimPick, homeSpread: number): number {
  if (!paths.length) return pick.prob;
  let h = 0;
  for (const p of paths) {
    if (pick.market === "spread") {
      const homeCovers = p.m + homeSpread > 0;
      const pickingHome = Math.abs(pick.line - homeSpread) < 0.05;
      if (pickingHome ? homeCovers : p.m + homeSpread < 0) h += 1;
    } else if (pick.market === "total") {
      const over = p.t > pick.line;
      if (pick.side.startsWith("Over") ? over : !over) h += 1;
    }
  }
  return h / paths.length;
}

function sgpFrom(sim: GameSimResult, game: NflGame): ParlayTicket | null {
  const spread = [sim.pick, ...sim.alts].filter((p) => p.market === "spread").sort((a, b) => b.ev - a.ev)[0];
  const total = [sim.pick, ...sim.alts].filter((p) => p.market === "total").sort((a, b) => b.ev - a.ev)[0];
  if (!spread || !total || spread.ev < 0.01 || total.ev < 0.005) return null;
  const paths = sim.paths ?? [];
  let both = 0;
  for (const p of paths) {
    const homeCovers = p.m + game.line.spread > 0;
    const pickingHome = Math.abs(spread.line - game.line.spread) < 0.05;
    const spreadHit = pickingHome ? homeCovers : p.m + game.line.spread < 0;
    const over = p.t > game.line.total;
    const totalHit = total.side.startsWith("Over") ? over : !over;
    if (spreadHit && totalHit) both += 1;
  }
  const joint = paths.length ? both / paths.length : spread.prob * total.prob;
  const product = spread.prob * total.prob;
  const offeredDec = americanToDecimal(spread.price) * americanToDecimal(total.price) * 0.9;
  const offeredAmerican = offeredDec >= 2 ? Math.round((offeredDec - 1) * 100) : Math.round(-100 / (offeredDec - 1));
  const ev = evFromProb(joint, offeredAmerican);
  if (ev < 0.02) return null;
  return {
    id: `sgp-${game.id}`,
    kind: "sgp",
    jointMethod: "paths",
    legs: [
      {
        gameId: game.id,
        label: `${teamNick(game.away)} @ ${teamNick(game.home)}`,
        side: spread.side,
        price: spread.price,
        prob: spread.prob,
      },
      {
        gameId: game.id,
        label: `${teamNick(game.away)} @ ${teamNick(game.home)}`,
        side: total.side,
        price: total.price,
        prob: total.prob,
      },
    ],
    joint,
    fairAmerican: probToAmerican(joint),
    offeredAmerican,
    ev,
    corrPenalty: Math.max(0, product - joint),
  };
}

export function buildParlays(sims: GameSimResult[], games: NflGame[], limit = 8): ParlayTicket[] {
  const legs = sims
    .map((s) => gamePick(s, games))
    .filter((x): x is { game: NflGame; pick: SimPick; sim: GameSimResult } => Boolean(x))
    .sort((a, b) => b.pick.ev - a.pick.ev)
    .slice(0, 10);

  const tickets: ParlayTicket[] = [];
  for (let i = 0; i < legs.length; i++) {
    for (let j = i + 1; j < legs.length; j++) {
      for (let k = j + 1; k < legs.length; k++) {
        const a = legs[i];
        const b = legs[j];
        const c = legs[k];
        if (!a || !b || !c) continue;
        const trio = [a, b, c];
        const ids = new Set(trio.map((t) => t.game.id));
        if (ids.size < 3) continue;
        const ps = trio.map((t) => pathHit(t.sim.paths, t.pick, t.game.line.spread));
        const linked = trio.map(
          (t) =>
            t.pick.market === "total" &&
            t.game.weather.roof === "open" &&
            (t.game.weather.windMph ?? 0) >= 12,
        );
        const product = ps.reduce((p, x) => p * x, 1);
        const joint = copulaJoint(ps, linked);
        const offeredDec = americanToDecimal(OFFERED_3LEG);
        const ev = joint * (offeredDec - 1) - (1 - joint);
        tickets.push({
          id: trio.map((t) => t.game.id).join("+"),
          kind: "3leg",
          jointMethod: linked.filter(Boolean).length >= 2 ? "copula" : "product",
          legs: trio.map((t) => ({
            gameId: t.game.id,
            label: `${teamNick(t.game.away)} @ ${teamNick(t.game.home)}`,
            side: t.pick.side,
            price: t.pick.price,
            prob: t.pick.prob,
          })),
          joint,
          fairAmerican: probToAmerican(joint),
          offeredAmerican: OFFERED_3LEG,
          ev,
          corrPenalty: Math.max(0, product - joint),
        });
      }
    }
  }

  const sgps = sims
    .map((s) => {
      const g = games.find((x) => x.id === s.gameId);
      return g ? sgpFrom(s, g) : null;
    })
    .filter((t): t is ParlayTicket => Boolean(t));

  return [...sgps, ...tickets]
    .filter((t) => t.ev > 0)
    .sort((a, b) => b.ev - a.ev)
    .slice(0, limit);
}
