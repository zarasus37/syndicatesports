export const PHASE = "beta" as const;

export const PLANS = {
  monthly: {
    id: "monthly" as const,
    name: "Monthly",
    price: 79,
    cadence: "month",
    blurb: "In-season card. Cancel any Monday. Win totals and futures are on the season plan.",
  },
  season: {
    id: "season" as const,
    name: "Season",
    price: 399,
    cadence: "season",
    blurb: "The card through preseason week 1, plus win totals, futures, and offseason prior updates.",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const INCLUDED = [
  "The card: live-book sides and totals that clear the hurdle, sized in units. Props and model parlays are not recommendations",
  "This week’s plays and the unit size we would actually bet",
  "SU board: a straight-up winner on all 16 games, graded separately from the card",
  "The desk: line movement, steam/RLM, handle vs tickets, referees, weather, half-Kelly",
  "NFL founding rate for as long as the subscription stays active",
] as const;

export const SEASON_EXTRA = [
  "Win totals and futures when those markets open — our number versus the board, with size",
  "Public prior updates after coordinator changes, the draft, and camp — how the Week 1 number moved",
  "Access through preseason week 1. The next regular season is a new term",
] as const;

export const NEVER = [
  "Lock-of-the-week marketing or a tout record presented as ATS",
  "One-click betting or sending a wager to a sportsbook",
  "Deleted losses. The public record stays complete",
  "A card charge, a deposit, or a paid entitlement before the launch gates pass",
  "Other sports bundled into the NFL founding rate. Those are separate products",
] as const;

export const ROADMAP = [
  {
    id: "pilot",
    title: "Research pilot",
    when: "Now",
    current: true,
    body: "50 pilot research seats. A request reserves no access and creates no charge. Billing waits on Gates 1–7. Gate 8 is ongoing feedback, not a finish line.",
  },
  {
    id: "beta",
    title: "Public beta",
    when: "Now",
    current: true,
    body: "The model is live and updates as weeks grade. Card, props, parlays, and units — paper only, seeded sheet.",
  },
  {
    id: "founding",
    title: "Founding rate (not charged)",
    when: "After gates 1–7",
    current: false,
    body: "Target only: $79 / month in season, $399 through preseason week 1. Not active. Not reserved by the waitlist. Holds only if we later bill and the subscription stays active.",
  },
  {
    id: "book",
    title: "Longer record",
    when: "Next",
    current: false,
    body: "As more Sundays grade, the published price increases for new subscribers. Founding rates do not change.",
  },
  {
    id: "close",
    title: "Live close",
    when: "After",
    current: false,
    body: "CLV versus the kickoff number, not only the open. A further step in the public price. Founding rates stay put.",
  },
  {
    id: "offseason",
    title: "Offseason markets",
    when: "Post–Super Bowl",
    current: false,
    body: "Win totals, futures, and prior updates. Included on season. Monthly is inactive until the next regular season.",
  },
  {
    id: "sports",
    title: "Additional sports",
    when: "Later",
    current: false,
    body: "Same method, new slates, after the NFL product meets the standard. Founding members get early access and a founding rate on that product — not a free add-on.",
  },
] as const;

const WAITLIST_KEY = "syndicate.waitlist.v1";

export interface WaitlistEntry {
  email: string;
  plan: PlanId;
  at: number;
  attest21: true;
  pilot: true;
}

export function loadWaitlist(): WaitlistEntry | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WaitlistEntry;
    if (!parsed?.email || (parsed.plan !== "monthly" && parsed.plan !== "season")) return null;
    return { ...parsed, attest21: true, pilot: true };
  } catch {
    return null;
  }
}

export function saveWaitlist(entry: WaitlistEntry) {
  try {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(entry));
  } catch {
    /* quota */
  }
}

export function formatPrice(n: number) {
  return `$${n}`;
}
