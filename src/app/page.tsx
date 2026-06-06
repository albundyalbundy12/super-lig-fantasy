import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="page-header">
        <span className="page-eyebrow">Hoş geldin</span>
        <h1>Süper Lig Fantasy Manager</h1>
        <p className="page-sub">
          Menajer takımını yönet, dizilişini sahada kur ve haftalık puanlarını
          gerçek performans verisiyle takip et.
        </p>
      </div>

      <div className="grid grid-3">
        <div className="stat-card">
          <div className="stat-label">Kadro</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            Akıllı Transfer
          </div>
          <div className="stat-sub">Oyuncuları TL ile al ve sat</div>
        </div>
        <div className="stat-card is-gold">
          <div className="stat-label">Diziliş</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            Sahada Taktik
          </div>
          <div className="stat-sub">Formasyonunu görsel olarak kur</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lig</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            Arkadaşlarına Karşı
          </div>
          <div className="stat-sub">Özel ligde zirveye oyna</div>
        </div>
      </div>

      <div className="card">
        <span className="tag">Başla</span>
        <p style={{ marginTop: 4 }}>
          Soldaki menüden tüm sayfalara ulaşabilirsin.
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}
        >
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Ana Sayfa
          </Link>
          <Link href="/lineup" className="btn btn-sm">
            Diziliş
          </Link>
          <Link href="/transfer-market" className="btn btn-sm">
            Transfer Pazarı
          </Link>
          <Link href="/table" className="btn btn-sm">
            Lig Tablosu
          </Link>
        </div>
      </div>

      <div className="card">
        <span className="tag">Not</span>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Bu sürüm test verisiyle çalışır. Gerçek sezon entegrasyonu ve canlı
          puanlama sonraki adımlarda gelir.
        </p>
      </div>
    </>
  );
}
