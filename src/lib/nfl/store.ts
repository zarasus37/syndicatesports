import { create } from "zustand";
import { deriveAgents } from "./agents";
import { DEFAULT_BANKROLL, DEFAULT_SIMS } from "./config";
import { simulateGame, simulateProp } from "./engine";
import { upsertTicket } from "./execution";
import { allTickets, learnFrom, loadLocked, saveLocked } from "./learn";
import { buildParlays } from "./parlay";
import { setActiveOuts, SWINGS } from "./outs";
import { setPriors, type LearnedPriors } from "./priors";
import { fetchBoxBoard } from "./box-score";
import { applyGradeToAudit, gradeTicket, type BoxBoard } from "./box";
import { noteSeasonWeek } from "./volume";
import { GAMES, PROPS, WEEK, activeGames, gamesForCard, getGame, installLiveGames, syncWeek } from "./slate";
import { applyQuotes, isLiveBook } from "./books";
import { appendTape, loadTape, saveTape, type TapePrint } from "./line-tape";
import { fetchLiveBoard } from "./live-books";
import { readMarketTape } from "./scrape";
import { DATA_MODE, loadRun, makeRunId, saveRun, SHEET_ID, type DataMode } from "./run-store";
import { appendJournal, loadJournal, loadSnaps, pushSnap, snapshotFrom, type JournalEvent, type RunPhase, type SlateSnapshot } from "./audit";
import { currentFrom, loadCurrent, saveCurrent } from "./current-run";
import { appendAudit, applyCardLock, lockAudit } from "./integrity";
import { capGameExposure } from "./sizing";
import { collectPlays, ledgerFromPlay, paperFromPlay } from "./ticket";
import type { CardPlay } from "./ticket";
import { MODEL_VERSION } from "./desk-meta";
import { liveTrueCard, unofficialWinners } from "./card";
import { loadLockedWinners, saveLockedWinners } from "./winners";
import type { AgentStatus, BookQuote, GameSimResult, LedgerTicket, PaperTicket, ParlayTicket, PropSim, WinnerPick } from "./types";

const BOOK_KEY = "syndicate.book.v1";
const OUTS_KEY = "syndicate.outs.v1";

interface DeskState {
  hydrated: boolean;
  running: boolean;
  sims: number;
  chaos: boolean;
  bankroll: number;
  seed: number;
  results: Record<string, GameSimResult>;
  order: string[];
  props: PropSim[];
  parlays: ParlayTicket[];
  agents: AgentStatus[];
  tickets: PaperTicket[];
  plays: CardPlay[];
  predictions: WinnerPick[];
  locked: LedgerTicket[];
  lockedWinners: WinnerPick[];
  priors: LearnedPriors;
  lastRunAt: number | null;
  lastRunMs: number | null;
  runId: string | null;
  sheetId: string;
  dataMode: DataMode;
  oddsBooks: string[];
  oddsFetchedAt: string | null;
  oddsErrors: string[];
  tape: TapePrint[];
  tapeAt: string | null;
  tapeNote: string;
  tapeLoading: boolean;
  tapeErrors: string[];
  refreshTape: () => Promise<void>;
  box: BoxBoard | null;
  boxLoading: boolean;
  loadBox: (force?: boolean) => Promise<void>;
  runPhase: RunPhase;
  journal: JournalEvent[];
  snaps: SlateSnapshot[];
  hydrate: () => void;
  setSims: (n: number) => void;
  setChaos: (v: boolean) => void;
  setBankroll: (n: number) => void;
  run: (opts?: { sims?: number }) => void | Promise<void>;
  paperGame: (gameId: string) => boolean;
  paperParlay: (id: string) => boolean;
  paperProp: (id: string) => boolean;
  paperAllPlus: () => number;
  voidTicket: (id: string) => void;
  clearBook: () => void;
  lockWeek: (actor?: string) => number;
  outs: string[];
  toggleOut: (id: string) => void;
}

function loadOuts(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(OUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => SWINGS.some((s) => s.id === id)) : [];
  } catch {
    return [];
  }
}

function persistLockedSlice(phase: RunPhase, plays: CardPlay[], tickets: PaperTicket[], predictions: WinnerPick[]) {
  const saved = loadRun();
  if (!saved) return;
  saveRun({ ...saved, phase, plays, tickets, predictions });
}

function saveOuts(ids: string[]) {
  try {
    localStorage.setItem(OUTS_KEY, JSON.stringify(ids));
  } catch {
    /* quota */
  }
}

function loadTickets(): PaperTicket[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PaperTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: PaperTicket[]) {
  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(tickets.slice(0, 80)));
  } catch {
    /* ignore quota */
  }
}

function runSlate(seed: number, sims: number, chaos: boolean) {
  const games = activeGames();
  const slate = games.map((g) => simulateGame(g, sims, seed, chaos));
  const results: Record<string, GameSimResult> = {};
  for (const r of slate) results[r.gameId] = r;
  const order = [...slate].sort((a, b) => b.rankScore - a.rankScore).map((r) => r.gameId);
  const parlays = buildParlays(slate, games);
  const props = syncWeek() === 3 ? PROPS.map((p) => simulateProp(p, Math.min(5000, sims), seed)) : [];
  const agents = deriveAgents(slate);
  return { results, order, parlays, props, agents, games };
}

export const useDesk = create<DeskState>()((set, get) => ({
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
    const week = syncWeek();
    const locked = loadLocked();
    const lockedWinners = loadLockedWinners();
    const outs = loadOuts();
    setActiveOuts(outs);
    const priors = learnFrom(allTickets(locked));
    setPriors(priors);
    const saved = loadRun();
    const current = loadCurrent();
    const lockedWeek = locked.some((t) => t.week === week);
    const savedWeek = saved?.predictions?.[0]?.week;
    const sameWeek = savedWeek == null || savedWeek === week;
    const pricedAt = saved?.at ?? current?.pricedAt ?? null;
    if (saved?.quotes?.length) installLiveGames(applyQuotes(GAMES, saved.quotes));
    const books = saved?.oddsBooks ?? [];
    const liveEnough = saved?.dataMode === "live-books" && books.length >= 2;
    set({
      hydrated: true,
      tickets: sameWeek && saved?.tickets?.length ? saved.tickets : loadTickets(),
      plays: sameWeek ? (saved?.plays ?? []) : [],
      predictions: sameWeek ? (saved?.predictions ?? []) : [],
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
      sheetId: saved?.sheetId ?? current?.sheetId ?? SHEET_ID,
      dataMode: saved?.dataMode ?? current?.mode ?? DATA_MODE,
      oddsBooks: books,
      oddsFetchedAt: saved?.oddsFetchedAt ?? null,
      oddsErrors: saved?.oddsErrors ?? [],
      tape: loadTape(),
      ...(saved
        ? {
            results: saved.results ?? {},
            order: saved.order ?? [],
            props: saved.props ?? [],
            parlays: saved.parlays ?? [],
            agents: saved.results ? deriveAgents(Object.values(saved.results)) : [],
            seed: saved.seed,
            sims: saved.sims,
            chaos: saved.chaos,
            bankroll: saved.bankroll ?? get().bankroll,
          }
        : current
          ? { bankroll: current.bankroll }
          : {}),
    });
    if (!lockedWeek && typeof window !== "undefined") {
      const open = sameWeek && get().plays.some((p) => p.audit && !p.audit.cardLockTimestamp && !p.audit.voidReason);
      if (open) get().lockWeek("automation:desk");
      else if (!sameWeek || !pricedAt || !liveEnough) get().run();
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
    const week = syncWeek();
    const lockedWeek = get().locked.some((t) => t.week === week);
    set({ running: true, sims, runPhase: lockedWeek ? "locked" : "simulating" });
    let books: string[] = get().oddsBooks;
    let fetchedAt = get().oddsFetchedAt;
    let errors = get().oddsErrors;
    let quotes: BookQuote[] = [];
    if (!lockedWeek) {
      try {
        const board = await fetchLiveBoard();
        books = board.books;
        fetchedAt = board.fetchedAt;
        errors = board.errors;
        quotes = board.quotes;
        installLiveGames(applyQuotes(gamesForCard(week, quotes), quotes), week !== 3);
        const tape = appendTape(get().tape, board.quotes);
        saveTape(tape);
        set({ tape, tapeAt: board.fetchedAt, tapeNote: board.lookaheadNote });
      } catch (err) {
        books = [];
        fetchedAt = new Date().toISOString();
        errors = [`board: ${err instanceof Error ? err.message : "fetch failed"}`];
        quotes = [];
        installLiveGames([]);
      }
    }
    const seed = (get().seed + 97) >>> 0;
    const t0 = performance.now();
    const out = runSlate(seed, sims, get().chaos);
    const games = out.games;
    const live = liveTrueCard(Object.values(out.results), out.parlays, out.props, games);
    const at = Date.now();
    const runId = makeRunId(at);
    const dataMode: DataMode = books.length > 0 ? "live-books" : DATA_MODE;
    if (lockedWeek) {
      set({
        running: false,
        runPhase: "locked",
        journal: appendJournal(get().journal, {
          type: "priced",
          note: `${makeRunId(Date.now())} · names kept · a later run does not rewrite the 16`,
        }),
      });
      return;
    }
    const rawPlays = books.length
      ? collectPlays(Object.values(out.results), out.parlays, out.props, games, runId, at, false)
      : [];
    const { plays } = capGameExposure(rawPlays);
    const fresh = plays.map((p) => paperFromPlay(p, get().bankroll));
    const tickets = [...fresh, ...get().tickets.filter((t) => t.voidedAt)];
    saveTickets(tickets);
    const already = get().lockedWinners.filter((p) => p.week === week);
    const held = get().predictions.filter((p) => p.week === week);
    const predictions = already.length === 16 ? already : held.length === 16 ? held : unofficialWinners(Object.values(out.results), games, week);
    const snap = snapshotFrom(Object.values(out.results), new Set(live.takes.map((t) => t.gameId)), seed, sims, get().chaos);
    const snaps = pushSnap(get().snaps, snap);
    const reason = plays.length === 0 ? "NO_QUALIFYING_EDGES" : "ok";
    const journal = appendJournal(get().journal, {
      type: "priced",
      note: `${runId} · RUN_PRICED · ${reason} · card ${plays.length} · books ${books.join("+") || "none"} · su ${predictions.length}`,
    });
    saveCurrent(
      currentFrom({
        runId,
        at,
        phase: "priced",
        bankroll: get().bankroll,
        nTickets: plays.length,
        nPredictions: predictions.length,
        mode: dataMode,
      }),
    );
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
      plays,
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
      predictions,
    });
    if (plays.some((p) => p.audit && !p.audit.voidReason)) get().lockWeek("automation:desk");
  },
  paperGame: (gameId) => {
    if (get().runPhase === "locked") {
      const plays = get().plays.map((p) =>
        p.gameId === gameId && p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Paper refused after lock. Original retained.", actor: "operator:desk" }) }
          : p,
      );
      const journal = appendJournal(get().journal, { type: "revised", note: "LOCK_REFUSED · paper after lock appends nothing" });
      set({ plays, journal });
      persistLockedSlice("locked", plays, get().tickets, get().predictions);
      return false;
    }
    const play = get().plays.find((p) => p.gameId === gameId && isLiveBook(p.source));
    if (!play) {
      set({ journal: appendJournal(get().journal, { type: "revised", note: `REFUSED · ${gameId} has no live-book recommendation` }) });
      return false;
    }
    const ticket = paperFromPlay(play, get().bankroll);
    const tickets = upsertTicket(get().tickets, ticket);
    saveTickets(tickets);
    set({ tickets, journal: appendJournal(get().journal, { type: "papered", ticketId: ticket.id, note: `Paper ${ticket.side}` }) });
    return true;
  },
  paperProp: (id) => {
    set({ journal: appendJournal(get().journal, { type: "revised", ticketId: id, note: "REFUSED · prop is not a live book price" }) });
    return false;
  },
  paperParlay: (id) => {
    set({ journal: appendJournal(get().journal, { type: "revised", ticketId: id, note: "REFUSED · model parlay is not a posted book price" }) });
    return false;
  },
  paperAllPlus: () => {
    if (get().runPhase === "locked") {
      const plays = get().plays.map((p) =>
        p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Paper refused after lock. Original retained.", actor: "operator:desk" }) }
          : p,
      );
      const journal = appendJournal(get().journal, { type: "revised", note: "LOCK_REFUSED · paper after lock appends nothing" });
      set({ plays, journal });
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
      journal: n ? appendJournal(get().journal, { type: "papered", note: `Paper ${n} live-book sides` }) : get().journal,
    });
    return n;
  },
  voidTicket: (id) => {
    if (get().runPhase === "locked") {
      const plays = get().plays.map((p) =>
        p.id === id && p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Void refused after lock. Original retained.", actor: "operator:desk" }) }
          : p,
      );
      const journal = appendJournal(get().journal, { type: "voided", ticketId: id, note: `LOCK_REFUSED · void ${id} after lock` });
      set({ plays, journal });
      persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
      return;
    }
    const tickets = get().tickets.map((t) => (t.id === id ? { ...t, voidedAt: Date.now() } : t));
    const plays = get().plays.map((p) =>
      p.id === id && p.audit
        ? {
            ...p,
            audit: appendAudit(
              p.audit,
              { type: "void", note: "Operator void before lock. Ticket retained.", actor: "operator:desk" },
              { voidReason: "operator-void-before-lock" },
            ),
          }
        : p,
    );
    saveTickets(tickets);
    persistLockedSlice(get().runPhase, plays, tickets, get().predictions);
    set({ tickets, plays, journal: appendJournal(get().journal, { type: "voided", ticketId: id, note: `Void ${id} · retained` }) });
  },
  clearBook: () => {
    if (get().runPhase === "locked") {
      const plays = get().plays.map((p) =>
        p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Clear refused after lock. Original retained.", actor: "operator:desk" }) }
          : p,
      );
      const journal = appendJournal(get().journal, { type: "cleared", note: "LOCK_REFUSED · clear after lock" });
      set({ plays, journal });
      persistLockedSlice("locked", plays, get().tickets, get().predictions);
      return;
    }
    const n = get().tickets.filter((t) => !t.voidedAt).length;
    const tickets = get().tickets.map((t) => (t.voidedAt ? t : { ...t, voidedAt: Date.now() }));
    const plays = get().plays.map((p) =>
      p.audit && !p.audit.voidReason
        ? {
            ...p,
            audit: appendAudit(
              p.audit,
              { type: "void", note: "Clear before lock. Ticket retained.", actor: "operator:desk" },
              { voidReason: "clear-before-lock" },
            ),
          }
        : p,
    );
    saveTickets(tickets);
    persistLockedSlice(get().runPhase, plays, tickets, get().predictions);
    set({ tickets, plays, journal: appendJournal(get().journal, { type: "cleared", note: `Voided ${n} open tickets` }) });
  },
  lockWeek: (actor = "operator:desk") => {
    syncWeek();
    if (get().locked.some((t) => t.week === WEEK) || get().plays.some((p) => p.audit?.cardLockTimestamp)) {
      const plays = get().plays.map((p) =>
        p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Relock refused. Append-only. Original retained.", actor }) }
          : p,
      );
      const journal = appendJournal(get().journal, {
        type: "revised",
        note: `LOCK_REFUSED · Week ${WEEK} already locked · append-only`,
      });
      set({ plays, journal });
      persistLockedSlice("locked", plays, get().tickets, get().predictions);
      return 0;
    }
    const at = Date.now();
    const decision = applyCardLock(
      get().plays.map((p) => p.audit).filter((a): a is NonNullable<typeof a> => Boolean(a)),
      at,
      actor,
    );
    if (!decision.ok) {
      const why =
        decision.reason === "KICKOFF"
          ? `LOCK_REFUSED · ${decision.blocked} ticket(s) at or after sheet kickoff${decision.earliest ? ` · earliest ${new Date(decision.earliest).toISOString()}` : ""}`
          : "LOCK_REFUSED · no open recommendation to lock";
      const plays = get().plays.map((p) =>
        p.audit ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: why, actor: "operator:desk" }) } : p,
      );
      const journal = appendJournal(get().journal, { type: "revised", note: why });
      set({ plays, journal });
      persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
      return 0;
    }
    const plays = get().plays.map((p) => {
      if (!p.audit || p.audit.voidReason) return p;
      return { ...p, status: "locked" as const, audit: lockAudit(p.audit, at, actor) };
    });
    const card = plays.filter((p) => p.audit?.integrity === "valid").map((p) => ledgerFromPlay(p, WEEK));
    const prev = get().locked.filter((t) => t.week === WEEK);
    const locked = [...get().locked.filter((t) => t.week !== WEEK), ...card];
    const winners = get().predictions.length
      ? get().predictions
      : unofficialWinners(Object.values(get().results), activeGames(), WEEK);
    const lockedWinners = [...get().lockedWinners.filter((t) => t.week !== WEEK), ...winners];
    saveLocked(locked);
    saveLockedWinners(lockedWinners);
    const journal = appendJournal(get().journal, {
      type: prev.length ? "revised" : "locked",
      note: `Week ${WEEK} card locked · ${card.length} tickets · ${new Date(at).toISOString()} · ${actor} · before sheet kickoff`,
    });
    const runId = get().runId;
    if (runId) {
      saveCurrent(
        currentFrom({
          runId,
          at,
          phase: "locked",
          bankroll: get().bankroll,
          nTickets: card.length,
          nPredictions: winners.length,
          mode: get().dataMode,
        }),
      );
    }
    set({ locked, lockedWinners, plays, predictions: winners, runPhase: "locked", journal });
    persistLockedSlice("locked", plays, get().tickets, winners);
    return card.length;
  },
  loadBox: async (force) => {
    syncWeek();
    if (get().boxLoading) return;
    const have = get().box;
    if (have && !force && Array.isArray(have.closes)) return;
    set({ boxLoading: true });
    try {
      const board = await fetchBoxBoard();
      const at = Date.parse(board.fetchedAt);
      const stampAt = Number.isFinite(at) ? at : Date.now();
      const plays = get().plays.map((p) => {
        if (!p.audit || !p.matchup || (p.kind !== "spread" && p.kind !== "total")) return p;
        const grade = gradeTicket(
          {
            id: p.id,
            week: WEEK,
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
            reasons: [],
          },
          board,
          stampAt,
        );
        const audit = applyGradeToAudit(p.audit, grade, stampAt);
        return audit === p.audit ? p : { ...p, audit };
      });
      const changed = plays.some((p, i) => p !== get().plays[i]);
      set({ box: board, boxLoading: false, plays });
      noteSeasonWeek(plays);
      if (changed) persistLockedSlice(get().runPhase, plays, get().tickets, get().predictions);
    } catch (err) {
      set({
        box: {
          fetchedAt: new Date().toISOString(),
          source: "ESPN scoreboard",
          weeks: [1, 2, WEEK],
          games: [],
          errors: [err instanceof Error ? err.message : "fetch failed"],
          closes: [],
          closeErrors: [],
        },
        boxLoading: false,
      });
    }
  },
  toggleOut: (id) => {
    const has = get().outs.includes(id);
    const outs = has ? get().outs.filter((x) => x !== id) : [...get().outs, id];
    setActiveOuts(outs);
    saveOuts(outs);
    set({ outs });
    const swing = SWINGS.find((s) => s.id === id);
    const gameId = swing?.gameId;
    const game = gameId ? getGame(gameId) : undefined;
    if (!game || !get().lastRunAt || typeof window === "undefined") return;
    window.setTimeout(() => {
      const r = simulateGame(game, get().sims, get().seed, get().chaos);
      const results = { ...get().results, [game.id]: r };
      const slate = Object.values(results);
      const order = [...slate].sort((a, b) => b.rankScore - a.rankScore).map((x) => x.gameId);
      const parlays = buildParlays(slate, activeGames());
      const props = PROPS.map((p) => simulateProp(p, Math.min(5000, get().sims), get().seed));
      const agents = deriveAgents(slate);
      set({ results, order, parlays, props, agents });
    }, 20);
  },
  refreshTape: async () => {
    if (typeof window === "undefined" || get().tapeLoading) return;
    set({ tapeLoading: true });
    try {
      const stored = await readMarketTape();
      const prints: TapePrint[] = stored.prints.flatMap((row) => {
        if (row.book !== "Pinnacle" && row.book !== "FanDuel" && row.book !== "DraftKings" && row.book !== "Bovada") return [];
        const spread = Number(row.spread);
        const total = Number(row.total);
        if (!Number.isFinite(spread) || !Number.isFinite(total)) return [];
        return [
          {
            book: row.book,
            gameId: row.game_id,
            week: row.week,
            kickoff: row.kickoff,
            at: row.fetched_at,
            spread,
            spreadPrice: Number(row.spread_price),
            total,
            totalPrice: Number(row.total_price),
          },
        ];
      });
      const tape = prints.length ? prints : get().tape;
      if (prints.length) saveTape(tape);
      const last = stored.last;
      set({
        tape,
        tapeAt: last?.started_at ?? get().tapeAt,
        tapeNote: last
          ? `Server scrape ${last.started_at}. ${last.quotes} prices seen, ${last.inserted} new. ${stored.scores} score lines stored. ${last.note}`
          : get().tapeNote,
        tapeErrors: [],
        tapeLoading: false,
      });
    } catch (err) {
      set({
        tapeLoading: false,
        tapeErrors: [err instanceof Error ? err.message : "tape fetch failed"],
      });
    }
  },
}));

if (typeof window !== "undefined") {
  useDesk.getState().hydrate();
}
