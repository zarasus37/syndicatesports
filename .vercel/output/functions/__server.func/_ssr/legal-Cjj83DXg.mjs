import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as loadAgeOk, i as useClientReady, o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { a as loadSupport, c as readDeviceRecord, i as eraseDeviceRecord, l as saveSupport, n as attemptCharge, o as perimeterControls, r as entitlement, t as DEVICE_KEYS, u as useCurrentUserState } from "./perimeter-DRL4LgBH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/legal-Cjj83DXg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LegalPage() {
	const ready = useClientReady();
	const { user, isPending } = useCurrentUserState();
	const ageOk = ready && loadAgeOk();
	const signedInIdentity = ready && !isPending && Boolean(user) && !user?.isDevFallback;
	const controls = perimeterControls({
		ageOk,
		signedInIdentity
	});
	const access = entitlement();
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [charge, setCharge] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (ready) setNotes(loadSupport());
	}, [ready]);
	function onSupport(e) {
		e.preventDefault();
		setNotes(saveSupport(draft));
		setDraft("");
	}
	function downloadRecord() {
		const blob = new Blob([JSON.stringify({
			at: (/* @__PURE__ */ new Date()).toISOString(),
			record: readDeviceRecord(),
			note: "Device record. Not an account."
		}, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "syndicate-device-record.json";
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "Perimeter"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: "Terms, privacy, and what is enforced."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Paper tickets. 21+. Nothing here is a sportsbook or a promise of profit. Gate 7 stays partial until there is a real identity and a support note that actually leaves this device."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "space-y-2",
				children: controls.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: c.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: c.status === "pass" ? "profit" : "warn",
							children: c.status
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm leading-relaxed text-muted-foreground",
						children: c.detail
					})]
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Terms"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "max-w-2xl space-y-2 text-sm leading-relaxed text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "SyndicateSports publishes a card and a straight-up board. We do not accept, transmit, or settle wagers." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A recommendation is a live book price with a time. A seeded number is not a recommendation. Props and model parlays are not on the card." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "A lock counts only before that ticket’s sheet kickoff. A later relock, void, or clear is refused." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Sides and totals settle from the ESPN scoreboard. Props and parlays do not." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "We do not charge. A waitlist note reserves no access. The $79 and $399 figures are targets, not an offer." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "You must be 21 or older. There is no account on this desk." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Privacy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "These keys stay in this browser. They are not sold and they are not sent with a charge. Age confirmation is the string “21”. Do not enter a password or a card number. Delete removes the list."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "font-mono text-xs text-muted-foreground",
						children: DEVICE_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: key }, key))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Billing and entitlement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm text-muted-foreground",
						children: [
							"Paid access: ",
							access.paid ? "open" : "none",
							". ",
							access.reason
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => {
							const refused = attemptCharge();
							setCharge(refused.ok ? "A charge went through." : "Refused. No card was taken. Nothing was stored.");
						},
						children: "Run the billing check"
					}),
					charge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: charge
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Device controls"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm text-muted-foreground",
						children: "Export and delete apply to this browser only. They do not create or close an account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: downloadRecord,
							children: "Export this device record"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => {
								eraseDeviceRecord();
								window.location.reload();
							},
							children: "Delete this device record"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Support"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-2xl text-sm text-muted-foreground",
						children: [
							"This note stays on the device. It is not emailed and no one is staffed to read it. If gambling is a problem, call 1-800-GAMBLER or visit",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "underline",
								href: "https://www.ncpgambling.org/",
								rel: "noreferrer",
								children: "ncpgambling.org"
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: onSupport,
						className: "max-w-xl space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "support-note",
								className: "sr-only",
								children: "Support note"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "support-note",
								value: draft,
								onChange: (e) => setDraft(e.target.value),
								maxLength: 500,
								rows: 3,
								placeholder: "Kept here. Not sent.",
								className: "w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "secondary",
								disabled: !draft.trim(),
								children: "Keep the note on this device"
							})
						]
					}),
					notes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1 text-sm text-muted-foreground",
						children: notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							new Date(n.at).toLocaleString(),
							" · not sent · ",
							n.note
						] }, n.at))
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/gates",
						className: "underline",
						children: "Launch gates"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plans",
						className: "underline",
						children: "Pilot"
					})
				]
			})
		]
	});
}
//#endregion
export { LegalPage as component };
