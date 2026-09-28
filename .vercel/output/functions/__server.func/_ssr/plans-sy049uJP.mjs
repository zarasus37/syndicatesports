import { i as __toESM } from "../_runtime.mjs";
import { ht as cn } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Input } from "./input-fLVTAcn_.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { n as gateTally, r as useLaunchGates, t as PILOT_CRITERIA } from "./launch-gates-CJgyEUZf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-sy049uJP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLANS = {
	monthly: {
		id: "monthly",
		name: "Monthly",
		price: 79,
		cadence: "month",
		blurb: "In-season card. Cancel any Monday. Win totals and futures are on the season plan."
	},
	season: {
		id: "season",
		name: "Season",
		price: 399,
		cadence: "season",
		blurb: "The card through preseason week 1, plus win totals, futures, and offseason prior updates."
	}
};
var INCLUDED = [
	"The card: live-book sides and totals that clear the hurdle, sized in units. Props and model parlays are not recommendations",
	"This week’s plays and the unit size we would actually bet",
	"SU board: a straight-up winner on all 16 games, graded separately from the card",
	"The desk: line movement, steam/RLM, handle vs tickets, referees, weather, half-Kelly",
	"NFL founding rate for as long as the subscription stays active"
];
var SEASON_EXTRA = [
	"Win totals and futures when those markets open — our number versus the board, with size",
	"Public prior updates after coordinator changes, the draft, and camp — how the Week 1 number moved",
	"Access through preseason week 1. The next regular season is a new term"
];
var NEVER = [
	"Lock-of-the-week marketing or a tout record presented as ATS",
	"One-click betting or sending a wager to a sportsbook",
	"Deleted losses. The public record stays complete",
	"A card charge, a deposit, or a paid entitlement before the launch gates pass",
	"Other sports bundled into the NFL founding rate. Those are separate products"
];
var ROADMAP = [
	{
		id: "pilot",
		title: "Research pilot",
		when: "Now",
		current: true,
		body: "50 pilot research seats. A request reserves no access and creates no charge. Billing waits on Gates 1–7. Gate 8 is ongoing feedback, not a finish line."
	},
	{
		id: "beta",
		title: "Public beta",
		when: "Now",
		current: true,
		body: "The model is live and updates as weeks grade. Card, props, parlays, and units — paper only, seeded sheet."
	},
	{
		id: "founding",
		title: "Founding rate (not charged)",
		when: "After gates 1–7",
		current: false,
		body: "Target only: $79 / month in season, $399 through preseason week 1. Not active. Not reserved by the waitlist. Holds only if we later bill and the subscription stays active."
	},
	{
		id: "book",
		title: "Longer record",
		when: "Next",
		current: false,
		body: "As more Sundays grade, the published price increases for new subscribers. Founding rates do not change."
	},
	{
		id: "close",
		title: "Live close",
		when: "After",
		current: false,
		body: "CLV versus the kickoff number, not only the open. A further step in the public price. Founding rates stay put."
	},
	{
		id: "offseason",
		title: "Offseason markets",
		when: "Post–Super Bowl",
		current: false,
		body: "Win totals, futures, and prior updates. Included on season. Monthly is inactive until the next regular season."
	},
	{
		id: "sports",
		title: "Additional sports",
		when: "Later",
		current: false,
		body: "Same method, new slates, after the NFL product meets the standard. Founding members get early access and a founding rate on that product — not a free add-on."
	}
];
var WAITLIST_KEY = "syndicate.waitlist.v1";
function loadWaitlist() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(WAITLIST_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed?.email || parsed.plan !== "monthly" && parsed.plan !== "season") return null;
		return {
			...parsed,
			attest21: true,
			pilot: true
		};
	} catch {
		return null;
	}
}
function saveWaitlist(entry) {
	try {
		localStorage.setItem(WAITLIST_KEY, JSON.stringify(entry));
	} catch {}
}
function formatPrice(n) {
	return `$${n}`;
}
function PlansPage() {
	const gates = useLaunchGates();
	const tally = gateTally(gates);
	const [plan, setPlan] = (0, import_react.useState)("season");
	const [email, setEmail] = (0, import_react.useState)("");
	const [joined, setJoined] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const selected = PLANS[plan];
	(0, import_react.useEffect)(() => {
		setJoined(loadWaitlist());
	}, []);
	function submit(e) {
		e.preventDefault();
		const next = email.trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
			setError("That email doesn’t look live.");
			return;
		}
		const entry = {
			email: next,
			plan,
			at: Date.now(),
			attest21: true,
			pilot: true
		};
		saveWaitlist(entry);
		setJoined(entry);
		setError(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "SyndicateSports · 2026"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl font-medium tracking-tight text-balance sm:text-4xl",
							children: "Founding pilot pricing is not active."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "warn",
							children: "Not a checkout"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground",
						children: "$79 monthly and $399 seasonal are target rates for a future launch only after the data, audit, and validation gates are satisfied. Joining the waitlist reserves no product access, creates no charge, and makes no performance claim."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: [
							"Paid launch requires Gates 1–7 (",
							tally.requiredPass,
							"/",
							tally.requiredN,
							" pass). Gate 8 is continuing.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/gates",
								className: "underline",
								children: "See the gates"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 sm:grid-cols-2",
				children: Object.keys(PLANS).map((id) => {
					const p = PLANS[id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPlan(id),
						className: cn("rounded-xl border p-4 text-left transition-colors", plan === id ? "border-foreground bg-card" : "border-border bg-card hover:border-foreground/40"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
									children: p.name
								}), id === "season" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "target"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									children: "target"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 font-mono text-2xl tabular-nums leading-none",
								children: [formatPrice(p.price), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted-foreground",
									children: ["/", p.cadence]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted-foreground",
								children: p.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 font-mono text-xs text-muted-foreground",
								children: "Target rate · not active · not reserved"
							})
						]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: "These figures are targets, not an offer. Monthly is the in-season card. Season runs through preseason week 1, then win totals and futures, if we ever bill. Eleven months of the monthly target is $869 and still excludes the spring markets. Neither number is for sale."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-medium",
						children: [50, " pilot research seats"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground",
						children: [
							"Research recruitment, not a commercial funnel. ",
							formatPrice(selected.price),
							"/",
							selected.cadence,
							" is a target you may note an interest in. It does not reserve the rate, the product, or a seat count."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 max-w-xl list-disc space-y-1 pl-4 text-sm text-muted-foreground",
						children: PILOT_CRITERIA.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
					}),
					joined ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: "noted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2",
							children: [
								joined.email,
								" · interest in ",
								PLANS[joined.plan].name,
								" target ",
								formatPrice(PLANS[joined.plan].price),
								". No access reserved. No charge."
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "wait-email",
									className: "sr-only",
									children: "Email"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "wait-email",
									type: "email",
									autoComplete: "email",
									placeholder: "you@email.com",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									required: true
								}),
								error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-loss",
									children: error
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "21+ confirmation. This form does not take a card, a deposit, or a promise of profit."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "min-h-11 shrink-0",
							children: "Note interest"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Included"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground",
					children: [INCLUDED.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line)), SEASON_EXTRA.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: "Season · "
					}), line] }, line))]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Not included"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground",
					children: NEVER.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Roadmap"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid gap-2 sm:grid-cols-2",
					children: ROADMAP.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-xl border px-4 py-3", step.current ? "border-foreground bg-card" : "border-border bg-card"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: [
									String(i + 1).padStart(2, "0"),
									" · ",
									step.when
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-medium",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted-foreground",
								children: step.body
							})
						]
					}, step.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"We do not place wagers. 21+. If gambling is a problem, call 1-800-GAMBLER.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/legal",
						className: "underline",
						children: "Terms"
					}),
					"."
				]
			})
		]
	});
}
//#endregion
export { PlansPage as component };
