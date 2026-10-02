import { Switch } from "@/components/ui/switch";
import { swingsFor } from "@/lib/nfl/outs";
import { useDesk } from "@/lib/nfl/store";
import { cn } from "@/lib/utils";

export function OutsPanel({ gameId }: { gameId: string }) {
  const outs = useDesk((s) => s.outs) ?? [];
  const toggleOut = useDesk((s) => s.toggleOut);
  const players = swingsFor(gameId);
  if (!players.length) {
    return <p className="text-sm text-muted-foreground">No swing players tagged on this game.</p>;
  }
  return (
    <ul className="space-y-3">
      {players.map((p) => {
        const on = outs.includes(p.id);
        return (
          <li key={p.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("text-sm font-medium", on && "text-loss")}>
                {p.name}{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  {p.pos} · {p.team}
                </span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.note}</p>
            </div>
            <label className="flex min-h-11 shrink-0 items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              Out
              <Switch checked={on} onCheckedChange={() => toggleOut(p.id)} />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
