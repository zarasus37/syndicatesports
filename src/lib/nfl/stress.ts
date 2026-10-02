import { simulateGame } from "./engine";
import { getActiveOuts, swingsFor } from "./outs";
import { matchup } from "./labels";
import type { GameSimResult, NflGame } from "./types";

export type ShockKind = "steam_dog" | "steam_fav" | "public_surge" | "key_out" | "wind";

export const SHOCKS: { id: ShockKind; label: string; blurb: string }[] = [
  { id: "steam_dog", label: "Steam to dog", blurb: "Number moves 1.5 toward the underdog. Tests RLM and mean-shift." },
  { id: "steam_fav", label: "Steam to favorite", blurb: "Number moves 1.5 toward the favorite. Tests public pile-on." },
  { id: "public_surge", label: "Public surge", blurb: "Tickets on the public side jump to 82%. Handle stays put." },
  { id: "key_out", label: "Starter out", blurb: "Toggle the tagged swing player (QB / WR1 / edge) for this game." },
  { id: "wind", label: "Wind +10", blurb: "Force an open roof and +10 mph. Totals and sacks reprice." },
];

export interface StressSide {
  pick: string;
  ev: number;
  cover: number;
  win: number;
  total: number;
  steam: string;
  anomaly: string;
}

export interface StressReport {
  kind: ShockKind;
  gameId: string;
  matchup: string;
  note: string;
  before: StressSide;
  after: StressSide;
  deltaEv: number;
  deltaCover: number;
  deltaWin: number;
  pickChanged: boolean;
  sims: number;
}

function cloneGame(g: NflGame): NflGame {
  return {
    ...g,
    line: { ...g.line },
    public: { ...g.public },
    weather: { ...g.weather },
    notes: [...g.notes],
  };
}

function towardDog(spread: number, pts: number): number {
  if (spread < 0) return spread + pts;
  if (spread > 0) return spread - pts;
  return pts;
}

function towardFav(spread: number, pts: number): number {
  if (spread < 0) return spread - pts;
  if (spread > 0) return spread + pts;
  return -pts;
}

export function applyShock(game: NflGame, kind: ShockKind): { game: NflGame; outIds?: string[]; note: string } {
  const g = cloneGame(game);
  if (kind === "steam_dog") {
    g.line.spreadOpen = game.line.spread;
    g.line.spread = towardDog(game.line.spread, 1.5);
    return { game: g, note: `Spread ${game.line.spread} → ${g.line.spread} (dog).` };
  }
  if (kind === "steam_fav") {
    g.line.spreadOpen = game.line.spread;
    g.line.spread = towardFav(game.line.spread, 1.5);
    return { game: g, note: `Spread ${game.line.spread} → ${g.line.spread} (favorite).` };
  }
  if (kind === "public_surge") {
    const homePublic = g.public.ticketsHome >= 50;
    g.public.ticketsHome = homePublic ? 82 : 18;
    return { game: g, note: `Tickets on the public side to 82%. Handle unchanged.` };
  }
  if (kind === "wind") {
    g.weather = {
      ...g.weather,
      roof: g.weather.roof === "dome" ? "open" : g.weather.roof,
      windMph: (g.weather.windMph ?? 6) + 10,
      note: "Stress wind",
    };
    g.line.total = Math.max(32, g.line.total - 1.5);
    return { game: g, note: `Wind ${(game.weather.windMph ?? 6) + 10} mph. Total ${game.line.total} → ${g.line.total}.` };
  }
  const swing = swingsFor(game.id)[0];
  if (!swing) return { game: g, note: "No tagged swing player on this game." };
  const outIds = [...getActiveOuts(), swing.id];
  return { game: g, outIds, note: `${swing.name} (${swing.pos}) marked out.` };
}

function side(r: GameSimResult): StressSide {
  return {
    pick: r.pick.side,
    ev: r.pick.ev,
    cover: r.homeCover,
    win: r.homeWin,
    total: r.meanTotal,
    steam: r.steam,
    anomaly: `${r.anomaly.state} ${r.anomaly.score.toFixed(0)}`,
  };
}

export function stressGame(
  game: NflGame,
  kind: ShockKind,
  sims: number,
  seed: number,
  chaos: boolean,
): StressReport {
  const n = Math.max(4000, Math.min(sims, 12000));
  const shocked = applyShock(game, kind);
  const before = simulateGame(game, n, seed, chaos);
  const after = simulateGame(shocked.game, n, seed + 17, chaos, { outIds: shocked.outIds });
  return {
    kind,
    gameId: game.id,
    matchup: matchup(game),
    note: shocked.note,
    before: side(before),
    after: side(after),
    deltaEv: after.pick.ev - before.pick.ev,
    deltaCover: after.homeCover - before.homeCover,
    deltaWin: after.homeWin - before.homeWin,
    pickChanged: after.pick.side !== before.pick.side,
    sims: n,
  };
}
