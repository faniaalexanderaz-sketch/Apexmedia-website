import { useRef, useState } from 'react'
import { Check, Clock, CreditCard, Phone, Store, Truck } from 'lucide-react'
import { collections } from '../data/collections'
import { formatPrice, priceFor, productsIn, type Product } from '../data/products'
import { store } from '../data/store'
import { paths } from '../router'
import { gsap, MEDIA, useGSAP, EASE_EDITORIAL } from '../lib/gsap'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from '../components/ResponsiveImage'
import { ProductCard } from '../components/shop/ProductCard'
import { useBag } from '../components/shop/Bag'
import { OpenStatusBadge } from '../components/OpenStatus'

/**
 * Scheda prodotto "prenota e ritira": foto grande, scelta della taglia,
 * un solo pulsante principale. Tutto ciò che può frenare (pagamento, spedizione,
 * impegno) è chiarito accanto al pulsante.
 */
export function ProductPage({ product }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const bag = useBag()
  const single = product.sizes.length === 1 ? product.sizes[0].label : null
  const [size, setSize] = useState<string | null>(single)
  const [hint, setHint] = useState(false)
  const collection = collections.find((c) => c.id === product.collection)
  const related = productsIn(product.collection).filter((p) => p.slug !== product.slug).slice(0, 4)
  const price = priceFor(product, size ?? undefined)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        gsap.fromTo('.pdp__media', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', clearProps: 'clipPath' })
        gsap.from('.pdp__media img', { scale: 1.25, duration: 2, ease: EASE_EDITORIAL })
        gsap.from('.pdp__info > *', { opacity: 0, y: 24, duration: 0.9, stagger: 0.06, delay: 0.3 })
      })
    },
    { scope: root },
  )

  const reserve = () => {
    if (!size) {
      setHint(true)
      document.querySelector<HTMLElement>('.size-picker')?.focus()
      return
    }
    bag.add(product.slug, size)
    bag.open()
  }

  return (
    <div ref={root} className="pdp" data-header="light">
      <div className="container">
        <nav className="breadcrumb" aria-label="Percorso">
          <a href={paths.home}>Home</a>
          <span aria-hidden="true">/</span>
          <a href={paths.shop()}>Collezioni</a>
          {collection && (
            <>
              <span aria-hidden="true">/</span>
              <a href={paths.shop(collection.id)}>
                {collection.title} {collection.accent}
              </a>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="pdp__grid">
          <div className="pdp__media">
            <ResponsiveImage image={product.image} sizes="(min-width: 900px) 50vw, 100vw" priority />
            {product.isNew && <span className="tag pdp__tag">Nuovo arrivo</span>}
          </div>

          <div className="pdp__info">
            <p className="eyebrow pdp__kicker">{collection ? `${collection.title} ${collection.accent ?? ''}` : 'Collezione'}</p>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__price">
              {formatPrice(price)}
              <span>da pagare in negozio al ritiro</span>
            </p>
            <p className="pdp__description">{product.description}</p>

            {product.color !== '—' && (
              <p className="pdp__color">
                <span>Colore</span> {product.color}
              </p>
            )}

            <fieldset className="size-picker" tabIndex={-1} aria-describedby={hint ? 'size-hint' : undefined}>
              <legend>{product.slug === 'buono-regalo' ? 'Importo' : 'Taglia'}</legend>
              <div className="size-picker__options">
                {product.sizes.map((s) => (
                  <label key={s.label} className="size" data-disabled={!s.available || undefined}>
                    <input
                      type="radio"
                      name="taglia"
                      value={s.label}
                      checked={size === s.label}
                      disabled={!s.available}
                      onChange={() => {
                        setSize(s.label)
                        setHint(false)
                      }}
                    />
                    <span>{s.label}</span>
                    {!s.available && <span className="visually-hidden"> (esaurita)</span>}
                  </label>
                ))}
              </div>
              {hint && (
                <p id="size-hint" className="size-picker__hint" role="alert">
                  Scegli una taglia per prenotare.
                </p>
              )}
              {product.sizes.some((s) => !s.available) && (
                <p className="size-picker__note">
                  Taglia esaurita?{' '}
                  <a className="link-underline" href={store.phone.href}>
                    Chiamaci
                  </a>
                  : verifichiamo l’arrivo di nuovi pezzi.
                </p>
              )}
            </fieldset>

            <button type="button" className="btn btn--primary btn--block pdp__cta" onClick={reserve} data-magnetic>
              <Store aria-hidden="true" size={17} strokeWidth={1.5} /> Prenota e ritira in negozio
            </button>
            <a className="btn btn--outline btn--block" href={store.phone.href}>
              <Phone aria-hidden="true" size={16} strokeWidth={1.5} /> Chiedi informazioni · {store.phone.display}
            </a>

            <ul className="pdp__perks">
              <li>
                <Check aria-hidden="true" size={16} strokeWidth={1.8} /> Ritiro gratuito in {store.address.street}, Alessandria
              </li>
              <li>
                <Clock aria-hidden="true" size={16} strokeWidth={1.6} /> Lo teniamo da parte per te per 48 ore
              </li>
              <li>
                <CreditCard aria-hidden="true" size={16} strokeWidth={1.6} /> Nessun pagamento online: provi e paghi in boutique
              </li>
              <li>
                <Truck aria-hidden="true" size={16} strokeWidth={1.6} /> Nessuna spedizione: solo ritiro in negozio
              </li>
            </ul>
            <OpenStatusBadge className="pdp__status" />

            <details className="pdp__details" open>
              <summary>Dettagli</summary>
              <ul>
                {product.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </details>
            {store.demo && <p className="pdp__demo">Prodotto dimostrativo: foto, prezzo e taglie sono d’esempio.</p>}
          </div>
        </div>

        {related.length > 0 && (
          <section className="pdp__related" aria-labelledby="related-title">
            <h2 id="related-title" className="pdp__related-title" data-reveal="title">
              Dalla stessa <em>collezione.</em>
            </h2>
            <ul className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* barra fissa su smartphone: prezzo + prenota sempre a portata di pollice */}
      <div className="pdp__sticky">
        <span className="pdp__sticky-price">
          {formatPrice(price)}
          <small>{size ? `Taglia ${size}` : 'Scegli la taglia'}</small>
        </span>
        <button type="button" className="btn btn--primary" onClick={reserve}>
          Prenota
        </button>
      </div>
    </div>
  )
}
