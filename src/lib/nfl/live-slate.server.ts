import { ESPN_SCOREBOARD, abbrOf, american, espnAbbr, gameId, getJson } from "./espn";
import { stadiumFor } from "./venues";
import type { BookQuote, GameWeather, NflGame, TeamAbbr } from "./types";
import type { TeamFormRow } from "./books";

export interface LiveSlate {
  week: number;
  season: number;
  games: NflGame[];
  quotes: BookQuote[];
  teamForm: TeamFormRow[];
  weatherOk: boolean;
  injuryOk: boolean;
  error: string | null;
}

interface RawTeam {
  homeAway?: string;
  team?: { abbreviation?: string; displayName?: string };
  records?: { summary?: string }[];
}

export async function pullWeekSlate(fetchedAt: string): Promise<LiveSlate> {
  const empty = (error: string): LiveSlate => ({
    week: 0,
    season: 0,
    games: [],
    quotes: [],
    teamForm: [],
    weatherOk: false,
    injuryOk: false,
    error,
  });
  let data: Scoreboard;
  try {
    data = (await getJson(ESPN_SCOREBOARD)) as Scoreboard;
  } catch (err) {
    return empty(`scoreboard: ${err instanceof Error ? err.message : "fetch failed"}`);
  }
  const week = Number(data.week?.number) || 0;
  const season = Number(data.season?.year ?? data.leagues?.[0]?.season?.year) || 0;
  const events = data.events ?? [];
  if (!events.length || !week) return empty("scoreboard returned no games");

  const [form, injuries] = await Promise.all([loadForm(), loadInjuries()]);
  const built = events.map((event) => toGame(event, week, fetchedAt, injuries)).filter((g): g is Built => Boolean(g));
  const outdoor = built.filter((g) => g.game.weather.roof === "open" || g.game.weather.roof === "neutral");
  const forecasts = await pool(outdoor, 5, async (row) => {
    const wx = await forecastAt(row.coords, row.game.kickoff, row.city);
    return { id: row.game.id, wx };
  });
  let weatherHits = 0;
  for (const hit of forecasts) {
    if (!hit.wx) continue;
    weatherHits += 1;
    const row = built.find((g) => g.game.id === hit.id);
    if (!row) continue;
    row.game.weather = { ...row.game.weather, tempF: hit.wx.tempF, windMph: hit.wx.windMph, note: hit.wx.note };
  }
  const games = built.map((b) => b.game);
  const quotes = built.flatMap((b) => (b.quote ? [b.quote] : []));
  return {
    week,
    season,
    games,
    quotes,
    teamForm: form,
    weatherOk: outdoor.length === 0 || weatherHits >= Math.ceil(outdoor.length / 2),
    injuryOk: injuries.size > 0,
    error: null,
  };
}

interface Built {
  game: NflGame;
  quote: BookQuote | null;
  coords: { lat: number; lon: number } | null;
  city: string;
}

interface Scoreboard {
  week?: { number?: number };
  season?: { year?: number };
  leagues?: { season?: { year?: number } }[];
  events?: RawEvent[];
}

interface RawEvent {
  date?: string;
  competitions?: RawComp[];
}

interface RawComp {
  neutralSite?: boolean;
  venue?: { fullName?: string; indoor?: boolean; address?: { city?: string; country?: string } };
  competitors?: RawTeam[];
  broadcasts?: { names?: string[] }[];
  odds?: RawOdds[];
}

interface RawOdds {
  pointSpread?: { home?: { close?: { line?: string; odds?: string }; open?: { line?: string } }; away?: { close?: { odds?: string } } };
  total?: { over?: { close?: { odds?: string }; open?: { line?: string } }; under?: { close?: { odds?: string } } };
  moneyline?: { home?: { close?: { odds?: string } }; away?: { close?: { odds?: string } } };
  overUnder?: number;
  spread?: number;
}

function toGame(event: RawEvent, week: number, fetchedAt: string, injuries: Map<TeamAbbr, string[]>): Built | null {
  const comp = event.competitions?.[0];
  if (!comp || !event.date) return null;
  const teams = comp.competitors ?? [];
  const home = espnAbbr(teams.find((t) => t.homeAway === "home")?.team?.abbreviation ?? "");
  const away = espnAbbr(teams.find((t) => t.homeAway === "away")?.team?.abbreviation ?? "");
  if (!home || !away) return null;
  const odds = comp.odds?.[0];
  const homeSpread = american(odds?.pointSpread?.home?.close?.line ?? odds?.spread);
  const homePrice = american(odds?.pointSpread?.home?.close?.odds);
  const awayPrice = american(odds?.pointSpread?.away?.close?.odds);
  const total = american(odds?.overUnder ?? odds?.total?.over?.close);
  const overPrice = american(odds?.total?.over?.close?.odds);
  const underPrice = american(odds?.total?.under?.close?.odds);
  const homeMl = american(odds?.moneyline?.home?.close?.odds);
  const awayMl = american(odds?.moneyline?.away?.close?.odds);
  const spreadOpen = american(odds?.pointSpread?.home?.open?.line) ?? homeSpread;
  const totalOpen = american(String(odds?.total?.over?.open?.line ?? "").replace(/[^\d.]/g, "")) ?? total;
  if (homeSpread == null || total == null) return null;
  const venueName = comp.venue?.fullName ?? "Stadium";
  const city = comp.venue?.address?.city ?? "";
  const country = comp.venue?.address?.country ?? "";
  const neutral = Boolean(comp.neutralSite) || (country !== "" && country !== "USA");
  const park = stadiumFor(home, venueName);
  const indoor = Boolean(comp.venue?.indoor) || (!neutral && park?.roof === "dome");
  const roof: GameWeather["roof"] = neutral ? "neutral" : indoor ? "dome" : park?.roof === "retractable" ? "retractable" : "open";
  const id = gameId(away, home);
  const priced =
    homePrice != null && awayPrice != null && overPrice != null && underPrice != null && homeMl != null && awayMl != null;
  const quote: BookQuote | null = priced
    ? {
        book: "DraftKings",
        gameId: id,
        fetchedAt,
        spread: homeSpread,
        homeSpreadPrice: homePrice,
        awaySpreadPrice: awayPrice,
        total,
        overPrice,
        underPrice,
        homeMl,
        awayMl,
      }
    : null;
  const notes = [...(injuries.get(away) ?? []), ...(injuries.get(home) ?? [])].slice(0, 6);
  notes.push("Crew assignment is not on the scoreboard. Whistle stays at the league average.");
  if (neutral) notes.push(`Neutral site · ${venueName}${city ? `, ${city}` : ""}.`);
  const names = comp.broadcasts?.[0]?.names ?? [];
  const network = networkOf(names);
  const game: NflGame = {
    id,
    week,
    kickoff: event.date,
    kickoffLabel: kickLabel(event.date),
    network,
    crewId: "unassigned",
    away,
    home,
    line: {
      spread: homeSpread,
      spreadOpen: spreadOpen ?? homeSpread,
      spreadPrice: homePrice ?? -110,
      awaySpreadPrice: awayPrice ?? -110,
      total,
      totalOpen: totalOpen ?? total,
      overPrice: overPrice ?? -110,
      underPrice: underPrice ?? -110,
      homeMl: homeMl ?? -110,
      awayMl: awayMl ?? -110,
      books: quote ? [quote] : undefined,
      priceBook: quote ? "DraftKings" : undefined,
      pricedAt: quote ? fetchedAt : undefined,
    },
    public: { ticketsHome: 50, handleHome: 50, ticketsOver: 50, handleOver: 50 },
    weather: { venue: venueName, city: city || venueName, roof },
    notes,
    featured: network === "NBC",
  };
  return { game, quote, coords: park ? { lat: park.lat, lon: park.lon } : null, city };
}

function networkOf(names: string[]) {
  const blob = names.join(" ");
  if (/prime|amazon/i.test(blob)) return "Prime";
  if (/\bNBC\b/i.test(blob)) return "NBC";
  if (/ESPN/i.test(blob)) return "ESPN";
  if (/netflix/i.test(blob)) return "Netflix";
  return names[0]?.replace(" Video", "") ?? "NFL";
}

function kickLabel(iso: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${fmt.format(new Date(iso))} ET`;
}

async function loadForm(): Promise<TeamFormRow[]> {
  try {
    const data = await getJson("https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings");
    const children = (data?.children ?? []) as { standings?: { entries?: StandEntry[] } }[];
    const entries: StandEntry[] = children.flatMap((c) => c.standings?.entries ?? []);
    const rows = entries
      .map((entry) => {
        const abbr = espnAbbr(entry.team?.abbreviation ?? "") ?? abbrOf(entry.team?.displayName ?? "");
        if (!abbr) return null;
        const wins = stat(entry, "wins");
        const losses = stat(entry, "losses");
        const ties = stat(entry, "ties");
        const pf = stat(entry, "pointsFor");
        const pa = stat(entry, "pointsAgainst");
        const games = Math.max(1, wins + losses + ties);
        return { abbr, wins, losses, ties, pf, pa, margin: (pf - pa) / games };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));
    if (rows.length < 20) return [];
    const mean = rows.reduce((s, r) => s + r.margin, 0) / rows.length;
    const sd = Math.sqrt(rows.reduce((s, r) => s + (r.margin - mean) ** 2, 0) / rows.length) || 1;
    return rows.map((r) => ({
      abbr: r.abbr,
      record: r.ties ? `${r.wins}-${r.losses}-${r.ties}` : `${r.wins}-${r.losses}`,
      pf: r.pf,
      pa: r.pa,
      ratingZ: Math.max(-2.2, Math.min(2.2, (r.margin - mean) / sd)),
    }));
  } catch {
    return [];
  }
}

interface StandEntry {
  team?: { abbreviation?: string; displayName?: string };
  stats?: { name?: string; value?: number; displayValue?: string }[];
}

function stat(entry: StandEntry, name: string) {
  const s = entry.stats?.find((x) => x.name === name);
  const n = Number(s?.value ?? s?.displayValue);
  return Number.isFinite(n) ? n : 0;
}

async function loadInjuries(): Promise<Map<TeamAbbr, string[]>> {
  const out = new Map<TeamAbbr, string[]>();
  try {
    const data = await getJson("https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries");
    const teams = (data?.injuries ?? []) as { displayName?: string; injuries?: InjuryRow[] }[];
    for (const team of teams) {
      const abbr = abbrOf(team.displayName ?? "");
      if (!abbr) continue;
      const lines: string[] = [];
      for (const row of team.injuries ?? []) {
        if (row.status !== "Out" && row.status !== "Doubtful") continue;
        const name = row.athlete?.displayName;
        if (!name) continue;
        const pos = row.athlete?.position?.abbreviation ?? "";
        lines.push(`${row.status}: ${name}${pos ? ` (${pos})` : ""}`);
        if (lines.length >= 4) break;
      }
      if (lines.length) out.set(abbr, lines);
    }
  } catch {
    /* injuries stay empty */
  }
  return out;
}

interface InjuryRow {
  status?: string;
  athlete?: { displayName?: string; position?: { abbreviation?: string } };
}

async function forecastAt(coords: { lat: number; lon: number } | null, kickoff: string, city: string) {
  try {
    const point = coords ?? (await geocode(city));
    if (!point) return null;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&hourly=temperature_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=8&timezone=UTC`;
    const data = await getJson(url);
    const times: string[] = data?.hourly?.time ?? [];
    const temps: number[] = data?.hourly?.temperature_2m ?? [];
    const winds: number[] = data?.hourly?.wind_speed_10m ?? [];
    if (!times.length) return null;
    const target = Date.parse(kickoff);
    let best = 0;
    let bestGap = Infinity;
    for (let i = 0; i < times.length; i++) {
      const stamp = times[i].endsWith("Z") ? times[i] : `${times[i]}Z`;
      const gap = Math.abs(Date.parse(stamp) - target);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    }
    const tempF = Math.round(temps[best] ?? 0);
    const windMph = Math.round(winds[best] ?? 0);
    return { tempF, windMph, note: `${tempF}°F · wind ${windMph} mph at kickoff` };
  } catch {
    return null;
  }
}

async function geocode(city: string): Promise<{ lat: number; lon: number } | null> {
  if (!city) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const data = await getJson(url);
  const hit = data?.results?.[0];
  if (!hit || typeof hit.latitude !== "number") return null;
  return { lat: hit.latitude, lon: hit.longitude };
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
