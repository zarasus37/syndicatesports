import { MEAN_SHIFT_FACTOR } from "@/lib/nfl/config";
import { MARKET_AS_OF, MODEL_VERSION, ODDS_SOURCE } from "@/lib/nfl/desk-meta";
import { conditionAdjustments } from "@/lib/nfl/conditions";
import { team } from "@/lib/nfl/teams";
import type { GameSimResult, NflGame } from "@/lib/nfl/types";
import { formatSigned } from "@/lib/utils";

export function WhyLedger({ game, result }: { game: NflGame; result?: GameSimResult }) {
  const cond = conditionAdjustments(game);
  const home = team(game.home);
  const away = team(game.away);
  const residual = (home.ratingZ - away.ratingZ) * MEAN_SHIFT_FACTOR;
  const rows = [
    {
      component: "Market number",
      effect: `${formatSigned(-game.line.spread)} / ${game.line.total}`,
      confidence: "Given",
      evidence: ODDS_SOURCE,
    },
    {
      component: "Rating residual",
      effect: `${formatSigned(residual)} pts vs the number`,
      confidence: "Low",
      evidence: `Shrunk ${MEAN_SHIFT_FACTOR}× toward the market. Model ${MODEL_VERSION}.`,
    },
    {
      component: "Weather / slot",
      effect: `H ${formatSigned(cond.homePts)} · A ${formatSigned(cond.awayPts)}`,
      confidence: cond.notes.length ? "Medium" : "—",
      evidence: cond.notes[0] ?? "No weather/slot stress.",
    },
    {
      component: "Tape",
      effect: result ? `${formatSigned(result.steamPts)} from open` : "—",
      confidence: result && Math.abs(result.steamPts) >= 1.5 ? "Medium" : "Low",
      evidence: result ? `${result.steam} · CLV vs open ${formatSigned(result.clvPts)}` : "No run yet.",
    },
    {
      component: "Final lean",
      effect: result ? `cover ${formatSigned(result.homeCover * 100, 0)}% home · EV ${formatSigned(result.pick.ev * 100)}%` : "—",
      confidence: "—",
      evidence: ODDS_SOURCE.startsWith("Posted")
        ? "Posted board at fetch. Not a closing line."
        : `Sheet as of ${MARKET_AS_OF.slice(0, 10)}. Seeded sheet, not a live feed.`,
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Why this number</h2>
      <p className="mt-1 text-sm text-muted-foreground">Factor board. Not a ticket unless EV clears the juice.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">Component</th>
              <th className="px-2 py-2 font-medium">Effect</th>
              <th className="px-2 py-2 font-medium">Conf.</th>
              <th className="px-2 py-2 font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.component} className="border-b border-border last:border-0">
                <td className="px-2 py-2">{r.component}</td>
                <td className="px-2 py-2 font-mono text-xs tabular-nums">{r.effect}</td>
                <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{r.confidence}</td>
                <td className="px-2 py-2 text-muted-foreground">{r.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
