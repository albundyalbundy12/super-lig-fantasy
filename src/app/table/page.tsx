import { getLeagueTable } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function TablePage() {
  const rows = await getLeagueTable();

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Sıralama</span>
        <h1>Lig Tablosu</h1>
        <p className="page-sub">Özel ligindeki menajer sıralaması.</p>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              🏆
            </div>
            <p>
              Henüz lige menajer eklenmedi. Veri Senkronizasyonu sayfasından
              test menajeri oluşturabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Takım</th>
                <th className="num">Son Hafta</th>
                <th className="num">Toplam Puan</th>
                <th className="num">Kadro Değeri</th>
                <th className="num">Bütçe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.teamId}>
                  <td>
                    <span
                      className={`rank-badge${index === 0 ? " top" : ""}`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{row.teamName}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {row.managerName}
                    </div>
                  </td>
                  <td className="num">
                    <span
                      className={
                        row.roundPoints > 0
                          ? "pts pts-pos"
                          : row.roundPoints < 0
                            ? "pts pts-neg"
                            : "pts pts-zero"
                      }
                    >
                      {formatPoints(row.roundPoints)}
                    </span>
                  </td>
                  <td className="num" style={{ fontWeight: 800 }}>
                    {formatPoints(row.pointsTotal)}
                  </td>
                  <td className="num">{formatTL(row.squadValue)}</td>
                  <td className="num">{formatTL(row.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
