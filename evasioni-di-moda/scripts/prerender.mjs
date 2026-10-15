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
const { render, renderPresentation } = await import(pathToFileURL(path.join(ssrDir, ssrEntry)).href)

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')
let html = await readFile(path.join(dist, 'index.html'), 'utf8')

html = html.replace('<!--APP-->', render())

const ogImage = siteUrl ? `${siteUrl}/og-image.jpg` : '/og-image.jpg'
html = html.replace('%OG_IMAGE%', ogImage)
// finché il sito è una demo (default) non va indicizzato: DEMO=false alla messa online
const isDemo = process.env.DEMO !== 'false'
html = html.replace('<!--SEO:robots-->', isDemo ? '<meta name="robots" content="noindex, nofollow" />' : '')
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

// pagina di presentazione del progetto
const deckPath = path.join(dist, 'presentazione', 'index.html')
let deck = await readFile(deckPath, 'utf8')
deck = deck.replace('<!--APP-->', renderPresentation()).replace('%OG_IMAGE%', siteUrl ? `${siteUrl}/og-image.jpg` : '/og-image.jpg')
await writeFile(deckPath, deck)
await rm(ssrDir, { recursive: true, force: true })
console.log(`prerender: ok${siteUrl ? ` (${siteUrl})` : ' (senza SITE_URL: canonical omesso)'}`)
