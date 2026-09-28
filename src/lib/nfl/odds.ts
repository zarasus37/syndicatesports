export function impliedProb(american: number): number {
  if (american < 0) return -american / (-american + 100);
  return 100 / (american + 100);
}

export function americanToDecimal(american: number): number {
  if (american < 0) return 1 + 100 / -american;
  return 1 + american / 100;
}

export function probToAmerican(p: number): number {
  const clamped = Math.min(0.97, Math.max(0.03, p));
  if (clamped >= 0.5) return Math.round(-100 * clamped / (1 - clamped));
  return Math.round(100 * (1 - clamped) / clamped);
}

export function noVigTwoWay(a: number, b: number): [number, number] {
  const pa = impliedProb(a);
  const pb = impliedProb(b);
  const s = pa + pb;
  return [pa / s, pb / s];
}

/** Profit per 1 unit risked at given American price. */
export function evFromProb(p: number, american: number): number {
  const dec = americanToDecimal(american);
  return p * (dec - 1) - (1 - p);
}

/** Fractional Kelly, capped. */
export function kellyFraction(p: number, american: number, fraction = 0.5, cap = 0.5): number {
  const b = americanToDecimal(american) - 1;
  if (b <= 0) return 0;
  const f = (b * p - (1 - p)) / b;
  return Math.min(cap, Math.max(0, f * fraction));
}

export function juicePrice(american = -110): number {
  return impliedProb(american);
}
