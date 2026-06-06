---
name: player_match_scores needs internal Player rows
description: Why the scoring engine derives Player rows from synced lineup data, and the canonical-data drift rule.
---

# player_match_scores.player_id is an internal FK, but no task syncs players

`player_match_scores.player_id` (and `.team_id`) are FKs to the internal
`players` / `real_teams` tables — NOT raw Sportmonks ids. The raw fixture
tables (`fixture_lineups`, `fixture_events`, etc.) store raw Sportmonks ids and
have no such FK. No build task syncs the `players` table before scoring.

**Decision:** the player scoring engine derives minimal `Player` rows from the
already-synced `fixture_lineups` (sportmonks id + name + position) via an
idempotent upsert keyed on `sportmonksPlayerId`, then maps raw sportmonks player
id → internal `players.id` for the score rows. `player_match_scores.team_id` is
left `null` (real_teams unpopulated; team_id is nullable and not in the scoring
store list).

**Why:** scores can't be written without satisfying the FK, and deriving from
synced data avoids a Sportmonks call. Reviewed and accepted as in-scope plumbing.

**How to apply:**
- On the Player upsert, only set fields on `create`; use `update: {}` so reruns
  do NOT overwrite canonical master data (a player's position varies per match;
  overwriting causes drift). The score row uses the per-fixture lineup position
  directly, so it's unaffected.
- Stat maps in the engine are keyed by RAW sportmonks player id (matches raw
  tables); only the final write maps to internal id.
- If a real player-sync task lands later, this derivation can be dropped.
