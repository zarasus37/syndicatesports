import { C as KEY_NUMBERS$1, D as activeGames, O as getGame, S as GAMES, _ as lockAudit, a as applyCardLock, b as probToAmerican, c as buildAudit, d as findGame, f as gradeTicket, g as kellyFraction, h as isLiveBook, i as appendAudit, k as installLiveGames, l as evFromProb, m as impliedProb, o as applyGradeToAudit, p as gradeTickets, r as americanToDecimal, s as applyQuotes, t as ARCHIVE, u as executionQuote, w as PROPS } from "./box-CrH4BFCf.mjs";
import { n as team, r as teamNick, t as TEAMS } from "./teams-BfaPpyvO.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-ClgmUyAu.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatPct(value, digits = 1) {
	if (!Number.isFinite(value)) return "—";
	return `${Number(value * 100).toFixed(digits)}%`;
}
function formatSigned(value, digits = 1) {
	if (!Number.isFinite(value)) return "—";
	const n = Number(value.toFixed(digits));
	const abs = Math.abs(n).toFixed(digits);
	if (n > 0) return `+${abs}`;
	if (n < 0) return `-${abs}`;
	return abs;
}
function formatScore(value, digits = 0) {
	if (!Number.isFinite(value)) return "—";
	return Number(value.toFixed(digits)).toFixed(digits);
}
function formatSpread(spread) {
	if (spread === 0) return "PK";
	return formatSigned(spread, spread % 1 === 0 ? 0 : 1);
}
function americanOdds(american) {
	return american > 0 ? `+${american}` : `${american}`;
}
function formatUnits(n, signed = false) {
	const abs = Math.abs(n).toFixed(2);
	if (signed) {
		if (n > 0) return `+${abs}u`;
		if (n < 0) return `-${abs}u`;
	}
	return `${abs}u`;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/store-ZvOPCZJK.js
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = a;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function gaussian(rng, mean, std) {
	let u = 0;
	let v = 0;
	while (u === 0) u = rng();
	while (v === 0) v = rng();
	return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function poisson(rng, lambda) {
	const L = Math.exp(-lambda);
	let k = 0;
	let p = 1;
	do {
		k += 1;
		p *= rng();
	} while (p > L);
	return k - 1;
}
function choice(rng, items, weights) {
	let sum = 0;
	for (const w of weights) sum += w;
	let r = rng() * sum;
	for (let i = 0; i < items.length; i++) {
		r -= weights[i] ?? 0;
		const item = items[i];
		if (r <= 0 && item !== void 0) return item;
	}
	return items[items.length - 1];
}
function analyzeBook(tickets, bankroll, seed = 1) {
	const live = tickets.filter((t) => !t.voidedAt);
	const stake = live.reduce((s, t) => s + t.stake, 0);
	const expectedProfit = live.reduce((s, t) => s + t.ev * t.stake, 0);
	const roi = stake > 0 ? expectedProfit / stake : 0;
	if (!live.length) return {
		n: 0,
		stake: 0,
		expectedProfit: 0,
		roi: 0,
		ruin: 0,
		pDown: 0,
		medianEnd: bankroll,
		maxExposure: 0
	};
	const rng = mulberry32(seed);
	const PATHS = 2200;
	const WEEKS = 24;
	let ruinN = 0;
	let downN = 0;
	const ends = new Array(PATHS);
	for (let p = 0; p < PATHS; p++) {
		let br = bankroll;
		let ruined = false;
		for (let w = 0; w < WEEKS && !ruined; w++) for (const t of live) {
			if (br < t.stake) {
				ruined = true;
				break;
			}
			const dec = americanToDecimal(t.price);
			if (rng() < t.prob) br += t.stake * (dec - 1);
			else br -= t.stake;
			if (br <= bankroll * .05) {
				ruined = true;
				break;
			}
		}
		if (ruined) ruinN += 1;
		if (br < bankroll) downN += 1;
		ends[p] = br;
	}
	ends.sort((a, b) => a - b);
	return {
		n: live.length,
		stake,
		expectedProfit,
		roi,
		ruin: ruinN / PATHS,
		pDown: downN / PATHS,
		medianEnd: ends[Math.floor(ends.length / 2)] ?? bankroll,
		maxExposure: stake / Math.max(1, bankroll)
	};
}
function pipelineHealth(results, sims, runMs) {
	const residuals = results.map((r) => Math.abs(r.anomaly.snapshot.residualZ));
	const drift = residuals.length ? residuals.reduce((s, z) => s + z, 0) / residuals.length : 0;
	return {
		cadenceMin: 5,
		sims,
		latencyMs: runMs ?? Math.round(sims * .04),
		errorRate: 0,
		drift,
		flagged: results.filter((r) => r.anomaly.state !== "normal").length,
		plusEv: results.filter((r) => r.pick.ev >= .03).length
	};
}
function publicRead(game) {
	const ticketsHome = game.public.ticketsHome;
	const handleHome = game.public.handleHome;
	const ticketsAway = 100 - ticketsHome;
	const handleAway = 100 - handleHome;
	const splitHome = handleHome - ticketsHome;
	const publicSide = ticketsHome >= 50 ? "home" : "away";
	const publicPct = Math.max(ticketsHome, ticketsAway);
	const fade = publicPct >= 65 ? publicSide : null;
	const sharpLean = splitHome >= 12 ? "home" : splitHome <= -12 ? "away" : "even";
	const contrarian = fade !== null && sharpLean !== "even" && sharpLean !== fade;
	return {
		ticketsHome,
		handleHome,
		ticketsAway,
		handleAway,
		ticketsOver: game.public.ticketsOver,
		handleOver: game.public.handleOver,
		splitHome,
		publicSide,
		publicPct,
		publicTeam: publicSide === "home" ? game.home : game.away,
		fade,
		sharpLean,
		contrarian
	};
}
function isPublicFlag(game) {
	const p = publicRead(game);
	return p.fade !== null || p.contrarian;
}
function againstPublic(game, moveTowardHome) {
	const p = publicRead(game);
	if (p.publicPct < 58) return false;
	if (p.publicSide === "home") return !moveTowardHome;
	return moveTowardHome;
}
/** Conjugate Bayesian updates used by the desk. No sampling — closed form. */
var LANCZOS = [
	.9999999999998099,
	676.5203681218851,
	-1259.1392167224028,
	771.3234287776531,
	-176.6150291621406,
	12.507343278686905,
	-.13857109526572012,
	9984369578019572e-21,
	1.5056327351493116e-7
];
function logGamma(z) {
	if (z < .5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
	const x = z - 1;
	let a = LANCZOS[0];
	for (let i = 1; i < LANCZOS.length; i++) a += LANCZOS[i] / (x + i);
	const t = x + 7.5;
	return .5 * Math.log(2 * Math.PI) + (x + .5) * Math.log(t) - t + Math.log(a);
}
function betacf(x, a, b) {
	const qab = a + b;
	const qap = a + 1;
	const qam = a - 1;
	let az = 1;
	let am = 1;
	let bm = 1;
	let bz = 1 - qab * x / qap;
	for (let m = 1; m <= 200; m++) {
		const em = m;
		const tem = em + em;
		let d = em * (b - em) * x / ((qam + tem) * (a + tem));
		const ap = az + d * am;
		const bp = bz + d * bm;
		d = -(a + em) * (qab + em) * x / ((a + tem) * (qap + tem));
		const app = ap + d * az;
		const bpp = bp + d * bz;
		const aold = az;
		am = ap / bpp;
		bm = bp / bpp;
		az = app / bpp;
		bz = 1;
		if (Math.abs(az - aold) < 3e-12 * Math.abs(az)) return az;
	}
	return az;
}
function betai(x, a, b) {
	if (x <= 0) return 0;
	if (x >= 1) return 1;
	const logBt = logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x);
	const bt = Math.exp(logBt);
	if (x < (a + 1) / (a + b + 2)) return bt * betacf(x, a, b) / a;
	return 1 - bt * betacf(1 - x, b, a) / b;
}
function betaQuantile(a, b, p) {
	let lo = 0;
	let hi = 1;
	for (let i = 0; i < 48; i++) {
		const mid = (lo + hi) / 2;
		if (betai(mid, a, b) < p) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
}
var LEAGUE_P = .524;
function betaUpdate(hits, n, priorMean = LEAGUE_P, kappa = 10, tag = "") {
	const p0 = Math.min(.72, Math.max(.38, priorMean));
	const a0 = p0 * kappa;
	const b0 = (1 - p0) * kappa;
	const losses = Math.max(0, n - hits);
	const a = a0 + hits;
	const b = b0 + losses;
	const mean = a / (a + b);
	return {
		tag,
		a0,
		b0,
		a,
		b,
		n,
		hits,
		priorMean: p0,
		mean,
		q10: betaQuantile(a, b, .1),
		q90: betaQuantile(a, b, .9),
		raw: n ? hits / n : p0,
		mult: Math.min(1.22, Math.max(.72, mean / p0)),
		pBeat: 1 - betai(p0, a, b)
	};
}
/** Normal-normal conjugate on mean CLV. Prior N(0, 1.5²). */
function clvUpdate(xs) {
	const n = xs.length;
	if (!n) return {
		mean: 0,
		sd: 1.5,
		q10: -1.92,
		q90: 1.92,
		n: 0
	};
	const m = xs.reduce((s, x) => s + x, 0) / n;
	const v = n < 2 ? 2.25 : xs.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1);
	const prec0 = 1 / 2.25;
	const precD = n / Math.max(1.2, v);
	const prec = prec0 + precD;
	const mean = precD * m / prec;
	const sd = Math.sqrt(1 / prec);
	return {
		mean,
		sd,
		q10: mean - 1.2816 * sd,
		q90: mean + 1.2816 * sd,
		n
	};
}
function dirichletUpdate(counts, alpha0 = .8) {
	const keys = Object.keys(counts);
	const sum = keys.reduce((s, k) => s + alpha0 + (counts[k] ?? 0), 0);
	return keys.map((reason) => {
		const count = counts[reason] ?? 0;
		return {
			reason,
			count,
			mean: (alpha0 + count) / sum
		};
	}).sort((a, b) => b.mean - a.mean);
}
/** Mix a model probability with a Beta posterior in log-odds. Partial pool. */
function posteriorProb(modelP, post, weight = .45) {
	const p = Math.min(.92, Math.max(.08, modelP));
	const rawLr = Math.log(post.mean / post.priorMean);
	const lr = post.n >= 80 ? rawLr : Math.min(0, rawLr);
	const logit = Math.log(p / (1 - p)) + weight * lr;
	return 1 / (1 + Math.exp(-logit));
}
/**
* Rank stays on the (calibrated) mean. Size uses a pull toward the 10th percentile.
* Never size above the ranking p.
*/
function sizeProb(rankP, post) {
	let p = rankP;
	if (post && post.n >= 8) {
		p = posteriorProb(rankP, post, .35);
		p = .6 * p + .4 * Math.max(.08, p + (post.q10 - post.mean));
	} else p = .94 * p + .03;
	return Math.min(rankP, Math.max(.08, p));
}
var DEFAULT_PRIORS = {
	fromWeek: 0,
	toWeek: 0,
	n: 0,
	hits: 0,
	brier: .25,
	clv: 0,
	roi: 0,
	haircuts: {
		rlm: 1,
		steam: 1,
		tnf: 1,
		chaos: 1,
		wind: 1,
		refOver: 1,
		publicFade: 1
	},
	posts: {},
	clvPost: clvUpdate([]),
	missPost: [],
	reliability: [],
	notes: ["No graded tickets in this prior. League Beta(κ = 10) until the archive is loaded."]
};
var current = DEFAULT_PRIORS;
function getPriors() {
	return current;
}
function setPriors(next) {
	current = next;
}
var DEFAULT_SIMS = 12e3;
var MAX_SIMS = 8e4;
var MEAN_SHIFT_FACTOR = .65;
var MIN_EV = .03;
var KELLY_CAP = .5;
var MAX_BANKROLL_PCT = .03;
var KEY_NUMBERS = [
	3,
	7,
	10
];
var DEFAULT_BANKROLL = 1e4;
var ANOMALY_WEIGHTS = {
	leadLag: 10,
	steam: 10,
	defended: 5,
	outlier: 15,
	residualZ: 15,
	persist: 15,
	div: 10,
	tilt: 10,
	prop: 5,
	weather: 5
};
var ANOMALY_THRESHOLDS = {
	info: 60,
	outlier: 70,
	critical: 82
};
var AGENT_CATALOG = [
	{
		id: "ingestion",
		name: "Ingestion",
		role: "Pulls slate, EPA, weather, refs, prime slots, and books.",
		group: "feeds",
		capabilities: [
			"Fetch and validate slate, EPA, weather, refs, and two books",
			"Dedupes injury and split prints; failover if Book A stalls",
			"5-minute cadence, 1-minute inside an hour of kickoff"
		],
		workflow: "Raw ticks land in the tape. Downstream agents never hit a sportsbook."
	},
	{
		id: "signals",
		name: "Signals",
		role: "Steam, RLM, public split, sharp score, referee tendencies.",
		group: "feeds",
		capabilities: [
			"Lead-lag drift, 60-minute steam, defended key numbers",
			"Ticket/handle divergence and reverse line moves",
			"Referee pace, DPI, and weather stress on the same snapshot"
		],
		workflow: "Writes a feature snapshot per game. Anomaly reads it; it never prices a ticket."
	},
	{
		id: "anomaly",
		name: "Anomaly",
		role: "Weighted score. Flags info / outlier / critical.",
		group: "price",
		capabilities: [
			"Weighted microstructure, residual, splits, and coherence",
			"Critical requires score ≥ 82 and at least two firing signals",
			"Persistence flag if the residual holds 60+ minutes"
		],
		workflow: "Scores 0–100. Outlier/critical inflate Monte Carlo variance and shift the mean."
	},
	{
		id: "montecarlo",
		name: "Monte Carlo",
		role: "12k–80k game paths. Chaos, tails, variance inflation.",
		group: "price",
		capabilities: [
			"Independent paths per game; Q4 chaos on Denver profiles",
			"Stress: steam, public surge, starter out, wind",
			"Tail mass on ±7; mean-shift 0.4 of unexplained steam"
		],
		workflow: "Prices the world. +EV, parlays, and Kelly only read these draws."
	},
	{
		id: "ev",
		name: "+EV Desk",
		role: "Strips juice, ranks cover/total/ML, tracks CLV vs open.",
		group: "price",
		capabilities: [
			"True probability vs de-vigged books. Floor 3% EV for a ticket",
			"Reliability curve + Beta-Binomial size from graded weeks",
			"CLV vs open until a live close exists"
		],
		workflow: "Ranks every market. Passes go on the card as passes — nothing is hidden."
	},
	{
		id: "parlay",
		name: "Parlay Lab",
		role: "3-leg builder. Correlation haircut. Point-buy fair value.",
		group: "book",
		capabilities: [
			"Search 3-leg combinations; drop same-game stacks on 3-legs",
			"Same-game 2-legs use joint frequency from the same paths",
			"Gaussian copula on wind-linked totals. Recalc EV after a buy"
		],
		workflow: "Keeps only tickets that still print after correlation and juice."
	},
	{
		id: "execution",
		name: "Execution",
		role: "Half-Kelly, 3% cap, paper tickets only.",
		group: "book",
		capabilities: [
			"q10 Kelly from the sized probability, capped at 3% of bankroll",
			"Point-buy only if the key (3 / 7) pays more than the juice",
			"Paper book never transmits to a sportsbook"
		],
		workflow: "Proposes. You confirm. The public record is the lock, not the book."
	},
	{
		id: "risk",
		name: "Risk",
		role: "Ruin, exposure, responsible-play rails.",
		group: "guard",
		capabilities: [
			"Season-path ruin on the current paper book",
			"Per-game cap and no one-click wagering",
			"21+, KYC/AML rails, 1-800-GAMBLER"
		],
		workflow: "Can zero a stake. Cannot place one."
	},
	{
		id: "monitor",
		name: "Monitor",
		role: "Beta–Binomial grades, Dirichlet miss modes, writes posteriors into the next run.",
		group: "guard",
		capabilities: [
			"Latency, error rate, residual drift |z|",
			"Brier and CLV on locked weeks",
			"Retrain trigger when drift or Brier walks off"
		],
		workflow: "Grades in public. Posteriors haircut the next slate — nothing is deleted."
	}
];
AGENT_CATALOG.map(({ id, name, role }) => ({
	id,
	name,
	role
}));
function getAgent(id) {
	return AGENT_CATALOG.find((a) => a.id === id) ?? AGENT_CATALOG[0];
}
function deriveAgents(results) {
	const flagged = results.filter((r) => r.anomaly.state !== "normal");
	const plus = results.filter((r) => r.pick.ev >= MIN_EV);
	const chaos = results.filter((r) => r.chaosTriggers > .08);
	const steam = results.filter((r) => r.steam !== "stable");
	const fades = results.filter((r) => {
		const g = getGame(r.gameId);
		return g ? isPublicFlag(g) : false;
	}).length;
	const heavy = results.filter((r) => r.sharp && (r.sharp.grade === "sharp" || r.sharp.grade === "heavy")).length;
	const crit = results.filter((r) => r.anomaly.state === "critical").length;
	const outlier = results.filter((r) => r.anomaly.state === "outlier").length;
	const paths = results.reduce((s, r) => s + r.sims, 0);
	const meanClv = results.length ? results.reduce((s, r) => s + r.clvPts, 0) / results.length : 0;
	return AGENT_CATALOG.map((m, i) => {
		const base = {
			id: m.id,
			name: m.name,
			role: m.role,
			state: "ok",
			last: "slate synced",
			ticks: 40 + i * 3
		};
		if (m.id === "ingestion") return {
			...base,
			last: `${results.length} games · week 3 feeds live`,
			ticks: 128
		};
		if (m.id === "signals") return {
			...base,
			last: `${steam.length} steam/RLM · ${heavy} sharp leans · ${fades} public fades`,
			state: steam.length || fades || heavy ? "flag" : "ok"
		};
		if (m.id === "anomaly") return {
			...base,
			last: crit ? `${crit} critical` : outlier ? `${outlier} outliers` : `${flagged.length} info flags`,
			state: crit ? "flag" : flagged.length ? "flag" : "ok"
		};
		if (m.id === "montecarlo") return {
			...base,
			last: `${paths.toLocaleString()} paths`,
			state: chaos.length ? "flag" : "ok"
		};
		if (m.id === "ev") return {
			...base,
			last: `${plus.length} tickets ≥ 3% EV · CLV ${meanClv >= 0 ? "+" : ""}${meanClv.toFixed(1)}`,
			state: plus.length ? "ok" : "idle"
		};
		if (m.id === "parlay") return {
			...base,
			last: "path-joint SGP · copula on wind totals",
			state: "ok"
		};
		if (m.id === "execution") return {
			...base,
			last: "q10 Kelly · 3% cap · paper only",
			state: "ok"
		};
		if (m.id === "risk") return {
			...base,
			last: "3% unit cap · 21+ rail on",
			state: "ok"
		};
		const pri = getPriors();
		return {
			...base,
			last: pri.n ? `W${pri.fromWeek}–W${pri.toWeek} · ${pri.hits}/${pri.n} · Brier ${pri.brier.toFixed(2)}` : "waiting on graded weeks",
			state: pri.n ? "ok" : "idle"
		};
	});
}
function gameLabel(id) {
	const g = getGame(id);
	return g ? `${g.away} @ ${g.home}` : id;
}
function briefAgent(id, ctx) {
	const { results, parlays, props, tickets, sims, lastRunMs, bankroll } = ctx;
	const health = pipelineHealth(results, sims, lastRunMs);
	const plus = [...results].filter((r) => r.pick.ev >= MIN_EV).sort((a, b) => b.pick.ev - a.pick.ev);
	const steam = results.filter((r) => r.steam !== "stable");
	const flagged = [...results].filter((r) => r.anomaly.state !== "normal").sort((a, b) => b.anomaly.score - a.anomaly.score);
	const book = analyzeBook(tickets, bankroll);
	const pri = getPriors();
	const propHits = props.filter((p) => p.pick !== "pass");
	if (id === "ingestion") return {
		id,
		facts: [
			{
				k: "Games",
				v: String(results.length || 16)
			},
			{
				k: "Cadence",
				v: `${health.cadenceMin}m`
			},
			{
				k: "Failover",
				v: "Book B standby"
			}
		],
		items: results.slice(0, 6).map((r) => {
			const g = getGame(r.gameId);
			return {
				label: gameLabel(r.gameId),
				meta: g?.kickoffLabel ?? "",
				href: `/game/${r.gameId}`
			};
		}),
		note: "Nine feeds. Schema-checked. Nothing prices until Monte Carlo finishes."
	};
	if (id === "signals") return {
		id,
		facts: [
			{
				k: "Steam / RLM",
				v: String(steam.length),
				tone: steam.length ? "warn" : void 0
			},
			{
				k: "Public fades",
				v: String(results.filter((r) => getGame(r.gameId) && isPublicFlag(getGame(r.gameId))).length)
			},
			{
				k: "Sharp leans",
				v: String(results.filter((r) => r.sharp && (r.sharp.grade === "sharp" || r.sharp.grade === "heavy")).length)
			}
		],
		items: steam.slice(0, 6).map((r) => ({
			label: gameLabel(r.gameId),
			meta: `${r.steam} ${formatSigned(r.steamPts)}`,
			href: `/game/${r.gameId}`
		})),
		note: "Tape and splits write the snapshot. Anomaly only reads."
	};
	if (id === "anomaly") return {
		id,
		facts: [
			{
				k: "Flagged",
				v: String(flagged.length),
				tone: flagged.length ? "warn" : void 0
			},
			{
				k: "Critical",
				v: String(results.filter((r) => r.anomaly.state === "critical").length),
				tone: results.some((r) => r.anomaly.state === "critical") ? "loss" : void 0
			},
			{
				k: "Drift |z|",
				v: health.drift.toFixed(2)
			}
		],
		items: flagged.slice(0, 6).map((r) => ({
			label: gameLabel(r.gameId),
			meta: `${r.anomaly.state} ${r.anomaly.score.toFixed(0)} · ${r.anomaly.signals.slice(0, 2).join(" · ")}`,
			href: `/game/${r.gameId}`
		})),
		note: "Outlier and critical inflate variance 18–30% and shift the mean 0.4 of steam."
	};
	if (id === "montecarlo") {
		const paths = results.reduce((s, r) => s + r.sims, 0);
		const chaos = results.filter((r) => r.chaosTriggers > .05);
		return {
			id,
			facts: [
				{
					k: "Paths",
					v: paths ? paths.toLocaleString() : String(sims)
				},
				{
					k: "Chaos games",
					v: String(chaos.length),
					tone: chaos.length ? "warn" : void 0
				},
				{
					k: "Latency",
					v: lastRunMs ? `${lastRunMs} ms` : "—"
				}
			],
			items: [...results].sort((a, b) => b.stdMargin - a.stdMargin).slice(0, 5).map((r) => ({
				label: gameLabel(r.gameId),
				meta: `σ ${r.stdMargin.toFixed(1)} · cover ${formatPct(r.homeCover)}`,
				href: `/game/${r.gameId}`
			})),
			note: "Run a scenario below to shock steam, outs, public, or wind without touching the live book."
		};
	}
	if (id === "ev") {
		const clv = results.length ? results.reduce((s, r) => s + r.clvPts, 0) / results.length : 0;
		return {
			id,
			facts: [
				{
					k: "+EV ≥ 3%",
					v: String(plus.length),
					tone: plus.length ? "profit" : void 0
				},
				{
					k: "Mean CLV",
					v: `${formatSigned(clv)} pts`
				},
				{
					k: "Passes",
					v: String(Math.max(0, results.length - plus.length))
				}
			],
			items: plus.slice(0, 6).map((r) => ({
				label: r.pick.side,
				meta: `${formatSigned(r.pick.ev * 100)}% EV · ${formatPct(r.pick.prob)}`,
				href: `/game/${r.gameId}`
			})),
			note: "Juice stripped. Reliability curve and q10 size sit in front of Kelly."
		};
	}
	if (id === "parlay") return {
		id,
		facts: [
			{
				k: "Tickets",
				v: String(parlays.length)
			},
			{
				k: "Top edge",
				v: parlays[0] ? formatSigned(parlays[0].ev * 100) + "%" : "—",
				tone: parlays[0] ? "profit" : void 0
			},
			{
				k: "SGP",
				v: String(parlays.filter((p) => p.kind === "sgp").length)
			}
		],
		items: parlays.slice(0, 5).map((p) => ({
			label: p.legs.map((l) => l.side).join(" / "),
			meta: `${formatSigned(p.ev * 100)}% · ${p.jointMethod}`,
			href: "/parlay"
		})),
		note: "3-legs skip same-game stacks. Wind totals share a copula. Haircut is earned, not invented."
	};
	if (id === "execution") return {
		id,
		facts: [
			{
				k: "Paper tickets",
				v: String(tickets.length)
			},
			{
				k: "Stake",
				v: `$${Math.round(book.stake).toLocaleString()}`
			},
			{
				k: "Cap",
				v: "3% / game"
			}
		],
		items: tickets.slice(0, 6).map((t) => ({
			label: t.side,
			meta: `$${t.stake} · ${formatSigned(t.ev * 100)}% EV`,
			href: "/book"
		})),
		note: "Half-Kelly, then the 3% ceiling. Paper only. The lock lives on Record."
	};
	if (id === "risk") return {
		id,
		facts: [
			{
				k: "Ruin",
				v: formatPct(book.ruin),
				tone: book.ruin > .05 ? "loss" : void 0
			},
			{
				k: "P(down)",
				v: formatPct(book.pDown)
			},
			{
				k: "Exposure",
				v: formatPct(book.maxExposure)
			}
		],
		items: [
			{
				label: "21+ · paper only",
				meta: "No sportsbook transmission"
			},
			{
				label: "1-800-GAMBLER",
				meta: "Responsible-play rail"
			},
			{
				label: "KYC / AML",
				meta: "Regional flags default research-only"
			}
		],
		note: "Season paths on the current book. If ruin walks up, size comes down — the pick stays on the card."
	};
	return {
		id: "monitor",
		facts: [
			{
				k: "Brier",
				v: pri.n ? pri.brier.toFixed(2) : "—"
			},
			{
				k: "Graded",
				v: pri.n ? `${pri.hits}/${pri.n}` : "0"
			},
			{
				k: "Drift |z|",
				v: health.drift.toFixed(2)
			},
			{
				k: "Error rate",
				v: "0.0%"
			}
		],
		items: [
			{
				label: "Review",
				meta: pri.n ? `W${pri.fromWeek}–W${pri.toWeek} posteriors` : "waiting on a lock",
				href: "/learn"
			},
			{
				label: "Record",
				meta: "Public card, including passes",
				href: "/record"
			},
			{
				label: "Props",
				meta: `${propHits.length} +EV props`,
				href: "/props"
			}
		],
		note: "Grades write into the review. A miss stays. A weight moves only when the posterior clears the prior."
	};
}
function gameSlot(game) {
	if (game.weather.roof === "neutral") return "intl";
	if (game.network === "Prime") return "tnf";
	if (game.network === "NBC") return "snf";
	if (game.network === "ESPN") return "mnf";
	if (game.kickoffLabel.includes("4:")) return "sun_late";
	return "sun_early";
}
function slotLabel(slot) {
	if (slot === "tnf") return "Thursday Night";
	if (slot === "snf") return "Sunday Night";
	if (slot === "mnf") return "Monday Night";
	if (slot === "intl") return "International";
	if (slot === "sun_late") return "Sunday late";
	return "Sunday early";
}
function isPrime(slot) {
	return slot === "tnf" || slot === "snf" || slot === "mnf";
}
var LEAGUE_FLAGS = 12.2;
var LEAGUE_DPI = 2.1;
var CREWS = {
	blakeman: {
		id: "blakeman",
		name: "Clete Blakeman",
		flagsPerGame: 14.2,
		penaltyYds: 118,
		homeBias: .45,
		totalLean: 1.2,
		dpi: "high",
		dpiPerGame: 2.8,
		holding: "high",
		personalFouls: 1.8,
		homeAts: .54,
		overPct: .56,
		sackLean: -.4,
		style: "whistle",
		note: "TNF regular. Flags and DPI both live."
	},
	wrolstad: {
		id: "wrolstad",
		name: "Craig Wrolstad",
		flagsPerGame: 12.8,
		penaltyYds: 106,
		homeBias: .2,
		totalLean: .4,
		dpi: "avg",
		dpiPerGame: 2.2,
		holding: "avg",
		personalFouls: 1.5,
		homeAts: .51,
		overPct: .52,
		sackLean: 0,
		style: "standard"
	},
	allen: {
		id: "allen",
		name: "Brad Allen",
		flagsPerGame: 13.6,
		penaltyYds: 114,
		homeBias: .55,
		totalLean: .8,
		dpi: "avg",
		dpiPerGame: 2.4,
		holding: "avg",
		personalFouls: 1.9,
		homeAts: .57,
		overPct: .54,
		sackLean: -.1,
		style: "whistle",
		note: "Visitor flags run high. Home ATS is the tell."
	},
	hochuli: {
		id: "hochuli",
		name: "Shawn Hochuli",
		flagsPerGame: 15.1,
		penaltyYds: 128,
		homeBias: .15,
		totalLean: 1.8,
		dpi: "high",
		dpiPerGame: 3.2,
		holding: "high",
		personalFouls: 1.7,
		homeAts: .51,
		overPct: .61,
		sackLean: -.6,
		style: "whistle",
		note: "Most flags in the league. Holding kills sacks. Overs."
	},
	clark: {
		id: "clark",
		name: "Land Clark",
		flagsPerGame: 11.4,
		penaltyYds: 94,
		homeBias: .2,
		totalLean: -.3,
		dpi: "avg",
		dpiPerGame: 1.8,
		holding: "avg",
		personalFouls: 1.2,
		homeAts: .5,
		overPct: .48,
		sackLean: .1,
		style: "standard"
	},
	martin: {
		id: "martin",
		name: "Clay Martin",
		flagsPerGame: 12.1,
		penaltyYds: 100,
		homeBias: .25,
		totalLean: .2,
		dpi: "avg",
		dpiPerGame: 2,
		holding: "avg",
		personalFouls: 1.3,
		homeAts: .51,
		overPct: .51,
		sackLean: 0,
		style: "standard"
	},
	hill: {
		id: "hill",
		name: "Adrian Hill",
		flagsPerGame: 13,
		penaltyYds: 108,
		homeBias: .2,
		totalLean: .5,
		dpi: "avg",
		dpiPerGame: 2.5,
		holding: "avg",
		personalFouls: 1.4,
		homeAts: .52,
		overPct: .53,
		sackLean: -.1,
		style: "standard"
	},
	vinovich: {
		id: "vinovich",
		name: "Bill Vinovich",
		flagsPerGame: 10.2,
		penaltyYds: 82,
		homeBias: .1,
		totalLean: -1.1,
		dpi: "low",
		dpiPerGame: 1.4,
		holding: "low",
		personalFouls: 1,
		homeAts: .49,
		overPct: .43,
		sackLean: .5,
		style: "let-play",
		note: "Lets them play. Unders. Sacks stay on the card."
	},
	cheffers: {
		id: "cheffers",
		name: "Carl Cheffers",
		flagsPerGame: 13.4,
		penaltyYds: 110,
		homeBias: .3,
		totalLean: .6,
		dpi: "avg",
		dpiPerGame: 2.3,
		holding: "high",
		personalFouls: 1.6,
		homeAts: .53,
		overPct: .54,
		sackLean: -.3,
		style: "standard"
	},
	torbert: {
		id: "torbert",
		name: "Ron Torbert",
		flagsPerGame: 12.6,
		penaltyYds: 104,
		homeBias: .2,
		totalLean: .3,
		dpi: "avg",
		dpiPerGame: 2.1,
		holding: "avg",
		personalFouls: 1.4,
		homeAts: .51,
		overPct: .52,
		sackLean: 0,
		style: "standard"
	},
	novak: {
		id: "novak",
		name: "Scott Novak",
		flagsPerGame: 11.8,
		penaltyYds: 96,
		homeBias: .35,
		totalLean: -.4,
		dpi: "low",
		dpiPerGame: 1.7,
		holding: "low",
		personalFouls: 1.2,
		homeAts: .53,
		overPct: .47,
		sackLean: .2,
		style: "let-play"
	},
	hussey: {
		id: "hussey",
		name: "John Hussey",
		flagsPerGame: 12.4,
		penaltyYds: 102,
		homeBias: .2,
		totalLean: .2,
		dpi: "avg",
		dpiPerGame: 2,
		holding: "avg",
		personalFouls: 1.3,
		homeAts: .5,
		overPct: .51,
		sackLean: 0,
		style: "standard"
	},
	smith: {
		id: "smith",
		name: "Shawn Smith",
		flagsPerGame: 11.6,
		penaltyYds: 95,
		homeBias: .25,
		totalLean: -.2,
		dpi: "avg",
		dpiPerGame: 1.8,
		holding: "avg",
		personalFouls: 1.1,
		homeAts: .51,
		overPct: .49,
		sackLean: .1,
		style: "standard"
	},
	kemp: {
		id: "kemp",
		name: "Alex Kemp",
		flagsPerGame: 12.9,
		penaltyYds: 107,
		homeBias: 0,
		totalLean: .5,
		dpi: "avg",
		dpiPerGame: 2.2,
		holding: "avg",
		personalFouls: 1.5,
		homeAts: .5,
		overPct: .53,
		sackLean: 0,
		style: "standard",
		note: "Neutral site. Home-whistle lean is off."
	},
	blake: {
		id: "blake",
		name: "Tra Blake",
		flagsPerGame: 13.2,
		penaltyYds: 109,
		homeBias: .2,
		totalLean: .7,
		dpi: "high",
		dpiPerGame: 2.7,
		holding: "avg",
		personalFouls: 1.5,
		homeAts: .51,
		overPct: .54,
		sackLean: -.2,
		style: "whistle"
	},
	eck: {
		id: "eck",
		name: "Alan Eck",
		flagsPerGame: 13.8,
		penaltyYds: 116,
		homeBias: .4,
		totalLean: 1,
		dpi: "avg",
		dpiPerGame: 2.4,
		holding: "high",
		personalFouls: 1.7,
		homeAts: .54,
		overPct: .55,
		sackLean: -.3,
		style: "whistle",
		note: "MNF. Flags travel with the lights."
	}
};
function crewOf(game) {
	return CREWS[game.crewId] ?? CREWS.martin;
}
function gradeOf$1(score, style) {
	if (score >= 70) return style === "let-play" ? "scripted" : "whistle";
	if (score >= 48) return style === "let-play" ? "scripted" : style === "whistle" ? "whistle" : "watch";
	if (score >= 30) return "watch";
	return "quiet";
}
function analyzeRef(game) {
	const crew = crewOf(game);
	const slot = gameSlot(game);
	const wind = game.weather.roof === "open" || game.weather.roof === "neutral" ? game.weather.windMph ?? 0 : 0;
	const dome = game.weather.roof === "dome" || game.weather.roof === "retractable";
	const tells = [];
	const add = (id, label, pts, fire, note) => {
		if (!fire || pts <= 0) return;
		tells.push({
			id,
			label,
			pts,
			note
		});
	};
	const flagGap = crew.flagsPerGame - LEAGUE_FLAGS;
	add("flags", flagGap >= 1.5 ? "Whistle crew" : "Let them play", Math.min(22, Math.abs(flagGap) * 7), Math.abs(flagGap) >= 1.2, `${crew.flagsPerGame.toFixed(1)} flags/g vs league ${LEAGUE_FLAGS}. ${crew.penaltyYds} penalty yards.`);
	add("dpi", "DPI", crew.dpi === "high" ? 14 : crew.dpi === "low" ? 8 : 0, crew.dpi !== "avg", `${crew.dpiPerGame.toFixed(1)} DPI/g vs ${LEAGUE_DPI}. ${crew.dpi === "high" ? "Pass games get free yards." : "Secondary can play tight."}`);
	add("holding", "Offensive holding", crew.holding === "high" ? 12 : crew.holding === "low" ? 8 : 0, crew.holding !== "avg", crew.holding === "high" ? "Holding is live. Drives extend, sacks get picked up." : "Holding stays in the pocket. Sacks can cash.");
	add("total", crew.totalLean >= 0 ? "Over lean" : "Under lean", Math.min(20, Math.abs(crew.totalLean) * 12), Math.abs(crew.totalLean) >= .5, `Career overlay ${crew.totalLean > 0 ? "+" : ""}${crew.totalLean.toFixed(1)} on the total. Overs ${Math.round(crew.overPct * 100)}%.`);
	add("home", "Home whistle", Math.round(crew.homeBias * 22), crew.homeBias >= .35, `Visitor flags run high. Home ATS ${Math.round(crew.homeAts * 100)}%.`);
	add("pf", "Personal fouls", crew.personalFouls >= 1.7 ? 8 : 0, crew.personalFouls >= 1.7, `${crew.personalFouls.toFixed(1)} 15-yard flags/g. Variance up.`);
	add("dome", "Dome + whistle", 10, dome && crew.style === "whistle", "Indoor passing plus a flag crew. Overs stack.");
	add("division", "Division trench", 8, crew.style === "let-play" && (game.id === "cin-pit" || game.id === "ari-sf"), "Low-whistle crew on a physical matchup. Unders and sacks.");
	let conflict = null;
	if (slot === "tnf" && crew.totalLean >= .8) conflict = "TNF unders fight this crew’s over lean. Fade the total, don’t stack it.";
	else if (wind >= 12 && crew.totalLean >= .8) conflict = `Wind ${wind} mph vs a whistle-over crew. Don’t auto-take the over.`;
	else if (slot === "intl" && crew.homeBias > 0) conflict = "Neutral site. Ignore the home-whistle ATS.";
	const score = Math.max(0, Math.min(100, tells.reduce((s, t) => s + t.pts, 0)));
	return {
		crew,
		score,
		grade: gradeOf$1(score, crew.style),
		totalLean: crew.totalLean >= .6 || crew.overPct >= .55 ? "over" : crew.totalLean <= -.6 || crew.overPct <= .47 ? "under" : "even",
		sideLean: slot === "intl" || crew.homeBias < .3 ? "even" : crew.homeBias >= .4 ? "home" : "even",
		sackLean: crew.sackLean <= -.25 ? "down" : crew.sackLean >= .25 ? "up" : "even",
		passLean: crew.dpi === "high" ? "up" : crew.dpi === "low" ? "down" : "even",
		tells,
		conflict
	};
}
function isRefFlag(read) {
	return read.grade === "whistle" || read.grade === "scripted";
}
function refTone(grade) {
	if (grade === "whistle") return "loss";
	if (grade === "scripted") return "warn";
	if (grade === "watch") return "outline";
	return "default";
}
var SWINGS = [
	{
		id: "penix",
		gameId: "atl-gb",
		name: "Michael Penix Jr.",
		team: "ATL",
		pos: "QB",
		status: "questionable",
		pts: -4.2,
		passMult: -.18,
		note: "Ankle. Falcons already scoring 9.5 ppg."
	},
	{
		id: "love",
		gameId: "atl-gb",
		name: "Jordan Love",
		team: "GB",
		pos: "QB",
		status: "active",
		pts: -3.6,
		passMult: -.14,
		note: "If he sits, GB becomes a run shop at home."
	},
	{
		id: "herbert-ot",
		gameId: "lac-buf",
		name: "Rashawn Slater",
		team: "LAC",
		pos: "OT",
		status: "questionable",
		pts: -1.8,
		sackMult: .12,
		note: "LT vs Highmark wind and a pass rush."
	},
	{
		id: "garrett",
		gameId: "car-cle",
		name: "Myles Garrett",
		team: "CLE",
		pos: "EDGE",
		status: "active",
		pts: 2.4,
		sackMult: -.16,
		note: "If he’s out, Carolina’s number is a different bet."
	},
	{
		id: "stbrown",
		gameId: "nyj-det",
		name: "Amon-Ra St. Brown",
		team: "DET",
		pos: "WR",
		status: "active",
		pts: -1.6,
		passMult: -.08,
		note: "WR1. Dome game, volume is the whole over."
	},
	{
		id: "stroud",
		gameId: "hou-ind",
		name: "C.J. Stroud",
		team: "HOU",
		pos: "QB",
		status: "active",
		pts: -3.8,
		passMult: -.16,
		note: "Texans are a small road favorite only if he’s out there."
	},
	{
		id: "nix",
		gameId: "lar-den",
		name: "Bo Nix",
		team: "DEN",
		pos: "QB",
		status: "active",
		pts: -3.2,
		passMult: -.14,
		note: "Altitude + SNF. Chaos engine needs the starter."
	},
	{
		id: "stafford",
		gameId: "lar-den",
		name: "Matthew Stafford",
		team: "LAR",
		pos: "QB",
		status: "questionable",
		pts: -3.4,
		passMult: -.15,
		note: "Back. Visitor at altitude is already taxed."
	},
	{
		id: "mahomes-og",
		gameId: "kc-mia",
		name: "Trey Smith",
		team: "KC",
		pos: "OT",
		status: "active",
		pts: -1.1,
		sackMult: .1,
		note: "Interior. Mahomes without a clean pocket in Miami."
	},
	{
		id: "cmc",
		gameId: "ari-sf",
		name: "Christian McCaffrey",
		team: "SF",
		pos: "RB",
		status: "questionable",
		pts: -2.2,
		note: "Calf. 49ers script without him is a different total."
	},
	{
		id: "hurts",
		gameId: "phi-chi",
		name: "Jalen Hurts",
		team: "PHI",
		pos: "QB",
		status: "active",
		pts: -3.5,
		passMult: -.12,
		note: "If he sits, the tush push and the number both move."
	},
	{
		id: "chase",
		gameId: "cin-pit",
		name: "Ja'Marr Chase",
		team: "CIN",
		pos: "WR",
		status: "active",
		pts: -1.8,
		passMult: -.09,
		note: "WR1 vs a Pittsburgh front that lives on explosives."
	}
];
var active = /* @__PURE__ */ new Set();
function getActiveOuts() {
	return active;
}
function setActiveOuts(ids) {
	active = new Set(ids);
}
function swingsFor(gameId) {
	return SWINGS.filter((p) => p.gameId === gameId);
}
function outAdjustments(game, ids) {
	const adj = {
		homePts: 0,
		awayPts: 0,
		passMultHome: 0,
		passMultAway: 0,
		sackMult: 0,
		volMult: 1,
		notes: [],
		applied: []
	};
	const set = ids ? new Set(ids) : active;
	for (const p of swingsFor(game.id)) {
		if (!set.has(p.id)) continue;
		if (p.team === game.home) {
			adj.homePts += p.pts;
			adj.passMultHome += p.passMult ?? 0;
		} else {
			adj.awayPts += p.pts;
			adj.passMultAway += p.passMult ?? 0;
		}
		adj.sackMult += p.sackMult ?? 0;
		if (p.pos === "QB") adj.volMult *= 1.08;
		adj.applied.push(p.id);
		adj.notes.push(`${p.name} OUT (${p.pos}). ${p.note}`);
	}
	return adj;
}
var CLIMATE = {
	ARI: "warm",
	ATL: "warm",
	BAL: "moderate",
	BUF: "cold",
	CAR: "warm",
	CHI: "cold",
	CIN: "moderate",
	CLE: "cold",
	DAL: "warm",
	DEN: "altitude",
	DET: "dome",
	GB: "cold",
	HOU: "warm",
	IND: "dome",
	JAX: "warm",
	KC: "moderate",
	LAC: "warm",
	LAR: "warm",
	LV: "dome",
	MIA: "warm",
	MIN: "cold",
	NE: "cold",
	NO: "dome",
	NYG: "cold",
	NYJ: "cold",
	PHI: "moderate",
	PIT: "cold",
	SEA: "moderate",
	SF: "moderate",
	TB: "warm",
	TEN: "moderate",
	WAS: "moderate"
};
function conditionAdjustments(game) {
	const slot = gameSlot(game);
	const crew = crewOf(game);
	const home = TEAMS[game.home];
	const away = TEAMS[game.away];
	const notes = [];
	let homePts = 0;
	let awayPts = 0;
	let volMult = 1;
	let passH = 1;
	let passA = 1;
	let rushH = 1;
	let rushA = 1;
	let sackMult = 1;
	let stress = 0;
	const outdoor = game.weather.roof === "open" || game.weather.roof === "neutral";
	const wind = outdoor ? game.weather.windMph ?? 0 : 0;
	const temp = outdoor ? game.weather.tempF ?? 70 : 70;
	const windF = Math.max(0, (wind - 8) / 12);
	const heatF = temp >= 84 ? Math.min(1.2, (temp - 84) / 10) : 0;
	const pri = getPriors().haircuts;
	if (windF > 0) {
		const passHitH = windF * (.9 + Math.max(0, home.passEpa) * 4);
		const passHitA = windF * (.9 + Math.max(0, away.passEpa) * 4);
		homePts -= passHitH * .55;
		awayPts -= passHitA * .55;
		passH -= windF * .14 * pri.wind;
		passA -= windF * .16 * pri.wind;
		rushH += windF * (.08 + Math.max(0, home.rushEpa) * .6);
		rushA += windF * (.08 + Math.max(0, away.rushEpa) * .6);
		sackMult += windF * .12;
		volMult *= 1 + windF * .06;
		stress += windF * .45;
		notes.push(`Wind ${wind} mph. Passing discounted, rushing and sacks up.`);
	}
	if (heatF > 0) {
		const awayClimate = CLIMATE[game.away];
		awayPts -= heatF * (awayClimate === "cold" ? 1.5 : awayClimate === "moderate" ? 1.1 : .5);
		homePts -= heatF * .35;
		passA -= heatF * .08;
		volMult *= 1 + heatF * .04;
		stress += heatF * .4;
		notes.push(`${temp}°F heat. ${game.away} is a ${awayClimate} team — visitor legs go first.`);
	}
	if (game.home === "DEN" && outdoor) {
		awayPts -= .55;
		passA -= .06;
		volMult *= 1.04;
		stress += .25;
		notes.push("Altitude. Visiting passing and late-game legs fade.");
	}
	if (slot === "tnf") {
		const u = pri.tnf < 1 ? 1.25 : pri.tnf;
		homePts -= .35 * u;
		awayPts -= .55 * u;
		volMult *= 1.06;
		passH -= .04;
		passA -= .05;
		stress += .3;
		notes.push("Thursday Night. Short week, unders, road offense taxed more.");
	} else if (slot === "snf") {
		volMult *= 1.08;
		passH += .03;
		passA += .03;
		notes.push("Sunday Night. Variance up, passing volume a tick higher.");
	} else if (slot === "mnf") {
		volMult *= 1.07;
		homePts += .15;
		notes.push("Monday Night. Lights, flags, and a slight home bump.");
	} else if (slot === "intl") {
		homePts -= .85;
		volMult *= 1.1;
		stress += .35;
		notes.push("Neutral site. Home field in the number is fake.");
	}
	const flagDelta = (crew.flagsPerGame - LEAGUE_FLAGS) / 6;
	const totalSplit = crew.totalLean * .45 * pri.refOver;
	homePts += crew.homeBias * .35 + totalSplit / 2;
	awayPts += -crew.homeBias * .2 + totalSplit / 2;
	sackMult += Math.max(0, flagDelta) * .08;
	sackMult += crew.sackLean * .1;
	if (crew.holding === "high") sackMult -= .08;
	if (crew.holding === "low") sackMult += .06;
	if (crew.dpi === "high") {
		passH += .03;
		passA += .03;
	} else if (crew.dpi === "low") {
		passH -= .02;
		passA -= .02;
	}
	if (crew.personalFouls >= 1.7) volMult *= 1.04;
	if (Math.abs(crew.totalLean) >= .8) stress += .15;
	return {
		slot,
		slotLabel: slotLabel(slot),
		crew,
		homePts: round1(homePts),
		awayPts: round1(awayPts),
		volMult: Math.round(volMult * 100) / 100,
		passMultHome: clampMult(passH),
		passMultAway: clampMult(passA),
		rushMultHome: clampMult(rushH),
		rushMultAway: clampMult(rushA),
		sackMult: clampMult(sackMult),
		stress: Math.max(0, Math.min(1, stress)),
		notes
	};
}
function adjustPropMean(prop, game) {
	const adj = conditionAdjustments(game);
	const outs = outAdjustments(game);
	const homeSide = prop.team === game.home;
	const market = prop.market.toLowerCase();
	let mean = prop.mean;
	let note = null;
	if (market.includes("pass")) {
		const m = (homeSide ? adj.passMultHome : adj.passMultAway) * (1 + (homeSide ? outs.passMultHome : outs.passMultAway));
		mean *= m;
		if (Math.abs(m - 1) >= .04) note = `Pass factor ${m.toFixed(2)}×`;
		if (outs.notes.length) note = `${note ?? "Pass"} · ${outs.notes[0]}`;
	} else if (market.includes("rush")) {
		const m = homeSide ? adj.rushMultHome : adj.rushMultAway;
		mean *= m;
		if (Math.abs(m - 1) >= .04) note = `Wind/rush factor ${m.toFixed(2)}×`;
	} else if (market.includes("sack")) {
		mean *= adj.sackMult * (1 + outs.sackMult);
		if (Math.abs(adj.sackMult - 1) >= .04 || outs.sackMult) note = `Sack factor ${(adj.sackMult * (1 + outs.sackMult)).toFixed(2)}×`;
	}
	return {
		mean,
		note
	};
}
function round1(n) {
	return Math.round(n * 10) / 10;
}
function clampMult(n) {
	return Math.round(Math.max(.75, Math.min(1.25, n)) * 100) / 100;
}
function coverAt(margins, homeSpread) {
	if (!margins.length) return .5;
	let c = 0;
	for (const m of margins) if (m + homeSpread > 0) c += 1;
	return c / margins.length;
}
/** Buy = harder number (favorite lays more, dog gets more). Sell = easier number. */
function keyCall(posted, margins, price) {
	const postedCover = coverAt(margins, posted);
	const postedEv = evFromProb(postedCover, price);
	let best = null;
	for (const key of KEY_NUMBERS$1) for (const sign of [-1, 1]) {
		const to = sign * key;
		const delta = Math.abs(to - posted);
		if (delta < .45 || delta > 1.05) continue;
		const cover = coverAt(margins, to);
		const boughtPrice = price - delta / .5 * 10;
		const evLift = evFromProb(cover, boughtPrice) - postedEv;
		const action = Math.abs(to) > Math.abs(posted) ? "buy" : "sell";
		const cand = {
			action,
			from: posted,
			to,
			coverFrom: postedCover,
			coverTo: cover,
			evLift,
			worth: evLift >= .004,
			note: action === "sell" ? `Sell ${posted} to ${to}. On the key, cover ${format(cover)} vs ${format(postedCover)}.` : `Buy ${posted} to ${to}. Paying juice to sit on ${key}.`
		};
		if (!best || cand.evLift > best.evLift) best = cand;
	}
	if (!best) {
		const onKey = KEY_NUMBERS$1.some((k) => Math.abs(Math.abs(posted) - k) < .05);
		return {
			action: "hold",
			from: posted,
			to: posted,
			coverFrom: postedCover,
			coverTo: postedCover,
			evLift: 0,
			worth: onKey,
			note: onKey ? `Posted ${posted} is already a key. Hold.` : "No 3 / 7 / 10 within a point."
		};
	}
	if (!best.worth && KEY_NUMBERS$1.some((k) => Math.abs(Math.abs(posted) - k) < .05)) return {
		...best,
		action: "hold",
		note: `Posted ${posted} is on a key. The buy/sell does not print.`
	};
	return best;
}
function rankScore(ev, line, market, call) {
	let s = ev;
	if (market !== "spread") return s;
	const a = Math.abs(line);
	if (a === 3 || a === 7) s += .01;
	else if (a === 2.5 || a === 3.5 || a === 6.5 || a === 7.5) s += .002;
	if (call?.worth && call.action !== "hold") s += Math.max(0, call.evLift);
	return s;
}
function format(p) {
	return `${(p * 100).toFixed(1)}%`;
}
var EDGES = [
	.45,
	.5,
	.55,
	.6,
	.65,
	.75
];
function reliability(rows) {
	const decided = rows.filter((t) => (t.result === "win" || t.result === "loss") && t.kind !== "parlay");
	const out = [];
	for (let i = 0; i < EDGES.length - 1; i++) {
		const lo = EDGES[i];
		const hi = EDGES[i + 1];
		const xs = decided.filter((t) => t.prob >= lo && t.prob < hi);
		const hits = xs.filter((t) => t.result === "win").length;
		const exp = xs.length ? xs.reduce((s, t) => s + t.prob, 0) / xs.length : (lo + hi) / 2;
		out.push({
			lo,
			hi,
			n: xs.length,
			hits,
			exp,
			hit: xs.length ? hits / xs.length : exp
		});
	}
	return out;
}
/** Shrink model p toward observed hit rate. A small hot sample cannot inflate the edge. */
function calibrateProb(p, buckets, k = 12) {
	const b = buckets.find((x) => p >= x.lo && p < x.hi);
	if (!b || b.n < 8) return p;
	const w = b.n / (b.n + k);
	const mixed = w * b.hit + (1 - w) * p;
	if ((p >= .5 && mixed > p || p < .5 && mixed < p) && b.n < 80) return p;
	return mixed;
}
var STEAM_PTS = 1.5;
function rating$1(abbr) {
	return TEAMS[abbr]?.ratingZ ?? 0;
}
function steamPts(game) {
	return game.line.spread - game.line.spreadOpen;
}
function totalMove(game) {
	return game.line.total - game.line.totalOpen;
}
function sideFlipped(game) {
	const open = game.line.spreadOpen;
	const now = game.line.spread;
	if (open === 0) return Math.abs(now) >= STEAM_PTS;
	if (now === 0) return Math.abs(open) >= STEAM_PTS;
	return Math.sign(open) !== Math.sign(now);
}
function steamSignal(game) {
	if (game.line.books?.length) return {
		steam: "stable",
		dir: "none",
		pts: 0
	};
	const pts = steamPts(game);
	const abs = Math.abs(pts);
	const flip = sideFlipped(game);
	const towardHome = pts < 0;
	const homeIsFav = game.line.spread < 0;
	const pubAgainst = againstPublic(game, towardHome);
	const pub = publicRead(game);
	if (flip || pubAgainst && abs >= 1 && pub.publicPct >= 65 || pubAgainst && abs >= 1.5) return {
		steam: "rlm",
		dir: "underdog",
		pts
	};
	if (abs < 1.5 && !flip) return {
		steam: "stable",
		dir: "none",
		pts
	};
	return {
		steam: "steam",
		dir: towardHome === homeIsFav ? "favorite" : "underdog",
		pts
	};
}
function buildFeatures(game, opts = {}) {
	const residual = (rating$1(game.home) - rating$1(game.away)) * 3.2 + 1.4 - -game.line.spread;
	const liveBoard = Boolean(game.line.books?.length);
	const move = liveBoard ? 0 : steamPts(game);
	const absMove = Math.abs(move);
	const tot = liveBoard ? 0 : totalMove(game);
	const pub = publicRead(game);
	const cond = conditionAdjustments(game);
	const nearKey = KEY_NUMBERS.some((k) => Math.abs(Math.abs(game.line.spread) - k) < .2);
	const weatherStress = Math.max(cond.stress, game.weather.roof === "open" && (game.weather.windMph ?? 0) >= 12 ? ((game.weather.windMph ?? 0) - 8) / 10 : game.weather.roof === "open" && (game.weather.tempF ?? 70) >= 86 ? .45 : game.weather.roof === "neutral" ? .4 : 0);
	return {
		gameId: game.id,
		leadLag24h: move,
		steam60m: move * .45,
		defendedKey: nearKey && absMove < .6,
		residualZ: residual / 3.4,
		residualPersistHours: Math.min(18, Math.abs(residual) * 3.2),
		handleTicketsDiv: Math.tanh(pub.splitHome / 14),
		sharpTiltAlign: Math.sign(move) === Math.sign(pub.splitHome) ? Math.min(1, absMove / 2) : -Math.min(1, absMove / 2),
		propMismatchPts: game.id === "lar-den" ? 1.4 : Math.abs(residual) > 3 ? .8 : .1,
		weatherStress,
		outlierDev: absMove,
		totalMove: tot,
		sideFlip: sideFlipped(game),
		chaosGame: Boolean(opts.chaos) && (game.home === "DEN" || game.away === "DEN"),
		ticketsHome: pub.ticketsHome,
		handleHome: pub.handleHome,
		publicFade: pub.fade !== null
	};
}
function scoreAnomaly(fs) {
	const w = ANOMALY_WEIGHTS;
	let raw = 0;
	const signals = [];
	const add = (label, pts, fire) => {
		raw += pts;
		if (fire && pts >= 3.5) signals.push(label);
	};
	add("lead-lag drift", w.leadLag * Math.min(1, Math.abs(fs.leadLag24h) / 2), Math.abs(fs.leadLag24h) >= 1.5);
	add("final-hour steam", w.steam * Math.min(1, Math.abs(fs.steam60m) / 1), Math.abs(fs.steam60m) >= .7);
	add("defended number", fs.defendedKey ? w.defended : 0, fs.defendedKey);
	add("outlier book", w.outlier * Math.min(1, fs.outlierDev / 1.8), fs.outlierDev >= 1.5);
	add("residual z", w.residualZ * Math.min(1, Math.abs(fs.residualZ) / 1.6), Math.abs(fs.residualZ) >= 1.2);
	add("residual persist", w.persist * Math.min(1, fs.residualPersistHours / 10), fs.residualPersistHours >= 6);
	add("handle/tickets div", w.div * Math.min(1, Math.abs(fs.handleTicketsDiv)), Math.abs(fs.handleTicketsDiv) >= .5);
	add("sharp tilt align", w.tilt * Math.max(0, fs.sharpTiltAlign), fs.sharpTiltAlign >= .4);
	add("prop mismatch", w.prop * Math.min(1, fs.propMismatchPts / 1.6), fs.propMismatchPts >= 1);
	add("weather stress", w.weather * Math.min(1, fs.weatherStress / .6), fs.weatherStress >= .35);
	add("side reverse", fs.sideFlip ? 16 : 0, fs.sideFlip);
	add("total steam", 8 * Math.min(1, Math.abs(fs.totalMove) / 2.5), Math.abs(fs.totalMove) >= 2);
	add("chaos profile", fs.chaosGame ? 8 : 0, fs.chaosGame);
	add("public fade", fs.publicFade ? 8 : 0, fs.publicFade);
	const score = Math.max(0, Math.min(100, raw));
	const nFire = signals.length;
	let state = "normal";
	if (score >= ANOMALY_THRESHOLDS.critical && nFire >= 2) state = "critical";
	else if (score >= ANOMALY_THRESHOLDS.outlier) state = "outlier";
	else if (score >= ANOMALY_THRESHOLDS.info) state = "info";
	return {
		gameId: fs.gameId,
		score,
		state,
		signals,
		snapshot: fs
	};
}
function isTapeFlag(r) {
	return r.steam !== "stable";
}
function isAnomalyFlag(r) {
	return r.anomaly.state !== "normal";
}
function flagTone(state) {
	if (state === "critical") return "loss";
	if (state === "outlier") return "warn";
	return "default";
}
function crossedKey(open, now) {
	for (const k of KEY_NUMBERS) {
		const a = Math.abs(open);
		const b = Math.abs(now);
		if ((a - k) * (b - k) < 0) return k;
		if (a === k && b !== k) return k;
		if (b === k && a !== k) return k;
	}
	return null;
}
function gradeOf(score) {
	if (score >= 70) return "heavy";
	if (score >= 45) return "sharp";
	if (score >= 28) return "watch";
	return "none";
}
function analyzeSharp(game, steam) {
	const taped = !game.line.books?.length;
	const sig = steam ?? steamSignal(game);
	const pub = publicRead(game);
	const pts = sig.pts;
	const abs = Math.abs(pts);
	const towardHome = pts < 0;
	const moveTeam = towardHome ? game.home : game.away;
	const handleOnMove = towardHome ? pub.handleHome : pub.handleAway;
	const ticketsOnMove = towardHome ? pub.ticketsHome : pub.ticketsAway;
	const handleLed = abs >= 1 && handleOnMove >= ticketsOnMove + 8;
	const key = crossedKey(game.line.spreadOpen, game.line.spread);
	const tot = totalMove(game);
	const tells = [];
	const add = (id, label, value, fire, note) => {
		if (!fire || value <= 0) return;
		tells.push({
			id,
			label,
			pts: value,
			note
		});
	};
	add("rlm", "Reverse line move", 28, taped && sig.steam === "rlm", `${pub.publicPct}% of tickets on ${pub.publicTeam}; number moved ${pts > 0 ? "+" : ""}${pts.toFixed(1)} against them.`);
	add("split", "Ticket / handle split", 22, pub.contrarian, `Tickets ${pub.publicPct}% ${pub.publicTeam}. Handle leans ${pub.sharpLean === "home" ? game.home : game.away} (${Math.abs(pub.splitHome)} pts).`);
	add("flip", "Side reverse", 16, taped && Math.sign(game.line.spreadOpen) !== 0 && Math.sign(game.line.spread) !== 0 && Math.sign(game.line.spreadOpen) !== Math.sign(game.line.spread), `Opened ${game.line.spreadOpen > 0 ? "+" : ""}${game.line.spreadOpen}, now ${game.line.spread > 0 ? "+" : ""}${game.line.spread}.`);
	add("handle-led", "Handle-led steam", 14, taped && handleLed && sig.steam !== "rlm", `Line toward ${moveTeam}. Handle ${handleOnMove}% vs tickets ${ticketsOnMove}% on that side.`);
	add("move", "Size of the move", abs >= 2.5 ? 10 : abs >= 2 ? 8 : 0, taped && abs >= 2, `${abs.toFixed(1)} points off the open.`);
	add("key", "Key number", 8, taped && key !== null, key !== null ? `Tape crossed ${key}.` : "");
	add("total", "Total steam", 8, taped && Math.abs(tot) >= 2.5, tot <= -2.5 ? `Total down ${Math.abs(tot).toFixed(1)}. Handle on the under ${100 - pub.handleOver}%.` : `Total up ${tot.toFixed(1)}. Handle on the over ${pub.handleOver}%.`);
	add("public-steam", "Public steam", 6, sig.steam === "steam" && !handleLed && !pub.contrarian && pub.publicPct >= 65, `Public and the number are on ${pub.publicTeam} together. Weaker tell.`);
	const score = Math.max(0, Math.min(100, tells.reduce((s, t) => s + t.pts, 0)));
	const grade = gradeOf(score);
	let leanSide = "none";
	if (pub.contrarian) leanSide = pub.sharpLean === "home" ? "home" : "away";
	else if (sig.steam === "rlm") leanSide = towardHome ? "home" : "away";
	else if (handleLed) leanSide = towardHome ? "home" : "away";
	else if (grade !== "none" && abs >= 1.5) leanSide = towardHome ? "home" : "away";
	const lean = leanSide === "home" ? game.home : leanSide === "away" ? game.away : null;
	const clvIfFollowed = leanSide === "home" ? -pts : leanSide === "away" ? pts : 0;
	return {
		score,
		grade,
		lean,
		leanSide,
		tells,
		fired: tells,
		handleLed,
		clvIfFollowed
	};
}
function isSharpFlag(read) {
	return read.grade === "sharp" || read.grade === "heavy";
}
function sharpTone(grade) {
	if (grade === "heavy") return "loss";
	if (grade === "sharp") return "warn";
	if (grade === "watch") return "outline";
	return "default";
}
function clvPts(game, pickingHome, market, side) {
	if (game.line.books?.length) return 0;
	if (market === "total") {
		const move = game.line.total - game.line.totalOpen;
		return side.startsWith("Over") ? move : -move;
	}
	const move = game.line.spread - game.line.spreadOpen;
	return pickingHome ? -move : move;
}
var BASE_STD = 13.5;
var BINS_FROM = -36;
var BINS_TO = 36;
var BIN_W = 2;
function rating(abbr) {
	return TEAMS[abbr]?.ratingZ ?? 0;
}
function variance(abbr) {
	return TEAMS[abbr]?.variance ?? 1;
}
function checkChaos(team, opponent, quarter, margin) {
	if (team === "DEN" && quarter === 4 && margin <= -14) return "GIANTS_MODE";
	if (team === "DEN" && (opponent === "KC" || opponent === "BUF" || opponent === "BAL")) return "CLUTCH_LUCK_MODE";
	const gap = rating(opponent) - rating(team);
	if (team === "DEN" && gap >= .6) return "CLUTCH_LUCK_MODE";
	return "NORMAL";
}
function matchupChaos(game) {
	if (game.home !== "DEN" && game.away !== "DEN") return "NORMAL";
	return checkChaos("DEN", game.home === "DEN" ? game.away : game.home, 1, 0);
}
function applyChaos(rng, mode, base) {
	if (mode === "GIANTS_MODE" && rng() < .3) return {
		score: base + 21,
		triggered: true
	};
	if (mode === "CLUTCH_LUCK_MODE") {
		const extra = choice(rng, [
			0,
			3,
			7
		], [
			.7,
			.2,
			.1
		]);
		return {
			score: base + extra,
			triggered: extra > 0
		};
	}
	return {
		score: base,
		triggered: false
	};
}
function histogram(margins) {
	const counts = /* @__PURE__ */ new Map();
	for (let b = BINS_FROM; b <= BINS_TO; b += BIN_W) counts.set(b, 0);
	for (const m of margins) {
		const bin = Math.round(Math.max(BINS_FROM, Math.min(BINS_TO, m)) / BIN_W) * BIN_W;
		counts.set(bin, (counts.get(bin) ?? 0) + 1);
	}
	const n = margins.length || 1;
	return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([bin, c]) => ({
		bin,
		p: c / n
	}));
}
function mean$2(xs) {
	if (!xs.length) return 0;
	let s = 0;
	for (const x of xs) s += x;
	return s / xs.length;
}
function stdev(xs, m) {
	if (xs.length < 2) return 0;
	let s = 0;
	for (const x of xs) s += (x - m) ** 2;
	return Math.sqrt(s / (xs.length - 1));
}
function pickBest(cands) {
	const ranked = [...cands].sort((a, b) => b.ev - a.ev);
	const pick = ranked.filter((c) => c.market === "spread").sort((a, b) => b.ev - a.ev)[0] ?? ranked[0];
	if (!pick) return {
		pick: {
			market: "spread",
			side: "pass",
			line: 0,
			price: -110,
			prob: .5,
			sizeProb: .5,
			ev: 0,
			kelly: 0
		},
		alts: []
	};
	return {
		pick,
		alts: ranked.filter((c) => c !== pick)
	};
}
function makePick(market, side, line, price, modelP) {
	const pri = getPriors();
	const rankP = calibrateProb(modelP, pri.reliability);
	const sized = sizeProb(rankP, pri.posts.all);
	return {
		market,
		side,
		line,
		price,
		prob: rankP,
		sizeProb: sized,
		ev: evFromProb(sized, price),
		kelly: kellyFraction(sized, price)
	};
}
function hashId(id) {
	let h = 2166136261;
	for (let i = 0; i < id.length; i++) {
		h ^= id.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function simulateGame(game, nSims = 8e3, seed = 20260921, chaos = true, opts) {
	const rng = mulberry32(seed + hashId(game.id));
	const hR = rating(game.home);
	const aR = rating(game.away);
	const spread = game.line.spread;
	const total = game.line.total;
	const marketH = (total - spread) / 2;
	const marketA = (total + spread) / 2;
	let hMean = marketH + hR * MEAN_SHIFT_FACTOR;
	let aMean = marketA + aR * MEAN_SHIFT_FACTOR;
	const cond = conditionAdjustments(game);
	hMean += cond.homePts;
	aMean += cond.awayPts;
	const outs = outAdjustments(game, opts?.outIds);
	hMean += outs.homePts;
	aMean += outs.awayPts;
	const chaosProfile = matchupChaos(game);
	const fs = buildFeatures(game, { chaos: chaos && chaosProfile !== "NORMAL" });
	const anomaly = scoreAnomaly(fs);
	const steam = steamSignal(game);
	let vol = BASE_STD * Math.sqrt((variance(game.home) + variance(game.away)) / 2);
	vol *= cond.volMult * outs.volMult;
	if ((anomaly.state === "outlier" || anomaly.state === "critical") && Math.abs(steam.pts) >= 1.5 && Math.abs(fs.residualZ) >= 2) vol *= 1.3;
	else if (anomaly.state === "outlier" || anomaly.state === "critical") vol *= 1.18;
	if (Math.abs(steam.pts) >= 1) {
		const pri = getPriors().haircuts;
		const mult = steam.steam === "rlm" ? pri.rlm : pri.steam;
		const shift = steam.pts * .4 * mult;
		hMean -= shift / 2;
		aMean += shift / 2;
	}
	const margins = new Array(nSims);
	const totals = new Array(nSims);
	const homes = new Array(nSims);
	const aways = new Array(nSims);
	let chaosTriggers = 0;
	let homeWin = 0;
	let homeCover = 0;
	let coverPush = 0;
	let over = 0;
	let oneScore = 0;
	let homeWinBy7 = 0;
	let awayWinBy7 = 0;
	let land3 = 0;
	let land7 = 0;
	const stride = Math.max(1, Math.floor(nSims / 1200));
	const paths = [];
	for (let i = 0; i < nSims; i++) {
		const hScore = gaussian(rng, hMean * .75, vol * .75);
		const aScore = gaussian(rng, aMean * .75, vol * .75);
		const currentMargin = hScore - aScore;
		const hMode = chaos ? checkChaos(game.home, game.away, 4, currentMargin) : "NORMAL";
		const aMode = chaos ? checkChaos(game.away, game.home, 4, -currentMargin) : "NORMAL";
		const hQ4 = applyChaos(rng, hMode, gaussian(rng, hMean * .25, 6));
		const aQ4 = applyChaos(rng, aMode, gaussian(rng, aMean * .25, 6));
		if (hQ4.triggered || aQ4.triggered) chaosTriggers += 1;
		let finalH = Math.max(0, hScore + hQ4.score);
		let finalA = Math.max(0, aScore + aQ4.score);
		if (chaos && Math.abs(finalH - finalA) <= 2) {
			const p = .6 * getPriors().haircuts.chaos;
			if (game.home === "DEN" && rng() < p) finalH += 3;
			if (game.away === "DEN" && rng() < p) finalA += 3;
		}
		let margin = finalH - finalA;
		if (Math.abs(margin) > 7 && rng() < .22) {
			margin *= 1.5;
			if (margin > 0) finalH = finalA + margin;
			else finalA = finalH - margin;
		}
		const h = Math.round(Math.max(0, finalH));
		const a = Math.round(Math.max(0, finalA));
		const m = h - a;
		const t = h + a;
		homes[i] = h;
		aways[i] = a;
		margins[i] = m;
		totals[i] = t;
		if (h > a) homeWin += 1;
		if (m + spread > 0) homeCover += 1;
		else if (m + spread === 0) coverPush += 1;
		if (t > total) over += 1;
		if (Math.abs(m) <= 8) oneScore += 1;
		if (m >= 7) homeWinBy7 += 1;
		if (m <= -7) awayWinBy7 += 1;
		if (Math.abs(m) === 3) land3 += 1;
		if (Math.abs(m) === 7) land7 += 1;
		if (i % stride === 0) paths.push({
			m,
			t
		});
	}
	const n = nSims;
	const homeCoverP = homeCover / n;
	const awayCoverP = (n - homeCover - coverPush) / n;
	const overP = over / n;
	const underP = 1 - overP;
	const homeWinP = homeWin / n;
	const awayWinP = 1 - homeWinP;
	const meanMargin = mean$2(margins);
	const stdMargin = stdev(margins, meanMargin);
	const { pick, alts } = pickBest([
		makePick("spread", `${game.home} ${spread > 0 ? "+" : ""}${spread}`, spread, game.line.spreadPrice, homeCoverP),
		makePick("spread", `${game.away} ${-spread > 0 ? "+" : ""}${-spread}`, -spread, game.line.awaySpreadPrice ?? game.line.spreadPrice, awayCoverP),
		makePick("total", `Over ${total}`, total, game.line.overPrice, overP),
		makePick("total", `Under ${total}`, total, game.line.underPrice, underP),
		makePick("ml", `${game.home} ML`, 0, game.line.homeMl, homeWinP),
		makePick("ml", `${game.away} ML`, 0, game.line.awayMl, awayWinP)
	]);
	const call = keyCall(spread, margins, game.line.spreadPrice);
	const edge = Math.abs(meanMargin - -spread);
	const confidence = Math.min(10, edge / Math.max(1, stdMargin) * 30);
	const pickingHome = pick.side.startsWith(game.home);
	const pointBuy = [];
	for (const delta of [
		-1.5,
		-1,
		-.5,
		0,
		.5,
		1,
		1.5
	]) {
		const to = spread + delta;
		let cover = 0;
		for (const m of margins) if (m + to > 0) cover += 1;
		const coverP = cover / n;
		const key = KEY_NUMBERS.some((k) => Math.abs(Math.abs(to) - k) < .05);
		const extraJuice = Math.abs(delta) / .5 * .1;
		const boughtPrice = -110 - extraJuice * 100;
		const evNow = evFromProb(homeCoverP, game.line.spreadPrice);
		const evBuy = evFromProb(coverP, boughtPrice);
		pointBuy.push({
			to,
			cover: coverP,
			deltaPts: (coverP - homeCoverP) * 100,
			worth: evBuy > evNow && extraJuice <= .15,
			key
		});
	}
	return {
		gameId: game.id,
		sims: n,
		homeMean: mean$2(homes),
		awayMean: mean$2(aways),
		meanMargin,
		stdMargin,
		meanTotal: mean$2(totals),
		homeWin: homeWinP,
		awayWin: awayWinP,
		homeCover: homeCoverP,
		awayCover: awayCoverP,
		coverPush: coverPush / n,
		over: overP,
		under: underP,
		oneScore: oneScore / n,
		homeWinBy7: homeWinBy7 / n,
		awayWinBy7: awayWinBy7 / n,
		land3: land3 / n,
		land7: land7 / n,
		chaosTriggers: chaosTriggers / n,
		histogram: histogram(margins),
		pick,
		alts,
		confidence,
		steam: steam.steam,
		steamPts: steam.pts,
		steamDir: steam.dir,
		anomaly,
		sharp: analyzeSharp(game, steam),
		pointBuy,
		keyCall: call,
		paths,
		outsApplied: outs.applied,
		rankScore: rankScore(pick.ev, pick.line, pick.market, call),
		clvPts: clvPts(game, pickingHome, pick.market, pick.side),
		chaosOn: chaos,
		chaosProfile
	};
}
function simulateProp(prop, n = 5e3, seed = 20260921) {
	const rng = mulberry32(seed + hashId(prop.id));
	const game = getGame(prop.gameId);
	const wx = game ? adjustPropMean(prop, game) : {
		mean: prop.mean,
		note: null
	};
	const samples = new Array(n);
	for (let i = 0; i < n; i++) if (prop.dist === "poisson") samples[i] = poisson(rng, wx.mean);
	else {
		const mu = Boolean(prop.chaosLift) && rng() < .35 ? wx.mean + (prop.chaosLift ?? 0) : wx.mean;
		samples[i] = gaussian(rng, mu, prop.sd ?? 35);
	}
	samples.sort((a, b) => a - b);
	const mu = mean$2(samples);
	const median = samples[Math.floor(n / 2)] ?? mu;
	const rawOver = samples.filter((x) => x > prop.line).length / n;
	const pOver = .75 * impliedProb(prop.overPrice) + .25 * rawOver;
	const evOver = evFromProb(pOver, prop.overPrice);
	const evUnder = evFromProb(1 - pOver, prop.underPrice);
	let pick = "pass";
	if (evOver >= .03 && evOver >= evUnder) pick = "over";
	else if (evUnder >= .03 && evUnder > evOver) pick = "under";
	return {
		id: prop.id,
		mean: mu,
		median,
		pOver,
		evOver,
		evUnder,
		pick,
		weatherNote: wx.note
	};
}
/** Plays we would actually bet: conservative EV and size. */
function wouldTake(ev, kelly) {
	return ev >= .03 && kelly > 0;
}
/** Best market on this game that clears the card. One ticket per game. */
function bestTake(result) {
	return [result.pick, ...result.alts].filter((c) => c.market !== "ml").filter((c) => wouldTake(c.ev, c.kelly)).sort((a, b) => b.ev - a.ev)[0] ?? null;
}
function slateSheet(results, games) {
	return games.map((g) => {
		const r = results.find((x) => x.gameId === g.id);
		if (!r) return {
			gameId: g.id,
			matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
			kickoff: g.kickoffLabel,
			side: "—",
			market: "spread",
			ev: 0,
			prob: 0,
			kelly: 0,
			take: false,
			passReason: "ev"
		};
		const bet = bestTake(r);
		const lean = r.pick;
		const take = Boolean(bet);
		const passReason = take ? "ok" : lean.ev < .03 ? "ev" : "size";
		const shown = bet ?? lean;
		return {
			gameId: g.id,
			matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
			kickoff: g.kickoffLabel,
			side: shown.side,
			market: shown.market,
			ev: shown.ev,
			prob: shown.prob,
			kelly: shown.kelly,
			take,
			passReason
		};
	}).sort((a, b) => {
		if (a.take !== b.take) return a.take ? -1 : 1;
		return b.ev - a.ev;
	});
}
function unofficialWinners(results, games, week) {
	return games.map((g) => {
		const r = results.find((x) => x.gameId === g.id);
		const homeP = r?.homeWin ?? .5;
		const awayP = r ? 1 - homeP : .5;
		const home = homeP >= awayP;
		return {
			id: `w${week}-win-${g.id}`,
			week,
			gameId: g.id,
			matchup: `${team(g.away).abbr} @ ${team(g.home).abbr}`,
			winner: home ? team(g.home).abbr : team(g.away).abbr,
			pWin: home ? homeP : awayP,
			result: "pending"
		};
	});
}
function liveTrueCard(results, parlays, props, games) {
	const sheet = slateSheet(results, games);
	const takes = sheet.filter((r) => r.take).sort((a, b) => b.ev - a.ev).slice(0, 6);
	const onCard = new Set(takes.map((t) => t.gameId));
	return {
		sheet: sheet.map((r) => r.take && !onCard.has(r.gameId) ? {
			...r,
			take: false,
			passReason: "ev"
		} : r),
		takes,
		parlayTakes: parlays.filter((p) => p.ev >= MIN_EV).slice(0, 2),
		propTakes: props.filter((p) => {
			if (p.pick === "pass") return false;
			return (p.pick === "over" ? p.evOver : p.evUnder) >= MIN_EV;
		}).sort((a, b) => {
			const ea = a.pick === "over" ? a.evOver : a.evUnder;
			return (b.pick === "over" ? b.evOver : b.evUnder) - ea;
		}).slice(0, 3)
	};
}
var DESK_ENV = "sandbox";
var MODEL_VERSION = "2026.w3.beta.1";
var ODDS_SOURCE = "Seeded Week 3 sheet — not a live book";
var DATA_SOURCE = "generated";
var PRODUCTION = "not connected";
var MARKET_AS_OF = "2026-09-22T12:00:00-05:00";
function gradedArchiveN() {
	return ARCHIVE.filter((t) => t.result === "win" || t.result === "loss").length;
}
function archiveWeeks() {
	return [...new Set(ARCHIVE.map((t) => t.week))].sort((a, b) => a - b);
}
function evidenceCopy() {
	const n = gradedArchiveN();
	const weeks = archiveWeeks();
	return {
		sample: `${n} graded tickets · ${weeks.length} week${weeks.length === 1 ? "" : "s"}`,
		maturity: "Preliminary — too small for a stable ROI",
		validation: "CLV vs the open, calibration, out-of-sample. Kickoff close is not live yet.",
		units: "Realized units are high-variance. Do not extrapolate.",
		week: 3
	};
}
function paperStake(kelly, ev, bankroll, cap = MAX_BANKROLL_PCT) {
	if (ev < .03) return 0;
	const raw = Math.round(Math.min(KELLY_CAP, cap, Math.max(0, kelly)) * bankroll);
	const ceiling = Math.round(cap * bankroll);
	return Math.max(0, Math.min(raw, ceiling));
}
function upsertTicket(existing, next) {
	return [next, ...existing.filter((t) => t.id !== next.id)].slice(0, 80);
}
var LOCK_KEY$1 = "syndicate.ledger.v1";
var UNIT_PCT = .01;
var REASON_COPY = {
	"clv-captured": "Number moved our way after the card. Market agreed.",
	"rlm-hit": "Reverse line move was the signal. Public was the trap.",
	"model-hit": "Cover probability held. Nothing exotic.",
	"home-script": "Home overlay and the result lined up.",
	"ref-scripted": "Crew tendency printed. Total/sacks followed the whistle.",
	"weather-hit": "Wind/heat/altitude showed up in the box score.",
	"chaos-hit": "Denver late-game script paid.",
	"key-number": "Lost on 3. Model was close; the key was not.",
	"public-was-right": "Faded 65%+ tickets and they cashed. Fade needs handle, not just tickets.",
	"handle-led-steam": "Handle and the number were together. We treated it like square steam.",
	"tnf-total": "Thursday Night unders beat the whistle-over lean.",
	"ref-conflict": "Crew said over, slot said under. Slot won.",
	"chaos-miss": "Chaos engine fired in the sim, not on the field.",
	"line-moved-against": "Negative CLV. We were behind the tape.",
	juice: "Coin-flip after juice. Variance, not a broken feature.",
	"model-soft": "Side was fine; the number was too ambitious.",
	"weather-miss": "Wind/heat tax was too heavy. Player still hit.",
	"one-leg": "Parlay died on one leg. Correlation haircut did not save it."
};
function loadLocked() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(LOCK_KEY$1);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveLocked(rows) {
	try {
		localStorage.setItem(LOCK_KEY$1, JSON.stringify(rows.slice(0, 200)));
	} catch {}
}
function allTickets(extra = []) {
	const locked = extra.length ? extra : loadLocked();
	const seen = new Set(ARCHIVE.map((t) => t.id));
	return [...ARCHIVE, ...locked.filter((t) => !seen.has(t.id))];
}
function graded(rows) {
	return rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
}
function brierOf(t) {
	if (t.result === "pending" || t.result === "push") return 0;
	const y = t.result === "win" ? 1 : 0;
	return (t.prob - y) ** 2;
}
function byTag(rows) {
	const g = graded(rows).filter((t) => t.result !== "push");
	const tags = new Set(g.flatMap((t) => t.tags));
	const out = [];
	for (const tag of [...tags].sort()) {
		const xs = g.filter((t) => t.tags.includes(tag));
		const hits = xs.filter((t) => t.result === "win").length;
		const exp = xs.reduce((s, t) => s + t.prob, 0) / xs.length;
		const br = xs.reduce((s, t) => s + brierOf(t), 0) / xs.length;
		const clv = xs.reduce((s, t) => s + t.clv, 0) / xs.length;
		out.push({
			tag,
			n: xs.length,
			hits,
			hitRate: hits / xs.length,
			exp,
			brier: br,
			clv,
			edge: hits / xs.length - exp
		});
	}
	return out.sort((a, b) => a.edge - b.edge);
}
function calibrate(rows) {
	const g = graded(rows);
	const decided = g.filter((t) => t.result !== "push");
	const hits = decided.filter((t) => t.result === "win").length;
	const losses = decided.filter((t) => t.result === "loss").length;
	const pushes = g.filter((t) => t.result === "push").length;
	const exp = decided.length ? decided.reduce((s, t) => s + t.prob, 0) / decided.length : 0;
	const brier = decided.length ? decided.reduce((s, t) => s + brierOf(t), 0) / decided.length : .25;
	const clv = g.length ? g.reduce((s, t) => s + t.clv, 0) / g.length : 0;
	const roi = decided.length === 0 ? 0 : decided.reduce((s, t) => {
		if (t.result === "win") return s + (t.price < 0 ? 100 / Math.abs(t.price) : t.price / 100);
		return s - 1;
	}, 0) / decided.length;
	const byWeek = [...new Set(g.map((t) => t.week))].sort((a, b) => a - b).map((week) => {
		const xs = decided.filter((t) => t.week === week);
		const h = xs.filter((t) => t.result === "win").length;
		return {
			week,
			n: xs.length,
			hits: h,
			hitRate: xs.length ? h / xs.length : 0,
			brier: xs.length ? xs.reduce((s, t) => s + brierOf(t), 0) / xs.length : 0
		};
	});
	return {
		n: decided.length,
		hits,
		losses,
		pushes,
		hitRate: decided.length ? hits / decided.length : 0,
		exp,
		brier,
		clv,
		roi,
		byWeek,
		tags: byTag(rows),
		misses: decided.filter((t) => t.result === "loss"),
		pending: rows.filter((t) => t.result === "pending")
	};
}
/** 1u = 1% bankroll. Half-Kelly, 3u cap, quarter-unit steps. */
function sizeUnits(kelly) {
	const raw = kelly / UNIT_PCT;
	if (raw <= 0) return 0;
	const capped = Math.min(MAX_BANKROLL_PCT / UNIT_PCT, raw);
	return Math.round(Math.max(.25, capped) * 4) / 4;
}
function ticketUnits(t) {
	return sizeUnits(kellyFraction(t.prob, t.price));
}
function ticketPnl(t) {
	const u = ticketUnits(t);
	if (t.result === "win") return u * (americanToDecimal(t.price) - 1);
	if (t.result === "loss") return -u;
	return 0;
}
function cardUnits(rows) {
	const g = rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
	return {
		n: g.length,
		risked: g.reduce((s, t) => s + ticketUnits(t), 0),
		pnl: g.reduce((s, t) => s + ticketPnl(t), 0)
	};
}
function maxDrawdown(rows) {
	const g = [...rows].filter((t) => t.result === "win" || t.result === "loss").sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
	let eq = 0;
	let peak = 0;
	let dd = 0;
	for (const t of g) {
		eq += ticketPnl(t);
		peak = Math.max(peak, eq);
		dd = Math.min(dd, eq - peak);
	}
	return dd;
}
function segmentBook(rows) {
	return [
		"spread",
		"total",
		"prop"
	].map((kind) => ({
		kind,
		...cardUnits(rows.filter((t) => t.kind === kind))
	}));
}
var ENGINE_TAGS = [
	"rlm",
	"steam",
	"tnf",
	"chaos",
	"wind",
	"whistle-over",
	"public-fade"
];
function learnFrom(rows) {
	const cal = calibrate(rows);
	if (cal.n === 0) return DEFAULT_PRIORS;
	const decided = graded(rows).filter((t) => t.result !== "push" && t.kind !== "parlay");
	const posts = {};
	for (const name of ENGINE_TAGS) {
		const xs = decided.filter((t) => t.tags.includes(name));
		const hits = xs.filter((t) => t.result === "win").length;
		const exp = xs.length ? xs.reduce((s, t) => s + t.prob, 0) / xs.length : LEAGUE_P;
		posts[name] = betaUpdate(hits, xs.length, exp || .524, 10, name);
	}
	posts.all = betaUpdate(decided.filter((t) => t.result === "win").length, decided.length, LEAGUE_P, 10, "all");
	const clvPost = clvUpdate(graded(rows).map((t) => t.clv));
	const missCounts = {};
	for (const t of cal.misses) for (const r of t.reasons) missCounts[r] = (missCounts[r] ?? 0) + 1;
	const missPost = dirichletUpdate(missCounts);
	const h = (name) => posts[name]?.mult ?? 1;
	const notes = [];
	const rlm = h("rlm");
	const steam = h("steam");
	const tnf = h("tnf");
	const chaos = h("chaos");
	const wind = h("wind");
	const refOver = h("whistle-over");
	const publicFade = h("public-fade");
	if (tnf < .95) notes.push("TNF posterior sits under the prior. Thursday overs get a shrink, not a ban.");
	if (publicFade < .95) notes.push("Public-fade posterior is weak. Need handle against, not just 65% tickets.");
	if (rlm > 1.05) notes.push("RLM posterior clears the prior. Keep following the number against tickets.");
	if (steam > 1.05) notes.push("Steam posterior is strong. Handle-led moves stay in the model.");
	if (refOver < .95) notes.push("Whistle-over crews: posterior pulled down when slot/weather fought the flag.");
	if (chaos !== 1 && Math.abs(chaos - 1) >= .04) notes.push(chaos < 1 ? "Chaos posterior is soft. Do not upsize Denver." : "Chaos paid. Leave the engine on.");
	if (clvPost.q10 > 0) notes.push("Recorded open-CLV posterior 10th percentile is still positive. That is the open on the ticket, not a close.");
	else if (clvPost.q90 < 0) notes.push("Recorded open-CLV posterior is negative. Cards were behind the open they stored.");
	if (!notes.length) notes.push("Posteriors hug the prior. κ = 10 is doing the work — small samples don't yank the engine.");
	const topMiss = missPost[0];
	if (topMiss && topMiss.mean >= .18) notes.push(`Most probable miss mode: ${topMiss.reason} (${Math.round(topMiss.mean * 100)}% Dirichlet mass).`);
	const weeks = cal.byWeek.map((w) => w.week);
	return {
		fromWeek: Math.min(...weeks),
		toWeek: Math.max(...weeks),
		n: cal.n,
		hits: cal.hits,
		brier: cal.brier,
		clv: cal.clv,
		roi: cal.roi,
		haircuts: {
			rlm,
			steam,
			tnf,
			chaos,
			wind,
			refOver,
			publicFade
		},
		posts,
		clvPost,
		missPost,
		reliability: reliability(rows),
		notes
	};
}
var OFFERED_3LEG = 600;
function gamePick(sim, games) {
	const game = games.find((g) => g.id === sim.gameId);
	if (!game) return null;
	const best = [...[sim.pick, ...sim.alts].filter((p) => p.market === "spread")].sort((a, b) => b.ev - a.ev)[0];
	if (!best || best.ev < .015) return null;
	return {
		game,
		pick: best,
		sim
	};
}
function normCdf(x) {
	const a1 = .254829592;
	const a2 = -.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = .3275911;
	const s = x < 0 ? -1 : 1;
	const t = 1 / (1 + p * Math.abs(x));
	return .5 * (1 + s * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)));
}
function gauss() {
	const rng = mulberry32(20260921);
	return () => {
		const u = Math.max(1e-12, rng());
		const v = Math.max(1e-12, rng());
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	};
}
/** Gaussian copula joint for weather-linked totals. Independent legs stay a product. */
function copulaJoint(ps, linked) {
	const n = ps.length;
	const product = ps.reduce((a, b) => a * b, 1);
	if (!linked.some(Boolean) || linked.filter(Boolean).length < 2) return product;
	const draw = gauss();
	const rho = .12;
	const N = 2500;
	let hits = 0;
	for (let i = 0; i < N; i++) {
		const z0 = draw();
		let ok = true;
		for (let j = 0; j < n; j++) if (normCdf(linked[j] ? rho * z0 + Math.sqrt(1 - rho * rho) * draw() : draw()) > ps[j]) {
			ok = false;
			break;
		}
		if (ok) hits += 1;
	}
	return hits / N;
}
function pathHit(paths, pick, homeSpread) {
	if (!paths.length) return pick.prob;
	let h = 0;
	for (const p of paths) if (pick.market === "spread") {
		const homeCovers = p.m + homeSpread > 0;
		if (Math.abs(pick.line - homeSpread) < .05 ? homeCovers : p.m + homeSpread < 0) h += 1;
	} else if (pick.market === "total") {
		const over = p.t > pick.line;
		if (pick.side.startsWith("Over") ? over : !over) h += 1;
	}
	return h / paths.length;
}
function sgpFrom(sim, game) {
	const spread = [sim.pick, ...sim.alts].filter((p) => p.market === "spread").sort((a, b) => b.ev - a.ev)[0];
	const total = [sim.pick, ...sim.alts].filter((p) => p.market === "total").sort((a, b) => b.ev - a.ev)[0];
	if (!spread || !total || spread.ev < .01 || total.ev < .005) return null;
	const paths = sim.paths ?? [];
	let both = 0;
	for (const p of paths) {
		const homeCovers = p.m + game.line.spread > 0;
		const spreadHit = Math.abs(spread.line - game.line.spread) < .05 ? homeCovers : p.m + game.line.spread < 0;
		const over = p.t > game.line.total;
		const totalHit = total.side.startsWith("Over") ? over : !over;
		if (spreadHit && totalHit) both += 1;
	}
	const joint = paths.length ? both / paths.length : spread.prob * total.prob;
	const product = spread.prob * total.prob;
	const offeredDec = americanToDecimal(spread.price) * americanToDecimal(total.price) * .9;
	const offeredAmerican = offeredDec >= 2 ? Math.round((offeredDec - 1) * 100) : Math.round(-100 / (offeredDec - 1));
	const ev = evFromProb(joint, offeredAmerican);
	if (ev < .02) return null;
	return {
		id: `sgp-${game.id}`,
		kind: "sgp",
		jointMethod: "paths",
		legs: [{
			gameId: game.id,
			label: `${teamNick(game.away)} @ ${teamNick(game.home)}`,
			side: spread.side,
			price: spread.price,
			prob: spread.prob
		}, {
			gameId: game.id,
			label: `${teamNick(game.away)} @ ${teamNick(game.home)}`,
			side: total.side,
			price: total.price,
			prob: total.prob
		}],
		joint,
		fairAmerican: probToAmerican(joint),
		offeredAmerican,
		ev,
		corrPenalty: Math.max(0, product - joint)
	};
}
function buildParlays(sims, games, limit = 8) {
	const legs = sims.map((s) => gamePick(s, games)).filter((x) => Boolean(x)).sort((a, b) => b.pick.ev - a.pick.ev).slice(0, 10);
	const tickets = [];
	for (let i = 0; i < legs.length; i++) for (let j = i + 1; j < legs.length; j++) for (let k = j + 1; k < legs.length; k++) {
		const a = legs[i];
		const b = legs[j];
		const c = legs[k];
		if (!a || !b || !c) continue;
		const trio = [
			a,
			b,
			c
		];
		if (new Set(trio.map((t) => t.game.id)).size < 3) continue;
		const ps = trio.map((t) => pathHit(t.sim.paths, t.pick, t.game.line.spread));
		const linked = trio.map((t) => t.pick.market === "total" && t.game.weather.roof === "open" && (t.game.weather.windMph ?? 0) >= 12);
		const product = ps.reduce((p, x) => p * x, 1);
		const joint = copulaJoint(ps, linked);
		const ev = joint * (americanToDecimal(OFFERED_3LEG) - 1) - (1 - joint);
		tickets.push({
			id: trio.map((t) => t.game.id).join("+"),
			kind: "3leg",
			jointMethod: linked.filter(Boolean).length >= 2 ? "copula" : "product",
			legs: trio.map((t) => ({
				gameId: t.game.id,
				label: `${teamNick(t.game.away)} @ ${teamNick(t.game.home)}`,
				side: t.pick.side,
				price: t.pick.price,
				prob: t.pick.prob
			})),
			joint,
			fairAmerican: probToAmerican(joint),
			offeredAmerican: OFFERED_3LEG,
			ev,
			corrPenalty: Math.max(0, product - joint)
		});
	}
	return [...sims.map((s) => {
		const g = games.find((x) => x.id === s.gameId);
		return g ? sgpFrom(s, g) : null;
	}).filter((t) => Boolean(t)), ...tickets].filter((t) => t.ev > 0).sort((a, b) => b.ev - a.ev).slice(0, limit);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchBoxBoard = createServerFn({ method: "GET" }).handler(createSsrRpc("86a56c1ba8fe9c229c6c07c7413f59cea4011f435ece8dcb17688b8fcb471319"));
var SEASON_KEY = "syndicate.season.v1";
function liveLocked(plays) {
	return plays.filter((p) => (p.kind === "spread" || p.kind === "total") && p.audit?.integrity === "valid" && p.audit.cardLockTimestamp != null);
}
function loadSeason() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(SEASON_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((row) => row && Number.isInteger(row.week) && row.tickets > 0);
	} catch {
		return [];
	}
}
function noteSeasonWeek(plays, week = 3) {
	const locked = liveLocked(plays);
	const settled = locked.filter((p) => p.audit?.settlementSource && p.audit.settlementTimestamp != null);
	const prior = loadSeason();
	if (!locked.length || settled.length !== locked.length) return prior;
	if (prior.some((row) => row.week === week)) return prior;
	const next = [...prior, {
		week,
		tickets: locked.length,
		lockedAt: Math.min(...locked.map((p) => p.audit?.cardLockTimestamp ?? 0)),
		settledAt: Math.max(...settled.map((p) => p.audit?.settlementTimestamp ?? 0))
	}].sort((a, b) => a.week - b.week);
	try {
		localStorage.setItem(SEASON_KEY, JSON.stringify(next));
	} catch {}
	return next;
}
function volumeReport(plays) {
	const locked = liveLocked(plays);
	const settled = locked.filter((p) => p.audit?.settlementSource && p.audit.settlementTimestamp != null);
	const stored = new Set(loadSeason().map((row) => row.week));
	if (locked.length > 0 && settled.length === locked.length) stored.add(3);
	return {
		completedWeeks: stored.size,
		seasonWeeks: 18,
		lockedUnsettled: locked.length - settled.length,
		settledLocked: settled.length
	};
}
function volumeGate(plays) {
	const report = volumeReport(plays);
	const archive = "Weeks 1–2 are a research archive. They were graded from the scoreboard and were not locked by this desk, so they do not count.";
	const claim = "A commercial performance claim is refused until 18. No proven edge.";
	if (report.completedWeeks >= report.seasonWeeks) return {
		status: "pass",
		now: `${report.completedWeeks} of ${report.seasonWeeks} regular-season weeks have a locked card that later settled from the scoreboard.`
	};
	const open = report.lockedUnsettled > 0 ? `Week 3 has ${report.settledLocked} settled and ${report.lockedUnsettled} still open on a locked card, so that week does not count.` : `Week 3 has no settled lock.`;
	return {
		status: report.completedWeeks > 0 ? "partial" : "fail",
		now: `${report.completedWeeks} of ${report.seasonWeeks} regular-season weeks. ${open} ${archive} ${claim}`
	};
}
var TAPE_KEY = "syndicate.tape.v1";
function loadTape() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(TAPE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p.gameId === "string" && typeof p.at === "string") : [];
	} catch {
		return [];
	}
}
function saveTape(prints) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(TAPE_KEY, JSON.stringify(prints.slice(-2500)));
	} catch {}
}
function sameNumber(a, q) {
	return a.spread === q.spread && a.spreadPrice === q.homeSpreadPrice && a.total === q.total && a.totalPrice === q.overPrice;
}
function appendTape(existing, quotes) {
	const next = existing.slice();
	for (const q of quotes) {
		let prev = null;
		for (let i = next.length - 1; i >= 0; i--) if (next[i].book === q.book && next[i].gameId === q.gameId) {
			prev = next[i];
			break;
		}
		if (prev && sameNumber(prev, q)) continue;
		next.push({
			book: q.book,
			gameId: q.gameId,
			week: q.week ?? prev?.week ?? null,
			kickoff: q.kickoff ?? prev?.kickoff ?? null,
			at: q.fetchedAt,
			spread: q.spread,
			spreadPrice: q.homeSpreadPrice,
			total: q.total,
			totalPrice: q.overPrice
		});
	}
	return next.slice(-2500);
}
/** Calendar window only. It is not proof of when the book first posted the number. */
function tapeWindow(kickoff, at) {
	if (!kickoff) return "posted";
	const kick = Date.parse(kickoff);
	if (!Number.isFinite(kick)) return "posted";
	const days = (kick - at) / 864e5;
	if (days > 8) return "look-ahead window";
	if (days > 6) return "open window";
	if (days > 5) return "Monday window";
	if (days > 0) return "main market";
	return "kickoff passed";
}
function tapeRows(prints) {
	const groups = /* @__PURE__ */ new Map();
	for (const print of prints) {
		const key = `${print.week ?? "x"}|${print.gameId}|${print.book}`;
		const list = groups.get(key) ?? [];
		list.push(print);
		groups.set(key, list);
	}
	return [...groups.values()].map((list) => {
		const first = list[0];
		const last = list[list.length - 1];
		return {
			book: last.book,
			gameId: last.gameId,
			week: last.week,
			kickoff: last.kickoff,
			firstAt: first.at,
			lastAt: last.at,
			firstSpread: first.spread,
			lastSpread: last.spread,
			firstTotal: first.total,
			lastTotal: last.total,
			prints: list.length,
			window: tapeWindow(last.kickoff, Date.parse(last.at))
		};
	}).sort((a, b) => (a.week ?? 99) - (b.week ?? 99) || a.gameId.localeCompare(b.gameId) || a.book.localeCompare(b.book));
}
var fetchLiveBoard = createServerFn({ method: "GET" }).handler(createSsrRpc("a3140ae237bc8a6cd55c40b596a90b17aea32d83d4ec9f4ffe65f064ee30eab9"));
var SHEET_ID = "seeded-week-3-v1";
var DATA_MODE = "sandbox-generated";
var RUN_KEY = "syndicate.run.v3";
var META_KEY = "syndicate.run.meta.v3";
function makeRunId(at) {
	const d = new Date(at);
	const p = (n) => String(n).padStart(2, "0");
	return `run_2026w03_${`${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`}`;
}
function compactResults(results) {
	const out = {};
	for (const [id, r] of Object.entries(results)) out[id] = {
		...r,
		paths: [],
		pointBuy: r.pointBuy?.slice(0, 4) ?? []
	};
	return out;
}
function metaOf(run) {
	return {
		runId: run.runId,
		sheetId: run.sheetId,
		at: run.at,
		ms: run.ms,
		phase: run.phase,
		seed: run.seed,
		sims: run.sims,
		chaos: run.chaos,
		bankroll: run.bankroll,
		modelVersion: run.modelVersion,
		dataMode: run.dataMode,
		oddsBooks: run.oddsBooks ?? [],
		oddsFetchedAt: run.oddsFetchedAt ?? null,
		oddsErrors: run.oddsErrors ?? [],
		quotes: run.quotes ?? [],
		tickets: run.tickets,
		predictions: run.predictions,
		plays: run.plays,
		order: run.order,
		props: run.props,
		parlays: run.parlays
	};
}
function loadRun() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(RUN_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed?.runId) return parsed;
		}
		const meta = localStorage.getItem(META_KEY);
		if (!meta) return null;
		const slim = JSON.parse(meta);
		if (!slim?.runId) return null;
		return {
			...slim,
			results: slim.results ?? {}
		};
	} catch {
		return null;
	}
}
function saveRun(run) {
	if (typeof localStorage === "undefined") return;
	const compact = {
		...run,
		results: compactResults(run.results)
	};
	try {
		localStorage.setItem(META_KEY, JSON.stringify(metaOf(compact)));
	} catch {}
	try {
		localStorage.setItem(RUN_KEY, JSON.stringify(compact));
	} catch {
		try {
			localStorage.removeItem(RUN_KEY);
		} catch {}
	}
}
function snap(n) {
	return Math.round(n * 2) / 2;
}
function sideLine(side) {
	const spread = side.match(/^([A-Za-z]{2,3})\s*([+-]?\d+(?:\.\d+)?)/);
	if (spread) return {
		team: spread[1].toUpperCase(),
		number: Number(spread[2]),
		dir: null
	};
	const total = side.match(/^(Over|Under)\s+(\d+(?:\.\d+)?)/i);
	if (total) return {
		team: null,
		number: Number(total[2]),
		dir: total[1].toLowerCase() === "over" ? "over" : "under"
	};
	return {
		team: null,
		number: null,
		dir: null
	};
}
function closeClvFor(ticket, quote, final) {
	if (!final || !quote) return {
		closeLine: null,
		closeClv: null
	};
	const parsed = sideLine(ticket.side);
	const parts = ticket.matchup.split(" @ ");
	const away = parts[0]?.trim().toUpperCase();
	const home = parts[1]?.trim().toUpperCase();
	if (ticket.kind === "spread" && parsed.team && quote.homeSpreadClose != null && away && home) {
		const team = parsed.team;
		const yours = parsed.number ?? ticket.line;
		const closeLine = team === home ? quote.homeSpreadClose : team === away ? snap(-quote.homeSpreadClose) : null;
		if (closeLine == null) return {
			closeLine: null,
			closeClv: null
		};
		return {
			closeLine,
			closeClv: snap(yours - closeLine)
		};
	}
	if (ticket.kind === "total" && parsed.dir && quote.totalClose != null) {
		const yours = parsed.number ?? ticket.line;
		const closeLine = quote.totalClose;
		return {
			closeLine,
			closeClv: parsed.dir === "over" ? snap(closeLine - yours) : snap(yours - closeLine)
		};
	}
	return {
		closeLine: null,
		closeClv: null
	};
}
function sourceOf(quote, closeLine) {
	return `DraftKings via ESPN · event ${quote.eventId} · provider ${quote.providerId} · close ${closeLine}`;
}
function buildLedger(rows, board) {
	return (rows.every((r) => "boxResult" in r) ? rows : gradeTickets(rows, board)).map((t) => {
		const units = ticketUnits(t);
		const game = board ? findGame(board, t.matchup, t.week) : null;
		const quote = game ? (board?.closes ?? []).find((c) => c.eventId === game.eventId) ?? null : null;
		const final = game?.status === "final";
		const close = closeClvFor(t, quote, Boolean(final));
		const graded = t.boxResult === "win" || t.boxResult === "loss" || t.boxResult === "push" || !board && (t.result === "win" || t.result === "loss" || t.result === "push");
		return {
			id: t.id,
			week: t.week,
			kind: t.kind,
			matchup: t.matchup,
			side: t.side,
			result: board ? t.boxResult === "uncovered" || t.boxResult === "unchecked" || t.boxResult === "void" ? t.boxResult : t.result : t.result,
			ev: t.ev,
			units,
			expected: graded && (t.result === "win" || t.result === "loss" || t.result === "push") ? units * t.ev : 0,
			realized: graded && (t.result === "win" || t.result === "loss" || t.result === "push") ? ticketPnl(t) : 0,
			openClv: t.week < 3 && (t.kind === "spread" || t.kind === "total") ? t.clv : null,
			closeLine: close.closeLine,
			closeClv: close.closeClv,
			closeSource: quote && close.closeLine != null && close.closeClv != null ? sourceOf(quote, close.closeLine) : null
		};
	});
}
function mean$1(xs) {
	if (!xs.length) return null;
	return xs.reduce((s, n) => s + n, 0) / xs.length;
}
function pathDrawdown(lines) {
	const ordered = [...lines].sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
	let eq = 0;
	let peak = 0;
	let dd = 0;
	for (const t of ordered) {
		eq += t.realized;
		peak = Math.max(peak, eq);
		dd = Math.min(dd, eq - peak);
	}
	return dd;
}
function ledgerSplit(lines) {
	return [
		"spread",
		"total",
		"prop"
	].map((kind) => {
		const graded = lines.filter((t) => t.kind === kind && t.week < 3).filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
		const closes = graded.map((t) => t.closeClv).filter((n) => n != null);
		const opens = graded.map((t) => t.openClv).filter((n) => n != null);
		return {
			kind,
			n: graded.length,
			expected: graded.reduce((s, t) => s + t.expected, 0),
			realized: graded.reduce((s, t) => s + t.realized, 0),
			openClv: mean$1(opens),
			closeClv: mean$1(closes),
			closeN: closes.length,
			drawdown: pathDrawdown(graded)
		};
	});
}
function ledgerGate(board) {
	if (!board) return {
		status: "partial",
		now: "Ledger is waiting on the scoreboard. Open CLV on the archive is a recorded number, not a recomputed close. Close CLV stays empty rather than ticket line plus that number."
	};
	if (board.errors.length || board.games.length === 0) return {
		status: "fail",
		now: "No scoreboard, so realized units are not a ledger. Close CLV was not invented."
	};
	const grades = gradeTickets(ARCHIVE, board);
	const lines = buildLedger(grades, board);
	const sides = lines.filter((t) => t.week < 3 && (t.kind === "spread" || t.kind === "total"));
	const settled = sides.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push");
	if (settled.length !== sides.length || !sides.length) return {
		status: "partial",
		now: "Closed sides and totals are not all scoreboard grades yet, so the ledger is not closed."
	};
	const missingClose = settled.filter((t) => t.closeClv == null || t.closeSource == null);
	if (settled.filter((t) => t.openClv == null).length) return {
		status: "fail",
		now: "A settled ticket is missing its recorded open CLV."
	};
	if (lines.filter((t) => (t.kind === "prop" || t.kind === "parlay") && (t.result === "win" || t.result === "loss")).length) return {
		status: "fail",
		now: "A prop or parlay is in the realized ledger without a box score. That win is not a grade."
	};
	const split = ledgerSplit(lines);
	const brier = calibrate(grades.filter((t) => t.week < 3 && (t.kind === "spread" || t.kind === "total"))).brier;
	const dd = maxDrawdown(grades.filter((t) => t.week < 3 && (t.result === "win" || t.result === "loss")));
	const openMean = mean$1(settled.map((t) => t.openClv).filter((n) => n != null));
	const closeMean = mean$1(settled.map((t) => t.closeClv).filter((n) => n != null));
	const exp = settled.reduce((s, t) => s + t.expected, 0);
	const realized = settled.reduce((s, t) => s + t.realized, 0);
	if (missingClose.length) {
		const why = (board.closeErrors ?? []).slice(0, 2).join(" · ");
		return {
			status: "partial",
			now: `${missingClose.length} of ${settled.length} settled tickets have no DraftKings close (${missingClose.slice(0, 3).map((t) => t.matchup).join(", ")}). Close CLV is empty there. It is not the ticket line plus recorded CLV. ${why}`
		};
	}
	const fmt = (n) => n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(2)}`;
	const buckets = split.map((s) => `${s.kind} ${s.n}`).join(" · ");
	return {
		status: "pass",
		now: `${settled.length} of ${settled.length} Week 1–2 sides and totals. Open CLV ${fmt(openMean)} pts, recorded on the ticket and not recomputed. Close CLV ${fmt(closeMean)} pts versus the DraftKings close on ESPN, one book, not Pinnacle. EV ${exp.toFixed(2)}u expected, ${realized.toFixed(2)}u realized from the scoreboard. Brier ${brier.toFixed(3)}. Max drawdown ${dd.toFixed(2)}u. Split ${buckets}. Props are not graded. Week 3 close stays empty until the game is final. Two weeks. Not a proven edge.`
	};
}
var PHASE_COPY = {
	idle: "idle",
	queued: "queued",
	ingesting: "ingesting",
	simulating: "simulating",
	priced: "priced",
	locked: "locked"
};
var ASSUMPTIONS = {
	version: MODEL_VERSION,
	minEv: MIN_EV,
	maxCardSides: 6,
	meanShift: MEAN_SHIFT_FACTOR,
	bankrollCap: MAX_BANKROLL_PCT,
	defaultSims: DEFAULT_SIMS,
	source: ODDS_SOURCE
};
function snapshotFrom(results, takes, seed, sims, chaos) {
	return {
		at: Date.now(),
		seed,
		sims,
		chaos,
		modelVersion: MODEL_VERSION,
		games: results.map((r) => ({
			id: r.gameId,
			side: r.pick.side,
			ev: r.pick.ev,
			take: takes.has(r.gameId),
			steam: r.steam
		}))
	};
}
function diffSnapshots(prev, next) {
	if (!prev) return [];
	const byId = Object.fromEntries(prev.games.map((g) => [g.id, g]));
	const out = [];
	for (const g of next.games) {
		const a = byId[g.id];
		if (!a) continue;
		if (a.side !== g.side || a.take !== g.take || Math.abs(a.ev - g.ev) >= .005) out.push({
			id: g.id,
			sideFrom: a.side,
			sideTo: g.side,
			evFrom: a.ev,
			evTo: g.ev,
			takeFrom: a.take,
			takeTo: g.take
		});
	}
	return out;
}
function seedPlacedAt(week) {
	const day = week === 1 ? "08" : week === 2 ? "15" : "22";
	return Date.parse(`2026-09-${day}T17:00:00-04:00`);
}
function enrichTicket(t) {
	const units = ticketUnits(t);
	const realized = ticketPnl(t);
	const expected = units * t.ev;
	return {
		...t,
		modelVersion: t.week < 3 ? "2026.w1-2.seed" : MODEL_VERSION,
		source: "Seeded archive",
		placedAt: seedPlacedAt(t.week),
		closeLine: null,
		units,
		expected,
		realized
	};
}
function mean(xs) {
	if (!xs.length) return 0;
	return xs.reduce((s, x) => s + x, 0) / xs.length;
}
function sd(xs) {
	if (xs.length < 2) return 0;
	const m = mean(xs);
	return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}
/** 80% interval on the mean. Small n → wide. */
function meanCi(xs, z = 1.28) {
	const n = xs.length;
	const m = mean(xs);
	if (n < 2) return {
		n,
		mean: m,
		lo: m,
		hi: m
	};
	const se = sd(xs) / Math.sqrt(n);
	return {
		n,
		mean: m,
		lo: m - z * se,
		hi: m + z * se
	};
}
function pnlSplit(rows) {
	const enriched = rows.filter((t) => t.result === "win" || t.result === "loss" || t.result === "push").map(enrichTicket);
	const realized = meanCi(enriched.map((t) => t.realized));
	const expected = meanCi(enriched.map((t) => t.expected));
	const sumR = enriched.reduce((s, t) => s + t.realized, 0);
	const sumE = enriched.reduce((s, t) => s + t.expected, 0);
	const risked = enriched.reduce((s, t) => s + t.units, 0);
	return {
		n: enriched.length,
		risked,
		sumR,
		sumE,
		realized,
		expected
	};
}
function csvEscape(v) {
	const s = v == null ? "" : String(v);
	if (/[",\n]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function ledgerCsv(rows, board = null) {
	const built = new Map(buildLedger(rows, board).map((r) => [r.id, r]));
	const lines = [[
		"id",
		"week",
		"kind",
		"matchup",
		"side",
		"line",
		"price",
		"prob",
		"ev",
		"units",
		"expected_u",
		"realized_u",
		"clv_open_recorded",
		"close_line",
		"clv_close",
		"close_source",
		"result",
		"score",
		"tags",
		"reasons",
		"model_version",
		"source",
		"placed_at"
	].join(",")];
	for (const t of rows.map(enrichTicket)) {
		const line = built.get(t.id);
		lines.push([
			t.id,
			t.week,
			t.kind,
			t.matchup,
			t.side,
			t.line,
			t.price,
			t.prob,
			t.ev,
			t.units,
			t.expected,
			t.realized,
			line?.openClv ?? "",
			line?.closeLine ?? "",
			line?.closeClv ?? "",
			line?.closeSource ?? "",
			t.result,
			t.score ?? "",
			t.tags.join("|"),
			t.reasons.join("|"),
			t.modelVersion,
			t.source,
			new Date(t.placedAt).toISOString()
		].map(csvEscape).join(","));
	}
	return lines.join("\n");
}
function downloadCsv(filename, csv) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
var JOURNAL_KEY = "syndicate.journal.v1";
var SNAP_KEY = "syndicate.snaps.v1";
function loadJournal() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(JOURNAL_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 200) : [];
	} catch {
		return [];
	}
}
function saveJournal(events) {
	try {
		localStorage.setItem(JOURNAL_KEY, JSON.stringify(events.slice(0, 200)));
	} catch {}
}
function appendJournal(events, next) {
	const all = [{
		...next,
		at: Date.now(),
		modelVersion: MODEL_VERSION
	}, ...events].slice(0, 200);
	saveJournal(all);
	return all;
}
function loadSnaps() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(SNAP_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
	} catch {
		return [];
	}
}
function saveSnaps(snaps) {
	try {
		localStorage.setItem(SNAP_KEY, JSON.stringify(snaps.slice(0, 8)));
	} catch {}
}
function pushSnap(snaps, next) {
	const all = [next, ...snaps].slice(0, 8);
	saveSnaps(all);
	return all;
}
var LS = "syndicate.current.v1";
var COOKIE = "syndicate.currentRun";
function saveCurrent(run) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(LS, JSON.stringify(run));
	} catch {}
	try {
		const slim = {
			runId: run.runId,
			status: run.status,
			pricedAt: run.pricedAt,
			nTickets: run.nTickets,
			nPredictions: run.nPredictions,
			reason: run.reason,
			sheetId: run.sheetId,
			modelVersion: run.modelVersion,
			mode: run.mode,
			bankroll: run.bankroll
		};
		document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(slim))};path=/;max-age=604800;SameSite=Lax`;
	} catch {}
}
function loadCurrent() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(LS);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed?.runId && parsed.pricedAt) return parsed;
		}
	} catch {}
	try {
		const hit = document.cookie.split("; ").find((r) => r.startsWith(`${COOKIE}=`));
		if (!hit) return null;
		const parsed = JSON.parse(decodeURIComponent(hit.slice(21)));
		if (parsed?.runId && parsed.pricedAt) return parsed;
	} catch {}
	return null;
}
function currentFrom(partial) {
	return {
		runId: partial.runId,
		sheetId: SHEET_ID,
		modelVersion: MODEL_VERSION,
		mode: partial.mode ?? "sandbox-generated",
		status: partial.phase,
		pricedAt: partial.at,
		bankroll: partial.bankroll,
		nTickets: partial.nTickets,
		nPredictions: partial.nPredictions,
		reason: partial.nTickets === 0 ? "NO_QUALIFYING_EDGES" : "ok"
	};
}
var KELLY_FRACTION = .5;
function fullKelly(p, american) {
	const b = americanToDecimal(american) - 1;
	if (b <= 0) return 0;
	return Math.max(0, (b * p - (1 - p)) / b);
}
function sizeBreakdown(p, american) {
	const full = fullKelly(p, american);
	const half = full * KELLY_FRACTION;
	const cap = MAX_BANKROLL_PCT;
	const final = Math.min(half, cap);
	const units = Math.round(final / .01 * 4) / 4;
	return {
		full,
		fraction: KELLY_FRACTION,
		half,
		cap,
		capped: half > cap + 1e-9,
		final,
		units: units > 0 ? Math.max(.25, units) : 0
	};
}
function portfolioOf(plays) {
	const byGame = {};
	let gross = 0;
	let corrAdj = 0;
	for (const p of plays) {
		gross += p.units;
		const g = p.gameId ?? "_";
		byGame[g] = (byGame[g] ?? 0) + p.units;
	}
	for (const [g, u] of Object.entries(byGame)) {
		if (g === "_") {
			corrAdj += u;
			continue;
		}
		corrAdj += Math.min(u, u * .5 + Math.min(u, 3) * .5);
	}
	let maxGame = null;
	for (const [g, u] of Object.entries(byGame)) {
		if (g === "_") continue;
		if (!maxGame || u > maxGame.units) maxGame = {
			gameId: g,
			units: u
		};
	}
	const over = Boolean(maxGame && maxGame.units > 6.000000001);
	return {
		gross,
		corrAdj,
		maxGame,
		over,
		scaled: false
	};
}
/** Scale any game over MAX_GAME_UNITS down to the cap. */
function capGameExposure(plays) {
	const byGame = {};
	for (const p of plays) {
		const g = p.gameId ?? "_";
		(byGame[g] ??= []).push(p);
	}
	let scaled = false;
	const out = [];
	for (const [g, xs] of Object.entries(byGame)) {
		const sum = xs.reduce((s, x) => s + x.units, 0);
		if (g !== "_" && sum > 6) {
			const k = 6 / sum;
			scaled = true;
			for (const x of xs) {
				const units = Math.round(x.units * k * 4) / 4;
				out.push({
					...x,
					units,
					bankrollPct: units
				});
			}
		} else out.push(...xs);
	}
	return {
		plays: out,
		read: {
			...portfolioOf(out),
			scaled
		}
	};
}
function statusOf(id, papered, locked) {
	if (locked) return "locked";
	if (papered.has(id)) return "papered";
	return "paper-eligible";
}
function base(id, kind, market, selection, line, price, modelP, ev, runId, pricedAt, papered, locked, extra) {
	const size = sizeBreakdown(modelP, price);
	const play = {
		id,
		kind,
		market,
		selection,
		line,
		price,
		source: ODDS_SOURCE,
		modelP,
		impliedP: impliedProb(price),
		ev,
		units: size.units,
		bankrollPct: size.units,
		size,
		modelVersion: MODEL_VERSION,
		pricedAt,
		runId,
		status: statusOf(id, papered, locked),
		audit: void 0,
		...extra
	};
	play.audit = buildAudit(play);
	return play;
}
function playFromSide(pick, gameId, matchup, runId, pricedAt, papered, locked) {
	const quoted = gameId ? getGame(gameId) : void 0;
	const shop = quoted ? executionQuote(quoted, pick.market === "total" ? "total" : "spread", pick.side, pick.line) : null;
	if (!shop) return null;
	const price = shop.price;
	const ev = evFromProb(pick.prob, price);
	if (ev < .03) return null;
	return base(`s-${gameId}-${pick.side}`, pick.market === "total" ? "total" : "spread", `${matchup} ${pick.side}`, pick.side, pick.line, price, pick.prob, ev, runId, pricedAt, papered, locked, {
		gameId,
		matchup,
		source: `${shop.book} · ${shop.at}`
	});
}
function ledgerFromPlay(play, week) {
	return {
		id: play.id,
		week,
		kind: play.kind,
		matchup: play.matchup ?? play.market,
		side: play.selection,
		line: play.line,
		price: play.price,
		prob: play.modelP,
		ev: play.ev,
		tags: [],
		clv: 0,
		result: "pending",
		reasons: []
	};
}
function paperFromPlay(play, bankroll) {
	return {
		id: play.id,
		placedAt: play.pricedAt,
		kind: play.kind === "parlay" ? "parlay" : play.kind === "prop" ? "prop" : "straight",
		gameId: play.gameId,
		label: play.market,
		side: play.selection,
		stake: Math.round(play.units * .01 * bankroll),
		price: play.price,
		ev: play.ev,
		prob: play.modelP,
		modelVersion: play.modelVersion,
		source: play.source
	};
}
function collectPlays(results, parlays, props, games, runId, pricedAt, locked) {
	const live = liveTrueCard(results, parlays, props, games);
	const papered = /* @__PURE__ */ new Set();
	return live.takes.map((t) => {
		const r = results.find((x) => x.gameId === t.gameId);
		const pick = r ? bestTake(r) : null;
		if (!pick) return null;
		return playFromSide(pick, t.gameId, t.matchup, runId, pricedAt, papered, locked);
	}).filter((p) => Boolean(p && isLiveBook(p.source) && (p.kind === "spread" || p.kind === "total"))).map((p) => ({
		...p,
		status: locked ? "locked" : "papered"
	}));
}
/** Full-slate unofficial winner boards. Real 2026 Week 1–2. 16 games. Not the betting card. */
var WINNER_ARCHIVE = [
	{
		id: "w1w-sea",
		week: 1,
		matchup: "NE @ SEA",
		winner: "SEA",
		pWin: .62,
		result: "win",
		actual: "SEA",
		score: "13-10"
	},
	{
		id: "w1w-sf",
		week: 1,
		matchup: "SF @ LAR",
		winner: "SF",
		pWin: .61,
		result: "win",
		actual: "SF",
		score: "27-7"
	},
	{
		id: "w1w-chi",
		week: 1,
		matchup: "CHI @ CAR",
		winner: "CHI",
		pWin: .58,
		result: "win",
		actual: "CHI",
		score: "59-37"
	},
	{
		id: "w1w-cin",
		week: 1,
		matchup: "TB @ CIN",
		winner: "CIN",
		pWin: .57,
		result: "win",
		actual: "CIN",
		score: "33-27"
	},
	{
		id: "w1w-bal",
		week: 1,
		matchup: "BAL @ IND",
		winner: "BAL",
		pWin: .66,
		result: "win",
		actual: "BAL",
		score: "41-23"
	},
	{
		id: "w1w-det",
		week: 1,
		matchup: "NO @ DET",
		winner: "DET",
		pWin: .68,
		result: "win",
		actual: "DET",
		score: "31-30 OT"
	},
	{
		id: "w1w-buf",
		week: 1,
		matchup: "BUF @ HOU",
		winner: "BUF",
		pWin: .64,
		result: "win",
		actual: "BUF",
		score: "36-31"
	},
	{
		id: "w1w-jax",
		week: 1,
		matchup: "CLE @ JAX",
		winner: "JAX",
		pWin: .6,
		result: "win",
		actual: "JAX",
		score: "34-10"
	},
	{
		id: "w1w-ten",
		week: 1,
		matchup: "NYJ @ TEN",
		winner: "TEN",
		pWin: .55,
		result: "loss",
		actual: "NYJ",
		score: "23-10"
	},
	{
		id: "w1w-pit",
		week: 1,
		matchup: "ATL @ PIT",
		winner: "PIT",
		pWin: .59,
		result: "win",
		actual: "PIT",
		score: "20-13"
	},
	{
		id: "w1w-min",
		week: 1,
		matchup: "GB @ MIN",
		winner: "MIN",
		pWin: .57,
		result: "win",
		actual: "MIN",
		score: "39-22"
	},
	{
		id: "w1w-phi",
		week: 1,
		matchup: "WAS @ PHI",
		winner: "PHI",
		pWin: .7,
		result: "win",
		actual: "PHI",
		score: "24-22"
	},
	{
		id: "w1w-lv",
		week: 1,
		matchup: "MIA @ LV",
		winner: "LV",
		pWin: .56,
		result: "win",
		actual: "LV",
		score: "27-13"
	},
	{
		id: "w1w-lac",
		week: 1,
		matchup: "ARI @ LAC",
		winner: "LAC",
		pWin: .58,
		result: "loss",
		actual: "ARI",
		score: "26-14"
	},
	{
		id: "w1w-dal",
		week: 1,
		matchup: "DAL @ NYG",
		winner: "DAL",
		pWin: .57,
		result: "loss",
		actual: "NYG",
		score: "28-20"
	},
	{
		id: "w1w-kc",
		week: 1,
		matchup: "DEN @ KC",
		winner: "KC",
		pWin: .72,
		result: "win",
		actual: "KC",
		score: "31-10"
	},
	{
		id: "w2w-buf",
		week: 2,
		matchup: "DET @ BUF",
		winner: "BUF",
		pWin: .64,
		result: "win",
		actual: "BUF",
		score: "41-31"
	},
	{
		id: "w2w-atl",
		week: 2,
		matchup: "CAR @ ATL",
		winner: "ATL",
		pWin: .61,
		result: "loss",
		actual: "CAR",
		score: "34-3"
	},
	{
		id: "w2w-bal",
		week: 2,
		matchup: "NO @ BAL",
		winner: "BAL",
		pWin: .66,
		result: "loss",
		actual: "NO",
		score: "24-17"
	},
	{
		id: "w2w-min",
		week: 2,
		matchup: "MIN @ CHI",
		winner: "MIN",
		pWin: .56,
		result: "win",
		actual: "MIN",
		score: "9-3"
	},
	{
		id: "w2w-cin",
		week: 2,
		matchup: "CIN @ HOU",
		winner: "CIN",
		pWin: .55,
		result: "win",
		actual: "CIN",
		score: "20-6"
	},
	{
		id: "w2w-tb",
		week: 2,
		matchup: "CLE @ TB",
		winner: "TB",
		pWin: .62,
		result: "loss",
		actual: "CLE",
		score: "23-19"
	},
	{
		id: "w2w-gb",
		week: 2,
		matchup: "GB @ NYJ",
		winner: "GB",
		pWin: .59,
		result: "win",
		actual: "GB",
		score: "20-17 OT"
	},
	{
		id: "w2w-phi",
		week: 2,
		matchup: "PHI @ TEN",
		winner: "PHI",
		pWin: .71,
		result: "win",
		actual: "PHI",
		score: "24-20"
	},
	{
		id: "w2w-ne",
		week: 2,
		matchup: "PIT @ NE",
		winner: "NE",
		pWin: .54,
		result: "win",
		actual: "NE",
		score: "20-3"
	},
	{
		id: "w2w-den",
		week: 2,
		matchup: "JAX @ DEN",
		winner: "DEN",
		pWin: .6,
		result: "win",
		actual: "DEN",
		score: "20-13"
	},
	{
		id: "w2w-lac",
		week: 2,
		matchup: "LV @ LAC",
		winner: "LAC",
		pWin: .58,
		result: "loss",
		actual: "LV",
		score: "26-14"
	},
	{
		id: "w2w-dal",
		week: 2,
		matchup: "WAS @ DAL",
		winner: "DAL",
		pWin: .65,
		result: "win",
		actual: "DAL",
		score: "37-20"
	},
	{
		id: "w2w-sea",
		week: 2,
		matchup: "SEA @ ARI",
		winner: "SEA",
		pWin: .67,
		result: "win",
		actual: "SEA",
		score: "31-7"
	},
	{
		id: "w2w-sf",
		week: 2,
		matchup: "MIA @ SF",
		winner: "SF",
		pWin: .74,
		result: "win",
		actual: "SF",
		score: "35-13"
	},
	{
		id: "w2w-kc",
		week: 2,
		matchup: "IND @ KC",
		winner: "KC",
		pWin: .7,
		result: "win",
		actual: "KC",
		score: "33-30 OT"
	},
	{
		id: "w2w-lar",
		week: 2,
		matchup: "NYG @ LAR",
		winner: "LAR",
		pWin: .63,
		result: "win",
		actual: "LAR",
		score: "28-6"
	}
];
var LOCK_KEY = "syndicate.winners.v1";
function loadLockedWinners() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(LOCK_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveLockedWinners(rows) {
	try {
		localStorage.setItem(LOCK_KEY, JSON.stringify(rows.slice(0, 200)));
	} catch {}
}
function allWinners(extra = []) {
	const locked = extra.length ? extra : loadLockedWinners();
	const seen = new Set(WINNER_ARCHIVE.map((t) => t.id));
	return [...WINNER_ARCHIVE, ...locked.filter((t) => !seen.has(t.id))];
}
function winnerRecord(rows) {
	const g = rows.filter((t) => t.result === "win" || t.result === "loss");
	const n = g.length;
	const hits = g.filter((t) => t.result === "win").length;
	const exp = n ? g.reduce((s, t) => s + t.pWin, 0) / n : 0;
	const brier = n ? g.reduce((s, t) => {
		const y = t.result === "win" ? 1 : 0;
		return s + (t.pWin - y) ** 2;
	}, 0) / n : 0;
	const logloss = n ? g.reduce((s, t) => {
		const y = t.result === "win" ? 1 : 0;
		const p = Math.min(1 - 1e-6, Math.max(1e-6, t.pWin));
		return s - (y * Math.log(p) + (1 - y) * Math.log(1 - p));
	}, 0) / n : 0;
	const brierBase = n ? g.reduce((s, t) => {
		return s + (.5 - (t.result === "win" ? 1 : 0)) ** 2;
	}, 0) / n : .25;
	const climate = n ? hits / n : .5;
	const brierClimate = n ? g.reduce((s, t) => {
		const y = t.result === "win" ? 1 : 0;
		return s + (climate - y) ** 2;
	}, 0) / n : 0;
	return {
		n,
		hits,
		losses: n - hits,
		hitRate: n ? hits / n : 0,
		exp,
		brier,
		logloss,
		brierBase,
		brierClimate,
		skill: brierClimate > 0 ? 1 - brier / brierClimate : 0,
		skillVsCoin: brierBase > 0 ? 1 - brier / brierBase : 0
	};
}
var CONF_BANDS = [
	{
		id: "toss",
		label: "Toss-up",
		lo: 0,
		hi: .55
	},
	{
		id: "lean",
		label: "Lean",
		lo: .55,
		hi: .65
	},
	{
		id: "strong",
		label: "Strong",
		lo: .65,
		hi: 1.01
	}
];
function winnerBands(rows) {
	const g = rows.filter((t) => t.result === "win" || t.result === "loss");
	return CONF_BANDS.map((b) => {
		const xs = g.filter((t) => t.pWin >= b.lo && t.pWin < b.hi);
		return {
			...b,
			...winnerRecord(xs)
		};
	});
}
var BOOK_KEY = "syndicate.book.v1";
var OUTS_KEY = "syndicate.outs.v1";
function loadOuts() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(OUTS_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id) => SWINGS.some((s) => s.id === id)) : [];
	} catch {
		return [];
	}
}
function persistLockedSlice(phase, plays, tickets, predictions) {
	const saved = loadRun();
	if (!saved) return;
	saveRun({
		...saved,
		phase,
		plays,
		tickets,
		predictions
	});
}
function saveOuts(ids) {
	try {
		localStorage.setItem(OUTS_KEY, JSON.stringify(ids));
	} catch {}
}
function loadTickets() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(BOOK_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function saveTickets(tickets) {
	try {
		localStorage.setItem(BOOK_KEY, JSON.stringify(tickets.slice(0, 80)));
	} catch {}
}
function runSlate(seed, sims, chaos) {
	const games = activeGames();
	const slate = games.map((g) => simulateGame(g, sims, seed, chaos));
	const results = {};
	for (const r of slate) results[r.gameId] = r;
	return {
		results,
		order: [...slate].sort((a, b) => b.rankScore - a.rankScore).map((r) => r.gameId),
		parlays: buildParlays(slate, games),
		props: PROPS.map((p) => simulateProp(p, Math.min(5e3, sims), seed)),
		agents: deriveAgents(slate),
		games
	};
}
var useDesk = create()((set, get) => ({
	hydrated: false,
	running: false,
	sims: DEFAULT_SIMS,
	chaos: true,
	bankroll: DEFAULT_BANKROLL,
	seed: 20260921,
	results: {},
	order: [],
	props: [],
	parlays: [],
	agents: [],
	tickets: [],
	plays: [],
	predictions: [],
	locked: [],
	lockedWinners: [],
	priors: learnFrom(allTickets([])),
	outs: [],
	lastRunAt: null,
	lastRunMs: null,
	runId: null,
	sheetId: SHEET_ID,
	dataMode: DATA_MODE,
	oddsBooks: [],
	oddsFetchedAt: null,
	oddsErrors: [],
	tape: [],
	tapeAt: null,
	tapeNote: "",
	tapeLoading: false,
	tapeErrors: [],
	box: null,
	boxLoading: false,
	runPhase: "idle",
	journal: [],
	snaps: [],
	hydrate: () => {
		if (get().hydrated) return;
		const locked = loadLocked();
		const lockedWinners = loadLockedWinners();
		const outs = loadOuts();
		setActiveOuts(outs);
		const priors = learnFrom(allTickets(locked));
		setPriors(priors);
		const saved = loadRun();
		const current = loadCurrent();
		const lockedWeek = locked.some((t) => t.week === 3);
		const pricedAt = saved?.at ?? current?.pricedAt ?? null;
		if (saved?.quotes?.length) installLiveGames(applyQuotes(GAMES, saved.quotes));
		const books = saved?.oddsBooks ?? [];
		const liveEnough = saved?.dataMode === "live-books" && books.length >= 2;
		set({
			hydrated: true,
			tickets: saved?.tickets?.length ? saved.tickets : loadTickets(),
			plays: saved?.plays ?? [],
			predictions: saved?.predictions ?? [],
			locked,
			lockedWinners,
			priors,
			outs,
			journal: loadJournal(),
			snaps: loadSnaps(),
			runPhase: lockedWeek ? "locked" : saved?.phase ?? current?.status ?? "idle",
			lastRunAt: pricedAt,
			lastRunMs: saved?.ms ?? null,
			runId: saved?.runId ?? current?.runId ?? null,
			sheetId: saved?.sheetId ?? current?.sheetId ?? "seeded-week-3-v1",
			dataMode: saved?.dataMode ?? current?.mode ?? "sandbox-generated",
			oddsBooks: books,
			oddsFetchedAt: saved?.oddsFetchedAt ?? null,
			oddsErrors: saved?.oddsErrors ?? [],
			tape: loadTape(),
			...saved ? {
				results: saved.results ?? {},
				order: saved.order ?? [],
				props: saved.props ?? [],
				parlays: saved.parlays ?? [],
				agents: saved.results ? deriveAgents(Object.values(saved.results)) : [],
				seed: saved.seed,
				sims: saved.sims,
				chaos: saved.chaos,
				bankroll: saved.bankroll ?? get().bankroll
			} : current ? { bankroll: current.bankroll } : {}
		});
		if (!lockedWeek && typeof window !== "undefined") {
			if (get().plays.some((p) => p.audit && !p.audit.cardLockTimestamp && !p.audit.voidReason)) get().lockWeek("automation:desk");
			else if (!pricedAt || !liveEnough) get().run();
		}
	},
	setSims: (n) => set({ sims: n }),
	setChaos: (v) => {
		set({ chaos: v });
		if (typeof window !== "undefined") queueMicrotask(() => get().run());
	},
	setBankroll: (n) => set({ bankroll: Math.max(100, n) }),
	run: async (opts) => {
		if (typeof window === "undefined") return;
		if (get().running) return;
		const sims = opts?.sims ?? get().sims;
		const lockedWeek = get().runPhase === "locked" || get().locked.some((t) => t.week === 3);
		set({
			running: true,
			sims,
			runPhase: lockedWeek ? "locked" : "simulating"
		});
		let books = get().oddsBooks;
		let fetchedAt = get().oddsFetchedAt;
		let errors = get().oddsErrors;
		let quotes = [];
		if (!lockedWeek) try {
			const board = await fetchLiveBoard();
			books = board.books;
			fetchedAt = board.fetchedAt;
			errors = board.errors;
			quotes = board.quotes;
			installLiveGames(board.quotes.length ? applyQuotes(GAMES, board.quotes) : []);
			const tape = appendTape(get().tape, board.quotes);
			saveTape(tape);
			set({
				tape,
				tapeAt: board.fetchedAt,
				tapeNote: board.lookaheadNote
			});
		} catch (err) {
			books = [];
			fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
			errors = [`board: ${err instanceof Error ? err.message : "fetch failed"}`];
			quotes = [];
			installLiveGames([]);
		}
		const seed = get().seed + 97 >>> 0;
		const t0 = performance.now();
		const out = runSlate(seed, sims, get().chaos);
		const games = out.games;
		const live = liveTrueCard(Object.values(out.results), out.parlays, out.props, games);
		const at = Date.now();
		const runId = makeRunId(at);
		const dataMode = books.length > 0 ? "live-books" : DATA_MODE;
		if (lockedWeek) {
			const { games: _ignored, ...desk } = out;
			set({
				...desk,
				seed,
				running: false,
				lastRunMs: Math.round(performance.now() - t0),
				journal: appendJournal(get().journal, {
					type: "priced",
					note: `${makeRunId(Date.now())} · research resim · card not mutated`
				})
			});
			return;
		}
		const { plays } = capGameExposure(books.length ? collectPlays(Object.values(out.results), out.parlays, out.props, games, runId, at, false) : []);
		const tickets = [...plays.map((p) => paperFromPlay(p, get().bankroll)), ...get().tickets.filter((t) => t.voidedAt)];
		saveTickets(tickets);
		const predictions = unofficialWinners(Object.values(out.results), games, 3);
		const snap = snapshotFrom(Object.values(out.results), new Set(live.takes.map((t) => t.gameId)), seed, sims, get().chaos);
		const snaps = pushSnap(get().snaps, snap);
		const reason = plays.length === 0 ? "NO_QUALIFYING_EDGES" : "ok";
		const journal = appendJournal(get().journal, {
			type: "priced",
			note: `${runId} · RUN_PRICED · ${reason} · card ${plays.length} · books ${books.join("+") || "none"} · su ${predictions.length}`
		});
		saveCurrent(currentFrom({
			runId,
			at,
			phase: "priced",
			bankroll: get().bankroll,
			nTickets: plays.length,
			nPredictions: predictions.length,
			mode: dataMode
		}));
		saveRun({
			runId,
			sheetId: SHEET_ID,
			at,
			ms: Math.round(performance.now() - t0),
			phase: "priced",
			seed,
			sims,
			chaos: get().chaos,
			bankroll: get().bankroll,
			modelVersion: MODEL_VERSION,
			dataMode,
			oddsBooks: books,
			oddsFetchedAt: fetchedAt,
			oddsErrors: errors,
			quotes,
			results: out.results,
			order: out.order,
			props: out.props,
			parlays: out.parlays,
			tickets,
			predictions,
			plays
		});
		set({
			results: out.results,
			order: out.order,
			props: out.props,
			parlays: out.parlays,
			agents: out.agents,
			seed,
			running: false,
			lastRunAt: at,
			lastRunMs: Math.round(performance.now() - t0),
			runId,
			sheetId: SHEET_ID,
			dataMode,
			oddsBooks: books,
			oddsFetchedAt: fetchedAt,
			oddsErrors: errors,
			runPhase: "priced",
			snaps,
			journal,
			tickets,
			plays,
			predictions
		});
		if (plays.some((p) => p.audit && !p.audit.voidReason)) get().lockWeek("automation:desk");
	},
	paperGame: (gameId) => {
		if (get().runPhase === "locked") {
			const plays = get().plays.map((p) => p.gameId === gameId && p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: "Paper refused after lock. Original retained.",
					actor: "operator:desk"
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "revised",
					note: "LOCK_REFUSED · paper after lock appends nothing"
				})
			});
			persistLockedSlice("locked", plays, get().tickets, get().predictions);
			return false;
		}
		const play = get().plays.find((p) => p.gameId === gameId && isLiveBook(p.source));
		if (!play) {
			set({ journal: appendJournal(get().journal, {
				type: "revised",
				note: `REFUSED · ${gameId} has no live-book recommendation`
			}) });
			return false;
		}
		const ticket = paperFromPlay(play, get().bankroll);
		const tickets = upsertTicket(get().tickets, ticket);
		saveTickets(tickets);
		set({
			tickets,
			journal: appendJournal(get().journal, {
				type: "papered",
				ticketId: ticket.id,
				note: `Paper ${ticket.side}`
			})
		});
		return true;
	},
	paperProp: (id) => {
		set({ journal: appendJournal(get().journal, {
			type: "revised",
			ticketId: id,
			note: "REFUSED · prop is not a live book price"
		}) });
		return false;
	},
	paperParlay: (id) => {
		set({ journal: appendJournal(get().journal, {
			type: "revised",
			ticketId: id,
			note: "REFUSED · model parlay is not a posted book price"
		}) });
		return false;
	},
	paperAllPlus: () => {
		if (get().runPhase === "locked") {
			const plays = get().plays.map((p) => p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: "Paper refused after lock. Original retained.",
					actor: "operator:desk"
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "revised",
					note: "LOCK_REFUSED · paper after lock appends nothing"
				})
			});
			persistLockedSlice("locked", plays, get().tickets, get().predictions);
			return 0;
		}
		let n = 0;
		let tickets = get().tickets;
		const bankroll = get().bankroll;
		for (const play of get().plays) {
			if (!isLiveBook(play.source)) continue;
			const ticket = paperFromPlay(play, bankroll);
			const open = tickets.some((t) => t.id === ticket.id && !t.voidedAt);
			tickets = upsertTicket(tickets, ticket);
			if (!open) n += 1;
		}
		saveTickets(tickets);
		set({
			tickets,
			journal: n ? appendJournal(get().journal, {
				type: "papered",
				note: `Paper ${n} live-book sides`
			}) : get().journal
		});
		return n;
	},
	voidTicket: (id) => {
		if (get().runPhase === "locked") {
			const plays = get().plays.map((p) => p.id === id && p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: "Void refused after lock. Original retained.",
					actor: "operator:desk"
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "voided",
					ticketId: id,
					note: `LOCK_REFUSED · void ${id} after lock`
				})
			});
			persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
			return;
		}
		const tickets = get().tickets.map((t) => t.id === id ? {
			...t,
			voidedAt: Date.now()
		} : t);
		const plays = get().plays.map((p) => p.id === id && p.audit ? {
			...p,
			audit: appendAudit(p.audit, {
				type: "void",
				note: "Operator void before lock. Ticket retained.",
				actor: "operator:desk"
			}, { voidReason: "operator-void-before-lock" })
		} : p);
		saveTickets(tickets);
		persistLockedSlice(get().runPhase, plays, tickets, get().predictions);
		set({
			tickets,
			plays,
			journal: appendJournal(get().journal, {
				type: "voided",
				ticketId: id,
				note: `Void ${id} · retained`
			})
		});
	},
	clearBook: () => {
		if (get().runPhase === "locked") {
			const plays = get().plays.map((p) => p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: "Clear refused after lock. Original retained.",
					actor: "operator:desk"
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "cleared",
					note: "LOCK_REFUSED · clear after lock"
				})
			});
			persistLockedSlice("locked", plays, get().tickets, get().predictions);
			return;
		}
		const n = get().tickets.filter((t) => !t.voidedAt).length;
		const tickets = get().tickets.map((t) => t.voidedAt ? t : {
			...t,
			voidedAt: Date.now()
		});
		const plays = get().plays.map((p) => p.audit && !p.audit.voidReason ? {
			...p,
			audit: appendAudit(p.audit, {
				type: "void",
				note: "Clear before lock. Ticket retained.",
				actor: "operator:desk"
			}, { voidReason: "clear-before-lock" })
		} : p);
		saveTickets(tickets);
		persistLockedSlice(get().runPhase, plays, tickets, get().predictions);
		set({
			tickets,
			plays,
			journal: appendJournal(get().journal, {
				type: "cleared",
				note: `Voided ${n} open tickets`
			})
		});
	},
	lockWeek: (actor = "operator:desk") => {
		if (get().runPhase === "locked" || get().plays.some((p) => p.audit?.cardLockTimestamp)) {
			const plays = get().plays.map((p) => p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: "Relock refused. Append-only. Original retained.",
					actor
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "revised",
					note: `LOCK_REFUSED · Week 3 already locked · append-only`
				})
			});
			persistLockedSlice("locked", plays, get().tickets, get().predictions);
			return 0;
		}
		const at = Date.now();
		const decision = applyCardLock(get().plays.map((p) => p.audit).filter((a) => Boolean(a)), at, actor);
		if (!decision.ok) {
			const why = decision.reason === "KICKOFF" ? `LOCK_REFUSED · ${decision.blocked} ticket(s) at or after sheet kickoff${decision.earliest ? ` · earliest ${new Date(decision.earliest).toISOString()}` : ""}` : "LOCK_REFUSED · no open recommendation to lock";
			const plays = get().plays.map((p) => p.audit ? {
				...p,
				audit: appendAudit(p.audit, {
					type: "refused",
					note: why,
					actor: "operator:desk"
				})
			} : p);
			set({
				plays,
				journal: appendJournal(get().journal, {
					type: "revised",
					note: why
				})
			});
			persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
			return 0;
		}
		const plays = get().plays.map((p) => {
			if (!p.audit || p.audit.voidReason) return p;
			return {
				...p,
				status: "locked",
				audit: lockAudit(p.audit, at, actor)
			};
		});
		const card = plays.filter((p) => p.audit?.integrity === "valid").map((p) => ledgerFromPlay(p, 3));
		const prev = get().locked.filter((t) => t.week === 3);
		const locked = [...get().locked.filter((t) => t.week !== 3), ...card];
		const winners = get().predictions.length ? get().predictions : unofficialWinners(Object.values(get().results), activeGames(), 3);
		const lockedWinners = [...get().lockedWinners.filter((t) => t.week !== 3), ...winners];
		saveLocked(locked);
		saveLockedWinners(lockedWinners);
		const journal = appendJournal(get().journal, {
			type: prev.length ? "revised" : "locked",
			note: `Week 3 card locked · ${card.length} tickets · ${new Date(at).toISOString()} · ${actor} · before sheet kickoff`
		});
		const runId = get().runId;
		if (runId) saveCurrent(currentFrom({
			runId,
			at,
			phase: "locked",
			bankroll: get().bankroll,
			nTickets: card.length,
			nPredictions: winners.length,
			mode: get().dataMode
		}));
		set({
			locked,
			lockedWinners,
			plays,
			predictions: winners,
			runPhase: "locked",
			journal
		});
		persistLockedSlice("locked", plays, get().tickets, winners);
		return card.length;
	},
	loadBox: async (force) => {
		if (get().boxLoading) return;
		const have = get().box;
		if (have && !force && Array.isArray(have.closes)) return;
		set({ boxLoading: true });
		try {
			const board = await fetchBoxBoard();
			const at = Date.parse(board.fetchedAt);
			const stampAt = Number.isFinite(at) ? at : Date.now();
			const plays = get().plays.map((p) => {
				if (!p.audit || !p.matchup || p.kind !== "spread" && p.kind !== "total") return p;
				const grade = gradeTicket({
					id: p.id,
					week: 3,
					kind: p.kind,
					matchup: p.matchup,
					side: p.selection,
					line: p.line,
					price: p.price,
					prob: p.modelP,
					ev: p.ev,
					tags: [],
					clv: 0,
					result: "pending",
					reasons: []
				}, board, stampAt);
				const audit = applyGradeToAudit(p.audit, grade, stampAt);
				return audit === p.audit ? p : {
					...p,
					audit
				};
			});
			const changed = plays.some((p, i) => p !== get().plays[i]);
			set({
				box: board,
				boxLoading: false,
				plays
			});
			noteSeasonWeek(plays);
			if (changed) persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
		} catch (err) {
			set({
				box: {
					fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
					source: "ESPN scoreboard",
					weeks: [
						1,
						2,
						3
					],
					games: [],
					errors: [err instanceof Error ? err.message : "fetch failed"],
					closes: [],
					closeErrors: []
				},
				boxLoading: false
			});
		}
	},
	toggleOut: (id) => {
		const outs = get().outs.includes(id) ? get().outs.filter((x) => x !== id) : [...get().outs, id];
		setActiveOuts(outs);
		saveOuts(outs);
		set({ outs });
		const gameId = SWINGS.find((s) => s.id === id)?.gameId;
		const game = gameId ? getGame(gameId) : void 0;
		if (!game || !get().lastRunAt || typeof window === "undefined") return;
		window.setTimeout(() => {
			const r = simulateGame(game, get().sims, get().seed, get().chaos);
			const results = {
				...get().results,
				[game.id]: r
			};
			const slate = Object.values(results);
			set({
				results,
				order: [...slate].sort((a, b) => b.rankScore - a.rankScore).map((x) => x.gameId),
				parlays: buildParlays(slate, activeGames()),
				props: PROPS.map((p) => simulateProp(p, Math.min(5e3, get().sims), get().seed)),
				agents: deriveAgents(slate)
			});
		}, 20);
	},
	refreshTape: async () => {
		if (typeof window === "undefined" || get().tapeLoading) return;
		set({ tapeLoading: true });
		try {
			const board = await fetchLiveBoard();
			const tape = appendTape(get().tape, board.quotes);
			saveTape(tape);
			set({
				tape,
				tapeAt: board.fetchedAt,
				tapeNote: board.lookaheadNote,
				tapeErrors: board.errors,
				tapeLoading: false
			});
		} catch (err) {
			set({
				tapeLoading: false,
				tapeErrors: [err instanceof Error ? err.message : "tape fetch failed"]
			});
		}
	}
}));
if (typeof window !== "undefined") useDesk.getState().hydrate();
//#endregion
export { segmentBook as $, downloadCsv as A, isSharpFlag as B, bestTake as C, cardUnits as D, calibrate as E, getAgent as F, liveTrueCard as G, ledgerCsv as H, isAnomalyFlag as I, pipelineHealth as J, maxDrawdown as K, isPrime as L, flagTone as M, gameSlot as N, conditionAdjustments as O, getActiveOuts as P, refTone as Q, isPublicFlag as R, analyzeSharp as S, buildLedger as T, ledgerGate as U, isTapeFlag as V, ledgerSplit as W, portfolioOf as X, pnlSplit as Y, publicRead as Z, REASON_COPY as _, formatScore as _t, DESK_ENV as a, tapeRows as at, analyzeBook as b, formatUnits as bt, MARKET_AS_OF as c, unofficialWinners as ct, MEAN_SHIFT_FACTOR as d, volumeReport as dt, sharpTone as et, MIN_EV as f, winnerBands as ft, PRODUCTION as g, formatPct as gt, PHASE_COPY as h, cn as ht, DEFAULT_SIMS as i, swingsFor as it, evidenceCopy as j, diffSnapshots as k, MAX_BANKROLL_PCT as l, useDesk as lt, ODDS_SOURCE as m, americanOdds as mt, ASSUMPTIONS as n, sizeBreakdown as nt, KELLY_FRACTION as o, ticketPnl as ot, MODEL_VERSION as p, winnerRecord as pt, paperStake as q, DATA_SOURCE as r, sizeUnits as rt, LEAGUE_FLAGS as s, ticketUnits as st, AGENT_CATALOG as t, simulateGame as tt, MAX_SIMS as u, volumeGate as ut, allTickets as v, formatSigned as vt, briefAgent as w, analyzeRef as x, allWinners as y, formatSpread as yt, isRefFlag as z };
