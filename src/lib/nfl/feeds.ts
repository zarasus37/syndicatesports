export interface FeedStatus {
  id: string;
  name: string;
  provider: string;
  cadence: string;
  ok: boolean;
  last: string;
}

export function deskFeeds(
  lastRunAt: number | null,
  liveBooks: string[] = [],
  fetchedAt: string | null = null,
  boxAt: string | null = null,
  extra?: { weather?: boolean; injuries?: boolean },
): FeedStatus[] {
  const stamp = fetchedAt ?? (lastRunAt ? "synced this cycle" : "waiting on run");
  const book = (name: string): FeedStatus => ({
    id: name.toLowerCase(),
    name,
    provider: "public board",
    cadence: "on run",
    ok: liveBooks.includes(name),
    last: liveBooks.includes(name) ? stamp : "no quote this run",
  });
  const dark = (id: string, name: string, provider: string): FeedStatus => ({
    id,
    name,
    provider,
    cadence: "not connected",
    ok: false,
    last: "not a live feed",
  });
  return [
    book("Pinnacle"),
    book("FanDuel"),
    book("Bovada"),
    book("DraftKings"),
    {
      id: "box",
      name: "Box score",
      provider: "ESPN scoreboard",
      cadence: "on session",
      ok: Boolean(boxAt),
      last: boxAt ?? "not returned",
    },
    dark("epa", "Weekly EPA", "nfl_data_py"),
    dark("splits", "Tickets / handle", "splits_api"),
    extra?.injuries
      ? { id: "injuries", name: "Injury / outs", provider: "ESPN injuries", cadence: "on run", ok: true, last: stamp }
      : dark("injuries", "Injury / outs", "injury_feed"),
    dark("refs", "Referee crews", "refs_feed"),
    extra?.weather
      ? { id: "weather", name: "Venue / wind", provider: "Open-Meteo", cadence: "on run", ok: true, last: stamp }
      : dark("weather", "Venue / wind", "weather_api"),
    dark("props", "Player props", "not a live book"),
  ];
}
