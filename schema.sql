-- OpenSeat Database Schema
-- Run this in the Supabase SQL Editor

-- Spots table
create table if not exists spots (
  id       text primary key,
  name     text not null,
  location text not null
);

-- Reservations table
create table if not exists reservations (
  id          uuid primary key default gen_random_uuid(),
  spot_id     text not null references spots(id),
  name        text not null,
  email       text not null,
  started_at  timestamptz not null,
  ends_at     timestamptz not null,
  scanned_at  timestamptz not null,
  active      boolean not null default true
);

-- Index for quick lookups of active reservations per spot
create index if not exists reservations_spot_active_idx
  on reservations (spot_id, active);

-- Seed demo spot
insert into spots (id, name, location)
values ('table-1', 'Study Table 1', 'Oakland Center, 1st Floor')
on conflict (id) do nothing;

-- Enable Row Level Security
alter table spots enable row level security;
alter table reservations enable row level security;

-- Spots: public read
create policy "Spots are publicly readable"
  on spots for select
  using (true);

-- Reservations: public read (needed for status page)
create policy "Reservations are publicly readable"
  on reservations for select
  using (true);

-- Reservations: allow anon inserts (API routes use the publishable key)
create policy "Allow anon inserts"
  on reservations for insert
  with check (true);

-- Reservations: allow anon updates (for ending sessions and auto-expire)
create policy "Allow anon updates"
  on reservations for update
  using (true)
  with check (true);
