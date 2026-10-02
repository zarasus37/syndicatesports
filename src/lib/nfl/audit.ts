import { MAX_BANKROLL_PCT, MAX_CARD_SIDES, MEAN_SHIFT_FACTOR, MIN_EV, DEFAULT_SIMS } from "./config";
import { MODEL_VERSION, ODDS_SOURCE } from "./desk-meta";
import { ticketPnl, ticketUnits } from "./learn";
import { buildLedger } from "./ledger";
import type { BoxBoard } from "./box";
import type { GameSimResult, LedgerTicket } from "./types";

export type RunPhase = "idle" | "queued" | "ingesting" | "simulating" | "priced" | "locked";

export const PHASE_COPY: Record<RunPhase, string> = {
  idle: "idle",
  queued: "queued",
  ingesting: "ingesting",
  simulating: "simulating",
  priced: "priced",
  locked: "locked",
};

export const ASSUMPTIONS = {
  version: MODEL_VERSION,
  minEv: MIN_EV,
  maxCardSides: MAX_CARD_SIDES,
  meanShift: MEAN_SHIFT_FACTOR,
  bankrollCap: MAX_BANKROLL_PCT,
  defaultSims: DEFAULT_SIMS,
  source: ODDS_SOURCE,
} as const;

export interface JournalEvent {
  at: number;
  type: "priced" | "locked" | "papered" | "voided" | "cleared" | "revised" | "settled";
  ticketId?: string;
  note: string;
  modelVersion: string;
}

export interface SlateSnapGame {
  id: string;
  side: string;
  ev: number;
  take: boolean;
  steam: string;
}

export interface SlateSnapshot {
  at: number;
  seed: number;
  sims: number;
  chaos: boolean;
  modelVersion: string;
  games: SlateSnapGame[];
}

export interface SnapDelta {
  id: string;
  sideFrom: string;
  sideTo: string;
  evFrom: number;
  evTo: number;
  takeFrom: boolean;
  takeTo: boolean;
}

export function snapshotFrom(results: GameSimResult[], takes: Set<string>, seed: number, sims: number, chaos: boolean): SlateSnapshot {
  return {
    at: Date.now(),
    seed,
    sims,
    chaos,
    modelVersion: MODEL_VERSION,
    games: results.map((r) => ({
      id: r.gameId,
      side: r.pick.side,
      ev: r.pick.ev,
      take: takes.has(r.gameId),
      steam: r.steam,
    })),
  };
}

export function diffSnapshots(prev: SlateSnapshot | undefined, next: SlateSnapshot): SnapDelta[] {
  if (!prev) return [];
  const byId = Object.fromEntries(prev.games.map((g) => [g.id, g]));
  const out: SnapDelta[] = [];
  for (const g of next.games) {
    const a = byId[g.id];
    if (!a) continue;
    if (a.side !== g.side || a.take !== g.take || Math.abs(a.ev - g.ev) >= 0.005) {
      out.push({
        id: g.id,
        sideFrom: a.side,
        sideTo: g.side,
        evFrom: a.ev,
        evTo: g.ev,
        takeFrom: a.take,
        takeTo: g.take,
      });
    }
  }
  return out;
}

/**
 * Attach derived fields for reporting. Placement provenance comes off the ticket
 * itself — a live card records when it was written and where it came from, and
 * that is passed through untouched. Nothing here invents a timestamp.
 */
export function enrichTicket(t: LedgerTicket) {
  const units = ticketUnits(t);
  const realized = ticketPnl(t);
  const expected = units * t.ev;
  return {
    ...t,
    modelVersion: t.week < 3 ? "2026.w1-2.seed" : MODEL_VERSION,
    source: t.source ?? "live-card",
    placedAt: t.placedAt ?? null,
    closeLine: null,
    units,
    expected,
    realized,
  };
}

function mean(xs: number[]) {
  if (!xs.length) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function sd(xs: number[]) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/** 80% interval on the mean. Small n → wide. */
export function meanCi(xs: number[], z = 1.28) {
  const n = xs.length;
  const m = mean(xs);
  if (n < 2) return { n, mean: m, lo: m, hi: m };
  const se = sd(xs) / Math.sqrt(n);
  return { n, mean: m, lo: m - z * se, hi: m + z * se };
}

export function pnlSplit(rows: LedgerTicket[]) {
  const graded = rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
  const enriched = graded.map(enrichTicket);
  const realized = meanCi(enriched.map((t) => t.realized));
  const expected = meanCi(enriched.map((t) => t.expected));
  const sumR = enriched.reduce((s, t) => s + t.realized, 0);
  const sumE = enriched.reduce((s, t) => s + t.expected, 0);
  const risked = enriched.reduce((s, t) => s + t.units, 0);
  return { n: enriched.length, risked, sumR, sumE, realized, expected };
}

function csvEscape(v: string | number | null | undefined) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ledgerCsv(rows: LedgerTicket[], board: BoxBoard | null = null) {
  const built = new Map(buildLedger(rows, board).map((r) => [r.id, r]));
  const header = [
    "id",
    "week",
    "kind",
    "matchup",
    "side",
    "line",
    "price",
    "prob",
    "ev",
    "units",
    "expected_u",
    "realized_u",
    "clv_open_recorded",
    "close_line",
    "clv_close",
    "close_source",
    "result",
    "score",
    "tags",
    "reasons",
    "model_version",
    "source",
    "placed_at",
  ];
  const lines = [header.join(",")];
  for (const t of rows.map(enrichTicket)) {
    const line = built.get(t.id);
    lines.push(
      [
        t.id,
        t.week,
        t.kind,
        t.matchup,
        t.side,
        t.line,
        t.price,
        t.prob,
        t.ev,
        t.units,
        t.expected,
        t.realized,
        line?.openClv ?? "",
        line?.closeLine ?? "",
        line?.closeClv ?? "",
        line?.closeSource ?? "",
        t.result,
        t.score ?? "",
        t.tags.join("|"),
        t.reasons.join("|"),
        t.modelVersion,
        t.source,
        t.placedAt == null ? "" : new Date(t.placedAt).toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const JOURNAL_KEY = "syndicate.journal.v1";
const SNAP_KEY = "syndicate.snaps.v1";

export function loadJournal(): JournalEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEvent[];
    return Array.isArray(parsed) ? parsed.slice(0, 200) : [];
  } catch {
    return [];
  }
}

export function saveJournal(events: JournalEvent[]) {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(events.slice(0, 200)));
  } catch {
    /* quota */
  }
}

export function appendJournal(events: JournalEvent[], next: Omit<JournalEvent, "at" | "modelVersion">): JournalEvent[] {
  const row: JournalEvent = { ...next, at: Date.now(), modelVersion: MODEL_VERSION };
  const all = [row, ...events].slice(0, 200);
  saveJournal(all);
  return all;
}

export function loadSnaps(): SlateSnapshot[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SNAP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SlateSnapshot[];
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function saveSnaps(snaps: SlateSnapshot[]) {
  try {
    localStorage.setItem(SNAP_KEY, JSON.stringify(snaps.slice(0, 8)));
  } catch {
    /* quota */
  }
}

export function pushSnap(snaps: SlateSnapshot[], next: SlateSnapshot) {
  const all = [next, ...snaps].slice(0, 8);
  saveSnaps(all);
  return all;
}
