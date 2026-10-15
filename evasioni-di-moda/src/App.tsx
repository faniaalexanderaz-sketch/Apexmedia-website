import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { NewArrivals } from './components/NewArrivals'
import { Collections } from './components/Collections'
import { Marquee } from './components/Marquee'
import { Reviews } from './components/Reviews'
import { PointerEffects } from './components/PointerEffects'
import { BrandStory } from './components/BrandStory'
import { SeasonalEditorial } from './components/SeasonalEditorial'
import { StoreCTA } from './components/StoreCTA'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { MobileActionBar } from './components/MobileActionBar'
import { InquiryDialog } from './components/InquiryDialog'
import { InquiryContext, type InquiryContent } from './components/Inquiry'

export function App() {
  const [inquiry, setInquiry] = useState<InquiryContent | null>(null)
  const closeInquiry = useCallback(() => setInquiry(null), [])

  return (
    <InquiryContext.Provider value={setInquiry}>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <NewArrivals />
        <Collections />
        <BrandStory />
        <Reviews />
        <SeasonalEditorial />
        <StoreCTA />
        <ContactSection />
      </main>
      <Footer />
      <MobileActionBar />
      <PointerEffects />
      <InquiryDialog content={inquiry} onClose={closeInquiry} />
    </InquiryContext.Provider>
  )
}
