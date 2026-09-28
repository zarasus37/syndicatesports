import { sizeProb } from "./bayes";
import { adjustPropMean, conditionAdjustments } from "./conditions";
import { keyCall, rankScore } from "./keys";
import { evFromProb, impliedProb, kellyFraction } from "./odds";
import { outAdjustments } from "./outs";
import { getPriors } from "./priors";
import { calibrateProb } from "./reliability";
import { gaussian, poisson, choice, mulberry32, type Rng } from "./rng";
import { buildFeatures, scoreAnomaly, steamSignal } from "./flags";
import { analyzeSharp } from "./sharp";
import { KEY_NUMBERS, MEAN_SHIFT_FACTOR } from "./config";
import { getGame } from "./slate";
import { clvPts } from "./tape";
import { TEAMS } from "./teams";
import type {
  ChaosMode,
  GameSimResult,
  NflGame,
  PathSample,
  PointBuyRow,
  PropLine,
  PropSim,
  SimPick,
  TeamAbbr,
} from "./types";

const BASE_STD = 13.5;
const BINS_FROM = -36;
const BINS_TO = 36;
const BIN_W = 2;

function rating(abbr: TeamAbbr): number {
  return TEAMS[abbr]?.ratingZ ?? 0;
}

function variance(abbr: TeamAbbr): number {
  return TEAMS[abbr]?.variance ?? 1;
}

export function checkChaos(team: TeamAbbr, opponent: TeamAbbr, quarter: number, margin: number): ChaosMode {
  if (team === "DEN" && quarter === 4 && margin <= -14) return "GIANTS_MODE";
  if (team === "DEN" && (opponent === "KC" || opponent === "BUF" || opponent === "BAL")) return "CLUTCH_LUCK_MODE";
  const gap = rating(opponent) - rating(team);
  if (team === "DEN" && gap >= 0.6) return "CLUTCH_LUCK_MODE";
  return "NORMAL";
}

export function matchupChaos(game: NflGame): ChaosMode {
  if (game.home !== "DEN" && game.away !== "DEN") return "NORMAL";
  const opp = game.home === "DEN" ? game.away : game.home;
  return checkChaos("DEN", opp, 1, 0);
}

export function applyChaos(rng: Rng, mode: ChaosMode, base: number): { score: number; triggered: boolean } {
  if (mode === "GIANTS_MODE" && rng() < 0.3) return { score: base + 21, triggered: true };
  if (mode === "CLUTCH_LUCK_MODE") {
    const extra = choice(rng, [0, 3, 7], [0.7, 0.2, 0.1]);
    return { score: base + extra, triggered: extra > 0 };
  }
  return { score: base, triggered: false };
}

function histogram(margins: number[]): { bin: number; p: number }[] {
  const counts = new Map<number, number>();
  for (let b = BINS_FROM; b <= BINS_TO; b += BIN_W) counts.set(b, 0);
  for (const m of margins) {
    const clipped = Math.max(BINS_FROM, Math.min(BINS_TO, m));
    const bin = Math.round(clipped / BIN_W) * BIN_W;
    counts.set(bin, (counts.get(bin) ?? 0) + 1);
  }
  const n = margins.length || 1;
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([bin, c]) => ({ bin, p: c / n }));
}

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

function stdev(xs: number[], m: number): number {
  if (xs.length < 2) return 0;
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return Math.sqrt(s / (xs.length - 1));
}

function pickBest(cands: SimPick[]): { pick: SimPick; alts: SimPick[] } {
  const ranked = [...cands].sort((a, b) => b.ev - a.ev);
  const spread = ranked.filter((c) => c.market === "spread").sort((a, b) => b.ev - a.ev)[0];
  const pick = spread ?? ranked[0];
  if (!pick) {
    return {
      pick: { market: "spread", side: "pass", line: 0, price: -110, prob: 0.5, sizeProb: 0.5, ev: 0, kelly: 0 },
      alts: [],
    };
  }
  return { pick, alts: ranked.filter((c) => c !== pick) };
}

function makePick(
  market: SimPick["market"],
  side: string,
  line: number,
  price: number,
  modelP: number,
): SimPick {
  const pri = getPriors();
  const rankP = calibrateProb(modelP, pri.reliability);
  const sized = sizeProb(rankP, pri.posts.all);
  return {
    market,
    side,
    line,
    price,
    prob: rankP,
    sizeProb: sized,
    ev: evFromProb(sized, price),
    kelly: kellyFraction(sized, price),
  };
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function simulateGame(
  game: NflGame,
  nSims = 8000,
  seed = 20260921,
  chaos = true,
  opts?: { outIds?: string[] },
): GameSimResult {
  const rng = mulberry32(seed + hashId(game.id));
  const hR = rating(game.home);
  const aR = rating(game.away);
  const spread = game.line.spread;
  const total = game.line.total;

  const marketH = (total - spread) / 2;
  const marketA = (total + spread) / 2;
  let hMean = marketH + hR * MEAN_SHIFT_FACTOR;
  let aMean = marketA + aR * MEAN_SHIFT_FACTOR;
  const cond = conditionAdjustments(game);
  hMean += cond.homePts;
  aMean += cond.awayPts;
  const outs = outAdjustments(game, opts?.outIds);
  hMean += outs.homePts;
  aMean += outs.awayPts;

  const chaosProfile = matchupChaos(game);
  const fs = buildFeatures(game, { chaos: chaos && chaosProfile !== "NORMAL" });
  const anomaly = scoreAnomaly(fs);
  const steam = steamSignal(game);

  let vol = BASE_STD * Math.sqrt((variance(game.home) + variance(game.away)) / 2);
  vol *= cond.volMult * outs.volMult;
  if (
    (anomaly.state === "outlier" || anomaly.state === "critical") &&
    Math.abs(steam.pts) >= 1.5 &&
    Math.abs(fs.residualZ) >= 2
  ) {
    vol *= 1.3;
  } else if (anomaly.state === "outlier" || anomaly.state === "critical") {
    vol *= 1.18;
  }
  if (Math.abs(steam.pts) >= 1) {
    const pri = getPriors().haircuts;
    const mult = steam.steam === "rlm" ? pri.rlm : pri.steam;
    const shift = steam.pts * 0.4 * mult;
    hMean -= shift / 2;
    aMean += shift / 2;
  }

  const margins: number[] = new Array(nSims);
  const totals: number[] = new Array(nSims);
  const homes: number[] = new Array(nSims);
  const aways: number[] = new Array(nSims);
  let chaosTriggers = 0;
  let homeWin = 0;
  let homeCover = 0;
  let coverPush = 0;
  let over = 0;
  let oneScore = 0;
  let homeWinBy7 = 0;
  let awayWinBy7 = 0;
  let land3 = 0;
  let land7 = 0;
  const stride = Math.max(1, Math.floor(nSims / 1200));
  const paths: PathSample[] = [];

  for (let i = 0; i < nSims; i++) {
    const hScore = gaussian(rng, hMean * 0.75, vol * 0.75);
    const aScore = gaussian(rng, aMean * 0.75, vol * 0.75);
    const currentMargin = hScore - aScore;
    const hMode = chaos ? checkChaos(game.home, game.away, 4, currentMargin) : "NORMAL";
    const aMode = chaos ? checkChaos(game.away, game.home, 4, -currentMargin) : "NORMAL";
    const hQ4 = applyChaos(rng, hMode, gaussian(rng, hMean * 0.25, 6));
    const aQ4 = applyChaos(rng, aMode, gaussian(rng, aMean * 0.25, 6));
    if (hQ4.triggered || aQ4.triggered) chaosTriggers += 1;

    let finalH = Math.max(0, hScore + hQ4.score);
    let finalA = Math.max(0, aScore + aQ4.score);

    if (chaos && Math.abs(finalH - finalA) <= 2) {
      const p = 0.6 * getPriors().haircuts.chaos;
      if (game.home === "DEN" && rng() < p) finalH += 3;
      if (game.away === "DEN" && rng() < p) finalA += 3;
    }

    let margin = finalH - finalA;
    if (Math.abs(margin) > 7 && rng() < 0.22) {
      margin *= 1.5;
      if (margin > 0) finalH = finalA + margin;
      else finalA = finalH - margin;
    }

    const h = Math.round(Math.max(0, finalH));
    const a = Math.round(Math.max(0, finalA));
    const m = h - a;
    const t = h + a;
    homes[i] = h;
    aways[i] = a;
    margins[i] = m;
    totals[i] = t;
    if (h > a) homeWin += 1;
    if (m + spread > 0) homeCover += 1;
    else if (m + spread === 0) coverPush += 1;
    if (t > total) over += 1;
    if (Math.abs(m) <= 8) oneScore += 1;
    if (m >= 7) homeWinBy7 += 1;
    if (m <= -7) awayWinBy7 += 1;
    if (Math.abs(m) === 3) land3 += 1;
    if (Math.abs(m) === 7) land7 += 1;
    if (i % stride === 0) paths.push({ m, t });
  }

  const n = nSims;
  const homeCoverP = homeCover / n;
  const awayCoverP = (n - homeCover - coverPush) / n;
  const overP = over / n;
  const underP = 1 - overP;
  const homeWinP = homeWin / n;
  const awayWinP = 1 - homeWinP;
  const meanMargin = mean(margins);
  const stdMargin = stdev(margins, meanMargin);

  const cands: SimPick[] = [
    makePick("spread", `${game.home} ${spread > 0 ? "+" : ""}${spread}`, spread, game.line.spreadPrice, homeCoverP),
    makePick("spread", `${game.away} ${-spread > 0 ? "+" : ""}${-spread}`, -spread, game.line.awaySpreadPrice ?? game.line.spreadPrice, awayCoverP),
    makePick("total", `Over ${total}`, total, game.line.overPrice, overP),
    makePick("total", `Under ${total}`, total, game.line.underPrice, underP),
    makePick("ml", `${game.home} ML`, 0, game.line.homeMl, homeWinP),
    makePick("ml", `${game.away} ML`, 0, game.line.awayMl, awayWinP),
  ];
  const { pick, alts } = pickBest(cands);
  const call = keyCall(spread, margins, game.line.spreadPrice);

  const edge = Math.abs(meanMargin - -spread);
  const confidence = Math.min(10, (edge / Math.max(1, stdMargin)) * 30);
  const pickingHome = pick.side.startsWith(game.home);

  const pointBuy: PointBuyRow[] = [];
  for (const delta of [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]) {
    const to = spread + delta;
    let cover = 0;
    for (const m of margins) if (m + to > 0) cover += 1;
    const coverP = cover / n;
    const key = KEY_NUMBERS.some((k) => Math.abs(Math.abs(to) - k) < 0.05);
    const halfs = Math.abs(delta) / 0.5;
    const extraJuice = halfs * 0.1;
    const boughtPrice = -110 - extraJuice * 100;
    const evNow = evFromProb(homeCoverP, game.line.spreadPrice);
    const evBuy = evFromProb(coverP, boughtPrice);
    pointBuy.push({
      to,
      cover: coverP,
      deltaPts: (coverP - homeCoverP) * 100,
      worth: evBuy > evNow && extraJuice <= 0.15,
      key,
    });
  }

  return {
    gameId: game.id,
    sims: n,
    homeMean: mean(homes),
    awayMean: mean(aways),
    meanMargin,
    stdMargin,
    meanTotal: mean(totals),
    homeWin: homeWinP,
    awayWin: awayWinP,
    homeCover: homeCoverP,
    awayCover: awayCoverP,
    coverPush: coverPush / n,
    over: overP,
    under: underP,
    oneScore: oneScore / n,
    homeWinBy7: homeWinBy7 / n,
    awayWinBy7: awayWinBy7 / n,
    land3: land3 / n,
    land7: land7 / n,
    chaosTriggers: chaosTriggers / n,
    histogram: histogram(margins),
    pick,
    alts,
    confidence,
    steam: steam.steam,
    steamPts: steam.pts,
    steamDir: steam.dir,
    anomaly,
    sharp: analyzeSharp(game, steam),
    pointBuy,
    keyCall: call,
    paths,
    outsApplied: outs.applied,
    rankScore: rankScore(pick.ev, pick.line, pick.market, call),
    clvPts: clvPts(game, pickingHome, pick.market, pick.side),
    chaosOn: chaos,
    chaosProfile,
  };
}

export function simulateProp(prop: PropLine, n = 5000, seed = 20260921): PropSim {
  const rng = mulberry32(seed + hashId(prop.id));
  const game = getGame(prop.gameId);
  const wx = game ? adjustPropMean(prop, game) : { mean: prop.mean, note: null };
  const samples = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    if (prop.dist === "poisson") {
      samples[i] = poisson(rng, wx.mean);
    } else {
      const chaos = Boolean(prop.chaosLift) && rng() < 0.35;
      const mu = chaos ? wx.mean + (prop.chaosLift ?? 0) : wx.mean;
      samples[i] = gaussian(rng, mu, prop.sd ?? 35);
    }
  }
  samples.sort((a, b) => a - b);
  const mu = mean(samples);
  const median = samples[Math.floor(n / 2)] ?? mu;
  const rawOver = samples.filter((x) => x > prop.line).length / n;
  const mktOver = impliedProb(prop.overPrice);
  const pOver = 0.75 * mktOver + 0.25 * rawOver;
  const evOver = evFromProb(pOver, prop.overPrice);
  const evUnder = evFromProb(1 - pOver, prop.underPrice);
  let pick: PropSim["pick"] = "pass";
  if (evOver >= 0.03 && evOver >= evUnder) pick = "over";
  else if (evUnder >= 0.03 && evUnder > evOver) pick = "under";
  return { id: prop.id, mean: mu, median, pOver, evOver, evUnder, pick, weatherNote: wx.note };
}
