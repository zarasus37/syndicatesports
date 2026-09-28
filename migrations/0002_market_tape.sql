create table if not exists market_prints (
  id serial primary key,
  book text not null,
  game_id text not null,
  week integer,
  kickoff text,
  fetched_at text not null,
  spread text not null,
  spread_price integer not null,
  total text not null,
  total_price integer not null
);
create index if not exists market_prints_lookup_idx on market_prints (book, game_id, id desc);

create table if not exists score_prints (
  id serial primary key,
  week integer not null,
  event_id text not null,
  game_id text not null,
  status text not null,
  away_score integer,
  home_score integer,
  detail text not null default '',
  seen_at text not null
);
create index if not exists score_prints_lookup_idx on score_prints (event_id, id desc);

create table if not exists scrape_runs (
  id serial primary key,
  started_at text not null,
  quotes integer not null,
  inserted integer not null,
  scores integer not null,
  note text not null
);
