import { useEffect } from "react";
import { useDesk } from "@/lib/nfl/store";

export default function DeskRuntime() {
  const hydrate = useDesk((s) => s.hydrate);
  const hydrated = useDesk((s) => s.hydrated);
  const running = useDesk((s) => s.running);
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const dataMode = useDesk((s) => s.dataMode);
  const run = useDesk((s) => s.run);
  const loadBox = useDesk((s) => s.loadBox);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || running) return;
    // Only a run that was actually priced off live books is worth restoring.
    // A cached run priced from the seeded slate is a fallback, not a record —
    // leaving it in place pins the desk to whatever fallback it happened to
    // take, which is how a stale week-3 lineup survived a fix to the live
    // path. The graded record lives in the locked ledger, not in this cache,
    // so re-pricing costs nothing.
    if (lastRunAt && dataMode === "live-books") return;
    run();
  }, [hydrated, lastRunAt, dataMode, running, run]);

  useEffect(() => {
    if (!hydrated) return;
    loadBox();
  }, [hydrated, loadBox]);

  return null;
}