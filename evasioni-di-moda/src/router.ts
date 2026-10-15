import { createContext, useContext } from 'react'

// Instradamento minimale: ogni pagina è un file HTML prerenderizzato
// (/, /collezioni/, /collezioni/<id>/, /prodotto/<slug>/, /prenota/);
// i link sono normali <a href>, quindi funziona anche senza JavaScript.

export type Route =
  | { name: 'home' }
  | { name: 'shop'; collection?: string }
  | { name: 'product'; slug: string }
  | { name: 'booking' }

export function parseRoute(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'collezioni') return { name: 'shop', collection: parts[1] }
  if (parts[0] === 'prodotto' && parts[1]) return { name: 'product', slug: parts[1] }
  if (parts[0] === 'prenota') return { name: 'booking' }
  return { name: 'home' }
}

export const paths = {
  home: '/',
  shop: (collection?: string) => (collection ? `/collezioni/${collection}/` : '/collezioni/'),
  product: (slug: string) => `/prodotto/${slug}/`,
  booking: '/prenota/',
}

export const RouteContext = createContext<Route>({ name: 'home' })
export const useRoute = () => useContext(RouteContext)

/** Ancora di una sezione della home, valida da qualsiasi pagina */
export function useHomeAnchor() {
  const route = useRoute()
  return (id: string) => (route.name === 'home' ? `#${id}` : `/#${id}`)
}
