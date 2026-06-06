import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Süper Lig Fantasy",
  description: "Süper Lig fantezi futbol menajeri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={barlowCondensed.variable}>
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
