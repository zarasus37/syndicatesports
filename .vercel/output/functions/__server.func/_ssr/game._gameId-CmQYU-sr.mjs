import { O as getGame } from "./box-CrH4BFCf.mjs";
import { n as team } from "./teams-BfaPpyvO.mjs";
import { C as bestTake, L as isPrime, O as conditionAdjustments, Q as refTone, S as analyzeSharp, Z as publicRead, c as MARKET_AS_OF, d as MEAN_SHIFT_FACTOR, et as sharpTone, f as MIN_EV, gt as formatPct, ht as cn, it as swingsFor, k as diffSnapshots, lt as useDesk, m as ODDS_SOURCE, p as MODEL_VERSION, q as paperStake, s as LEAGUE_FLAGS, vt as formatSigned, x as analyzeRef, yt as formatSpread } from "./store-ZvOPCZJK.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as Route, o as Button } from "./router-Dwgvlcnc.mjs";
import { r as pickLabel, t as Switch } from "./labels-ClDqe_lb.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { t as LineTape } from "./line-tape-BR1-CK5C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/game._gameId-CmQYU-sr.js
var import_jsx_runtime = require_jsx_runtime();
function MarginChart({ histogram, line, home }) {
	const max = Math.max(...histogram.map((h) => h.p), .001);
	const coverAt = -line;
	const first = histogram[0]?.bin ?? -40;
	const span = Math.max(1, histogram.length - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-end justify-between text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono",
				children: "Away win"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono",
				children: [home, " margin"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-36",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full items-end gap-px",
				children: histogram.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("min-w-0 flex-1 rounded-t-sm", h.bin > coverAt ? "bg-profit/75" : "bg-foreground/18"),
					style: { height: `${Math.max(4, h.p / max * 100)}%` },
					title: `${h.bin}: ${(h.p * 100).toFixed(1)}%`
				}, h.bin))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-0 h-full w-px bg-warn",
				style: { left: `${(coverAt - first) / span * 100}%` }
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "−40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Vegas ", line > 0 ? `+${line}` : line] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+40" })
			]
		})
	] });
}
function ConditionsPanel({ game }) {
	const adj = conditionAdjustments(game);
	const away = team(game.away);
	const home = team(game.home);
	const wx = game.weather;
	const outdoor = wx.roof === "open" || wx.roof === "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Conditions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					adj.slotLabel,
					". ",
					adj.crew.name,
					" on the crew. Overlay hits the mean and the props — market number is the base."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: isPrime(adj.slot) || adj.slot === "intl" ? "warn" : "outline",
						children: adj.slotLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: adj.crew.name
					}),
					outdoor && (wx.windMph ?? 0) >= 12 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "warn",
						children: [
							"wind ",
							wx.windMph,
							" mph"
						]
					}) : null,
					outdoor && (wx.tempF ?? 0) >= 86 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "warn",
						children: [wx.tempF, "°F"]
					}) : null,
					game.home === "DEN" && outdoor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "altitude"
					}) : null,
					adj.crew.dpi === "high" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "high DPI"
					}) : null,
					adj.crew.dpi === "low" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "lets them play"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 font-mono text-xs tabular-nums",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
						k: `${away.abbr} overlay`,
						v: formatSigned(adj.awayPts)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
						k: `${home.abbr} overlay`,
						v: formatSigned(adj.homePts)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
						k: "Vol",
						v: `${adj.volMult.toFixed(2)}×`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
						k: "Flags / g",
						v: adj.crew.flagsPerGame.toFixed(1)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1.5 text-sm text-muted-foreground",
				children: adj.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: n }, n))
			}),
			wx.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					wx.venue,
					" · ",
					wx.note
				]
			}) : null
		]
	});
}
function Item({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-foreground",
		children: v
	})] });
}
function WhyLedger({ game, result }) {
	const cond = conditionAdjustments(game);
	const home = team(game.home);
	const away = team(game.away);
	const residual = (home.ratingZ - away.ratingZ) * MEAN_SHIFT_FACTOR;
	const rows = [
		{
			component: "Market number",
			effect: `${formatSigned(-game.line.spread)} / ${game.line.total}`,
			confidence: "Given",
			evidence: ODDS_SOURCE
		},
		{
			component: "Rating residual",
			effect: `${formatSigned(residual)} pts vs the number`,
			confidence: "Low",
			evidence: `Shrunk ${MEAN_SHIFT_FACTOR}× toward the market. Model ${MODEL_VERSION}.`
		},
		{
			component: "Weather / slot",
			effect: `H ${formatSigned(cond.homePts)} · A ${formatSigned(cond.awayPts)}`,
			confidence: cond.notes.length ? "Medium" : "—",
			evidence: cond.notes[0] ?? "No weather/slot stress."
		},
		{
			component: "Tape",
			effect: result ? `${formatSigned(result.steamPts)} from open` : "—",
			confidence: result && Math.abs(result.steamPts) >= 1.5 ? "Medium" : "Low",
			evidence: result ? `${result.steam} · CLV vs open ${formatSigned(result.clvPts)}` : "No run yet."
		},
		{
			component: "Final lean",
			effect: result ? `cover ${formatSigned(result.homeCover * 100, 0)}% home · EV ${formatSigned(result.pick.ev * 100)}%` : "—",
			confidence: "—",
			evidence: `Sheet as of ${MARKET_AS_OF.slice(0, 10)}. Generated sandbox, not a live feed.`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Why this number"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Factor board. Not a ticket unless EV clears the juice."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: "Component"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: "Effect"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: "Conf."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: "Evidence"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2",
								children: r.component
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 font-mono text-xs tabular-nums",
								children: r.effect
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 font-mono text-xs text-muted-foreground",
								children: r.confidence
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 text-muted-foreground",
								children: r.evidence
							})
						]
					}, r.component)) })]
				})
			})
		]
	});
}
function OutsPanel({ gameId }) {
	const outs = useDesk((s) => s.outs) ?? [];
	const toggleOut = useDesk((s) => s.toggleOut);
	const players = swingsFor(gameId);
	if (!players.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No swing players tagged on this game."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children: players.map((p) => {
			const on = outs.includes(p.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("text-sm font-medium", on && "text-loss"),
						children: [
							p.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted-foreground",
								children: [
									p.pos,
									" · ",
									p.team
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: p.note
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 shrink-0 items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground",
					children: ["Out", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: on,
						onCheckedChange: () => toggleOut(p.id)
					})]
				})]
			}, p.id);
		})
	});
}
function PublicSplit({ game }) {
	const p = publicRead(game);
	const away = team(game.away);
	const home = team(game.home);
	const lean = p.contrarian ? `Public on ${p.publicTeam}. Handle is on the other side.` : p.fade ? `Public fade: ${p.publicPct}% of tickets on ${p.publicTeam}.` : p.publicPct >= 58 ? `${p.publicPct}% of tickets on ${p.publicTeam}. Handle is aligned.` : "Tickets and handle are balanced.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Public betting"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: lean
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitRow, {
				label: "Tickets",
				awayPct: p.ticketsAway,
				homePct: p.ticketsHome,
				away,
				home
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitRow, {
				label: "Handle",
				awayPct: p.handleAway,
				homePct: p.handleHome,
				away,
				home
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: "Total"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitRow, {
						label: "Tickets",
						awayPct: p.ticketsOver,
						homePct: 100 - p.ticketsOver,
						awayLabel: "Over",
						homeLabel: "Under",
						awayColor: "var(--color-warn)",
						homeColor: "var(--color-profit)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitRow, {
						label: "Handle",
						awayPct: p.handleOver,
						homePct: 100 - p.handleOver,
						awayLabel: "Over",
						homeLabel: "Under",
						awayColor: "var(--color-warn)",
						homeColor: "var(--color-profit)"
					})]
				})]
			})
		]
	});
}
function SplitRow({ label, awayPct, homePct, away, home, awayLabel, homeLabel, awayColor, homeColor }) {
	const left = awayLabel ?? away?.abbr ?? "Away";
	const right = homeLabel ?? home?.abbr ?? "Home";
	const leftColor = awayColor ?? away?.color ?? "var(--color-muted-foreground)";
	const rightColor = homeColor ?? home?.color ?? "var(--color-foreground)";
	const publicHeavy = Math.max(awayPct, homePct) >= 65;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1.5 flex items-center justify-between gap-2 font-mono text-xs tabular-nums",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn(publicHeavy && awayPct >= homePct ? "text-foreground" : "text-muted-foreground"),
				children: [
					awayPct,
					"% ",
					left
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("text-right", publicHeavy && homePct > awayPct ? "text-foreground" : "text-muted-foreground"),
				children: [
					homePct,
					"% ",
					right
				]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-2 overflow-hidden rounded-full bg-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 left-0",
				style: {
					width: `${awayPct}%`,
					background: leftColor
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 right-0",
				style: {
					width: `${homePct}%`,
					background: rightColor
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-1/2 z-10 w-px bg-background" })
		]
	})] });
}
function RefPanel({ game }) {
	const read = analyzeRef(game);
	const { crew } = read;
	const home = team(game.home);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Referee"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						crew.name,
						". ",
						crew.note ?? `${crew.style === "whistle" ? "Whistle" : crew.style === "let-play" ? "Let-play" : "Standard"} crew.`
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-2xl tabular-nums leading-none",
						children: read.score
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: "crew"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: refTone(read.grade),
						children: read.grade
					}),
					read.totalLean !== "even" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: read.totalLean === "over" ? "warn" : "outline",
						children: read.totalLean
					}) : null,
					read.sideLean === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["home ", home.abbr]
					}) : null,
					read.passLean === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "DPI"
					}) : read.passLean === "down" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "tight DPI"
					}) : null,
					read.sackLean === "down" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "sacks down"
					}) : read.sackLean === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "sacks live"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 font-mono text-xs tabular-nums sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						k: "Flags / g",
						v: crew.flagsPerGame.toFixed(1),
						hint: `lg ${LEAGUE_FLAGS}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						k: "DPI / g",
						v: crew.dpiPerGame.toFixed(1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						k: "Home ATS",
						v: formatPct(crew.homeAts, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						k: "Overs",
						v: formatPct(crew.overPct, 0)
					})
				]
			}),
			read.conflict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-warn",
				children: read.conflict
			}) : null,
			read.tells.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "League-average crew. No overlay from the whistle."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: read.tells.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
							children: t.note
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 font-mono text-xs tabular-nums text-muted-foreground",
						children: ["+", t.pts]
					})]
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted-foreground",
				children: [
					"Total lean ",
					formatSigned(crew.totalLean),
					" · holding ",
					crew.holding,
					" · PF ",
					crew.personalFouls.toFixed(1),
					"/g"
				]
			})
		]
	});
}
function Stat$1({ k, v, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "uppercase tracking-wider text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
		className: "mt-1 text-foreground",
		children: [v, hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1 text-muted-foreground",
			children: hint
		}) : null]
	})] });
}
function SharpPanel({ sharp }) {
	const lean = sharp.lean ? team(sharp.lean) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Sharp money"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: sharp.grade === "none" ? "No stacked sharp tells on this number." : lean ? `${sharp.grade === "heavy" ? "Heavy" : sharp.grade === "sharp" ? "Sharp" : "Watch"} lean ${lean.abbr}. Follow at the open is ${formatSigned(sharp.clvIfFollowed)} CLV.` : "Tape is active without a clean lean."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-2xl tabular-nums leading-none",
						children: sharp.score
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: "score"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: sharpTone(sharp.grade),
						children: sharp.grade
					}),
					lean ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["lean ", lean.abbr]
					}) : null,
					sharp.handleLed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "handle-led"
					}) : null
				]
			}),
			sharp.fired.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Public, handle, and the number are aligned."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: sharp.fired.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: t.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
							children: t.note
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("shrink-0 font-mono text-xs tabular-nums text-muted-foreground"),
						children: ["+", t.pts]
					})]
				}, t.id))
			})
		]
	});
}
function GamePage() {
	const { gameId } = Route.useParams();
	const game = getGame(gameId);
	const result = useDesk((s) => s.results?.[gameId]);
	const bankroll = useDesk((s) => s.bankroll) ?? 1e4;
	const run = useDesk((s) => s.run);
	const chaos = useDesk((s) => s.chaos);
	const paperGame = useDesk((s) => s.paperGame);
	const tickets = useDesk((s) => s.tickets) ?? [];
	const plays = useDesk((s) => s.plays) ?? [];
	const snaps = useDesk((s) => s.snaps) ?? [];
	const onCard = plays.some((p) => p.gameId === gameId);
	const papered = tickets.some((t) => t.gameId === gameId && !t.voidedAt);
	if (!game) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-xl font-medium",
			children: "Game not on the slate"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/slate",
				children: "Back"
			})
		})]
	});
	const away = team(game.away);
	const home = team(game.home);
	const bet = result ? bestTake(result) : null;
	const stake = result && bet ? paperStake(bet.kelly, bet.ev, bankroll) : 0;
	const denGame = game.home === "DEN" || game.away === "DEN";
	const pub = publicRead(game);
	const sharp = result?.sharp ?? analyzeSharp(game);
	const cond = conditionAdjustments(game);
	const ref = analyzeRef(game);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/slate",
				className: "inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Slate"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: [
							game.kickoffLabel,
							" · ",
							game.network,
							" · ",
							game.weather.venue
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-3xl font-medium tracking-tight",
						children: [
							away.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "at"
							}),
							" ",
							home.name
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: away.record
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: home.record
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [formatSpread(game.line.spread), " home"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["O/U ", game.line.total] }),
							game.weather.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: game.weather.note
							}) : null,
							isPrime(cond.slot) || cond.slot === "intl" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: cond.slotLabel
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								children: cond.crew.name
							}),
							ref.grade !== "quiet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: refTone(ref.grade),
								children: [ref.grade, ref.totalLean !== "even" ? ` ${ref.totalLean}` : ""]
							}) : null,
							denGame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "chaos engine"
							}) : null,
							result?.steam && result.steam !== "stable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: result.steam === "rlm" ? "loss" : "warn",
								children: [
									result.steam,
									" ",
									formatSigned(result.steamPts)
								]
							}) : null,
							result?.anomaly && result.anomaly.state !== "normal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: result.anomaly.state === "critical" ? "loss" : "warn",
								children: result.anomaly.state
							}) : null,
							pub.contrarian ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "warn",
								children: "ticket/handle split"
							}) : pub.fade ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								children: [
									pub.publicPct,
									"% tickets ",
									pub.publicTeam
								]
							}) : null,
							sharp.grade !== "none" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: sharpTone(sharp.grade),
								children: [sharp.grade, sharp.lean ? ` ${sharp.lean}` : ""]
							}) : null
						]
					})
				]
			}),
			!result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground",
				children: ["No number on this board yet.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => run(),
						children: "Get a number"
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Projected",
							value: `${result.awayMean.toFixed(1)}–${result.homeMean.toFixed(1)}`,
							hint: "away–home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Home cover",
							value: formatPct(result.homeCover),
							hint: `${home.abbr} ${formatSpread(game.line.spread)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Edge",
							value: formatSigned(result.pick.ev * 100) + "%",
							hint: pickLabel(game, result.pick),
							profit: result.pick.ev >= MIN_EV
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Stake",
							value: `$${stake}`,
							hint: result.pick.kelly <= 0 ? "q10 Kelly is 0 — print only" : `q10 Kelly ${formatPct(Math.min(.03, result.pick.kelly))} · size p ${formatPct(result.pick.sizeProb)}`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => paperGame(game.id),
							disabled: !onCard,
							variant: papered ? "secondary" : "default",
							children: onCard ? papered ? "Update paper ticket" : "Paper this side" : "Not a recommendation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/agents",
								search: {
									game: game.id,
									agent: "montecarlo"
								},
								children: "Stress this game"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "self-center font-mono text-xs text-muted-foreground",
							children: [
								"CLV ",
								formatSigned(result.clvPts),
								" pts vs open · rank p ",
								formatPct(result.pick.prob)
							]
						})
					]
				}),
				result.keyCall ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Key number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: result.keyCall.action !== "hold" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: result.keyCall.worth ? "text-profit" : "",
								children: [
									result.keyCall.action,
									" ",
									result.keyCall.from,
									" → ",
									result.keyCall.to,
									result.keyCall.worth ? ` · EV ${formatSigned(result.keyCall.evLift * 100)}%` : " · does not print"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: result.keyCall.note
							})
						}),
						result.keyCall.action !== "hold" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: result.keyCall.note
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Outs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Toggle a starter. This game re-runs. Props follow."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutsPanel, { gameId: game.id })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium",
								children: "Margin distribution"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-xs text-muted-foreground",
								children: [
									result.sims.toLocaleString(),
									" paths · σ ",
									result.stdMargin.toFixed(1)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarginChart, {
							histogram: result.histogram,
							line: game.line.spread,
							home: home.abbr
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									k: "One-score",
									v: formatPct(result.oneScore)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									k: `${home.abbr} by 7+`,
									v: formatPct(result.homeWinBy7)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									k: `${away.abbr} by 7+`,
									v: formatPct(result.awayWinBy7)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
									k: "Chaos triggers",
									v: chaos ? formatPct(result.chaosTriggers) : "off"
								})
							]
						}),
						denGame && chaos ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: [
								"Profile ",
								result.chaosProfile.replace(/_/g, " "),
								". Giants mode fires if Denver trails by 14+ in Q4 (30% chance of a 21-point burst). Clutch luck adds 0 / 3 / 7 in one-score games."
							]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4 sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Market vs model"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: [result.pick, ...result.alts].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-2.5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate",
								children: a.side
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-4 font-mono text-xs tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: formatPct(a.prob)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn(a.ev >= .03 ? "text-profit" : "text-muted-foreground"),
									children: [formatSigned(a.ev * 100), "%"]
								})]
							})]
						}, `${a.market}-${a.side}`))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharpPanel, { sharp })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicSplit, { game })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefPanel, { game })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhyLedger, {
									game,
									result
								}),
								snaps.length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SnapLine, {
									gameId: game.id,
									snaps
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConditionsPanel, { game })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium",
									children: "Tape"
								}),
								game.line.books?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 font-mono text-sm",
									children: [
										"Sheet open ",
										formatSpread(game.line.spreadOpen),
										" · reference ",
										formatSpread(game.line.spread),
										" ",
										game.line.priceBook
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Open is the seeded sheet, not that book’s open. Reference is this run’s number, not a close. The gap is not steam."
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 font-mono text-sm",
									children: [
										"Open ",
										formatSpread(game.line.spreadOpen),
										" → now ",
										formatSpread(game.line.spread)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										result.steam === "stable" ? "Line is stable inside 1.5 points of the open." : result.steam === "steam" ? `Steam with ${pub.publicPct}% of tickets on ${pub.publicTeam}.` : `Reverse line move. ${pub.publicPct}% of tickets on ${pub.publicTeam}, number going the other way.`,
										" ",
										"Sheet line only — not a live book."
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineTape, { game })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-1.5",
									children: [result.anomaly.signals.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: s
									}, s)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: result.anomaly.state === "normal" ? "default" : "warn",
										children: [
											"score ",
											result.anomaly.score.toFixed(0),
											" · ",
											result.anomaly.state
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium",
									children: "Point buy"
								}),
								result.pointBuy.filter((b) => b.key || b.worth).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "No key-number buy prints on this number."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-2 text-sm",
									children: result.pointBuy.filter((b) => b.key || b.worth).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex justify-between gap-3 font-mono text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"to ",
											formatSpread(b.to),
											" ",
											b.key ? "key" : ""
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: b.worth ? "text-profit" : "text-muted-foreground",
											children: [
												formatPct(b.cover),
												" · ",
												formatSigned(b.deltaPts),
												" pts"
											]
										})]
									}, b.to))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs text-muted-foreground",
									children: game.notes.join(" ")
								})
							]
						})
					]
				})
			] })
		]
	});
}
function Stat({ label, value, hint, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-2 font-mono text-2xl tabular-nums leading-none", profit && "text-profit"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 truncate text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function Mini({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "font-mono text-sm tabular-nums",
		children: v
	})] });
}
function SnapLine({ gameId, snaps }) {
	const deltas = diffSnapshots(snaps[1], snaps[0]).filter((d) => d.id === gameId);
	if (!deltas.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-sm text-muted-foreground",
		children: "No change vs the last snapshot."
	});
	const d = deltas[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-3 font-mono text-xs text-muted-foreground",
		children: [
			"Since last run: ",
			d.sideFrom,
			" ",
			formatSigned(d.evFrom * 100),
			"% → ",
			d.sideTo,
			" ",
			formatSigned(d.evTo * 100),
			"%",
			d.takeFrom !== d.takeTo ? d.takeTo ? " · onto the card" : " · off the card" : ""
		]
	});
}
//#endregion
export { GamePage as component };
