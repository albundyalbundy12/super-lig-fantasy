import type { ReactNode } from "react";
import { getLeagueTable } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

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
          <div className="page-title">Lig Tablosu</div>
          <div className="page-subtitle">Özel ligindeki menajer sıralaması.</div>
        </div>
        <div className="section">
          <div className="card" style={{ padding: "20px", color: "var(--t2)", fontSize: 13 }}>
            Henüz lige menajer eklenmedi. Veri Senkronizasyonu sayfasından test
            menajeri oluşturabilirsin.
          </div>
        </div>
      </>
    );
  }

  const leader = rows[0];
  const topScore = Math.max(...rows.map((r) => r.pointsTotal));

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">Lig Tablosu</div>
        <div className="page-subtitle">
          {rows.length} menajer · Toplam puana göre sıralı
        </div>
      </div>

      {/* Summary strip */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="stat-grid cols-3">
          <div className="stat-cell">
            <div className="stat-num">{rows.length}</div>
            <div className="stat-label">Menajer</div>
          </div>
          <div className="stat-cell">
            <div
              className="stat-num"
              style={{
                fontSize: 15,
                color: "var(--t1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {leader.teamName}
            </div>
            <div className="stat-label">Lider</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{topScore}</div>
            <div className="stat-label">En Yüksek Puan</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Sıralama</div>
          <div className="section-sub">{rows.length} menajer</div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 16, width: 44, textAlign: "center" }}>#</th>
                <th>Takım</th>
                <th className="r">Bu Hafta</th>
                <th className="r" style={{ paddingRight: 16 }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const rank = index + 1;

                let rankEl: ReactNode;
                if (rank === 1) {
                  rankEl = (
                    <span className="badge badge-rank1" style={{ padding: "2px 8px", borderRadius: 6 }}>
                      1
                    </span>
                  );
                } else if (rank === 2) {
                  rankEl = (
                    <span className="badge badge-rank2" style={{ padding: "2px 8px", borderRadius: 6 }}>
                      2
                    </span>
                  );
                } else if (rank === 3) {
                  rankEl = (
                    <span className="badge badge-rank3" style={{ padding: "2px 8px", borderRadius: 6 }}>
                      3
                    </span>
                  );
                } else {
                  rankEl = (
                    <span className="rank-cell">{rank}</span>
                  );
                }

                return (
                  <tr key={row.teamId}>
                    {/* Rank */}
                    <td style={{ paddingLeft: 16, textAlign: "center" }}>
                      {rankEl}
                    </td>

                    {/* Team + manager */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar sm">{initials(row.teamName)}</div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--t1)",
                              lineHeight: 1.3,
                            }}
                          >
                            {row.teamName}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 1 }}>
                            {row.managerName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Weekly points badge */}
                    <td className="r">
                      <span
                        className={`badge ${
                          row.roundPoints > 0
                            ? "badge-lime"
                            : row.roundPoints < 0
                            ? "badge-red"
                            : "badge-muted"
                        }`}
                      >
                        {formatPoints(row.roundPoints)}
                      </span>
                    </td>

                    {/* Total points in gold display font */}
                    <td className="r" style={{ paddingRight: 16 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 18,
                          fontWeight: 800,
                          color: row.pointsTotal > 0 ? "var(--gold)" : "var(--t3)",
                        }}
                      >
                        {row.pointsTotal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rank legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { cls: "badge-rank1", label: "Birinci" },
            { cls: "badge-rank2", label: "İkinci" },
            { cls: "badge-rank3", label: "Üçüncü" },
          ].map(({ cls, label }, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--t3)" }}
            >
              <span className={`badge ${cls}`} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4 }}>
                {i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
