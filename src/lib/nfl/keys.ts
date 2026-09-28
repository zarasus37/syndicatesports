import { evFromProb } from "./odds";
import { KEY_NUMBERS } from "./slate";
import type { KeyCall } from "./types";

export function coverAt(margins: number[], homeSpread: number): number {
  if (!margins.length) return 0.5;
  let c = 0;
  for (const m of margins) if (m + homeSpread > 0) c += 1;
  return c / margins.length;
}

/** Buy = harder number (favorite lays more, dog gets more). Sell = easier number. */
export function keyCall(posted: number, margins: number[], price: number): KeyCall | null {
  const postedCover = coverAt(margins, posted);
  const postedEv = evFromProb(postedCover, price);
  let best: KeyCall | null = null;

  for (const key of KEY_NUMBERS) {
    for (const sign of [-1, 1] as const) {
      const to = sign * key;
      const delta = Math.abs(to - posted);
      if (delta < 0.45 || delta > 1.05) continue;
      const cover = coverAt(margins, to);
      const halves = delta / 0.5;
      const boughtPrice = price - halves * 10;
      const ev = evFromProb(cover, boughtPrice);
      const evLift = ev - postedEv;
      const harder = Math.abs(to) > Math.abs(posted);
      const action: KeyCall["action"] = harder ? "buy" : "sell";
      const cand: KeyCall = {
        action,
        from: posted,
        to,
        coverFrom: postedCover,
        coverTo: cover,
        evLift,
        worth: evLift >= 0.004,
        note:
          action === "sell"
            ? `Sell ${posted} to ${to}. On the key, cover ${format(cover)} vs ${format(postedCover)}.`
            : `Buy ${posted} to ${to}. Paying juice to sit on ${key}.`,
      };
      if (!best || cand.evLift > best.evLift) best = cand;
    }
  }

  if (!best) {
    const onKey = KEY_NUMBERS.some((k) => Math.abs(Math.abs(posted) - k) < 0.05);
    return {
      action: "hold",
      from: posted,
      to: posted,
      coverFrom: postedCover,
      coverTo: postedCover,
      evLift: 0,
      worth: onKey,
      note: onKey ? `Posted ${posted} is already a key. Hold.` : "No 3 / 7 / 10 within a point.",
    };
  }
  if (!best.worth && KEY_NUMBERS.some((k) => Math.abs(Math.abs(posted) - k) < 0.05)) {
    return { ...best, action: "hold", note: `Posted ${posted} is on a key. The buy/sell does not print.` };
  }
  return best;
}

export function rankScore(ev: number, line: number, market: string, call: KeyCall | null): number {
  let s = ev;
  if (market !== "spread") return s;
  const a = Math.abs(line);
  if (a === 3 || a === 7) s += 0.01;
  else if (a === 2.5 || a === 3.5 || a === 6.5 || a === 7.5) s += 0.002;
  if (call?.worth && call.action !== "hold") s += Math.max(0, call.evLift);
  return s;
}

function format(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}
