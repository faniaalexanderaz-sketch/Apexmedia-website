// Prerender statico: inserisce nell'HTML di build il markup completo della pagina.
// Risultato: contenuti leggibili da motori di ricerca e anteprime social, sito
// consultabile anche senza JavaScript, primo paint immediato.
//
// Variabile opzionale SITE_URL (es. https://www.evasionidimoda.it): abilita
// canonical, og:url e og:image con URL assoluto.
import { readFile, writeFile, rm, readdir, mkdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const ssrEntry = (await readdir(ssrDir)).find((f) => f.startsWith('entry-server') && f.endsWith('.js'))
const { render, renderPresentation, products, collections } = await import(pathToFileURL(path.join(ssrDir, ssrEntry)).href)

const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '')
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
let html = template.replace('<!--APP-->', render('/'))

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

// pagine del negozio "prenota e ritira": una pagina HTML per catalogo, collezione e prodotto
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const pages = [
  { path: '/collezioni/', title: 'Collezioni · Prenota e ritira in negozio', description: 'Scegli capo e taglia, prenota online e ritira in boutique in Corso Acqui 94, Alessandria. Nessuna spedizione, paghi in negozio.' },
  ...collections.map((c) => ({
    path: `/collezioni/${c.id}/`,
    title: `${c.title}${c.accent ? ' ' + c.accent : ''} · Prenota e ritira`,
    description: `${c.text} Prenota online e ritira in Corso Acqui 94, Alessandria.`,
  })),
  ...products.map((p) => ({
    path: `/prodotto/${p.slug}/`,
    title: `${p.name} · Prenota e ritira in negozio`,
    description: `${p.description} Prenota la tua taglia e ritirala in boutique ad Alessandria.`,
  })),
  { path: '/prenota/', title: 'Completa la prenotazione', description: 'Conferma i capi da ritirare in boutique in Corso Acqui 94, Alessandria.' },
]
const toAbs = (p) => (siteUrl ? `${siteUrl}${p}` : null)
for (const page of pages) {
  let out = template.replace('<!--APP-->', render(page.path))
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)} · Evasioni di Moda</title>`)
  out = out.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.description)}$2`)
  out = out.replace('%OG_IMAGE%', ogImage)
  out = out.replace('<!--SEO:robots-->', isDemo ? '<meta name="robots" content="noindex, nofollow" />' : '')
  out = out.replace('<!--SEO:canonical-->', toAbs(page.path) ? `<link rel="canonical" href="${toAbs(page.path)}" />` : '')
  out = out.replace('<!--PRELOAD:hero-->', '')
  const dir = path.join(dist, page.path)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), out)
}
console.log(`prerender: ${pages.length} pagine negozio`)

// pagina di presentazione del progetto
const deckPath = path.join(dist, 'presentazione', 'index.html')
let deck = await readFile(deckPath, 'utf8')
deck = deck.replace('<!--APP-->', renderPresentation()).replace('%OG_IMAGE%', siteUrl ? `${siteUrl}/og-image.jpg` : '/og-image.jpg')
await writeFile(deckPath, deck)
await rm(ssrDir, { recursive: true, force: true })
console.log(`prerender: ok${siteUrl ? ` (${siteUrl})` : ' (senza SITE_URL: canonical omesso)'}`)
