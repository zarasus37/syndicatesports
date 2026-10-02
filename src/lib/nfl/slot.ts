import type { NflGame } from "./types";

export type GameSlot = "tnf" | "sun_early" | "sun_late" | "snf" | "mnf" | "intl";

export function gameSlot(game: NflGame): GameSlot {
  if (game.weather.roof === "neutral") return "intl";
  if (game.network === "Prime" && game.kickoffLabel.startsWith("Thu")) return "tnf";
  if (game.network === "NBC") return "snf";
  if (game.network === "ESPN") return "mnf";
  if (game.kickoffLabel.includes("4:")) return "sun_late";
  return "sun_early";
}

export function slotLabel(slot: GameSlot): string {
  if (slot === "tnf") return "Thursday Night";
  if (slot === "snf") return "Sunday Night";
  if (slot === "mnf") return "Monday Night";
  if (slot === "intl") return "International";
  if (slot === "sun_late") return "Sunday late";
  return "Sunday early";
}

export function isPrime(slot: GameSlot): boolean {
  return slot === "tnf" || slot === "snf" || slot === "mnf";
}
