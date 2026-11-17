import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Montserrat } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { LogoSprite } from "@/components/Logo";
import { SITE } from "@/lib/site";
import "./globals.css";

// Titoli: Bodoni Moda con asse ottico, così a 80 px ha le grazie sottili e a 20 px regge.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const bodoniCorsivo = Bodoni_Moda({
  subsets: ["latin"],
  axes: ["opsz"],
  style: "italic",
  variable: "--font-bodoni-corsivo",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "CORNER Concept Store | Workwear, vintage e sportswear retrò ad Alessandria",
    template: "%s | CORNER Concept Store",
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: SITE.name,
    title: "CORNER Concept Store, Alessandria",
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1e3326",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${bodoni.variable} ${bodoniCorsivo.variable} ${montserrat.variable}`}>
      <body className="flex min-h-dvh flex-col bg-crema text-verde">
        <LogoSprite />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
