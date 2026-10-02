import { TEAMS } from "./teams";
import type { TeamAbbr } from "./types";

export const ESPN_SCOREBOARD = "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

const ESPN_ABBR: Record<string, TeamAbbr> = { WSH: "WAS", JAC: "JAX", LA: "LAR" };

const NAME_TO_ABBR: Record<string, TeamAbbr> = {};
for (const t of Object.values(TEAMS)) {
  NAME_TO_ABBR[`${t.city} ${t.name}`.toLowerCase()] = t.abbr;
}
NAME_TO_ABBR["washington football team"] = "WAS";
NAME_TO_ABBR["washington commanders"] = "WAS";

export function espnAbbr(raw: string): TeamAbbr | null {
  const u = raw.trim().toUpperCase();
  if (u in TEAMS) return u as TeamAbbr;
  return ESPN_ABBR[u] ?? null;
}

export function abbrOf(name: string): TeamAbbr | null {
  const key = name.trim().toLowerCase().replace(/\./g, "");
  if (NAME_TO_ABBR[key]) return NAME_TO_ABBR[key];
  const nick = key.split(/\s+/).pop() ?? "";
  const hits = Object.values(TEAMS).filter((t) => t.name.toLowerCase() === nick);
  return hits.length === 1 ? hits[0].abbr : null;
}

export function gameId(away: string, home: string) {
  return `${away.toLowerCase()}-${home.toLowerCase()}`;
}

export function american(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const n = Number(raw.replace(/[^\d.+-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function getJson(url: string) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; SyndicateSports/1.0)",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
