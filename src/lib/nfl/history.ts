import type { LedgerTicket } from "./types";

/** Closed 2026 cards. Real Week 1–2 slates and scores. Week 3 is live. */
export const ARCHIVE: LedgerTicket[] = [
  { id: "w1-sea", week: 1, kind: "spread", matchup: "NE @ SEA", side: "SEA -2.5", line: -2.5, price: -110, prob: 0.56, ev: 0.049, tags: ["steam", "home"], clv: 0.5, result: "win", score: "13-10", reasons: ["clv-captured", "home-script"] },
  { id: "w1-sf", week: 1, kind: "spread", matchup: "SF @ LAR", side: "SF -3.5", line: -3.5, price: -108, prob: 0.58, ev: 0.072, tags: ["steam", "sharp"], clv: 1.0, result: "win", score: "27-7", reasons: ["model-hit"] },
  { id: "w1-chi", week: 1, kind: "spread", matchup: "CHI @ CAR", side: "CHI -3.5", line: -3.5, price: -110, prob: 0.57, ev: 0.058, tags: ["sharp"], clv: 1.5, result: "win", score: "59-37", reasons: ["clv-captured"] },
  { id: "w1-det", week: 1, kind: "spread", matchup: "NO @ DET", side: "DET -6.5", line: -6.5, price: -108, prob: 0.57, ev: 0.055, tags: ["public-fade"], clv: 0.5, result: "loss", score: "31-30 OT", reasons: ["key-number", "public-was-right"] },
  { id: "w1-bal", week: 1, kind: "spread", matchup: "BAL @ IND", side: "BAL -3.5", line: -3.5, price: -110, prob: 0.59, ev: 0.082, tags: ["steam"], clv: 1.0, result: "win", score: "41-23", reasons: ["model-hit"] },
  { id: "w1-buf", week: 1, kind: "spread", matchup: "BUF @ HOU", side: "BUF -5.5", line: -5.5, price: -110, prob: 0.56, ev: 0.049, tags: ["steam"], clv: -0.5, result: "loss", score: "36-31", reasons: ["line-moved-against"] },
  { id: "w1-phi", week: 1, kind: "spread", matchup: "WAS @ PHI", side: "PHI -7", line: -7, price: -108, prob: 0.55, ev: 0.04, tags: ["public-fade"], clv: 0, result: "loss", score: "24-22", reasons: ["key-number", "public-was-right"] },
  { id: "w1-kc", week: 1, kind: "spread", matchup: "DEN @ KC", side: "KC -6.5", line: -6.5, price: -115, prob: 0.58, ev: 0.061, tags: ["home", "chaos"], clv: 1.5, result: "win", score: "31-10", reasons: ["rlm-hit"] },
  { id: "w1-nyg", week: 1, kind: "spread", matchup: "DAL @ NYG", side: "NYG +3", line: 3, price: -110, prob: 0.54, ev: 0.035, tags: ["rlm", "public-fade"], clv: 1.0, result: "win", score: "28-20", reasons: ["rlm-hit"] },
  { id: "w1-opener", week: 1, kind: "total", matchup: "NE @ SEA", side: "Under 38.5", line: 38.5, price: -105, prob: 0.56, ev: 0.048, tags: ["tnf", "let-play", "ref"], clv: 1.0, result: "win", score: "13-10", reasons: ["tnf-total", "ref-scripted"] },
  { id: "w1-chi-tot", week: 1, kind: "total", matchup: "CHI @ CAR", side: "Over 47.5", line: 47.5, price: -108, prob: 0.55, ev: 0.046, tags: ["whistle-over", "ref"], clv: 0.5, result: "win", score: "59-37", reasons: ["ref-scripted"] },
  { id: "w1-prop-allen", week: 1, kind: "prop", matchup: "BUF @ HOU", side: "Allen pass o 268.5", line: 268.5, price: -115, prob: 0.58, ev: 0.062, tags: ["prop"], clv: 0, result: "win", score: "334 yds", reasons: ["model-hit"] },
  { id: "w1-parlay", week: 1, kind: "parlay", matchup: "SEA / SF / BAL", side: "3-leg", line: 0, price: 600, prob: 0.19, ev: 0.071, tags: ["parlay", "steam"], clv: 0, result: "win", score: "3-0", reasons: ["clv-captured"] },

  { id: "w2-buf", week: 2, kind: "spread", matchup: "DET @ BUF", side: "BUF -3.5", line: -3.5, price: -110, prob: 0.57, ev: 0.058, tags: ["home", "steam"], clv: 0.5, result: "win", score: "41-31", reasons: ["model-hit"] },
  { id: "w2-atl", week: 2, kind: "spread", matchup: "CAR @ ATL", side: "ATL -3", line: -3, price: -110, prob: 0.55, ev: 0.042, tags: ["public-fade"], clv: -1.0, result: "loss", score: "34-3", reasons: ["public-was-right", "model-soft"] },
  { id: "w2-min", week: 2, kind: "spread", matchup: "MIN @ CHI", side: "MIN -2.5", line: -2.5, price: -110, prob: 0.56, ev: 0.049, tags: ["steam"], clv: 1.5, result: "win", score: "9-3", reasons: ["clv-captured"] },
  { id: "w2-cin", week: 2, kind: "spread", matchup: "CIN @ HOU", side: "CIN -3", line: -3, price: -108, prob: 0.55, ev: 0.04, tags: ["sharp"], clv: 0.5, result: "win", score: "20-6", reasons: ["model-hit"] },
  { id: "w2-ne", week: 2, kind: "spread", matchup: "PIT @ NE", side: "NE -3", line: -3, price: -110, prob: 0.54, ev: 0.035, tags: ["sharp", "public-fade"], clv: 1.0, result: "win", score: "20-3", reasons: ["clv-captured"] },
  { id: "w2-den", week: 2, kind: "spread", matchup: "JAX @ DEN", side: "DEN -3.5", line: -3.5, price: -108, prob: 0.54, ev: 0.037, tags: ["chaos", "home"], clv: 1.0, result: "win", score: "20-13", reasons: ["chaos-hit"] },
  { id: "w2-lac", week: 2, kind: "spread", matchup: "LV @ LAC", side: "LAC -3", line: -3, price: -110, prob: 0.55, ev: 0.042, tags: ["home"], clv: 0, result: "loss", score: "26-14", reasons: ["model-soft"] },
  { id: "w2-sf", week: 2, kind: "spread", matchup: "MIA @ SF", side: "SF -9.5", line: -9.5, price: -110, prob: 0.6, ev: 0.091, tags: ["steam"], clv: 1.0, result: "win", score: "35-13", reasons: ["model-hit"] },
  { id: "w2-kc", week: 2, kind: "spread", matchup: "IND @ KC", side: "KC -7", line: -7, price: -115, prob: 0.56, ev: 0.041, tags: ["public-fade", "sharp"], clv: -1.0, result: "loss", score: "33-30 OT", reasons: ["key-number", "public-was-right"] },
  { id: "w2-tnf", week: 2, kind: "total", matchup: "DET @ BUF", side: "Over 48.5", line: 48.5, price: -105, prob: 0.54, ev: 0.038, tags: ["tnf", "whistle-over", "ref"], clv: 0, result: "win", score: "41-31", reasons: ["tnf-total"] },
  { id: "w2-vin", week: 2, kind: "total", matchup: "MIN @ CHI", side: "Under 37.5", line: 37.5, price: -110, prob: 0.56, ev: 0.049, tags: ["let-play", "ref"], clv: 0.5, result: "win", score: "9-3", reasons: ["ref-scripted"] },
  { id: "w2-parlay", week: 2, kind: "parlay", matchup: "BUF / MIN / SF", side: "3-leg", line: 0, price: 600, prob: 0.17, ev: 0.055, tags: ["parlay", "steam"], clv: 0, result: "win", score: "3-0", reasons: ["clv-captured"] },
];
