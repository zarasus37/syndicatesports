import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadAgeOk, saveAgeOk } from "@/lib/nfl/age";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!loadAgeOk());
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Age gate</p>
        <h2 className="mt-2 text-xl font-medium tracking-tight">21+ research desk.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          SyndicateSports publishes a paper betting card. We do not place wagers. Confirm you are 21 or older
          to enter. If gambling is a problem, call 1-800-GAMBLER.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="min-h-11"
            onClick={() => {
              saveAgeOk();
              setOpen(false);
            }}
          >
            I am 21 or older
          </Button>
          <Button asChild variant="ghost" className="min-h-11">
            <a href="https://www.ncpgambling.org/" rel="noreferrer">
              Get help
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
