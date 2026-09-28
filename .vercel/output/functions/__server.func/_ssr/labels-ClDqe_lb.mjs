import { ht as cn } from "./store-ZvOPCZJK.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/labels-ClDqe_lb.js
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition-colors data-[state=checked]:bg-primary", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-4 translate-x-1 rounded-full bg-foreground transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground" })
	});
}
function matchup(game) {
	return `${game.away} @ ${game.home}`;
}
function pickLabel(_game, pick) {
	return pick.side;
}
//#endregion
export { matchup as n, pickLabel as r, Switch as t };
