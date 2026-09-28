import { betaUpdate, clvUpdate, type BetaPost, type DirichPost, type GaussPost } from "./bayes";
import type { RelBucket } from "./reliability";

export interface LearnedPriors {
  fromWeek: number;
  toWeek: number;
  n: number;
  hits: number;
  brier: number;
  clv: number;
  roi: number;
  haircuts: {
    rlm: number;
    steam: number;
    tnf: number;
    chaos: number;
    wind: number;
    refOver: number;
    publicFade: number;
  };
  posts: Record<string, BetaPost>;
  clvPost: GaussPost;
  missPost: DirichPost[];
  reliability: RelBucket[];
  notes: string[];
}

export const DEFAULT_PRIORS: LearnedPriors = {
  fromWeek: 0,
  toWeek: 0,
  n: 0,
  hits: 0,
  brier: 0.25,
  clv: 0,
  roi: 0,
  haircuts: { rlm: 1, steam: 1, tnf: 1, chaos: 1, wind: 1, refOver: 1, publicFade: 1 },
  posts: {},
  clvPost: clvUpdate([]),
  missPost: [],
  reliability: [],
  notes: ["No graded tickets in this prior. League Beta(κ = 10) until the archive is loaded."],
};

let current: LearnedPriors = DEFAULT_PRIORS;

export function getPriors(): LearnedPriors {
  return current;
}

export function setPriors(next: LearnedPriors) {
  current = next;
}
