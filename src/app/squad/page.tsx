import { getManagerSquad } from "@/lib/fantasy/queries";
import { formatPoints, formatTL, positionIdLabel } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function SquadPage() {
  const data = await getManagerSquad();

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Kadro</span>
        <h1>Kadrom</h1>
        <p className="page-sub">Mevki bazında kadro oyuncuların.</p>
      </div>

      {!data || data.squad.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              👥
            </div>
            <p>
              Henüz kadroya oyuncu eklenmedi. Veri Senkronizasyonu sayfasından
              test menajeri oluşturabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-label">Takım</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {data.team.name}
              </div>
              <div className="stat-sub">{data.squad.length} oyuncu</div>
            </div>
            <div className="stat-card is-gold">
              <div className="stat-label">Bütçe</div>
              <div className="stat-value">{formatTL(data.team.budget)}</div>
              <div className="stat-sub">Kullanılabilir</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Kadro Büyüklüğü</div>
              <div className="stat-value">{data.squad.length}</div>
              <div className="stat-sub">Oyuncu</div>
            </div>
          </div>

          <div className="card">
            <span className="tag">Oyuncular</span>
            <table className="table">
              <thead>
                <tr>
                  <th>Oyuncu</th>
                  <th>Mevki</th>
                  <th className="num">Son Hafta Puanı</th>
                </tr>
              </thead>
              <tbody>
                {data.squad.map((sp) => {
                  const pts = data.pointsByPlayerId.get(sp.playerId) ?? 0;
                  return (
                    <tr key={sp.id}>
                      <td style={{ fontWeight: 600 }}>
                        {sp.player.name ?? `Oyuncu #${sp.playerId}`}
                      </td>
                      <td>{positionIdLabel(sp.player.positionId)}</td>
                      <td className="num">
                        <span
                          className={
                            pts > 0
                              ? "pts pts-pos"
                              : pts < 0
                                ? "pts pts-neg"
                                : "pts pts-zero"
                          }
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
      )}
    </>
  );
}
