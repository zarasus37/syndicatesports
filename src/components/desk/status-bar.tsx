import { useClientReady } from "@/lib/hooks/use-client-ready";
import { PHASE_COPY } from "@/lib/nfl/audit";
import { DATA_SOURCE, DESK_ENV, MODEL_VERSION, PRODUCTION } from "@/lib/nfl/desk-meta";
import { SHEET_ID } from "@/lib/nfl/run-store";
import { useDesk } from "@/lib/nfl/store";

export function StatusBar() {
  const ready = useClientReady();
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const phase = useDesk((s) => s.runPhase) ?? "idle";
  const runId = useDesk((s) => s.runId);
  const sheetId = useDesk((s) => s.sheetId) ?? SHEET_ID;
  const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
  const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
  const asOf = lastRunAt
    ? new Date(lastRunAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="border-b border-border bg-muted/40">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="text-warn">{DESK_ENV}</span>
        <span>{dataMode}</span>
        <span>{oddsBooks.length >= 2 ? `odds ${oddsBooks.length} books` : oddsBooks.length === 1 ? "odds 1 book" : "odds not live"}</span>
        <span>{oddsBooks.length ? oddsBooks.join(" · ") : `feeds ${PRODUCTION}`}</span>
        <span>model {MODEL_VERSION}</span>
        <span className="text-foreground">{!ready ? "…" : lastRunAt ? PHASE_COPY[phase] : "idle"}</span>
        <span>sheet {sheetId}</span>
        {ready && runId ? <span className="hidden sm:inline">{runId}</span> : null}
        <span>{!ready ? "loading run" : asOf ? `priced ${asOf}` : "no run"}</span>
        <span className="hidden md:inline">{oddsBooks.length ? "sheet open is not the book open" : `data ${DATA_SOURCE}`}</span>
      </p>
    </div>
  );
}
