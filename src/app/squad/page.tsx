import { getManagerSquad } from "@/lib/fantasy/queries";
import { formatPoints, formatTL, positionIdLabel } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

function positionClass(positionId: number | null): string {
  switch (positionId) {
    case 24: return "pos-chip pos-gk";
    case 25: return "pos-chip pos-def";
    case 26: return "pos-chip pos-mid";
    case 27: return "pos-chip pos-fwd";
    default: return "pos-chip pos-mid";
  }
}

function positionOrder(positionId: number | null): number {
  switch (positionId) {
    case 24: return 0;
    case 25: return 1;
    case 26: return 2;
    case 27: return 3;
    default: return 4;
  }
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function SquadPage() {
  const data = await getManagerSquad();

  if (!data || data.squad.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Kadrom</h1>
          <p className="page-subtitle">Mevki bazında kadro oyuncuların.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
            Henüz kadroya oyuncu eklenmedi. Veri Senkronizasyonu sayfasından test menajeri oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  const { team, squad, pointsByPlayerId } = data;

  const sorted = [...squad].sort((a, b) =>
    positionOrder(a.player.positionId) - positionOrder(b.player.positionId)
  );

  const totalSquadValue = squad.reduce(
    (sum, sp) => sum + sp.player.currentMarketValue,
    0,
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Kadrom</h1>
        <p className="page-subtitle">{team.name} · {squad.length} oyuncu</p>
      </div>

      {/* Budget + value strip */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Bütçe</div>
          <div className="stat-value" style={{ fontSize: 15, paddingTop: 6 }}>
            {formatTL(team.budget)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kadro Değeri</div>
          <div className="stat-value" style={{ fontSize: 15, paddingTop: 6 }}>
            {formatTL(totalSquadValue)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Oyuncu</div>
          <div className="stat-value">{squad.length}</div>
          <div className="stat-sub">kadro</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Oyuncu</th>
              <th>Mevki</th>
              <th className="right" style={{ paddingRight: 20 }}>Piyasa Değeri</th>
              <th className="right" style={{ paddingRight: 20 }}>Son Puan</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((sp) => {
              const pts = pointsByPlayerId.get(sp.playerId) ?? 0;
              const name = sp.player.name ?? `Oyuncu #${sp.playerId}`;
              return (
                <tr key={sp.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="player-row-avatar">
                        {initials(name)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={positionClass(sp.player.positionId)}>
                      {positionIdLabel(sp.player.positionId)}
                    </span>
                  </td>
                  <td className="right" style={{ paddingRight: 20, color: "var(--text-secondary)", fontSize: 13 }}>
                    {formatTL(sp.player.currentMarketValue)}
                  </td>
                  <td className="right" style={{ paddingRight: 20 }}>
                    <span
                      className={`badge ${pts > 0 ? "badge-lime" : pts < 0 ? "badge-red" : "badge-muted"}`}
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
    </>
  );
}
