import { parseDraftKingsClose, parseEspnScoreboard, type BoxBoard, type CloseQuote } from "./box";
import { SEASON, syncWeek } from "./slate";

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "SyndicateSports/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => run()));
  return out;
}

async function pullClose(eventId: string): Promise<{ quote: CloseQuote | null; error: string | null }> {
  const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${eventId}/competitions/${eventId}/odds`;
  try {
    const data = await getJson(url);
    const items = (data?.items ?? []) as { provider?: { id?: string; name?: string }; $ref?: string; homeTeamOdds?: unknown }[];
    const dk = items.find((i) => i?.provider?.name === "DraftKings" || String(i?.provider?.id) === "100") ?? items[0];
    if (!dk) return { quote: null, error: `event ${eventId}: no odds` };
    let body: unknown = dk;
    if (!dk.homeTeamOdds && dk.$ref) {
      const href = dk.$ref.startsWith("http://") ? `https://${dk.$ref.slice(7)}` : dk.$ref;
      body = await getJson(href);
    }
    const quote = parseDraftKingsClose(eventId, body);
    return quote ? { quote, error: null } : { quote: null, error: `event ${eventId}: no DraftKings close` };
  } catch (err) {
    return { quote: null, error: `event ${eventId}: ${err instanceof Error ? err.message : "fetch failed"}` };
  }
}

export async function pullBoxBoard(): Promise<BoxBoard> {
  const weeks = Array.from({ length: syncWeek() }, (_, i) => i + 1);
  const fetchedAt = new Date().toISOString();
  const settled = await Promise.all(
    weeks.map(async (week) => {
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}&dates=${SEASON}`;
      try {
        const data = await getJson(url);
        return { week, games: parseEspnScoreboard(week, data), error: null as string | null };
      } catch (err) {
        return { week, games: [], error: `week ${week}: ${err instanceof Error ? err.message : "fetch failed"}` };
      }
    }),
  );
  const games = settled.flatMap((s) => s.games);
  const finals = games.filter((g) => g.status === "final" && g.eventId);
  const closed = await pool(finals, 6, (g) => pullClose(g.eventId));
  return {
    fetchedAt,
    source: "ESPN scoreboard",
    weeks,
    games,
    errors: settled.flatMap((s) => (s.error ? [s.error] : [])),
    closes: closed.flatMap((c) => (c.quote ? [c.quote] : [])),
    closeErrors: closed.flatMap((c) => (c.error ? [c.error] : [])),
  };
}