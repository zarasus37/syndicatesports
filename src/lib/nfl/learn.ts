import { ARCHIVE } from "./history";
import { betaUpdate, clvUpdate, dirichletUpdate, LEAGUE_P } from "./bayes";
import { DEFAULT_PRIORS, type LearnedPriors } from "./priors";
import { MAX_BANKROLL_PCT, MAX_CARD_SIDES, MIN_EV } from "./config";
import { bestTake } from "./card";
import { americanToDecimal, kellyFraction } from "./odds";
import { reliability } from "./reliability";
import { PROPS } from "./slate";
import { team } from "./teams";
import type { GameSimResult, LedgerTicket, NflGame, ParlayTicket, PropSim } from "./types";

const LOCK_KEY = "syndicate.ledger.v1";
const UNIT_PCT = 0.01;

export const REASON_COPY: Record<string, string> = {
  "clv-captured": "Number moved our way after the card. Market agreed.",
  "rlm-hit": "Reverse line move was the signal. Public was the trap.",
  "model-hit": "Cover probability held. Nothing exotic.",
  "home-script": "Home overlay and the result lined up.",
  "ref-scripted": "Crew tendency printed. Total/sacks followed the whistle.",
  "weather-hit": "Wind/heat/altitude showed up in the box score.",
  "chaos-hit": "Denver late-game script paid.",
  "key-number": "Lost on 3. Model was close; the key was not.",
  "public-was-right": "Faded 65%+ tickets and they cashed. Fade needs handle, not just tickets.",
  "handle-led-steam": "Handle and the number were together. We treated it like square steam.",
  "tnf-total": "Thursday Night unders beat the whistle-over lean.",
  "ref-conflict": "Crew said over, slot said under. Slot won.",
  "chaos-miss": "Chaos engine fired in the sim, not on the field.",
  "line-moved-against": "Negative CLV. We were behind the tape.",
  juice: "Coin-flip after juice. Variance, not a broken feature.",
  "model-soft": "Side was fine; the number was too ambitious.",
  "weather-miss": "Wind/heat tax was too heavy. Player still hit.",
  "one-leg": "Parlay died on one leg. Correlation haircut did not save it.",
};

export function loadLocked(): LedgerTicket[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LedgerTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocked(rows: LedgerTicket[]) {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(rows.slice(0, 200)));
  } catch {
    /* quota */
  }
}

export function allTickets(extra: LedgerTicket[] = []): LedgerTicket[] {
  const locked = extra.length ? extra : loadLocked();
  const seen = new Set(ARCHIVE.map((t) => t.id));
  return [...ARCHIVE, ...locked.filter((t) => !seen.has(t.id))];
}

function graded(rows: LedgerTicket[]) {
  return rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
}

function brierOf(t: LedgerTicket) {
  if (t.result === "pending" || t.result === "push") return 0;
  const y = t.result === "win" ? 1 : 0;
  return (t.prob - y) ** 2;
}

export interface TagStat {
  tag: string;
  n: number;
  hits: number;
  hitRate: number;
  exp: number;
  brier: number;
  clv: number;
  edge: number;
}

function byTag(rows: LedgerTicket[]): TagStat[] {
  const g = graded(rows).filter((t) => t.result !== "push");
  const tags = new Set(g.flatMap((t) => t.tags));
  const out: TagStat[] = [];
  for (const tag of [...tags].sort()) {
    const xs = g.filter((t) => t.tags.includes(tag));
    const hits = xs.filter((t) => t.result === "win").length;
    const exp = xs.reduce((s, t) => s + t.prob, 0) / xs.length;
    const br = xs.reduce((s, t) => s + brierOf(t), 0) / xs.length;
    const clv = xs.reduce((s, t) => s + t.clv, 0) / xs.length;
    out.push({
      tag,
      n: xs.length,
      hits,
      hitRate: hits / xs.length,
      exp,
      brier: br,
      clv,
      edge: hits / xs.length - exp,
    });
  }
  return out.sort((a, b) => a.edge - b.edge);
}

export interface Calibration {
  n: number;
  hits: number;
  losses: number;
  pushes: number;
  hitRate: number;
  exp: number;
  brier: number;
  clv: number;
  roi: number;
  byWeek: { week: number; n: number; hits: number; hitRate: number; brier: number }[];
  tags: TagStat[];
  misses: LedgerTicket[];
  pending: LedgerTicket[];
}

export function calibrate(rows: LedgerTicket[]): Calibration {
  const g = graded(rows);
  const decided = g.filter((t) => t.result !== "push");
  const hits = decided.filter((t) => t.result === "win").length;
  const losses = decided.filter((t) => t.result === "loss").length;
  const pushes = g.filter((t) => t.result === "push").length;
  const exp = decided.length ? decided.reduce((s, t) => s + t.prob, 0) / decided.length : 0;
  const brier = decided.length ? decided.reduce((s, t) => s + brierOf(t), 0) / decided.length : 0.25;
  const clv = g.length ? g.reduce((s, t) => s + t.clv, 0) / g.length : 0;
  const roi =
    decided.length === 0
      ? 0
      : decided.reduce((s, t) => {
          if (t.result === "win") return s + (t.price < 0 ? 100 / Math.abs(t.price) : t.price / 100);
          return s - 1;
        }, 0) / decided.length;
  const weeks = [...new Set(g.map((t) => t.week))].sort((a, b) => a - b);
  const byWeek = weeks.map((week) => {
    const xs = decided.filter((t) => t.week === week);
    const h = xs.filter((t) => t.result === "win").length;
    return {
      week,
      n: xs.length,
      hits: h,
      hitRate: xs.length ? h / xs.length : 0,
      brier: xs.length ? xs.reduce((s, t) => s + brierOf(t), 0) / xs.length : 0,
    };
  });
  return {
    n: decided.length,
    hits,
    losses,
    pushes,
    hitRate: decided.length ? hits / decided.length : 0,
    exp,
    brier,
    clv,
    roi,
    byWeek,
    tags: byTag(rows),
    misses: decided.filter((t) => t.result === "loss"),
    pending: rows.filter((t) => t.result === "pending"),
  };
}

/** 1u = 1% bankroll. Half-Kelly, 3u cap, quarter-unit steps. */
export function sizeUnits(kelly: number): number {
  const raw = kelly / UNIT_PCT;
  if (raw <= 0) return 0;
  const capped = Math.min(MAX_BANKROLL_PCT / UNIT_PCT, raw);
  return Math.round(Math.max(0.25, capped) * 4) / 4;
}

export function ticketUnits(t: Pick<LedgerTicket, "prob" | "price">): number {
  return sizeUnits(kellyFraction(t.prob, t.price));
}

export function ticketPnl(t: LedgerTicket): number {
  const u = ticketUnits(t);
  if (t.result === "win") return u * (americanToDecimal(t.price) - 1);
  if (t.result === "loss") return -u;
  return 0;
}

export function cardUnits(rows: LedgerTicket[]) {
  const g = rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
  return {
    n: g.length,
    risked: g.reduce((s, t) => s + ticketUnits(t), 0),
    pnl: g.reduce((s, t) => s + ticketPnl(t), 0),
  };
}

export function maxDrawdown(rows: LedgerTicket[]) {
  const g = [...rows]
    .filter((t) => t.result === "win" || t.result === "loss")
    .sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
  let eq = 0;
  let peak = 0;
  let dd = 0;
  for (const t of g) {
    eq += ticketPnl(t);
    peak = Math.max(peak, eq);
    dd = Math.min(dd, eq - peak);
  }
  return dd;
}

export function segmentBook(rows: LedgerTicket[]) {
  const kinds = ["spread", "total", "prop"] as const;
  return kinds.map((kind) => ({ kind, ...cardUnits(rows.filter((t) => t.kind === kind)) }));
}

const ENGINE_TAGS = ["rlm", "steam", "tnf", "chaos", "wind", "whistle-over", "public-fade"] as const;

export function learnFrom(rows: LedgerTicket[]): LearnedPriors {
  const cal = calibrate(rows);
  if (cal.n === 0) return DEFAULT_PRIORS;
  const decided = graded(rows).filter((t) => t.result !== "push" && t.kind !== "parlay");
  const posts: LearnedPriors["posts"] = {};
  for (const name of ENGINE_TAGS) {
    const xs = decided.filter((t) => t.tags.includes(name));
    const hits = xs.filter((t) => t.result === "win").length;
    const exp = xs.length ? xs.reduce((s, t) => s + t.prob, 0) / xs.length : LEAGUE_P;
    posts[name] = betaUpdate(hits, xs.length, exp || 0.524, 10, name);
  }
  posts.all = betaUpdate(decided.filter((t) => t.result === "win").length, decided.length, LEAGUE_P, 10, "all");
  const clvPost = clvUpdate(graded(rows).map((t) => t.clv));
  const missCounts: Record<string, number> = {};
  for (const t of cal.misses) for (const r of t.reasons) missCounts[r] = (missCounts[r] ?? 0) + 1;
  const missPost = dirichletUpdate(missCounts);
  const h = (name: string) => posts[name]?.mult ?? 1;
  const notes: string[] = [];
  const rlm = h("rlm");
  const steam = h("steam");
  const tnf = h("tnf");
  const chaos = h("chaos");
  const wind = h("wind");
  const refOver = h("whistle-over");
  const publicFade = h("public-fade");
  if (tnf < 0.95) notes.push("TNF posterior sits under the prior. Thursday overs get a shrink, not a ban.");
  if (publicFade < 0.95) notes.push("Public-fade posterior is weak. Need handle against, not just 65% tickets.");
  if (rlm > 1.05) notes.push("RLM posterior clears the prior. Keep following the number against tickets.");
  if (steam > 1.05) notes.push("Steam posterior is strong. Handle-led moves stay in the model.");
  if (refOver < 0.95) notes.push("Whistle-over crews: posterior pulled down when slot/weather fought the flag.");
  if (chaos !== 1 && Math.abs(chaos - 1) >= 0.04) {
    notes.push(chaos < 1 ? "Chaos posterior is soft. Do not upsize Denver." : "Chaos paid. Leave the engine on.");
  }
  if (clvPost.q10 > 0) notes.push("Recorded open-CLV posterior 10th percentile is still positive. That is the open on the ticket, not a close.");
  else if (clvPost.q90 < 0) notes.push("Recorded open-CLV posterior is negative. Cards were behind the open they stored.");
  if (!notes.length) notes.push("Posteriors hug the prior. κ = 10 is doing the work — small samples don't yank the engine.");
  const topMiss = missPost[0];
  if (topMiss && topMiss.mean >= 0.18) {
    notes.push(`Most probable miss mode: ${topMiss.reason} (${Math.round(topMiss.mean * 100)}% Dirichlet mass).`);
  }
  const weeks = cal.byWeek.map((w) => w.week);
  return {
    fromWeek: Math.min(...weeks),
    toWeek: Math.max(...weeks),
    n: cal.n,
    hits: cal.hits,
    brier: cal.brier,
    clv: cal.clv,
    roi: cal.roi,
    haircuts: { rlm, steam, tnf, chaos, wind, refOver, publicFade },
    posts,
    clvPost,
    missPost,
    reliability: reliability(rows),
    notes,
  };
}

export function cardFromRun(
  results: GameSimResult[],
  parlays: ParlayTicket[],
  props: PropSim[],
  games: NflGame[],
  week: number,
): LedgerTicket[] {
  const byId = Object.fromEntries(games.map((g) => [g.id, g]));
  const rows: LedgerTicket[] = [];
  // Every ticket written in this run shares one placement stamp — that is the
  // moment the card was priced, and it is real rather than reconstructed.
  const stampedAt = Date.now();
  const sides = results
    .map((r) => {
      const bet = bestTake(r);
      const g = byId[r.gameId];
      return bet && g ? { r, bet, g } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.bet.ev - a.bet.ev)
    .slice(0, MAX_CARD_SIDES);

  for (const { r, bet, g } of sides) {
    const tags: string[] = [];
    if (r.steam === "rlm") tags.push("rlm");
    if (r.steam === "steam") tags.push("steam");
    if (r.sharp?.grade === "sharp" || r.sharp?.grade === "heavy") tags.push("sharp");
    if (g.network === "Prime") tags.push("tnf");
    if (g.home === "DEN" || g.away === "DEN") tags.push("chaos");
    if ((g.weather.windMph ?? 0) >= 12) tags.push("wind");
    rows.push({
      id: `w${week}-${r.gameId}-${bet.market}`,
      week,
      kind: bet.market === "total" ? "total" : "spread",
      matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
      side: bet.side,
      line: bet.line,
      price: bet.price,
      prob: bet.prob,
      ev: bet.ev,
      tags,
      clv: r.clvPts,
      result: "pending",
      reasons: [],
      placedAt: stampedAt,
      source: "live-card",
    });
  }
  for (const p of parlays.filter((x) => x.ev >= MIN_EV).slice(0, 2)) {
    rows.push({
      id: `w${week}-p-${p.id}`,
      week,
      kind: "parlay",
      matchup: p.legs.map((l) => l.side).join(" / "),
      side: "3-leg",
      line: 0,
      price: p.offeredAmerican,
      prob: p.joint,
      ev: p.ev,
      tags: ["parlay"],
      clv: 0,
      result: "pending",
      reasons: [],
      placedAt: stampedAt,
      source: "live-card",
    });
  }
  for (const s of props
    .filter((x) => x.pick !== "pass")
    .sort((a, b) => {
      const ea = a.pick === "over" ? a.evOver : a.evUnder;
      const eb = b.pick === "over" ? b.evOver : b.evUnder;
      return eb - ea;
    })
    .slice(0, 3)) {
    const line = PROPS.find((p) => p.id === s.id);
    rows.push({
      id: `w${week}-${s.id}`,
      week,
      kind: "prop",
      matchup: line ? `${line.player} ${line.market}` : s.id,
      side: `${s.pick} ${line?.line ?? ""}`.trim(),
      line: line?.line ?? 0,
      price: s.pick === "over" ? (line?.overPrice ?? -110) : (line?.underPrice ?? -110),
      prob: s.pick === "over" ? s.pOver : 1 - s.pOver,
      ev: s.pick === "over" ? s.evOver : s.evUnder,
      tags: ["prop"],
      clv: 0,
      result: "pending",
      reasons: [],
      placedAt: stampedAt,
      source: "live-card",
    });
  }
  return rows;
}
