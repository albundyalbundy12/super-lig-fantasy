import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Süper Lig Fantasy",
  description: "Otomatik Süper Lig fantezi futbol menajeri — MVP sürümü.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="app">
          <header className="topbar">
            <div className="brand">
              <span className="brand-badge" aria-hidden>
                ⚽
              </span>
              <span className="brand-text">
                <strong>Süper Lig Fantasy</strong>
                <small>Menajer · MVP v0.1</small>
              </span>
            </div>
            <div className="topbar-meta">
              <span className="chip chip-gold">
                <span className="chip-label">Sezon</span> 2025/2026
              </span>
            </div>
          </header>
          <div className="app-body">
            <Nav />
            <main className="content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
