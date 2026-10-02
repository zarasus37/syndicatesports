import type { MoneyRead } from "./public";

export type TeamAbbr =
  | "ARI"
  | "ATL"
  | "BAL"
  | "BUF"
  | "CAR"
  | "CHI"
  | "CIN"
  | "CLE"
  | "DAL"
  | "DEN"
  | "DET"
  | "GB"
  | "HOU"
  | "IND"
  | "JAX"
  | "KC"
  | "LAC"
  | "LAR"
  | "LV"
  | "MIA"
  | "MIN"
  | "NE"
  | "NO"
  | "NYG"
  | "NYJ"
  | "PHI"
  | "PIT"
  | "SEA"
  | "SF"
  | "TB"
  | "TEN"
  | "WAS";

export type MarketKind = "spread" | "total" | "ml";
export type SteamSignal = "stable" | "steam" | "rlm";
export type AnomalyState = "normal" | "info" | "outlier" | "critical";
export type SharpGrade = "none" | "watch" | "sharp" | "heavy";
export type AgentId =
  | "ingestion"
  | "signals"
  | "anomaly"
  | "montecarlo"
  | "ev"
  | "parlay"
  | "execution"
  | "risk"
  | "monitor";

export interface TeamProfile {
  abbr: TeamAbbr;
  city: string;
  name: string;
  color: string;
  ratingZ: number;
  passEpa: number;
  rushEpa: number;
  defEpa: number;
  pace: number;
  record: string;
  pf: number;
  pa: number;
  variance: number;
}

export interface BookQuote {
  book: "Pinnacle" | "FanDuel" | "DraftKings" | "Bovada";
  gameId: string;
  fetchedAt: string;
  spread: number;
  homeSpreadPrice: number;
  awaySpreadPrice: number;
  total: number;
  overPrice: number;
  underPrice: number;
  homeMl: number;
  awayMl: number;
}

export interface GameLine {
  spread: number;
  spreadOpen: number;
  spreadPrice: number;
  awaySpreadPrice?: number;
  total: number;
  totalOpen: number;
  overPrice: number;
  underPrice: number;
  homeMl: number;
  awayMl: number;
  books?: BookQuote[];
  priceBook?: string;
  pricedAt?: string;
}

export interface PublicBetting {
  /** Percent of spread tickets on the home side (0–100). Away is 100 − this. */
  ticketsHome: number;
  /** Percent of spread handle on the home side (0–100). */
  handleHome: number;
  /** Percent of total tickets on the over (0–100). */
  ticketsOver: number;
  /** Percent of total handle on the over (0–100). */
  handleOver: number;
}

export interface GameWeather {
  venue: string;
  city: string;
  roof: "open" | "retractable" | "dome" | "neutral";
  tempF?: number;
  windMph?: number;
  note?: string;
}

export interface RefereeCrew {
  id: string;
  name: string;
  flagsPerGame: number;
  penaltyYds: number;
  homeBias: number;
  totalLean: number;
  dpi: "low" | "avg" | "high";
  dpiPerGame: number;
  holding: "low" | "avg" | "high";
  personalFouls: number;
  homeAts: number;
  overPct: number;
  sackLean: number;
  style: "whistle" | "standard" | "let-play";
  note?: string;
}

export type RefGrade = "quiet" | "watch" | "scripted" | "whistle";

export interface RefTell {
  id: string;
  label: string;
  pts: number;
  note: string;
}

export interface RefRead {
  crew: RefereeCrew;
  score: number;
  grade: RefGrade;
  totalLean: "over" | "under" | "even";
  sideLean: "home" | "away" | "even";
  sackLean: "up" | "down" | "even";
  passLean: "up" | "down" | "even";
  tells: RefTell[];
  conflict: string | null;
}

export interface NflGame {
  id: string;
  week: number;
  kickoff: string;
  kickoffLabel: string;
  network: string;
  crewId: string;
  away: TeamAbbr;
  home: TeamAbbr;
  line: GameLine;
  public: PublicBetting;
  weather: GameWeather;
  notes: string[];
  featured?: boolean;
}

export interface FeatureSnapshot {
  gameId: string;
  leadLag24h: number;
  steam60m: number;
  defendedKey: boolean;
  residualZ: number;
  residualPersistHours: number;
  handleTicketsDiv: number;
  sharpTiltAlign: number;
  propMismatchPts: number;
  weatherStress: number;
  outlierDev: number;
  totalMove: number;
  sideFlip: boolean;
  ticketsHome: number;
  handleHome: number;
  publicFade: boolean;
}

export interface AnomalyScore {
  gameId: string;
  score: number;
  state: AnomalyState;
  signals: string[];
  snapshot: FeatureSnapshot;
}

export interface SharpTell {
  id: string;
  label: string;
  pts: number;
  note: string;
}

export interface SharpRead {
  score: number;
  grade: SharpGrade;
  lean: TeamAbbr | null;
  leanSide: "home" | "away" | "none";
  tells: SharpTell[];
  fired: SharpTell[];
  handleLed: boolean;
  clvIfFollowed: number;
}

export interface SimPick {
  market: MarketKind;
  side: string;
  line: number;
  price: number;
  prob: number;
  sizeProb: number;
  ev: number;
  kelly: number;
}

export interface PointBuyRow {
  to: number;
  cover: number;
  deltaPts: number;
  worth: boolean;
  key: boolean;
}

export interface KeyCall {
  action: "buy" | "sell" | "hold";
  from: number;
  to: number;
  coverFrom: number;
  coverTo: number;
  evLift: number;
  worth: boolean;
  note: string;
}

export interface PathSample {
  m: number;
  t: number;
}

export interface SwingPlayer {
  id: string;
  gameId: string;
  name: string;
  team: TeamAbbr;
  pos: "QB" | "WR" | "OT" | "EDGE" | "CB" | "TE" | "RB";
  status: "active" | "questionable" | "out";
  pts: number;
  passMult?: number;
  sackMult?: number;
  note: string;
}

export interface GameSimResult {
  gameId: string;
  sims: number;
  homeMean: number;
  awayMean: number;
  meanMargin: number;
  stdMargin: number;
  meanTotal: number;
  homeWin: number;
  awayWin: number;
  homeCover: number;
  awayCover: number;
  coverPush: number;
  over: number;
  under: number;
  oneScore: number;
  homeWinBy7: number;
  awayWinBy7: number;
  land3: number;
  land7: number;
  histogram: { bin: number; p: number }[];
  pick: SimPick;
  alts: SimPick[];
  confidence: number;
  steam: SteamSignal;
  steamPts: number;
  steamDir: "favorite" | "underdog" | "none";
  /** Money-composition tilt actually applied to the mean. See `public.moneyRead`. */
  money: MoneyRead;
  anomaly: AnomalyScore;
  sharp: SharpRead;
  pointBuy: PointBuyRow[];
  keyCall: KeyCall | null;
  paths: PathSample[];
  outsApplied: string[];
  rankScore: number;
  clvPts: number;
}

export interface PropLine {
  id: string;
  gameId: string;
  player: string;
  team: TeamAbbr;
  market: string;
  line: number;
  overPrice: number;
  underPrice: number;
  dist: "normal" | "poisson";
  mean: number;
  sd?: number;
}

export interface PropSim {
  id: string;
  mean: number;
  median: number;
  pOver: number;
  evOver: number;
  evUnder: number;
  pick: "over" | "under" | "pass";
  weatherNote?: string | null;
}

export interface ParlayLeg {
  gameId: string;
  label: string;
  side: string;
  price: number;
  prob: number;
}

export interface ParlayTicket {
  id: string;
  kind: "3leg" | "sgp";
  jointMethod: "paths" | "product" | "copula";
  legs: ParlayLeg[];
  joint: number;
  fairAmerican: number;
  offeredAmerican: number;
  ev: number;
  corrPenalty: number;
}

export interface PaperTicket {
  id: string;
  placedAt: number;
  kind: "straight" | "parlay" | "prop";
  gameId?: string;
  label: string;
  side: string;
  stake: number;
  price: number;
  ev: number;
  prob: number;
  voidedAt?: number;
  modelVersion?: string;
  /** Book and fetch time when the price is a live board quote. */
  source?: string;
}

export interface AgentStatus {
  id: AgentId;
  name: string;
  role: string;
  state: "idle" | "running" | "flag" | "ok";
  last: string;
  ticks: number;
}

export type LedgerKind = "spread" | "total" | "prop" | "parlay";
export type LedgerResult = "win" | "loss" | "push" | "pending";

export interface LedgerTicket {
  id: string;
  week: number;
  kind: LedgerKind;
  matchup: string;
  side: string;
  line: number;
  price: number;
  prob: number;
  ev: number;
  tags: string[];
  clv: number;
  result: LedgerResult;
  /** When the pick was written. Present on every live ticket; absent only on
   *  rows carried in from a static archive. */
  placedAt?: number;
  /** Where the row came from. Live cards record their own provenance rather
   *  than inheriting a seeded label. */
  source?: string;
  score?: string;
  reasons: string[];
}

export interface WinnerPick {
  id: string;
  week: number;
  gameId?: string;
  matchup: string;
  winner: string;
  pWin: number;
  kickoff?: string;
  result: LedgerResult;
  actual?: string;
  score?: string;
}

export interface SlateSheetRow {
  gameId: string;
  matchup: string;
  kickoff: string;
  side: string;
  market: string;
  ev: number;
  prob: number;
  kelly: number;
  take: boolean;
  passReason: "ok" | "ev" | "size";
}
