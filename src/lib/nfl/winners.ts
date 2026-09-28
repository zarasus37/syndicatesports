import type { WinnerPick } from "./types";

/** Full-slate unofficial winner boards. Real 2026 Week 1–2. 16 games. Not the betting card. */
export const WINNER_ARCHIVE: WinnerPick[] = [
  { id: "w1w-sea", week: 1, matchup: "NE @ SEA", winner: "SEA", pWin: 0.62, result: "win", actual: "SEA", score: "13-10" },
  { id: "w1w-sf", week: 1, matchup: "SF @ LAR", winner: "SF", pWin: 0.61, result: "win", actual: "SF", score: "27-7" },
  { id: "w1w-chi", week: 1, matchup: "CHI @ CAR", winner: "CHI", pWin: 0.58, result: "win", actual: "CHI", score: "59-37" },
  { id: "w1w-cin", week: 1, matchup: "TB @ CIN", winner: "CIN", pWin: 0.57, result: "win", actual: "CIN", score: "33-27" },
  { id: "w1w-bal", week: 1, matchup: "BAL @ IND", winner: "BAL", pWin: 0.66, result: "win", actual: "BAL", score: "41-23" },
  { id: "w1w-det", week: 1, matchup: "NO @ DET", winner: "DET", pWin: 0.68, result: "win", actual: "DET", score: "31-30 OT" },
  { id: "w1w-buf", week: 1, matchup: "BUF @ HOU", winner: "BUF", pWin: 0.64, result: "win", actual: "BUF", score: "36-31" },
  { id: "w1w-jax", week: 1, matchup: "CLE @ JAX", winner: "JAX", pWin: 0.6, result: "win", actual: "JAX", score: "34-10" },
  { id: "w1w-ten", week: 1, matchup: "NYJ @ TEN", winner: "TEN", pWin: 0.55, result: "loss", actual: "NYJ", score: "23-10" },
  { id: "w1w-pit", week: 1, matchup: "ATL @ PIT", winner: "PIT", pWin: 0.59, result: "win", actual: "PIT", score: "20-13" },
  { id: "w1w-min", week: 1, matchup: "GB @ MIN", winner: "MIN", pWin: 0.57, result: "win", actual: "MIN", score: "39-22" },
  { id: "w1w-phi", week: 1, matchup: "WAS @ PHI", winner: "PHI", pWin: 0.7, result: "win", actual: "PHI", score: "24-22" },
  { id: "w1w-lv", week: 1, matchup: "MIA @ LV", winner: "LV", pWin: 0.56, result: "win", actual: "LV", score: "27-13" },
  { id: "w1w-lac", week: 1, matchup: "ARI @ LAC", winner: "LAC", pWin: 0.58, result: "loss", actual: "ARI", score: "26-14" },
  { id: "w1w-dal", week: 1, matchup: "DAL @ NYG", winner: "DAL", pWin: 0.57, result: "loss", actual: "NYG", score: "28-20" },
  { id: "w1w-kc", week: 1, matchup: "DEN @ KC", winner: "KC", pWin: 0.72, result: "win", actual: "KC", score: "31-10" },

  { id: "w2w-buf", week: 2, matchup: "DET @ BUF", winner: "BUF", pWin: 0.64, result: "win", actual: "BUF", score: "41-31" },
  { id: "w2w-atl", week: 2, matchup: "CAR @ ATL", winner: "ATL", pWin: 0.61, result: "loss", actual: "CAR", score: "34-3" },
  { id: "w2w-bal", week: 2, matchup: "NO @ BAL", winner: "BAL", pWin: 0.66, result: "loss", actual: "NO", score: "24-17" },
  { id: "w2w-min", week: 2, matchup: "MIN @ CHI", winner: "MIN", pWin: 0.56, result: "win", actual: "MIN", score: "9-3" },
  { id: "w2w-cin", week: 2, matchup: "CIN @ HOU", winner: "CIN", pWin: 0.55, result: "win", actual: "CIN", score: "20-6" },
  { id: "w2w-tb", week: 2, matchup: "CLE @ TB", winner: "TB", pWin: 0.62, result: "loss", actual: "CLE", score: "23-19" },
  { id: "w2w-gb", week: 2, matchup: "GB @ NYJ", winner: "GB", pWin: 0.59, result: "win", actual: "GB", score: "20-17 OT" },
  { id: "w2w-phi", week: 2, matchup: "PHI @ TEN", winner: "PHI", pWin: 0.71, result: "win", actual: "PHI", score: "24-20" },
  { id: "w2w-ne", week: 2, matchup: "PIT @ NE", winner: "NE", pWin: 0.54, result: "win", actual: "NE", score: "20-3" },
  { id: "w2w-den", week: 2, matchup: "JAX @ DEN", winner: "DEN", pWin: 0.6, result: "win", actual: "DEN", score: "20-13" },
  { id: "w2w-lac", week: 2, matchup: "LV @ LAC", winner: "LAC", pWin: 0.58, result: "loss", actual: "LV", score: "26-14" },
  { id: "w2w-dal", week: 2, matchup: "WAS @ DAL", winner: "DAL", pWin: 0.65, result: "win", actual: "DAL", score: "37-20" },
  { id: "w2w-sea", week: 2, matchup: "SEA @ ARI", winner: "SEA", pWin: 0.67, result: "win", actual: "SEA", score: "31-7" },
  { id: "w2w-sf", week: 2, matchup: "MIA @ SF", winner: "SF", pWin: 0.74, result: "win", actual: "SF", score: "35-13" },
  { id: "w2w-kc", week: 2, matchup: "IND @ KC", winner: "KC", pWin: 0.7, result: "win", actual: "KC", score: "33-30 OT" },
  { id: "w2w-lar", week: 2, matchup: "NYG @ LAR", winner: "LAR", pWin: 0.63, result: "win", actual: "LAR", score: "28-6" },
];

const LOCK_KEY = "syndicate.winners.v1";

export function loadLockedWinners(): WinnerPick[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WinnerPick[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLockedWinners(rows: WinnerPick[]) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(rows.slice(0, 200)));
  } catch {
    /* quota */
  }
}

export function allWinners(extra: WinnerPick[] = []): WinnerPick[] {
  const locked = extra.length ? extra : loadLockedWinners();
  const seen = new Set(WINNER_ARCHIVE.map((t) => t.id));
  return [...WINNER_ARCHIVE, ...locked.filter((t) => !seen.has(t.id))];
}

export function winnerRecord(rows: WinnerPick[]) {
  const g = rows.filter((t) => t.result === "win" || t.result === "loss");
  const n = g.length;
  const hits = g.filter((t) => t.result === "win").length;
  const exp = n ? g.reduce((s, t) => s + t.pWin, 0) / n : 0;
  const brier = n
    ? g.reduce((s, t) => {
        const y = t.result === "win" ? 1 : 0;
        return s + (t.pWin - y) ** 2;
      }, 0) / n
    : 0;
  const logloss = n
    ? g.reduce((s, t) => {
        const y = t.result === "win" ? 1 : 0;
        const p = Math.min(1 - 1e-6, Math.max(1e-6, t.pWin));
        return s - (y * Math.log(p) + (1 - y) * Math.log(1 - p));
      }, 0) / n
    : 0;
  const brierBase = n
    ? g.reduce((s, t) => {
        const y = t.result === "win" ? 1 : 0;
        return s + (0.5 - y) ** 2;
      }, 0) / n
    : 0.25;
  const climate = n ? hits / n : 0.5;
  const brierClimate = n
    ? g.reduce((s, t) => {
        const y = t.result === "win" ? 1 : 0;
        return s + (climate - y) ** 2;
      }, 0) / n
    : 0;
  return {
    n,
    hits,
    losses: n - hits,
    hitRate: n ? hits / n : 0,
    exp,
    brier,
    logloss,
    brierBase,
    brierClimate,
    skill: brierClimate > 0 ? 1 - brier / brierClimate : 0,
    skillVsCoin: brierBase > 0 ? 1 - brier / brierBase : 0,
  };
}

export const CONF_BANDS = [
  { id: "toss", label: "Toss-up", lo: 0, hi: 0.55 },
  { id: "lean", label: "Lean", lo: 0.55, hi: 0.65 },
  { id: "strong", label: "Strong", lo: 0.65, hi: 1.01 },
] as const;

export function winnerBands(rows: WinnerPick[]) {
  const g = rows.filter((t) => t.result === "win" || t.result === "loss");
  return CONF_BANDS.map((b) => {
    const xs = g.filter((t) => t.pWin >= b.lo && t.pWin < b.hi);
    return { ...b, ...winnerRecord(xs) };
  });
}

export function winnerByWeek(rows: WinnerPick[]) {
  const weeks = [...new Set(rows.map((r) => r.week))].sort((a, b) => a - b);
  return weeks.map((week) => {
    const xs = rows.filter((r) => r.week === week);
    return { week, games: xs.length, ...winnerRecord(xs), rows: xs };
  });
}

export function completedPickRecord(rows: WinnerPick[]) {
  const weeks = winnerByWeek(rows).filter((week) => week.games === 16 && week.n === 16);
  const hits = weeks.reduce((sum, week) => sum + week.hits, 0);
  const losses = weeks.reduce((sum, week) => sum + week.losses, 0);
  return { weeks: weeks.length, hits, losses };
}
