import { americanToDecimal } from "./odds";
import type { BookQuote, NflGame, TeamAbbr } from "./types";

export interface TeamFormRow {
  abbr: TeamAbbr;
  record: string;
  pf: number;
  pa: number;
  ratingZ: number;
}

const REF_ORDER = ["Pinnacle", "FanDuel", "Bovada", "DraftKings"] as const;

export interface LiveBoard {
  fetchedAt: string;
  quotes: BookQuote[];
  books: string[];
  errors: string[];
  week: number;
  games: NflGame[];
  teamForm: TeamFormRow[];
  /** Per-team scoring margins across completed games. */
  teamMargins: Map<TeamAbbr, number[]>;
  weatherOk: boolean;
  injuryOk: boolean;
}

export function applyQuotes(games: NflGame[], quotes: BookQuote[]): NflGame[] {
  return games.map((game) => {
    const mine = quotes.filter((q) => q.gameId === game.id);
    if (!mine.length) return game;
    const ref = REF_ORDER.map((name) => mine.find((q) => q.book === name)).find(Boolean) ?? mine[0];
    return {
      ...game,
      line: {
        ...game.line,
        spread: ref.spread,
        spreadPrice: ref.homeSpreadPrice,
        awaySpreadPrice: ref.awaySpreadPrice,
        total: ref.total,
        overPrice: ref.overPrice,
        underPrice: ref.underPrice,
        homeMl: ref.homeMl,
        awayMl: ref.awayMl,
        books: mine,
        priceBook: ref.book,
        pricedAt: ref.fetchedAt,
      },
    };
  });
}

function betterPrice(a: number, b: number) {
  return americanToDecimal(a) >= americanToDecimal(b);
}

/** Best juice at the same number. A different spread is a different bet. */
export function executionQuote(
  game: NflGame,
  market: "spread" | "total" | "ml",
  side: string,
  line: number,
): { book: string; price: number; at: string } | null {
  const books = game.line.books;
  if (!books?.length || market === "ml") return null;
  const token = side.split(" ")[0];
  let best: { book: string; price: number; at: string } | null = null;
  for (const q of books) {
    let price: number | null = null;
    if (market === "total") {
      if (Math.abs(q.total - line) > 0.01) continue;
      price = token === "Over" ? q.overPrice : token === "Under" ? q.underPrice : null;
    } else if (token === game.home) {
      if (Math.abs(q.spread - line) > 0.01) continue;
      price = q.homeSpreadPrice;
    } else if (token === game.away) {
      if (Math.abs(-q.spread - line) > 0.01) continue;
      price = q.awaySpreadPrice;
    }
    if (price == null) continue;
    if (!best || betterPrice(price, best.price)) best = { book: q.book, price, at: q.fetchedAt };
  }
  return best;
}

export function isLiveBook(source: string) {
  return /Pinnacle|FanDuel|DraftKings|Bovada/.test(source);
}
