import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productBySlug, priceFor, type Product } from '../../data/products'

// Borsa delle prenotazioni: i capi scelti da ritirare in negozio.
// Vive nel browser del visitatore (localStorage); niente account, niente pagamento online.

export type BagItem = { slug: string; size: string; qty: number }
export type BagLine = BagItem & { product: Product; price: number }

type BagApi = {
  items: BagLine[]
  count: number
  total: number
  add: (slug: string, size: string) => void
  remove: (slug: string, size: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const KEY = 'edm-prenotazioni-v1'
const BagContext = createContext<BagApi | null>(null)

export function BagProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<BagItem[]>([])
  const [isOpen, setOpen] = useState(false)

  // lettura dopo il primo render: l'HTML prerenderizzato parte sempre da borsa vuota
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) setRaw(saved.filter((i) => productBySlug(i.slug)))
    } catch {
      /* storage non disponibile: la borsa resta in memoria */
    }
  }, [])

  const persist = useCallback((next: BagItem[]) => {
    setRaw(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignorato */
    }
  }, [])

  const api = useMemo<BagApi>(() => {
    const items = raw
      .map((i) => {
        const product = productBySlug(i.slug)
        return product ? { ...i, product, price: priceFor(product, i.size) } : null
      })
      .filter((i): i is BagLine => i !== null)
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      add: (slug, size) => {
        const existing = raw.find((i) => i.slug === slug && i.size === size)
        persist(
          existing
            ? raw.map((i) => (i === existing ? { ...i, qty: Math.min(i.qty + 1, 3) } : i))
            : [...raw, { slug, size, qty: 1 }],
        )
      },
      remove: (slug, size) => persist(raw.filter((i) => !(i.slug === slug && i.size === size))),
      clear: () => persist([]),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }
  }, [raw, isOpen, persist])

  return <BagContext.Provider value={api}>{children}</BagContext.Provider>
}

export function useBag(): BagApi {
  const ctx = useContext(BagContext)
  if (!ctx) throw new Error('useBag fuori da BagProvider')
  return ctx
}
