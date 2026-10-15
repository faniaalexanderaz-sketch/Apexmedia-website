import type { ImageAsset } from '../data/images'
import { imageSrcSet, imageUrl } from '../lib/assets'

type Props = {
  image: ImageAsset
  /** attributo sizes: quanto spazio occupa l'immagine nel layout */
  sizes: string
  /** true per le immagini above the fold (niente lazy loading, priorità alta) */
  priority?: boolean
  className?: string
  /** alt alternativo; stringa vuota per immagini decorative */
  alt?: string
}

export function ResponsiveImage({ image, sizes, priority = false, className, alt }: Props) {
  const fallback = image.widths[Math.min(1, image.widths.length - 1)]
  return (
    <img
      className={className}
      src={imageUrl(image, fallback)}
      srcSet={imageSrcSet(image)}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt ?? image.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      style={{ backgroundColor: image.color, objectPosition: image.focus }}
    />
  )
}
