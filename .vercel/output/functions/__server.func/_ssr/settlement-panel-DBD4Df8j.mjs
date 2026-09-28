import { n as SETTLEMENT_RULES, p as gradeTickets, t as ARCHIVE } from "./box-CrH4BFCf.mjs";
import { j as evidenceCopy, lt as useDesk, v as allTickets } from "./store-ZvOPCZJK.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settlement-panel-DBD4Df8j.js
var import_jsx_runtime = require_jsx_runtime();
function EvidenceBand() {
	const e = evidenceCopy();
	const box = useDesk((s) => s.box);
	const locked = useDesk((s) => s.locked) ?? [];
	const n = (box ? gradeTickets(allTickets(locked), box) : []).filter((t) => t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-4 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-sm font-medium",
			children: "Evidence status"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-3 grid gap-3 text-sm sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Tracked sample"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 text-muted-foreground",
					children: box ? `${n} scoreboard grades · props and parlays excluded` : `${e.sample} · archive, not a scoreboard grade`
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Maturity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 text-muted-foreground",
					children: e.maturity
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Primary validation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 text-muted-foreground",
					children: box ? "ESPN final, overtime included. Not a kickoff close." : e.validation
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Units"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 text-muted-foreground",
					children: e.units
				})] })
			]
		})]
	});
}
function SettlementPanel() {
	const box = useDesk((s) => s.box);
	const loading = useDesk((s) => s.boxLoading);
	const loadBox = useDesk((s) => s.loadBox);
	const grades = gradeTickets(ARCHIVE, box);
	const sides = grades.filter((t) => t.week < 3 && (t.kind === "spread" || t.kind === "total"));
	const graded = sides.filter((t) => t.settlementSource && (t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push" || t.boxResult === "void"));
	const uncovered = grades.filter((t) => t.boxResult === "uncovered");
	const disagree = sides.filter((t) => t.agrees === false);
	const week3 = box?.games.filter((g) => g.week === 3) ?? [];
	const finals = week3.filter((g) => g.status === "final").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Box score"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: box ? `${box.source} · ${box.fetchedAt}. Public scoreboard, not an official league feed and not a close.` : loading ? "Asking the scoreboard." : "No scoreboard yet. The archive is not a settlement."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					disabled: loading,
					onClick: () => loadBox(true),
					children: loading ? "Checking" : "Check the scoreboard"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted-foreground",
				children: SETTLEMENT_RULES
			}),
			box?.errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-warn",
				children: [box.errors.join(" · "), ". No grade was invented."]
			}) : null,
			box && !box.errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm leading-relaxed",
				children: [
					graded.length,
					" of ",
					sides.length,
					" closed sides and totals graded.",
					disagree.length ? ` ${disagree.length} disagreed with the archive. The scoreboard is the grade.` : " None disagreed with the archive.",
					" ",
					uncovered.length,
					" prop and parlay rows are not grades. Week ",
					3,
					": ",
					finals,
					" final, ",
					week3.length - finals,
					" not final. This check does not move a weight."
				]
			}) : null,
			disagree.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 text-sm text-warn",
				children: disagree.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					t.side,
					" · archive ",
					t.recorded,
					" · scoreboard ",
					t.boxResult,
					" · ",
					t.score
				] }, t.id))
			}) : null
		]
	});
}
//#endregion
export { SettlementPanel as n, EvidenceBand as t };
