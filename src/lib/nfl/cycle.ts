/** Tuesday 6:00 AM Central before the 2026 Week 1 Thursday. The card moves here, not at the Sunday whistle. */
const SEASON_OPEN = Date.parse("2026-09-08T06:00:00-05:00");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function cardWeek(now = new Date()) {
  const n = Math.floor((now.getTime() - SEASON_OPEN) / WEEK_MS) + 1;
  if (n < 1) return 1;
  if (n > 18) return 18;
  return n;
}

/** Central time. Monday night is over before Tuesday morning, and still over Wednesday morning. */
export function boardMorning(now = new Date()) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "long" }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hourCycle: "h23" }).format(now));
  const morning = (weekday === "Tuesday" || weekday === "Wednesday") && hour < 12;
  const week = cardWeek(now);
  const label = `Week ${week} of 18 is the card. It moves Tuesday morning, after Monday night, through the season. It does not stay on one week, and it does not roll when Sunday night ends.`;
  return { morning, weekday, hour, week, label };
}
