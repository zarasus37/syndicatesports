import { gameSlot } from "./slot";
import type { NflGame, RefereeCrew, RefGrade, RefRead, RefTell } from "./types";

export const LEAGUE_FLAGS = 12.2;
export const LEAGUE_DPI = 2.1;
export const LEAGUE_YDS = 101;
export const LEAGUE_PF = 1.4;

export const CREWS: Record<string, RefereeCrew> = {
  blakeman: {
    id: "blakeman",
    name: "Clete Blakeman",
    flagsPerGame: 14.2,
    penaltyYds: 118,
    homeBias: 0.45,
    totalLean: 1.2,
    dpi: "high",
    dpiPerGame: 2.8,
    holding: "high",
    personalFouls: 1.8,
    homeAts: 0.54,
    overPct: 0.56,
    sackLean: -0.4,
    style: "whistle",
    note: "TNF regular. Flags and DPI both live.",
  },
  wrolstad: {
    id: "wrolstad",
    name: "Craig Wrolstad",
    flagsPerGame: 12.8,
    penaltyYds: 106,
    homeBias: 0.2,
    totalLean: 0.4,
    dpi: "avg",
    dpiPerGame: 2.2,
    holding: "avg",
    personalFouls: 1.5,
    homeAts: 0.51,
    overPct: 0.52,
    sackLean: 0,
    style: "standard",
  },
  allen: {
    id: "allen",
    name: "Brad Allen",
    flagsPerGame: 13.6,
    penaltyYds: 114,
    homeBias: 0.55,
    totalLean: 0.8,
    dpi: "avg",
    dpiPerGame: 2.4,
    holding: "avg",
    personalFouls: 1.9,
    homeAts: 0.57,
    overPct: 0.54,
    sackLean: -0.1,
    style: "whistle",
    note: "Visitor flags run high. Home ATS is the tell.",
  },
  hochuli: {
    id: "hochuli",
    name: "Shawn Hochuli",
    flagsPerGame: 15.1,
    penaltyYds: 128,
    homeBias: 0.15,
    totalLean: 1.8,
    dpi: "high",
    dpiPerGame: 3.2,
    holding: "high",
    personalFouls: 1.7,
    homeAts: 0.51,
    overPct: 0.61,
    sackLean: -0.6,
    style: "whistle",
    note: "Most flags in the league. Holding kills sacks. Overs.",
  },
  clark: {
    id: "clark",
    name: "Land Clark",
    flagsPerGame: 11.4,
    penaltyYds: 94,
    homeBias: 0.2,
    totalLean: -0.3,
    dpi: "avg",
    dpiPerGame: 1.8,
    holding: "avg",
    personalFouls: 1.2,
    homeAts: 0.5,
    overPct: 0.48,
    sackLean: 0.1,
    style: "standard",
  },
  martin: {
    id: "martin",
    name: "Clay Martin",
    flagsPerGame: 12.1,
    penaltyYds: 100,
    homeBias: 0.25,
    totalLean: 0.2,
    dpi: "avg",
    dpiPerGame: 2.0,
    holding: "avg",
    personalFouls: 1.3,
    homeAts: 0.51,
    overPct: 0.51,
    sackLean: 0,
    style: "standard",
  },
  hill: {
    id: "hill",
    name: "Adrian Hill",
    flagsPerGame: 13.0,
    penaltyYds: 108,
    homeBias: 0.2,
    totalLean: 0.5,
    dpi: "avg",
    dpiPerGame: 2.5,
    holding: "avg",
    personalFouls: 1.4,
    homeAts: 0.52,
    overPct: 0.53,
    sackLean: -0.1,
    style: "standard",
  },
  vinovich: {
    id: "vinovich",
    name: "Bill Vinovich",
    flagsPerGame: 10.2,
    penaltyYds: 82,
    homeBias: 0.1,
    totalLean: -1.1,
    dpi: "low",
    dpiPerGame: 1.4,
    holding: "low",
    personalFouls: 1.0,
    homeAts: 0.49,
    overPct: 0.43,
    sackLean: 0.5,
    style: "let-play",
    note: "Lets them play. Unders. Sacks stay on the card.",
  },
  cheffers: {
    id: "cheffers",
    name: "Carl Cheffers",
    flagsPerGame: 13.4,
    penaltyYds: 110,
    homeBias: 0.3,
    totalLean: 0.6,
    dpi: "avg",
    dpiPerGame: 2.3,
    holding: "high",
    personalFouls: 1.6,
    homeAts: 0.53,
    overPct: 0.54,
    sackLean: -0.3,
    style: "standard",
  },
  torbert: {
    id: "torbert",
    name: "Ron Torbert",
    flagsPerGame: 12.6,
    penaltyYds: 104,
    homeBias: 0.2,
    totalLean: 0.3,
    dpi: "avg",
    dpiPerGame: 2.1,
    holding: "avg",
    personalFouls: 1.4,
    homeAts: 0.51,
    overPct: 0.52,
    sackLean: 0,
    style: "standard",
  },
  novak: {
    id: "novak",
    name: "Scott Novak",
    flagsPerGame: 11.8,
    penaltyYds: 96,
    homeBias: 0.35,
    totalLean: -0.4,
    dpi: "low",
    dpiPerGame: 1.7,
    holding: "low",
    personalFouls: 1.2,
    homeAts: 0.53,
    overPct: 0.47,
    sackLean: 0.2,
    style: "let-play",
  },
  hussey: {
    id: "hussey",
    name: "John Hussey",
    flagsPerGame: 12.4,
    penaltyYds: 102,
    homeBias: 0.2,
    totalLean: 0.2,
    dpi: "avg",
    dpiPerGame: 2.0,
    holding: "avg",
    personalFouls: 1.3,
    homeAts: 0.5,
    overPct: 0.51,
    sackLean: 0,
    style: "standard",
  },
  smith: {
    id: "smith",
    name: "Shawn Smith",
    flagsPerGame: 11.6,
    penaltyYds: 95,
    homeBias: 0.25,
    totalLean: -0.2,
    dpi: "avg",
    dpiPerGame: 1.8,
    holding: "avg",
    personalFouls: 1.1,
    homeAts: 0.51,
    overPct: 0.49,
    sackLean: 0.1,
    style: "standard",
  },
  kemp: {
    id: "kemp",
    name: "Alex Kemp",
    flagsPerGame: 12.9,
    penaltyYds: 107,
    homeBias: 0,
    totalLean: 0.5,
    dpi: "avg",
    dpiPerGame: 2.2,
    holding: "avg",
    personalFouls: 1.5,
    homeAts: 0.5,
    overPct: 0.53,
    sackLean: 0,
    style: "standard",
    note: "Neutral site. Home-whistle lean is off.",
  },
  blake: {
    id: "blake",
    name: "Tra Blake",
    flagsPerGame: 13.2,
    penaltyYds: 109,
    homeBias: 0.2,
    totalLean: 0.7,
    dpi: "high",
    dpiPerGame: 2.7,
    holding: "avg",
    personalFouls: 1.5,
    homeAts: 0.51,
    overPct: 0.54,
    sackLean: -0.2,
    style: "whistle",
  },
  eck: {
    id: "eck",
    name: "Alan Eck",
    flagsPerGame: 13.8,
    penaltyYds: 116,
    homeBias: 0.4,
    totalLean: 1.0,
    dpi: "avg",
    dpiPerGame: 2.4,
    holding: "high",
    personalFouls: 1.7,
    homeAts: 0.54,
    overPct: 0.55,
    sackLean: -0.3,
    style: "whistle",
    note: "MNF. Flags travel with the lights.",
  },
  unassigned: {
    id: "unassigned",
    name: "Crew not posted",
    flagsPerGame: LEAGUE_FLAGS,
    penaltyYds: LEAGUE_YDS,
    homeBias: 0,
    totalLean: 0,
    dpi: "avg",
    dpiPerGame: LEAGUE_DPI,
    holding: "avg",
    personalFouls: LEAGUE_PF,
    homeAts: 0.5,
    overPct: 0.5,
    sackLean: 0,
    style: "standard",
    note: "Assignment is not on the scoreboard. No crew lean is applied.",
  },
};

export function crewOf(game: NflGame): RefereeCrew {
  return CREWS[game.crewId] ?? CREWS.unassigned!;
}

function gradeOf(score: number, style: RefereeCrew["style"]): RefGrade {
  if (score >= 70) return style === "let-play" ? "scripted" : "whistle";
  if (score >= 48) return style === "let-play" ? "scripted" : style === "whistle" ? "whistle" : "watch";
  if (score >= 30) return "watch";
  return "quiet";
}

export function analyzeRef(game: NflGame): RefRead {
  const crew = crewOf(game);
  const slot = gameSlot(game);
  const outdoor = game.weather.roof === "open" || game.weather.roof === "neutral";
  const wind = outdoor ? (game.weather.windMph ?? 0) : 0;
  const dome = game.weather.roof === "dome" || game.weather.roof === "retractable";
  const tells: RefTell[] = [];
  const add = (id: string, label: string, pts: number, fire: boolean, note: string) => {
    if (!fire || pts <= 0) return;
    tells.push({ id, label, pts, note });
  };

  const flagGap = crew.flagsPerGame - LEAGUE_FLAGS;
  add(
    "flags",
    flagGap >= 1.5 ? "Whistle crew" : "Let them play",
    Math.min(22, Math.abs(flagGap) * 7),
    Math.abs(flagGap) >= 1.2,
    `${crew.flagsPerGame.toFixed(1)} flags/g vs league ${LEAGUE_FLAGS}. ${crew.penaltyYds} penalty yards.`,
  );
  add(
    "dpi",
    "DPI",
    crew.dpi === "high" ? 14 : crew.dpi === "low" ? 8 : 0,
    crew.dpi !== "avg",
    `${crew.dpiPerGame.toFixed(1)} DPI/g vs ${LEAGUE_DPI}. ${crew.dpi === "high" ? "Pass games get free yards." : "Secondary can play tight."}`,
  );
  add(
    "holding",
    "Offensive holding",
    crew.holding === "high" ? 12 : crew.holding === "low" ? 8 : 0,
    crew.holding !== "avg",
    crew.holding === "high"
      ? "Holding is live. Drives extend, sacks get picked up."
      : "Holding stays in the pocket. Sacks can cash.",
  );
  add(
    "total",
    crew.totalLean >= 0 ? "Over lean" : "Under lean",
    Math.min(20, Math.abs(crew.totalLean) * 12),
    Math.abs(crew.totalLean) >= 0.5,
    `Career overlay ${crew.totalLean > 0 ? "+" : ""}${crew.totalLean.toFixed(1)} on the total. Overs ${Math.round(crew.overPct * 100)}%.`,
  );
  add(
    "home",
    "Home whistle",
    Math.round(crew.homeBias * 22),
    crew.homeBias >= 0.35,
    `Visitor flags run high. Home ATS ${Math.round(crew.homeAts * 100)}%.`,
  );
  add(
    "pf",
    "Personal fouls",
    crew.personalFouls >= 1.7 ? 8 : 0,
    crew.personalFouls >= 1.7,
    `${crew.personalFouls.toFixed(1)} 15-yard flags/g. Variance up.`,
  );
  add(
    "dome",
    "Dome + whistle",
    10,
    dome && crew.style === "whistle",
    "Indoor passing plus a flag crew. Overs stack.",
  );
  add(
    "division",
    "Division trench",
    8,
    crew.style === "let-play" && (game.id === "cin-pit" || game.id === "ari-sf"),
    "Low-whistle crew on a physical matchup. Unders and sacks.",
  );

  let conflict: string | null = null;
  if (slot === "tnf" && crew.totalLean >= 0.8) {
    conflict = "TNF unders fight this crew’s over lean. Fade the total, don’t stack it.";
  } else if (wind >= 12 && crew.totalLean >= 0.8) {
    conflict = `Wind ${wind} mph vs a whistle-over crew. Don’t auto-take the over.`;
  } else if (slot === "intl" && crew.homeBias > 0) {
    conflict = "Neutral site. Ignore the home-whistle ATS.";
  }

  const score = Math.max(0, Math.min(100, tells.reduce((s, t) => s + t.pts, 0)));
  const grade = gradeOf(score, crew.style);
  const totalLean: RefRead["totalLean"] =
    crew.totalLean >= 0.6 || crew.overPct >= 0.55 ? "over" : crew.totalLean <= -0.6 || crew.overPct <= 0.47 ? "under" : "even";
  const sideLean: RefRead["sideLean"] =
    slot === "intl" || crew.homeBias < 0.3 ? "even" : crew.homeBias >= 0.4 ? "home" : "even";
  const sackLean: RefRead["sackLean"] = crew.sackLean <= -0.25 ? "down" : crew.sackLean >= 0.25 ? "up" : "even";
  const passLean: RefRead["passLean"] = crew.dpi === "high" ? "up" : crew.dpi === "low" ? "down" : "even";

  return { crew, score, grade, totalLean, sideLean, sackLean, passLean, tells, conflict };
}

export function isRefFlag(read: RefRead): boolean {
  return read.grade === "whistle" || read.grade === "scripted";
}

export function refTone(grade: RefGrade): "loss" | "warn" | "outline" | "default" {
  if (grade === "whistle") return "loss";
  if (grade === "scripted") return "warn";
  if (grade === "watch") return "outline";
  return "default";
}
