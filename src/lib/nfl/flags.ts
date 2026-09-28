import { ANOMALY_THRESHOLDS, ANOMALY_WEIGHTS, KEY_NUMBERS } from "./config";
import { conditionAdjustments } from "./conditions";
import { againstPublic, PUBLIC_FADE, publicRead } from "./public";
import { TEAMS } from "./teams";
import type {
  AnomalyScore,
  FeatureSnapshot,
  GameSimResult,
  NflGame,
  SteamSignal,
  TeamAbbr,
} from "./types";

export const STEAM_PTS = 1.5;
export const RLM_PTS = 1.5;

function rating(abbr: TeamAbbr): number {
  return TEAMS[abbr]?.ratingZ ?? 0;
}

export function steamPts(game: NflGame): number {
  return game.line.spread - game.line.spreadOpen;
}

export function totalMove(game: NflGame): number {
  return game.line.total - game.line.totalOpen;
}

export function sideFlipped(game: NflGame): boolean {
  const open = game.line.spreadOpen;
  const now = game.line.spread;
  if (open === 0) return Math.abs(now) >= STEAM_PTS;
  if (now === 0) return Math.abs(open) >= STEAM_PTS;
  return Math.sign(open) !== Math.sign(now);
}

export function steamSignal(game: NflGame): {
  steam: SteamSignal;
  dir: GameSimResult["steamDir"];
  pts: number;
} {
  if (game.line.books?.length) return { steam: "stable", dir: "none", pts: 0 };
  const pts = steamPts(game);
  const abs = Math.abs(pts);
  const flip = sideFlipped(game);
  const towardHome = pts < 0;
  const homeIsFav = game.line.spread < 0;
  const towardDog = homeIsFav ? pts > 0 : pts < 0;
  const pubAgainst = againstPublic(game, towardHome);
  const pub = publicRead(game);

  if (flip || (pubAgainst && abs >= 1.0 && pub.publicPct >= PUBLIC_FADE) || (pubAgainst && abs >= RLM_PTS)) {
    return { steam: "rlm", dir: "underdog", pts };
  }
  if (abs < STEAM_PTS && !flip) return { steam: "stable", dir: "none", pts };
  return { steam: "steam", dir: towardHome === homeIsFav ? "favorite" : "underdog", pts };
}

export function buildFeatures(
  game: NflGame,
  opts: { chaos?: boolean } = {},
): FeatureSnapshot {
  const h = rating(game.home);
  const a = rating(game.away);
  const modelMargin = (h - a) * 3.2 + 1.4;
  const marketMargin = -game.line.spread;
  const residual = modelMargin - marketMargin;
  const liveBoard = Boolean(game.line.books?.length);
  const move = liveBoard ? 0 : steamPts(game);
  const absMove = Math.abs(move);
  const tot = liveBoard ? 0 : totalMove(game);
  const pub = publicRead(game);
  const cond = conditionAdjustments(game);
  const nearKey = KEY_NUMBERS.some((k) => Math.abs(Math.abs(game.line.spread) - k) < 0.2);
  const weatherStress = Math.max(
    cond.stress,
    game.weather.roof === "open" && (game.weather.windMph ?? 0) >= 12
      ? ((game.weather.windMph ?? 0) - 8) / 10
      : game.weather.roof === "open" && (game.weather.tempF ?? 70) >= 86
        ? 0.45
        : game.weather.roof === "neutral"
          ? 0.4
          : 0,
  );
  return {
    gameId: game.id,
    leadLag24h: move,
    steam60m: move * 0.45,
    defendedKey: nearKey && absMove < 0.6,
    residualZ: residual / 3.4,
    residualPersistHours: Math.min(18, Math.abs(residual) * 3.2),
    handleTicketsDiv: Math.tanh(pub.splitHome / 14),
    sharpTiltAlign:
      Math.sign(move) === Math.sign(pub.splitHome) ? Math.min(1, absMove / 2) : -Math.min(1, absMove / 2),
    propMismatchPts: game.id === "lar-den" ? 1.4 : Math.abs(residual) > 3 ? 0.8 : 0.1,
    weatherStress,
    outlierDev: absMove,
    totalMove: tot,
    sideFlip: sideFlipped(game),
    chaosGame: Boolean(opts.chaos) && (game.home === "DEN" || game.away === "DEN"),
    ticketsHome: pub.ticketsHome,
    handleHome: pub.handleHome,
    publicFade: pub.fade !== null,
  };
}

export function scoreAnomaly(fs: FeatureSnapshot): AnomalyScore {
  const w = ANOMALY_WEIGHTS;
  let raw = 0;
  const signals: string[] = [];
  const add = (label: string, pts: number, fire: boolean) => {
    raw += pts;
    if (fire && pts >= 3.5) signals.push(label);
  };

  add("lead-lag drift", w.leadLag * Math.min(1, Math.abs(fs.leadLag24h) / 2.0), Math.abs(fs.leadLag24h) >= 1.5);
  add("final-hour steam", w.steam * Math.min(1, Math.abs(fs.steam60m) / 1.0), Math.abs(fs.steam60m) >= 0.7);
  add("defended number", fs.defendedKey ? w.defended : 0, fs.defendedKey);
  add("outlier book", w.outlier * Math.min(1, fs.outlierDev / 1.8), fs.outlierDev >= 1.5);
  add("residual z", w.residualZ * Math.min(1, Math.abs(fs.residualZ) / 1.6), Math.abs(fs.residualZ) >= 1.2);
  add("residual persist", w.persist * Math.min(1, fs.residualPersistHours / 10), fs.residualPersistHours >= 6);
  add("handle/tickets div", w.div * Math.min(1, Math.abs(fs.handleTicketsDiv)), Math.abs(fs.handleTicketsDiv) >= 0.5);
  add("sharp tilt align", w.tilt * Math.max(0, fs.sharpTiltAlign), fs.sharpTiltAlign >= 0.4);
  add("prop mismatch", w.prop * Math.min(1, fs.propMismatchPts / 1.6), fs.propMismatchPts >= 1);
  add("weather stress", w.weather * Math.min(1, fs.weatherStress / 0.6), fs.weatherStress >= 0.35);
  add("side reverse", fs.sideFlip ? 16 : 0, fs.sideFlip);
  add("total steam", 8 * Math.min(1, Math.abs(fs.totalMove) / 2.5), Math.abs(fs.totalMove) >= 2);
  add("chaos profile", fs.chaosGame ? 8 : 0, fs.chaosGame);
  add("public fade", fs.publicFade ? 8 : 0, fs.publicFade);

  const score = Math.max(0, Math.min(100, raw));
  const nFire = signals.length;
  let state: AnomalyScore["state"] = "normal";
  if (score >= ANOMALY_THRESHOLDS.critical && nFire >= 2) state = "critical";
  else if (score >= ANOMALY_THRESHOLDS.outlier) state = "outlier";
  else if (score >= ANOMALY_THRESHOLDS.info) state = "info";
  return { gameId: fs.gameId, score, state, signals, snapshot: fs };
}

export function isTapeFlag(r: Pick<GameSimResult, "steam">): boolean {
  return r.steam !== "stable";
}

export function isAnomalyFlag(r: Pick<GameSimResult, "anomaly">): boolean {
  return r.anomaly.state !== "normal";
}

export function flagTone(state: AnomalyScore["state"]): "loss" | "warn" | "default" {
  if (state === "critical") return "loss";
  if (state === "outlier") return "warn";
  return "default";
}
