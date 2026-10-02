import { impliedProb, probToAmerican } from "./odds";
import type { NflGame, PropLine } from "./types";

export const SEASON = 2026;
export const SEEDED_WEEK = 3;
export let WEEK = SEEDED_WEEK;
export let SLATE_LABEL = "Week 3 · 2026";

/** Standard two-way book margin used to pair a spread's two sides. */
const BOOK_MARGIN = 0.035;

/**
 * Derive the opposite side's price from the quoted one.
 *
 * The engine grades both sides of a spread, and it used to fall back to the
 * home price whenever `awaySpreadPrice` was missing — which it always was for
 * this seeded slate. That priced both sides identically while the model
 * assigned them different probabilities, so the underdog side carried a large
 * phantom negative EV (around -8% at -107) that had nothing to do with the
 * model. It dragged every aggregate EV figure on the desk downward.
 *
 * Live ingestion quotes both sides itself, which is why this only bit in
 * seeded/demo mode. Deriving the pair here keeps the seeded market internally
 * coherent: the two implied probabilities sum to 1 + margin, exactly as a real
 * two-way spread does.
 */
export function pairedPrice(price: number, margin = BOOK_MARGIN): number {
  const other = 1 + margin - impliedProb(price);
  if (other <= 0.02 || other >= 0.98) return price;
  return probToAmerican(other);
}

/** Attach the missing away-side price to a seeded line. */
export function withAwayPrice(l: NflGame["line"]): NflGame["line"] {
  return { ...l, awaySpreadPrice: l.awaySpreadPrice ?? pairedPrice(l.spreadPrice) };
}

export const GAMES: NflGame[] = [
  {
    id: "atl-gb",
    week: 3,
    kickoff: "2026-09-24T20:15:00-04:00",
    kickoffLabel: "Thu 8:15 PM ET",
    network: "Prime",
    crewId: "blakeman",
    away: "ATL",
    home: "GB",
    line: { spread: -6.5, spreadOpen: -5.0, spreadPrice: -107, total: 44.5, totalOpen: 45.5, overPrice: -104, underPrice: -116, homeMl: -287, awayMl: 231 },
    public: { ticketsHome: 72, handleHome: 64, ticketsOver: 48, handleOver: 44 },
    weather: { venue: "Lambeau Field", city: "Green Bay", roof: "open", tempF: 58, windMph: 11, note: "Cool, light NW wind" },
    notes: ["Falcons 16 points scored through two weeks", "Love at home after OT win at the Jets"],
  },
  {
    id: "lac-buf",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "FOX",
    crewId: "wrolstad",
    away: "LAC",
    home: "BUF",
    line: { spread: -7.0, spreadOpen: -6.5, spreadPrice: -111, total: 50.5, totalOpen: 49.0, overPrice: -105, underPrice: -115, homeMl: -339, awayMl: 271 },
    public: { ticketsHome: 68, handleHome: 62, ticketsOver: 61, handleOver: 55 },
    weather: { venue: "Highmark Stadium", city: "Orchard Park", roof: "open", tempF: 64, windMph: 14, note: "Breezy, outdoor" },
    notes: ["Chargers 0-2 after home losses to ARI and LV", "Allen coming off 41-point night vs Detroit"],
  },
  {
    id: "car-cle",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "FOX",
    crewId: "allen",
    away: "CAR",
    home: "CLE",
    line: { spread: 2.5, spreadOpen: -1.5, spreadPrice: -118, total: 41.5, totalOpen: 41.0, overPrice: -108, underPrice: -118, homeMl: 125, awayMl: -150 },
    public: { ticketsHome: 71, handleHome: 38, ticketsOver: 44, handleOver: 42 },
    weather: { venue: "Huntington Bank Field", city: "Cleveland", roof: "open", tempF: 67, windMph: 9 },
    notes: ["Four-point reverse from CLE -1.5 to CAR -2.5", "Carolina just posted 34-3 in Atlanta"],
  },
  {
    id: "nyj-det",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "FOX",
    crewId: "hochuli",
    away: "NYJ",
    home: "DET",
    line: { spread: -6.5, spreadOpen: -7.5, spreadPrice: -115, total: 48.5, totalOpen: 49.5, overPrice: -105, underPrice: -115, homeMl: -314, awayMl: 253 },
    public: { ticketsHome: 64, handleHome: 48, ticketsOver: 52, handleOver: 49 },
    weather: { venue: "Ford Field", city: "Detroit", roof: "dome" },
    notes: ["Line drifted off Detroit -7.5 after the Buffalo loss", "Jets coming off OT loss to Green Bay"],
  },
  {
    id: "hou-ind",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "CBS",
    crewId: "clark",
    away: "HOU",
    home: "IND",
    line: { spread: 2.5, spreadOpen: 3.5, spreadPrice: -103, total: 43.5, totalOpen: 44.0, overPrice: -112, underPrice: -108, homeMl: 125, awayMl: -149 },
    public: { ticketsHome: 42, handleHome: 38, ticketsOver: 50, handleOver: 48 },
    weather: { venue: "Lucas Oil Stadium", city: "Indianapolis", roof: "retractable" },
    notes: ["Texans remain a small road favorite", "Colts coming off OT loss in Kansas City"],
  },
  {
    id: "ten-nyg",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "CBS",
    crewId: "martin",
    away: "TEN",
    home: "NYG",
    line: { spread: -5.5, spreadOpen: -3.5, spreadPrice: -109, total: 43.5, totalOpen: 42.0, overPrice: -105, underPrice: -120, homeMl: -260, awayMl: 210 },
    public: { ticketsHome: 61, handleHome: 68, ticketsOver: 55, handleOver: 52 },
    weather: { venue: "MetLife Stadium", city: "East Rutherford", roof: "open", tempF: 69, windMph: 8 },
    notes: ["2-point steam onto the Giants, now -5.5", "Titans still looking for first win"],
  },
  {
    id: "ne-jax",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "CBS",
    crewId: "hill",
    away: "NE",
    home: "JAX",
    line: { spread: -2.5, spreadOpen: -1.5, spreadPrice: -105, total: 44.5, totalOpen: 44.5, overPrice: -108, underPrice: -112, homeMl: -155, awayMl: 130 },
    public: { ticketsHome: 54, handleHome: 57, ticketsOver: 48, handleOver: 46 },
    weather: { venue: "EverBank Stadium", city: "Jacksonville", roof: "open", tempF: 86, windMph: 7, note: "Hot, humid" },
    notes: ["Sitting on 2.5 after opening JAX -1.5", "Patriots defense just held Pittsburgh to 3"],
  },
  {
    id: "cin-pit",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "CBS",
    crewId: "vinovich",
    away: "CIN",
    home: "PIT",
    line: { spread: 3.5, spreadOpen: 2.5, spreadPrice: -112, total: 42.5, totalOpen: 43.5, overPrice: -110, underPrice: -110, homeMl: 151, awayMl: -181 },
    public: { ticketsHome: 41, handleHome: 36, ticketsOver: 47, handleOver: 44 },
    weather: { venue: "Acrisure Stadium", city: "Pittsburgh", roof: "open", tempF: 66, windMph: 8 },
    notes: ["Division game. Burrow on the road as a road favorite", "Steelers offense stalled at New England"],
  },
  {
    id: "sea-was",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "FOX",
    crewId: "cheffers",
    away: "SEA",
    home: "WAS",
    line: { spread: 6.5, spreadOpen: 4.5, spreadPrice: -109, total: 39.5, totalOpen: 43.0, overPrice: -107, underPrice: -123, homeMl: 235, awayMl: -290 },
    public: { ticketsHome: 28, handleHome: 24, ticketsOver: 31, handleOver: 22 },
    weather: { venue: "Northwest Stadium", city: "Landover", roof: "open", tempF: 72, windMph: 6 },
    notes: ["Two-point steam to Seattle", "Total slammed under from 43"],
  },
  {
    id: "kc-mia",
    week: 3,
    kickoff: "2026-09-27T13:00:00-04:00",
    kickoffLabel: "Sun 1:00 PM ET",
    network: "CBS",
    crewId: "torbert",
    away: "KC",
    home: "MIA",
    line: { spread: 11.5, spreadOpen: 9.0, spreadPrice: -110, total: 45.5, totalOpen: 47.5, overPrice: -109, underPrice: -126, homeMl: 525, awayMl: -750 },
    public: { ticketsHome: 18, handleHome: 22, ticketsOver: 42, handleOver: 38 },
    weather: { venue: "Hard Rock Stadium", city: "Miami Gardens", roof: "open", tempF: 88, windMph: 10, note: "Heat stress" },
    notes: ["Large-number steam, past 10", "Dolphins offense has 24 points in two games"],
  },
  {
    id: "ari-sf",
    week: 3,
    kickoff: "2026-09-27T16:05:00-04:00",
    kickoffLabel: "Sun 4:05 PM ET",
    network: "FOX",
    crewId: "novak",
    away: "ARI",
    home: "SF",
    line: { spread: -8.5, spreadOpen: -7.0, spreadPrice: -108, total: 47.5, totalOpen: 46.5, overPrice: -116, underPrice: -104, homeMl: -433, awayMl: 339 },
    public: { ticketsHome: 74, handleHome: 69, ticketsOver: 58, handleOver: 54 },
    weather: { venue: "Levi's Stadium", city: "Santa Clara", roof: "open", tempF: 74, windMph: 12 },
    notes: ["49ers coming off 35-13 vs Miami", "Cardinals allowed 31 in Seattle"],
  },
  {
    id: "min-tb",
    week: 3,
    kickoff: "2026-09-27T16:05:00-04:00",
    kickoffLabel: "Sun 4:05 PM ET",
    network: "FOX",
    crewId: "hussey",
    away: "MIN",
    home: "TB",
    line: { spread: 1.5, spreadOpen: -1.0, spreadPrice: -109, total: 42.5, totalOpen: 44.5, overPrice: -107, underPrice: -123, homeMl: 105, awayMl: -125 },
    public: { ticketsHome: 66, handleHome: 41, ticketsOver: 38, handleOver: 32 },
    weather: { venue: "Raymond James Stadium", city: "Tampa", roof: "open", tempF: 87, windMph: 7 },
    notes: ["Side flipped off TB -1", "Vikings defensive identity after 9-3 at Chicago"],
  },
  {
    id: "lv-no",
    week: 3,
    kickoff: "2026-09-27T16:25:00-04:00",
    kickoffLabel: "Sun 4:25 PM ET",
    network: "CBS",
    crewId: "smith",
    away: "LV",
    home: "NO",
    line: { spread: -3.5, spreadOpen: -3.0, spreadPrice: -101, total: 43.5, totalOpen: 44.0, overPrice: -113, underPrice: -107, homeMl: -174, awayMl: 146 },
    public: { ticketsHome: 57, handleHome: 54, ticketsOver: 51, handleOver: 49 },
    weather: { venue: "Caesars Superdome", city: "New Orleans", roof: "dome" },
    notes: ["Saints just took down Baltimore", "Sitting on the 3 / 3.5 key"],
  },
  {
    id: "bal-dal",
    week: 3,
    kickoff: "2026-09-27T16:25:00-04:00",
    kickoffLabel: "Sun 4:25 PM ET",
    network: "CBS",
    crewId: "kemp",
    away: "BAL",
    home: "DAL",
    line: { spread: 2.5, spreadOpen: 4.5, spreadPrice: -112, total: 52.5, totalOpen: 50.5, overPrice: -108, underPrice: -112, homeMl: 130, awayMl: -155 },
    public: { ticketsHome: 32, handleHome: 51, ticketsOver: 62, handleOver: 58 },
    weather: { venue: "Maracanã Stadium", city: "Rio de Janeiro", roof: "neutral", tempF: 79, windMph: 6, note: "International, no home crowd" },
    notes: ["Neutral-site Brazil. Home field in the number is suspect", "RLM off BAL -4.5 to -2.5"],
    featured: true,
  },
  {
    id: "lar-den",
    week: 3,
    kickoff: "2026-09-27T20:20:00-04:00",
    kickoffLabel: "Sun 8:20 PM ET",
    network: "NBC",
    crewId: "blake",
    away: "LAR",
    home: "DEN",
    line: { spread: 2.5, spreadOpen: 4.0, spreadPrice: -113, total: 45.5, totalOpen: 46.5, overPrice: -110, underPrice: -110, homeMl: 112, awayMl: -132 },
    public: { ticketsHome: 29, handleHome: 48, ticketsOver: 52, handleOver: 50 },
    weather: { venue: "Empower Field", city: "Denver", roof: "open", tempF: 62, windMph: 9, note: "Altitude, thin air" },
    notes: ["Public on the Rams, number coming back to Denver", "Broncos at home vs a superior Rams side"],
    featured: true,
  },
  {
    id: "phi-chi",
    week: 3,
    kickoff: "2026-09-28T20:15:00-04:00",
    kickoffLabel: "Mon 8:15 PM ET",
    network: "ESPN",
    crewId: "eck",
    away: "PHI",
    home: "CHI",
    line: { spread: 3.5, spreadOpen: 6.0, spreadPrice: -118, total: 44.5, totalOpen: 45.5, overPrice: -106, underPrice: -113, homeMl: 154, awayMl: -185 },
    public: { ticketsHome: 27, handleHome: 46, ticketsOver: 45, handleOver: 41 },
    weather: { venue: "Soldier Field", city: "Chicago", roof: "open", tempF: 61, windMph: 13, note: "Lakefront wind" },
    notes: ["2.5-point RLM toward Chicago", "Eagles 2-0, Bears low-event 1-1"],
    featured: true,
  },
];

/** Seeded games carry a complete two-way line — see `withAwayPrice`. */
export const GAMES_WITH_LINES: NflGame[] = GAMES.map((g) => ({ ...g, line: withAwayPrice(g.line) }));

export const SLATE = GAMES_WITH_LINES;

export const PROPS: PropLine[] = [
  { id: "nix-yds", gameId: "lar-den", player: "Bo Nix", team: "DEN", market: "Pass yds", line: 225.5, overPrice: -115, underPrice: -105, dist: "normal", mean: 228, sd: 42 },
  { id: "den-sacks", gameId: "lar-den", player: "Broncos D", team: "DEN", market: "Team sacks", line: 2.5, overPrice: -110, underPrice: -110, dist: "poisson", mean: 3.1 },
  { id: "stafford-yds", gameId: "lar-den", player: "Matthew Stafford", team: "LAR", market: "Pass yds", line: 248.5, overPrice: -112, underPrice: -108, dist: "normal", mean: 246, sd: 38 },
  { id: "allen-yds", gameId: "lac-buf", player: "Josh Allen", team: "BUF", market: "Pass yds", line: 262.5, overPrice: -110, underPrice: -110, dist: "normal", mean: 268, sd: 40 },
  { id: "allen-rush", gameId: "lac-buf", player: "Josh Allen", team: "BUF", market: "Rush yds", line: 34.5, overPrice: -115, underPrice: -105, dist: "normal", mean: 38, sd: 16 },
  { id: "burrow-yds", gameId: "cin-pit", player: "Joe Burrow", team: "CIN", market: "Pass yds", line: 254.5, overPrice: -108, underPrice: -112, dist: "normal", mean: 261, sd: 36 },
  { id: "hurts-yds", gameId: "phi-chi", player: "Jalen Hurts", team: "PHI", market: "Pass yds", line: 218.5, overPrice: -110, underPrice: -110, dist: "normal", mean: 214, sd: 34 },
  { id: "lamar-yds", gameId: "bal-dal", player: "Lamar Jackson", team: "BAL", market: "Pass yds", line: 236.5, overPrice: -115, underPrice: -105, dist: "normal", mean: 242, sd: 38 },
  { id: "purdy-yds", gameId: "ari-sf", player: "Brock Purdy", team: "SF", market: "Pass yds", line: 251.5, overPrice: -110, underPrice: -110, dist: "normal", mean: 255, sd: 35 },
  { id: "mahomes-yds", gameId: "kc-mia", player: "Patrick Mahomes", team: "KC", market: "Pass yds", line: 268.5, overPrice: -114, underPrice: -106, dist: "normal", mean: 272, sd: 37 },
  { id: "dak-yds", gameId: "bal-dal", player: "Dak Prescott", team: "DAL", market: "Pass yds", line: 259.5, overPrice: -110, underPrice: -110, dist: "normal", mean: 266, sd: 39 },
  { id: "love-yds", gameId: "atl-gb", player: "Jordan Love", team: "GB", market: "Pass yds", line: 238.5, overPrice: -108, underPrice: -112, dist: "normal", mean: 232, sd: 36 },
];

const liveById = new Map<string, NflGame>();
let replacement: NflGame[] | null = null;

export function setCardWeek(week: number) {
  WEEK = week;
  SLATE_LABEL = `Week ${week} · ${SEASON}`;
}

export function installLiveGames(games: NflGame[], opts?: { replace?: boolean }) {
  liveById.clear();
  if (opts?.replace && games.length >= 8) {
    replacement = games;
    setCardWeek(games[0]?.week ?? WEEK);
  } else if (!games.length) {
    replacement = null;
  }
  for (const g of games) liveById.set(g.id, g);
}

export function activeGames(): NflGame[] {
  const base = replacement?.length ? replacement : GAMES_WITH_LINES;
  return base.map((g) => liveById.get(g.id) ?? g);
}

export function gameById(id: string): NflGame | undefined {
  return liveById.get(id) ?? replacement?.find((g) => g.id === id) ?? GAMES_WITH_LINES.find((g) => g.id === id);
}

export function getGame(id: string): NflGame | undefined {
  return gameById(id);
}
