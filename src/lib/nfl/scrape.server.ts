import { getSql } from "@/lib/db";
import { parseEspnScoreboard } from "./box";
import { pullLiveBoard } from "./live-books.server";
import { SEASON, syncWeek } from "./slate";
import type { BookQuote } from "./types";

const MINUTE = 60_000;

type PrintRow = {
  book: string;
  game_id: string;
  week: number | null;
  kickoff: string | null;
  fetched_at: string;
  spread: string;
  spread_price: number;
  total: string;
  total_price: number;
};

type ScoreRow = {
  week: number;
  event_id: string;
  game_id: string;
  status: string;
  away_score: number | null;
  home_score: number | null;
  detail: string;
  seen_at: string;
};

let running: Promise<void> | null = null;

async function lastPrints() {
  const sql = await getSql();
  return sql<{ book: string; game_id: string; spread: string; spread_price: number; total: string; total_price: number }>`
    select distinct on (book, game_id) book, game_id, spread, spread_price, total, total_price
    from market_prints
    order by book, game_id, id desc
  `;
}

function changed(prev: { spread: string; spread_price: number; total: string; total_price: number } | undefined, q: BookQuote) {
  if (!prev) return true;
  return prev.spread !== String(q.spread) || Number(prev.spread_price) !== q.homeSpreadPrice || prev.total !== String(q.total) || Number(prev.total_price) !== q.overPrice;
}

async function storeQuotes(quotes: BookQuote[]) {
  const prior = await lastPrints();
  const have = new Map(prior.map((row) => [`${row.book}|${row.game_id}`, row]));
  const sql = await getSql();
  let inserted = 0;
  for (const quote of quotes) {
    const prev = have.get(`${quote.book}|${quote.gameId}`);
    if (!changed(prev, quote)) continue;
    await sql`
      insert into market_prints (book, game_id, week, kickoff, fetched_at, spread, spread_price, total, total_price)
      values (${quote.book}, ${quote.gameId}, ${quote.week ?? null}, ${quote.kickoff ?? null}, ${quote.fetchedAt}, ${String(quote.spread)}, ${quote.homeSpreadPrice}, ${String(quote.total)}, ${quote.overPrice})
    `;
    inserted += 1;
  }
  return inserted;
}

async function pullScores(at: string) {
  const through = Math.min(18, syncWeek() + 1);
  const weeks = Array.from({ length: through }, (_, i) => i + 1);
  const games = [];
  const errors: string[] = [];
  for (const week of weeks) {
    try {
      const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}&dates=${SEASON}`, {
        headers: { accept: "application/json", "user-agent": "SyndicateSports/1.0" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      games.push(...parseEspnScoreboard(week, await res.json()));
    } catch (err) {
      errors.push(`week ${week}: ${err instanceof Error ? err.message : "fetch failed"}`);
    }
  }
  const sql = await getSql();
  const prior = await sql<{ event_id: string; status: string; away_score: number | null; home_score: number | null }>`
    select distinct on (event_id) event_id, status, away_score, home_score
    from score_prints
    order by event_id, id desc
  `;
  const have = new Map(prior.map((row) => [row.event_id, row]));
  let inserted = 0;
  for (const game of games) {
    if (!game.eventId) continue;
    const prev = have.get(game.eventId);
    const same =
      prev &&
      prev.status === game.status &&
      (prev.away_score == null ? null : Number(prev.away_score)) === game.awayScore &&
      (prev.home_score == null ? null : Number(prev.home_score)) === game.homeScore;
    if (same) continue;
    const gameId = `${game.away.toLowerCase()}-${game.home.toLowerCase()}`;
    await sql`
      insert into score_prints (week, event_id, game_id, status, away_score, home_score, detail, seen_at)
      values (${game.week}, ${game.eventId}, ${gameId}, ${game.status}, ${game.awayScore}, ${game.homeScore}, ${game.detail}, ${at})
    `;
    inserted += 1;
  }
  return { inserted, errors };
}

export async function runScrape() {
  if (running) return running;
  running = scrapeOnce().finally(() => {
    running = null;
  });
  return running;
}

async function scrapeOnce() {
  const started = new Date().toISOString();
  const board = await pullLiveBoard();
  const inserted = await storeQuotes(board.quotes);
  const scores = await pullScores(board.fetchedAt);
  const note = [board.lookaheadNote, ...board.errors, ...scores.errors].filter(Boolean).join(" · ").slice(0, 500);
  const sql = await getSql();
  await sql`
    insert into scrape_runs (started_at, quotes, inserted, scores, note)
    values (${started}, ${board.quotes.length}, ${inserted}, ${scores.inserted}, ${note})
  `;
}

export async function readTape() {
  const sql = await getSql();
  const prints = await sql<PrintRow>`
    select book, game_id, week, kickoff, fetched_at, spread, spread_price, total, total_price
    from market_prints
    order by id desc
    limit 2500
  `;
  const runs = await sql<{ started_at: string; quotes: number; inserted: number; scores: number; note: string }>`
    select started_at, quotes, inserted, scores, note from scrape_runs order by id desc limit 1
  `;
  const scoreCount = await sql<{ n: number }>`select count(*) as n from score_prints`;
  return {
    prints: prints.reverse(),
    last: runs[0] ?? null,
    scores: Number(scoreCount[0]?.n ?? 0),
  };
}

export function startScraper() {
  const slot = globalThis as typeof globalThis & { __syndicateScrape__?: boolean };
  if (slot.__syndicateScrape__) return;
  slot.__syndicateScrape__ = true;
  const tick = () => {
    runScrape().catch((err) => console.error("[scrape]", err instanceof Error ? err.message : err));
  };
  tick();
  setInterval(tick, MINUTE);
}
