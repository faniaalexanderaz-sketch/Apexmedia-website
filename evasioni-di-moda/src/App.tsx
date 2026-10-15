import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { MobileActionBar } from './components/MobileActionBar'
import { InquiryDialog } from './components/InquiryDialog'
import { InquiryContext, type InquiryContent } from './components/Inquiry'
import { PointerEffects } from './components/PointerEffects'
import { BagProvider } from './components/shop/Bag'
import { BagDrawer } from './components/shop/BagDrawer'
import { HomePage } from './pages/HomePage'
import { ShopPage } from './pages/ShopPage'
import { ProductPage } from './pages/ProductPage'
import { BookingPage } from './pages/BookingPage'
import { productBySlug } from './data/products'
import { parseRoute, RouteContext } from './router'

export function App({ path }: { path: string }) {
  const route = parseRoute(path)
  const [inquiry, setInquiry] = useState<InquiryContent | null>(null)
  const closeInquiry = useCallback(() => setInquiry(null), [])
  const product = route.name === 'product' ? productBySlug(route.slug) : undefined

  let page = <HomePage />
  if (route.name === 'shop') page = <ShopPage collection={route.collection} />
  if (route.name === 'product') page = product ? <ProductPage product={product} /> : <ShopPage />
  if (route.name === 'booking') page = <BookingPage />

  return (
    <RouteContext.Provider value={route}>
      <BagProvider>
        <InquiryContext.Provider value={setInquiry}>
          <a className="skip-link" href="#main">
            Vai al contenuto
          </a>
          <Header />
          <main id="main" className={route.name === 'home' ? undefined : 'subpage'}>
            {page}
          </main>
          <Footer />
          {route.name !== 'product' && route.name !== 'booking' && <MobileActionBar />}
          <PointerEffects />
          <InquiryDialog content={inquiry} onClose={closeInquiry} />
          <BagDrawer />
        </InquiryContext.Provider>
      </BagProvider>
    </RouteContext.Provider>
  )
}
