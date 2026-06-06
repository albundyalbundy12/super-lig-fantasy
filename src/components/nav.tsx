"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: "🏠" },
  { href: "/squad", label: "Kadrom", icon: "👥" },
  { href: "/lineup", label: "Diziliş", icon: "📋" },
  { href: "/transfer-market", label: "Transfer Pazarı", icon: "💱" },
  { href: "/points", label: "Puanlar", icon: "📊" },
  { href: "/table", label: "Lig Tablosu", icon: "🏆" },
  { href: "/admin/sync", label: "Veri Senkronizasyonu", icon: "🔄" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav>
        <p className="nav-section">Menü</p>
        <ul className="nav">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={active ? "active" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-ico" aria-hidden>
                    {link.icon}
                  </span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
