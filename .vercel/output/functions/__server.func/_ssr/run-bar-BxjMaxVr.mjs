import { i as __toESM } from "../_runtime.mjs";
import { i as DEFAULT_SIMS, lt as useDesk, u as MAX_SIMS } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Switch } from "./labels-ClDqe_lb.mjs";
import { t as Input } from "./input-fLVTAcn_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/run-bar-BxjMaxVr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RunBar() {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const sims = useDesk((s) => s.sims) ?? 12e3;
	const chaos = useDesk((s) => s.chaos) ?? true;
	const running = useDesk((s) => s.running);
	const bankroll = useDesk((s) => s.bankroll) ?? 1e4;
	const setSims = useDesk((s) => s.setSims);
	const setChaos = useDesk((s) => s.setChaos);
	const setBankroll = useDesk((s) => s.setBankroll);
	const run = useDesk((s) => s.run);
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const runPhase = useDesk((s) => s.runPhase) ?? "idle";
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[4.5rem] items-center rounded-xl border border-border bg-card px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs text-muted-foreground",
			children: "Desk controls"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Paths"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-10 min-h-10 rounded-md border border-border bg-background px-2 font-mono text-sm",
						value: sims,
						onChange: (e) => setSims(Number(e.target.value)),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: DEFAULT_SIMS,
								children: DEFAULT_SIMS.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 25e3,
								children: "25,000"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: 5e4,
								children: "50,000"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: MAX_SIMS,
								children: MAX_SIMS.toLocaleString()
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex h-10 min-h-10 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Bankroll"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 100,
						step: 100,
						value: bankroll,
						onChange: (e) => setBankroll(Number(e.target.value) || 0),
						className: "h-10 w-28"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex h-10 min-h-10 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: chaos,
						onCheckedChange: setChaos,
						disabled: running
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Chaos engine" })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [lastRunAt && lastRunAt > 0xe8d4a51000 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "hidden font-mono text-xs text-muted-foreground sm:inline",
				children: [
					runPhase,
					" · ",
					new Date(lastRunAt).toLocaleTimeString()
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden font-mono text-xs text-muted-foreground sm:inline",
				children: runPhase
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => run(),
				disabled: running,
				className: "min-h-11 w-full sm:w-auto",
				children: running ? "Simulating…" : "Run slate"
			})]
		})]
	});
}
//#endregion
export { RunBar as t };
