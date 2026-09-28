import { CREWS, LEAGUE_FLAGS, crewOf } from "./refs";
import { outAdjustments } from "./outs";
import { getPriors } from "./priors";
import { gameSlot, isPrime, slotLabel, type GameSlot } from "./slot";
import { TEAMS } from "./teams";
import type { NflGame, PropLine, RefereeCrew, TeamAbbr } from "./types";

export type { GameSlot };
export type Climate = "cold" | "warm" | "moderate" | "altitude" | "dome";

export { CREWS, crewOf, isPrime, slotLabel, gameSlot };

export const CLIMATE: Record<TeamAbbr, Climate> = {
  ARI: "warm",
  ATL: "warm",
  BAL: "moderate",
  BUF: "cold",
  CAR: "warm",
  CHI: "cold",
  CIN: "moderate",
  CLE: "cold",
  DAL: "warm",
  DEN: "altitude",
  DET: "dome",
  GB: "cold",
  HOU: "warm",
  IND: "dome",
  JAX: "warm",
  KC: "moderate",
  LAC: "warm",
  LAR: "warm",
  LV: "dome",
  MIA: "warm",
  MIN: "cold",
  NE: "cold",
  NO: "dome",
  NYG: "cold",
  NYJ: "cold",
  PHI: "moderate",
  PIT: "cold",
  SEA: "moderate",
  SF: "moderate",
  TB: "warm",
  TEN: "moderate",
  WAS: "moderate",
};

export interface ConditionAdj {
  slot: GameSlot;
  slotLabel: string;
  crew: RefereeCrew;
  homePts: number;
  awayPts: number;
  volMult: number;
  passMultHome: number;
  passMultAway: number;
  rushMultHome: number;
  rushMultAway: number;
  sackMult: number;
  stress: number;
  notes: string[];
}

export function conditionAdjustments(game: NflGame): ConditionAdj {
  const slot = gameSlot(game);
  const crew = crewOf(game);
  const home = TEAMS[game.home];
  const away = TEAMS[game.away];
  const notes: string[] = [];
  let homePts = 0;
  let awayPts = 0;
  let volMult = 1;
  let passH = 1;
  let passA = 1;
  let rushH = 1;
  let rushA = 1;
  let sackMult = 1;
  let stress = 0;

  const outdoor = game.weather.roof === "open" || game.weather.roof === "neutral";
  const wind = outdoor ? (game.weather.windMph ?? 0) : 0;
  const temp = outdoor ? (game.weather.tempF ?? 70) : 70;
  const windF = Math.max(0, (wind - 8) / 12);
  const heatF = temp >= 84 ? Math.min(1.2, (temp - 84) / 10) : 0;
  const pri = getPriors().haircuts;

  if (windF > 0) {
    const passHitH = windF * (0.9 + Math.max(0, home.passEpa) * 4);
    const passHitA = windF * (0.9 + Math.max(0, away.passEpa) * 4);
    homePts -= passHitH * 0.55;
    awayPts -= passHitA * 0.55;
    passH -= windF * 0.14 * pri.wind;
    passA -= windF * 0.16 * pri.wind;
    rushH += windF * (0.08 + Math.max(0, home.rushEpa) * 0.6);
    rushA += windF * (0.08 + Math.max(0, away.rushEpa) * 0.6);
    sackMult += windF * 0.12;
    volMult *= 1 + windF * 0.06;
    stress += windF * 0.45;
    notes.push(`Wind ${wind} mph. Passing discounted, rushing and sacks up.`);
  }

  if (heatF > 0) {
    const awayClimate = CLIMATE[game.away];
    const visitorTax = awayClimate === "cold" ? 1.5 : awayClimate === "moderate" ? 1.1 : 0.5;
    awayPts -= heatF * visitorTax;
    homePts -= heatF * 0.35;
    passA -= heatF * 0.08;
    volMult *= 1 + heatF * 0.04;
    stress += heatF * 0.4;
    notes.push(
      `${temp}°F heat. ${game.away} is a ${awayClimate} team — visitor legs go first.`,
    );
  }

  if (game.home === "DEN" && outdoor) {
    awayPts -= 0.55;
    passA -= 0.06;
    volMult *= 1.04;
    stress += 0.25;
    notes.push("Altitude. Visiting passing and late-game legs fade.");
  }

  if (slot === "tnf") {
    const u = pri.tnf < 1 ? 1.25 : pri.tnf;
    homePts -= 0.35 * u;
    awayPts -= 0.55 * u;
    volMult *= 1.06;
    passH -= 0.04;
    passA -= 0.05;
    stress += 0.3;
    notes.push("Thursday Night. Short week, unders, road offense taxed more.");
  } else if (slot === "snf") {
    volMult *= 1.08;
    passH += 0.03;
    passA += 0.03;
    notes.push("Sunday Night. Variance up, passing volume a tick higher.");
  } else if (slot === "mnf") {
    volMult *= 1.07;
    homePts += 0.15;
    notes.push("Monday Night. Lights, flags, and a slight home bump.");
  } else if (slot === "intl") {
    homePts -= 0.85;
    volMult *= 1.1;
    stress += 0.35;
    notes.push("Neutral site. Home field in the number is fake.");
  }

  const flagDelta = (crew.flagsPerGame - LEAGUE_FLAGS) / 6;
  const totalSplit = crew.totalLean * 0.45 * pri.refOver;
  homePts += crew.homeBias * 0.35 + totalSplit / 2;
  awayPts += -crew.homeBias * 0.2 + totalSplit / 2;
  sackMult += Math.max(0, flagDelta) * 0.08;
  sackMult += crew.sackLean * 0.1;
  if (crew.holding === "high") sackMult -= 0.08;
  if (crew.holding === "low") sackMult += 0.06;
  if (crew.dpi === "high") {
    passH += 0.03;
    passA += 0.03;
  } else if (crew.dpi === "low") {
    passH -= 0.02;
    passA -= 0.02;
  }
  if (crew.personalFouls >= 1.7) volMult *= 1.04;
  if (Math.abs(crew.totalLean) >= 0.8) stress += 0.15;

  return {
    slot,
    slotLabel: slotLabel(slot),
    crew,
    homePts: round1(homePts),
    awayPts: round1(awayPts),
    volMult: Math.round(volMult * 100) / 100,
    passMultHome: clampMult(passH),
    passMultAway: clampMult(passA),
    rushMultHome: clampMult(rushH),
    rushMultAway: clampMult(rushA),
    sackMult: clampMult(sackMult),
    stress: Math.max(0, Math.min(1, stress)),
    notes,
  };
}

export function adjustPropMean(prop: PropLine, game: NflGame): { mean: number; note: string | null } {
  const adj = conditionAdjustments(game);
  const outs = outAdjustments(game);
  const homeSide = prop.team === game.home;
  const market = prop.market.toLowerCase();
  let mean = prop.mean;
  let note: string | null = null;
  if (market.includes("pass")) {
    const m = (homeSide ? adj.passMultHome : adj.passMultAway) * (1 + (homeSide ? outs.passMultHome : outs.passMultAway));
    mean *= m;
    if (Math.abs(m - 1) >= 0.04) note = `Pass factor ${m.toFixed(2)}×`;
    if (outs.notes.length) note = `${note ?? "Pass"} · ${outs.notes[0]}`;
  } else if (market.includes("rush")) {
    const m = homeSide ? adj.rushMultHome : adj.rushMultAway;
    mean *= m;
    if (Math.abs(m - 1) >= 0.04) note = `Wind/rush factor ${m.toFixed(2)}×`;
  } else if (market.includes("sack")) {
    mean *= adj.sackMult * (1 + outs.sackMult);
    if (Math.abs(adj.sackMult - 1) >= 0.04 || outs.sackMult) note = `Sack factor ${(adj.sackMult * (1 + outs.sackMult)).toFixed(2)}×`;
  }
  return { mean, note };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clampMult(n: number): number {
  return Math.round(Math.max(0.75, Math.min(1.25, n)) * 100) / 100;
}
