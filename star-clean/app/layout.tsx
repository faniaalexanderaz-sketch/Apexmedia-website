import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Tracciamento } from "@/components/Tracciamento";
import { sito, urlSito } from "@/content/sito";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(urlSito()),
  title: {
    default: "Star Clean, impresa di pulizie ad Alessandria. Preventivo in 24 ore",
    template: "%s | Star Clean",
  },
  description:
    "Pulizie civili, pulizie industriali e trattamento pavimenti ad Alessandria e provincia. Impresa di famiglia da 30 anni. Preventivo scritto in 24 ore.",
  // Finché il sito è una demo con dati provvisori non deve finire su Google.
  robots: sito.demo ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: { type: "website", locale: "it_IT", siteName: sito.nome },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#083D4F" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={montserrat.variable}>
      <body>
        {children}
        <Tracciamento />
      </body>
    </html>
  );
}
