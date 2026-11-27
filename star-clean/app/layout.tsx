import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Tracciamento } from "@/components/Tracciamento";
import { sito, urlSito } from "@/content/sito";
import "./globals.css";

// Due sole famiglie: Bricolage Grotesque per i titoli (solo 600 e 700, file leggeri), Inter variabile per il testo.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(urlSito()),
  title: {
    default: "Star Clean, impresa di pulizie ad Alessandria. Preventivo in 24 ore",
    template: "%s | Star Clean",
  },
  description:
    "Pulizie civili e industriali, trattamento pavimenti, vetri, vetrine e tapparelle ad Alessandria e provincia. Impresa di famiglia da 30 anni. Preventivo scritto in 24 ore.",
  // Finché il sito è una demo con dati provvisori non deve finire su Google.
  robots: sito.demo ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { type: "website", locale: "it_IT", siteName: sito.nome },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0B345A" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${bricolage.variable} ${inter.variable}`}>
      <body>
        {children}
        <Tracciamento />
      </body>
    </html>
  );
}
