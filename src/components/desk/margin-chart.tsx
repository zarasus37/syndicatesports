import { cn } from "@/lib/utils";

export function MarginChart({
  histogram,
  line,
  home,
}: {
  histogram: { bin: number; p: number }[];
  line: number;
  home: string;
}) {
  const max = Math.max(...histogram.map((h) => h.p), 0.001);
  const coverAt = -line;
  const first = histogram[0]?.bin ?? -40;
  const span = Math.max(1, histogram.length - 1);

  return (
    <div>
      <div className="mb-2 flex items-end justify-between text-xs text-muted-foreground">
        <span className="font-mono">Away win</span>
        <span className="font-mono">{home} margin</span>
      </div>
      <div className="relative h-36">
        <div className="flex h-full items-end gap-px">
          {histogram.map((h) => (
            <div
              key={h.bin}
              className={cn("min-w-0 flex-1 rounded-t-sm", h.bin > coverAt ? "bg-profit/75" : "bg-foreground/18")}
              style={{ height: `${Math.max(4, (h.p / max) * 100)}%` }}
              title={`${h.bin}: ${(h.p * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        <div
          className="pointer-events-none absolute top-0 h-full w-px bg-warn"
          style={{ left: `${((coverAt - first) / span) * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <span>−40</span>
        <span>Vegas {line > 0 ? `+${line}` : line}</span>
        <span>+40</span>
      </div>
    </div>
  );
}
