import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/data/site";
import { services } from "@/data/services";
import { MotionProvider } from "@/components/MotionProvider";
import { TrackingListener } from "@/components/TrackingListener";
import { ConsentBanner } from "@/components/ConsentBanner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

const TITLE = "Apex Media · Social, video, pubblicità e siti per attività locali ad Alessandria";
const DESCRIPTION =
  "Agenzia di marketing ad Alessandria: gestiamo social, video, campagne Meta, Google e TikTok e siti web per attività locali. Prima call gratuita.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: TITLE, template: "%s · Apex Media" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: site.url,
    siteName: site.name,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
  applicationName: site.name,
  formatDetection: { telephone: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#F6F5F1",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}/#apex-media`,
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: "+" + site.whatsappNumber,
  image: `${site.url}/opengraph-image`,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: "IT",
  },
  areaServed: { "@type": "City", name: site.city },
  founder: site.founders.map((name) => ({ "@type": "Person", name })),
  sameAs: [site.whatsappUrl],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servizi",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, description: s.description, areaServed: site.city },
    })),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it-IT" className={`${spaceGrotesk.variable} ${jakarta.variable} ${jetbrains.variable} h-full`}>
      <head>
        {/* Segnala che JS c’è: solo allora il CSS nasconde gli elementi dell’hero prima dell’animazione */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <MotionProvider />
        <TrackingListener />
        <ConsentBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
