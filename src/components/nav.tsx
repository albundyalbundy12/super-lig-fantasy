"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Simple, minimal geometric SVG icons — not emoji, not Font Awesome clones.
// Each is 20×20, single colour, stroke-based, visually clean.

const IconHome = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 18v-6h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const IconSquad = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="14" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 16.5c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 12c1.7 0 4 .9 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconPitch = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 7h2.5v6H2M18 7h-2.5v6H18" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const IconTransfer = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <path d="M4 7h12M13 4l3 3-3 3M16 13H4m0 0l3 3m-3-3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconPoints = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="13" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="8.5" y="9" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="14" y="5" width="3" height="13" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M4.5 12L9 7.5l4.5 3 3-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconTable = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 3v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconSync = () => (
  <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
    <path d="M17 10A7 7 0 114.3 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Football pitch logo mark
const LogoMark = () => (
  <svg viewBox="0 0 18 18" fill="currentColor">
    <rect x="1" y="3" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
    <line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="9" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MAIN_NAV = [
  { href: "/dashboard",       label: "Ana Sayfa",       short: "Ana",    Icon: IconHome },
  { href: "/squad",           label: "Kadrom",           short: "Kadro",  Icon: IconSquad },
  { href: "/lineup",          label: "Diziliş",          short: "Diziliş",Icon: IconPitch },
  { href: "/transfer-market", label: "Transfer Pazarı",  short: "Pazar",  Icon: IconTransfer },
  { href: "/points",          label: "Puanlar",          short: "Puan",   Icon: IconPoints },
  { href: "/table",           label: "Lig Tablosu",      short: "Tablo",  Icon: IconTable },
];

const ADMIN_NAV = [
  { href: "/admin/sync", label: "Veri Senkronizasyonu", short: "Sync", Icon: IconSync },
];

export function Nav() {
  const pathname = usePathname();

  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">
              <LogoMark />
            </div>
            <div className="sidebar-wordmark">
              Süper Lig
              <span>Fantasy Manager</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {MAIN_NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={`nav-link${active(href) ? " active" : ""}`}>
                  <Icon />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-sep" />
          <div className="nav-group-label">Admin</div>

          <ul>
            {ADMIN_NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link href={href} className={`nav-link${active(href) ? " active" : ""}`}>
                  <Icon />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <header className="topbar">
        <span className="topbar-brand">
          Süper Lig <span>Fantasy</span>
        </span>
      </header>

      {/* ── Mobile bottom nav (5 items) ───────────────────── */}
      <nav className="bottomnav">
        {MAIN_NAV.slice(0, 5).map(({ href, short, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`bottomnav-item${active(href) ? " active" : ""}`}
          >
            <Icon />
            <span>{short}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
