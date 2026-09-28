import { ht as cn } from "./store-ZvOPCZJK.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { n as gateTally, r as useLaunchGates } from "./launch-gates-CJgyEUZf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gates-Cm43nOXU.js
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	pass: "profit",
	partial: "warn",
	fail: "outline"
};
function GatesPage() {
	const gates = useLaunchGates();
	const t = gateTally(gates);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Minimum launch gate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Paid stays closed."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Paid launch requires Gates 1–7 passed. Gate 8 stays a measured, continuing requirement — pilot feedback is an input into billing, not a box that has to stay checked forever. ",
							t.requiredPass,
							" of",
							" ",
							t.requiredN,
							" required gates pass. Founding rates are targets only. They are not active."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-3",
				children: gates.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: [
									"Gate ",
									g.n,
									g.blocksPaid ? " · required to bill" : " · continuing"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-sm font-medium",
								children: g.title
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: TONE[g.status],
								children: g.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted-foreground",
							children: g.must
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("mt-2 text-sm leading-relaxed", g.status === "fail" ? "text-warn" : "text-foreground"),
							children: ["Now: ", g.now]
						})
					]
				}, g.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plans",
						className: "underline",
						children: "Request a pilot seat"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/learn",
						className: "underline",
						children: "Model card"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/legal",
						className: "underline",
						children: "Terms"
					})
				]
			})
		]
	});
}
//#endregion
export { GatesPage as component };
