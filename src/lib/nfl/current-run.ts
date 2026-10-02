import { MODEL_VERSION } from "./desk-meta";
import { DATA_MODE, SHEET_ID, type DataMode } from "./run-store";
import type { RunPhase } from "./audit";

export type EdgeReason = "ok" | "NO_QUALIFYING_EDGES";

export interface CurrentRun {
  runId: string;
  sheetId: string;
  modelVersion: string;
  mode: DataMode;
  status: RunPhase;
  pricedAt: number;
  bankroll: number;
  nTickets: number;
  nPredictions: number;
  reason: EdgeReason;
}

const LS = "syndicate.current.v1";
const COOKIE = "syndicate.currentRun";

export function saveCurrent(run: CurrentRun) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS, JSON.stringify(run));
  } catch {
    /* quota */
  }
  try {
    const slim = {
      runId: run.runId,
      status: run.status,
      pricedAt: run.pricedAt,
      nTickets: run.nTickets,
      nPredictions: run.nPredictions,
      reason: run.reason,
      sheetId: run.sheetId,
      modelVersion: run.modelVersion,
      mode: run.mode,
      bankroll: run.bankroll,
    };
    document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(slim))};path=/;max-age=604800;SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function loadCurrent(): CurrentRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      const parsed = JSON.parse(raw) as CurrentRun;
      if (parsed?.runId && parsed.pricedAt) return parsed;
    }
  } catch {
    /* ignore */
  }
  try {
    const hit = document.cookie.split("; ").find((r) => r.startsWith(`${COOKIE}=`));
    if (!hit) return null;
    const parsed = JSON.parse(decodeURIComponent(hit.slice(COOKIE.length + 1))) as CurrentRun;
    if (parsed?.runId && parsed.pricedAt) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function currentFrom(partial: {
  runId: string;
  at: number;
  phase: RunPhase;
  bankroll: number;
  nTickets: number;
  nPredictions: number;
  mode?: DataMode;
}): CurrentRun {
  return {
    runId: partial.runId,
    sheetId: SHEET_ID,
    modelVersion: MODEL_VERSION,
    mode: partial.mode ?? DATA_MODE,
    status: partial.phase,
    pricedAt: partial.at,
    bankroll: partial.bankroll,
    nTickets: partial.nTickets,
    nPredictions: partial.nPredictions,
    reason: partial.nTickets === 0 ? "NO_QUALIFYING_EDGES" : "ok",
  };
}
