import type { TeamAbbr } from "./types";

export interface Stadium {
  lat: number;
  lon: number;
  roof: "open" | "retractable" | "dome";
  name: string;
}

/** Home stadium. Neutral sites are geocoded from the ESPN venue city. */
export const STADIUMS: Record<TeamAbbr, Stadium> = {
  ARI: { lat: 33.5276, lon: -112.2626, roof: "retractable", name: "State Farm Stadium" },
  ATL: { lat: 33.7553, lon: -84.4008, roof: "retractable", name: "Mercedes-Benz Stadium" },
  BAL: { lat: 39.278, lon: -76.6227, roof: "open", name: "M&T Bank Stadium" },
  BUF: { lat: 42.7738, lon: -78.787, roof: "open", name: "Highmark Stadium" },
  CAR: { lat: 35.2258, lon: -80.8528, roof: "open", name: "Bank of America Stadium" },
  CHI: { lat: 41.8623, lon: -87.6167, roof: "open", name: "Soldier Field" },
  CIN: { lat: 39.0954, lon: -84.516, roof: "open", name: "Paycor Stadium" },
  CLE: { lat: 41.5061, lon: -81.6995, roof: "open", name: "Huntington Bank Field" },
  DAL: { lat: 32.7473, lon: -97.0945, roof: "retractable", name: "AT&T Stadium" },
  DEN: { lat: 39.7439, lon: -105.0201, roof: "open", name: "Empower Field" },
  DET: { lat: 42.34, lon: -83.0456, roof: "dome", name: "Ford Field" },
  GB: { lat: 44.5013, lon: -88.0622, roof: "open", name: "Lambeau Field" },
  HOU: { lat: 29.6847, lon: -95.4107, roof: "retractable", name: "NRG Stadium" },
  IND: { lat: 39.7601, lon: -86.1639, roof: "retractable", name: "Lucas Oil Stadium" },
  JAX: { lat: 30.3239, lon: -81.6373, roof: "open", name: "EverBank Stadium" },
  KC: { lat: 39.0489, lon: -94.4839, roof: "open", name: "Arrowhead Stadium" },
  LAC: { lat: 33.9535, lon: -118.3392, roof: "dome", name: "SoFi Stadium" },
  LAR: { lat: 33.9535, lon: -118.3392, roof: "dome", name: "SoFi Stadium" },
  LV: { lat: 36.0908, lon: -115.183, roof: "dome", name: "Allegiant Stadium" },
  MIA: { lat: 25.958, lon: -80.2389, roof: "open", name: "Hard Rock Stadium" },
  MIN: { lat: 44.9738, lon: -93.2577, roof: "dome", name: "U.S. Bank Stadium" },
  NE: { lat: 42.0909, lon: -71.2643, roof: "open", name: "Gillette Stadium" },
  NO: { lat: 29.9511, lon: -90.0812, roof: "dome", name: "Caesars Superdome" },
  NYG: { lat: 40.8128, lon: -74.0742, roof: "open", name: "MetLife Stadium" },
  NYJ: { lat: 40.8128, lon: -74.0742, roof: "open", name: "MetLife Stadium" },
  PHI: { lat: 39.9008, lon: -75.1675, roof: "open", name: "Lincoln Financial Field" },
  PIT: { lat: 40.4468, lon: -80.0158, roof: "open", name: "Acrisure Stadium" },
  SEA: { lat: 47.5952, lon: -122.3316, roof: "open", name: "Lumen Field" },
  SF: { lat: 37.4033, lon: -121.9694, roof: "open", name: "Levi's Stadium" },
  TB: { lat: 27.9759, lon: -82.5033, roof: "open", name: "Raymond James Stadium" },
  TEN: { lat: 36.1665, lon: -86.7713, roof: "open", name: "Nissan Stadium" },
  WAS: { lat: 38.9076, lon: -76.8645, roof: "open", name: "Northwest Stadium" },
};

export function stadiumFor(home: TeamAbbr, venueName: string): Stadium | null {
  const homePark = STADIUMS[home];
  if (!homePark) return null;
  const venue = venueName.toLowerCase();
  const nick = homePark.name.toLowerCase().split(" ")[0] ?? "";
  if (venue.includes(nick) || venue.includes(homePark.name.toLowerCase())) return homePark;
  return null;
}
