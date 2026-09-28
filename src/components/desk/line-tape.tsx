import { tapeRows, type TapeRow } from "@/lib/nfl/line-tape";
import { boardMorning } from "@/lib/nfl/cycle";
import { WEEK } from "@/lib/nfl/slate";
import { useDesk } from "@/lib/nfl/store";
import type { NflGame } from "@/lib/nfl/types";
import { formatSigned } from "@/lib/utils";

function matchup(id: string) {
  const [away, home] = id.split("-");
  if (!away || !home) return id;
  return `${away.toUpperCase()} @ ${home.toUpperCase()}`;
}

export function LineTape({ game }: { game?: NflGame }) {
  if (game) return <GameTape game={game} />;
  return <BoardTape />;
}

function GameTape({ game }: { game: NflGame }) {
  const prints = useDesk((s) => s.tape) ?? [];
  const rows = tapeRows(prints).filter((r) => r.gameId === game.id);
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Stored prints for this game. The first one is not the book’s open. One print is not a move.
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No print stored for this game yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {rows.map((r) => (
            <li key={r.book} className="font-mono text-xs">
              {r.book} · spread {r.firstSpread === r.lastSpread ? formatSigned(r.lastSpread) : `${formatSigned(r.firstSpread)} → ${formatSigned(r.lastSpread)}`} · total{" "}
              {r.firstTotal === r.lastTotal ? r.lastTotal : `${r.firstTotal} → ${r.lastTotal}`} · {r.prints} · {r.window}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BoardTape() {
  const prints = useDesk((s) => s.tape) ?? [];
  const at = useDesk((s) => s.tapeAt);
  const note = useDesk((s) => s.tapeNote);
  const loading = useDesk((s) => s.tapeLoading);
  const errors = useDesk((s) => s.tapeErrors) ?? [];
  const rows = tapeRows(prints);
  const next = rows.filter((r) => r.week === WEEK + 1);
  const current = rows.filter((r) => r.week === WEEK);
  const other = rows.filter((r) => r.week !== WEEK && r.week !== WEEK + 1);
  const cycle = boardMorning();

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="text-sm font-medium">Line tape</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {cycle.label} The server stores a price when it changes, about once a minute, whether or not this page is the one in front of you. Only the current week is a pick. The first stored print is not the book’s release, and a print does not change a weight.
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {loading ? "Fetching. " : ""}
        {at ? `Last fetch ${at}. ` : "No fetch stored yet. "}
        {prints.length} prints. {note}
      </p>
      {errors.length ? <p className="mt-2 text-xs text-muted-foreground">{errors.slice(0, 3).join(" · ")}</p> : null}
      <TapeTable title={`Week ${WEEK + 1}`} rows={next} empty={`No Week ${WEEK + 1} number stored yet.`} />
      <TapeTable title={`Week ${WEEK}`} rows={current} empty={`No Week ${WEEK} print stored yet.`} />
      {other.length ? <TapeTable title="Week not on the scoreboard" rows={other} empty="" /> : null}
    </section>
  );
}

function TapeTable({ title, rows, empty }: { title: string; rows: TapeRow[]; empty: string }) {
  const shown = rows.slice(0, 16);
  return (
    <div className="mt-4">
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 font-medium">Game</th>
                <th className="px-2 py-2 font-medium">Book</th>
                <th className="px-2 py-2 font-medium">Spread</th>
                <th className="px-2 py-2 font-medium">Total</th>
                <th className="px-2 py-2 font-medium">Prints</th>
                <th className="px-2 py-2 font-medium">Window</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const spreadSame = r.firstSpread === r.lastSpread;
                const totalSame = r.firstTotal === r.lastTotal;
                return (
                  <tr key={`${r.week}-${r.gameId}-${r.book}`} className="border-b border-border last:border-0">
                    <td className="px-2 py-2">{matchup(r.gameId)}</td>
                    <td className="px-2 py-2">{r.book}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">
                      {spreadSame ? formatSigned(r.lastSpread) : `${formatSigned(r.firstSpread)} → ${formatSigned(r.lastSpread)}`}
                    </td>
                    <td className="px-2 py-2 font-mono tabular-nums">{totalSame ? r.lastTotal : `${r.firstTotal} → ${r.lastTotal}`}</td>
                    <td className="px-2 py-2 font-mono tabular-nums">{r.prints}</td>
                    <td className="px-2 py-2 text-muted-foreground">{r.window}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > shown.length ? (
            <p className="mt-2 text-xs text-muted-foreground">{rows.length - shown.length} more stored on this device.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
