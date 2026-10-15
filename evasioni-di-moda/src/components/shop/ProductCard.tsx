import { formatPrice, type Product } from '../../data/products'
import { paths } from '../../router'
import { ResponsiveImage } from '../ResponsiveImage'

export function ProductCard({ product }: { product: Product }) {
  const available = product.sizes.filter((s) => s.available).length
  const isGift = product.slug === 'buono-regalo'
  return (
    <li className="product-card" data-reveal="block">
      <a className="product-card__link" href={paths.product(product.slug)} data-cursor="Scopri">
        <span className="product-card__media">
          <ResponsiveImage image={product.image} sizes="(min-width: 1100px) 24vw, (min-width: 700px) 33vw, 48vw" alt="" />
          {product.isNew && <span className="tag product-card__tag">Nuovo arrivo</span>}
          <span className="product-card__reserve" aria-hidden="true">
            Prenota e ritira
          </span>
        </span>
        <span className="product-card__body">
          <span className="product-card__name">{product.name}</span>
          <span className="product-card__meta">
            {product.color !== '—' ? product.color : 'Importo a scelta'} ·{' '}
            {product.sizes.length === 1 ? product.sizes[0].label : `${available} taglie disponibili`}
          </span>
          <span className="product-card__price">{isGift ? `da ${formatPrice(25)}` : formatPrice(product.price)}</span>
        </span>
      </a>
    </li>
  )
}
