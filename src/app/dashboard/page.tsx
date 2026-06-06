import Link from "next/link";

import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const detail = await getManagerRoundDetail();

  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Genel Bakış</span>
        <h1>Ana Sayfa</h1>
        <p className="page-sub">
          Menajer takımının özeti ve son hafta performansın.
        </p>
      </div>

      {!detail ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-ico" aria-hidden>
              📊
            </div>
            <p>
              Henüz menajer puanı oluşturulmadı. Veri Senkronizasyonu sayfasından
              test menajer puanını oluşturabilirsin.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <span className="tag">Takım</span>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {detail.roundScore.managerTeam.name}
            </p>
            <p style={{ margin: "2px 0 0", color: "var(--muted)" }}>
              {detail.roundScore.managerTeam.league.name}
            </p>
          </div>

          <div className="grid grid-3">
            <div className="stat-card is-gold">
              <div className="stat-label">Bu Hafta Puanı</div>
              <div className="stat-value">
                {formatPoints(detail.roundScore.pointsTotal)}
              </div>
              <div className="stat-sub">
                Diziliş {formatPoints(detail.roundScore.pointsLineup)} · Boş
                pozisyon {formatPoints(detail.roundScore.pointsEmptySlots)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Bütçe</div>
              <div className="stat-value">
                {formatTL(detail.roundScore.managerTeam.budget)}
              </div>
              <div className="stat-sub">Transfer için kullanılabilir</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Lig</div>
              <div className="stat-value" style={{ fontSize: 20 }}>
                {detail.roundScore.managerTeam.league.name}
              </div>
              <div className="stat-sub">Özel lig</div>
            </div>
          </div>

          <div className="card">
            <span className="tag">Hızlı Erişim</span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 4,
              }}
            >
              <Link href="/lineup" className="btn btn-primary btn-sm">
                Dizilişi Kur
              </Link>
              <Link href="/squad" className="btn btn-sm">
                Kadrom
              </Link>
              <Link href="/points" className="btn btn-sm">
                Puan Dökümü
              </Link>
              <Link href="/table" className="btn btn-sm">
                Lig Tablosu
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
