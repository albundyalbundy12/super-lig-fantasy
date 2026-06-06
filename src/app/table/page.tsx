import { getLeagueTable } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "badge badge-rank1";
  if (rank === 2) return "badge badge-rank2";
  if (rank === 3) return "badge badge-rank3";
  return "table-rank";
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function TablePage() {
  const rows = await getLeagueTable();

  if (rows.length === 0) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Lig Tablosu</h1>
          <p className="page-subtitle">Özel ligindeki menajer sıralaması.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
            Henüz lige menajer eklenmedi. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Lig Tablosu</h1>
        <p className="page-subtitle">
          {rows.length} menajer · Toplam puana göre sıralı
        </p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20, width: 48 }}>Sıra</th>
              <th>Takım</th>
              <th className="right">Son Hafta</th>
              <th className="right">Toplam Puan</th>
              <th className="right" style={{ display: "none" }}>
                Kadro Değeri
              </th>
              <th className="right" style={{ paddingRight: 20 }}>Bütçe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rank = index + 1;
              return (
                <tr key={row.teamId}>
                  <td style={{ paddingLeft: 20 }}>
                    {rank <= 3 ? (
                      <span className={rankBadgeClass(rank)}>{rank}</span>
                    ) : (
                      <span className="table-rank">{rank}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="player-row-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                        {initials(row.teamName)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                          {row.teamName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {row.managerName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="right">
                    <span
                      className={`badge ${row.roundPoints > 0 ? "badge-lime" : "badge-muted"}`}
                    >
                      {formatPoints(row.roundPoints)}
                    </span>
                  </td>
                  <td className="right">
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--accent-gold)" }}>
                      {row.pointsTotal}
                    </span>
                  </td>
                  <td
                    className="right"
                    style={{ paddingRight: 20, color: "var(--text-secondary)", fontSize: 12 }}
                  >
                    {formatTL(row.budget)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          <span className="badge badge-rank1" style={{ fontSize: 10, padding: "1px 6px" }}>1</span>
          <span>Birinci</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          <span className="badge badge-rank2" style={{ fontSize: 10, padding: "1px 6px" }}>2</span>
          <span>İkinci</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
          <span className="badge badge-rank3" style={{ fontSize: 10, padding: "1px 6px" }}>3</span>
          <span>Üçüncü</span>
        </div>
      </div>
    </>
  );
}
