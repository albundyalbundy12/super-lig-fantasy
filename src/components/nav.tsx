import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Ana Sayfa" },
  { href: "/squad", label: "Kadrom" },
  { href: "/lineup", label: "Diziliş" },
  { href: "/transfer-market", label: "Transfer Pazarı" },
  { href: "/points", label: "Puanlar" },
  { href: "/table", label: "Lig Tablosu" },
  { href: "/admin/sync", label: "Veri Senkronizasyonu" },
];

export function Nav() {
  return (
    <aside className="sidebar">
      <div className="brand">
        Süper Lig Fantasy
        <small>MVP sürümü · v0.1</small>
      </div>
      <nav>
        <ul className="nav">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
