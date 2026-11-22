import type { Metadata, Viewport } from "next";
import "./studio.css";

/* Area riservata di Apex Media (/studio): ufficio 3D degli agenti, conti e lavori.
   Usa i font del sito (Space Grotesk, Plus Jakarta Sans, JetBrains Mono). */

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#eff0f4", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="st">{children}</div>;
}
