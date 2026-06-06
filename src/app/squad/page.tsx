import { getManagerSquad } from "@/lib/fantasy/queries";
import { formatPoints, formatTL, positionIdLabel } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

function posClass(positionId: number | null) {
  switch (positionId) {
    case 24: return "pos pos-gk";
    case 25: return "pos pos-def";
    case 26: return "pos pos-mid";
    case 27: return "pos pos-fwd";
    default: return "pos pos-mid";
  }
}

function posOrder(id: number | null) {
  return id === 24 ? 0 : id === 25 ? 1 : id === 26 ? 2 : id === 27 ? 3 : 4;
}

function initials(name: string | null) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default async function SquadPage() {
  const data = await getManagerSquad();

  if (!data || data.squad.length === 0) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Kadrom</div>
          <div className="page-subtitle">Mevki bazında kadro oyuncuların.</div>
        </div>
        <div className="section">
          <div
            className="card"
            style={{ padding: "20px", color: "var(--t2)", fontSize: 13 }}
          >
            Henüz kadroya oyuncu eklenmedi.
          </div>
        </div>
      </>
    );
  }

  const { team, squad, pointsByPlayerId } = data;

  const sorted = [...squad].sort(
    (a, b) => posOrder(a.player.positionId) - posOrder(b.player.positionId),
  );

  const totalValue = squad.reduce((s, sp) => s + sp.player.currentMarketValue, 0);

  // Group by position label for section headers
  const groups: Record<string, typeof sorted> = {
    Kaleci: [],
    Defans: [],
    "Orta Saha": [],
    Forvet: [],
  };

  for (const sp of sorted) {
    const label = positionIdLabel(sp.player.positionId);
    if (label in groups) {
      groups[label].push(sp);
    } else {
      groups["Orta Saha"].push(sp);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">Kadrom</div>
        <div className="page-subtitle">{team.name} · {squad.length} oyuncu</div>
      </div>

      {/* Budget + value strip */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="stat-grid cols-3">
          <div className="stat-cell">
            <div className="stat-num medium">{formatTL(team.budget)}</div>
            <div className="stat-label">Bütçe</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num medium">{formatTL(totalValue)}</div>
            <div className="stat-label">Kadro Değeri</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{squad.length}</div>
            <div className="stat-label">Oyuncu</div>
          </div>
        </div>
      </div>

      {/* Position groups */}
      {Object.entries(groups).map(([groupLabel, players]) => {
        if (players.length === 0) return null;
        return (
          <div className="section" key={groupLabel} style={{ paddingBottom: 0 }}>
            <div className="section-header">
              <div className="section-title">
                {groupLabel} ({players.length})
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 16, width: 32 }}>#</th>
                    <th>Oyuncu</th>
                    <th>Mevki</th>
                    <th className="r">Piyasa Değeri</th>
                    <th className="r" style={{ paddingRight: 16 }}>Son Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((sp, i) => {
                    const pts = pointsByPlayerId.get(sp.playerId) ?? 0;
                    const name = sp.player.name ?? `#${sp.playerId}`;
                    return (
                      <tr key={sp.id}>
                        <td
                          style={{
                            paddingLeft: 16,
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "var(--t3)",
                          }}
                        >
                          {i + 1}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="avatar sm">{initials(name)}</div>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: "var(--t1)",
                              }}
                            >
                              {name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={posClass(sp.player.positionId)}>
                            {positionIdLabel(sp.player.positionId)}
                          </span>
                        </td>
                        <td className="r dim" style={{ fontSize: 12 }}>
                          {formatTL(sp.player.currentMarketValue)}
                        </td>
                        <td className="r" style={{ paddingRight: 16 }}>
                          <span
                            className={`badge ${
                              pts > 0
                                ? "badge-lime"
                                : pts < 0
                                ? "badge-red"
                                : "badge-muted"
                            }`}
                          >
                            {formatPoints(pts)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div style={{ height: 20 }} />
    </>
  );
}
