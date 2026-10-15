// Prerender statico: inserisce nell'HTML di build il markup completo della pagina.
// Risultato: contenuti leggibili da motori di ricerca e anteprime social, sito
// consultabile anche senza JavaScript, primo paint immediato.
//
// Variabile opzionale SITE_URL (es. https://www.evasionidimoda.it): abilita
// canonical, og:url e og:image con URL assoluto.
import { readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const ssrEntry = (await readdir(ssrDir)).find((f) => f.startsWith('entry-server') && f.endsWith('.js'))
const { render } = await import(pathToFileURL(path.join(ssrDir, ssrEntry)).href)

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')
let html = await readFile(path.join(dist, 'index.html'), 'utf8')

html = html.replace('<!--APP-->', render())

const ogImage = siteUrl ? `${siteUrl}/og-image.jpg` : 'og-image.jpg'
html = html.replace('%OG_IMAGE%', ogImage)
html = html.replace(
  '<!--SEO:canonical-->',
  siteUrl ? `<link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />` : '',
)

// preload dell'immagine hero con lo stesso srcset del markup (LCP)
const heroImg = html.match(/<section[^>]*class="hero"[\s\S]*?<img([^>]*)>/)
if (heroImg) {
  const attr = (name) => heroImg[1].match(new RegExp(`${name}="([^"]*)"`))?.[1]
  const preload = `<link rel="preload" as="image" type="image/webp" imagesrcset="${attr('srcSet') ?? attr('srcset')}" imagesizes="${attr('sizes')}" fetchpriority="high" />`
  html = html.replace('<!--PRELOAD:hero-->', preload)
} else {
  html = html.replace('<!--PRELOAD:hero-->', '')
}

await writeFile(path.join(dist, 'index.html'), html)
await rm(ssrDir, { recursive: true, force: true })
console.log(`prerender: ok${siteUrl ? ` (${siteUrl})` : ' (senza SITE_URL: canonical omesso)'}`)
