import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ClientsBar } from "@/components/sections/ClientsBar";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Method } from "@/components/sections/Method";
import { Pricing } from "@/components/sections/Pricing";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { MobileCtaBar } from "@/components/MobileCtaBar";

export default function Home() {
  return (
    <>
      <a
        href="#lavori"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-[60] focus:bg-giallo focus:px-4 focus:py-2"
      >
        Salta al contenuto
      </a>
      <Nav />
      <main className="pt-[calc(var(--nav-h)+4px)]">
        <Hero />
        <ClientsBar />
        <Work />
        <Services />
        <Method />
        <Pricing />
        <Team />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
