import type { NflGame, SwingPlayer, TeamAbbr } from "./types";

export const SWINGS: SwingPlayer[] = [
  { id: "penix", gameId: "atl-gb", name: "Michael Penix Jr.", team: "ATL", pos: "QB", status: "questionable", pts: -4.2, passMult: -0.18, note: "Ankle. Falcons already scoring 9.5 ppg." },
  { id: "love", gameId: "atl-gb", name: "Jordan Love", team: "GB", pos: "QB", status: "active", pts: -3.6, passMult: -0.14, note: "If he sits, GB becomes a run shop at home." },
  { id: "herbert-ot", gameId: "lac-buf", name: "Rashawn Slater", team: "LAC", pos: "OT", status: "questionable", pts: -1.8, sackMult: 0.12, note: "LT vs Highmark wind and a pass rush." },
  { id: "garrett", gameId: "car-cle", name: "Myles Garrett", team: "CLE", pos: "EDGE", status: "active", pts: 2.4, sackMult: -0.16, note: "If he’s out, Carolina’s number is a different bet." },
  { id: "stbrown", gameId: "nyj-det", name: "Amon-Ra St. Brown", team: "DET", pos: "WR", status: "active", pts: -1.6, passMult: -0.08, note: "WR1. Dome game, volume is the whole over." },
  { id: "stroud", gameId: "hou-ind", name: "C.J. Stroud", team: "HOU", pos: "QB", status: "active", pts: -3.8, passMult: -0.16, note: "Texans are a small road favorite only if he’s out there." },
  { id: "nix", gameId: "lar-den", name: "Bo Nix", team: "DEN", pos: "QB", status: "active", pts: -3.2, passMult: -0.14, note: "Altitude + SNF. Road legs fade late." },
  { id: "stafford", gameId: "lar-den", name: "Matthew Stafford", team: "LAR", pos: "QB", status: "questionable", pts: -3.4, passMult: -0.15, note: "Back. Visitor at altitude is already taxed." },
  { id: "mahomes-og", gameId: "kc-mia", name: "Trey Smith", team: "KC", pos: "OT", status: "active", pts: -1.1, sackMult: 0.1, note: "Interior. Mahomes without a clean pocket in Miami." },
  { id: "cmc", gameId: "ari-sf", name: "Christian McCaffrey", team: "SF", pos: "RB", status: "questionable", pts: -2.2, note: "Calf. 49ers script without him is a different total." },
  { id: "hurts", gameId: "phi-chi", name: "Jalen Hurts", team: "PHI", pos: "QB", status: "active", pts: -3.5, passMult: -0.12, note: "If he sits, the tush push and the number both move." },
  { id: "chase", gameId: "cin-pit", name: "Ja'Marr Chase", team: "CIN", pos: "WR", status: "active", pts: -1.8, passMult: -0.09, note: "WR1 vs a Pittsburgh front that lives on explosives." },
];

let active = new Set<string>();

export function getActiveOuts(): Set<string> {
  return active;
}

export function setActiveOuts(ids: Iterable<string>) {
  active = new Set(ids);
}

export function swingsFor(gameId: string): SwingPlayer[] {
  return SWINGS.filter((p) => p.gameId === gameId);
}

export function isOut(id: string): boolean {
  return active.has(id);
}

export interface OutAdj {
  homePts: number;
  awayPts: number;
  passMultHome: number;
  passMultAway: number;
  sackMult: number;
  volMult: number;
  notes: string[];
  applied: string[];
}

export function outAdjustments(game: NflGame, ids?: Iterable<string>): OutAdj {
  const adj: OutAdj = {
    homePts: 0,
    awayPts: 0,
    passMultHome: 0,
    passMultAway: 0,
    sackMult: 0,
    volMult: 1,
    notes: [],
    applied: [],
  };
  const set = ids ? new Set(ids) : active;
  for (const p of swingsFor(game.id)) {
    if (!set.has(p.id)) continue;
    const home = p.team === game.home;
    if (home) {
      adj.homePts += p.pts;
      adj.passMultHome += p.passMult ?? 0;
    } else {
      adj.awayPts += p.pts;
      adj.passMultAway += p.passMult ?? 0;
    }
    adj.sackMult += p.sackMult ?? 0;
    if (p.pos === "QB") adj.volMult *= 1.08;
    adj.applied.push(p.id);
    adj.notes.push(`${p.name} OUT (${p.pos}). ${p.note}`);
  }
  return adj;
}

export function teamOuts(gameId: string, team: TeamAbbr): SwingPlayer[] {
  return swingsFor(gameId).filter((p) => p.team === team && active.has(p.id));
}
