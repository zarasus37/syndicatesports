import { useEffect } from "react";
import { useDesk } from "@/lib/nfl/store";

export default function DeskRuntime() {
  const hydrate = useDesk((s) => s.hydrate);
  const hydrated = useDesk((s) => s.hydrated);
  const running = useDesk((s) => s.running);
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const run = useDesk((s) => s.run);
  const loadBox = useDesk((s) => s.loadBox);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || lastRunAt || running) return;
    run();
  }, [hydrated, lastRunAt, running, run]);

  useEffect(() => {
    if (!hydrated) return;
    loadBox();
  }, [hydrated, loadBox]);

  return null;
}