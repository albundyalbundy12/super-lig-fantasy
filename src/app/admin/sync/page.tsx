import { isSportmonksConfigured } from "@/lib/sportmonks";
import { getDbStatus, prisma } from "@/lib/db";
import { TEST_FIXTURE_ID } from "@/config/constants";

import { syncTestFixtureAction } from "./actions";

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
    </>
  );
}
