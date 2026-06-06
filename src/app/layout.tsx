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
        <div className="app-shell">
          <Nav />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
