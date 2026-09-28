import { isLiveBook } from "./books";
import { GAMES } from "./slate";

export type IntegrityStatus = "open" | "valid" | "invalid" | "corrected" | "void";

export interface AuditEvent {
  at: number;
  type: "priced" | "locked" | "correction" | "void" | "refused" | "settlement";
  note: string;
  actor: string;
}

export interface TicketAudit {
  ticketId: string;
  cardId: string;
  marketId: string;
  modelVersion: string;
  inputSnapshotHash: string;
  oddsSource: string;
  sourceTimestamp: number;
  recommendationTimestamp: number;
  cardLockTimestamp: number | null;
  kickoffTimestamp: number;
  lockActor: string | null;
  settlementSource: string | null;
  settlementTimestamp: number | null;
  events: AuditEvent[];
  integrity: IntegrityStatus;
  voidReason?: string;
}

function sourceStamp(source: string, fallback: number) {
  const m = source.match(/\d{4}-\d{2}-\d{2}T[0-9:.]+Z/);
  if (!m) return fallback;
  const t = Date.parse(m[0]);
  return Number.isFinite(t) ? t : fallback;
}

export function snapshotHash(parts: Record<string, string | number>) {
  const raw = JSON.stringify(parts);
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fnv1a_${(h >>> 0).toString(16).padStart(8, "0")}`;
}

export function integrityOf(a: Pick<TicketAudit, "recommendationTimestamp" | "cardLockTimestamp" | "kickoffTimestamp" | "voidReason" | "events">): IntegrityStatus {
  if (a.voidReason) return "void";
  if (a.events.some((e) => e.type === "correction")) return "corrected";
  const rec = a.recommendationTimestamp;
  const lock = a.cardLockTimestamp;
  const kick = a.kickoffTimestamp;
  if (lock == null) {
    if (rec >= kick) return "invalid";
    return "open";
  }
  if (rec > lock || rec >= kick || lock >= kick) return "invalid";
  if (rec <= lock && lock < kick) return "valid";
  return "invalid";
}

export function buildAudit(play: {
  id: string;
  runId: string;
  market: string;
  line: number;
  price: number;
  modelP: number;
  source: string;
  modelVersion: string;
  pricedAt: number;
  gameId?: string;
}): TicketAudit {
  const game = play.gameId ? GAMES.find((g) => g.id === play.gameId) : undefined;
  const kickoffTimestamp = game ? Date.parse(game.kickoff) : play.pricedAt;
  const inputSnapshotHash = snapshotHash({
    market: play.market,
    line: play.line,
    price: play.price,
    modelP: Number(play.modelP.toFixed(6)),
    source: play.source,
    model: play.modelVersion,
  });
  const draft: TicketAudit = {
    ticketId: play.id,
    cardId: play.runId,
    marketId: play.id,
    modelVersion: play.modelVersion,
    inputSnapshotHash,
    oddsSource: play.source,
    sourceTimestamp: sourceStamp(play.source, play.pricedAt),
    recommendationTimestamp: play.pricedAt,
    cardLockTimestamp: null,
    kickoffTimestamp,
    lockActor: null,
    settlementSource: null,
    settlementTimestamp: null,
    events: [
      {
        at: play.pricedAt,
        type: "priced",
        note: isLiveBook(play.source)
          ? `Recommendation at ${play.source}`
          : "Recommendation written from the priced sheet",
        actor: "automation:slate",
      },
    ],
    integrity: "open",
  };
  draft.integrity = integrityOf(draft);
  return draft;
}

/** True only when the recommendation is already written and the stamp is strictly before sheet kickoff. */
export function beforeKickoff(audit: TicketAudit, at: number) {
  return audit.recommendationTimestamp <= at && at < audit.kickoffTimestamp;
}

export function applyCardLock(audits: TicketAudit[], at: number, actor = "operator:desk") {
  const open = audits.filter((a) => !a.voidReason);
  const blocked = open.filter((a) => !beforeKickoff(a, at));
  const earliest = open.reduce<number | null>((min, a) => (min == null ? a.kickoffTimestamp : Math.min(min, a.kickoffTimestamp)), null);
  if (!open.length) return { ok: false as const, reason: "NO_TICKETS" as const, earliest, at };
  if (blocked.length) return { ok: false as const, reason: "KICKOFF" as const, earliest, blocked: blocked.length, at };
  return { ok: true as const, reason: "ok" as const, earliest, at, actor };
}

export function lockAudit(audit: TicketAudit, at: number, actor = "operator:desk"): TicketAudit {
  const next: TicketAudit = {
    ...audit,
    cardLockTimestamp: at,
    lockActor: actor,
    events: [
      ...audit.events,
      { at, type: "locked", note: "Card locked. Original retained. Further edits append.", actor },
    ],
  };
  next.integrity = integrityOf(next);
  return next;
}

export function appendAudit(
  audit: TicketAudit,
  event: Omit<AuditEvent, "at"> & { at?: number },
  patch?: Partial<Pick<TicketAudit, "voidReason" | "settlementSource" | "settlementTimestamp">>,
): TicketAudit {
  const next: TicketAudit = {
    ...audit,
    ...patch,
    events: [...audit.events, { at: event.at ?? Date.now(), type: event.type, note: event.note, actor: event.actor }],
  };
  next.integrity = integrityOf(next);
  return next;
}
