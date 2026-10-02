import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RunBar } from "@/components/desk/run-bar";
import { StressLab } from "@/components/desk/stress-lab";
import { Badge } from "@/components/ui/badge";
import { AGENT_CATALOG, briefAgent, getAgent, type AgentCatalog } from "@/lib/nfl/agents";
import { pipelineHealth } from "@/lib/nfl/analytics";
import { deskFeeds } from "@/lib/nfl/feeds";
import { ARCHITECTURE } from "@/lib/nfl/modules";
import { activeGames } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import { team } from "@/lib/nfl/teams";
import type { AgentId, GameSimResult } from "@/lib/nfl/types";
import { cn, formatPct } from "@/lib/utils";

export const Route = createFileRoute("/agents")({
  validateSearch: (raw: Record<string, unknown>): { game?: string; agent?: string } => {
    const s: { game?: string; agent?: string } = {};
    if (typeof raw.game === "string" && raw.game) s.game = raw.game;
    if (typeof raw.agent === "string" && raw.agent) s.agent = raw.agent;
    return s;
  },
  component: AgentsPage,
});

function isAgentId(v: string | undefined): v is AgentId {
  return Boolean(v && AGENT_CATALOG.some((a) => a.id === v));
}

function AgentsPage() {
  const search = Route.useSearch();
  const results = useDesk((s) => s.results) ?? {};
  const agents = useDesk((s) => s.agents) ?? [];
  const lastRunAt = useDesk((s) => s.lastRunAt);
  const runId = useDesk((s) => s.runId);
  const lastRunMs = useDesk((s) => s.lastRunMs);
  const sims = useDesk((s) => s.sims) ?? 12000;
  const parlays = useDesk((s) => s.parlays) ?? [];
  const props = useDesk((s) => s.props) ?? [];
  const tickets = useDesk((s) => s.tickets) ?? [];
  const bankroll = useDesk((s) => s.bankroll) ?? 10000;
  const slateGames = activeGames();
  const weatherOk = useDesk((s) => s.weatherOk);
  const injuryOk = useDesk((s) => s.injuryOk);
  const ranked = slateGames.map((g) => results[g.id]).filter((r): r is GameSimResult => Boolean(r));
  const flagged = [...ranked]
    .filter((r) => r.anomaly.state !== "normal")
    .sort((a, b) => b.anomaly.score - a.anomaly.score);
  const health = pipelineHealth(ranked, sims, lastRunMs);
  const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
  const oddsFetchedAt = useDesk((s) => s.oddsFetchedAt) ?? null;
  const box = useDesk((s) => s.box);
  const boxAt = box && box.errors.length === 0 && box.games.length ? box.fetchedAt : null;
  const feeds = deskFeeds(lastRunAt, oddsBooks, oddsFetchedAt, boxAt, { weather: weatherOk, injuries: injuryOk });
  const [selected, setSelected] = useState<AgentId>(isAgentId(search.agent) ? search.agent : "montecarlo");
  useEffect(() => {
    if (isAgentId(search.agent)) setSelected(search.agent);
  }, [search.agent]);
  const live = agents.find((x) => x.id === selected);
  const catalog = getAgent(selected);
  const brief = useMemo(
    () =>
      briefAgent(selected, {
        results: ranked,
        parlays,
        props,
        tickets,
        sims,
        lastRunMs,
        lastRunAt,
        bankroll,
      }),
    [selected, ranked, parlays, props, tickets, sims, lastRunMs, lastRunAt, bankroll],
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The rack</p>
        <h1 className="text-3xl font-medium tracking-tight">Agent pipeline</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Nine desks. Spread and total prices on the card come from the books that returned this run
          {oddsBooks.length ? ` (${oddsBooks.join(", ")})` : ""}. Props, injuries, refs, and weather are not live feeds.
          Nothing sends a slip.
          {runId ? ` Current run ${runId}${lastRunAt ? ` · priced ${new Date(lastRunAt).toLocaleTimeString()}` : ""}.` : ""}
        </p>
      </section>

      <RunBar />

      <section className="grid gap-3 lg:grid-cols-[240px_1fr]">
        <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {AGENT_CATALOG.map((a, i) => {
            const status = agents.find((x) => x.id === a.id);
            const on = selected === a.id;
            return (
              <li key={a.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSelected(a.id)}
                  className={cn(
                    "flex min-h-11 w-full min-w-[11rem] items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                    on ? "border-foreground bg-card" : "border-border bg-card/60 hover:border-foreground/40",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium">{a.name}</span>
                  </span>
                  <Badge variant={status?.state === "flag" ? "warn" : status?.state === "idle" ? "outline" : "default"}>
                    {status?.state ?? "idle"}
                  </Badge>
                </button>
              </li>
            );
          })}
        </ol>

        <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{groupLabel(catalog)}</p>
              <h2 className="mt-1 text-xl font-medium tracking-tight">{catalog.name}</h2>
            </div>
            <Badge variant={live?.state === "flag" ? "warn" : "outline"}>{live?.state ?? "idle"}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{catalog.role}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{live?.last ?? "waiting on a run"}</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {brief.facts.map((f) => (
              <div key={f.k} className="rounded-lg border border-border p-3">
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{f.k}</div>
                <div
                  className={cn(
                    "mt-1 font-mono text-lg tabular-nums leading-none",
                    f.tone === "profit" && "text-profit",
                    f.tone === "warn" && "text-warn",
                    f.tone === "loss" && "text-loss",
                  )}
                >
                  {f.v}
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-5 text-sm font-medium">Capabilities</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {catalog.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">{catalog.workflow}</p>

          {brief.items.length ? (
            <>
              <h3 className="mt-5 text-sm font-medium">This cycle</h3>
              <ul className="mt-2 divide-y divide-border">
                {brief.items.map((item) => (
                  <li key={`${item.label}-${item.meta}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <ItemLink href={item.href}>{item.label}</ItemLink>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{item.meta}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : lastRunAt ? (
            <p className="mt-5 text-sm text-muted-foreground">Quiet cycle for this agent.</p>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">Run the slate to populate this agent.</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">{brief.note}</p>
        </article>
      </section>

      <StressLab initialGameId={search.game} />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Ingestion rack</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {feeds.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div>
                <div className="text-sm font-medium">{f.name}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {f.provider} · {f.cadence}
                </div>
              </div>
              <Badge variant={f.ok ? "profit" : "outline"}>{f.ok ? "live" : "idle"}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Monitoring</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Kpi k="Latency" v={lastRunAt ? `${health.latencyMs} ms` : "—"} h="last slate" />
          <Kpi k="Error rate" v="0.0%" h="ingest + sim" />
          <Kpi k="Drift |z|" v={lastRunAt ? health.drift.toFixed(2) : "—"} h="mean residual" />
          <Kpi k="Cadence" v={`${health.cadenceMin}m`} h="snapshot window" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Anomaly board</h2>
        {!lastRunAt ? (
          <p className="text-sm text-muted-foreground">Scores populate after a run.</p>
        ) : flagged.length === 0 ? (
          <p className="text-sm text-muted-foreground">No info-or-higher flags this cycle.</p>
        ) : (
          <ul className="space-y-2">
            {flagged.map((r) => {
              const g = slateGames.find((x) => x.id === r.gameId);
              if (!g) return null;
              return (
                <li key={r.gameId}>
                  <Link
                    to="/game/$gameId"
                    params={{ gameId: r.gameId }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="text-sm">
                      {team(g.away).abbr} @ {team(g.home).abbr}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      {r.steam !== "stable" ? (
                        <Badge variant={r.steam === "rlm" ? "loss" : "warn"}>{r.steam}</Badge>
                      ) : null}
                      <Badge variant={r.anomaly.state === "critical" ? "loss" : "warn"}>{r.anomaly.state}</Badge>
                      {r.anomaly.score.toFixed(0)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Architecture</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Module</th>
                <th className="px-4 py-3 font-medium">Function</th>
                <th className="px-4 py-3 font-medium">Current status</th>
              </tr>
            </thead>
            <tbody>
              {ARCHITECTURE.map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-4 py-3 align-top font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.fn}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Compliance</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>21+ only. Paper tickets never transmit to a sportsbook.</li>
          <li>KYC / AML is a policy placeholder — no identity workflow is active.</li>
          <li>Regional controls are planned flags. Default is research-only.</li>
          <li>Stake cap {formatPct(0.03)} of bankroll per flagged game. Half-Kelly thereafter.</li>
          <li>If gambling is a problem, call 1-800-GAMBLER.</li>
        </ul>
      </section>
    </div>
  );
}

function ItemLink({ href, children }: { href?: string; children: ReactNode }) {
  const className = "min-w-0 truncate hover:underline";
  if (!href) return <span className="min-w-0 truncate">{children}</span>;
  if (href.startsWith("/game/")) {
    return (
      <Link to="/game/$gameId" params={{ gameId: href.slice("/game/".length) }} className={className}>
        {children}
      </Link>
    );
  }
  if (href === "/parlay") return <Link to="/parlay" className={className}>{children}</Link>;
  if (href === "/book") return <Link to="/book" className={className}>{children}</Link>;
  if (href === "/learn") return <Link to="/learn" className={className}>{children}</Link>;
  if (href === "/record") return <Link to="/record" className={className}>{children}</Link>;
  if (href === "/props") return <Link to="/props" className={className}>{children}</Link>;
  return <span className="min-w-0 truncate">{children}</span>;
}

function groupLabel(a: AgentCatalog): string {
  if (a.group === "feeds") return "Feeds";
  if (a.group === "price") return "Pricing";
  if (a.group === "book") return "Book";
  return "Guard";
}

function Kpi({ k, v, h }: { k: string; v: string; h: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-2 font-mono text-xl tabular-nums leading-none">{v}</div>
      <div className="mt-2 text-xs text-muted-foreground">{h}</div>
    </div>
  );
}
