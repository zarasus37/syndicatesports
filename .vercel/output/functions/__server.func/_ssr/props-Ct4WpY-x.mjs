import { w as PROPS } from "./box-CrH4BFCf.mjs";
import { gt as formatPct, ht as cn, lt as useDesk, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/props-Ct4WpY-x.js
var import_jsx_runtime = require_jsx_runtime();
function PropsPage() {
	const list = useDesk((s) => s.props) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const runId = useDesk((s) => s.runId) ?? "pending";
	const results = useDesk((s) => s.results) ?? {};
	const plays = useDesk((s) => s.plays) ?? [];
	const byId = Object.fromEntries(list.map((p) => [p.id, p]));
	const approved = plays.filter((p) => p.kind === "prop");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Player markets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Props"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Research board only. These numbers are the seeded prop sheet, not a live book. They are not recommendations and they are not on the paper card. A prop needs a posted price, a book, and a timestamp before it can clear 3%."
					})
				]
			}),
			approved.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-sm font-medium",
					children: [approved.length, " props on the card"]
				}), approved.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border bg-card p-4 text-sm",
					children: [
						play.market,
						" · ",
						play.source,
						" · ",
						play.price
					]
				}, play.id))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: !lastRunAt ? "No run yet. Props stay off the card until a book posts the number." : `Run ${runId} priced. No prop is a recommendation. The board below is the seeded sheet, not a live book.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Board"
				}), PROPS.map((line) => {
					const sim = byId[line.id];
					const pick = sim?.pick ?? "pass";
					const game = results[line.gameId];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/game/$gameId",
								params: { gameId: line.gameId },
								className: "text-sm font-medium hover:underline",
								children: line.player
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									line.team,
									" · ",
									line.market,
									" ",
									line.line,
									" · ",
									line.dist,
									sim?.weatherNote ? ` · ${sim.weatherNote}` : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: pick === "pass" ? "default" : "profit",
								children: pick
							})]
						}), lastRunAt && sim ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "Mean",
									v: sim.mean.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "Median",
									v: sim.median.toFixed(1)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "P(over)",
									v: formatPct(sim.pOver)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "Over / under",
									v: `${line.overPrice} / ${line.underPrice}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "EV over",
									v: formatSigned(sim.evOver * 100) + "%",
									profit: sim.evOver >= .03
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "EV under",
									v: formatSigned(sim.evUnder * 100) + "%",
									profit: sim.evUnder >= .03
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "Source",
									v: "Seeded sheet · not a live book"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
									k: "Lock",
									v: "Kickoff · official box"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: [
								"Volume sensitivity: ",
								sim.weatherNote ?? "No weather tax.",
								" ",
								game ? `Game lean ${game.pick.side} · EV ${formatSigned(game.pick.ev * 100)}%. Not a wager.` : null
							]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Waiting on a slate run."
						})]
					}, line.id);
				})]
			})
		]
	});
}
function Cell({ k, v, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-1", profit && "text-profit"),
		children: v
	})] });
}
//#endregion
export { PropsPage as component };
