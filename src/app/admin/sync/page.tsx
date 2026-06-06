import { isSportmonksConfigured } from "@/lib/sportmonks";
import { getDbStatus, prisma } from "@/lib/db";
import { TEST_FIXTURE_ID } from "@/config/constants";

import { EMPTY_SLOT_POINTS } from "@/lib/scoring/rules";

import {
  calculatePlayerScoresAction,
  createTestManagerScoreAction,
  syncTestFixtureAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  // Runs on the server. We only surface a boolean — never the token itself.
  const sportmonksReady = isSportmonksConfigured();
  const db = getDbStatus();

  const recentLogs = db.configured
    ? await prisma.apiSyncLog.findMany({
        where: { syncType: "fixture" },
        orderBy: { id: "desc" },
        take: 5,
      })
    : [];

  const recentScoringRuns = db.configured
    ? await prisma.scoringRun.findMany({
        orderBy: { id: "desc" },
        take: 5,
      })
    : [];

  // Latest test-manager round score (Task 6), with its lineup slots so we can
  // show the per-slot breakdown (empty slots, bank players) on the page.
  const latestManagerScore = db.configured
    ? await prisma.managerRoundScore.findFirst({
        orderBy: { id: "desc" },
        include: {
          managerTeam: {
            include: { squadPlayers: { include: { player: true } } },
          },
        },
      })
    : null;

  // Fetch the lineup for exactly this round (not merely the latest lineup), so
  // the breakdown always matches the round score shown above.
  const latestLineup = latestManagerScore
    ? await prisma.managerLineup.findUnique({
        where: {
          managerTeamId_roundId: {
            managerTeamId: latestManagerScore.managerTeamId,
            roundId: latestManagerScore.roundId,
          },
        },
        include: {
          slots: { orderBy: { slotIndex: "asc" }, include: { player: true } },
        },
      })
    : null;

  // Map internal player id -> this round's match points, for slot/bank display.
  // Fixtures store the raw Sportmonks round id, so resolve it from the round.
  const matchPointsByPlayerId = new Map<number, number>();
  if (latestManagerScore) {
    const round = await prisma.round.findUnique({
      where: { id: latestManagerScore.roundId },
      select: { sportmonksRoundId: true },
    });
    const fixturesInRound = round
      ? await prisma.fixture.findMany({
          where: { roundId: round.sportmonksRoundId },
          select: { id: true },
        })
      : [];
    const scores = await prisma.playerMatchScore.findMany({
      where: { fixtureId: { in: fixturesInRound.map((f) => f.id) } },
      select: { playerId: true, pointsTotal: true },
    });
    for (const s of scores) {
      matchPointsByPlayerId.set(
        s.playerId,
        (matchPointsByPlayerId.get(s.playerId) ?? 0) + s.pointsTotal,
      );
    }
  }

  const lineupPlayerIds = new Set(
    (latestLineup?.slots ?? [])
      .map((s) => s.playerId)
      .filter((id): id is number => id !== null),
  );
  const bankPlayers = (latestManagerScore?.managerTeam.squadPlayers ?? []).filter(
    (sp) => !lineupPlayerIds.has(sp.playerId),
  );

  return (
    <>
      <h1>Admin · Sync</h1>
      <p className="subtitle">
        Control panel for Sportmonks sync and scoring (scoring controls added in
        later tasks).
      </p>

      <div className="card">
        <span className="tag">Sportmonks API</span>
        <p>
          Token configured:{" "}
          <strong>{sportmonksReady ? "yes" : "no"}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Set <code>SPORTMONKS_API_TOKEN</code> in Replit Secrets. The token is
          read server-side only and is never sent to the browser.
        </p>
      </div>

      <div className="card">
        <span className="tag">Database</span>
        <p>
          Connected: <strong>{db.configured ? "yes" : "no"}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{db.note}</p>
      </div>

      <div className="card">
        <span className="tag">Test fixture</span>
        <p>
          Galatasaray vs Beşiktaş — fixture ID{" "}
          <strong>{TEST_FIXTURE_ID}</strong>.
        </p>
        <form action={syncTestFixtureAction}>
          <button
            type="submit"
            disabled={!sportmonksReady || !db.configured}
            style={{
              marginTop: 8,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              cursor:
                !sportmonksReady || !db.configured ? "not-allowed" : "pointer",
            }}
          >
            Sync test fixture
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Fetches participants, events, lineups and lineup details, then upserts
          them into the database. Running it again creates no duplicates.
        </p>
      </div>

      <div className="card">
        <span className="tag">Player scoring</span>
        <p>
          Calculate player match scores for fixture{" "}
          <strong>{TEST_FIXTURE_ID}</strong> from the synced raw data.
        </p>
        <form action={calculatePlayerScoresAction}>
          <button
            type="submit"
            disabled={!db.configured}
            style={{
              marginTop: 8,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              cursor: !db.configured ? "not-allowed" : "pointer",
            }}
          >
            Calculate player scores
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Reads events, lineups and lineup details, then upserts{" "}
          <code>player_match_scores</code>. No Sportmonks calls. Running it again
          creates no duplicates.
        </p>
      </div>

      <div className="card">
        <span className="tag">Test manager score</span>
        <p>
          Build a simulated test manager (user, league, team, squad, lineup)
          from real fixture players and score its round from{" "}
          <code>player_match_scores</code>.
        </p>
        <form action={createTestManagerScoreAction}>
          <button
            type="submit"
            disabled={!db.configured}
            style={{
              marginTop: 8,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid var(--border, #333)",
              cursor: !db.configured ? "not-allowed" : "pointer",
            }}
          >
            Create test manager score
          </button>
        </form>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
          Empty lineup slots score {EMPTY_SLOT_POINTS}; squad players not in the
          lineup (the bench) score 0. No Sportmonks calls. Running it again
          creates no duplicate round scores or lineup slots.
        </p>
      </div>

      <div className="card">
        <span className="tag">Latest manager score</span>
        {!latestManagerScore ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            No manager score yet. Click “Create test manager score”.
          </p>
        ) : (
          <>
            <p>
              <strong>{latestManagerScore.managerTeam.name}</strong> — round
              total <strong>{latestManagerScore.pointsTotal}</strong> pts (
              lineup {latestManagerScore.pointsLineup}, empty slots{" "}
              {latestManagerScore.pointsEmptySlots}).
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                marginTop: 8,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: "4px 8px" }}>#</th>
                  <th style={{ padding: "4px 8px" }}>Pos</th>
                  <th style={{ padding: "4px 8px" }}>Player</th>
                  <th style={{ padding: "4px 8px" }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {(latestLineup?.slots ?? []).map((slot) => {
                  const points = slot.isEmpty
                    ? EMPTY_SLOT_POINTS
                    : matchPointsByPlayerId.get(slot.playerId ?? -1) ?? 0;
                  return (
                    <tr
                      key={slot.id}
                      style={{ borderTop: "1px solid var(--border, #333)" }}
                    >
                      <td style={{ padding: "4px 8px" }}>{slot.slotIndex}</td>
                      <td style={{ padding: "4px 8px" }}>{slot.slotPosition}</td>
                      <td style={{ padding: "4px 8px" }}>
                        {slot.isEmpty ? (
                          <em style={{ color: "var(--muted)" }}>empty slot</em>
                        ) : (
                          slot.player?.name ?? `Player ${slot.playerId}`
                        )}
                      </td>
                      <td style={{ padding: "4px 8px" }}>{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bankPlayers.length > 0 && (
              <>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  Bank (in squad, not in lineup) — counts as 0:
                </p>
                <table
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
                >
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                      <th style={{ padding: "4px 8px" }}>Player</th>
                      <th style={{ padding: "4px 8px" }}>Match pts</th>
                      <th style={{ padding: "4px 8px" }}>Counted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankPlayers.map((sp) => (
                      <tr
                        key={sp.id}
                        style={{ borderTop: "1px solid var(--border, #333)" }}
                      >
                        <td style={{ padding: "4px 8px" }}>
                          {sp.player?.name ?? `Player ${sp.playerId}`}
                        </td>
                        <td style={{ padding: "4px 8px" }}>
                          {matchPointsByPlayerId.get(sp.playerId) ?? 0}
                        </td>
                        <td style={{ padding: "4px 8px" }}>0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>

      <div className="card">
        <span className="tag">Recent fixture syncs</span>
        {recentLogs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            No syncs recorded yet.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "4px 8px" }}>#</th>
                <th style={{ padding: "4px 8px" }}>Status</th>
                <th style={{ padding: "4px 8px" }}>Fetched</th>
                <th style={{ padding: "4px 8px" }}>Created</th>
                <th style={{ padding: "4px 8px" }}>Updated</th>
                <th style={{ padding: "4px 8px" }}>Finished</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} style={{ borderTop: "1px solid var(--border, #333)" }}>
                  <td style={{ padding: "4px 8px" }}>{log.id}</td>
                  <td style={{ padding: "4px 8px" }}>{log.status}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsFetched}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsCreated}</td>
                  <td style={{ padding: "4px 8px" }}>{log.itemsUpdated}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {log.finishedAt
                      ? log.finishedAt.toISOString().replace("T", " ").slice(0, 19)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <span className="tag">Recent scoring runs</span>
        {recentScoringRuns.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            No scoring runs recorded yet.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "4px 8px" }}>#</th>
                <th style={{ padding: "4px 8px" }}>Status</th>
                <th style={{ padding: "4px 8px" }}>Players</th>
                <th style={{ padding: "4px 8px" }}>Finished</th>
                <th style={{ padding: "4px 8px" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {recentScoringRuns.map((scoringRun) => (
                <tr
                  key={scoringRun.id}
                  style={{ borderTop: "1px solid var(--border, #333)" }}
                >
                  <td style={{ padding: "4px 8px" }}>{scoringRun.id}</td>
                  <td style={{ padding: "4px 8px" }}>{scoringRun.status}</td>
                  <td style={{ padding: "4px 8px" }}>
                    {scoringRun.playersScored}
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    {scoringRun.finishedAt
                      ? scoringRun.finishedAt
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 19)
                      : "—"}
                  </td>
                  <td style={{ padding: "4px 8px", color: "var(--muted)" }}>
                    {scoringRun.errorMessage ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
