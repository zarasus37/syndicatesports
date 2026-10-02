import { KEY_NUMBERS } from "./config";
import { steamSignal, totalMove } from "./flags";
import { publicRead } from "./public";
import type { NflGame, SharpGrade, SharpRead, SharpTell, SteamSignal, TeamAbbr } from "./types";

export type { SharpGrade, SharpRead, SharpTell };

function crossedKey(open: number, now: number): number | null {
  for (const k of KEY_NUMBERS) {
    const a = Math.abs(open);
    const b = Math.abs(now);
    if ((a - k) * (b - k) < 0) return k;
    if (a === k && b !== k) return k;
    if (b === k && a !== k) return k;
  }
  return null;
}

function gradeOf(score: number): SharpGrade {
  if (score >= 70) return "heavy";
  if (score >= 45) return "sharp";
  if (score >= 28) return "watch";
  return "none";
}

export function analyzeSharp(game: NflGame, steam?: { steam: SteamSignal; pts: number }): SharpRead {
  const taped = !game.line.books?.length;
  const sig = steam ?? steamSignal(game);
  const pub = publicRead(game);
  const pts = sig.pts;
  const abs = Math.abs(pts);
  const towardHome = pts < 0;
  const moveTeam: TeamAbbr = towardHome ? game.home : game.away;
  const handleOnMove = towardHome ? pub.handleHome : pub.handleAway;
  const ticketsOnMove = towardHome ? pub.ticketsHome : pub.ticketsAway;
  const handleLed = abs >= 1 && handleOnMove >= ticketsOnMove + 8;
  const key = crossedKey(game.line.spreadOpen, game.line.spread);
  const tot = totalMove(game);
  const tells: SharpTell[] = [];

  const add = (id: string, label: string, value: number, fire: boolean, note: string) => {
    if (!fire || value <= 0) return;
    tells.push({ id, label, pts: value, note });
  };

  add(
    "rlm",
    "Reverse line move",
    28,
    taped && sig.steam === "rlm",
    `${pub.publicPct}% of tickets on ${pub.publicTeam}; number moved ${pts > 0 ? "+" : ""}${pts.toFixed(1)} against them.`,
  );
  add(
    "split",
    "Ticket / handle split",
    22,
    pub.contrarian,
    `Tickets ${pub.publicPct}% ${pub.publicTeam}. Handle leans ${pub.sharpLean === "home" ? game.home : game.away} (${Math.abs(pub.splitHome)} pts).`,
  );
  add(
    "flip",
    "Side reverse",
    16,
    taped &&
      Math.sign(game.line.spreadOpen) !== 0 &&
      Math.sign(game.line.spread) !== 0 &&
      Math.sign(game.line.spreadOpen) !== Math.sign(game.line.spread),
    `Opened ${game.line.spreadOpen > 0 ? "+" : ""}${game.line.spreadOpen}, now ${game.line.spread > 0 ? "+" : ""}${game.line.spread}.`,
  );
  add(
    "handle-led",
    "Handle-led steam",
    14,
    taped && handleLed && sig.steam !== "rlm",
    `Line toward ${moveTeam}. Handle ${handleOnMove}% vs tickets ${ticketsOnMove}% on that side.`,
  );
  add(
    "move",
    "Size of the move",
    abs >= 2.5 ? 10 : abs >= 2 ? 8 : 0,
    taped && abs >= 2,
    `${abs.toFixed(1)} points off the open.`,
  );
  add(
    "key",
    "Key number",
    8,
    taped && key !== null,
    key !== null ? `Tape crossed ${key}.` : "",
  );
  add(
    "total",
    "Total steam",
    8,
    taped && Math.abs(tot) >= 2.5,
    tot <= -2.5
      ? `Total down ${Math.abs(tot).toFixed(1)}. Handle on the under ${100 - pub.handleOver}%.`
      : `Total up ${tot.toFixed(1)}. Handle on the over ${pub.handleOver}%.`,
  );
  add(
    "public-steam",
    "Public steam",
    6,
    sig.steam === "steam" && !handleLed && !pub.contrarian && pub.publicPct >= 65,
    `Public and the number are on ${pub.publicTeam} together. Weaker tell.`,
  );

  const score = Math.max(0, Math.min(100, tells.reduce((s, t) => s + t.pts, 0)));
  const grade = gradeOf(score);

  let leanSide: SharpRead["leanSide"] = "none";
  if (pub.contrarian) leanSide = pub.sharpLean === "home" ? "home" : "away";
  else if (sig.steam === "rlm") leanSide = towardHome ? "home" : "away";
  else if (handleLed) leanSide = towardHome ? "home" : "away";
  else if (grade !== "none" && abs >= 1.5) leanSide = towardHome ? "home" : "away";

  const lean = leanSide === "home" ? game.home : leanSide === "away" ? game.away : null;
  const clvIfFollowed = leanSide === "home" ? -pts : leanSide === "away" ? pts : 0;

  return {
    score,
    grade,
    lean,
    leanSide,
    tells,
    fired: tells,
    handleLed,
    clvIfFollowed,
  };
}

export function isSharpFlag(read: SharpRead): boolean {
  return read.grade === "sharp" || read.grade === "heavy";
}

export function sharpTone(grade: SharpGrade): "loss" | "warn" | "outline" | "default" {
  if (grade === "heavy") return "loss";
  if (grade === "sharp") return "warn";
  if (grade === "watch") return "outline";
  return "default";
}
