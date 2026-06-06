import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/squad", label: "Squad" },
  { href: "/lineup", label: "Lineup" },
  { href: "/transfer-market", label: "Transfer Market" },
  { href: "/points", label: "Points" },
  { href: "/table", label: "Table" },
  { href: "/admin/sync", label: "Admin · Sync" },
];

export function Nav() {
  return (
    <aside className="sidebar">
      <div className="brand">
        Süper Lig Fantasy
        <small>MVP scaffold · v0.1</small>
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
