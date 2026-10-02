import { applyQuotes, type LiveBoard } from "./books";
import { abbrOf, american, gameId, getJson } from "./espn";
import { pullWeekSlate } from "./live-slate.server";
import type { BookQuote } from "./types";

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
  const jobs = [
    ["FanDuel", () => fanDuel(fetchedAt)],
    ["Bovada", () => bovada(fetchedAt)],
    ["Pinnacle", () => pinnacle(fetchedAt)],
  ] as const;
  const [slate, settled] = await Promise.all([
    pullWeekSlate(fetchedAt),
    Promise.allSettled(jobs.map(([, fn]) => fn())),
  ]);
  const quotes: BookQuote[] = [...slate.quotes];
  const books: string[] = [];
  const errors: string[] = [];
  if (slate.quotes.length) books.push("DraftKings");
  else if (slate.error) errors.push(slate.error);
  else errors.push("DraftKings: empty");
  settled.forEach((res, i) => {
    const name = jobs[i][0];
    if (res.status === "fulfilled" && res.value.length) {
      quotes.push(...res.value);
      books.push(name);
    } else {
      errors.push(res.status === "rejected" ? `${name}: ${res.reason instanceof Error ? res.reason.message : res.reason}` : `${name}: empty`);
    }
  });
  const games = slate.games.length ? applyQuotes(slate.games, quotes) : [];
  return {
    fetchedAt,
    quotes,
    books,
    errors,
    week: slate.week,
    games,
    teamForm: slate.teamForm,
  teamMargins: slate.teamMargins,
    weatherOk: slate.weatherOk,
    injuryOk: slate.injuryOk,
  };
}
