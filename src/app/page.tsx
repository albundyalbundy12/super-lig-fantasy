import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1>Süper Lig Fantasy Manager</h1>
      <p className="subtitle">
        Menajer takımını yönet, dizilişini kur ve haftalık puanlarını takip et.
      </p>

      <div className="card">
        <span className="tag">Başla</span>
        <p>
          Soldaki menüden sayfalara ulaşabilirsin:{" "}
          <Link href="/dashboard">Ana Sayfa</Link>,{" "}
          <Link href="/squad">Kadrom</Link>,{" "}
          <Link href="/lineup">Diziliş</Link>,{" "}
          <Link href="/points">Puanlar</Link> ve{" "}
          <Link href="/table">Lig Tablosu</Link>.
        </p>
      </div>

      <div className="card">
        <span className="tag">Not</span>
        <p>
          Bu sürüm test verisiyle çalışır. Transfer pazarı henüz aktif değildir.
        </p>
      </div>
    </>
  );
}
