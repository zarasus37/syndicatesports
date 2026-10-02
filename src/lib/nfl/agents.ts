import type { AgentId, AgentStatus, AnomalyScore, GameSimResult, ParlayTicket, PaperTicket, PropSim } from "./types";
import { analyzeBook, pipelineHealth } from "./analytics";
import { bestTake } from "./card";
import { isPublicFlag } from "./public";
import { getPriors } from "./priors";
import { getGame } from "./slate";
import { formatPct, formatSigned } from "@/lib/utils";

export interface AgentCatalog {
  id: AgentId;
  name: string;
  role: string;
  group: "feeds" | "price" | "book" | "guard";
  capabilities: string[];
  workflow: string;
}

export const AGENT_CATALOG: AgentCatalog[] = [
  {
    id: "ingestion",
    name: "Ingestion",
    role: "Pulls slate, EPA, weather, refs, prime slots, and books.",
    group: "feeds",
    capabilities: [
      "Fetch and validate slate, EPA, weather, refs, and two books",
      "Dedupes injury and split prints; failover if Book A stalls",
      "5-minute cadence, 1-minute inside an hour of kickoff",
    ],
    workflow: "Raw ticks land in the tape. Downstream agents never hit a sportsbook.",
  },
  {
    id: "signals",
    name: "Signals",
    role: "Steam, RLM, public split, sharp score, referee tendencies.",
    group: "feeds",
    capabilities: [
      "Lead-lag drift, 60-minute steam, defended key numbers",
      "Ticket/handle divergence and reverse line moves",
      "Referee pace, DPI, and weather stress on the same snapshot",
    ],
    workflow: "Writes a feature snapshot per game. Anomaly reads it; it never prices a ticket.",
  },
  {
    id: "anomaly",
    name: "Anomaly",
    role: "Weighted score. Flags info / outlier / critical.",
    group: "price",
    capabilities: [
      "Weighted microstructure, residual, splits, and coherence",
      "Critical requires score ≥ 82 and at least two firing signals",
      "Persistence flag if the residual holds 60+ minutes",
    ],
    workflow: "Scores 0–100. Outlier/critical inflate Monte Carlo variance and shift the mean.",
  },
  {
    id: "montecarlo",
    name: "Monte Carlo",
    role: "12k–80k game paths. Chaos, tails, variance inflation.",
    group: "price",
    capabilities: [
      "Independent paths per game; Q4 chaos on Denver profiles",
      "Stress: steam, public surge, starter out, wind",
      "Tail mass on ±7; mean-shift 0.4 of unexplained steam",
    ],
    workflow: "Prices the world. +EV, parlays, and Kelly only read these draws.",
  },
  {
    id: "ev",
    name: "+EV Desk",
    role: "Strips juice, ranks cover/total/ML, tracks CLV vs open.",
    group: "price",
    capabilities: [
      "True probability vs de-vigged books. Floor 3% EV for a ticket",
      "Reliability curve + Beta-Binomial size from graded weeks",
      "CLV vs open until a live close exists",
    ],
    workflow: "Ranks every market. Passes go on the card as passes — nothing is hidden.",
  },
  {
    id: "parlay",
    name: "Parlay Lab",
    role: "3-leg builder. Correlation haircut. Point-buy fair value.",
    group: "book",
    capabilities: [
      "Search 3-leg combinations; drop same-game stacks on 3-legs",
      "Same-game 2-legs use joint frequency from the same paths",
      "Gaussian copula on wind-linked totals. Recalc EV after a buy",
    ],
    workflow: "Keeps only tickets that still print after correlation and juice.",
  },
  {
    id: "execution",
    name: "Execution",
    role: "Half-Kelly, 3% cap, paper tickets only.",
    group: "book",
    capabilities: [
      "q10 Kelly from the sized probability, capped at 3% of bankroll",
      "Point-buy only if the key (3 / 7) pays more than the juice",
      "Paper book never transmits to a sportsbook",
    ],
    workflow: "Proposes. You confirm. The public record is the lock, not the book.",
  },
  {
    id: "risk",
    name: "Risk",
    role: "Ruin, exposure, responsible-play rails.",
    group: "guard",
    capabilities: [
      "Season-path ruin on the current paper book",
      "Per-game cap and no one-click wagering",
      "21+, KYC/AML rails, 1-800-GAMBLER",
    ],
    workflow: "Can zero a stake. Cannot place one.",
  },
  {
    id: "monitor",
    name: "Monitor",
    role: "Beta–Binomial grades, Dirichlet miss modes, writes posteriors into the next run.",
    group: "guard",
    capabilities: [
      "Latency, error rate, residual drift |z|",
      "Brier and CLV on locked weeks",
      "Retrain trigger when drift or Brier walks off",
    ],
    workflow: "Grades in public. Posteriors haircut the next slate — nothing is deleted.",
  },
];

export const AGENT_META = AGENT_CATALOG.map(({ id, name, role }) => ({ id, name, role }));

export function getAgent(id: AgentId): AgentCatalog {
  return AGENT_CATALOG.find((a) => a.id === id) ?? AGENT_CATALOG[0]!;
}

export interface AgentFact {
  k: string;
  v: string;
  tone?: "profit" | "warn" | "loss";
}

export interface AgentItem {
  label: string;
  meta: string;
  href?: string;
}

export interface AgentBrief {
  id: AgentId;
  facts: AgentFact[];
  items: AgentItem[];
  note: string;
}

export interface AgentContext {
  results: GameSimResult[];
  parlays: ParlayTicket[];
  props: PropSim[];
  tickets: PaperTicket[];
  sims: number;
  lastRunMs: number | null;
  lastRunAt: number | null;
  bankroll: number;
}

export function deriveAgents(results: GameSimResult[]): AgentStatus[] {
  const flagged = results.filter((r) => r.anomaly.state !== "normal");
  // Count what the card would actually take, not the raw lean. `r.pick` is the
  // highest-EV candidate regardless of whether it clears the MIN_EV floor or
  // sizes at zero, so counting `r.pick.ev` overstates the card.
  const plus = results.filter((r) => bestTake(r) !== null);
  const chaos = results.filter((r) => r.chaosTriggers > 0.08);
  const steam = results.filter((r) => r.steam !== "stable");
  const fades = results.filter((r) => {
    const g = getGame(r.gameId);
    return g ? isPublicFlag(g) : false;
  }).length;
  const heavy = results.filter((r) => r.sharp && (r.sharp.grade === "sharp" || r.sharp.grade === "heavy")).length;
  const crit = results.filter((r) => r.anomaly.state === "critical").length;
  const outlier = results.filter((r) => r.anomaly.state === "outlier").length;
  const paths = results.reduce((s, r) => s + r.sims, 0);
  const meanClv = results.length ? results.reduce((s, r) => s + r.clvPts, 0) / results.length : 0;

  return AGENT_CATALOG.map((m, i) => {
    const base: AgentStatus = { id: m.id, name: m.name, role: m.role, state: "ok", last: "slate synced", ticks: 40 + i * 3 };
    if (m.id === "ingestion") return { ...base, last: `${results.length} games · week 3 feeds live`, ticks: 128 };
    if (m.id === "signals")
      return { ...base, last: `${steam.length} steam/RLM · ${heavy} sharp leans · ${fades} public fades`, state: steam.length || fades || heavy ? "flag" : "ok" };
    if (m.id === "anomaly")
      return {
        ...base,
        last: crit ? `${crit} critical` : outlier ? `${outlier} outliers` : `${flagged.length} info flags`,
        state: crit ? "flag" : flagged.length ? "flag" : "ok",
      };
    if (m.id === "montecarlo")
      return { ...base, last: `${paths.toLocaleString()} paths`, state: chaos.length ? "flag" : "ok" };
    if (m.id === "ev")
      return {
        ...base,
        last: `${plus.length} tickets ≥ 3% EV · CLV ${meanClv >= 0 ? "+" : ""}${meanClv.toFixed(1)}`,
        state: plus.length ? "ok" : "idle",
      };
    if (m.id === "parlay") return { ...base, last: "path-joint SGP · copula on wind totals", state: "ok" };
    if (m.id === "execution") return { ...base, last: "q10 Kelly · 3% cap · paper only", state: "ok" };
    if (m.id === "risk") return { ...base, last: "3% unit cap · 21+ rail on", state: "ok" };
    const pri = getPriors();
    return {
      ...base,
      last: pri.n
        ? `W${pri.fromWeek}–W${pri.toWeek} · ${pri.hits}/${pri.n} · Brier ${pri.brier.toFixed(2)}`
        : "waiting on graded weeks",
      state: pri.n ? "ok" : "idle",
    };
  });
}

function gameLabel(id: string): string {
  const g = getGame(id);
  return g ? `${g.away} @ ${g.home}` : id;
}

export function briefAgent(id: AgentId, ctx: AgentContext): AgentBrief {
  const { results, parlays, props, tickets, sims, lastRunMs, bankroll } = ctx;
  const health = pipelineHealth(results, sims, lastRunMs);
  const plus = [...results]
    .map((r) => ({ r, take: bestTake(r) }))
    .filter((x): x is { r: GameSimResult; take: NonNullable<typeof x.take> } => x.take !== null)
    .sort((a, b) => b.take.ev - a.take.ev);
  const steam = results.filter((r) => r.steam !== "stable");
  const flagged = [...results].filter((r) => r.anomaly.state !== "normal").sort((a, b) => b.anomaly.score - a.anomaly.score);
  const book = analyzeBook(tickets, bankroll);
  const pri = getPriors();
  const propHits = props.filter((p) => p.pick !== "pass");

  if (id === "ingestion") {
    return {
      id,
      facts: [
        { k: "Games", v: String(results.length || 16) },
        { k: "Cadence", v: `${health.cadenceMin}m` },
        { k: "Failover", v: "Book B standby" },
      ],
      items: results.slice(0, 6).map((r) => {
        const g = getGame(r.gameId);
        return { label: gameLabel(r.gameId), meta: g?.kickoffLabel ?? "", href: `/game/${r.gameId}` };
      }),
      note: "Nine feeds. Schema-checked. Nothing prices until Monte Carlo finishes.",
    };
  }
  if (id === "signals") {
    return {
      id,
      facts: [
        { k: "Steam / RLM", v: String(steam.length), tone: steam.length ? "warn" : undefined },
        { k: "Public fades", v: String(results.filter((r) => getGame(r.gameId) && isPublicFlag(getGame(r.gameId)!)).length) },
        { k: "Sharp leans", v: String(results.filter((r) => r.sharp && (r.sharp.grade === "sharp" || r.sharp.grade === "heavy")).length) },
      ],
      items: steam.slice(0, 6).map((r) => ({
        label: gameLabel(r.gameId),
        meta: `${r.steam} ${formatSigned(r.steamPts)}`,
        href: `/game/${r.gameId}`,
      })),
      note: "Tape and splits write the snapshot. Anomaly only reads.",
    };
  }
  if (id === "anomaly") {
    return {
      id,
      facts: [
        { k: "Flagged", v: String(flagged.length), tone: flagged.length ? "warn" : undefined },
        { k: "Critical", v: String(results.filter((r) => r.anomaly.state === "critical").length), tone: results.some((r) => r.anomaly.state === "critical") ? "loss" : undefined },
        { k: "Drift |z|", v: health.drift.toFixed(2) },
      ],
      items: flagged.slice(0, 6).map((r) => ({
        label: gameLabel(r.gameId),
        meta: `${r.anomaly.state} ${r.anomaly.score.toFixed(0)} · ${r.anomaly.signals.slice(0, 2).join(" · ")}`,
        href: `/game/${r.gameId}`,
      })),
      note: "Outlier and critical inflate variance 18–30% and shift the mean 0.4 of steam.",
    };
  }
  if (id === "montecarlo") {
    const paths = results.reduce((s, r) => s + r.sims, 0);
    const chaos = results.filter((r) => r.chaosTriggers > 0.05);
    return {
      id,
      facts: [
        { k: "Paths", v: paths ? paths.toLocaleString() : String(sims) },
        { k: "Chaos games", v: String(chaos.length), tone: chaos.length ? "warn" : undefined },
        { k: "Latency", v: lastRunMs ? `${lastRunMs} ms` : "—" },
      ],
      items: [...results]
        .sort((a, b) => b.stdMargin - a.stdMargin)
        .slice(0, 5)
        .map((r) => ({
          label: gameLabel(r.gameId),
          meta: `σ ${r.stdMargin.toFixed(1)} · cover ${formatPct(r.homeCover)}`,
          href: `/game/${r.gameId}`,
        })),
      note: "Run a scenario below to shock steam, outs, public, or wind without touching the live book.",
    };
  }
  if (id === "ev") {
    const clv = results.length ? results.reduce((s, r) => s + r.clvPts, 0) / results.length : 0;
    return {
      id,
      facts: [
        { k: "+EV ≥ 3%", v: String(plus.length), tone: plus.length ? "profit" : undefined },
        { k: "Mean CLV", v: `${formatSigned(clv)} pts` },
        { k: "Passes", v: String(Math.max(0, results.length - plus.length)) },
      ],
      items: plus.slice(0, 6).map((x) => ({
        label: x.take.side,
        meta: `${formatSigned(x.take.ev * 100)}% EV · ${formatPct(x.take.prob)}`,
        href: `/game/${x.r.gameId}`,
      })),
      note: "Juice stripped. Reliability curve and q10 size sit in front of Kelly.",
    };
  }
  if (id === "parlay") {
    return {
      id,
      facts: [
        { k: "Tickets", v: String(parlays.length) },
        { k: "Top edge", v: parlays[0] ? formatSigned(parlays[0].ev * 100) + "%" : "—", tone: parlays[0] ? "profit" : undefined },
        { k: "SGP", v: String(parlays.filter((p) => p.kind === "sgp").length) },
      ],
      items: parlays.slice(0, 5).map((p) => ({
        label: p.legs.map((l) => l.side).join(" / "),
        meta: `${formatSigned(p.ev * 100)}% · ${p.jointMethod}`,
        href: "/parlay",
      })),
      note: "3-legs skip same-game stacks. Wind totals share a copula. Haircut is earned, not invented.",
    };
  }
  if (id === "execution") {
    return {
      id,
      facts: [
        { k: "Paper tickets", v: String(tickets.length) },
        { k: "Stake", v: `$${Math.round(book.stake).toLocaleString()}` },
        { k: "Cap", v: "3% / game" },
      ],
      items: tickets.slice(0, 6).map((t) => ({
        label: t.side,
        meta: `$${t.stake} · ${formatSigned(t.ev * 100)}% EV`,
        href: "/book",
      })),
      note: "Half-Kelly, then the 3% ceiling. Paper only. The lock lives on Record.",
    };
  }
  if (id === "risk") {
    return {
      id,
      facts: [
        { k: "Ruin", v: formatPct(book.ruin), tone: book.ruin > 0.05 ? "loss" : undefined },
        { k: "P(down)", v: formatPct(book.pDown) },
        { k: "Exposure", v: formatPct(book.maxExposure) },
      ],
      items: [
        { label: "21+ · paper only", meta: "No sportsbook transmission" },
        { label: "1-800-GAMBLER", meta: "Responsible-play rail" },
        { label: "KYC / AML", meta: "Regional flags default research-only" },
      ],
      note: "Season paths on the current book. If ruin walks up, size comes down — the pick stays on the card.",
    };
  }
  return {
    id: "monitor",
    facts: [
      { k: "Brier", v: pri.n ? pri.brier.toFixed(2) : "—" },
      { k: "Graded", v: pri.n ? `${pri.hits}/${pri.n}` : "0" },
      { k: "Drift |z|", v: health.drift.toFixed(2) },
      { k: "Error rate", v: "0.0%" },
    ],
    items: [
      { label: "Review", meta: pri.n ? `W${pri.fromWeek}–W${pri.toWeek} posteriors` : "waiting on a lock", href: "/learn" },
      { label: "Record", meta: "Public card, including passes", href: "/record" },
      { label: "Props", meta: `${propHits.length} +EV props`, href: "/props" },
    ],
    note: "Grades write into the review. A miss stays. A weight moves only when the posterior clears the prior.",
  };
}

export function topAnomalies(results: GameSimResult[]): AnomalyScore[] {
  return [...results]
    .map((r) => r.anomaly)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
