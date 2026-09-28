import { gt as formatPct, lt as useDesk, mt as americanOdds, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parlay-DMlTbEY3.js
var import_jsx_runtime = require_jsx_runtime();
function ParlayPage() {
	const parlays = useDesk((s) => s.parlays) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
					children: "Same-game and 3-leg"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-medium tracking-tight",
					children: "Parlays"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
					children: "Model construction from the same paths. Not a posted book price, so not a recommendation and not on the paper card. Nothing here is sent to a sportsbook."
				})
			]
		}), !lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Run the slate to build the model tickets. They are still not recommendations."
		}) : parlays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Not enough plus-EV sides this cycle to print a 3-leg."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: parlays.map((t, i) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-mono text-xs text-muted-foreground",
								children: [
									t.kind === "sgp" ? "Same-game" : "Ticket",
									" ",
									String(i + 1).padStart(2, "0")
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-lg tabular-nums text-profit",
								children: [formatSigned(t.ev * 100), "% EV"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-sm",
									children: americanOdds(t.offeredAmerican)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-mono text-xs text-muted-foreground",
									children: ["fair ", americanOdds(t.fairAmerican)]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 space-y-2",
							children: t.legs.map((leg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/game/$gameId",
									params: { gameId: leg.gameId },
									className: "min-w-0 truncate hover:underline",
									children: [
										leg.label,
										" · ",
										leg.side
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs tabular-nums text-muted-foreground",
									children: [
										formatPct(leg.prob),
										" · ",
										americanOdds(leg.price)
									]
								})]
							}, `${leg.gameId}-${leg.side}`))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: ["joint ", formatPct(t.joint)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: t.jointMethod
								}),
								t.corrPenalty > .001 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									children: ["ρ −", formatPct(t.corrPenalty)]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "not a recommendation"
								})
							]
						})
					]
				}, t.id);
			})
		})]
	});
}
//#endregion
export { ParlayPage as component };
