import { i as __toESM } from "../_runtime.mjs";
import { p as gradeTickets } from "./box-CrH4BFCf.mjs";
import { $ as segmentBook, E as calibrate, K as maxDrawdown, _ as REASON_COPY, f as MIN_EV, gt as formatPct, ht as cn, l as MAX_BANKROLL_PCT, lt as useDesk, mt as americanOdds, n as ASSUMPTIONS, o as KELLY_FRACTION, v as allTickets, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as ChevronDown } from "../_libs/lucide-react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { n as SettlementPanel, t as EvidenceBand } from "./settlement-panel-DBD4Df8j.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn-vW9WRlqW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MISS_CLASS_META = {
	held: {
		label: "Held",
		detail: "The rules that put this on the card were not contradicted by the result."
	},
	variance: {
		label: "Variance",
		detail: "Price and process were reasonable. The result sat inside the distribution — key number, juice, or one leg."
	},
	"stale-pricing": {
		label: "Stale price",
		detail: "Negative CLV. The stored number was behind where the market went."
	},
	"over-weighted-context": {
		label: "Over-weighted context",
		detail: "Weather, crew, slot, or chaos was asked to do more work than the result supported."
	},
	"misread-market": {
		label: "Misread market",
		detail: "Tickets, handle, or steam were read the wrong way. The other side of the market was right."
	},
	"model-error": {
		label: "Model error",
		detail: "The number was too ambitious. Direction can be fine and the side still lose."
	},
	open: {
		label: "Open",
		detail: "Not graded. The stored price is what will be reviewed. Nothing trains a weight yet."
	}
};
/** Primary class when several reasons fire. Market reads outrank a close loss. */
var CLASS_RANK = [
	"misread-market",
	"stale-pricing",
	"model-error",
	"over-weighted-context",
	"variance"
];
var REASON_CLASS = {
	juice: "variance",
	"key-number": "variance",
	"one-leg": "variance",
	"line-moved-against": "stale-pricing",
	"weather-miss": "over-weighted-context",
	"chaos-miss": "over-weighted-context",
	"ref-conflict": "over-weighted-context",
	"public-was-right": "misread-market",
	"handle-led-steam": "misread-market",
	"model-soft": "model-error"
};
var FAILED_COPY = {
	"key-number": "Lost on the key number. The side was live; the price was not.",
	"public-was-right": "Fade used ticket share without handle confirmation. The public side cashed.",
	"line-moved-against": "Stored number was already behind the tape.",
	"model-soft": "The number was too ambitious versus the final margin.",
	"weather-miss": "Weather tax was weighted above what the player actually did.",
	"chaos-miss": "Chaos paths were in the sim and not in the game.",
	"ref-conflict": "Crew lean was weighted over the slot. The slot won.",
	"handle-led-steam": "Treated square steam — handle and the number together — as a sharp move.",
	juice: "After juice this was a coin flip. Variance, not a broken feature.",
	"one-leg": "The joint price needed every leg. One leg decided the ticket."
};
var TAG_FACTOR = {
	steam: {
		signal: "Steam",
		role: "market",
		weight: "material",
		read: "Number and handle moved together before the card."
	},
	rlm: {
		signal: "Reverse line move",
		role: "market",
		weight: "material",
		read: "Line moved against the ticket majority."
	},
	sharp: {
		signal: "Sharp grade",
		role: "market",
		weight: "annotation",
		read: "Desk sharp grade. Diagnostic context — not a bet by itself."
	},
	"public-fade": {
		signal: "Public fade",
		role: "market",
		weight: "material",
		read: "Faded a heavy ticket side. Handle has to disagree or this is noise."
	},
	home: {
		signal: "Home overlay",
		role: "forecast",
		weight: "annotation",
		read: "Home rating residual, shrunk toward the market."
	},
	chaos: {
		signal: "Chaos",
		role: "context",
		weight: "material",
		read: "Late-game script was on. Context, not a stand-alone edge."
	},
	tnf: {
		signal: "Thursday slot",
		role: "context",
		weight: "material",
		read: "Short week. A slot prior on the total, not an automatic under."
	},
	"let-play": {
		signal: "Let-play crew",
		role: "context",
		weight: "annotation",
		read: "Fewer flags. Annotation unless the total cleared the juice."
	},
	ref: {
		signal: "Officiating",
		role: "context",
		weight: "annotation",
		read: "Crew tendency on totals or flags. Never a side by itself."
	},
	"whistle-over": {
		signal: "Whistle-over",
		role: "context",
		weight: "material",
		read: "Flag-heavy crew leaning the over."
	},
	wind: {
		signal: "Weather",
		role: "context",
		weight: "material",
		read: "Wind or heat tax on the total and passing props."
	},
	prop: {
		signal: "Player distribution",
		role: "forecast",
		weight: "material",
		read: "Model distribution versus the posted number."
	},
	parlay: {
		signal: "Joint price",
		role: "forecast",
		weight: "material",
		read: "Three legs, correlation haircut, same-game ban."
	}
};
var TAG_HAIRCUT = {
	rlm: "rlm",
	steam: "steam",
	tnf: "tnf",
	chaos: "chaos",
	wind: "wind",
	"whistle-over": "refOver",
	"public-fade": "publicFade"
};
var HELD_REASON = {
	"clv-captured": "Market moved toward the card after the number was stored.",
	"rlm-hit": "Reverse line move agreed with the result.",
	"model-hit": "Cover probability was on the right side of the number.",
	"home-script": "Home overlay agreed with the result.",
	"ref-scripted": "Crew tendency showed up in the box score.",
	"weather-hit": "Weather overlay showed up in the box score.",
	"chaos-hit": "Late-game script showed up on the field.",
	"tnf-total": "Thursday total lean agreed with the score."
};
function reviewTicket(t, priors) {
	const classes = classOf(t);
	return {
		ticket: t,
		priceLine: priceLine(t),
		factors: factorsOf(t),
		outcome: outcomeOf(t),
		held: heldOf(t),
		failed: failedOf(t),
		missClass: classes.primary,
		also: classes.also,
		change: changeOf(t, priors)
	};
}
function reviewTickets(rows, priors) {
	return rows.map((t) => reviewTicket(t, priors));
}
function classCounts(rows) {
	const counts = Object.fromEntries(Object.keys(MISS_CLASS_META).map((k) => [k, 0]));
	for (const r of rows) counts[r.missClass] += 1;
	return counts;
}
function priceLine(t) {
	const number = t.kind === "parlay" ? "joint" : `line ${formatSigned(t.line, t.line % 1 === 0 ? 0 : 1)}`;
	return `${t.side} ${americanOdds(t.price)} · ${number} · model ${formatPct(t.prob)} · post-vig EV ${formatSigned(t.ev * 100)}%`;
}
function factorsOf(t) {
	const rows = [{
		signal: "Stored price",
		role: "market",
		weight: "material",
		read: `Decision price. CLV versus the open is ${formatSigned(t.clv)} pt.`
	}];
	for (const tag of t.tags) {
		const f = TAG_FACTOR[tag];
		if (f) rows.push(f);
	}
	if (rows.length === 1) rows.push({
		signal: "Model residual",
		role: "forecast",
		weight: "material",
		read: "No market or context tag. The number cleared the juice on probability alone."
	});
	return rows;
}
function outcomeOf(t) {
	if (t.result === "pending") return "Not graded. Review waits on the result.";
	if (t.result === "push") return `Push${t.score ? ` · ${t.score}` : ""}. Returned stake does not train a hit rate.`;
	return `${t.result === "win" ? "Cashed" : "Lost"}.${t.score ? ` Final ${t.score}.` : ""} CLV versus the open ${formatSigned(t.clv)}.`;
}
function classOf(t) {
	if (t.result === "pending") return {
		primary: "open",
		also: []
	};
	if (t.result === "win" || t.result === "push") return {
		primary: "held",
		also: []
	};
	const found = [...new Set(t.reasons.map((r) => REASON_CLASS[r]).filter((c) => Boolean(c)))];
	if (t.clv < 0 && !found.includes("stale-pricing")) found.push("stale-pricing");
	if (!found.length) found.push(t.clv >= 0 ? "variance" : "stale-pricing");
	const ranked = CLASS_RANK.filter((c) => found.includes(c));
	return {
		primary: ranked[0] ?? "variance",
		also: ranked.slice(1)
	};
}
function heldOf(t) {
	if (t.result === "pending") return ["None yet. Assumptions are stored with the price and checked after the grade."];
	const out = [];
	if (t.clv > 0) out.push(`Beat the open by ${formatSigned(t.clv)}. The stored price was the right side of the tape.`);
	else if (t.clv === 0) out.push("Flat to the recorded open. That is not a closing-line value.");
	for (const r of t.reasons) {
		const line = HELD_REASON[r];
		if (line && !out.includes(line)) out.push(line);
	}
	if (t.result === "win" && !t.reasons.some((r) => r in HELD_REASON)) out.push("Result agreed with the side. No single factor is credited beyond the price.");
	if (!out.length) out.push("No assumption on this ticket is marked as having held.");
	return out;
}
function failedOf(t) {
	if (t.result === "pending") return ["Not graded."];
	if (t.result === "win" || t.result === "push") return ["None material. A hit is not a reason to raise the weight."];
	const out = t.reasons.map((r) => FAILED_COPY[r] ?? REASON_COPY[r] ?? r);
	if (t.clv < 0 && !t.reasons.includes("line-moved-against")) out.push(`CLV ${formatSigned(t.clv)}. We were behind the open even if another reason is primary.`);
	return out.length ? out : ["Loss with no logged reason. Treated as variance until a cause is assigned."];
}
function changeOf(t, priors) {
	if (t.result === "pending") return "Nothing. An open ticket does not move a weight.";
	const klass = classOf(t).primary;
	const touched = [...new Set(t.tags.map((tag) => TAG_HAIRCUT[tag]).filter((k) => Boolean(k)))].map((key) => ({
		key,
		mult: priors.haircuts[key]
	}));
	if (t.result === "loss") {
		const cuts = touched.filter((x) => x.mult <= .96);
		if (cuts.length) {
			const bits = cuts.map((x) => `${labelKey(x.key)} ${x.mult.toFixed(2)}×`);
			const why = cuts.length === 1 && cuts[0]?.key === "publicFade" ? "Fades that used ticket share without handle are no longer full weight." : "This miss is inside that posterior.";
			return `${bits.join(", ")} on the next slate. ${why} One ticket did not set the number. The stored price is not rewritten.`;
		}
		if (klass === "stale-pricing") return "Logged as a stale price. There is no multiplier for negative CLV. A tag that cashed elsewhere is not cut because this ticket was behind the open.";
		if (klass === "model-error") return "Logged as model error — the number was too ambitious. No feature weight moved off this ticket. κ = 10 still dominates a two-week sample.";
		if (klass === "variance") return "Logged as variance. A key number, or a coin flip after juice, does not change a weight.";
		if (klass === "over-weighted-context") return "Logged as over-weighted context. The related weight is still inside 4% of the prior, so the next slate uses 1.00×.";
		return "Logged as a misread market. The related weight has not cleared the prior, so this miss does not rewrite the rule.";
	}
	const down = touched.filter((x) => x.mult <= .96);
	if (down.length) return `${down.map((x) => `${labelKey(x.key)} is still ${x.mult.toFixed(2)}×`).join(", ")}. This cash is in the sample and did not restore the weight.`;
	const up = touched.filter((x) => x.mult >= 1.04);
	if (up.length) return `Counted in ${up.map((x) => `${labelKey(x.key)} ${x.mult.toFixed(2)}×`).join(", ")}. That is the tag’s posterior, not this ticket. A hit does not raise the unit size.`;
	return "No weight change. A hit does not raise a multiplier, and a hot streak does not inflate the posterior.";
}
function labelKey(key) {
	if (key === "refOver") return "Whistle-over";
	if (key === "publicFade") return "Public fade";
	if (key === "tnf") return "Thursday";
	return key;
}
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "held",
		label: "Held"
	},
	{
		id: "misread-market",
		label: "Market"
	},
	{
		id: "stale-pricing",
		label: "Stale price"
	},
	{
		id: "model-error",
		label: "Model"
	},
	{
		id: "over-weighted-context",
		label: "Context"
	},
	{
		id: "variance",
		label: "Variance"
	},
	{
		id: "open",
		label: "Open"
	}
];
function ReviewBoard({ rows, priors }) {
	const reviews = (0, import_react.useMemo)(() => reviewTickets(rows, priors), [rows, priors]);
	const counts = (0, import_react.useMemo)(() => classCounts(reviews), [reviews]);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const weeks = groupWeeks(filter === "all" ? reviews : reviews.filter((r) => r.missClass === filter));
	const [open, setOpen] = (0, import_react.useState)(weeks[0]?.week ?? null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Post-week review"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: "Each closed ticket keeps the stored price, the factor stack that put it on the card, what the result did to those assumptions, and whether a weight actually moved. A hit is not a rewrite. Two weeks is not a season."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "grid gap-2 sm:grid-cols-4",
				children: [
					["Observe", "Market, conditions, crew, slot."],
					["Model", "Probability versus the price, juice in."],
					["Decide", "Bet, lean, or pass. Size is capped."],
					["Review", "What held, what broke, what changed."]
				].map(([title, body], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: [
							"0",
							i + 1,
							" ",
							title
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: body
					})]
				}, title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: FILTERS.map((f) => {
					const n = f.id === "all" ? reviews.length : counts[f.id];
					if (f.id !== "all" && n === 0) return null;
					const on = filter === f.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setFilter(f.id);
							const next = f.id === "all" ? reviews : reviews.filter((r) => r.missClass === f.id);
							const top = [...new Set(next.map((r) => r.ticket.week))].sort((a, b) => b - a)[0];
							setOpen(top ?? null);
						},
						className: cn("inline-flex min-h-9 items-center gap-2 rounded-md border px-2.5 font-mono text-xs uppercase tracking-wider", on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"),
						children: [f.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: n
						})]
					}, f.id);
				})
			}),
			filter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: MISS_CLASS_META[filter].detail
			}) : null,
			weeks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground",
				children: "Nothing in this class."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: weeks.map((wk) => {
					const shownWeek = open === wk.week;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-expanded": shownWeek,
							onClick: () => setOpen(shownWeek ? null : wk.week),
							className: "flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm font-medium",
								children: [
									"Week ",
									wk.week,
									wk.open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 font-normal text-muted-foreground",
										children: "not graded"
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground",
								children: [
									wk.held,
									" held · ",
									wk.missed,
									" miss",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
										className: cn("size-4 transition-transform", shownWeek && "rotate-180"),
										strokeWidth: 1.75
									})
								]
							})]
						}), shownWeek ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3 border-t border-border px-4 py-3",
							children: wk.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewCard, { review: r }, r.ticket.id))
						}) : null]
					}, wk.week);
				})
			})
		]
	});
}
function ReviewCard({ review }) {
	const t = review.ticket;
	const meta = MISS_CLASS_META[review.missClass];
	const badge = review.missClass === "held" ? "profit" : review.missClass === "open" ? "outline" : review.missClass === "variance" ? "outline" : "loss";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-background px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: t.result === "win" ? "profit" : t.result === "loss" ? "loss" : "outline",
						children: t.result
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: t.kind
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: badge,
						children: meta.label
					}),
					review.also.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["also ", MISS_CLASS_META[c].label]
					}, c)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: t.matchup
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs leading-relaxed text-foreground",
				children: review.priceLine
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: review.outcome
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[28rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-3 font-medium",
								children: "Signal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-3 font-medium",
								children: "Role"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 pr-3 font-medium",
								children: "Weight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 font-medium",
								children: "Read"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: review.factors.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3",
								children: f.signal
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 font-mono text-xs text-muted-foreground",
								children: f.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 pr-3 font-mono text-xs text-muted-foreground",
								children: f.weight
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5 text-muted-foreground",
								children: f.read
							})
						]
					}, f.signal)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Held"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 space-y-1 text-sm",
					children: review.held.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, line))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Failed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 space-y-1 text-sm text-muted-foreground",
					children: review.failed.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: line }, line))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Afterward "
				}), review.change]
			})
		]
	});
}
function groupWeeks(rows) {
	return [...new Set(rows.map((r) => r.ticket.week))].sort((a, b) => b - a).map((week) => {
		const xs = rows.filter((r) => r.ticket.week === week);
		return {
			week,
			rows: xs,
			held: xs.filter((r) => r.missClass === "held").length,
			missed: xs.filter((r) => r.missClass !== "held" && r.missClass !== "open").length,
			open: xs.every((r) => r.missClass === "open")
		};
	});
}
var MODEL_CARD = {
	version: ASSUMPTIONS.version,
	edge: `Post-vig expected value of at least ${MIN_EV * 100}% at the stored price. A prediction of who wins is not a wager.`,
	inputs: [
		"Public board prices for spread, total, and moneyline when Pinnacle, FanDuel, Bovada, or DraftKings return. Reference is that order. The ticket takes the best American price at the same number.",
		"Seeded Week 3 sheet open, used only as a prior mark — not a book open and not a close",
		"Public tickets / handle split (seeded)",
		"Referee crew tendencies (seeded)",
		"Weather and altitude overlays (seeded)",
		"Injury / out tags the operator toggles",
		"Closed Weeks 1–2 ledger for Bayesian priors"
	],
	exclusions: [
		"Player props and parlays from a sportsbook",
		"Player-level tracking or snap counts from a vendor",
		"Closing number at kickoff",
		"Other sports",
		"Any ticket sent to a sportsbook"
	],
	simulation: [
		`Gaussian scoring with mean-shift factor ${ASSUMPTIONS.meanShift} vs the market mean`,
		`${ASSUMPTIONS.defaultSims.toLocaleString()} default paths, operator-capped higher`,
		"Cover probability on the spread; totals from the same paths",
		"Props: passing yards ~ normal; sacks ~ Poisson",
		"Parlays: joint from shared paths, with a correlation haircut and same-game ban on 3-leg"
	],
	sizing: [
		`Full Kelly, then ${KELLY_FRACTION.toFixed(2)}× (half-Kelly)`,
		`Hard cap ${MAX_BANKROLL_PCT * 100}% of bankroll per ticket (3 units at 1u = 1%)`,
		`Per-game cap 6u; correlated same-game tickets scale down`,
		"Size uses the conservative probability, not the sim point"
	],
	failures: [
		"Hot streaks inflate a posterior if left uncapped — we do not inflate on a heater",
		"Seeded tape is not CLV versus a real close",
		"Props and model parlays have no live book price, so they are not recommendations",
		"Two weeks is not a season. Calibration vs climate can be negative while hit rate is high",
		"A no-bet run is still a run. Pass is a position",
		"Settlement is the ESPN scoreboard final for sides and totals. The archive string is not the grade. Props and parlays are not on that feed",
		"Close CLV is the DraftKings close on ESPN when the game is final. The recorded open CLV is not that number, and line plus CLV is not a close",
		"The line tape stores a price only after this desk fetches it. The first print is not a look-ahead release and not the official open"
	]
};
function LearnPage() {
	const locked = useDesk((s) => s.locked) ?? [];
	const box = useDesk((s) => s.box);
	const priors = useDesk((s) => s.priors);
	const lockWeek = useDesk((s) => s.lockWeek);
	const plays = useDesk((s) => s.plays) ?? [];
	const runPhase = useDesk((s) => s.runPhase);
	const journal = useDesk((s) => s.journal) ?? [];
	const rows = gradeTickets(allTickets(locked), box);
	const cal = calibrate(rows);
	const closed = rows.filter((t) => t.week < 3);
	const lockNote = journal.find((e) => e.type === "locked" || e.note.startsWith("LOCK_REFUSED"))?.note;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "The loop"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "SyndicateSports does not treat any single signal as a win. It combines market behavior, conditions, officiating, and a probability model into a bet, a lean, or a pass, then checks where that decision held or failed. Weights move only when the posterior clears the prior. CLV here is versus the open, not a kickoff close. Two graded weeks. No proven edge."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "CLV posterior",
						value: formatSigned(priors.clvPost.mean),
						hint: `vs open · 80% [${formatSigned(priors.clvPost.q10)}, ${formatSigned(priors.clvPost.q90)}]`,
						profit: priors.clvPost.mean > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Brier",
						value: cal.brier.toFixed(3),
						hint: "sharpness"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "ATS",
						value: `${cal.hits}–${cal.losses}`,
						hint: `${formatPct(cal.hitRate)} vs ${formatPct(cal.exp)} priced`,
						profit: cal.hitRate >= cal.exp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Graded",
						value: String(cal.n),
						hint: box ? "scoreboard · prop and parlay excluded" : "archive · not settled this session"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBand, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettlementPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewBoard, {
				rows,
				priors
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Versioned assumptions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "What this model run is allowed to do. Weights stay 1.00x until the sample is large enough to move them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Version"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ASSUMPTIONS.version })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Min EV"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [ASSUMPTIONS.minEv * 100, "%"] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Card cap"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [ASSUMPTIONS.maxCardSides, " sides"] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Mean shift"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ASSUMPTIONS.meanShift })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Bankroll cap"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [ASSUMPTIONS.bankrollCap * 100, "%"] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted-foreground",
								children: "Default paths"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: ASSUMPTIONS.defaultSims.toLocaleString() })] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-medium",
						children: ["Model card · ", MODEL_CARD.version]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm leading-relaxed text-muted-foreground",
						children: ["Edge: ", MODEL_CARD.edge]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
								title: "Inputs",
								items: [...MODEL_CARD.inputs]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
								title: "Exclusions",
								items: [...MODEL_CARD.exclusions]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
								title: "Simulation",
								items: [...MODEL_CARD.simulation]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
								title: "Sizing",
								items: [...MODEL_CARD.sizing]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Known failure modes",
							items: [...MODEL_CARD.failures]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xs text-muted-foreground",
						children: [
							"Drawdown on closed card ",
							formatSigned(maxDrawdown(closed)),
							"u ·",
							" ",
							segmentBook(closed).map((s) => `${s.kind} ${s.n}`).join(" · "),
							" ",
							"·",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/gates",
								className: "underline",
								children: "Launch gates"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Reliability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "When we said 60%, did it hit 60%? Thin buckets barely move the needle."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: (priors.reliability ?? []).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-2 font-mono text-xs tabular-nums text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								formatPct(b.lo),
								"–",
								formatPct(b.hi),
								" · n=",
								b.n
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"model ",
								formatPct(b.exp),
								" · hit ",
								formatPct(b.hit)
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5 h-2 rounded-full bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "absolute top-0 h-2 rounded-full bg-foreground/35",
								style: { width: `${Math.min(100, b.exp * 100)}%` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "absolute top-[-2px] h-3 w-0.5 bg-foreground",
								style: { left: `${Math.min(100, b.hit * 100)}%` }
							})]
						})] }, `${b.lo}-${b.hi}`))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Bayesian update"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: [
							"Prior Beta(μ₀·10, (1−μ₀)·10). Posterior after weeks ",
							priors.fromWeek,
							"–",
							priors.toWeek,
							". The multiplier is what the next slate actually uses. Bars are 80% credible."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: [
							"rlm",
							"steam",
							"tnf",
							"public-fade",
							"whistle-over",
							"chaos",
							"wind",
							"all"
						].map((tag) => {
							const p = priors.posts[tag];
							if (!p) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: tag
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs tabular-nums text-muted-foreground",
									children: [
										p.hits,
										"/",
										p.n,
										" raw ",
										formatPct(p.raw),
										" → post ",
										formatPct(p.mean),
										" · ",
										p.mult.toFixed(2),
										"×"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CiBar, {
								lo: p.q10,
								hi: p.q90,
								mean: p.mean,
								prior: p.priorMean
							})] }, tag);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "uppercase tracking-wider text-muted-foreground",
							children: "CLV μ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: cn("mt-1", priors.clvPost.mean > 0 ? "text-profit" : ""),
							children: [
								formatSigned(priors.clvPost.mean),
								" [",
								formatSigned(priors.clvPost.q10),
								", ",
								formatSigned(priors.clvPost.q90),
								"]"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "uppercase tracking-wider text-muted-foreground",
							children: "P(beat prior)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1",
							children: priors.posts.all ? formatPct(priors.posts.all.pBeat) : "—"
						})] })]
					}),
					priors.missPost.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: "Miss modes (Dirichlet)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1.5",
							children: priors.missPost.slice(0, 5).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: m.reason
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs tabular-nums",
									children: [
										formatPct(m.mean),
										" · n=",
										m.count
									]
								})]
							}, m.reason))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-1.5 text-sm text-muted-foreground",
						children: priors.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n }, n))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Engine multipliers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Haircuts the next run actually eats."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-3 grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4",
						children: Object.entries(priors.haircuts).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "uppercase tracking-wider text-muted-foreground",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
							className: cn("mt-1", v < 1 ? "text-warn" : v > 1 ? "text-profit" : ""),
							children: [v.toFixed(2), "×"]
						})] }, k))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Where we were off"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-xl border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[32rem] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Tag"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "n"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Hit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Expected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Edge"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Post"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: cal.tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: t.tag
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular-nums",
									children: t.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 font-mono tabular-nums",
									children: [
										t.hits,
										"/",
										t.n
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular-nums",
									children: formatPct(t.exp)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-3 py-2 font-mono tabular-nums", t.edge >= 0 ? "text-profit" : "text-loss"),
									children: formatSigned(t.edge * 100)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 font-mono tabular-nums text-muted-foreground",
									children: priors.posts[t.tag] ? formatPct(priors.posts[t.tag].mean) : "—"
								})
							]
						}, t.tag)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-medium",
							children: [
								"Week ",
								3,
								" card"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Lock only the live-book sides and totals on this card. Props and model parlays are not recommendations. The stamp has to land before each ticket’s sheet kickoff. Grades and a settlement source are Gate 3, not this lock."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => lockWeek(),
							disabled: plays.length === 0,
							variant: "secondary",
							children: runPhase === "locked" ? "Relock refused" : `Lock this week (${plays.length})`
						})]
					}),
					lockNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: lockNote
					}) : null,
					plays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No live-book recommendation is on the card, so there is nothing to lock."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: plays.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm",
								children: [t.selection, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-muted-foreground",
									children: t.market
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs tabular-nums text-muted-foreground",
								children: [
									t.audit?.integrity ?? "open",
									" · ",
									formatPct(t.modelP),
									" · EV ",
									formatSigned(t.ev * 100),
									"%"
								]
							})]
						}, t.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted-foreground",
				children: [
					"Closed archive ",
					closed.length,
					" tickets · ",
					cal.byWeek.map((w) => `W${w.week} ${w.hits}/${w.n}`).join(" · "),
					" ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/agents",
						className: "underline",
						children: "Agents"
					})
				]
			})
		]
	});
}
function Block({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
	})] });
}
function CiBar({ lo, hi, mean, prior }) {
	const pct = (x) => `${Math.min(100, Math.max(0, x * 100))}%`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-1.5 h-2 rounded-full bg-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
				className: "absolute top-0 h-2 rounded-full bg-foreground/40",
				style: {
					left: pct(lo),
					width: pct(hi - lo)
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
				className: "absolute top-[-2px] h-3 w-0.5 bg-foreground",
				style: { left: pct(mean) }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
				className: "absolute top-[-2px] h-3 w-px bg-warn",
				style: { left: pct(prior) }
			})
		]
	});
}
function Kpi({ label, value, hint, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 font-mono text-2xl tabular-nums leading-none", profit ? "text-profit" : ""),
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
export { LearnPage as component };
