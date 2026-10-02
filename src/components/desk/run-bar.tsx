import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_SIMS, MAX_SIMS } from "@/lib/nfl/config";
import { useDesk } from "@/lib/nfl/store";

export function RunBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sims = useDesk((s) => s.sims) ?? DEFAULT_SIMS;
  const running = useDesk((s) => s.running);
  const bankroll = useDesk((s) => s.bankroll) ?? 10000;
  const setSims = useDesk((s) => s.setSims);
  const setBankroll = useDesk((s) => s.setBankroll);
  const run = useDesk((s) => s.run);
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const runPhase = useDesk((s) => s.runPhase) ?? "idle";

  if (!mounted) {
    return (
      <div className="flex min-h-[4.5rem] items-center rounded-xl border border-border bg-card px-4">
        <span className="font-mono text-xs text-muted-foreground">Desk controls</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Paths</span>
          <select
            className="h-10 min-h-10 rounded-md border border-border bg-background px-2 font-mono text-sm"
            value={sims}
            onChange={(e) => setSims(Number(e.target.value))}
          >
            <option value={DEFAULT_SIMS}>{DEFAULT_SIMS.toLocaleString()}</option>
            <option value={25000}>25,000</option>
            <option value={50000}>50,000</option>
            <option value={MAX_SIMS}>{MAX_SIMS.toLocaleString()}</option>
          </select>
        </label>
        <label className="flex h-10 min-h-10 items-center gap-2 text-sm">
          <span className="text-muted-foreground">Bankroll</span>
          <Input
            type="number"
            min={100}
            step={100}
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value) || 0)}
            className="h-10 w-28"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        {lastRunAt && lastRunAt > 1_000_000_000_000 ? (
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {runPhase} · {new Date(lastRunAt).toLocaleTimeString()}
          </span>
        ) : (
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{runPhase}</span>
        )}
        <Button onClick={() => run()} disabled={running} className="min-h-11 w-full sm:w-auto">
          {running ? "Simulating…" : "Run slate"}
        </Button>
      </div>
    </div>
  );
}
