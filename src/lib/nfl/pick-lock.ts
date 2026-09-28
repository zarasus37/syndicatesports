/** America/Chicago. A named pick freezes at the last calendar day before that game. */

export type KickSlot = "thursday" | "sunday" | "monday" | "other";

export interface NamedPick {
  id: string;
  week: number;
  gameId?: string;
  matchup: string;
  winner: string;
  pWin: number;
  kickoff: string;
  namedAt?: string;
  lockedAt?: string;
}

function chicagoParts(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    weekday: get("weekday"),
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
  };
}

export function kickSlot(kickoff: string): KickSlot {
  const day = chicagoParts(new Date(kickoff)).weekday;
  if (day === "Thu") return "thursday";
  if (day === "Sun") return "sunday";
  if (day === "Mon") return "monday";
  return "other";
}

/** Last moment the pick may still be written. After this instant it cannot change. */
export function pickDeadline(kickoff: string): Date {
  const slot = kickSlot(kickoff);
  const daysBack = slot === "thursday" ? 1 : slot === "sunday" ? 1 : slot === "monday" ? 1 : 1;
  const kick = new Date(kickoff);
  const chicago = chicagoParts(kick);
  const lockDay = new Date(Date.UTC(chicago.year, chicago.month - 1, chicago.day));
  lockDay.setUTCDate(lockDay.getUTCDate() - daysBack);
  const y = lockDay.getUTCFullYear();
  const m = String(lockDay.getUTCMonth() + 1).padStart(2, "0");
  const d = String(lockDay.getUTCDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T23:59:59.999-05:00`);
}

export function pickMayChange(kickoff: string, now = new Date()) {
  return now.getTime() < pickDeadline(kickoff).getTime();
}

export function deadlineLabel(kickoff: string) {
  const slot = kickSlot(kickoff);
  if (slot === "thursday") return "Named by Wednesday. Cannot change after Wednesday.";
  if (slot === "sunday") return "Named by Saturday. Cannot change after Saturday.";
  if (slot === "monday") return "Named by Sunday. Cannot change after Sunday.";
  return "Named by the day before kickoff. Cannot change after that day.";
}

/** Keep an existing name once the deadline has passed. Never write a name after the deadline if none exists. */
export function applyNamedPicks(
  previous: NamedPick[],
  next: NamedPick[],
  now = new Date(),
): NamedPick[] {
  const byGame = new Map(previous.map((p) => [p.gameId ?? p.id, p]));
  return next.map((fresh) => {
    const key = fresh.gameId ?? fresh.id;
    const held = byGame.get(key);
    const open = pickMayChange(fresh.kickoff, now);
    if (held?.winner) {
      if (!open) {
        return {
          ...held,
          lockedAt: held.lockedAt ?? pickDeadline(fresh.kickoff).toISOString(),
        };
      }
      return held.winner === fresh.winner ? held : { ...fresh, namedAt: now.toISOString() };
    }
    if (!open) return held ?? { ...fresh, winner: "", pWin: 0 };
    return { ...fresh, namedAt: now.toISOString() };
  });
}
