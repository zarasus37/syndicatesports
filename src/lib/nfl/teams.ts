import type { TeamAbbr, TeamProfile } from "./types";

export const TEAMS: Record<TeamAbbr, TeamProfile> = {
  ARI: { abbr: "ARI", city: "Arizona", name: "Cardinals", color: "#97233F", ratingZ: -0.62, passEpa: -0.06, rushEpa: -0.02, defEpa: -0.08, pace: 0.1, record: "1-1", pf: 38, pa: 62, variance: 1.05 },
  ATL: { abbr: "ATL", city: "Atlanta", name: "Falcons", color: "#A71930", ratingZ: -1.22, passEpa: -0.14, rushEpa: 0.0, defEpa: -0.2, pace: -0.1, record: "0-2", pf: 19, pa: 68, variance: 0.95 },
  BAL: { abbr: "BAL", city: "Baltimore", name: "Ravens", color: "#241773", ratingZ: 0.38, passEpa: 0.07, rushEpa: 0.08, defEpa: -0.06, pace: 0.05, record: "1-1", pf: 38, pa: 48, variance: 1.12 },
  BUF: { abbr: "BUF", city: "Buffalo", name: "Bills", color: "#00338D", ratingZ: 1.42, passEpa: 0.2, rushEpa: 0.08, defEpa: 0.08, pace: 0.16, record: "2-0", pf: 72, pa: 48, variance: 1.08 },
  CAR: { abbr: "CAR", city: "Carolina", name: "Panthers", color: "#0085CA", ratingZ: 0.28, passEpa: 0.05, rushEpa: 0.06, defEpa: 0.08, pace: 0.02, record: "1-1", pf: 55, pa: 28, variance: 1.22 },
  CHI: { abbr: "CHI", city: "Chicago", name: "Bears", color: "#0B162A", ratingZ: -0.18, passEpa: -0.02, rushEpa: 0.02, defEpa: 0.04, pace: -0.16, record: "1-1", pf: 24, pa: 27, variance: 0.96 },
  CIN: { abbr: "CIN", city: "Cincinnati", name: "Bengals", color: "#FB4F14", ratingZ: 0.78, passEpa: 0.16, rushEpa: -0.01, defEpa: 0.08, pace: 0.08, record: "2-0", pf: 44, pa: 22, variance: 1.0 },
  CLE: { abbr: "CLE", city: "Cleveland", name: "Browns", color: "#311D00", ratingZ: 0.05, passEpa: -0.02, rushEpa: 0.05, defEpa: 0.08, pace: -0.12, record: "1-1", pf: 40, pa: 36, variance: 0.92 },
  DAL: { abbr: "DAL", city: "Dallas", name: "Cowboys", color: "#003594", ratingZ: 0.52, passEpa: 0.11, rushEpa: 0.03, defEpa: -0.01, pace: 0.12, record: "1-1", pf: 58, pa: 42, variance: 1.1 },
  DEN: { abbr: "DEN", city: "Denver", name: "Broncos", color: "#FB4F14", ratingZ: 0.22, passEpa: 0.04, rushEpa: 0.02, defEpa: 0.1, pace: -0.04, record: "1-1", pf: 38, pa: 36, variance: 1.38 },
  DET: { abbr: "DET", city: "Detroit", name: "Lions", color: "#0076B6", ratingZ: 0.68, passEpa: 0.12, rushEpa: 0.05, defEpa: 0.0, pace: 0.18, record: "1-1", pf: 58, pa: 62, variance: 1.06 },
  GB: { abbr: "GB", city: "Green Bay", name: "Packers", color: "#203731", ratingZ: 0.58, passEpa: 0.1, rushEpa: 0.03, defEpa: 0.05, pace: 0.02, record: "1-1", pf: 42, pa: 36, variance: 0.96 },
  HOU: { abbr: "HOU", city: "Houston", name: "Texans", color: "#03202F", ratingZ: -0.22, passEpa: -0.02, rushEpa: -0.02, defEpa: 0.02, pace: -0.08, record: "0-2", pf: 24, pa: 42, variance: 0.94 },
  IND: { abbr: "IND", city: "Indianapolis", name: "Colts", color: "#002C5F", ratingZ: 0.08, passEpa: 0.05, rushEpa: 0.03, defEpa: -0.04, pace: 0.06, record: "0-2", pf: 52, pa: 58, variance: 1.02 },
  JAX: { abbr: "JAX", city: "Jacksonville", name: "Jaguars", color: "#006778", ratingZ: 0.02, passEpa: 0.02, rushEpa: 0.0, defEpa: -0.02, pace: 0.04, record: "1-1", pf: 32, pa: 38, variance: 1.0 },
  KC: { abbr: "KC", city: "Kansas City", name: "Chiefs", color: "#E31837", ratingZ: 1.18, passEpa: 0.15, rushEpa: 0.04, defEpa: 0.05, pace: 0.1, record: "2-0", pf: 62, pa: 52, variance: 1.04 },
  LAC: { abbr: "LAC", city: "Los Angeles", name: "Chargers", color: "#0080C6", ratingZ: -0.62, passEpa: 0.0, rushEpa: -0.06, defEpa: -0.12, pace: -0.02, record: "0-2", pf: 26, pa: 56, variance: 1.08 },
  LAR: { abbr: "LAR", city: "Los Angeles", name: "Rams", color: "#003594", ratingZ: 0.88, passEpa: 0.12, rushEpa: 0.04, defEpa: 0.1, pace: 0.04, record: "1-1", pf: 50, pa: 28, variance: 0.97 },
  LV: { abbr: "LV", city: "Las Vegas", name: "Raiders", color: "#A5ACAF", ratingZ: 0.42, passEpa: 0.05, rushEpa: 0.05, defEpa: 0.06, pace: -0.04, record: "2-0", pf: 48, pa: 32, variance: 1.06 },
  MIA: { abbr: "MIA", city: "Miami", name: "Dolphins", color: "#008E97", ratingZ: -0.95, passEpa: -0.08, rushEpa: -0.06, defEpa: -0.1, pace: 0.02, record: "0-2", pf: 26, pa: 62, variance: 1.1 },
  MIN: { abbr: "MIN", city: "Minnesota", name: "Vikings", color: "#4F2683", ratingZ: 0.55, passEpa: 0.06, rushEpa: 0.0, defEpa: 0.16, pace: -0.2, record: "2-0", pf: 32, pa: 18, variance: 0.88 },
  NE: { abbr: "NE", city: "New England", name: "Patriots", color: "#002244", ratingZ: 0.32, passEpa: 0.03, rushEpa: 0.03, defEpa: 0.12, pace: -0.1, record: "1-1", pf: 34, pa: 22, variance: 0.88 },
  NO: { abbr: "NO", city: "New Orleans", name: "Saints", color: "#D3BC8D", ratingZ: 0.45, passEpa: 0.06, rushEpa: 0.02, defEpa: 0.1, pace: -0.06, record: "1-1", pf: 44, pa: 34, variance: 0.99 },
  NYG: { abbr: "NYG", city: "New York", name: "Giants", color: "#0B2265", ratingZ: -0.35, passEpa: 0.0, rushEpa: -0.03, defEpa: -0.04, pace: 0.0, record: "1-1", pf: 26, pa: 48, variance: 1.14 },
  NYJ: { abbr: "NYJ", city: "New York", name: "Jets", color: "#125740", ratingZ: -0.28, passEpa: -0.03, rushEpa: 0.01, defEpa: 0.04, pace: -0.08, record: "1-1", pf: 34, pa: 38, variance: 0.93 },
  PHI: { abbr: "PHI", city: "Philadelphia", name: "Eagles", color: "#004C54", ratingZ: 1.12, passEpa: 0.11, rushEpa: 0.1, defEpa: 0.08, pace: 0.08, record: "2-0", pf: 50, pa: 38, variance: 0.94 },
  PIT: { abbr: "PIT", city: "Pittsburgh", name: "Steelers", color: "#FFB612", ratingZ: -0.22, passEpa: -0.06, rushEpa: 0.02, defEpa: 0.05, pace: -0.14, record: "1-1", pf: 22, pa: 38, variance: 0.91 },
  SEA: { abbr: "SEA", city: "Seattle", name: "Seahawks", color: "#002244", ratingZ: 0.98, passEpa: 0.1, rushEpa: 0.09, defEpa: 0.14, pace: 0.06, record: "2-0", pf: 58, pa: 22, variance: 1.01 },
  SF: { abbr: "SF", city: "San Francisco", name: "49ers", color: "#AA0000", ratingZ: 1.12, passEpa: 0.1, rushEpa: 0.12, defEpa: 0.12, pace: 0.0, record: "2-0", pf: 58, pa: 30, variance: 0.95 },
  TB: { abbr: "TB", city: "Tampa Bay", name: "Buccaneers", color: "#D50A0A", ratingZ: -0.28, passEpa: 0.02, rushEpa: -0.04, defEpa: -0.06, pace: 0.04, record: "0-2", pf: 36, pa: 46, variance: 1.03 },
  TEN: { abbr: "TEN", city: "Tennessee", name: "Titans", color: "#4B92DB", ratingZ: -0.78, passEpa: -0.08, rushEpa: 0.0, defEpa: -0.06, pace: -0.06, record: "0-2", pf: 36, pa: 48, variance: 1.07 },
  WAS: { abbr: "WAS", city: "Washington", name: "Commanders", color: "#5A1414", ratingZ: -0.42, passEpa: -0.02, rushEpa: 0.01, defEpa: -0.08, pace: 0.03, record: "0-2", pf: 38, pa: 62, variance: 1.09 },
};

export function team(abbr: TeamAbbr): TeamProfile {
  return TEAMS[abbr];
}

export function teamLabel(abbr: TeamAbbr): string {
  const t = TEAMS[abbr];
  return `${t.city} ${t.name}`;
}

export function teamNick(abbr: TeamAbbr): string {
  return TEAMS[abbr].name;
}

export function applyTeamForm(rows: { abbr: TeamAbbr; record: string; pf: number; pa: number; ratingZ: number }[]) {
  for (const row of rows) {
    const t = TEAMS[row.abbr];
    if (!t) continue;
    t.record = row.record;
    t.pf = row.pf;
    t.pa = row.pa;
    t.ratingZ = row.ratingZ;
  }
}
