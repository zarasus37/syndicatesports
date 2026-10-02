import { authEnabled } from "@/lib/auth/client";

export const DEVICE_KEYS = [
  "syndicate.age.v1",
  "syndicate.run.v3",
  "syndicate.run.meta.v3",
  "syndicate.current.v1",
  "syndicate.book.v1",
  "syndicate.outs.v1",
  "syndicate.ledger.v1",
  "syndicate.winners.v1",
  "syndicate.journal.v1",
  "syndicate.snaps.v1",
  "syndicate.waitlist.v1",
  "syndicate.support.v1",
] as const;

const SUPPORT_KEY = "syndicate.support.v1";

export interface SupportNote {
  at: number;
  note: string;
}

export interface PerimeterControl {
  id: string;
  title: string;
  status: "pass" | "fail";
  detail: string;
}

export function attemptCharge(): { ok: false; reason: "BILLING_CLOSED" } {
  return { ok: false, reason: "BILLING_CLOSED" };
}

export function entitlement(): { paid: false; id: null; reason: string } {
  return { paid: false, id: null, reason: "No paid entitlement is issued. A sign-in would not open one." };
}

export function loadSupport(): SupportNote[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUPPORT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SupportNote[];
    return Array.isArray(parsed) ? parsed.filter((n) => n && typeof n.note === "string").slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function saveSupport(note: string): SupportNote[] {
  const text = note.trim().slice(0, 500);
  if (!text || typeof localStorage === "undefined") return loadSupport();
  const next = [{ at: Date.now(), note: text }, ...loadSupport()].slice(0, 20);
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(next));
  return next;
}

export function readDeviceRecord(): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  if (typeof localStorage === "undefined") return out;
  for (const key of DEVICE_KEYS) out[key] = localStorage.getItem(key);
  return out;
}

export function eraseDeviceRecord() {
  if (typeof localStorage === "undefined") return;
  for (const key of DEVICE_KEYS) localStorage.removeItem(key);
  document.cookie = "syndicate.currentRun=;path=/;max-age=0;SameSite=Lax";
}

export function perimeterControls(input: { ageOk: boolean; signedInIdentity: boolean }): PerimeterControl[] {
  const charge = attemptCharge();
  const access = entitlement();
  return [
    {
      id: "privacy",
      title: "Privacy",
      status: "pass",
      detail: "The research record stays on this device. It is not sold. The keys are listed. Delete removes them.",
    },
    {
      id: "terms",
      title: "Terms",
      status: "pass",
      detail: "Paper only. No wager is sent. 21+. A waitlist note is not a subscription.",
    },
    {
      id: "age",
      title: "Age gate",
      status: input.ageOk ? "pass" : "fail",
      detail: input.ageOk
        ? "21 is confirmed on this device. Revoke puts the gate back."
        : "The desk stays blocked until 21 is confirmed on this device.",
    },
    {
      id: "identity",
      title: "Identity",
      status: input.signedInIdentity ? "pass" : "fail",
      detail: input.signedInIdentity
        ? "A signed-in identity is present. It still has no paid entitlement."
        : authEnabled
          ? "Sign-in is on and this session has no identity. The dev fallback is not an account."
          : "Sign-in is off. There is no user identity. Exporting this device is not an account.",
    },
    {
      id: "security",
      title: "Security",
      status: "pass",
      detail: "No card field, no password, and no sportsbook session. A charge argument is refused and not stored.",
    },
    {
      id: "support",
      title: "Support",
      status: "fail",
      detail: "A note can be kept on this device. It is not sent. There is no staffed desk. 1-800-GAMBLER is the gambling line, not product support.",
    },
    {
      id: "billing",
      title: "Billing",
      status: charge.ok ? "fail" : "pass",
      detail: charge.ok ? "A charge succeeded. That is a hole." : "Every charge is refused. No card is collected. The target rates are not for sale.",
    },
    {
      id: "entitlement",
      title: "Entitlement",
      status: access.paid ? "fail" : "pass",
      detail: access.paid ? "A paid entitlement was issued." : access.reason,
    },
  ];
}

export function perimeterGate(input: { ageOk: boolean; signedInIdentity: boolean }): { status: "pass" | "partial" | "fail"; now: string } {
  const controls = perimeterControls(input);
  const unmet = controls.filter((c) => c.status === "fail");
  if (controls.some((c) => c.id === "billing" && c.status === "fail") || controls.some((c) => c.id === "entitlement" && c.status === "fail")) {
    return { status: "fail", now: "Billing or an entitlement opened. Paid must stay closed." };
  }
  if (!unmet.length) {
    return {
      status: "pass",
      now: "Privacy, terms, age, identity, security, support, billing, and entitlement are enforced. No charge was created.",
    };
  }
  return {
    status: "partial",
    now: `Enforced: ${controls.filter((c) => c.status === "pass").map((c) => c.title.toLowerCase()).join(", ")}. Not met: ${unmet.map((c) => c.detail).join(" ")} Paid stays closed.`,
  };
}
