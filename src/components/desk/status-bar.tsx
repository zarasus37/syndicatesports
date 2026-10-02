import { useClientReady } from "@/lib/hooks/use-client-ready";
import { PHASE_COPY } from "@/lib/nfl/audit";
import { DATA_SOURCE, DESK_ENV, MODEL_VERSION, PRODUCTION } from "@/lib/nfl/desk-meta";
import { DATA_MODE, SHEET_ID } from "@/lib/nfl/run-store";
import { useDesk } from "@/lib/nfl/store";

export function StatusBar() {
  const ready = useClientReady();
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const phase = useDesk((s) => s.runPhase) ?? "idle";
  const runId = useDesk((s) => s.runId);
  const sheetId = useDesk((s) => s.sheetId) ?? SHEET_ID;
  const dataMode = useDesk((s) => s.dataMode) ?? DATA_MODE;
  const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
  // First paint must match SSR. Hydrate flips these lets after mount.
  const env = ready ? DESK_ENV : "sandbox";
  const mode = ready ? dataMode : DATA_MODE;
  const books = ready ? oddsBooks : [];
  const sheet = ready ? sheetId : SHEET_ID;
  const asOf = lastRunAt
    ? new Date(lastRunAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="border-b border-border bg-muted/40">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="text-warn">{env}</span>
        <span>{mode}</span>
        <span>{books.length >= 2 ? `odds ${books.length} books` : books.length === 1 ? "odds 1 book" : "odds not live"}</span>
        <span>{books.length ? books.join(" · ") : `feeds ${PRODUCTION}`}</span>
        <span>model {MODEL_VERSION}</span>
        <span className="text-foreground">{!ready ? "…" : lastRunAt ? PHASE_COPY[phase] : "idle"}</span>
        <span>sheet {sheet}</span>
        {ready && runId ? <span className="hidden sm:inline">{runId}</span> : null}
        <span>{!ready ? "loading run" : asOf ? `priced ${asOf}` : "no run"}</span>
        <span className="hidden md:inline">{books.length ? "open is the posted open" : `data ${DATA_SOURCE}`}</span>
      </p>
    </div>
  );
}
