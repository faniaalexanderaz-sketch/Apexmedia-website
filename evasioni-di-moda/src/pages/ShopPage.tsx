import { useRef } from 'react'
import { collections } from '../data/collections'
import { products, productsIn } from '../data/products'
import { store } from '../data/store'
import { paths } from '../router'
import { useReveal } from '../hooks/useReveal'
import { ProductCard } from '../components/shop/ProductCard'
import { HowItWorks } from '../components/shop/HowItWorks'

/** Catalogo: tutte le collezioni o una sola, con filtri a pillola e griglia prodotti. */
export function ShopPage({ collection }: { collection?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const current = collections.find((c) => c.id === collection)
  const list = current ? productsIn(current.id) : products
  const title = current ? `${current.title}${current.accent ? ` ${current.accent}` : ''}` : 'Tutte le collezioni'

  return (
    <div ref={root} className="shop" data-header="light">
      <section className="shop__hero container">
        <nav className="breadcrumb" aria-label="Percorso">
          <a href={paths.home}>Home</a>
          <span aria-hidden="true">/</span>
          {current ? <a href={paths.shop()}>Collezioni</a> : <span aria-current="page">Collezioni</span>}
          {current && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{title}</span>
            </>
          )}
        </nav>
        <p className="eyebrow shop__eyebrow" data-reveal="fade">
          Prenota online · ritira in Corso Acqui
        </p>
        <h1 className="shop__title" data-reveal="title">
          {current ? (
            <>
              {current.title} {current.accent && <em>{current.accent}</em>}
            </>
          ) : (
            <>
              Tutte le <em>collezioni.</em>
            </>
          )}
        </h1>
        <p className="shop__intro" data-reveal="fade" data-delay="0.15">
          {current
            ? current.text
            : 'Scegli il capo e la taglia, prenotalo in un minuto e passa a provarlo in boutique. Nessuna spedizione, nessun pagamento online.'}
        </p>
        <HowItWorks compact />
      </section>

      <section className="shop__catalog container" aria-label={`Prodotti: ${title}`}>
        <ul className="shop__filters" aria-label="Filtra per collezione">
          <li>
            <a className="chip" href={paths.shop()} aria-current={!current ? 'page' : undefined}>
              Tutto <span>{products.length}</span>
            </a>
          </li>
          {collections.map((c) => (
            <li key={c.id}>
              <a className="chip" href={paths.shop(c.id)} aria-current={current?.id === c.id ? 'page' : undefined}>
                {c.title} {c.accent} <span>{productsIn(c.id).length}</span>
              </a>
            </li>
          ))}
        </ul>

        <ul className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </ul>

        {store.demo && (
          <p className="shop__demo-note">
            Catalogo dimostrativo: prodotti, prezzi e disponibilità sono d’esempio e verranno sostituiti con i capi reali
            della boutique.
          </p>
        )}
      </section>
    </div>
  )
}
