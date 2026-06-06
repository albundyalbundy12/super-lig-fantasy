"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MAIN_LINKS = [
  {
    href: "/dashboard",
    label: "Ana Sayfa",
    shortLabel: "Ana",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/squad",
    label: "Kadrom",
    shortLabel: "Kadro",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/lineup",
    label: "Diziliş",
    shortLabel: "Diziliş",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        <path strokeLinecap="round" d="M2 12h20" />
      </svg>
    ),
  },
  {
    href: "/transfer-market",
    label: "Transfer Pazarı",
    shortLabel: "Pazar",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    href: "/points",
    label: "Puanlar",
    shortLabel: "Puan",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/table",
    label: "Lig Tablosu",
    shortLabel: "Tablo",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const ADMIN_LINKS = [
  {
    href: "/admin/sync",
    label: "Veri Senkronizasyonu",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

// Bottom nav shows only the 5 most important links
const BOTTOM_NAV_LINKS = MAIN_LINKS.slice(0, 5);

export function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Süper Lig<br />Fantasy</div>
          <div className="sidebar-brand-sub">MVP · v0.1</div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {MAIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link${isActive(link.href) ? " active" : ""}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="divider" />
          <div className="nav-section-label">Admin</div>

          <ul>
            {ADMIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link${isActive(link.href) ? " active" : ""}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="topbar">
        <span className="topbar-brand">Süper Lig Fantasy</span>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="bottomnav">
        {BOTTOM_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`bottomnav-item${isActive(link.href) ? " active" : ""}`}
          >
            {link.icon}
            <span>{link.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
