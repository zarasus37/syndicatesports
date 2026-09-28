import { i as __toESM } from "../_runtime.mjs";
import { E as SLATE, O as getGame } from "./box-CrH4BFCf.mjs";
import { n as team } from "./teams-BfaPpyvO.mjs";
import { B as isSharpFlag, C as bestTake, I as isAnomalyFlag, L as isPrime, M as flagTone, N as gameSlot, Q as refTone, R as isPublicFlag, V as isTapeFlag, Z as publicRead, _t as formatScore, et as sharpTone, f as MIN_EV, gt as formatPct, ht as cn, k as diffSnapshots, lt as useDesk, mt as americanOdds, vt as formatSigned, x as analyzeRef, z as isRefFlag } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { r as pickLabel } from "./labels-ClDqe_lb.mjs";
import { t as RunBar } from "./run-bar-BxjMaxVr.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { t as LineTape } from "./line-tape-BR1-CK5C.mjs";
import { t as TicketCard } from "./ticket-card-6Sk6S0Lc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/slate-C4WfbDV0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GameRow({ result, rank, onCard }) {
	const game = getGame(result.gameId);
	if (!game) return null;
	const away = team(game.away);
	const home = team(game.home);
	result.pick.ev;
	const bet = bestTake(result);
	const plus = onCard ?? Boolean(bet);
	const den = game.home === "DEN" || game.away === "DEN";
	const pub = publicRead(game);
	const sharp = result.sharp;
	const slot = gameSlot(game);
	const wind = game.weather.roof !== "dome" && (game.weather.windMph ?? 0) >= 12;
	const heat = game.weather.roof !== "dome" && (game.weather.tempF ?? 0) >= 86;
	const ref = analyzeRef(game);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/game/$gameId",
		params: { gameId: game.id },
		className: "group block rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-border)] transition-[transform,background-color] duration-150 hover:bg-background-elevated sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-5 pt-0.5 font-mono text-xs text-muted-foreground tabular-nums",
					children: String(rank).padStart(2, "0")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2 text-sm font-medium",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
											className: "size-1.5 rounded-full",
											style: { background: away.color }
										}),
										away.abbr,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "@"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
											className: "size-1.5 rounded-full",
											style: { background: home.color }
										}),
										home.abbr
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted-foreground",
									children: game.kickoffLabel
								}),
								result.steam !== "stable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: result.steam === "rlm" ? "loss" : "warn",
									children: [
										result.steam,
										" ",
										formatSigned(result.steamPts)
									]
								}) : null,
								sharp && sharp.grade !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: sharpTone(sharp.grade),
									children: [sharp.grade, sharp.lean ? ` ${sharp.lean}` : ""]
								}) : result.anomaly.state !== "normal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: flagTone(result.anomaly.state),
									children: result.anomaly.state
								}) : null,
								den ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "chaos"
								}) : null,
								isPrime(slot) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: slot.toUpperCase()
								}) : null,
								slot === "intl" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "intl"
								}) : null,
								wind ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: ["wind ", game.weather.windMph]
								}) : null,
								heat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: [game.weather.tempF, "°"]
								}) : null,
								isRefFlag(ref) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: refTone(ref.grade),
									children: ref.totalLean !== "even" ? ref.totalLean : ref.grade
								}) : null,
								pub.contrarian && sharp?.grade === "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "warn",
									children: "split"
								}) : null,
								result.keyCall && result.keyCall.action !== "hold" && result.keyCall.worth ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "warn",
									children: [
										result.keyCall.action,
										" ",
										result.keyCall.to
									]
								}) : null,
								result.outsApplied?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "loss",
									children: [result.outsApplied.length, " out"]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: bet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Card "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: pickLabel(game, bet)
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Pass · lean "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pickLabel(game, result.pick) })] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("font-mono text-sm tabular-nums", plus ? "text-profit" : "text-muted-foreground"),
									children: [
										"EV ",
										formatSigned((bet ?? result.pick).ev * 100),
										"%"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-sm tabular-nums text-muted-foreground",
									children: [
										formatPct(result.pick.prob),
										plus ? ` · K ${formatPct(result.pick.kelly)}` : " · no size",
										Math.abs(result.clvPts) >= .5 ? ` · CLV open ${formatSigned(result.clvPts)}` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs tabular-nums text-muted-foreground",
									children: [
										"tix ",
										pub.publicPct,
										"% ",
										pub.publicTeam,
										pub.contrarian ? ` · $ ${pub.sharpLean === "home" ? home.abbr : away.abbr}` : ""
									]
								})
							]
						}),
						game.line.books?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground",
							children: [
								"Ref ",
								game.line.priceBook,
								" ",
								home.abbr,
								" ",
								formatSigned(game.line.spread),
								" ",
								americanOdds(game.line.spreadPrice),
								" · o/u ",
								game.line.total,
								" · ",
								game.line.books.map((b) => `${b.book === "Pinnacle" ? "PIN" : b.book === "FanDuel" ? "FD" : b.book === "Bovada" ? "BV" : "DK"} ${formatSigned(b.spread)}`).join(" ")
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-[10px] text-muted-foreground",
							children: "Sheet line · not a live book"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden text-right sm:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-lg tabular-nums leading-none",
						children: sharp && sharp.grade !== "none" ? sharp.score : `${result.confidence.toFixed(1)}/10`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: sharp && sharp.grade !== "none" ? "sharp" : signalLabel(result.confidence)
					})]
				})
			]
		})
	});
}
function signalLabel(score) {
	if (score >= 6) return "signal high";
	if (score >= 3) return "signal med";
	return "signal low";
}
function Home() {
	const results = useDesk((s) => s.results) ?? {};
	const order = useDesk((s) => s.order) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const tickets = useDesk((s) => s.tickets) ?? [];
	const snaps = useDesk((s) => s.snaps) ?? [];
	const plays = useDesk((s) => s.plays) ?? [];
	const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
	const oddsFetchedAt = useDesk((s) => s.oddsFetchedAt);
	const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
	const [filter, setFilter] = (0, import_react.useState)("all");
	const ranked = order.map((id) => results[id]).filter((r) => Boolean(r));
	const cardIds = new Set(plays.map((p) => p.gameId).filter((id) => Boolean(id)));
	const onCard = cardIds;
	const plus = ranked.filter((r) => cardIds.has(r.gameId));
	const steam = ranked.filter(isTapeFlag);
	const flagged = ranked.filter(isAnomalyFlag);
	const publicFades = ranked.filter((r) => {
		const g = getGame(r.gameId);
		return g ? isPublicFlag(g) : false;
	});
	const sharps = ranked.filter((r) => r.sharp && isSharpFlag(r.sharp));
	const topSharps = [...ranked].filter((r) => r.sharp && r.sharp.grade !== "none").sort((a, b) => (b.sharp?.score ?? 0) - (a.sharp?.score ?? 0)).slice(0, 5);
	const top = plays[0];
	const shown = ranked.filter((r) => {
		if (filter === "plus") return onCard.has(r.gameId);
		if (filter === "near") return !onCard.has(r.gameId) && r.pick.ev > 0 && r.pick.ev < .03;
		if (filter === "pass") return !onCard.has(r.gameId);
		if (filter === "totals") return r.pick.market === "total";
		if (filter === "prime" || filter === "thu") {
			const g = getGame(r.gameId);
			if (!g) return false;
			const slot = gameSlot(g);
			if (filter === "thu") return slot === "tnf";
			return isPrime(slot);
		}
		if (filter === "steam") return isTapeFlag(r);
		if (filter === "anomaly") return isAnomalyFlag(r);
		if (filter === "public") {
			const g = getGame(r.gameId);
			return g ? isPublicFlag(g) : false;
		}
		if (filter === "sharp") return r.sharp ? isSharpFlag(r.sharp) : false;
		if (filter === "refs") {
			const g = getGame(r.gameId);
			return g ? isRefFlag(analyzeRef(g)) : false;
		}
		return true;
	});
	const near = ranked.filter((r) => !onCard.has(r.gameId) && r.pick.ev > 0 && r.pick.ev < .03);
	const cardN = plays.length;
	const featured = SLATE.filter((g) => g.featured);
	const refBoard = SLATE.map((g) => ({
		game: g,
		ref: analyzeRef(g)
	})).filter((x) => x.ref.grade !== "quiet").sort((a, b) => b.ref.score - a.ref.score);
	const refFlags = refBoard.filter((x) => isRefFlag(x.ref));
	const topCrews = refBoard.slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "The desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "max-w-xl text-3xl font-medium tracking-tight sm:text-4xl",
						children: "Rank the number. Not the score."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Only a plus-EV ticket at a posted book price is a wager. Sharp, steam, and refs are context. Predictions for all 16 sit on",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/record",
								className: "text-foreground underline",
								children: "Record"
							}),
							". Line movement on the tape is only a stored print. It is not steam.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/plans",
								className: "text-foreground underline",
								children: "Beta"
							}),
							". 21+."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RunBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineTape, {}),
			lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "rounded-xl border border-foreground bg-card p-4 sm:p-5",
				children: cardN === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Decision"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-xl font-medium tracking-tight",
						children: "No qualifying wagers this run."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: dataMode === "live-books" ? `No spread or total cleared ${MIN_EV * 100}% after juice at a posted price from ${oddsBooks.join(", ") || "the board"}. Props and model parlays are not live books, so they are not on the card.` : "Live books did not return a board. The seeded sheet is on screen for research only. Nothing on it is a recommendation."
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Decision"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-1 text-xl font-medium tracking-tight",
						children: [
							cardN,
							" play",
							cardN === 1 ? "" : "s",
							" clear ",
							MIN_EV * 100,
							"% after juice."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Game markets ",
							plays.filter((p) => p.kind === "spread" || p.kind === "total").length,
							" · props",
							" ",
							plays.filter((p) => p.kind === "prop").length,
							" · parlays ",
							plays.filter((p) => p.kind === "parlay").length,
							". Paper card ",
							cardN,
							". Each ticket stores the book, the fetch time, and that price.",
							oddsFetchedAt ? ` Board ${oddsFetchedAt}.` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 space-y-2",
						children: plays.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketCard, { play }, play.id))
					})
				] })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Game markets",
						value: lastRunAt ? String(plays.filter((p) => p.kind === "spread" || p.kind === "total").length) : "—",
						hint: "sides / totals on the card"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Props",
						value: lastRunAt ? String(plays.filter((p) => p.kind === "prop").length) : "—",
						hint: "not a live book"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Parlays",
						value: lastRunAt ? String(plays.filter((p) => p.kind === "parlay").length) : "—",
						hint: "not a posted price"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Paper card",
						value: lastRunAt ? String(cardN) : "—",
						hint: `≥ ${MIN_EV * 100}% after juice`
					})
				]
			}),
			topSharps.length > 0 && lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Observed: sharp money"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Diagnostic. Ticket/handle split and RLM — not a wager by itself."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid gap-2 sm:grid-cols-5",
						children: topSharps.map((r) => {
							const g = getGame(r.gameId);
							if (!g || !r.sharp) return null;
							const lean = r.sharp.lean;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/game/$gameId",
								params: { gameId: r.gameId },
								className: "block rounded-xl border border-border bg-card p-3 hover:bg-background-elevated",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium",
											children: [
												team(g.away).abbr,
												" @ ",
												team(g.home).abbr
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: sharpTone(r.sharp.grade),
											children: r.sharp.grade
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm",
										children: lean ? `Lean ${lean}` : "No clean lean"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 font-mono text-xs tabular-nums text-muted-foreground",
										children: [
											formatScore(r.sharp.score),
											" · ",
											r.sharp.fired.length,
											" tell",
											r.sharp.fired.length === 1 ? "" : "s",
											onCard.has(r.gameId) ? "" : " · pass"
										]
									})
								]
							}) }, r.gameId);
						})
					})
				]
			}) : null,
			topCrews.length > 0 && lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Observed: referees"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Crew tells. Not a reason to write a ticket on its own."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "grid gap-2 sm:grid-cols-5",
						children: topCrews.map(({ game: g, ref }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/game/$gameId",
							params: { gameId: g.id },
							className: "block rounded-xl border border-border bg-card p-3 hover:bg-background-elevated",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate text-sm font-medium",
										children: ref.crew.name.split(" ").slice(-1)[0]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: refTone(ref.grade),
										children: ref.grade
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-sm",
									children: [
										team(g.away).abbr,
										" @ ",
										team(g.home).abbr
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs tabular-nums text-muted-foreground",
									children: [
										formatScore(ref.score),
										" · ",
										ref.totalLean === "even" ? `${ref.crew.flagsPerGame.toFixed(1)} flg` : ref.totalLean,
										ref.passLean === "up" ? " · DPI" : "",
										ref.sackLean === "up" ? " · sacks" : ref.sackLean === "down" ? " · hold" : ""
									]
								})
							]
						}) }, g.id))
					})
				]
			}) : null,
			featured.length > 0 && lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Watch list"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Prime / chaos / featured kickoffs. Still a pass unless it is on the card."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-3",
						children: featured.map((g) => {
							const r = results[g.id];
							const away = team(g.away);
							const home = team(g.home);
							if (!r) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/game/$gameId",
								params: { gameId: g.id },
								className: "rounded-xl border border-border bg-card p-4 hover:bg-background-elevated",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium",
											children: [
												away.abbr,
												" @ ",
												home.abbr
											]
										}), g.id === "lar-den" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "warn",
											children: "chaos"
										}) : r.steam !== "stable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: r.steam === "rlm" ? "loss" : "warn",
											children: r.steam
										}) : r.anomaly.state !== "normal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "warn",
											children: r.anomaly.state
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: g.network
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: onCard.has(r.gameId) ? r.pick.side : `Pass · ${r.pick.side}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: cn("mt-1 font-mono text-sm tabular-nums", onCard.has(r.gameId) ? "text-profit" : "text-muted-foreground"),
										children: [
											"EV ",
											formatSigned(r.pick.ev * 100),
											"%"
										]
									})
								]
							}, g.id);
						})
					})
				]
			}) : null,
			lastRunAt && snaps.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Simulation variance since prior run"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Same seeded inputs. Output moved because of a new sim seed, path count, or chaos setting — not a live market move."
					}),
					(() => {
						const deltas = diffSnapshots(snaps[1], snaps[0]);
						if (!deltas.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No material change."
						});
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-1.5",
							children: deltas.slice(0, 8).map((d) => {
								const g = getGame(d.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/game/$gameId",
										params: { gameId: d.id },
										className: "hover:underline",
										children: g ? `${team(g.away).abbr} @ ${team(g.home).abbr}` : d.id
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-xs text-muted-foreground",
										children: [
											d.sideFrom,
											" → ",
											d.sideTo,
											" · ",
											formatSigned(d.evFrom * 100),
											"% → ",
											formatSigned(d.evTo * 100),
											"%",
											d.takeFrom !== d.takeTo ? d.takeTo ? " · onto card" : " · off card" : ""
										]
									})]
								}, d.id);
							})
						});
					})()
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium",
								children: "Full slate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Research view. Pass means we would not bet it."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-muted-foreground",
									children: [
										shown.length,
										"/",
										SLATE.length
									]
								}), lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/book",
										children: [
											"Open the book (",
											tickets.filter((t) => !t.voidedAt).length,
											")"
										]
									})
								}) : null]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [
							[
								"all",
								"All",
								ranked.length
							],
							[
								"plus",
								"Card",
								plus.length
							],
							[
								"near",
								"Near",
								near.length
							],
							[
								"pass",
								"Pass",
								Math.max(0, ranked.length - plus.length)
							],
							[
								"prime",
								"Prime",
								ranked.filter((r) => {
									const g = getGame(r.gameId);
									return g ? isPrime(gameSlot(g)) : false;
								}).length
							],
							[
								"thu",
								"TNF",
								ranked.filter((r) => {
									const g = getGame(r.gameId);
									return g ? gameSlot(g) === "tnf" : false;
								}).length
							],
							[
								"totals",
								"Totals",
								ranked.filter((r) => r.pick.market === "total").length
							],
							[
								"sharp",
								"Sharps",
								sharps.length
							],
							[
								"refs",
								"Refs",
								refFlags.length
							],
							[
								"steam",
								"Steam",
								steam.length
							],
							[
								"public",
								"Public",
								publicFades.length
							],
							[
								"anomaly",
								"Flags",
								flagged.length
							]
						].map(([id, label, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setFilter(id),
							className: cn("h-10 min-h-10 rounded-md px-3 text-sm", filter === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"),
							children: [label, lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-1 font-mono text-xs",
								children: n
							}) : null]
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground",
							children: lastRunAt ? "Nothing matches this filter." : "Run the slate to get a number."
						}) : shown.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameRow, {
							result: r,
							rank: i + 1,
							onCard: onCard.has(r.gameId)
						}, r.gameId))
					})
				]
			}),
			top ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Top ticket ",
					top.market,
					" · EV ",
					formatSigned(top.ev * 100),
					"% · ",
					top.source
				]
			}) : null
		]
	});
}
function Kpi({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-2xl tabular-nums leading-none",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
//#endregion
export { Home as component };
