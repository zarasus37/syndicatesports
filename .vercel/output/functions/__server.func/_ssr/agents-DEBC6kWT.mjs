import { i as __toESM } from "../_runtime.mjs";
import { E as SLATE } from "./box-CrH4BFCf.mjs";
import { n as team } from "./teams-BfaPpyvO.mjs";
import { F as getAgent, J as pipelineHealth, P as getActiveOuts, gt as formatPct, ht as cn, it as swingsFor, lt as useDesk, t as AGENT_CATALOG, tt as simulateGame, vt as formatSigned, w as briefAgent } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button, r as Route$10 } from "./router-Dwgvlcnc.mjs";
import { n as matchup } from "./labels-ClDqe_lb.mjs";
import { t as RunBar } from "./run-bar-BxjMaxVr.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-DEBC6kWT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SHOCKS = [
	{
		id: "steam_dog",
		label: "Steam to dog",
		blurb: "Number moves 1.5 toward the underdog. Tests RLM and mean-shift."
	},
	{
		id: "steam_fav",
		label: "Steam to favorite",
		blurb: "Number moves 1.5 toward the favorite. Tests public pile-on."
	},
	{
		id: "public_surge",
		label: "Public surge",
		blurb: "Tickets on the public side jump to 82%. Handle stays put."
	},
	{
		id: "key_out",
		label: "Starter out",
		blurb: "Toggle the tagged swing player (QB / WR1 / edge) for this game."
	},
	{
		id: "wind",
		label: "Wind +10",
		blurb: "Force an open roof and +10 mph. Totals and sacks reprice."
	}
];
function cloneGame(g) {
	return {
		...g,
		line: { ...g.line },
		public: { ...g.public },
		weather: { ...g.weather },
		notes: [...g.notes]
	};
}
function towardDog(spread, pts) {
	if (spread < 0) return spread + pts;
	if (spread > 0) return spread - pts;
	return pts;
}
function towardFav(spread, pts) {
	if (spread < 0) return spread - pts;
	if (spread > 0) return spread + pts;
	return -pts;
}
function applyShock(game, kind) {
	const g = cloneGame(game);
	if (kind === "steam_dog") {
		g.line.spreadOpen = game.line.spread;
		g.line.spread = towardDog(game.line.spread, 1.5);
		return {
			game: g,
			note: `Spread ${game.line.spread} → ${g.line.spread} (dog).`
		};
	}
	if (kind === "steam_fav") {
		g.line.spreadOpen = game.line.spread;
		g.line.spread = towardFav(game.line.spread, 1.5);
		return {
			game: g,
			note: `Spread ${game.line.spread} → ${g.line.spread} (favorite).`
		};
	}
	if (kind === "public_surge") {
		const homePublic = g.public.ticketsHome >= 50;
		g.public.ticketsHome = homePublic ? 82 : 18;
		return {
			game: g,
			note: `Tickets on the public side to 82%. Handle unchanged.`
		};
	}
	if (kind === "wind") {
		g.weather = {
			...g.weather,
			roof: g.weather.roof === "dome" ? "open" : g.weather.roof,
			windMph: (g.weather.windMph ?? 6) + 10,
			note: "Stress wind"
		};
		g.line.total = Math.max(32, g.line.total - 1.5);
		return {
			game: g,
			note: `Wind ${(game.weather.windMph ?? 6) + 10} mph. Total ${game.line.total} → ${g.line.total}.`
		};
	}
	const swing = swingsFor(game.id)[0];
	if (!swing) return {
		game: g,
		note: "No tagged swing player on this game."
	};
	return {
		game: g,
		outIds: [...getActiveOuts(), swing.id],
		note: `${swing.name} (${swing.pos}) marked out.`
	};
}
function side(r) {
	return {
		pick: r.pick.side,
		ev: r.pick.ev,
		cover: r.homeCover,
		win: r.homeWin,
		total: r.meanTotal,
		steam: r.steam,
		anomaly: `${r.anomaly.state} ${r.anomaly.score.toFixed(0)}`
	};
}
function stressGame(game, kind, sims, seed, chaos) {
	const n = Math.max(4e3, Math.min(sims, 12e3));
	const shocked = applyShock(game, kind);
	const before = simulateGame(game, n, seed, chaos);
	const after = simulateGame(shocked.game, n, seed + 17, chaos, { outIds: shocked.outIds });
	return {
		kind,
		gameId: game.id,
		matchup: matchup(game),
		note: shocked.note,
		before: side(before),
		after: side(after),
		deltaEv: after.pick.ev - before.pick.ev,
		deltaCover: after.homeCover - before.homeCover,
		deltaWin: after.homeWin - before.homeWin,
		pickChanged: after.pick.side !== before.pick.side,
		sims: n
	};
}
function StressLab({ initialGameId }) {
	const featured = SLATE.find((g) => g.id === initialGameId) ?? SLATE.find((g) => g.featured) ?? SLATE[0];
	const [gameId, setGameId] = (0, import_react.useState)(featured.id);
	const [kind, setKind] = (0, import_react.useState)("steam_dog");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [left, setLeft] = (0, import_react.useState)(null);
	const [right, setRight] = (0, import_react.useState)(null);
	const [slot, setSlot] = (0, import_react.useState)("left");
	(0, import_react.useEffect)(() => {
		if (initialGameId && SLATE.some((g) => g.id === initialGameId)) {
			setGameId(initialGameId);
			setLeft(null);
			setRight(null);
		}
	}, [initialGameId]);
	const sims = useDesk((s) => s.sims) ?? 12e3;
	const chaos = useDesk((s) => s.chaos) ?? true;
	const seed = useDesk((s) => s.seed) ?? 20260921;
	const game = (0, import_react.useMemo)(() => SLATE.find((g) => g.id === gameId) ?? featured, [gameId, featured]);
	function run(target) {
		setBusy(true);
		setSlot(target);
		window.setTimeout(() => {
			const next = stressGame(game, kind, sims, seed, chaos);
			if (target === "left") setLeft(next);
			else setRight(next);
			setBusy(false);
		}, 30);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4 rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Scenario lab"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Shock a clone. Pin two scenarios side by side. The live card does not move."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 flex-1 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-muted-foreground",
							children: "Game"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-11 min-h-11 w-full rounded-md border border-border bg-background px-2 font-mono text-sm",
							value: gameId,
							onChange: (e) => {
								setGameId(e.target.value);
								setLeft(null);
								setRight(null);
							},
							children: SLATE.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: g.id,
								children: [
									team(g.away).abbr,
									" @ ",
									team(g.home).abbr
								]
							}, g.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => run("left"),
						disabled: busy,
						className: "min-h-11 sm:w-auto",
						children: busy && slot === "left" ? "Pricing A…" : "Run as A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => run("right"),
						disabled: busy,
						variant: "secondary",
						className: "min-h-11 sm:w-auto",
						children: busy && slot === "right" ? "Pricing B…" : "Run as B"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: SHOCKS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setKind(s.id),
					className: cn("min-h-11 rounded-md px-3 text-left text-sm transition-colors", kind === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"),
					children: s.label
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: SHOCKS.find((s) => s.id === kind)?.blurb
			}),
			left || right ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: [left ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShockCard, {
							title: `A · ${left.note}`,
							side: left.after,
							highlight: left.pickChanged
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground",
							children: "Scenario A empty."
						}), right ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShockCard, {
							title: `B · ${right.note}`,
							side: right.after,
							highlight: right.pickChanged
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground",
							children: "Scenario B empty."
						})]
					}),
					left && right ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "EV A−B",
								v: formatSigned((left.after.ev - right.after.ev) * 100) + " pts",
								up: left.after.ev > right.after.ev
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "Cover A−B",
								v: formatSigned((left.after.cover - right.after.cover) * 100) + " pp",
								up: left.after.cover > right.after.cover
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "Win A−B",
								v: formatSigned((left.after.win - right.after.win) * 100) + " pp",
								up: left.after.win > right.after.win
							})
						]
					}) : left ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "EV",
								v: formatSigned(left.deltaEv * 100) + " pts",
								up: left.deltaEv > 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "Home cover",
								v: formatSigned(left.deltaCover * 100) + " pp",
								up: left.deltaCover > 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delta, {
								k: "Home win",
								v: formatSigned(left.deltaWin * 100) + " pp",
								up: left.deltaWin > 0
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/game/$gameId",
						params: { gameId: game.id },
						className: "inline-flex min-h-11 items-center text-sm underline",
						children: [
							"Open ",
							team(game.away).abbr,
							" @ ",
							team(game.home).abbr
						]
					})
				]
			}) : null
		]
	});
}
function ShockCard({ title, side, highlight }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border border-border p-3", highlight && "border-warn/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-sm font-medium",
				children: side.pick
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-2 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["EV ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-foreground",
						children: [formatSigned(side.ev * 100), "%"]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["cover ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: formatPct(side.cover)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["win ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: formatPct(side.win)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["total ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: side.total.toFixed(1)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-2",
						children: [
							side.steam,
							" · ",
							side.anomaly
						]
					})
				]
			})
		]
	});
}
function Delta({ k, v, up }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted-foreground",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("mt-1 tabular-nums", up ? "text-profit" : "text-loss"),
			children: v
		})]
	});
}
function deskFeeds(lastRunAt, liveBooks = [], fetchedAt = null, boxAt = null) {
	const stamp = fetchedAt ?? (lastRunAt ? "synced this cycle" : "waiting on run");
	const book = (name) => ({
		id: name.toLowerCase(),
		name,
		provider: "public board",
		cadence: "on run",
		ok: liveBooks.includes(name),
		last: liveBooks.includes(name) ? stamp : "no quote this run"
	});
	const dark = (id, name, provider) => ({
		id,
		name,
		provider,
		cadence: "not connected",
		ok: false,
		last: "not a live feed"
	});
	return [
		book("Pinnacle"),
		book("FanDuel"),
		book("Bovada"),
		book("DraftKings"),
		{
			id: "box",
			name: "Box score",
			provider: "ESPN scoreboard",
			cadence: "on session",
			ok: Boolean(boxAt),
			last: boxAt ?? "not returned"
		},
		dark("epa", "Weekly EPA", "nfl_data_py"),
		dark("splits", "Tickets / handle", "splits_api"),
		dark("injuries", "Injury / outs", "injury_feed"),
		dark("refs", "Referee crews", "refs_feed"),
		dark("weather", "Venue / wind", "weather_api"),
		dark("props", "Player props", "not a live book")
	];
}
var ARCHITECTURE = [
	{
		id: "ingestion",
		name: "Data Ingestion Engine",
		fn: "Retrieval, parsing, and validation of sports data",
		status: "Prototype interface · generated inputs"
	},
	{
		id: "montecarlo",
		name: "Simulation Engine",
		fn: "Monte Carlo paths to price cover, totals, and props",
		status: "Local sandbox run"
	},
	{
		id: "analytics",
		name: "Analytics Module",
		fn: "ROI, ruin, calibration, and value metrics on the paper book",
		status: "On-desk · paper only"
	},
	{
		id: "framework",
		name: "AI Agent Framework",
		fn: "Orchestrates ingest → sim → EV → parlay on a clone of the sheet",
		status: "UI pipeline · not a live service"
	},
	{
		id: "odds",
		name: "Odds / Spread Management",
		fn: "Line tape, steam, RLM, point-buy table",
		status: "Not connected to a book"
	},
	{
		id: "ev",
		name: "+EV Detection Module",
		fn: "Post-vig hurdle, unit size, card cap",
		status: "Active on the seeded sheet"
	},
	{
		id: "parlay",
		name: "Parlay Optimizer",
		fn: "3-leg construction with a correlation haircut",
		status: "Sandbox · same-game banned unless SGP"
	},
	{
		id: "compliance",
		name: "Compliance & Security",
		fn: "21+, responsible gambling, regional research-only default",
		status: "Policy copy · no KYC/AML workflow"
	},
	{
		id: "monitor",
		name: "Monitoring & Logging",
		fn: "Run journal, snapshots, drift board",
		status: "Session journal · simulated health"
	}
];
function isAgentId(v) {
	return Boolean(v && AGENT_CATALOG.some((a) => a.id === v));
}
function AgentsPage() {
	const search = Route$10.useSearch();
	const results = useDesk((s) => s.results) ?? {};
	const agents = useDesk((s) => s.agents) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const runId = useDesk((s) => s.runId);
	const lastRunMs = useDesk((s) => s.lastRunMs);
	const sims = useDesk((s) => s.sims) ?? 12e3;
	const parlays = useDesk((s) => s.parlays) ?? [];
	const props = useDesk((s) => s.props) ?? [];
	const tickets = useDesk((s) => s.tickets) ?? [];
	const bankroll = useDesk((s) => s.bankroll) ?? 1e4;
	const ranked = SLATE.map((g) => results[g.id]).filter((r) => Boolean(r));
	const flagged = [...ranked].filter((r) => r.anomaly.state !== "normal").sort((a, b) => b.anomaly.score - a.anomaly.score);
	const health = pipelineHealth(ranked, sims, lastRunMs);
	const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
	const oddsFetchedAt = useDesk((s) => s.oddsFetchedAt) ?? null;
	const box = useDesk((s) => s.box);
	const feeds = deskFeeds(lastRunAt, oddsBooks, oddsFetchedAt, box && box.errors.length === 0 && box.games.length ? box.fetchedAt : null);
	const [selected, setSelected] = (0, import_react.useState)(isAgentId(search.agent) ? search.agent : "montecarlo");
	(0, import_react.useEffect)(() => {
		if (isAgentId(search.agent)) setSelected(search.agent);
	}, [search.agent]);
	const live = agents.find((x) => x.id === selected);
	const catalog = getAgent(selected);
	const brief = (0, import_react.useMemo)(() => briefAgent(selected, {
		results: ranked,
		parlays,
		props,
		tickets,
		sims,
		lastRunMs,
		lastRunAt,
		bankroll
	}), [
		selected,
		ranked,
		parlays,
		props,
		tickets,
		sims,
		lastRunMs,
		lastRunAt,
		bankroll
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "The rack"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Agent pipeline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Nine desks. Spread and total prices on the card come from the books that returned this run",
							oddsBooks.length ? ` (${oddsBooks.join(", ")})` : "",
							". Props, injuries, refs, and weather are not live feeds. Nothing sends a slip.",
							runId ? ` Current run ${runId}${lastRunAt ? ` · priced ${new Date(lastRunAt).toLocaleTimeString()}` : ""}.` : ""
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RunBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 lg:grid-cols-[240px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible",
					children: AGENT_CATALOG.map((a, i) => {
						const status = agents.find((x) => x.id === a.id);
						const on = selected === a.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(a.id),
								className: cn("flex min-h-11 w-full min-w-[11rem] items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors", on ? "border-foreground bg-card" : "border-border bg-card/60 hover:border-foreground/40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs text-muted-foreground",
										children: String(i + 1).padStart(2, "0")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: a.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: status?.state === "flag" ? "warn" : status?.state === "idle" ? "outline" : "default",
									children: status?.state ?? "idle"
								})]
							})
						}, a.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border bg-card p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: groupLabel(catalog)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-xl font-medium tracking-tight",
								children: catalog.name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: live?.state === "flag" ? "warn" : "outline",
								children: live?.state ?? "idle"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground",
							children: catalog.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-xs text-muted-foreground",
							children: live?.last ?? "waiting on a run"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
							children: brief.facts.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
									children: f.k
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("mt-1 font-mono text-lg tabular-nums leading-none", f.tone === "profit" && "text-profit", f.tone === "warn" && "text-warn", f.tone === "loss" && "text-loss"),
									children: f.v
								})]
							}, f.k))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-sm font-medium",
							children: "Capabilities"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1.5 text-sm text-muted-foreground",
							children: catalog.capabilities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: c }, c))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: catalog.workflow
						}),
						brief.items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-sm font-medium",
							children: "This cycle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 divide-y divide-border",
							children: brief.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-2.5 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemLink, {
									href: item.href,
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-mono text-xs text-muted-foreground",
									children: item.meta
								})]
							}, `${item.label}-${item.meta}`))
						})] }) : lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-sm text-muted-foreground",
							children: "Quiet cycle for this agent."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-sm text-muted-foreground",
							children: "Run the slate to populate this agent."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: brief.note
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StressLab, { initialGameId: search.game }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Ingestion rack"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2 sm:grid-cols-3",
					children: feeds.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: f.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-mono text-xs text-muted-foreground",
							children: [
								f.provider,
								" · ",
								f.cadence
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: f.ok ? "profit" : "outline",
							children: f.ok ? "live" : "idle"
						})]
					}, f.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Monitoring"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							k: "Latency",
							v: lastRunAt ? `${health.latencyMs} ms` : "—",
							h: "last slate"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							k: "Error rate",
							v: "0.0%",
							h: "ingest + sim"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							k: "Drift |z|",
							v: lastRunAt ? health.drift.toFixed(2) : "—",
							h: "mean residual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							k: "Cadence",
							v: `${health.cadenceMin}m`,
							h: "snapshot window"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Anomaly board"
				}), !lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Scores populate after a run."
				}) : flagged.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No info-or-higher flags this cycle."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: flagged.map((r) => {
						const g = SLATE.find((x) => x.id === r.gameId);
						if (!g) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/game/$gameId",
							params: { gameId: r.gameId },
							className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm",
								children: [
									team(g.away).abbr,
									" @ ",
									team(g.home).abbr
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 font-mono text-xs",
								children: [
									r.steam !== "stable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: r.steam === "rlm" ? "loss" : "warn",
										children: r.steam
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: r.anomaly.state === "critical" ? "loss" : "warn",
										children: r.anomaly.state
									}),
									r.anomaly.score.toFixed(0)
								]
							})]
						}) }, r.gameId);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Architecture"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Module"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Function"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-medium",
									children: "Current status"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ARCHITECTURE.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 align-top font-medium",
									children: m.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-muted-foreground",
									children: m.fn
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono text-xs text-muted-foreground",
									children: m.status
								})
							]
						}, m.id)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Compliance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "21+ only. Paper tickets never transmit to a sportsbook." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "KYC / AML is a policy placeholder — no identity workflow is active." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Regional controls are planned flags. Default is research-only." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Stake cap ",
							formatPct(.03),
							" of bankroll per flagged game. Half-Kelly thereafter."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "If gambling is a problem, call 1-800-GAMBLER." })
					]
				})]
			})
		]
	});
}
function ItemLink({ href, children }) {
	const className = "min-w-0 truncate hover:underline";
	if (!href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "min-w-0 truncate",
		children
	});
	if (href.startsWith("/game/")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/game/$gameId",
		params: { gameId: href.slice(6) },
		className,
		children
	});
	if (href === "/parlay") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/parlay",
		className,
		children
	});
	if (href === "/book") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/book",
		className,
		children
	});
	if (href === "/learn") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/learn",
		className,
		children
	});
	if (href === "/record") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/record",
		className,
		children
	});
	if (href === "/props") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/props",
		className,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "min-w-0 truncate",
		children
	});
}
function groupLabel(a) {
	if (a.group === "feeds") return "Feeds";
	if (a.group === "price") return "Pricing";
	if (a.group === "book") return "Book";
	return "Guard";
}
function Kpi({ k, v, h }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-mono text-xl tabular-nums leading-none",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs text-muted-foreground",
				children: h
			})
		]
	});
}
//#endregion
export { AgentsPage as component };
