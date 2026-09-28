import { useEffect } from "react";
import { boardMorning } from "@/lib/nfl/cycle";
import { useDesk } from "@/lib/nfl/store";

/** Line tape on every page. Tuesday and Wednesday morning also pull the finished week. */
export function MarketTracker() {
  const hydrate = useDesk((s) => s.hydrate);
  const hydrated = useDesk((s) => s.hydrated);
  const refreshTape = useDesk((s) => s.refreshTape);
  const loadBox = useDesk((s) => s.loadBox);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    refreshTape();
    if (boardMorning().morning) loadBox(true);
    const id = window.setInterval(() => refreshTape(), 60_000);
    return () => window.clearInterval(id);
  }, [hydrated, refreshTape, loadBox]);

  return null;
}
