import { WEEK } from "./slate";

/** Regular season. The research archive and an open week do not fill this. */
export const REGULAR_SEASON_WEEKS = 18;

const SEASON_KEY = "syndicate.season.v1";

export interface VolumePlay {
  kind: string;
  audit?: {
    integrity: string;
    cardLockTimestamp: number | null;
    settlementSource: string | null;
    settlementTimestamp: number | null;
  } | null;
}

export interface SeasonWeek {
  week: number;
  tickets: number;
  lockedAt: number;
  settledAt: number;
}

export interface VolumeReport {
  completedWeeks: number;
  seasonWeeks: number;
  lockedUnsettled: number;
  settledLocked: number;
}

function liveLocked(plays: VolumePlay[]) {
  return plays.filter(
    (p) => (p.kind === "spread" || p.kind === "total") && p.audit?.integrity === "valid" && p.audit.cardLockTimestamp != null,
  );
}

export function loadSeason(): SeasonWeek[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEASON_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SeasonWeek[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && Number.isInteger(row.week) && row.tickets > 0);
  } catch {
    return [];
  }
}

export function noteSeasonWeek(plays: VolumePlay[], week = WEEK): SeasonWeek[] {
  const locked = liveLocked(plays);
  const settled = locked.filter((p) => p.audit?.settlementSource && p.audit.settlementTimestamp != null);
  const prior = loadSeason();
  if (!locked.length || settled.length !== locked.length) return prior;
  if (prior.some((row) => row.week === week)) return prior;
  const next = [
    ...prior,
    {
      week,
      tickets: locked.length,
      lockedAt: Math.min(...locked.map((p) => p.audit?.cardLockTimestamp ?? 0)),
      settledAt: Math.max(...settled.map((p) => p.audit?.settlementTimestamp ?? 0)),
    },
  ].sort((a, b) => a.week - b.week);
  try {
    localStorage.setItem(SEASON_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function volumeReport(plays: VolumePlay[]): VolumeReport {
  const locked = liveLocked(plays);
  const settled = locked.filter((p) => p.audit?.settlementSource && p.audit.settlementTimestamp != null);
  const stored = new Set(loadSeason().map((row) => row.week));
  if (locked.length > 0 && settled.length === locked.length) stored.add(WEEK);
  return {
    completedWeeks: stored.size,
    seasonWeeks: REGULAR_SEASON_WEEKS,
    lockedUnsettled: locked.length - settled.length,
    settledLocked: settled.length,
  };
}

export function volumeGate(plays: VolumePlay[]): { status: "pass" | "partial" | "fail"; now: string } {
  const report = volumeReport(plays);
  const archive =
    "Weeks 1–2 are a research archive. They were graded from the scoreboard and were not locked by this desk, so they do not count.";
  const claim = "A commercial performance claim is refused until 18. No proven edge.";
  if (report.completedWeeks >= report.seasonWeeks) {
    return {
      status: "pass",
      now: `${report.completedWeeks} of ${report.seasonWeeks} regular-season weeks have a locked card that later settled from the scoreboard.`,
    };
  }
  const open =
    report.lockedUnsettled > 0
      ? `Week ${WEEK} has ${report.settledLocked} settled and ${report.lockedUnsettled} still open on a locked card, so that week does not count.`
      : `Week ${WEEK} has no settled lock.`;
  return {
    status: report.completedWeeks > 0 ? "partial" : "fail",
    now: `${report.completedWeeks} of ${report.seasonWeeks} regular-season weeks. ${open} ${archive} ${claim}`,
  };
}
