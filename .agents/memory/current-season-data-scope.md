---
name: current-season vs historical data separation
description: Why the players table mixes two datasets and how to filter the live current-season pool.
---

# Historical test data vs current Süper Lig season live in the same tables

The DB holds two datasets that must never be mixed:
- Historical test data: Sportmonks season 22057 (Galatasaray vs Beşiktaş test
  fixture). Its players/teams/scores exist only to prove the sync+scoring chain.
- Current season: Sportmonks season 25682 (2025/2026). Rounds + fixtures are
  synced, but teams/squads come later.

**Rule:** any current-season feature (Dengeli squad draft, transfer pool,
scoring) must source players via `getActiveCurrentSeasonPlayers()` in
`src/lib/fantasy/data-scope.ts`, NEVER the raw `players` table.

**Why:** the `players` table has no season/team link of its own — currently it
holds only the 42 historical test players. Reading the whole table pulls test
players into the live game. The helper filters to players who appear in a
current-season fixture lineup (returns `[]` until current-season squads are
synced), which is the separation guarantee.

**How to apply:** separation is keyed on the Sportmonks season id (fixtures
carry raw `season_id`; rounds link to internal season row). No season column on
`players`, so don't filter players directly by season — go through
fixtures→lineups, or via `current_team_id` once current-season `real_teams` +
squads are synced. `real_teams` is currently EMPTY (even the test fixture stores
raw team ids in `fixture_participants`, not `real_teams` rows).
