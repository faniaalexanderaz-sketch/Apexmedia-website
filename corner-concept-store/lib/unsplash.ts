// Le foto Unsplash arrivano già ritagliate e ridimensionate dal loro CDN (imgix):
// next/image chiede solo la larghezza che serve.

export function isUnsplash(src: string): boolean {
  return src.startsWith("https://images.unsplash.com/");
}

export function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 62));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
  return url.toString();
}
