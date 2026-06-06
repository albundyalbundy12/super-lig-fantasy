---
name: Manager round scoring — non-obvious deps and idempotency rules
description: Durable gotchas when linking a fixture's player scores to a manager round score in this app.
---

# Manager round scoring: non-obvious decisions

**Season/Round are not synced by any task.** Fixtures store only RAW Sportmonks
season/round ids as plain Int columns — there is no FK relation to the internal
`rounds`/`seasons` tables. Anything that needs an internal Round (manager
lineups, manager round scores, scoring runs) must derive Season+Round on demand
(idempotent upsert keyed on the sportmonks id, read from the fixture).
**Why:** otherwise the FK can't be satisfied and you'll be tempted to invent a
round, which breaks the link back to the fixture's scores.

**There is no relation from fixtures to internal rounds.** To get a round's
fixtures you must bridge on the raw id: match the fixture's raw round id against
the round's sportmonks round id. Don't look for a Prisma relation — there isn't
one.

**`manager_squad_players` has no unique key.** Make squad seeding idempotent by
delete-then-recreate per manager team, not upsert. Lineups, slots, round scores,
users, leagues, members, teams all DO have unique keys — upsert those.

**Empty slot = -4, bench = 0.** Empty lineup slots score the empty-slot penalty;
squad players absent from the lineup always count 0 regardless of real points.
The schema has no per-slot points column, so slot-level explanations are
computed for display only — the persisted breakdown is the lineup/empty/total
aggregate on the round score.
