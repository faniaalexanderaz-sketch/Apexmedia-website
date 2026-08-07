import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { OfferSection } from "@/components/OfferSection";
import { FormSection } from "@/components/FormSection";
import { Footer } from "@/components/Footer";
import { StickyCta } from "@/components/StickyCta";

export default function Home() {
  return (
    <main className="pb-16 sm:pb-0">
      <Hero />
      <ProblemSection />
      <OfferSection />
      <FormSection />
      <Footer />
      <StickyCta />
    </main>
  );
}
