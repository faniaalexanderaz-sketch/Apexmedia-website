import type { ImageAsset } from '../data/images'

const BASE = import.meta.env.BASE_URL

export function imageUrl(image: ImageAsset, width: number): string {
  return `${BASE}images/${image.src}-${width}.webp`
}

export function imageSrcSet(image: ImageAsset): string {
  return image.widths.map((w) => `${imageUrl(image, w)} ${w}w`).join(', ')
}
