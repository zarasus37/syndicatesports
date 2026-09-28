import { TEAMS } from "./teams";
import { syncWeek } from "./slate";
import type { BookQuote, TeamAbbr } from "./types";
import type { LiveBoard } from "./books";

const NAME_TO_ABBR: Record<string, TeamAbbr> = {};
for (const t of Object.values(TEAMS)) {
  NAME_TO_ABBR[`${t.city} ${t.name}`.toLowerCase()] = t.abbr;
}
NAME_TO_ABBR["washington football team"] = "WAS";

function abbrOf(name: string): TeamAbbr | null {
  const key = name.trim().toLowerCase().replace(/\./g, "");
  if (NAME_TO_ABBR[key]) return NAME_TO_ABBR[key];
  const nick = key.split(/\s+/).pop() ?? "";
  const hits = Object.values(TEAMS).filter((t) => t.name.toLowerCase() === nick);
  return hits.length === 1 ? hits[0].abbr : null;
}

const ESPN_ABBR: Record<string, TeamAbbr> = { WSH: "WAS", JAC: "JAX", LA: "LAR" };

function espnAbbr(raw: string): TeamAbbr | null {
  const u = raw.trim().toUpperCase();
  if (u in TEAMS) return u as TeamAbbr;
  return ESPN_ABBR[u] ?? null;
}

function gameId(away: string, home: string) {
  return `${away.toLowerCase()}-${home.toLowerCase()}`;
}

function american(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const n = Number(raw.replace(/[^\d.+-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "SyndicateSports/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function espnWeek(week: number, at: string): Promise<{ quotes: BookQuote[]; kickoffs: Record<string, string> }> {
  const data = await getJson(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}&dates=2026`);
  const quotes: BookQuote[] = [];
  const kickoffs: Record<string, string> = {};
  for (const event of data.events ?? []) {
    const comp = event.competitions?.[0];
    const teams = comp?.competitors ?? [];
    const home = espnAbbr(teams.find((t: { homeAway?: string }) => t.homeAway === "home")?.team?.abbreviation ?? "");
    const away = espnAbbr(teams.find((t: { homeAway?: string }) => t.homeAway === "away")?.team?.abbreviation ?? "");
    if (!home || !away) continue;
    const id = gameId(away, home);
    const kickoff = typeof event.date === "string" ? event.date : typeof comp?.date === "string" ? comp.date : "";
    if (kickoff) kickoffs[id] = kickoff;
    const odds = comp?.odds?.[0];
    if (!odds) continue;
    const homeSpread = american(odds.pointSpread?.home?.close?.line ?? odds.spread);
    const homePrice = american(odds.pointSpread?.home?.close?.odds);
    const awayPrice = american(odds.pointSpread?.away?.close?.odds);
    const total = american(String(odds.overUnder ?? "").replace(/[^\d.]/g, ""));
    const overPrice = american(odds.total?.over?.close?.odds);
    const underPrice = american(odds.total?.under?.close?.odds);
    const homeMl = american(odds.moneyline?.home?.close?.odds);
    const awayMl = american(odds.moneyline?.away?.close?.odds);
    if (homeSpread == null || homePrice == null || awayPrice == null || total == null || overPrice == null || underPrice == null || homeMl == null || awayMl == null) continue;
    quotes.push({
      book: "DraftKings",
      gameId: id,
      fetchedAt: at,
      spread: homeSpread,
      homeSpreadPrice: homePrice,
      awaySpreadPrice: awayPrice,
      total,
      overPrice,
      underPrice,
      homeMl,
      awayMl,
      week,
      kickoff: kickoff || undefined,
    });
  }
  return { quotes, kickoffs };
}

async function fanDuel(at: string): Promise<BookQuote[]> {
  const data = await getJson("https://sbapi.nj.sportsbook.fanduel.com/api/content-managed-page?page=CUSTOM&customPageId=nfl&_ak=FhMFpcPWXMeyZxOx");
  const events = Object.values(data.attachments?.events ?? {}) as { eventId: number; name: string }[];
  const markets = Object.values(data.attachments?.markets ?? {}) as {
    eventId: number;
    marketType: string;
    marketName: string;
    runners: { runnerName: string; handicap?: number; winRunnerOdds?: { americanDisplayOdds?: { americanOddsInt?: number } } }[];
  }[];
  const byEvent = new Map<number, typeof markets>();
  for (const m of markets) {
    const list = byEvent.get(m.eventId) ?? [];
    list.push(m);
    byEvent.set(m.eventId, list);
  }
  const out: BookQuote[] = [];
  for (const event of events) {
    const parts = event.name.split(" @ ");
    if (parts.length !== 2) continue;
    const away = abbrOf(parts[0]);
    const home = abbrOf(parts[1]);
    if (!away || !home) continue;
    const ms = byEvent.get(event.eventId) ?? [];
    const spread = ms.find((m) => m.marketType === "MATCH_HANDICAP_(2-WAY)" && m.marketName === "Spread");
    const total = ms.find((m) => m.marketType === "TOTAL_POINTS_(OVER/UNDER)" && m.marketName === "Total Points");
    const ml = ms.find((m) => m.marketType === "MONEY_LINE" && m.marketName === "Moneyline");
    if (!spread || !total || !ml) continue;
    const price = (name: string, market: typeof spread) => {
      const r = market.runners.find((x) => x.runnerName === name || x.runnerName.startsWith(name));
      return r?.winRunnerOdds?.americanDisplayOdds?.americanOddsInt ?? null;
    };
    const homeName = parts[1];
    const awayName = parts[0];
    const homeRunner = spread.runners.find((r) => r.runnerName === homeName);
    const awayRunner = spread.runners.find((r) => r.runnerName === awayName);
    const over = total.runners.find((r) => r.runnerName === "Over");
    const under = total.runners.find((r) => r.runnerName === "Under");
    const homeSpreadPrice = price(homeName, spread);
    const awaySpreadPrice = price(awayName, spread);
    const overPrice = price("Over", total);
    const underPrice = price("Under", total);
    const homeMl = price(homeName, ml);
    const awayMl = price(awayName, ml);
    if (
      homeRunner?.handicap == null ||
      homeSpreadPrice == null ||
      awaySpreadPrice == null ||
      over?.handicap == null ||
      overPrice == null ||
      underPrice == null ||
      homeMl == null ||
      awayMl == null
    ) {
      continue;
    }
    out.push({
      book: "FanDuel",
      gameId: gameId(away, home),
      fetchedAt: at,
      spread: homeRunner.handicap,
      homeSpreadPrice,
      awaySpreadPrice,
      total: over.handicap,
      overPrice,
      underPrice,
      homeMl,
      awayMl,
    });
    void awayRunner;
  }
  return out;
}

async function bovada(at: string): Promise<BookQuote[]> {
  const data = await getJson("https://www.bovada.lv/services/sports/event/coupon/events/A/description/football/nfl?marketFilterId=def&preMatchOnly=true&eventsLimit=50&lang=en");
  const events = data?.[0]?.events ?? [];
  const out: BookQuote[] = [];
  for (const event of events) {
    const teams = (event.description as string).split(" @ ");
    if (teams.length !== 2) continue;
    const away = abbrOf(teams[0]);
    const home = abbrOf(teams[1]);
    if (!away || !home) continue;
    const markets = event.displayGroups?.[0]?.markets ?? [];
    const find = (desc: string) => markets.find((m: { description?: string }) => m.description === desc);
    const spread = find("Point Spread");
    const total = find("Total");
    const ml = find("Moneyline");
    if (!spread || !total || !ml) continue;
    const outc = (m: { outcomes?: { description: string; price?: { handicap?: string; american?: string } }[] }, name: string) =>
      m.outcomes?.find((o) => o.description === name);
    const homeS = outc(spread, teams[1]);
    const awayS = outc(spread, teams[0]);
    const over = outc(total, "Over");
    const under = outc(total, "Under");
    const homeM = outc(ml, teams[1]);
    const awayM = outc(ml, teams[0]);
    const spreadN = american(homeS?.price?.handicap ?? "");
    const totalN = american(over?.price?.handicap ?? "");
    const nums = [homeS?.price?.american, awayS?.price?.american, over?.price?.american, under?.price?.american, homeM?.price?.american, awayM?.price?.american].map(american);
    if (spreadN == null || totalN == null || nums.some((n) => n == null)) continue;
    out.push({
      book: "Bovada",
      gameId: gameId(away, home),
      fetchedAt: at,
      spread: spreadN,
      homeSpreadPrice: nums[0]!,
      awaySpreadPrice: nums[1]!,
      total: totalN,
      overPrice: nums[2]!,
      underPrice: nums[3]!,
      homeMl: nums[4]!,
      awayMl: nums[5]!,
    });
  }
  return out;
}

async function pinnacle(at: string): Promise<BookQuote[]> {
  const [matchups, markets] = await Promise.all([
    getJson("https://guest.api.arcadia.pinnacle.com/0.1/leagues/889/matchups"),
    getJson("https://guest.api.arcadia.pinnacle.com/0.1/leagues/889/markets/straight"),
  ]);
  const games = (matchups as { id: number; type?: string; participants?: { alignment: string; name: string }[] }[]).filter((m) => m.type === "matchup");
  const mk = markets as { matchupId: number; period: number; type: string; isAlternate?: boolean; prices: { designation: string; price: number; points?: number }[] }[];
  const out: BookQuote[] = [];
  for (const g of games) {
    const home = g.participants?.find((p) => p.alignment === "home");
    const away = g.participants?.find((p) => p.alignment === "away");
    if (!home || !away) continue;
    const h = abbrOf(home.name);
    const a = abbrOf(away.name);
    if (!h || !a) continue;
    const mine = mk.filter((m) => m.matchupId === g.id && m.period === 0 && m.isAlternate === false);
    const spread = mine.find((m) => m.type === "spread");
    const total = mine.find((m) => m.type === "total");
    const ml = mine.find((m) => m.type === "moneyline");
    const px = (m: typeof spread, d: string) => m?.prices.find((p) => p.designation === d);
    const hs = px(spread, "home");
    const as = px(spread, "away");
    const ov = px(total, "over");
    const un = px(total, "under");
    const hm = px(ml, "home");
    const am = px(ml, "away");
    if (hs?.points == null || as?.price == null || ov?.points == null || un?.price == null || hm?.price == null || am?.price == null || hs.price == null) continue;
    out.push({
      book: "Pinnacle",
      gameId: gameId(a, h),
      fetchedAt: at,
      spread: hs.points,
      homeSpreadPrice: hs.price,
      awaySpreadPrice: as.price,
      total: ov.points,
      overPrice: ov.price,
      underPrice: un.price,
      homeMl: hm.price,
      awayMl: am.price,
    });
  }
  return out;
}

export async function pullLiveBoard(): Promise<LiveBoard> {
  const fetchedAt = new Date().toISOString();
  const week = syncWeek();
  const nextWeek = week < 18 ? week + 1 : week;
  const espn = await Promise.allSettled([espnWeek(week, fetchedAt), ...(nextWeek === week ? [] : [espnWeek(nextWeek, fetchedAt)])]);
  const kickoffs: Record<string, string> = {};
  const weekOf = new Map<string, number>();
  const quotes: BookQuote[] = [];
  const books: string[] = [];
  const errors: string[] = [];
  espn.forEach((res, i) => {
    const week = i === 0 ? syncWeek() : syncWeek() + 1;
    if (res.status === "rejected") {
      errors.push(`DraftKings week ${week}: ${res.reason instanceof Error ? res.reason.message : res.reason}`);
      return;
    }
    Object.assign(kickoffs, res.value.kickoffs);
    for (const id of Object.keys(res.value.kickoffs)) weekOf.set(id, week);
    for (const q of res.value.quotes) weekOf.set(q.gameId, week);
    quotes.push(...res.value.quotes);
  });
  if (quotes.some((q) => q.book === "DraftKings" && q.week === syncWeek())) books.push("DraftKings");
  const jobs = [
    ["FanDuel", () => fanDuel(fetchedAt)],
    ["Bovada", () => bovada(fetchedAt)],
    ["Pinnacle", () => pinnacle(fetchedAt)],
  ] as const;
  const settled = await Promise.allSettled(jobs.map(([, fn]) => fn()));
  settled.forEach((res, i) => {
    const name = jobs[i][0];
    if (res.status === "fulfilled" && res.value.length) {
      for (const q of res.value) {
        const week = weekOf.get(q.gameId);
        quotes.push({ ...q, week, kickoff: kickoffs[q.gameId] });
      }
      books.push(name);
    } else {
      errors.push(res.status === "rejected" ? `${name}: ${res.reason}` : `${name}: empty`);
    }
  });
  const ahead = quotes.filter((q) => q.week === nextWeek);
  const aheadGames = new Set(ahead.map((q) => q.gameId)).size;
  const lookaheadNote = aheadGames
    ? `Week ${nextWeek}: ${aheadGames} games returned by ${[...new Set(ahead.map((q) => q.book))].join(", ")}. First stored print is not the book's look-ahead release.`
    : `Week ${nextWeek}: no number stored this fetch. That does not mean a book has not posted one.`;
  return { fetchedAt, quotes, books, errors, lookaheadNote };
}
