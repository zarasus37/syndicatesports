import type { LedgerTicket } from "./types";

export interface RelBucket {
  lo: number;
  hi: number;
  n: number;
  hits: number;
  exp: number;
  hit: number;
}

const EDGES = [0.45, 0.5, 0.55, 0.6, 0.65, 0.75];

export function reliability(rows: LedgerTicket[]): RelBucket[] {
  const decided = rows.filter((t) => (t.result === "win" || t.result === "loss") && t.kind !== "parlay");
  const out: RelBucket[] = [];
  for (let i = 0; i < EDGES.length - 1; i++) {
    const lo = EDGES[i]!;
    const hi = EDGES[i + 1]!;
    const xs = decided.filter((t) => t.prob >= lo && t.prob < hi);
    const hits = xs.filter((t) => t.result === "win").length;
    const exp = xs.length ? xs.reduce((s, t) => s + t.prob, 0) / xs.length : (lo + hi) / 2;
    out.push({
      lo,
      hi,
      n: xs.length,
      hits,
      exp,
      hit: xs.length ? hits / xs.length : exp,
    });
  }
  return out;
}

/** Shrink model p toward observed hit rate. A small hot sample cannot inflate the edge. */
export function calibrateProb(p: number, buckets: RelBucket[], k = 12): number {
  const b = buckets.find((x) => p >= x.lo && p < x.hi);
  if (!b || b.n < 8) return p;
  const w = b.n / (b.n + k);
  const mixed = w * b.hit + (1 - w) * p;
  const inflates = (p >= 0.5 && mixed > p) || (p < 0.5 && mixed < p);
  if (inflates && b.n < 80) return p;
  return mixed;
}
