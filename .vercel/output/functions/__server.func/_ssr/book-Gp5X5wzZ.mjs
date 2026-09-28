import { b as analyzeBook, gt as formatPct, ht as cn, lt as useDesk, mt as americanOdds, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-Gp5X5wzZ.js
var import_jsx_runtime = require_jsx_runtime();
function BookPage() {
	const tickets = useDesk((s) => s.tickets) ?? [];
	const bankroll = useDesk((s) => s.bankroll) ?? 1e4;
	const seed = useDesk((s) => s.seed);
	const paperAllPlus = useDesk((s) => s.paperAllPlus);
	const voidTicket = useDesk((s) => s.voidTicket);
	const clearBook = useDesk((s) => s.clearBook);
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const runId = useDesk((s) => s.runId);
	const runPhase = useDesk((s) => s.runPhase);
	const stats = analyzeBook(tickets, bankroll, seed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Paper tickets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Paper book"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Half-Kelly, 3-unit cap. Tickets are simulated only — nothing is sent to a sportsbook. After the card is locked, void, clear, and another paper append a refusal. The original price stays."
					}),
					runPhase === "locked" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: "Card locked. Void and clear are refused. Settlement source is still empty."
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Tickets",
						value: String(stats.n),
						hint: "paper · not live"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "In action",
						value: formatPct(stats.maxExposure),
						hint: `$${Math.round(stats.stake).toLocaleString()}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Hold",
						value: formatSigned(stats.roi * 100) + "%",
						hint: "expected on staked units",
						profit: stats.roi > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Ruin",
						value: formatPct(stats.ruin),
						hint: "24-week path",
						warn: stats.ruin > .05
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => paperAllPlus(),
					disabled: !lastRunAt,
					variant: "secondary",
					children: "Paper the plus"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => clearBook(),
					variant: "ghost",
					disabled: !tickets.length,
					children: "Clear book"
				})]
			}),
			tickets.filter((t) => !t.voidedAt).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: !lastRunAt ? "No run yet. Run the desk to generate a paper card." : `Run priced. No qualifying tickets met the 3% post-juice threshold. ${runId ?? ""} · 0.00u gross.`
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("rounded-xl border border-border bg-card p-4", t.voidedAt && "opacity-60"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: t.kind === "parlay" ? "warn" : "outline",
											children: t.kind
										}),
										t.voidedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: "void"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium",
											children: t.side
										})
									]
								}),
								t.gameId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/game/$gameId",
									params: { gameId: t.gameId },
									className: "mt-1 block text-sm text-muted-foreground hover:underline",
									children: t.label
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: t.label
								}),
								t.source ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-xs text-muted-foreground",
									children: t.source
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => voidTicket(t.id),
							disabled: Boolean(t.voidedAt),
							children: t.voidedAt ? "Voided" : "Void"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								k: "Stake",
								v: `$${t.stake}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								k: "Price",
								v: americanOdds(t.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								k: "Win p",
								v: formatPct(t.prob)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
								k: "EV",
								v: formatSigned(t.ev * 100) + "%",
								profit: t.ev >= .03
							})
						]
					})]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Book report"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								k: "Median bankroll",
								v: `$${Math.round(stats.medianEnd).toLocaleString()}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								k: "P(down)",
								v: formatPct(stats.pDown)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								k: "E[profit]",
								v: `$${Math.round(stats.expectedProfit).toLocaleString()}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								k: "Bankroll",
								v: `$${bankroll.toLocaleString()}`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs leading-relaxed text-muted-foreground",
						children: "We don’t send this slip to a sportsbook. 21+. If gambling is a problem, call 1-800-GAMBLER."
					})
				]
			})
		]
	});
}
function Kpi({ label, value, hint, profit, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-3 sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-2 font-mono text-2xl tabular-nums leading-none ${profit ? "text-profit" : warn ? "text-warn" : ""}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function Cell({ k, v, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: profit ? "mt-1 text-profit" : "mt-1",
		children: v
	})] });
}
function Mini({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-mono text-sm tabular-nums",
		children: v
	})] });
}
//#endregion
export { BookPage as component };
