import { sharpTone } from "@/lib/nfl/sharp";
import { team } from "@/lib/nfl/teams";
import type { SharpRead } from "@/lib/nfl/types";
import { Badge } from "@/components/ui/badge";
import { cn, formatSigned } from "@/lib/utils";

export function SharpPanel({ sharp }: { sharp: SharpRead }) {
  const lean = sharp.lean ? team(sharp.lean) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Sharp money</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sharp.grade === "none"
              ? "No stacked sharp tells on this number."
              : lean
                ? `${sharp.grade === "heavy" ? "Heavy" : sharp.grade === "sharp" ? "Sharp" : "Watch"} lean ${lean.abbr}. Follow at the open is ${formatSigned(sharp.clvIfFollowed)} CLV.`
                : "Tape is active without a clean lean."}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular-nums leading-none">{sharp.score}</div>
          <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">score</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={sharpTone(sharp.grade)}>{sharp.grade}</Badge>
        {lean ? <Badge variant="outline">lean {lean.abbr}</Badge> : null}
        {sharp.handleLed ? <Badge variant="warn">handle-led</Badge> : null}
      </div>
      {sharp.fired.length === 0 ? (
        <p className="text-sm text-muted-foreground">Public, handle, and the number are aligned.</p>
      ) : (
        <ul className="divide-y divide-border">
          {sharp.fired.map((t) => (
            <li key={t.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm">{t.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.note}</p>
              </div>
              <span className={cn("shrink-0 font-mono text-xs tabular-nums text-muted-foreground")}>+{t.pts}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
