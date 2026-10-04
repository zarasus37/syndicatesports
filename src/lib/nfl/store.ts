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
import { GAMES, MIN_LIVE_GAMES, PROPS, SEEDED_WEEK, WEEK, activeGames, getGame, installLiveGames, setCardWeek } from "./slate";
import { applyTeamVariance } from "./teams";
import { deriveVariance } from "./variance";
import { applyTeamForm } from "./teams";
import { setDeskLive } from "./desk-meta";
import { applyQuotes, isLiveBook } from "./books";
import { fetchLiveBoard } from "./live-books";
import { DATA_MODE, loadRun, makeRunId, saveRun, SHEET_ID, sheetWeek, type DataMode } from "./run-store";
import { appendJournal, loadJournal, loadSnaps, pushSnap, snapshotFrom, type JournalEvent, type RunPhase, type SlateSnapshot } from "./audit";
import { currentFrom, loadCurrent, saveCurrent } from "./current-run";
import { appendAudit, applyCardLock, lockAudit } from "./integrity";
import { capGameExposure } from "./sizing";
import { collectPlays, ledgerFromPlay, paperFromPlay } from "./ticket";
import type { CardPlay } from "./ticket";
import { MODEL_VERSION } from "./desk-meta";
import { liveTrueCard, unofficialWinners } from "./card";
import { applyNamedPicks } from "./pick-lock";
import { loadLockedWinners, saveLockedWinners } from "./winners";
import type { AgentStatus, BookQuote, GameSimResult, LedgerTicket, PaperTicket, ParlayTicket, PropSim, WinnerPick } from "./types";

const BOOK_KEY = "syndicate.book.v1";
const OUTS_KEY = "syndicate.outs.v1";

interface DeskState {
  hydrated: boolean;
  /** The week the desk is actually pricing. Kept in the store rather than read
   *  from the slate module because that is a mutable, not reactive state - a header
   *  reading it directly painted the seeded week until something else re-rendered. */
  liveWeek: number;
  running: boolean;
  sims: number;
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
  weatherOk: boolean;
  injuryOk: boolean;
  box: BoxBoard | null;
  boxLoading: boolean;
  loadBox: (force?: boolean) => Promise<void>;
  runPhase: RunPhase;
  journal: JournalEvent[];
  snaps: SlateSnapshot[];
  hydrate: () => void;
  setSims: (n: number) => void;
  setBankroll: (n: number) => void;
  run: (opts?: { sims?: number }) => void | Promise<void>;
  paperGame: (gameId: string) => boolean;
  paperParlay: (id: string) => boolean;
  paperProp: (id: string) => boolean;
  paperAllPlus: () => number;
  voidTicket: (id: string) => void;
  clearBook: () => void;
  lockWeek: () => number;
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

function runSlate(seed: number, sims: number) {
  const games = activeGames();
  const slate = games.map((g) => simulateGame(g, sims, seed));
  const results: Record<string, GameSimResult> = {};
  for (const r of slate) results[r.gameId] = r;
  const order = [...slate].sort((a, b) => b.rankScore - a.rankScore).map((r) => r.gameId);
  const parlays = buildParlays(slate, games);
  const ids = new Set(games.map((g) => g.id));
  const props = PROPS.filter((p) => ids.has(p.gameId)).map((p) => simulateProp(p, Math.min(5000, sims), seed));
  const agents = deriveAgents(slate);
  return { results, order, parlays, props, agents, games };
}

export const useDesk = create<DeskState>()((set, get) => ({
  hydrated: false,
  liveWeek: SEEDED_WEEK,
  running: false,
  sims: DEFAULT_SIMS,
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
  weatherOk: false,
  injuryOk: false,
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
    const pricedAt = saved?.at ?? current?.pricedAt ?? null;
      /**
       * Restore the live week before anything reads it.
       *
       * WEEK is a module-level mutable, so it resets to the seeded 3 on every
       * page load. The desk therefore reloaded showing the seeded week-3 label
       * while carrying week-4 results - the run id said 
un_2026w04_... and
       * the header said WEEK 03.
       *
       * Order matters. The persisted week is set first, and the quote-only
       * fallback below deliberately does NOT pass 
eplace: true: it overlays
       * quotes onto the SEEDED week-3 games, and 
eplace would make
       * installLiveGames call setCardWeek(3) and undo this line.
       */
      if (saved?.week) {
        setCardWeek(saved.week);
        set({ liveWeek: saved.week });
      }
      if (saved?.games?.length) installLiveGames(saved.games, { replace: true });
      else if (saved?.quotes?.length) installLiveGames(applyQuotes(GAMES, saved.quotes));
    if (saved?.dataMode === "live-books" && (saved.games?.length ?? 0) >= MIN_LIVE_GAMES) {
      setDeskLive(true, `Posted board · ${(saved.oddsBooks ?? []).join(", ")} · ${saved.oddsFetchedAt ?? ""}`);
    }
    const sw = sheetWeek(saved?.sheetId);
    const lockedLive = saved?.phase === "locked" && sw != null && locked.some((t) => t.week === sw);
    const books = saved?.oddsBooks ?? [];
    const fresh = saved?.oddsFetchedAt ? Date.now() - Date.parse(saved.oddsFetchedAt) < 20 * 60 * 1000 : false;
    const liveSheet = Boolean(sw && saved?.dataMode === "live-books" && books.length >= 2 && fresh && saved.games?.length);
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
      runPhase: lockedLive ? "locked" : saved?.phase === "locked" ? "priced" : saved?.phase ?? current?.status ?? "idle",
      lastRunAt: pricedAt,
      lastRunMs: saved?.ms ?? null,
      runId: saved?.runId ?? current?.runId ?? null,
      sheetId: saved?.sheetId ?? current?.sheetId ?? SHEET_ID,
      dataMode: saved?.dataMode ?? current?.mode ?? DATA_MODE,
      oddsBooks: books,
      oddsFetchedAt: saved?.oddsFetchedAt ?? null,
      oddsErrors: saved?.oddsErrors ?? [],
      weatherOk: saved?.weatherOk ?? false,
      injuryOk: saved?.injuryOk ?? false,
      ...(saved
        ? {
            results: saved.results ?? {},
            order: saved.order ?? [],
            props: saved.props ?? [],
            parlays: saved.parlays ?? [],
            agents: saved.results ? deriveAgents(Object.values(saved.results)) : [],
            seed: saved.seed,
            sims: saved.sims,
            bankroll: saved.bankroll ?? get().bankroll,
          }
        : current
          ? { bankroll: current.bankroll }
          : {}),
    });
    if (!lockedLive && !liveSheet && typeof window !== "undefined") get().run();
  },
  setSims: (n) => set({ sims: n }),
  setBankroll: (n) => set({ bankroll: Math.max(100, n) }),
  run: async (opts) => {
    if (typeof window === "undefined") return;
    if (get().running) return;
    const sims = opts?.sims ?? get().sims;
    const wasLocked = get().runPhase === "locked";
    const lockedSheet = sheetWeek(get().sheetId);
    set({ running: true, sims, runPhase: "simulating" });
    let books: string[] = get().oddsBooks;
    let fetchedAt = get().oddsFetchedAt;
    let errors = get().oddsErrors;
    let quotes: BookQuote[] = [];
    let liveGames: typeof GAMES = [];
    let boardGameCount = 0;
    let boardEventCount = 0;
    let weatherOk = get().weatherOk;
    let injuryOk = get().injuryOk;
    let week = WEEK;
    try {
      const board = await fetchLiveBoard();
      boardGameCount = board.games.length;
      boardEventCount = board.events;
      books = board.books;
      fetchedAt = board.fetchedAt;
      errors = board.errors;
      quotes = board.quotes;
      weatherOk = board.weatherOk;
      injuryOk = board.injuryOk;
      week = board.week || WEEK;
      if (board.teamForm.length) applyTeamForm(board.teamForm);
      // Variance is the primary driver of each game's margin width, so it gets
      // a data-driven value the moment there is margin history. Teams with too
      // few games keep the neutral multiplier rather than a bad estimate.
      if (board.teamMargins.size) applyTeamVariance(deriveVariance(board.teamMargins));
      /**
       * Install whatever live slate we actually got.
       *
       * The old gate was `board.games.length >= 8`, and it was the wrong
       * question. ESPN does not carry a spread and total for every event — it
       * only ships a line once its odds feed has one, so a slate is routinely
       * partial. Measured today: 16 events listed, 6 with odds, repeatably.
       *
       * So the desk was discarding a real week-4 slate and quietly overlaying
       * week-4 quotes onto the SEEDED week-3 games, then reporting
       * "sandbox-generated" while the header claimed the live week. Betting a
       * fictional lineup is strictly worse than showing a short real one.
       *
       * The threshold is now a quorum (4) rather than a completeness guess,
       * and a short slate is labelled as short instead of hidden.
       */
      const liveEnough = board.games.length >= MIN_LIVE_GAMES;
      if (liveEnough) {
        installLiveGames(board.games, { replace: true });
        liveGames = board.games;
      } else if (board.quotes.length) {
        installLiveGames(applyQuotes(GAMES, board.quotes));
      } else {
        installLiveGames([]);
      }
      const live = books.length >= 1 && liveEnough;
      const coverage = board.events ? `${board.games.length}/${board.events} priced` : `${board.games.length} priced`;
      setDeskLive(
        live,
        live
          ? `Posted board · ${books.join(", ")} · ${coverage} · ${board.fetchedAt}`
          : "Seeded sheet — books did not return a slate",
      );
    } catch (err) {
      books = [];
      fetchedAt = new Date().toISOString();
      errors = [`board: ${err instanceof Error ? err.message : "fetch failed"}`];
      quotes = [];
      liveGames = [];
      installLiveGames([]);
      setDeskLive(false, "Seeded sheet — books did not return a slate");
    }
    const lockedWeek = wasLocked && lockedSheet === week && get().locked.some((t) => t.week === week);
    if (lockedWeek) {
      set({ running: false, runPhase: "locked" });
      return;
    }
    const seed = (get().seed + 97) >>> 0;
    const t0 = performance.now();
    const out = runSlate(seed, sims);
    const games = out.games;
    const live = liveTrueCard(Object.values(out.results), out.parlays, out.props, games);
    const at = Date.now();
    const runId = makeRunId(at, week);
    const sheetId = liveGames.length >= MIN_LIVE_GAMES ? `live-week-${week}` : SHEET_ID;
    const dataMode: DataMode = liveGames.length >= MIN_LIVE_GAMES && books.length > 0 ? "live-books" : DATA_MODE;
      setCardWeek(week);
      set({ liveWeek: week });
    const rawPlays = dataMode === "live-books"
      ? collectPlays(Object.values(out.results), out.parlays, out.props, games, runId, at, false)
      : [];
    const { plays } = capGameExposure(rawPlays);
    const fresh = plays.map((p) => paperFromPlay(p, get().bankroll));
    const tickets = [...fresh, ...get().tickets.filter((t) => t.voidedAt)];
    saveTickets(tickets);
    const kickById = new Map(games.map((g) => [g.id, g.kickoff]));
    const freshPreds = unofficialWinners(Object.values(out.results), games, WEEK).map((p) => ({
      ...p,
      kickoff: p.kickoff ?? kickById.get(p.gameId ?? "") ?? "",
    }));
    const priorByGame = new Map<string, WinnerPick & { kickoff: string }>();
    for (const p of get().predictions) {
      if (p.week !== WEEK) continue;
      const key = p.gameId ?? p.id;
      priorByGame.set(key, {
        ...p,
        kickoff: (p as WinnerPick & { kickoff?: string }).kickoff ?? kickById.get(p.gameId ?? "") ?? "",
      });
    }
    for (const p of get().lockedWinners) {
      if (p.week !== WEEK) continue;
      const key = p.gameId ?? p.id;
      priorByGame.set(key, {
        ...p,
        kickoff: (p as WinnerPick & { kickoff?: string }).kickoff ?? kickById.get(p.gameId ?? "") ?? "",
      });
    }
    const predictions = applyNamedPicks([...priorByGame.values()], freshPreds) as unknown as WinnerPick[];
    const snap = snapshotFrom(Object.values(out.results), new Set(live.takes.map((t) => t.gameId)), seed, sims);
    const snaps = pushSnap(get().snaps, snap);
    const reason = plays.length === 0 ? "NO_QUALIFYING_EDGES" : "ok";
    const journal = appendJournal(get().journal, {
      type: "priced",
        note: `${runId} · RUN_PRICED · ${reason} · card ${plays.length} · books ${books.join("+") || "none"} · su ${predictions.length} · slate ${boardGameCount}g of ${boardEventCount}e · ${quotes.length}q · w${week}`,
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
      sheetId,
      week,
      at,
      ms: Math.round(performance.now() - t0),
      phase: "priced",
      seed,
      sims,
      bankroll: get().bankroll,
      modelVersion: MODEL_VERSION,
      dataMode,
      oddsBooks: books,
      oddsFetchedAt: fetchedAt,
      oddsErrors: errors,
      quotes,
      games: liveGames,
      weatherOk,
      injuryOk,
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
      sheetId,
      dataMode,
      oddsBooks: books,
      oddsFetchedAt: fetchedAt,
      oddsErrors: errors,
      weatherOk,
      injuryOk,
      runPhase: "priced",
      snaps,
      journal,
      tickets,
      plays,
      predictions,
    });
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
  lockWeek: () => {
    if (get().runPhase === "locked" || get().plays.some((p) => p.audit?.cardLockTimestamp)) {
      const plays = get().plays.map((p) =>
        p.audit
          ? { ...p, audit: appendAudit(p.audit, { type: "refused", note: "Relock refused. Append-only. Original retained.", actor: "operator:desk" }) }
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
      return { ...p, status: "locked" as const, audit: lockAudit(p.audit, at) };
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
      note: `Week ${WEEK} card locked · ${card.length} tickets · ${new Date(at).toISOString()} · operator:desk · before sheet kickoff`,
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
      const r = simulateGame(game, get().sims, get().seed);
      const results = { ...get().results, [game.id]: r };
      const slate = Object.values(results);
      const order = [...slate].sort((a, b) => b.rankScore - a.rankScore).map((x) => x.gameId);
      const parlays = buildParlays(slate, activeGames());
      const props = PROPS.map((p) => simulateProp(p, Math.min(5000, get().sims), get().seed));
      const agents = deriveAgents(slate);
      set({ results, order, parlays, props, agents });
    }, 20);
  },
}));
