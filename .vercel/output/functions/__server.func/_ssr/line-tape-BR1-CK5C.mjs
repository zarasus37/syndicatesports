import { at as tapeRows, lt as useDesk, vt as formatSigned } from "./store-ZvOPCZJK.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/line-tape-BR1-CK5C.js
var import_jsx_runtime = require_jsx_runtime();
function matchup(id) {
	const [away, home] = id.split("-");
	if (!away || !home) return id;
	return `${away.toUpperCase()} @ ${home.toUpperCase()}`;
}
function LineTape({ game }) {
	if (game) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameTape, { game });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardTape, {});
}
function GameTape({ game }) {
	const prints = useDesk((s) => s.tape) ?? [];
	const rows = tapeRows(prints).filter((r) => r.gameId === game.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Stored prints for this game. The first one is not the book’s open. One print is not a move."
	}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm text-muted-foreground",
		children: "No print stored for this game yet."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1 text-sm",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "font-mono text-xs",
			children: [
				r.book,
				" · spread ",
				r.firstSpread === r.lastSpread ? formatSigned(r.lastSpread) : `${formatSigned(r.firstSpread)} → ${formatSigned(r.lastSpread)}`,
				" · total",
				" ",
				r.firstTotal === r.lastTotal ? r.lastTotal : `${r.firstTotal} → ${r.lastTotal}`,
				" · ",
				r.prints,
				" · ",
				r.window
			]
		}, r.book))
	})] });
}
function BoardTape() {
	const prints = useDesk((s) => s.tape) ?? [];
	const at = useDesk((s) => s.tapeAt);
	const note = useDesk((s) => s.tapeNote);
	const loading = useDesk((s) => s.tapeLoading);
	const errors = useDesk((s) => s.tapeErrors) ?? [];
	const rows = tapeRows(prints);
	const next = rows.filter((r) => r.week === 4);
	const current = rows.filter((r) => r.week === 3);
	const other = rows.filter((r) => r.week !== 3 && r.week !== 4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-card p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: "Line tape"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: [
					"While this desk is open, a fetch about every three minutes stores a print when the number or the price changes. The first print is the first one stored here. It is not the book’s look-ahead line and it is not the official open. The window is the calendar until kickoff, not a stamp of when the book released it. The locked Week ",
					3,
					" card is not replaced."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-xs text-muted-foreground",
				children: [
					loading ? "Fetching. " : "",
					at ? `Last fetch ${at}. ` : "No fetch stored yet. ",
					prints.length,
					" prints. ",
					note
				]
			}),
			errors.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: errors.slice(0, 3).join(" · ")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapeTable, {
				title: `Week 4`,
				rows: next,
				empty: `No Week 4 number stored yet.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapeTable, {
				title: `Week 3`,
				rows: current,
				empty: `No Week 3 print stored yet.`
			}),
			other.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapeTable, {
				title: "Week not on the scoreboard",
				rows: other,
				empty: ""
			}) : null
		]
	});
}
function TapeTable({ title, rows, empty }) {
	const shown = rows.slice(0, 16);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "font-mono text-xs uppercase tracking-wider text-muted-foreground",
			children: title
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: empty
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[40rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Game"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Book"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Spread"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Prints"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: "Window"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shown.map((r) => {
					const spreadSame = r.firstSpread === r.lastSpread;
					const totalSame = r.firstTotal === r.lastTotal;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2",
								children: matchup(r.gameId)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2",
								children: r.book
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 font-mono tabular-nums",
								children: spreadSame ? formatSigned(r.lastSpread) : `${formatSigned(r.firstSpread)} → ${formatSigned(r.lastSpread)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 font-mono tabular-nums",
								children: totalSame ? r.lastTotal : `${r.firstTotal} → ${r.lastTotal}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 font-mono tabular-nums",
								children: r.prints
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-2 py-2 text-muted-foreground",
								children: r.window
							})
						]
					}, `${r.week}-${r.gameId}-${r.book}`);
				}) })]
			}), rows.length > shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [rows.length - shown.length, " more stored on this device."]
			}) : null]
		})]
	});
}
//#endregion
export { LineTape as t };
