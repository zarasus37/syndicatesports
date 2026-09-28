import { MAX_CARD_SIDES, MIN_EV } from "./config";
import { team } from "./teams";
import type { GameSimResult, NflGame, ParlayTicket, PropSim, SimPick, SlateSheetRow, WinnerPick } from "./types";

/** Plays we would actually bet: conservative EV and size. */
export function wouldTake(ev: number, kelly: number): boolean {
  return ev >= MIN_EV && kelly > 0;
}

/** Best market on this game that clears the card. One ticket per game. */
export function bestTake(result: GameSimResult): SimPick | null {
  const cands = [result.pick, ...result.alts].filter((c) => c.market !== "ml");
  const ok = cands.filter((c) => wouldTake(c.ev, c.kelly)).sort((a, b) => b.ev - a.ev);
  return ok[0] ?? null;
}

export function slateSheet(results: GameSimResult[], games: NflGame[]): SlateSheetRow[] {
  return games.map((g): SlateSheetRow => {
    const r = results.find((x) => x.gameId === g.id);
    if (!r) {
      return {
        gameId: g.id,
        matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
        kickoff: g.kickoffLabel,
        side: "—",
        market: "spread",
        ev: 0,
        prob: 0,
        kelly: 0,
        take: false,
        passReason: "ev",
      };
    }
    const bet = bestTake(r);
    const lean = r.pick;
    const take = Boolean(bet);
    const passReason: SlateSheetRow["passReason"] = take ? "ok" : lean.ev < MIN_EV ? "ev" : "size";
    const shown = bet ?? lean;
    return {
      gameId: g.id,
      matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
      kickoff: g.kickoffLabel,
      side: shown.side,
      market: shown.market,
      ev: shown.ev,
      prob: shown.prob,
      kelly: shown.kelly,
      take,
      passReason,
    };
  }).sort((a, b) => {
    if (a.take !== b.take) return a.take ? -1 : 1;
    return b.ev - a.ev;
  });
}

export function unofficialWinners(results: GameSimResult[], games: NflGame[], week: number): WinnerPick[] {
  return games.map((g) => {
    const r = results.find((x) => x.gameId === g.id);
    const homeP = r?.homeWin ?? 0.5;
    const awayP = r ? 1 - homeP : 0.5;
    const home = homeP >= awayP;
    return {
      id: `w${week}-win-${g.id}`,
      week,
      gameId: g.id,
      matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
      winner: home ? team(g.home).abbr : team(g.away).abbr,
      pWin: home ? homeP : awayP,
      result: "pending" as const,
    };
  });
}

export function liveTrueCard(
  results: GameSimResult[],
  parlays: ParlayTicket[],
  props: PropSim[],
  games: NflGame[],
) {
  const sheet = slateSheet(results, games);
  const takes = sheet.filter((r) => r.take).sort((a, b) => b.ev - a.ev).slice(0, MAX_CARD_SIDES);
  const onCard = new Set(takes.map((t) => t.gameId));
  const sheetMarked = sheet.map((r) => (r.take && !onCard.has(r.gameId) ? { ...r, take: false, passReason: "ev" as const } : r));
  const parlayTakes = parlays.filter((p) => p.ev >= MIN_EV).slice(0, 2);
  const propTakes = props
    .filter((p) => {
      if (p.pick === "pass") return false;
      const ev = p.pick === "over" ? p.evOver : p.evUnder;
      return ev >= MIN_EV;
    })
    .sort((a, b) => {
      const ea = a.pick === "over" ? a.evOver : a.evUnder;
      const eb = b.pick === "over" ? b.evOver : b.evUnder;
      return eb - ea;
    })
    .slice(0, 3);
  return { sheet: sheetMarked, takes, parlayTakes, propTakes };
}
