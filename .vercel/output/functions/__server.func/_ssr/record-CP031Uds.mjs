import { i as __toESM } from "../_runtime.mjs";
import { S as GAMES, p as gradeTickets, t as ARCHIVE } from "./box-CrH4BFCf.mjs";
import { $ as segmentBook, A as downloadCsv, D as cardUnits, E as calibrate, G as liveTrueCard, H as ledgerCsv, K as maxDrawdown, T as buildLedger, W as ledgerSplit, Y as pnlSplit, bt as formatUnits, ct as unofficialWinners, dt as volumeReport, f as MIN_EV, ft as winnerBands, gt as formatPct, ht as cn, lt as useDesk, n as ASSUMPTIONS, ot as ticketPnl, pt as winnerRecord, rt as sizeUnits, st as ticketUnits, v as allTickets, vt as formatSigned, y as allWinners } from "./store-ZvOPCZJK.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as ChevronDown } from "../_libs/lucide-react.mjs";
import { o as Button } from "./router-Dwgvlcnc.mjs";
import { t as Badge } from "./badge-BPWYBPo9.mjs";
import { n as SettlementPanel, t as EvidenceBand } from "./settlement-panel-DBD4Df8j.mjs";
import { t as TicketCard } from "./ticket-card-6Sk6S0Lc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/record-CP031Uds.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuditPanel({ rows }) {
	const split = pnlSplit(rows);
	const journal = useDesk((s) => s.journal) ?? [];
	const phase = useDesk((s) => s.runPhase);
	const box = useDesk((s) => s.box);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Audit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						"Realized vs expected, in units. 80% interval on the mean of each ticket. Model ",
						ASSUMPTIONS.version,
						". State: ",
						phase,
						"."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => downloadCsv(`syndicate-w1-3-card.csv`, ledgerCsv(rows, box)),
					disabled: false,
					children: "Download CSV"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Expected",
						value: split.n ? formatUnits(split.sumE, true) : "—",
						hint: split.n ? `sum of units × EV · ${formatUnits(split.risked)} risked` : "priced edge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Realized",
						value: split.n ? formatUnits(split.sumR, true) : "—",
						hint: split.n > 1 ? `80% [${formatUnits(split.realized.lo * split.n, true)}, ${formatUnits(split.realized.hi * split.n, true)}] · do not extrapolate` : "high variance",
						profit: split.sumR > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Min EV",
						value: `${ASSUMPTIONS.minEv * 100}%`,
						hint: "post-juice hurdle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Mean shift",
						value: String(ASSUMPTIONS.meanShift),
						hint: "ratings vs market"
					})
				]
			}),
			journal.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-1.5",
				children: journal.slice(0, 8).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap justify-between gap-2 font-mono text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						e.type,
						" · ",
						e.note
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(e.at).toLocaleString([], {
						month: "short",
						day: "numeric",
						hour: "numeric",
						minute: "2-digit"
					}) })]
				}, `${e.at}-${e.type}-${e.note}`))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No session journal yet. Runs, locks, voids, and paper tickets append here. Archive grades are immutable."
			})
		]
	});
}
function Stat({ label, value, hint, profit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-1 font-mono text-lg tabular-nums ${profit ? "text-profit" : profit === false ? "text-loss" : ""}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function pts(n) {
	return n == null ? "—" : `${formatSigned(n)} pts`;
}
function LedgerPanel() {
	const box = useDesk((s) => s.box);
	const grades = gradeTickets(ARCHIVE, box);
	const lines = buildLedger(grades, box).filter((t) => t.week < 3);
	const split = ledgerSplit(lines);
	const settled = lines.filter((t) => (t.kind === "spread" || t.kind === "total") && (t.result === "win" || t.result === "loss" || t.result === "push"));
	const brier = box ? calibrate(grades.filter((t) => t.week < 3 && (t.kind === "spread" || t.kind === "total"))).brier : null;
	const dd = box ? maxDrawdown(grades.filter((t) => t.week < 3 && (t.result === "win" || t.result === "loss"))) : null;
	const open = settled.map((t) => t.openClv).filter((n) => n != null);
	const close = settled.map((t) => t.closeClv).filter((n) => n != null);
	const openMean = open.length ? open.reduce((s, n) => s + n, 0) / open.length : null;
	const closeMean = close.length ? close.reduce((s, n) => s + n, 0) / close.length : null;
	const plays = useDesk((s) => s.plays) ?? [];
	const volume = volumeReport(plays);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Performance ledger"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-relaxed text-muted-foreground",
				children: "Open CLV is the number recorded on the ticket. It is not recomputed. Close CLV is the stored number against the DraftKings close on ESPN, and only after a final. One book. Not Pinnacle. A blank close is missing, not the ticket line plus the open CLV. Props stay out of realized."
			}),
			!box ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Waiting on the scoreboard. Nothing below is a close."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							k: "Open CLV",
							v: pts(openMean),
							hint: "recorded mean"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							k: "Close CLV",
							v: close.length === settled.length ? pts(closeMean) : "—",
							hint: close.length === settled.length ? "DraftKings close" : `${close.length} of ${settled.length} closes`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							k: "Brier",
							v: brier == null ? "—" : brier.toFixed(3),
							hint: "sides and totals"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							k: "Max DD",
							v: dd == null ? "—" : formatUnits(dd, true),
							hint: "scoreboard order"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[36rem] text-left text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Market"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "n"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Expected"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Realized"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Open CLV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "Close CLV"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 font-medium",
									children: "DD"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: split.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2",
									children: s.kind
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "0 graded" : s.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "—" : formatUnits(s.expected, true)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "—" : formatUnits(s.realized, true)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "—" : pts(s.openClv)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "—" : s.closeN === s.n ? pts(s.closeClv) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-2 font-mono tabular-nums",
									children: s.kind === "prop" ? "—" : formatUnits(s.drawdown, true)
								})
							]
						}, s.kind)) })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: [
						settled.length,
						" sides and totals in the archive. Expected ",
						formatUnits(settled.reduce((s, t) => s + t.expected, 0), true),
						". Realized ",
						formatUnits(settled.reduce((s, t) => s + t.realized, 0), true),
						". That book is not Gate 6. Gate 6 is ",
						volume.completedWeeks,
						" of ",
						volume.seasonWeeks,
						" locked weeks later settled. Week ",
						3,
						" is not in this book. Not a proven edge."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground",
						children: "Each ticket"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: lines.filter((t) => t.kind === "spread" || t.kind === "total").map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: t.side
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										" ",
										"· ",
										t.result,
										" · EV ",
										formatSigned(t.ev * 100),
										"% · ",
										formatUnits(t.realized, true),
										" · open ",
										pts(t.openClv),
										" · close ",
										pts(t.closeClv)
									]
								}),
								t.closeSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block font-mono text-xs text-muted-foreground",
									children: t.closeSource
								}) : null
							]
						}, t.id))
					})]
				})
			] })
		]
	});
}
function Cell({ k, v, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: k
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-lg tabular-nums",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function RecordPage() {
	const results = useDesk((s) => s.results) ?? {};
	const parlays = useDesk((s) => s.parlays) ?? [];
	const props = useDesk((s) => s.props) ?? [];
	const plays = useDesk((s) => s.plays) ?? [];
	const dataMode = useDesk((s) => s.dataMode) ?? "sandbox-generated";
	const oddsBooks = useDesk((s) => s.oddsBooks) ?? [];
	const predictions = useDesk((s) => s.predictions) ?? [];
	const lastRunAt = useDesk((s) => s.lastRunAt);
	const runId = useDesk((s) => s.runId) ?? "pending";
	useDesk((s) => s.paperProp);
	useDesk((s) => s.paperGame);
	useDesk((s) => s.paperParlay);
	useDesk((s) => s.tickets);
	const running = useDesk((s) => s.running);
	const runPhase = useDesk((s) => s.runPhase);
	const lockWeek = useDesk((s) => s.lockWeek);
	const journal = useDesk((s) => s.journal) ?? [];
	const locked = useDesk((s) => s.locked) ?? [];
	const box = useDesk((s) => s.box);
	const lockedWinners = useDesk((s) => s.lockedWinners) ?? [];
	const slate = Object.values(results);
	const live = liveTrueCard(slate, parlays, props, GAMES);
	const weekWinners = predictions.length ? predictions : lastRunAt ? unofficialWinners(slate, GAMES, 3) : [];
	const cardRows = gradeTickets(allTickets(locked), box);
	const cal = calibrate(cardRows);
	const winRows = allWinners(lockedWinners);
	const wins = winnerRecord(winRows);
	const bands = winnerBands(winRows);
	const closedCard = cardRows.filter((t) => t.week < 3);
	cardUnits(closedCard);
	const dd = maxDrawdown(closedCard);
	const segs = segmentBook(closedCard);
	pnlSplit(closedCard);
	const cardWeeks = groupCardByWeek(closedCard);
	const pendingCard = cardRows.filter((t) => t.week === 3);
	const earliestKick = plays.reduce((min, p) => {
		const kick = p.audit?.kickoffTimestamp;
		if (!kick) return min;
		return min == null ? kick : Math.min(min, kick);
	}, null);
	const lockNote = journal.find((e) => e.type === "locked" || e.note.startsWith("LOCK_REFUSED"))?.note;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-widest text-muted-foreground",
						children: "The record"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl",
						children: "Every take. Including the misses."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Two records. The card is the sides and totals we would bet, only at a posted book price, sized in units. The SU board is who we pick to win each of the 16 games. It is graded, and it is not the card. 21+."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "How to read this"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "Edge"
						}), " — our probability versus the price, juice included. A −9 favorite can be likely to win the game and still be a poor bet against the spread."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "The card"
						}), " — tickets we would actually place this week. Not every game. If it is not here, we would not bet it."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "SU board"
						}), " — who we pick to win each of the 16. Predictions, not bets. Graded so the model has a full-slate record."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: "Review"
							}),
							" — after a week grades, each ticket is checked for what held, what broke, and whether a weight moved.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/learn",
								className: "underline",
								children: "Open the review"
							}),
							"."
						] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Graded",
						value: cal.n ? String(cal.n) : "—",
						hint: box ? "scoreboard · prop and parlay excluded" : "archive · not settled this session"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "CLV open",
						value: cal.n ? formatSigned(cal.clv) : "—",
						hint: "recorded on the ticket · not a close",
						profit: cal.clv > 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Brier",
						value: cal.n ? cal.brier.toFixed(3) : "—",
						hint: "card calibration · lower is sharper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Max DD",
						value: cal.n ? formatUnits(dd, true) : "—",
						hint: segs.map((s) => `${s.kind} ${s.n}`).join(" · "),
						warn: dd < -5
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceBand, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettlementPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditPanel, { rows: cardRows }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-sm font-medium",
							children: [
								"Week ",
								3,
								" card"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								"Only the live-book sides and totals we would bet. Plus-",
								MIN_EV * 100,
								"% after juice, then half-Kelly capped at 3%. Props and model parlays are not on this card. Lock is one stamp for the whole card. It counts only when every open ticket has its recommendation at or before the lock, and the lock is before that ticket’s sheet kickoff",
								earliestKick ? ` (earliest ${new Date(earliestKick).toISOString()})` : "",
								". A later relock, void, paper, or clear is refused and the original stays. This week’s games are not final, so the settlement stamp stays empty."
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => lockWeek(),
							disabled: running || plays.length === 0,
							variant: "secondary",
							children: runPhase === "locked" ? "Relock refused" : "Lock the card"
						})]
					}),
					lockNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: lockNote
					}) : null,
					!lastRunAt && !plays.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: running ? "Getting this week’s numbers…" : "No run yet. Run the desk to generate a paper card."
					}) : plays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: dataMode === "live-books" ? `Run priced from ${oddsBooks.join(", ") || "the board"} — no qualifier met the 3% post-juice hurdle.` : "Live books did not return. Seeded prices were not written as recommendations."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-mono text-xs text-muted-foreground",
							children: [
								runId,
								" · 0 tickets · ",
								weekWinners.length,
								" of 16 SU predictions · NO_QUALIFYING_EDGES",
								lastRunAt ? ` · ${new Date(lastRunAt).toLocaleTimeString()}` : ""
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Game markets ",
								plays.filter((p) => p.kind === "spread" || p.kind === "total").length,
								" · props",
								" ",
								plays.filter((p) => p.kind === "prop").length,
								" · parlays ",
								plays.filter((p) => p.kind === "parlay").length,
								". Auto-written to the paper book."
							]
						}), plays.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TicketCard, { play }, play.id))]
					}),
					pendingCard.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted-foreground",
						children: [
							"Card locked · ",
							pendingCard.length,
							" tickets pending kickoff."
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "SU calibration"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground",
						children: "Straight-up board only. Hit rate counts winners. Skill grades the probabilities — a 70% lean that dogs it hurts more than a coin flip."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Hit",
								value: wins.n ? formatPct(wins.hitRate) : "—",
								hint: `priced at ${wins.n ? formatPct(wins.exp) : "—"}`,
								profit: wins.n ? wins.hitRate >= wins.exp : void 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Brier",
								value: wins.n ? wins.brier.toFixed(3) : "—",
								hint: "lower = sharper"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Log loss",
								value: wins.n ? wins.logloss.toFixed(3) : "—",
								hint: "punishes a bad 70"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Skill vs climate",
								value: wins.n ? formatPct(wins.skill) : "—",
								hint: "vs sample hit rate as a constant",
								profit: wins.skill > 0
							})
						]
					}),
					wins.n ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted-foreground",
						children: [
							"Hit rate ",
							formatPct(wins.hitRate),
							" is winners, not skill. Model Brier ",
							wins.brier.toFixed(3),
							" vs a coin (",
							wins.brierBase.toFixed(3),
							", skill ",
							formatPct(wins.skillVsCoin),
							") and vs always saying the sample rate",
							" ",
							formatPct(wins.hitRate),
							" (",
							wins.brierClimate.toFixed(3),
							", skill ",
							formatPct(wins.skill),
							"). n=",
							wins.n,
							". Negative skill vs climate means the probabilities are not yet sharper than “it hits this often.”"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: bands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [b.label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 font-mono text-xs text-muted-foreground",
								children: [
									formatPct(b.lo),
									"–",
									formatPct(Math.min(1, b.hi))
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs tabular-nums text-muted-foreground",
								children: b.n ? `${b.hits}–${b.losses} · ${formatPct(b.hitRate)} hit · p ${formatPct(b.exp)}` : "—"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5 h-2 rounded-full bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "absolute top-0 h-2 rounded-full bg-foreground/35",
								style: { width: `${Math.min(100, b.exp * 100)}%` }
							}), b.n ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "absolute top-[-2px] h-3 w-0.5 bg-foreground",
								style: { left: `${Math.min(100, b.hitRate * 100)}%` }
							}) : null]
						})] }, b.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-medium",
						children: [
							"Week ",
							3,
							" predictions"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Who we think wins each game. Not a bet. Separate from the card. Graded Sunday night."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: [weekWinners.length || 0, " of 16"]
					})]
				}), !lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						running ? "Getting numbers on the 16…" : "Desk hasn’t priced this week.",
						" ",
						!running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/slate",
							className: "underline",
							children: "Open the desk"
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid gap-2 sm:grid-cols-2",
					children: weekWinners.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w.gameId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/game/$gameId",
						params: { gameId: w.gameId },
						className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-background-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted-foreground",
									children: String(i + 1).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "ml-2",
									children: "pred"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 font-medium",
									children: w.winner
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-muted-foreground",
									children: w.matchup
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs tabular-nums text-muted-foreground",
							children: formatPct(w.pWin)
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: w.winner
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-muted-foreground",
								children: w.matchup
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs tabular-nums text-muted-foreground",
							children: formatPct(w.pWin)
						})]
					}) }, w.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Slate sheet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Every game’s lean. BET is on the card. PASS is not a wager."
					}),
					!lastRunAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground",
						children: running ? "Working the numbers…" : "No number yet this session."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-xl border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[36rem] text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Matchup"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Lean"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Edge"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Units"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-3 py-2 font-medium",
										children: "Card"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: live.sheet.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/game/$gameId",
											params: { gameId: r.gameId },
											className: "hover:underline",
											children: r.matchup
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono text-xs text-muted-foreground",
											children: r.kickoff
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: r.side
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: cn("px-3 py-2 font-mono tabular-nums", r.ev >= .03 ? "text-profit" : "text-muted-foreground"),
										children: [formatSigned(r.ev * 100), "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 font-mono tabular-nums text-muted-foreground",
										children: r.take ? formatUnits(sizeUnits(r.kelly)) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: r.take ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "profit",
											children: "bet"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: "pass"
										})
									})
								]
							}, r.gameId)) })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Weekly team projections"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Closed cards, Weeks 1–",
							2,
							". Units in, units out."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClosedCardWeeks, { weeks: cardWeeks })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "We don’t fire a wager for you. If gambling is a problem, call 1-800-GAMBLER."
			})
		]
	});
}
function ClosedCardWeeks({ weeks }) {
	const [open, setOpen] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: weeks.map((wk) => {
			const shown = open === wk.week;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-expanded": shown,
					onClick: () => setOpen(shown ? null : wk.week),
					className: "flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm font-medium",
						children: ["Week ", wk.week]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-3 font-mono text-xs tabular-nums text-muted-foreground",
						children: [
							wk.hits,
							"–",
							wk.losses,
							" · ",
							formatUnits(wk.pnl, true),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
								className: cn("size-4 transition-transform", shown && "rotate-180"),
								strokeWidth: 1.75
							})
						]
					})]
				}), shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 border-t border-border px-4 py-3",
					children: wk.rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-lg border border-border bg-background px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: t.result === "win" ? "profit" : t.result === "loss" ? "loss" : "outline",
										children: t.result
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: t.kind
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: t.side
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									t.matchup,
									" · ",
									t.score ?? "no final",
									" · ",
									formatUnits(ticketUnits(t)),
									" · ",
									formatUnits(ticketPnl(t), true)
								]
							}),
							"settlementSource" in t && t.settlementSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted-foreground",
								children: String(t.settlementSource)
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "No scoreboard grade on this row."
							}),
							"settlementNote" in t && t.settlementNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: String(t.settlementNote)
							}) : null
						]
					}, t.id))
				}) : null]
			}, wk.week);
		})
	});
}
function groupCardByWeek(rows) {
	return [...new Set(rows.map((t) => t.week))].sort((a, b) => b - a).map((week) => {
		const xs = rows.filter((t) => t.week === week);
		const g = xs.filter((t) => t.result === "win" || t.result === "loss");
		const hits = g.filter((t) => t.result === "win").length;
		const units = cardUnits(xs);
		return {
			week,
			rows: xs,
			hits,
			losses: g.length - hits,
			pnl: units.pnl,
			risked: units.risked
		};
	});
}
function Kpi({ label, value, hint, profit, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 font-mono text-2xl tabular-nums leading-none", profit === true ? "text-profit" : profit === false ? "text-loss" : warn ? "text-warn" : ""),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
//#endregion
export { RecordPage as component };
