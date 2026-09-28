/** Conjugate Bayesian updates used by the desk. No sampling — closed form. */

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

function logGamma(z: number): number {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  const x = z - 1;
  let a = LANCZOS[0]!;
  for (let i = 1; i < LANCZOS.length; i++) a += LANCZOS[i]! / (x + i);
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(x: number, a: number, b: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let az = 1;
  let am = 1;
  let bm = 1;
  let bz = 1 - (qab * x) / qap;
  for (let m = 1; m <= 200; m++) {
    const em = m;
    const tem = em + em;
    let d = (em * (b - em) * x) / ((qam + tem) * (a + tem));
    const ap = az + d * am;
    const bp = bz + d * bm;
    d = (-(a + em) * (qab + em) * x) / ((a + tem) * (qap + tem));
    const app = ap + d * az;
    const bpp = bp + d * bz;
    const aold = az;
    am = ap / bpp;
    bm = bp / bpp;
    az = app / bpp;
    bz = 1;
    if (Math.abs(az - aold) < 3e-12 * Math.abs(az)) return az;
  }
  return az;
}

function betai(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const logBt = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
  const bt = Math.exp(logBt);
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(x, a, b)) / a;
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}

export function betaQuantile(a: number, b: number, p: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (betai(mid, a, b) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface BetaPost {
  tag: string;
  a0: number;
  b0: number;
  a: number;
  b: number;
  n: number;
  hits: number;
  priorMean: number;
  mean: number;
  q10: number;
  q90: number;
  raw: number;
  /** posterior mean / prior mean, clipped */
  mult: number;
  /** mass on beating the prior (P(θ > priorMean | data)) */
  pBeat: number;
}

/** Pseudo-count. 10 games at break-even is a weakly informative league prior. */
export const KAPPA = 10;
export const LEAGUE_P = 0.524;

export function betaUpdate(hits: number, n: number, priorMean = LEAGUE_P, kappa = KAPPA, tag = ""): BetaPost {
  const p0 = Math.min(0.72, Math.max(0.38, priorMean));
  const a0 = p0 * kappa;
  const b0 = (1 - p0) * kappa;
  const losses = Math.max(0, n - hits);
  const a = a0 + hits;
  const b = b0 + losses;
  const mean = a / (a + b);
  const q10 = betaQuantile(a, b, 0.1);
  const q90 = betaQuantile(a, b, 0.9);
  const raw = n ? hits / n : p0;
  const mult = Math.min(1.22, Math.max(0.72, mean / p0));
  return { tag, a0, b0, a, b, n, hits, priorMean: p0, mean, q10, q90, raw, mult, pBeat: 1 - betai(p0, a, b) };
}

export interface GaussPost {
  mean: number;
  sd: number;
  q10: number;
  q90: number;
  n: number;
}

/** Normal-normal conjugate on mean CLV. Prior N(0, 1.5²). */
export function clvUpdate(xs: number[]): GaussPost {
  const n = xs.length;
  if (!n) return { mean: 0, sd: 1.5, q10: -1.92, q90: 1.92, n: 0 };
  const m = xs.reduce((s, x) => s + x, 0) / n;
  const v = n < 2 ? 2.25 : xs.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1);
  const prec0 = 1 / 2.25;
  const precD = n / Math.max(1.2, v);
  const prec = prec0 + precD;
  const mean = (precD * m) / prec;
  const sd = Math.sqrt(1 / prec);
  return { mean, sd, q10: mean - 1.2816 * sd, q90: mean + 1.2816 * sd, n };
}

export interface DirichPost {
  reason: string;
  count: number;
  mean: number;
}

export function dirichletUpdate(counts: Record<string, number>, alpha0 = 0.8): DirichPost[] {
  const keys = Object.keys(counts);
  const sum = keys.reduce((s, k) => s + alpha0 + (counts[k] ?? 0), 0);
  return keys
    .map((reason) => {
      const count = counts[reason] ?? 0;
      return { reason, count, mean: (alpha0 + count) / sum };
    })
    .sort((a, b) => b.mean - a.mean);
}

/** Mix a model probability with a Beta posterior in log-odds. Partial pool. */
export function posteriorProb(modelP: number, post: BetaPost, weight = 0.45): number {
  const p = Math.min(0.92, Math.max(0.08, modelP));
  const rawLr = Math.log(post.mean / post.priorMean);
  // A short hot streak does not increase size. Misses can cut it.
  const lr = post.n >= 80 ? rawLr : Math.min(0, rawLr);
  const logit = Math.log(p / (1 - p)) + weight * lr;
  return 1 / (1 + Math.exp(-logit));
}

/**
 * Rank stays on the (calibrated) mean. Size uses a pull toward the 10th percentile.
 * Never size above the ranking p.
 */
export function sizeProb(rankP: number, post?: BetaPost): number {
  let p = rankP;
  if (post && post.n >= 8) {
    p = posteriorProb(rankP, post, 0.35);
    p = 0.6 * p + 0.4 * Math.max(0.08, p + (post.q10 - post.mean));
  } else {
    p = 0.94 * p + 0.06 * 0.5;
  }
  return Math.min(rankP, Math.max(0.08, p));
}
