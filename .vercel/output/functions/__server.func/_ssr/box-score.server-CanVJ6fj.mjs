import { T as SEASON, v as parseDraftKingsClose, y as parseEspnScoreboard } from "./box-CrH4BFCf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/box-score.server-CanVJ6fj.js
async function getJson(url) {
	const res = await fetch(url, {
		headers: {
			accept: "application/json",
			"user-agent": "SyndicateSports/1.0"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return res.json();
}
async function pool(items, n, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	async function run() {
		while (cursor < items.length) {
			const i = cursor++;
			out[i] = await fn(items[i]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => run()));
	return out;
}
async function pullClose(eventId) {
	const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${eventId}/competitions/${eventId}/odds`;
	try {
		const items = (await getJson(url))?.items ?? [];
		const dk = items.find((i) => i?.provider?.name === "DraftKings" || String(i?.provider?.id) === "100") ?? items[0];
		if (!dk) return {
			quote: null,
			error: `event ${eventId}: no odds`
		};
		let body = dk;
		if (!dk.homeTeamOdds && dk.$ref) body = await getJson(dk.$ref.startsWith("http://") ? `https://${dk.$ref.slice(7)}` : dk.$ref);
		const quote = parseDraftKingsClose(eventId, body);
		return quote ? {
			quote,
			error: null
		} : {
			quote: null,
			error: `event ${eventId}: no DraftKings close`
		};
	} catch (err) {
		return {
			quote: null,
			error: `event ${eventId}: ${err instanceof Error ? err.message : "fetch failed"}`
		};
	}
}
async function pullBoxBoard() {
	const weeks = [
		1,
		2,
		3
	];
	const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
	const settled = await Promise.all(weeks.map(async (week) => {
		const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${week}&dates=${SEASON}`;
		try {
			const data = await getJson(url);
			return {
				week,
				games: parseEspnScoreboard(week, data),
				error: null
			};
		} catch (err) {
			return {
				week,
				games: [],
				error: `week ${week}: ${err instanceof Error ? err.message : "fetch failed"}`
			};
		}
	}));
	const games = settled.flatMap((s) => s.games);
	const closed = await pool(games.filter((g) => g.status === "final" && g.eventId), 6, (g) => pullClose(g.eventId));
	return {
		fetchedAt,
		source: "ESPN scoreboard",
		weeks,
		games,
		errors: settled.flatMap((s) => s.error ? [s.error] : []),
		closes: closed.flatMap((c) => c.quote ? [c.quote] : []),
		closeErrors: closed.flatMap((c) => c.error ? [c.error] : [])
	};
}
//#endregion
export { pullBoxBoard };
