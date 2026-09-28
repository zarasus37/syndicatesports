import { findGame, gradeTickets, type BoxBoard, type CloseQuote, type SettledTicket } from "./box";
import { ARCHIVE } from "./history";
import { calibrate, maxDrawdown } from "./learn";
import { ticketPnl, ticketUnits } from "./learn";
import { WEEK } from "./slate";
import type { LedgerTicket } from "./types";

export interface LedgerLine {
  id: string;
  week: number;
  kind: string;
  matchup: string;
  side: string;
  result: string;
  ev: number;
  units: number;
  expected: number;
  realized: number;
  openClv: number | null;
  closeLine: number | null;
  closeClv: number | null;
  closeSource: string | null;
}

export interface LedgerSplit {
  kind: "spread" | "total" | "prop";
  n: number;
  expected: number;
  realized: number;
  openClv: number | null;
  closeClv: number | null;
  closeN: number;
  drawdown: number;
}

function snap(n: number) {
  return Math.round(n * 2) / 2;
}

function sideLine(side: string): { team: string | null; number: number | null; dir: "over" | "under" | null } {
  const spread = side.match(/^([A-Za-z]{2,3})\s*([+-]?\d+(?:\.\d+)?)/);
  if (spread) return { team: spread[1].toUpperCase(), number: Number(spread[2]), dir: null };
  const total = side.match(/^(Over|Under)\s+(\d+(?:\.\d+)?)/i);
  if (total) return { team: null, number: Number(total[2]), dir: total[1].toLowerCase() === "over" ? "over" : "under" };
  return { team: null, number: null, dir: null };
}

export function closeClvFor(ticket: Pick<LedgerTicket, "kind" | "side" | "line" | "matchup" | "week">, quote: CloseQuote | null, final: boolean): { closeLine: number | null; closeClv: number | null } {
  if (!final || !quote) return { closeLine: null, closeClv: null };
  const parsed = sideLine(ticket.side);
  const parts = ticket.matchup.split(" @ ");
  const away = parts[0]?.trim().toUpperCase();
  const home = parts[1]?.trim().toUpperCase();
  if (ticket.kind === "spread" && parsed.team && quote.homeSpreadClose != null && away && home) {
    const team = parsed.team;
    const yours = parsed.number ?? ticket.line;
    const closeLine = team === home ? quote.homeSpreadClose : team === away ? snap(-quote.homeSpreadClose) : null;
    if (closeLine == null) return { closeLine: null, closeClv: null };
    return { closeLine, closeClv: snap(yours - closeLine) };
  }
  if (ticket.kind === "total" && parsed.dir && quote.totalClose != null) {
    const yours = parsed.number ?? ticket.line;
    const closeLine = quote.totalClose;
    const closeClv = parsed.dir === "over" ? snap(closeLine - yours) : snap(yours - closeLine);
    return { closeLine, closeClv };
  }
  return { closeLine: null, closeClv: null };
}

function sourceOf(quote: CloseQuote, closeLine: number): string {
  return `DraftKings via ESPN · event ${quote.eventId} · provider ${quote.providerId} · close ${closeLine}`;
}

export function buildLedger(rows: LedgerTicket[], board: BoxBoard | null): LedgerLine[] {
  const settled: SettledTicket[] = rows.every((r) => "boxResult" in r) ? (rows as SettledTicket[]) : gradeTickets(rows, board);
  return settled.map((t) => {
    const units = ticketUnits(t);
    const game = board ? findGame(board, t.matchup, t.week) : null;
    const quote = game ? (board?.closes ?? []).find((c) => c.eventId === game.eventId) ?? null : null;
    const final = game?.status === "final";
    const close = closeClvFor(t, quote, Boolean(final));
    const graded = t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push" || (!board && (t.result === "win" || t.result === "loss" || t.result === "push"));
    return {
      id: t.id,
      week: t.week,
      kind: t.kind,
      matchup: t.matchup,
      side: t.side,
      result: board ? (t.boxResult === "uncovered" || t.boxResult === "unchecked" || t.boxResult === "void" ? t.boxResult : t.result) : t.result,
      ev: t.ev,
      units,
      expected: graded && (t.result === "win" || t.result === "loss" || t.result === "push") ? units * t.ev : 0,
      realized: graded && (t.result === "win" || t.result === "loss" || t.result === "push") ? ticketPnl(t) : 0,
      openClv: t.week < WEEK && (t.kind === "spread" || t.kind === "total") ? t.clv : null,
      closeLine: close.closeLine,
      closeClv: close.closeClv,
      closeSource: quote && close.closeLine != null && close.closeClv != null ? sourceOf(quote, close.closeLine) : null,
    };
  });
}

function mean(xs: number[]) {
  if (!xs.length) return null;
  return xs.reduce((s, n) => s + n, 0) / xs.length;
}

function pathDrawdown(lines: LedgerLine[]) {
  const ordered = [...lines].sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
  let eq = 0;
  let peak = 0;
  let dd = 0;
  for (const t of ordered) {
    eq += t.realized;
    peak = Math.max(peak, eq);
    dd = Math.min(dd, eq - peak);
  }
  return dd;
}

export function ledgerSplit(lines: LedgerLine[]): LedgerSplit[] {
  return (["spread", "total", "prop"] as const).map((kind) => {
    const xs = lines.filter((t) => t.kind === kind && t.week < WEEK);
    const graded = xs.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
    const closes = graded.map((t) => t.closeClv).filter((n): n is number => n != null);
    const opens = graded.map((t) => t.openClv).filter((n): n is number => n != null);
    return {
      kind,
      n: graded.length,
      expected: graded.reduce((s, t) => s + t.expected, 0),
      realized: graded.reduce((s, t) => s + t.realized, 0),
      openClv: mean(opens),
      closeClv: mean(closes),
      closeN: closes.length,
      drawdown: pathDrawdown(graded),
    };
  });
}

export function ledgerGate(board: BoxBoard | null): { status: "pass" | "partial" | "fail"; now: string } {
  if (!board) {
    return {
      status: "partial",
      now: "Ledger is waiting on the scoreboard. Open CLV on the archive is a recorded number, not a recomputed close. Close CLV stays empty rather than ticket line plus that number.",
    };
  }
  if (board.errors.length || board.games.length === 0) {
    return { status: "fail", now: "No scoreboard, so realized units are not a ledger. Close CLV was not invented." };
  }
  const grades = gradeTickets(ARCHIVE, board);
  const lines = buildLedger(grades, board);
  const sides = lines.filter((t) => t.week < WEEK && (t.kind === "spread" || t.kind === "total"));
  const settled = sides.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
  if (settled.length !== sides.length || !sides.length) {
    return { status: "partial", now: "Closed sides and totals are not all scoreboard grades yet, so the ledger is not closed." };
  }
  const missingClose = settled.filter((t) => t.closeClv == null || t.closeSource == null);
  const missingOpen = settled.filter((t) => t.openClv == null);
  if (missingOpen.length) {
    return { status: "fail", now: "A settled ticket is missing its recorded open CLV." };
  }
  const propRealized = lines.filter((t) => (t.kind === "prop" || t.kind === "parlay") && (t.result === "win" || t.result === "loss"));
  if (propRealized.length) {
    return { status: "fail", now: "A prop or parlay is in the realized ledger without a box score. That win is not a grade." };
  }
  const split = ledgerSplit(lines);
  const brier = calibrate(grades.filter((t) => t.week < WEEK && (t.kind === "spread" || t.kind === "total"))).brier;
  const dd = maxDrawdown(grades.filter((t) => t.week < WEEK && (t.result === "win" || t.result === "loss")));
  const openMean = mean(settled.map((t) => t.openClv).filter((n): n is number => n != null));
  const closeMean = mean(settled.map((t) => t.closeClv).filter((n): n is number => n != null));
  const exp = settled.reduce((s, t) => s + t.expected, 0);
  const realized = settled.reduce((s, t) => s + t.realized, 0);
  if (missingClose.length) {
    const why = (board.closeErrors ?? []).slice(0, 2).join(" · ");
    return {
      status: "partial",
      now: `${missingClose.length} of ${settled.length} settled tickets have no DraftKings close (${missingClose.slice(0, 3).map((t) => t.matchup).join(", ")}). Close CLV is empty there. It is not the ticket line plus recorded CLV. ${why}`,
    };
  }
  const fmt = (n: number | null) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}`);
  const buckets = split.map((s) => `${s.kind} ${s.n}`).join(" · ");
  return {
    status: "pass",
    now: `${settled.length} of ${settled.length} Week 1–2 sides and totals. Open CLV ${fmt(openMean)} pts, recorded on the ticket and not recomputed. Close CLV ${fmt(closeMean)} pts versus the DraftKings close on ESPN, one book, not Pinnacle. EV ${exp.toFixed(2)}u expected, ${realized.toFixed(2)}u realized from the scoreboard. Brier ${brier.toFixed(3)}. Max drawdown ${dd.toFixed(2)}u. Split ${buckets}. Props are not graded. Week ${WEEK} close stays empty until the game is final. Two weeks. Not a proven edge.`,
  };
}
