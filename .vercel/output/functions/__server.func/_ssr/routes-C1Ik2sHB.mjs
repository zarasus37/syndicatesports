import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C1Ik2sHB.js
var import_jsx_runtime = require_jsx_runtime();
function Cover() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[calc(100dvh-8rem)] flex-col justify-center gap-10 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "SyndicateSports Pilot · 2026 NFL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block sm:inline",
							children: "Syndicate"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block sm:inline",
							children: "Sports"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground",
						children: "Every take. Including the misses."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground",
						children: "SyndicateSports does not treat any single signal as a win. It combines market behavior, conditions, officiating, and a probability model into a bet, a lean, or a pass — then reviews which assumptions held, which broke, and whether a weight actually moved. Pilot. No charge. No proven edge. 21+."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/record",
							children: "The card"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/slate",
							children: "The desk"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/gates",
							children: "Launch gates"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid max-w-3xl gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: "The card"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: "Sides and totals only when a book posts the price. Props and parlays stay off the card until then. Losses remain public."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: "SU board"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: "Straight-up winner on all 16 games. Graded separately from the card."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: "Pilot"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: "Founding pilot pricing is not active. $79 and $399 are target rates only, after Gates 1–7. No charge. No proven edge."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"If gambling is a problem, call 1-800-GAMBLER.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "Pilot"
					})
				]
			})
		]
	});
}
//#endregion
export { Cover as component };
