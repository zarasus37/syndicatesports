import type { BookQuote } from "./types";

const TAPE_KEY = "syndicate.tape.v1";
const MAX_PRINTS = 2500;

export interface TapePrint {
  book: BookQuote["book"];
  gameId: string;
  week: number | null;
  kickoff: string | null;
  at: string;
  spread: number;
  spreadPrice: number;
  total: number;
  totalPrice: number;
}

export interface TapeRow {
  book: BookQuote["book"];
  gameId: string;
  week: number | null;
  kickoff: string | null;
  firstAt: string;
  lastAt: string;
  firstSpread: number;
  lastSpread: number;
  firstTotal: number;
  lastTotal: number;
  prints: number;
  window: string;
}

export function loadTape(): TapePrint[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(TAPE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TapePrint[];
    return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p.gameId === "string" && typeof p.at === "string") : [];
  } catch {
    return [];
  }
}

export function saveTape(prints: TapePrint[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(TAPE_KEY, JSON.stringify(prints.slice(-MAX_PRINTS)));
  } catch {
    /* quota */
  }
}

function sameNumber(a: TapePrint, q: BookQuote) {
  return a.spread === q.spread && a.spreadPrice === q.homeSpreadPrice && a.total === q.total && a.totalPrice === q.overPrice;
}

export function appendTape(existing: TapePrint[], quotes: BookQuote[]): TapePrint[] {
  const next = existing.slice();
  for (const q of quotes) {
    let prev: TapePrint | null = null;
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].book === q.book && next[i].gameId === q.gameId) {
        prev = next[i];
        break;
      }
    }
    if (prev && sameNumber(prev, q)) continue;
    next.push({
      book: q.book,
      gameId: q.gameId,
      week: q.week ?? prev?.week ?? null,
      kickoff: q.kickoff ?? prev?.kickoff ?? null,
      at: q.fetchedAt,
      spread: q.spread,
      spreadPrice: q.homeSpreadPrice,
      total: q.total,
      totalPrice: q.overPrice,
    });
  }
  return next.slice(-MAX_PRINTS);
}

/** Calendar window only. It is not proof of when the book first posted the number. */
export function tapeWindow(kickoff: string | null, at: number): string {
  if (!kickoff) return "posted";
  const kick = Date.parse(kickoff);
  if (!Number.isFinite(kick)) return "posted";
  const days = (kick - at) / 86_400_000;
  if (days > 8) return "look-ahead window";
  if (days > 6) return "open window";
  if (days > 5) return "Monday window";
  if (days > 0) return "main market";
  return "kickoff passed";
}

export function tapeHolding(prints: TapePrint[]): { week: number | null; prints: number; games: number }[] {
  const groups = new Map<string, { week: number | null; prints: number; games: Set<string> }>();
  for (const print of prints) {
    const key = print.week == null ? "x" : String(print.week);
    const row = groups.get(key) ?? { week: print.week, prints: 0, games: new Set<string>() };
    row.prints += 1;
    row.games.add(`${print.book}|${print.gameId}`);
    groups.set(key, row);
  }
  return [...groups.values()]
    .map((row) => ({ week: row.week, prints: row.prints, games: row.games.size }))
    .sort((a, b) => (a.week ?? 99) - (b.week ?? 99));
}

export function tapeRows(prints: TapePrint[]): TapeRow[] {
  const groups = new Map<string, TapePrint[]>();
  for (const print of prints) {
    const key = `${print.week ?? "x"}|${print.gameId}|${print.book}`;
    const list = groups.get(key) ?? [];
    list.push(print);
    groups.set(key, list);
  }
  return [...groups.values()]
    .map((list) => {
      const first = list[0];
      const last = list[list.length - 1];
      return {
        book: last.book,
        gameId: last.gameId,
        week: last.week,
        kickoff: last.kickoff,
        firstAt: first.at,
        lastAt: last.at,
        firstSpread: first.spread,
        lastSpread: last.spread,
        firstTotal: first.total,
        lastTotal: last.total,
        prints: list.length,
        window: tapeWindow(last.kickoff, Date.parse(last.at)),
      };
    })
    .sort((a, b) => (a.week ?? 99) - (b.week ?? 99) || a.gameId.localeCompare(b.gameId) || a.book.localeCompare(b.book));
}
