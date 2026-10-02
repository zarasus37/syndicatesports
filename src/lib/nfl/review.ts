import { REASON_COPY } from "./learn";
import type { LearnedPriors } from "./priors";
import type { LedgerTicket } from "./types";
import { americanOdds, formatPct, formatSigned } from "../utils";

/** Why a graded ticket missed — or that the decision held. */
export type MissClass =
  | "held"
  | "variance"
  | "stale-pricing"
  | "over-weighted-context"
  | "misread-market"
  | "model-error"
  | "open";

export const MISS_CLASS_META: Record<MissClass, { label: string; detail: string }> = {
  held: {
    label: "Held",
    detail: "The rules that put this on the card were not contradicted by the result.",
  },
  variance: {
    label: "Variance",
    detail: "Price and process were reasonable. The result sat inside the distribution — key number, juice, or one leg.",
  },
  "stale-pricing": {
    label: "Stale price",
    detail: "Negative CLV. The stored number was behind where the market went.",
  },
  "over-weighted-context": {
    label: "Over-weighted context",
    detail: "Weather, crew, slot, or outs were asked to do more work than the result supported.",
  },
  "misread-market": {
    label: "Misread market",
    detail: "Tickets, handle, or steam were read the wrong way. The other side of the market was right.",
  },
  "model-error": {
    label: "Model error",
    detail: "The number was too ambitious. Direction can be fine and the side still lose.",
  },
  open: {
    label: "Open",
    detail: "Not graded. The stored price is what will be reviewed. Nothing trains a weight yet.",
  },
};

/** Primary class when several reasons fire. Market reads outrank a close loss. */
const CLASS_RANK: MissClass[] = [
  "misread-market",
  "stale-pricing",
  "model-error",
  "over-weighted-context",
  "variance",
];

const REASON_CLASS: Record<string, MissClass> = {
  juice: "variance",
  "key-number": "variance",
  "one-leg": "variance",
  "line-moved-against": "stale-pricing",
  "weather-miss": "over-weighted-context",
  "ref-conflict": "over-weighted-context",
  "public-was-right": "misread-market",
  "handle-led-steam": "misread-market",
  "model-soft": "model-error",
};

const FAILED_COPY: Record<string, string> = {
  "key-number": "Lost on the key number. The side was live; the price was not.",
  "public-was-right": "Fade used ticket share without handle confirmation. The public side cashed.",
  "line-moved-against": "Stored number was already behind the tape.",
  "model-soft": "The number was too ambitious versus the final margin.",
  "weather-miss": "Weather tax was weighted above what the player actually did.",
  "ref-conflict": "Crew lean was weighted over the slot. The slot won.",
  "handle-led-steam": "Treated square steam — handle and the number together — as a sharp move.",
  juice: "After juice this was a coin flip. Variance, not a broken feature.",
  "one-leg": "The joint price needed every leg. One leg decided the ticket.",
};

type FactorRole = "forecast" | "market" | "context";

export interface FactorRow {
  signal: string;
  role: FactorRole;
  weight: "material" | "annotation";
  read: string;
}

const TAG_FACTOR: Record<string, Omit<FactorRow, "read"> & { read: string }> = {
  steam: {
    signal: "Steam",
    role: "market",
    weight: "material",
    read: "Number and handle moved together before the card.",
  },
  rlm: {
    signal: "Reverse line move",
    role: "market",
    weight: "material",
    read: "Line moved against the ticket majority.",
  },
  sharp: {
    signal: "Sharp grade",
    role: "market",
    weight: "annotation",
    read: "Desk sharp grade. Diagnostic context — not a bet by itself.",
  },
  "public-fade": {
    signal: "Public fade",
    role: "market",
    weight: "material",
    read: "Faded a heavy ticket side. Handle has to disagree or this is noise.",
  },
  home: {
    signal: "Home overlay",
    role: "forecast",
    weight: "annotation",
    read: "Home-field context. The line already carries most of it.",
  },
  tnf: {
    signal: "Thursday slot",
    role: "context",
    weight: "material",
    read: "Short week. A slot prior on the total, not an automatic under.",
  },
  "let-play": {
    signal: "Let-play crew",
    role: "context",
    weight: "annotation",
    read: "Fewer flags. Annotation unless the total cleared the juice.",
  },
  ref: {
    signal: "Officiating",
    role: "context",
    weight: "annotation",
    read: "Crew tendency on totals or flags. Never a side by itself.",
  },
  "whistle-over": {
    signal: "Whistle-over",
    role: "context",
    weight: "material",
    read: "Flag-heavy crew leaning the over.",
  },
  wind: {
    signal: "Weather",
    role: "context",
    weight: "material",
    read: "Wind or heat tax on the total and passing props.",
  },
  prop: {
    signal: "Player distribution",
    role: "forecast",
    weight: "material",
    read: "Model distribution versus the posted number.",
  },
  parlay: {
    signal: "Joint price",
    role: "forecast",
    weight: "material",
    read: "Three legs, correlation haircut, same-game ban.",
  },
};

type HaircutKey = keyof LearnedPriors["haircuts"];

const TAG_HAIRCUT: Record<string, HaircutKey> = {
  rlm: "rlm",
  steam: "steam",
  tnf: "tnf",
  wind: "wind",
  "whistle-over": "refOver",
  "public-fade": "publicFade",
};

/** |posterior / prior − 1| below this does not move the next slate. Matches the engine notes. */
const MOVE = 0.04;

const HELD_REASON: Record<string, string> = {
  "clv-captured": "Market moved toward the card after the number was stored.",
  "rlm-hit": "Reverse line move agreed with the result.",
  "model-hit": "Cover probability was on the right side of the number.",
  "home-script": "Home overlay agreed with the result.",
  "ref-scripted": "Crew tendency showed up in the box score.",
  "weather-hit": "Weather overlay showed up in the box score.",
  "tnf-total": "Thursday total lean agreed with the score.",
};

export interface TicketReview {
  ticket: LedgerTicket;
  priceLine: string;
  factors: FactorRow[];
  outcome: string;
  held: string[];
  failed: string[];
  missClass: MissClass;
  /** Other classes that also fired, highest priority first. */
  also: MissClass[];
  change: string;
}

export function reviewTicket(t: LedgerTicket, priors: LearnedPriors): TicketReview {
  const classes = classOf(t);
  return {
    ticket: t,
    priceLine: priceLine(t),
    factors: factorsOf(t),
    outcome: outcomeOf(t),
    held: heldOf(t),
    failed: failedOf(t),
    missClass: classes.primary,
    also: classes.also,
    change: changeOf(t, priors),
  };
}

export function reviewTickets(rows: LedgerTicket[], priors: LearnedPriors): TicketReview[] {
  return rows.map((t) => reviewTicket(t, priors));
}

export function classCounts(rows: TicketReview[]) {
  const counts = Object.fromEntries((Object.keys(MISS_CLASS_META) as MissClass[]).map((k) => [k, 0])) as Record<
    MissClass,
    number
  >;
  for (const r of rows) counts[r.missClass] += 1;
  return counts;
}

function priceLine(t: LedgerTicket) {
  const number = t.kind === "parlay" ? "joint" : `line ${formatSigned(t.line, t.line % 1 === 0 ? 0 : 1)}`;
  return `${t.side} ${americanOdds(t.price)} · ${number} · model ${formatPct(t.prob)} · post-vig EV ${formatSigned(t.ev * 100)}%`;
}

function factorsOf(t: LedgerTicket): FactorRow[] {
  const rows: FactorRow[] = [
    {
      signal: "Stored price",
      role: "market",
      weight: "material",
      read: `Decision price. CLV versus the open is ${formatSigned(t.clv)} pt.`,
    },
  ];
  for (const tag of t.tags) {
    const f = TAG_FACTOR[tag];
    if (f) rows.push(f);
  }
  if (rows.length === 1) {
    rows.push({
      signal: "Model residual",
      role: "forecast",
      weight: "material",
      read: "No market or context tag. The number cleared the juice on probability alone.",
    });
  }
  return rows;
}

function outcomeOf(t: LedgerTicket) {
  if (t.result === "pending") return "Not graded. Review waits on the result.";
  if (t.result === "push") return `Push${t.score ? ` · ${t.score}` : ""}. Returned stake does not train a hit rate.`;
  const verb = t.result === "win" ? "Cashed" : "Lost";
  const box = t.score ? ` Final ${t.score}.` : "";
  return `${verb}.${box} CLV versus the open ${formatSigned(t.clv)}.`;
}

function classOf(t: LedgerTicket): { primary: MissClass; also: MissClass[] } {
  if (t.result === "pending") return { primary: "open", also: [] };
  if (t.result === "win" || t.result === "push") return { primary: "held", also: [] };
  const found = [...new Set(t.reasons.map((r) => REASON_CLASS[r]).filter((c): c is MissClass => Boolean(c)))];
  if (t.clv < 0 && !found.includes("stale-pricing")) found.push("stale-pricing");
  if (!found.length) found.push(t.clv >= 0 ? "variance" : "stale-pricing");
  const ranked = CLASS_RANK.filter((c) => found.includes(c));
  return { primary: ranked[0] ?? "variance", also: ranked.slice(1) };
}

function heldOf(t: LedgerTicket): string[] {
  if (t.result === "pending") return ["None yet. Assumptions are stored with the price and checked after the grade."];
  const out: string[] = [];
  if (t.clv > 0) out.push(`Beat the open by ${formatSigned(t.clv)}. The stored price was the right side of the tape.`);
  else if (t.clv === 0) out.push("Flat to the recorded open. That is not a closing-line value.");
  for (const r of t.reasons) {
    const line = HELD_REASON[r];
    if (line && !out.includes(line)) out.push(line);
  }
  if (t.result === "win" && !t.reasons.some((r) => r in HELD_REASON)) {
    out.push("Result agreed with the side. No single factor is credited beyond the price.");
  }
  if (!out.length) out.push("No assumption on this ticket is marked as having held.");
  return out;
}

function failedOf(t: LedgerTicket): string[] {
  if (t.result === "pending") return ["Not graded."];
  if (t.result === "win" || t.result === "push") {
    return ["None material. A hit is not a reason to raise the weight."];
  }
  const out = t.reasons.map((r) => FAILED_COPY[r] ?? REASON_COPY[r] ?? r);
  if (t.clv < 0 && !t.reasons.includes("line-moved-against")) {
    out.push(`CLV ${formatSigned(t.clv)}. We were behind the open even if another reason is primary.`);
  }
  return out.length ? out : ["Loss with no logged reason. Treated as variance until a cause is assigned."];
}

function changeOf(t: LedgerTicket, priors: LearnedPriors): string {
  if (t.result === "pending") return "Nothing. An open ticket does not move a weight.";
  const klass = classOf(t).primary;
  const touched = [
    ...new Set(t.tags.map((tag) => TAG_HAIRCUT[tag]).filter((k): k is HaircutKey => Boolean(k))),
  ].map((key) => ({ key, mult: priors.haircuts[key] }));

  if (t.result === "loss") {
    const cuts = touched.filter((x) => x.mult <= 1 - MOVE);
    if (cuts.length) {
      const bits = cuts.map((x) => `${labelKey(x.key)} ${x.mult.toFixed(2)}×`);
      const why =
        cuts.length === 1 && cuts[0]?.key === "publicFade"
          ? "Fades that used ticket share without handle are no longer full weight."
          : "This miss is inside that posterior.";
      return `${bits.join(", ")} on the next slate. ${why} One ticket did not set the number. The stored price is not rewritten.`;
    }
    if (klass === "stale-pricing") {
      return "Logged as a stale price. There is no multiplier for negative CLV. A tag that cashed elsewhere is not cut because this ticket was behind the open.";
    }
    if (klass === "model-error") {
      return "Logged as model error — the number was too ambitious. No feature weight moved off this ticket. κ = 10 still dominates a two-week sample.";
    }
    if (klass === "variance") {
      return "Logged as variance. A key number, or a coin flip after juice, does not change a weight.";
    }
    if (klass === "over-weighted-context") {
      return "Logged as over-weighted context. The related weight is still inside 4% of the prior, so the next slate uses 1.00×.";
    }
    return "Logged as a misread market. The related weight has not cleared the prior, so this miss does not rewrite the rule.";
  }

  const down = touched.filter((x) => x.mult <= 1 - MOVE);
  if (down.length) {
    const bits = down.map((x) => `${labelKey(x.key)} is still ${x.mult.toFixed(2)}×`);
    return `${bits.join(", ")}. This cash is in the sample and did not restore the weight.`;
  }
  const up = touched.filter((x) => x.mult >= 1 + MOVE);
  if (up.length) {
    const bits = up.map((x) => `${labelKey(x.key)} ${x.mult.toFixed(2)}×`);
    return `Counted in ${bits.join(", ")}. That is the tag’s posterior, not this ticket. A hit does not raise the unit size.`;
  }
  return "No weight change. A hit does not raise a multiplier, and a hot streak does not inflate the posterior.";
}

function labelKey(key: HaircutKey) {
  if (key === "refOver") return "Whistle-over";
  if (key === "publicFade") return "Public fade";
  if (key === "tnf") return "Thursday";
  return key;
}
