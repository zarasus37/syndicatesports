import { useEffect } from "react";
import { useClientReady } from "./hooks/use-client-ready";
import { isLiveBook } from "./nfl/books";
import { useCurrentUserState } from "./auth/use-current-user";
import { loadAgeOk } from "./nfl/age";
import { perimeterGate } from "./perimeter";
import { volumeGate } from "./nfl/volume";
import { ledgerGate } from "./nfl/ledger";
import { settlementGate, type BoxBoard } from "./nfl/box";
import { useDesk } from "./nfl/store";

export type GateStatus = "pass" | "partial" | "fail";

export interface LaunchGate {
  n: number;
  id: string;
  title: string;
  status: GateStatus;
  blocksPaid: boolean;
  must: string;
  now: string;
}

export const PILOT_SEATS = 50;

export const PILOT_CRITERIA = [
  "21 or older",
  "Will read the ticket integrity record, not a screenshot of a pick",
  "Understands a straight-up prediction is not a wager",
  "Willing to say when the desk was unclear, wrong, or easy to misuse",
  "Not a customer. No access is reserved. No charge is created.",
] as const;

export const LAUNCH_GATES: LaunchGate[] = [
  {
    n: 1,
    id: "live-odds",
    title: "Live, attributable multi-book odds",
    status: "fail",
    blocksPaid: true,
    must: "Every recommendation stores book, timestamp, and the exact price used.",
    now: "Seeded Week 3 sheet. Not a live book. Recommendations are paper on generated numbers.",
  },
  {
    n: 2,
    id: "lock",
    title: "Lock the card before kickoff",
    status: "partial",
    blocksPaid: true,
    must: "Every ticket exposes id, card, market, model, snapshot hash, source and time, recommendation time, lock time, kickoff, actor, append-only log, and settlement fields. Integrity is computed, not asserted.",
    now: "Lock is not a claim. It counts only when this week’s card is stamped before each ticket’s sheet kickoff. This week’s settlement stays empty until those games are final.",
  },
  {
    n: 3,
    id: "settlement",
    title: "Independent settlement",
    status: "fail",
    blocksPaid: true,
    must: "Grade from a documented box-score source. Voids, pushes, postponements, and rule changes included.",
    now: "Weeks 1–2 are a fixed archive. Week 3 is pending kickoff. Settlement source on a live ticket is empty until that feed exists.",
  },
  {
    n: 4,
    id: "model-card",
    title: "Published model card",
    status: "pass",
    blocksPaid: true,
    must: "Inputs, exclusions, simulation, sizing, failure modes, versions, and what “edge” means.",
    now: "Published on Learn. Version 2026.w3.beta.1.",
  },
  {
    n: 5,
    id: "ledger",
    title: "Performance ledger",
    status: "partial",
    blocksPaid: true,
    must: "Open CLV, close CLV when available, EV, realized, calibration, max drawdown, sides/totals/props split.",
    now: "Open CLV, EV, realized units, Brier, and drawdown on the closed book. Close CLV is not live. Sample is two weeks.",
  },
  {
    n: 6,
    id: "volume",
    title: "Season of locked, auditable output",
    status: "fail",
    blocksPaid: true,
    must: "A full NFL season of locked cards before strong commercial-performance claims.",
    now: "0 of 18 until a locked card settles from the scoreboard. The Week 1–2 archive is not a locked card. No commercial-performance claim.",
  },
  {
    n: 7,
    id: "perimeter",
    title: "Product perimeter",
    status: "partial",
    blocksPaid: true,
    must: "Privacy, legal terms, age gating, user identity and account controls, security, customer support, billing, and entitlement enforcement. Required the moment anyone can pay.",
    now: "Privacy, terms, and a 21+ gate are published. Billing is refused and no entitlement is issued. There is no sign-in and no support desk. Paid stays closed.",
  },
  {
    n: 8,
    id: "pilot",
    title: "Pilot feedback, measured continuously",
    status: "partial",
    blocksPaid: false,
    must: "Comprehension, retention, willingness to pay, trust in the audit, and that a prediction is not a wager. Not a finish line. Formal input into the decision to turn billing on.",
    now: `${PILOT_SEATS} pilot research seats. Selection criteria are published. A request reserves no access and creates no charge.`,
  },
];

export function gatesForRun(input: {
  books: string[];
  mode: string;
  attributable: boolean;
  fetchedAt?: string | null;
  errors?: string[];
  plays?: {
    kind: string;
    matchup?: string;
    audit?: {
      integrity: string;
      cardLockTimestamp: number | null;
      kickoffTimestamp: number;
      recommendationTimestamp: number;
      lockActor: string | null;
      voidReason?: string;
      settlementSource: string | null;
      settlementTimestamp: number | null;
    };
  }[];
  board?: BoxBoard | null;
  ageOk: boolean;
  signedInIdentity: boolean;
}): LaunchGate[] {
  return LAUNCH_GATES.map((g) => {
    if (g.id === "live-odds") return liveOddsGate(g, input);
    if (g.id === "lock") return { ...g, ...lockGate(input.plays ?? []) };
    if (g.id === "settlement") return { ...g, ...settlementGate(input.board ?? null, input.plays ?? []) };
    if (g.id === "ledger") return { ...g, ...ledgerGate(input.board ?? null) };
    if (g.id === "volume") return { ...g, ...volumeGate(input.plays ?? []) };
    if (g.id === "perimeter") return { ...g, ...perimeterGate({ ageOk: input.ageOk, signedInIdentity: input.signedInIdentity }) };
    return g;
  });
}

function liveOddsGate(
  g: LaunchGate,
  input: { books: string[]; mode: string; attributable: boolean; fetchedAt?: string | null; errors?: string[] },
): LaunchGate {
    const stamp = input.fetchedAt ?? "timestamp on the ticket";
    const multi = input.mode === "live-books" && input.books.length >= 2 && input.attributable;
    if (multi) {
      return {
        ...g,
        status: "pass",
        now: `This run priced from ${input.books.join(", ")} · ${stamp}. Every recommendation stores that book, the fetch time, and the exact American price. Reference order is Pinnacle, then FanDuel, Bovada, DraftKings. Execution is the best price at that same number. Props and model parlays are not book prices and are not recommendations. Sheet open is not the book’s open, and the reference is not a close.`,
      };
    }
    if (input.mode === "live-books" && input.books.length === 1 && input.attributable) {
      return {
        ...g,
        status: "partial",
        now: `Only ${input.books[0]} returned at ${stamp}. One attributable book is not multi-book. Paid stays closed.`,
      };
    }
    const err = (input.errors ?? []).map((e) => e.slice(0, 140)).join(" · ");
    return {
      ...g,
      status: "fail",
      now: err
        ? `No multi-book board. ${err}. Seeded prices are not recommendations.`
        : g.now,
    };
}

function lockGate(
  plays: {
    audit?: {
      integrity: string;
      cardLockTimestamp: number | null;
      kickoffTimestamp: number;
      recommendationTimestamp: number;
      lockActor: string | null;
      voidReason?: string;
    };
  }[],
): { status: GateStatus; now: string } {
  const audits = plays.map((p) => p.audit).filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (!plays.length || audits.length !== plays.length) {
    return {
      status: plays.length ? "fail" : "partial",
      now: plays.length
        ? "A recommendation is missing its integrity record. Nothing is locked."
        : "No recommendation is on the card, so there is nothing to lock. Pass is not a locked ticket. Kickoff is the sheet timestamp, not a league clock. This week’s games are not final.",
    };
  }
  const locked = audits.filter((a) => a.cardLockTimestamp != null);
  const earliest = Math.min(...audits.map((a) => a.kickoffTimestamp));
  if (!locked.length) {
    return {
      status: "partial",
      now: `Card is open. Lock is refused at or after the earliest sheet kickoff (${new Date(earliest).toISOString()}). Valid only after a lock with recommendation ≤ lock < kickoff. This week’s games are not final.`,
    };
  }
  const invalid = audits.filter((a) => a.integrity === "invalid" || a.integrity === "open");
  if (invalid.length) {
    return {
      status: "fail",
      now: `${invalid.length} of ${audits.length} tickets are open or invalid. Integrity is computed: recommendation must be ≤ lock, and lock must be before that ticket’s sheet kickoff.`,
    };
  }
  const valid = audits.filter((a) => a.integrity === "valid");
  if (!valid.length) {
    return {
      status: "partial",
      now: "No ticket computed valid. Voids keep the original and a reason, but a void is not a locked recommendation.",
    };
  }
  const at = valid[0]?.cardLockTimestamp;
  const actor = valid[0]?.lockActor ?? "—";
  return {
    status: "pass",
    now: `${valid.length} of ${audits.length} tickets valid. Lock ${at ? new Date(at).toISOString() : "—"} by ${actor}. recommendation ≤ lock < sheet kickoff. Append-only: a later void, clear, or relock is refused and the original stays. This week’s settlement stays empty until those games are final.`,
  };
}

export function gateTally(gates = LAUNCH_GATES) {
  const required = gates.filter((g) => g.blocksPaid);
  return {
    pass: gates.filter((g) => g.status === "pass").length,
    partial: gates.filter((g) => g.status === "partial").length,
    fail: gates.filter((g) => g.status === "fail").length,
    n: gates.length,
    requiredPass: required.filter((g) => g.status === "pass").length,
    requiredN: required.length,
    paidOpen: required.every((g) => g.status === "pass"),
  };
}

export function useLaunchGates() {
  const ready = useClientReady();
  const books = useDesk((s) => s.oddsBooks) ?? [];
  const mode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
  const plays = useDesk((s) => s.plays) ?? [];
  const fetchedAt = useDesk((s) => s.oddsFetchedAt);
  const errors = useDesk((s) => s.oddsErrors) ?? [];
  const board = useDesk((s) => s.box);
  const loadBox = useDesk((s) => s.loadBox);
  const { user, isPending } = useCurrentUserState();
  useEffect(() => {
    if (!ready) return;
    loadBox();
  }, [ready, loadBox]);
  if (!ready) return LAUNCH_GATES;
  return gatesForRun({
    books,
    mode,
    attributable: plays.every((p) => isLiveBook(p.source)),
    fetchedAt,
    errors,
    plays,
    board,
    ageOk: loadAgeOk(),
    signedInIdentity: !isPending && Boolean(user) && !user?.isDevFallback,
  });
}
