import Link from "next/link";
import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const detail = await getManagerRoundDetail();

  if (!detail) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Ana Sayfa</h1>
          <p className="page-subtitle">Menajer takımının özeti.</p>
        </div>
        <div className="card">
          <div className="card-title">Veri Yok</div>
          <p style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 14 }}>
            Henüz menajer puanı oluşturulmadı.{" "}
            <Link href="/admin/sync" style={{ color: "var(--accent-gold)" }}>
              Veri Senkronizasyonu
            </Link>{" "}
            sayfasından test menajer puanını oluşturabilirsin.
          </p>
        </div>
      </>
    );
  }

  const { roundScore } = detail;
  const teamName = roundScore.managerTeam.name;
  const leagueName = roundScore.managerTeam.league.name;
  const budget = roundScore.managerTeam.budget;
  const squadValue = roundScore.managerTeam.squadValue;
  const thisWeek = roundScore.pointsTotal;
  const emptyPenalty = roundScore.pointsEmptySlots;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{teamName}</h1>
        <p className="page-subtitle">{leagueName}</p>
      </div>

      {/* Stats row */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Bu Hafta</div>
          <div className="stat-value">{thisWeek}</div>
          <div className="stat-sub">puan</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Bütçe</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 6 }}>
            {formatTL(budget)}
          </div>
          <div className="stat-sub">mevcut</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kadro Değeri</div>
          <div className="stat-value" style={{ fontSize: 16, paddingTop: 6 }}>
            {formatTL(squadValue)}
          </div>
          <div className="stat-sub">piyasa</div>
        </div>
      </div>

      {/* Breakdown card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Puan Dökümü</div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
              Diziliş Puanı
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-lime)" }}>
              {formatPoints(roundScore.pointsLineup)}
            </div>
          </div>
          {emptyPenalty < 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                Boş Pozisyon Cezası
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-red)" }}>
                {formatPoints(emptyPenalty)}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
              Toplam
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent-gold)" }}>
              {formatPoints(thisWeek)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Hızlı Erişim</div>
        </div>
        <div className="quick-actions" style={{ marginTop: 12 }}>
          <Link href="/lineup" className="quick-action primary">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            Dizilişi Kontrol Et
          </Link>
          <Link href="/transfer-market" className="quick-action">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer Pazarı
          </Link>
          <Link href="/points" className="quick-action">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Puanları İncele
          </Link>
          <Link href="/table" className="quick-action">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Lig Tablosu
          </Link>
        </div>
      </div>
    </>
  );
}
