import type { NflGame, TeamAbbr } from "./types";

export const PUBLIC_FADE = 65;
export const PUBLIC_LEAN = 58;
export const SPLIT_SHARP = 12;

export interface PublicRead {
  ticketsHome: number;
  handleHome: number;
  ticketsAway: number;
  handleAway: number;
  ticketsOver: number;
  handleOver: number;
  splitHome: number;
  publicSide: "home" | "away";
  publicPct: number;
  publicTeam: TeamAbbr;
  fade: "home" | "away" | null;
  sharpLean: "home" | "away" | "even";
  contrarian: boolean;
}

export function publicRead(game: NflGame): PublicRead {
  const ticketsHome = game.public.ticketsHome;
  const handleHome = game.public.handleHome;
  const ticketsAway = 100 - ticketsHome;
  const handleAway = 100 - handleHome;
  const splitHome = handleHome - ticketsHome;
  const publicSide: "home" | "away" = ticketsHome >= 50 ? "home" : "away";
  const publicPct = Math.max(ticketsHome, ticketsAway);
  const fade = publicPct >= PUBLIC_FADE ? publicSide : null;
  const sharpLean: PublicRead["sharpLean"] =
    splitHome >= SPLIT_SHARP ? "home" : splitHome <= -SPLIT_SHARP ? "away" : "even";
  const contrarian = fade !== null && sharpLean !== "even" && sharpLean !== fade;
  return {
    ticketsHome,
    handleHome,
    ticketsAway,
    handleAway,
    ticketsOver: game.public.ticketsOver,
    handleOver: game.public.handleOver,
    splitHome,
    publicSide,
    publicPct,
    publicTeam: publicSide === "home" ? game.home : game.away,
    fade,
    sharpLean,
    contrarian,
  };
}

export function isPublicFlag(game: NflGame): boolean {
  const p = publicRead(game);
  return p.fade !== null || p.contrarian;
}

export function againstPublic(game: NflGame, moveTowardHome: boolean): boolean {
  const p = publicRead(game);
  if (p.publicPct < PUBLIC_LEAN) return false;
  if (p.publicSide === "home") return !moveTowardHome;
  return moveTowardHome;
}
