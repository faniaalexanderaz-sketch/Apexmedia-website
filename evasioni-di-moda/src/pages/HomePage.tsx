import { Hero } from '../components/Hero'
import { Marquee } from '../components/Marquee'
import { NewArrivals } from '../components/NewArrivals'
import { Collections } from '../components/Collections'
import { ReserveBand } from '../components/shop/ReserveBand'
import { BrandStory } from '../components/BrandStory'
import { Reviews } from '../components/Reviews'
import { SeasonalEditorial } from '../components/SeasonalEditorial'
import { StoreCTA } from '../components/StoreCTA'
import { ContactSection } from '../components/ContactSection'

export function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <NewArrivals />
      <Collections />
      <ReserveBand />
      <BrandStory />
      <Reviews />
      <SeasonalEditorial />
      <StoreCTA />
      <ContactSection />
    </>
  )
}
