import { i as __toESM } from "../_runtime.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { X as portfolioOf, a as DESK_ENV, bt as formatUnits, g as PRODUCTION, h as PHASE_COPY, ht as cn, lt as useDesk, p as MODEL_VERSION, r as DATA_SOURCE } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Slot } from "../_libs/@radix-ui/react-popper+[...].mjs";
import { a as ListChecks, f as Activity, i as ShieldCheck, l as ChartLine, n as UserRound, o as LayoutGrid, r as TriangleAlert, s as Layers, t as Workflow, u as BookOpen } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Dwgvlcnc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function TooltipProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration: 200,
		children
	});
}
function DeskRuntime() {
	const hydrate = useDesk((s) => s.hydrate);
	const hydrated = useDesk((s) => s.hydrated);
	const running = useDesk((s) => s.running);
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const run = useDesk((s) => s.run);
	const loadBox = useDesk((s) => s.loadBox);
	const refreshTape = useDesk((s) => s.refreshTape);
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	(0, import_react.useEffect)(() => {
		if (!hydrated || lastRunAt || running) return;
		run();
	}, [
		hydrated,
		lastRunAt,
		running,
		run
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		loadBox();
	}, [hydrated, loadBox]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const pull = () => {
			if (document.visibilityState === "hidden") return;
			refreshTape();
		};
		pull();
		const id = window.setInterval(pull, 18e4);
		return () => window.clearInterval(id);
	}, [hydrated, refreshTape]);
	return null;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-secondary text-secondary-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "hover:bg-muted text-foreground",
			outline: "shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] bg-transparent",
			accent: "bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.98]"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 px-3 text-xs",
			lg: "h-11 px-5",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var AGE_KEY = "syndicate.age.v1";
function loadAgeOk() {
	if (typeof localStorage === "undefined") return false;
	try {
		return localStorage.getItem(AGE_KEY) === "21";
	} catch {
		return false;
	}
}
function saveAgeOk() {
	try {
		localStorage.setItem(AGE_KEY, "21");
	} catch {}
}
function AgeGate() {
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOpen(!loadAgeOk());
	}, []);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border bg-card p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
					children: "Age gate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 text-xl font-medium tracking-tight",
					children: "21+ research desk."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: "SyndicateSports publishes a paper betting card. We do not place wagers. Confirm you are 21 or older to enter. If gambling is a problem, call 1-800-GAMBLER."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "min-h-11",
						onClick: () => {
							saveAgeOk();
							setOpen(false);
						},
						children: "I am 21 or older"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						className: "min-h-11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.ncpgambling.org/",
							rel: "noreferrer",
							children: "Get help"
						})
					})]
				})
			]
		})
	});
}
function CardRail() {
	const plays = useDesk((s) => s.plays) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
	const runId = useDesk((s) => s.runId);
	if (!lastRunAt) return null;
	const port = portfolioOf(plays);
	const n = plays.length;
	const gameLabel = port.maxGame ? `${port.maxGame.gameId.toUpperCase()} ${port.maxGame.units.toFixed(2)}u` : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-card/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-foreground",
					children: ["Paper card · ", n]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-3",
					children: ["Gross ", formatUnits(port.gross)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-3",
					children: ["Corr-adj ", formatUnits(port.corrAdj)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-3",
					children: ["Game ", gameLabel]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-3",
					children: [
						"Cap ",
						6 .toFixed(1),
						"u/game"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: port.over ? "ml-3 text-warn" : "ml-3",
					children: port.over ? "Over concentration" : "Within cap"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex flex-wrap gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["model ", MODEL_VERSION] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["data ", dataMode] }),
					runId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: runId
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/book",
						className: "text-foreground hover:underline",
						children: "Book"
					})
				]
			})]
		})
	});
}
/** Avoid painting IDLE from SSR before the shared run hydrates. */
function useClientReady() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useDesk.getState().hydrate();
		if (!useDesk.getState().lastRunAt && !useDesk.getState().running) useDesk.getState().run();
		setReady(true);
	}, []);
	return ready;
}
function StatusBar() {
	const ready = useClientReady();
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const phase = useDesk((s) => s.runPhase) ?? "idle";
	const runId = useDesk((s) => s.runId);
	const sheetId = useDesk((s) => s.sheetId) ?? "seeded-week-3-v1";
	const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
	const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
	const asOf = lastRunAt ? new Date(lastRunAt).toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit"
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-border bg-muted/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-warn",
					children: DESK_ENV
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: dataMode }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: oddsBooks.length >= 2 ? `odds ${oddsBooks.length} books` : oddsBooks.length === 1 ? "odds 1 book" : "odds not live" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: oddsBooks.length ? oddsBooks.join(" · ") : `feeds ${PRODUCTION}` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["model ", MODEL_VERSION] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: !ready ? "…" : lastRunAt ? PHASE_COPY[phase] : "idle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["sheet ", sheetId] }),
				ready && runId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: runId
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: !ready ? "loading run" : asOf ? `priced ${asOf}` : "no run" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden md:inline",
					children: oddsBooks.length ? "sheet open is not the book open" : `data ${DATA_SOURCE}`
				})
			]
		})
	});
}
var NAV = [
	{
		to: "/record",
		label: "Record",
		icon: ListChecks
	},
	{
		to: "/slate",
		label: "Slate",
		icon: LayoutGrid
	},
	{
		to: "/book",
		label: "Book",
		icon: BookOpen
	},
	{
		to: "/parlay",
		label: "Parlays",
		icon: Layers
	},
	{
		to: "/props",
		label: "Props",
		icon: UserRound,
		hideOnMobile: true
	},
	{
		to: "/agents",
		label: "Agents",
		icon: Workflow
	},
	{
		to: "/learn",
		label: "Review",
		icon: ChartLine
	},
	{
		to: "/gates",
		label: "Gates",
		icon: ShieldCheck,
		hideOnMobile: true
	}
];
function isDeskPath(pathname) {
	return pathname !== "/" && pathname !== "/plans" && pathname !== "/legal" && pathname !== "/gates";
}
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const desk = isDeskPath(pathname);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "desk-grid min-h-dvh bg-background text-foreground",
		children: [
			desk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskRuntime, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-11 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-8 items-center justify-center rounded-md bg-foreground text-background",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
										className: "size-4",
										strokeWidth: 1.75
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "leading-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-medium tracking-tight",
										children: "SyndicateSports"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-mono text-xs uppercase tracking-widest text-muted-foreground",
										children: "Week 03 · 2026"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/plans",
								className: "font-mono text-xs uppercase tracking-wider text-warn hover:underline",
								children: "Pilot"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "hidden items-center gap-1 md:flex",
							children: NAV.map((item) => {
								const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("inline-flex h-10 min-h-10 items-center gap-2 rounded-md px-2.5 text-sm transition-colors lg:px-3", active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
										className: "size-4",
										strokeWidth: 1.75
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden lg:inline",
										children: item.label
									})]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/plans",
							className: cn("hidden min-h-10 items-center font-mono text-xs text-muted-foreground md:inline-flex", pathname.startsWith("/plans") ? "text-foreground" : "hover:text-foreground"),
							children: "Plans"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgeGate, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBar, {}),
			desk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardRail, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				className: "mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-12",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mx-auto hidden w-full max-w-6xl gap-4 px-4 pb-8 pt-2 font-mono text-xs text-muted-foreground md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/gates",
						className: "hover:text-foreground",
						children: "Launch gates"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/legal",
						className: "hover:text-foreground",
						children: "Terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plans",
						className: "hover:text-foreground",
						children: "Pilot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "21+ · 1-800-GAMBLER" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-6",
					children: NAV.filter((item) => !("hideOnMobile" in item && item.hideOnMobile)).map((item) => {
						const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs", active ? "text-foreground" : "text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "size-4",
								strokeWidth: 1.75
							}), item.label]
						}) }, item.to);
					})
				})
			})
		]
	});
}
var styles_default = "/assets/styles-FBKNr0xf.css";
var APP_NAME = "SyndicateSports";
var Route$12 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b0c0e"
			},
			{
				name: "description",
				content: "SyndicateSports Pilot — closed research preview. No subscription charge, no claim of a proven edge. 21+."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-background text-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$11 = () => import("./routes-C1Ik2sHB.mjs");
var Route$11 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./agents-DEBC6kWT.mjs");
var Route$10 = createFileRoute("/agents")({
	validateSearch: (raw) => {
		const s = {};
		if (typeof raw.game === "string" && raw.game) s.game = raw.game;
		if (typeof raw.agent === "string" && raw.agent) s.agent = raw.agent;
		return s;
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./book-Gp5X5wzZ.mjs");
var Route$9 = createFileRoute("/book")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./gates-Cm43nOXU.mjs");
var Route$8 = createFileRoute("/gates")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./learn-vW9WRlqW.mjs");
var Route$7 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./legal-Cjj83DXg.mjs");
var Route$6 = createFileRoute("/legal")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./parlay-DMlTbEY3.mjs");
var Route$5 = createFileRoute("/parlay")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./plans-sy049uJP.mjs");
var Route$4 = createFileRoute("/plans")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./props-Ct4WpY-x.mjs");
var Route$3 = createFileRoute("/props")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./record-CP031Uds.mjs");
var Route$2 = createFileRoute("/record")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./slate-C4WfbDV0.mjs");
var Route$1 = createFileRoute("/slate")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./game._gameId-CmQYU-sr.mjs");
var Route = createFileRoute("/game/$gameId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	AgentsRoute: Route$10.update({
		id: "/agents",
		path: "/agents",
		getParentRoute: () => Route$12
	}),
	BookRoute: Route$9.update({
		id: "/book",
		path: "/book",
		getParentRoute: () => Route$12
	}),
	GatesRoute: Route$8.update({
		id: "/gates",
		path: "/gates",
		getParentRoute: () => Route$12
	}),
	LearnRoute: Route$7.update({
		id: "/learn",
		path: "/learn",
		getParentRoute: () => Route$12
	}),
	LegalRoute: Route$6.update({
		id: "/legal",
		path: "/legal",
		getParentRoute: () => Route$12
	}),
	ParlayRoute: Route$5.update({
		id: "/parlay",
		path: "/parlay",
		getParentRoute: () => Route$12
	}),
	PlansRoute: Route$4.update({
		id: "/plans",
		path: "/plans",
		getParentRoute: () => Route$12
	}),
	PropsRoute: Route$3.update({
		id: "/props",
		path: "/props",
		getParentRoute: () => Route$12
	}),
	RecordRoute: Route$2.update({
		id: "/record",
		path: "/record",
		getParentRoute: () => Route$12
	}),
	SlateRoute: Route$1.update({
		id: "/slate",
		path: "/slate",
		getParentRoute: () => Route$12
	}),
	GameGameIdRoute: Route.update({
		id: "/game/$gameId",
		path: "/game/$gameId",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { loadAgeOk as a, useClientReady as i, Route as n, Button as o, Route$10 as r, router_exports as t };
