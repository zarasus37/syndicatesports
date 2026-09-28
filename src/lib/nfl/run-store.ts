import { MODEL_VERSION } from "./desk-meta";
import type { RunPhase } from "./audit";
import type { BookQuote, GameSimResult, PaperTicket, ParlayTicket, PropSim, WinnerPick } from "./types";
import type { CardPlay } from "./ticket";

export const SHEET_ID = "seeded-week-3-v1";
export const DATA_MODE = "sandbox-generated" as const;
export type DataMode = typeof DATA_MODE | "live-books";
const RUN_KEY = "syndicate.run.v3";
const META_KEY = "syndicate.run.meta.v3";

export interface PersistedRun {
  runId: string;
  sheetId: string;
  at: number;
  ms: number;
  phase: RunPhase;
  seed: number;
  sims: number;
  chaos: boolean;
  bankroll: number;
  modelVersion: string;
  dataMode: DataMode;
  oddsBooks?: string[];
  oddsFetchedAt?: string | null;
  oddsErrors?: string[];
  quotes?: BookQuote[];
  results: Record<string, GameSimResult>;
  order: string[];
  props: PropSim[];
  parlays: ParlayTicket[];
  tickets: PaperTicket[];
  predictions: WinnerPick[];
  plays: CardPlay[];
}

export function makeRunId(at: number) {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `run_2026w03_${stamp}`;
}

function compactResults(results: Record<string, GameSimResult>) {
  const out: Record<string, GameSimResult> = {};
  for (const [id, r] of Object.entries(results)) {
    out[id] = { ...r, paths: [], pointBuy: r.pointBuy?.slice(0, 4) ?? [] };
  }
  return out;
}

function metaOf(run: PersistedRun) {
  return {
    runId: run.runId,
    sheetId: run.sheetId,
    at: run.at,
    ms: run.ms,
    phase: run.phase,
    seed: run.seed,
    sims: run.sims,
    chaos: run.chaos,
    bankroll: run.bankroll,
    modelVersion: run.modelVersion,
    dataMode: run.dataMode,
    oddsBooks: run.oddsBooks ?? [],
    oddsFetchedAt: run.oddsFetchedAt ?? null,
    oddsErrors: run.oddsErrors ?? [],
    quotes: run.quotes ?? [],
    tickets: run.tickets,
    predictions: run.predictions,
    plays: run.plays,
    order: run.order,
    props: run.props,
    parlays: run.parlays,
  };
}

export function loadRun(): PersistedRun | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedRun;
      if (parsed?.runId) return parsed;
    }
    const meta = localStorage.getItem(META_KEY);
    if (!meta) return null;
    const slim = JSON.parse(meta) as Omit<PersistedRun, "results"> & { results?: Record<string, GameSimResult> };
    if (!slim?.runId) return null;
    return { ...slim, results: slim.results ?? {} };
  } catch {
    return null;
  }
}

export function saveRun(run: PersistedRun) {
  if (typeof localStorage === "undefined") return;
  const compact: PersistedRun = { ...run, results: compactResults(run.results) };
  try {
    localStorage.setItem(META_KEY, JSON.stringify(metaOf(compact)));
  } catch {
    /* quota */
  }
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(compact));
  } catch {
    try {
      localStorage.removeItem(RUN_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function emptyMeta() {
  return {
    runId: "—",
    sheetId: SHEET_ID,
    model: MODEL_VERSION,
    mode: DATA_MODE,
    state: "idle" as const,
    at: 0,
  };
}
