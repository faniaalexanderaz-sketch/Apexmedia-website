import { Suspense } from "react";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Impact } from "@/components/sections/Impact";
import { ServicesMarquee } from "@/components/sections/ServicesMarquee";
import { Showcase } from "@/components/sections/Showcase";
import { Campaigns } from "@/components/sections/Campaigns";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Performance } from "@/components/sections/Performance";
import { Method } from "@/components/sections/Method";
import { Pricing } from "@/components/sections/Pricing";
import { Team } from "@/components/sections/Team";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { CustomCursor } from "@/components/CustomCursor";
import { showTeam } from "@/data/team";

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
        <TrustStrip />
        {/* Ogni sezione sotto la piega è un confine di Suspense: React la idrata in un task separato,
            così il browser può dipingere l’hero prima di finire tutto il JavaScript */}
        <Suspense>
          <ServicesMarquee />
        </Suspense>
        <Suspense>
          <Impact />
        </Suspense>
        <Suspense>
          <Showcase />
        </Suspense>
        <Suspense>
          <Campaigns />
        </Suspense>
        <Suspense>
          <Work />
        </Suspense>
        <Suspense>
          <Services />
        </Suspense>
        <Suspense>
          <Performance numero="03" />
        </Suspense>
        <Suspense>
          <Method numero="04" />
        </Suspense>
        <Suspense>
          <Pricing numero="05" />
        </Suspense>
        <Suspense>
          <Team />
          <Faq numero={showTeam ? "07" : "06"} />
        </Suspense>
        <Suspense>
          <Contact numero={showTeam ? "08" : "07"} />
        </Suspense>
      </main>
      <Suspense>
        <Footer />
        <MobileCtaBar />
        <CustomCursor />
      </Suspense>
    </>
  );
}
