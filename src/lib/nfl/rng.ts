export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(rng: Rng, mean: number, std: number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function poisson(rng: Rng, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k += 1;
    p *= rng();
  } while (p > L);
  return k - 1;
}

export function choice<T>(rng: Rng, items: T[], weights: number[]): T {
  let sum = 0;
  for (const w of weights) sum += w;
  let r = rng() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i] ?? 0;
    const item = items[i];
    if (r <= 0 && item !== undefined) return item;
  }
  return items[items.length - 1] as T;
}
