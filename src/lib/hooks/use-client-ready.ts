import { useEffect, useState } from "react";
import { useDesk } from "@/lib/nfl/store";

/** Avoid painting IDLE from SSR before the shared run hydrates. */
export function useClientReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const desk = useDesk.getState();
    desk.hydrate();
    if (!useDesk.getState().lastRunAt && !useDesk.getState().running) {
      useDesk.getState().run();
    }
    setReady(true);
  }, []);
  return ready;
}
