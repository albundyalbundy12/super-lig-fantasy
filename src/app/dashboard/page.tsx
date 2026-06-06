import Link from "next/link";

import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const detail = await getManagerRoundDetail();

  return (
    <>
      <h1>Ana Sayfa</h1>
      <p className="subtitle">
        Menajer takımının özeti ve son hafta puanların.
      </p>

      {!detail ? (
        <div className="card">
          <span className="tag">Veri yok</span>
          <p>
            Henüz menajer puanı oluşturulmadı. Veri Senkronizasyonu sayfasından
            test menajer puanını oluşturabilirsin.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <span className="tag">Takım</span>
            <p>
              <strong>{detail.roundScore.managerTeam.name}</strong> —{" "}
              {detail.roundScore.managerTeam.league.name}
            </p>
          </div>

          <div className="card">
            <span className="tag">Bu hafta puanı</span>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "4px 0" }}>
              {formatPoints(detail.roundScore.pointsTotal)} puan
            </p>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Diziliş: {formatPoints(detail.roundScore.pointsLineup)} · Boş
              pozisyonlar: {formatPoints(detail.roundScore.pointsEmptySlots)}
            </p>
          </div>

          <div className="card">
            <span className="tag">Bütçe</span>
            <p>{formatTL(detail.roundScore.managerTeam.budget)}</p>
          </div>

          <div className="card">
            <span className="tag">Hızlı erişim</span>
            <p>
              <Link href="/lineup">Diziliş</Link> ·{" "}
              <Link href="/squad">Kadrom</Link> ·{" "}
              <Link href="/points">Puanlar</Link> ·{" "}
              <Link href="/table">Lig Tablosu</Link>
            </p>
          </div>
        </>
      )}
    </>
  );
}
