import { isSportmonksConfigured } from "@/lib/sportmonks";
import { getDbStatus } from "@/lib/db";
import { TEST_FIXTURE_ID } from "@/config/constants";

export default function AdminSyncPage() {
  // Runs on the server. We only surface a boolean — never the token itself.
  const sportmonksReady = isSportmonksConfigured();
  const db = getDbStatus();

  return (
    <>
      <h1>Admin · Sync</h1>
      <p className="subtitle">
        Control panel for Sportmonks sync and scoring (controls added in later
        tasks).
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
          Configured: <strong>{db.configured ? "yes" : "no"}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{db.note}</p>
      </div>

      <div className="card">
        <span className="tag">Test fixture</span>
        <p>
          Galatasaray vs Beşiktaş — fixture ID{" "}
          <strong>{TEST_FIXTURE_ID}</strong>. Sync and scoring buttons are
          added in Task 4 and later.
        </p>
      </div>
    </>
  );
}
