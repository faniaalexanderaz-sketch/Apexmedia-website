import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./pannello.css";

/* Layout delle pagine riservate (/login, /admin, /jenny, /stampa):
   identità Essenza d'Oriente, font propri, niente nav del sito Apex. */

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PannelloLayout({ children }: { children: React.ReactNode }) {
  return <div className={`pannello ${cormorant.variable} ${inter.variable}`}>{children}</div>;
}
