import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { PortfolioCases } from "@/components/sections/PortfolioCases";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Siti, e-commerce e campagne che abbiamo realizzato per attività locali ad Alessandria: coworking, centro olistico, fioreria, compagnia teatrale.",
  alternates: { canonical: "/portfolio" },
  openGraph: { title: "Portfolio · Apex Media", url: `${site.url}/portfolio` },
};

export default function PortfolioPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h)+4px)]">
        <PortfolioCases as="h1" />
        <section className="border-t border-ink/10 py-16 lg:py-20" aria-labelledby="portfolio-cta">
          <Container className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="portfolio-cta" className="h-display text-[clamp(1.75rem,1rem+2.4vw,3rem)]">
                La tua attività è la prossima?
              </h2>
              <p className="text-body mt-3 text-ink/75">Prima call gratuita, {site.responseTime.toLowerCase()}.</p>
            </div>
            <Button href="/#contatti" data-track="click_cta" data-track-posizione="portfolio">
              Prenota la call gratuita
            </Button>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
