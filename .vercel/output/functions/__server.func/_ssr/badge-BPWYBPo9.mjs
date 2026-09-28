import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { ht as cn } from "./store-ZvOPCZJK.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-BPWYBPo9.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-xs font-medium uppercase tracking-wider", {
	variants: { variant: {
		default: "bg-muted text-muted-foreground",
		profit: "bg-profit/15 text-profit",
		loss: "bg-loss/15 text-loss",
		warn: "bg-warn/15 text-warn",
		outline: "border border-border text-muted-foreground",
		solid: "bg-foreground text-background",
		positive: "bg-profit/15 text-profit",
		negative: "bg-loss/15 text-loss"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
