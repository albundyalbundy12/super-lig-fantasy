import Link from "next/link";
import { getManagerRoundDetail } from "@/lib/fantasy/queries";
import { formatPoints, formatTL } from "@/lib/fantasy/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const detail = await getManagerRoundDetail();

  // ── No data state ────────────────────────────────────────
  if (!detail) {
    return (
      <>
        <div className="cockpit">
          <div className="cockpit-header">
            <div>
              <div className="cockpit-team">Süper Lig Fantasy</div>
              <div className="cockpit-league">Menajer kurulmadı</div>
            </div>
          </div>

          <div className="cockpit-pts">
            <div className="cockpit-pts-num" style={{ color: "var(--t3)", fontSize: 40 }}>
              —
            </div>
            <div className="cockpit-pts-label">Henüz puan yok</div>
          </div>
        </div>

        <div className="section">
          <div
            className="card"
            style={{
              padding: "20px 20px",
              borderColor: "rgba(201,162,39,0.25)",
              background: "rgba(201,162,39,0.06)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 8,
              }}
            >
              Başlamak için
            </div>
            <p style={{ color: "var(--t2)", fontSize: 13, lineHeight: 1.7 }}>
              Test menajer puanını oluşturmak için{" "}
              <Link href="/admin/sync" style={{ color: "var(--gold)" }}>
                Veri Senkronizasyonu
              </Link>{" "}
              sayfasına git. Fixture senkronizasyonu → Oyuncu puanları → Test menajer
              adımlarını çalıştır.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── With data ────────────────────────────────────────────
  const { roundScore } = detail;
  const teamName   = roundScore.managerTeam.name;
  const leagueName = roundScore.managerTeam.league.name;
  const budget     = roundScore.managerTeam.budget;
  const squadValue = roundScore.managerTeam.squadValue;
  const thisWeek   = roundScore.pointsTotal;
  const lineupPts  = roundScore.pointsLineup;
  const emptyPts   = roundScore.pointsEmptySlots;

  // Lineup completeness: count empty slots
  const slots        = detail.lineup?.slots ?? [];
  const totalSlots   = slots.length;
  const emptySlots   = slots.filter((s) => s.playerId === null || s.isEmpty).length;
  const lineupFull   = emptySlots === 0;
  const lineupStatus = lineupFull
    ? "Diziliş Hazır"
    : `${emptySlots} boş pozisyon`;

  return (
    <>
      {/* ── Cockpit hero ─────────────────────────────────── */}
      <div className="cockpit">
        <div className="cockpit-header">
          <div>
            <div className="cockpit-team">{teamName}</div>
            <div className="cockpit-league">{leagueName}</div>
          </div>
          <div className="cockpit-week">
            <div className="cockpit-week-label">Haftaya Hazır mısın?</div>
            <div className="cockpit-week-val">
              {lineupFull ? (
                <span style={{ color: "var(--lime)" }}>✓ Hazır</span>
              ) : (
                <span style={{ color: "var(--gold)" }}>{lineupStatus}</span>
              )}
            </div>
          </div>
        </div>

        {/* Big number */}
        <div className="cockpit-pts">
          <div
            className="cockpit-pts-num"
            style={{ color: thisWeek < 0 ? "var(--red)" : "var(--gold)" }}
          >
            {thisWeek}
          </div>
          <div className="cockpit-pts-label">Bu Haftanın Puanı</div>
        </div>

        {/* 4-cell stat bar */}
        <div className="cockpit-stats">
          <div className="cockpit-stat">
            <div
              className="cockpit-stat-val"
              style={{ color: lineupPts > 0 ? "var(--lime)" : "var(--t1)" }}
            >
              {formatPoints(lineupPts)}
            </div>
            <div className="cockpit-stat-label">Diziliş</div>
          </div>
          <div className="cockpit-stat">
            <div
              className="cockpit-stat-val"
              style={{ color: emptyPts < 0 ? "var(--red)" : "var(--t3)" }}
            >
              {emptyPts < 0 ? formatPoints(emptyPts) : "—"}
            </div>
            <div className="cockpit-stat-label">Boş Ceza</div>
          </div>
          <div className="cockpit-stat">
            <div className="cockpit-stat-val" style={{ fontSize: 14, paddingTop: 2 }}>
              {formatTL(budget)}
            </div>
            <div className="cockpit-stat-label">Bütçe</div>
          </div>
          <div className="cockpit-stat">
            <div className="cockpit-stat-val" style={{ fontSize: 14, paddingTop: 2 }}>
              {formatTL(squadValue)}
            </div>
            <div className="cockpit-stat-label">Kadro Değeri</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="cockpit-actions">
          <Link href="/lineup" className="cockpit-action-primary">
            Dizilişi Kontrol Et
          </Link>
          <Link href="/transfer-market" className="cockpit-action-secondary">
            Transfer Pazarı
          </Link>
          <Link href="/points" className="cockpit-action-secondary">
            Puanlar
          </Link>
        </div>
      </div>

      {/* ── Status strip ─────────────────────────────────── */}
      <div className="section" style={{ paddingBottom: 0 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Lineup status */}
          <div
            className="card"
            style={{
              flex: 1,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 0,
            }}
          >
            <span
              className="dot"
              style={{ background: lineupFull ? "var(--lime)" : "var(--gold)" }}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: lineupFull ? "var(--lime)" : "var(--gold)" }}>
                Diziliş
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 1 }}>
                {lineupFull
                  ? `${totalSlots}/${totalSlots} pozisyon dolu`
                  : `${totalSlots - emptySlots}/${totalSlots} pozisyon dolu`}
              </div>
            </div>
          </div>

          {/* Budget status */}
          <div
            className="card"
            style={{
              flex: 1,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 0,
            }}
          >
            <span className="dot dot-ok" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lime)" }}>
                Bütçe
              </div>
              <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 1 }}>
                {formatTL(budget)} kalan
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick nav tiles ───────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Hızlı Erişim</div>
        </div>
        <div className="quick-links">
          <Link href="/squad" className="quick-link">Kadrom</Link>
          <Link href="/lineup" className="quick-link">Diziliş</Link>
          <Link href="/transfer-market" className="quick-link">Transfer Pazarı</Link>
          <Link href="/points" className="quick-link">Puanlar</Link>
          <Link href="/table" className="quick-link">Lig Tablosu</Link>
        </div>
      </div>
    </>
  );
}
