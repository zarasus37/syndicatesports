import { c as buildAudit, d as findGame } from "./box-CrH4BFCf.mjs";
import { bt as formatUnits, gt as formatPct, lt as useDesk, mt as americanOdds, nt as sizeBreakdown, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ticket-card-6Sk6S0Lc.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	"paper-eligible": "Paper eligible · not locked",
	papered: "On the paper book",
	locked: "Locked pending kickoff"
};
var INTEGRITY = {
	valid: "profit",
	open: "outline",
	invalid: "loss",
	corrected: "warn",
	void: "warn"
};
function stamp(n) {
	if (!n) return "—";
	return new Date(n).toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function TicketCard({ play }) {
	const s = play.size ?? sizeBreakdown(play.modelP, play.price);
	const audit = play.audit ?? buildAudit(play);
	const box = useDesk((st) => st.box);
	const game = box && play.matchup ? findGame(box, play.matchup, 3) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: play.kind === "prop" ? "outline" : play.kind === "parlay" ? "warn" : "profit",
						children: play.kind
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: play.market
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-mono text-xs text-muted-foreground",
					children: play.runId
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: INTEGRITY[audit.integrity] ?? "outline",
						children: audit.integrity
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: STATUS[play.status]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Price",
						v: americanOdds(play.price)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Book / source",
						v: play.source
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Model p",
						v: formatPct(play.modelP)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Implied p",
						v: formatPct(play.impliedP)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Post-vig EV",
						v: formatSigned(play.ev * 100) + "%",
						profit: play.ev >= .03
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Full Kelly",
						v: formatPct(s.full)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Half-Kelly",
						v: `${s.fraction.toFixed(2)}× · ${formatPct(s.half)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Final stake",
						v: s.capped ? `${formatUnits(play.units)} · capped at ${formatPct(s.cap)}` : `${formatUnits(play.units)} / ${formatPct(play.units / 100)} BR`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Model",
						v: play.modelVersion
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						k: "Priced",
						v: stamp(play.pricedAt)
					})
				]
			}),
			s.capped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: [
					"Capped at the configured 3.0% bankroll maximum. Half-Kelly was ",
					formatPct(s.half),
					"."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: audit.integrity === "valid" ? `Valid only if priced ${stamp(audit.recommendationTimestamp)} ≤ lock ${stamp(audit.cardLockTimestamp)} < sheet kickoff ${stamp(audit.kickoffTimestamp)}.` : audit.integrity === "invalid" ? `Invalid. Recommendation must be at or before the lock, and the lock must be before sheet kickoff ${stamp(audit.kickoffTimestamp)}.` : audit.integrity === "void" ? "Void keeps the original price and a reason. It is not a locked recommendation." : `Open. A lock counts only before sheet kickoff ${stamp(audit.kickoffTimestamp)}. This week’s games are not final.`
			}),
			game && game.status !== "final" && !audit.settlementSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					"Not settled. ",
					game.away,
					" @ ",
					game.home,
					" is ",
					game.statusName,
					". A 0–0 pregame score is not a result."
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-3 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: "Integrity record"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-1 gap-y-2 font-mono text-xs sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "ticket_id",
								v: audit.ticketId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "card_id",
								v: audit.cardId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "market_id",
								v: audit.marketId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "model_version",
								v: audit.modelVersion
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "input_snapshot_hash",
								v: audit.inputSnapshotHash
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "odds_source",
								v: audit.oddsSource
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "source_timestamp",
								v: stamp(audit.sourceTimestamp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "recommendation_timestamp",
								v: stamp(audit.recommendationTimestamp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "card_lock_timestamp",
								v: stamp(audit.cardLockTimestamp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "kickoff_timestamp",
								v: stamp(audit.kickoffTimestamp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "lock_actor",
								v: audit.lockActor ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								k: "settlement",
								v: audit.settlementSource ? `${audit.settlementSource} · ${stamp(audit.settlementTimestamp)}` : "—"
							})
						]
					}),
					audit.voidReason ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-warn",
						children: [
							"Void reason: ",
							audit.voidReason,
							". Original retained."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-1 text-xs text-muted-foreground",
						children: audit.events.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							stamp(e.at),
							" · ",
							e.type,
							" · ",
							e.actor,
							" · ",
							e.note
						] }, `${e.type}-${e.at}-${i}`))
					})
				]
			})
		]
	});
}
function Row({ k, v, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: profit ? "mt-0.5 text-profit" : "mt-0.5",
		children: v
	})] });
}
//#endregion
export { TicketCard as t };
