import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { loadAgeOk } from "@/lib/nfl/age";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import {
  attemptCharge,
  DEVICE_KEYS,
  entitlement,
  eraseDeviceRecord,
  loadSupport,
  perimeterControls,
  readDeviceRecord,
  saveSupport,
  type SupportNote,
} from "@/lib/perimeter";

export const Route = createFileRoute("/legal")({ component: LegalPage });

function LegalPage() {
  const ready = useClientReady();
  const { user, isPending } = useCurrentUserState();
  const ageOk = ready && loadAgeOk();
  const signedInIdentity = ready && !isPending && Boolean(user) && !user?.isDevFallback;
  const controls = perimeterControls({ ageOk, signedInIdentity });
  const access = entitlement();
  const [notes, setNotes] = useState<SupportNote[]>([]);
  const [draft, setDraft] = useState("");
  const [charge, setCharge] = useState<string | null>(null);

  useEffect(() => {
    if (ready) setNotes(loadSupport());
  }, [ready]);

  function onSupport(e: FormEvent) {
    e.preventDefault();
    setNotes(saveSupport(draft));
    setDraft("");
  }

  function downloadRecord() {
    const blob = new Blob(
      [JSON.stringify({ at: new Date().toISOString(), record: readDeviceRecord(), note: "Device record. Not an account." }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "syndicate-device-record.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Perimeter</p>
        <h1 className="text-3xl font-medium tracking-tight">Terms, privacy, and what is enforced.</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Paper tickets. 21+. Nothing here is a sportsbook or a promise of profit. Gate 7 stays partial until there is a real identity and a support note that actually leaves this device.
        </p>
      </section>

      <section className="space-y-2">
        {controls.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">{c.title}</h2>
              <Badge variant={c.status === "pass" ? "profit" : "warn"}>{c.status}</Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Terms</h2>
        <ul className="max-w-2xl space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>SyndicateSports publishes a card and a straight-up board. We do not accept, transmit, or settle wagers.</li>
          <li>A recommendation is a live book price with a time. A seeded number is not a recommendation. Props and model parlays are not on the card.</li>
          <li>A lock counts only before that ticket’s sheet kickoff. A later relock, void, or clear is refused.</li>
          <li>Sides and totals settle from the ESPN scoreboard. Props and parlays do not.</li>
          <li>We do not charge. A waitlist note reserves no access. The $79 and $399 figures are targets, not an offer.</li>
          <li>You must be 21 or older. There is no account on this desk.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Privacy</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These keys stay in this browser. They are not sold and they are not sent with a charge. Age confirmation is the string “21”. Do not enter a password or a card number. Delete removes the list.
        </p>
        <ul className="font-mono text-xs text-muted-foreground">
          {DEVICE_KEYS.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Billing and entitlement</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paid access: {access.paid ? "open" : "none"}. {access.reason}
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const refused = attemptCharge();
            setCharge(refused.ok ? "A charge went through." : "Refused. No card was taken. Nothing was stored.");
          }}
        >
          Run the billing check
        </Button>
        {charge ? <p className="text-sm">{charge}</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Device controls</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Export and delete apply to this browser only. They do not create or close an account.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={downloadRecord}>
            Export this device record
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              eraseDeviceRecord();
              window.location.reload();
            }}
          >
            Delete this device record
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Support</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This note stays on the device. It is not emailed and no one is staffed to read it. If gambling is a problem, call 1-800-GAMBLER or visit{" "}
          <a className="underline" href="https://www.ncpgambling.org/" rel="noreferrer">
            ncpgambling.org
          </a>
          .
        </p>
        <form onSubmit={onSupport} className="max-w-xl space-y-2">
          <label htmlFor="support-note" className="sr-only">
            Support note
          </label>
          <textarea
            id="support-note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Kept here. Not sent."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
          <Button type="submit" variant="secondary" disabled={!draft.trim()}>
            Keep the note on this device
          </Button>
        </form>
        {notes.length ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {notes.map((n) => (
              <li key={n.at}>
                {new Date(n.at).toLocaleString()} · not sent · {n.note}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="text-sm text-muted-foreground">
        <Link to="/gates" className="underline">
          Launch gates
        </Link>
        {" · "}
        <Link to="/plans" className="underline">
          Pilot
        </Link>
      </p>
    </div>
  );
}
