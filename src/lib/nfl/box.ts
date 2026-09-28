import { ARCHIVE } from "./history";
import { appendAudit, type TicketAudit } from "./integrity";
import { WEEK } from "./slate";
import type { LedgerResult, LedgerTicket } from "./types";

export type GameStatus = "final" | "scheduled" | "in-progress" | "postponed" | "canceled" | "suspended" | "delayed" | "unknown";

export interface BoxGame {
  eventId: string;
  week: number;
  away: string;
  home: string;
  awayScore: number | null;
  homeScore: number | null;
  status: GameStatus;
  statusName: string;
  detail: string;
  overtime: boolean;
}

export interface CloseQuote {
  eventId: string;
  book: "DraftKings";
  providerId: string;
  homeSpreadOpen: number | null;
  homeSpreadClose: number | null;
  totalOpen: number | null;
  totalClose: number | null;
}

export interface BoxBoard {
  fetchedAt: string;
  source: "ESPN scoreboard";
  weeks: number[];
  games: BoxGame[];
  errors: string[];
  closes: CloseQuote[];
  closeErrors: string[];
}

export type BoxResult = LedgerResult | "void" | "uncovered" | "unchecked";

export interface SettledTicket extends LedgerTicket {
  recorded: LedgerResult;
  boxResult: BoxResult;
  settlementSource: string | null;
  settlementTimestamp: number | null;
  settlementNote: string;
  agrees: boolean | null;
}

export const SETTLEMENT_RULES =
  "A side or total grades only when the scoreboard says final. Overtime is part of that final. A scheduled 0–0 is not a result. The spread is the selected team’s score, plus the stored number, minus the opponent. The total is both scores against the number. A tie on the number is a push, not a void. Postponed, canceled, and suspended void the ticket and keep it; they are not losses. Props and parlays are not on this feed, so an archive win on those is not a grade. A later score change appends another settlement line and keeps the first.";

const ESPN_ABBR: Record<string, string> = { WSH: "WAS", JAC: "JAX", LA: "LAR" };

export function espnAbbr(raw: string): string | null {
  const u = raw.trim().toUpperCase();
  if (!u) return null;
  return ESPN_ABBR[u] ?? u;
}

export function mapStatus(name: string): GameStatus {
  const n = name.toUpperCase();
  if (n.includes("FINAL")) return "final";
  if (n.includes("POSTPONE")) return "postponed";
  if (n.includes("CANCEL")) return "canceled";
  if (n.includes("SUSPEND")) return "suspended";
  if (n.includes("DELAY")) return "delayed";
  if (n.includes("IN_PROGRESS") || n.includes("HALFTIME") || n.includes("END_PERIOD")) return "in-progress";
  if (n.includes("SCHEDULE") || n.includes("PREGAME")) return "scheduled";
  return "unknown";
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function lineOf(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    if (/^(pk|even|pick)/i.test(v.trim())) return 0;
    const n = Number(v.replace(/[^\d.+-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  if (typeof v === "object") {
    const o = v as { american?: unknown; alternateDisplayValue?: unknown };
    return lineOf(o.american ?? o.alternateDisplayValue ?? null);
  }
  return null;
}

export function parseDraftKingsClose(eventId: string, data: unknown): CloseQuote | null {
  if (!data || typeof data !== "object") return null;
  const o = data as {
    provider?: { id?: unknown; name?: unknown };
    spread?: unknown;
    homeTeamOdds?: { open?: { pointSpread?: unknown }; close?: { pointSpread?: unknown } };
    open?: { total?: unknown };
    close?: { total?: unknown };
  };
  const homeSpreadClose = lineOf(o.homeTeamOdds?.close?.pointSpread) ?? lineOf(o.spread);
  const totalClose = lineOf(o.close?.total);
  if (homeSpreadClose == null && totalClose == null) return null;
  return {
    eventId,
    book: "DraftKings",
    providerId: String(o.provider?.id ?? "100"),
    homeSpreadOpen: lineOf(o.homeTeamOdds?.open?.pointSpread),
    homeSpreadClose,
    totalOpen: lineOf(o.open?.total),
    totalClose,
  };
}

export function parseEspnScoreboard(week: number, data: { events?: unknown[] } | null): BoxGame[] {
  const games: BoxGame[] = [];
  for (const event of data?.events ?? []) {
    if (!event || typeof event !== "object") continue;
    const ev = event as { id?: unknown; competitions?: { status?: { type?: { name?: string; shortDetail?: string; detail?: string } }; competitors?: { homeAway?: string; score?: unknown; team?: { abbreviation?: string } }[] }[] };
    const comp = ev.competitions?.[0];
    if (!comp) continue;
    const type = comp.status?.type;
    const statusName = String(type?.name ?? "unknown");
    const teams = comp.competitors ?? [];
    const awayT = teams.find((t) => t.homeAway === "away");
    const homeT = teams.find((t) => t.homeAway === "home");
    const away = espnAbbr(awayT?.team?.abbreviation ?? "");
    const home = espnAbbr(homeT?.team?.abbreviation ?? "");
    if (!away || !home) continue;
    const detail = String(type?.shortDetail ?? type?.detail ?? "");
    games.push({
      eventId: String(ev.id ?? ""),
      week,
      away,
      home,
      awayScore: num(awayT?.score),
      homeScore: num(homeT?.score),
      status: mapStatus(statusName),
      statusName,
      detail,
      overtime: /\bOT\b|overtime/i.test(detail),
    });
  }
  return games;
}

export function findGame(board: BoxBoard, matchup: string, week?: number): BoxGame | null {
  const parts = matchup.split(" @ ");
  if (parts.length !== 2) return null;
  const away = espnAbbr(parts[0].trim()) ?? parts[0].trim().toUpperCase();
  const home = espnAbbr(parts[1].trim()) ?? parts[1].trim().toUpperCase();
  return board.games.find((g) => g.away === away && g.home === home && (week == null || g.week === week)) ?? null;
}

function sign(n: number): -1 | 0 | 1 {
  const h = Math.round(n * 2);
  if (h > 0) return 1;
  if (h < 0) return -1;
  return 0;
}

function scoreLine(game: BoxGame): string | undefined {
  if (game.awayScore == null || game.homeScore == null) return undefined;
  return `${game.away} ${game.awayScore} @ ${game.home} ${game.homeScore}${game.overtime ? " OT" : ""}`;
}

function sourceOf(game: BoxGame): string {
  return `ESPN scoreboard · event ${game.eventId} · ${game.statusName} · ${game.detail || game.status}`;
}

function gradeMarket(ticket: Pick<LedgerTicket, "kind" | "side">, game: BoxGame): { result: LedgerResult; note: string } | null {
  if (game.awayScore == null || game.homeScore == null) return null;
  const ot = game.overtime ? " Overtime is in the final." : "";
  if (ticket.kind === "total") {
    const m = ticket.side.match(/^(Over|Under)\s+(\d+(?:\.\d+)?)/i);
    if (!m) return null;
    const dir = m[1].toLowerCase();
    const line = Number(m[2]);
    const total = game.awayScore + game.homeScore;
    const cmp = sign(total - line);
    const result: LedgerResult = cmp === 0 ? "push" : dir === "over" ? (cmp > 0 ? "win" : "loss") : cmp < 0 ? "win" : "loss";
    return { result, note: `Total ${total} vs ${line} ${dir}.${ot}` };
  }
  if (ticket.kind === "spread") {
    const m = ticket.side.match(/^([A-Za-z]{2,3})\s*([+-]?\d+(?:\.\d+)?)/);
    if (!m) return null;
    const team = (espnAbbr(m[1]) ?? m[1]).toUpperCase();
    const spread = Number(m[2]);
    const mine = team === game.home ? game.homeScore : team === game.away ? game.awayScore : null;
    const opp = team === game.home ? game.awayScore : team === game.away ? game.homeScore : null;
    if (mine == null || opp == null) return null;
    const cover = sign(mine + spread - opp);
    const result: LedgerResult = cover > 0 ? "win" : cover < 0 ? "loss" : "push";
    return { result, note: `${team} ${spread} ${result === "push" ? "pushed" : result === "win" ? "covered" : "missed"}.${ot}` };
  }
  return null;
}

function blank(ticket: LedgerTicket, boxResult: BoxResult, note: string, extra?: Partial<SettledTicket>): SettledTicket {
  return {
    ...ticket,
    recorded: ticket.result,
    boxResult,
    settlementSource: null,
    settlementTimestamp: null,
    settlementNote: note,
    agrees: null,
    ...extra,
  };
}

export function gradeTickets(rows: LedgerTicket[], board: BoxBoard | null, at = Date.now()): SettledTicket[] {
  return rows.map((ticket) => gradeTicket(ticket, board, at));
}

export function gradeTicket(ticket: LedgerTicket, board: BoxBoard | null, at = Date.now()): SettledTicket {
  if (!board) {
    return blank(ticket, "unchecked", "Scoreboard has not returned. The archive result is not a settlement.");
  }
  if (ticket.kind === "prop" || ticket.kind === "parlay") {
    return blank(ticket, "uncovered", ticket.kind === "prop" ? "Player stat is not on the team scoreboard. The archive win is not a grade." : "Parlay legs are not stored. The archive win is not a grade.", {
      result: "pending",
    });
  }
  const game = findGame(board, ticket.matchup, ticket.week);
  if (!game) {
    return blank(ticket, "uncovered", "No scoreboard game for this matchup. Not graded.", { result: "pending" });
  }
  if (game.status === "postponed" || game.status === "canceled" || game.status === "suspended") {
    return blank(ticket, "void", `${game.status}. Original retained. Not a loss.`, {
      result: "pending",
      score: scoreLine(game),
      settlementSource: sourceOf(game),
      settlementTimestamp: at,
    });
  }
  if (game.status !== "final") {
    return blank(ticket, "pending", `${game.detail || game.statusName}. Not final. Settlement source stays empty.`, { result: "pending" });
  }
  const graded = gradeMarket(ticket, game);
  if (!graded) {
    return blank(ticket, "uncovered", "Side could not be read against the final. Not graded.", { result: "pending" });
  }
  const agrees = ticket.result === "pending" ? null : ticket.result === graded.result;
  const disagree = agrees === false ? ` Archive recorded ${ticket.result}.` : "";
  return blank(ticket, graded.result, `${graded.note}${disagree}`, {
    result: graded.result,
    score: scoreLine(game),
    settlementSource: sourceOf(game),
    settlementTimestamp: at,
    agrees,
  });
}

const TERMINAL_VOID = new Set<GameStatus>(["postponed", "canceled", "suspended"]);

export function applyGradeToAudit(audit: TicketAudit, grade: SettledTicket, at: number): TicketAudit {
  if (!grade.settlementSource) return audit;
  if (grade.boxResult !== "win" && grade.boxResult !== "loss" && grade.boxResult !== "push" && grade.boxResult !== "void") return audit;
  const prior = audit.events.filter((e) => e.type === "settlement");
  const same = prior.some((e) => e.note === grade.settlementNote) && audit.settlementSource === grade.settlementSource;
  if (same) return audit;
  const note = prior.length ? `Scoreboard changed. Previous: ${prior[prior.length - 1]?.note}. Now: ${grade.settlementNote}` : grade.settlementNote;
  return appendAudit(
    audit,
    { type: "settlement", note, actor: "feed:espn-scoreboard", at },
    {
      settlementSource: grade.settlementSource,
      settlementTimestamp: at,
      voidReason: grade.boxResult === "void" ? grade.settlementNote : audit.voidReason,
    },
  );
}

export interface SettlementPlay {
  matchup?: string;
  kind: string;
  audit?: { settlementSource: string | null; settlementTimestamp: number | null; voidReason?: string } | null;
}

export function settlementGate(board: BoxBoard | null, plays: SettlementPlay[]): { status: "pass" | "partial" | "fail"; now: string } {
  if (!board) {
    return {
      status: "fail",
      now: "Scoreboard has not returned this session. Weeks 1–2 are still the archive. Those scores are not a settlement. Week 3 is not final.",
    };
  }
  if (board.errors.length || board.games.length === 0) {
    return {
      status: "fail",
      now: `Scoreboard failed. ${board.errors.join(" · ") || "No games."} Archive scores were not used as a grade.`,
    };
  }
  const short: string[] = [];
  for (const week of board.weeks) {
    const n = board.games.filter((g) => g.week === week).length;
    if (n < 16) short.push(`week ${week} returned ${n}`);
  }
  if (short.length) {
    return { status: "fail", now: `Incomplete scoreboard (${short.join("; ")}). Nothing was graded from a partial slate.` };
  }
  const at = Date.parse(board.fetchedAt);
  const grades = gradeTickets(ARCHIVE, board, Number.isFinite(at) ? at : Date.now());
  const sides = grades.filter((t) => t.week < WEEK && (t.kind === "spread" || t.kind === "total"));
  const missed = sides.filter((t) => !t.settlementSource || (t.boxResult !== "win" && t.boxResult !== "loss" && t.boxResult !== "push" && t.boxResult !== "void"));
  if (missed.length) {
    return {
      status: "fail",
      now: `${missed.length} closed sides or totals have no final (${missed.map((t) => t.matchup).slice(0, 4).join(", ")}). Archive result was not substituted.`,
    };
  }
  const premature: string[] = [];
  const unstampedFinal: string[] = [];
  for (const play of plays) {
    const game = play.matchup ? findGame(board, play.matchup) : null;
    const stamped = Boolean(play.audit?.settlementSource || play.audit?.settlementTimestamp);
    if (!game) {
      if (stamped) premature.push(play.matchup ?? "ticket");
      continue;
    }
    if (game.status === "final") {
      if ((play.kind === "spread" || play.kind === "total") && !stamped) unstampedFinal.push(play.matchup ?? game.eventId);
      continue;
    }
    if (TERMINAL_VOID.has(game.status)) {
      if (!play.audit?.voidReason) unstampedFinal.push(`${play.matchup ?? game.eventId} ${game.status}`);
      continue;
    }
    if (stamped) premature.push(play.matchup ?? game.eventId);
  }
  if (premature.length) {
    return {
      status: "fail",
      now: `Settlement was stamped before a final: ${premature.slice(0, 4).join(", ")}. A scheduled game is not a result.`,
    };
  }
  const uncovered = grades.filter((t) => t.boxResult === "uncovered").length;
  const disagree = sides.filter((t) => t.agrees === false);
  const liveFinal = board.games.filter((g) => g.week === WEEK && g.status === "final").length;
  const liveOpen = board.games.filter((g) => g.week === WEEK && g.status !== "final").length;
  const pushes = sides.filter((t) => t.boxResult === "push").length;
  const voids = sides.filter((t) => t.boxResult === "void").length;
  if (unstampedFinal.length) {
    return {
      status: "partial",
      now: `${unstampedFinal.length} ticket(s) have a final or a void status and are not stamped yet (${unstampedFinal.slice(0, 3).join(", ")}). Closed book: ${sides.length} graded at ${board.fetchedAt}.`,
    };
  }
  return {
    status: "pass",
    now: `${sides.length} of ${sides.length} Week 1–2 sides and totals graded from the ESPN scoreboard at ${board.fetchedAt}. ${disagree.length} disagreed with the archive. Pushes ${pushes}. Voids ${voids}. ${uncovered} prop and parlay rows are not grades. Week ${WEEK}: ${liveFinal} final, ${liveOpen} not final. Live tickets keep an empty settlement source until a final. A final includes overtime. A tie on the number is a push. Postponed, canceled, and suspended void the ticket and keep it.`,
  };
}
