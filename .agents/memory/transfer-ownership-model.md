---
name: Transfer / squad ownership model
description: How player ownership works across fantasy leagues, and how transfer buy/sell stays safe
---

# Player ownership across leagues

A real player (one `players` row) can be owned by **one manager per fantasy
league**, but the **same player can be owned simultaneously in different
leagues**. So "is this player owned?" is only meaningful *scoped to a league*.

**How to apply:** any ownership / "unowned players" query MUST filter active
`manager_squad_players` joined to teams in the *target league*
(`managerTeam.fantasyLeagueId`). Counting active rows by `playerId` alone spans
all leagues and will look like a duplicate when it is just cross-league
ownership (this is allowed per docs/DATABASE_SCHEMA.md).

# Buy/sell safety

The "selected/test manager" used by the user pages is the first `ManagerTeam`
(lowest id). Buy/sell money + ownership changes run inside one Prisma
`$transaction` that first takes a per-league Postgres advisory lock
(`pg_advisory_xact_lock(ns, fantasyLeagueId)`), which serializes concurrent
transfers in a league so the read-then-write ownership/budget logic can't race.
Selling **hard-deletes** the squad row (no soft `status='sold'`), so every
existing squad/table reader stays correct with no status filter, and the player
becomes available again immediately.

**Why:** `manager_squad_players` has no DB unique key; without the lock,
concurrent buys could double-charge or create duplicate ownership.
