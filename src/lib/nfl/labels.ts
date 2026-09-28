import { formatSpread } from "@/lib/utils";
import { getGame } from "./slate";
import { team } from "./teams";
import type { GameSimResult, NflGame, SimPick } from "./types";

export function matchup(game: NflGame): string {
  return `${game.away} @ ${game.home}`;
}

export function pickLabel(_game: NflGame, pick: SimPick): string {
  return pick.side;
}

export function favoriteLabel(game: NflGame): string {
  if (game.line.spread < 0) return `${game.home} ${formatSpread(game.line.spread)}`;
  if (game.line.spread > 0) return `${game.away} ${formatSpread(-game.line.spread)}`;
  return "Pick'em";
}

export function resultFor(id: string, results: Record<string, GameSimResult>): GameSimResult | undefined {
  return results[id];
}

export function teamChip(abbr: NflGame["home"]) {
  const t = team(abbr);
  return { abbr: t.abbr, color: t.color, name: t.name, city: t.city };
}

export function gameTitle(game: NflGame): string {
  return `${team(game.away).name} at ${team(game.home).name}`;
}

export function gameById(id: string): NflGame | undefined {
  return getGame(id);
}
