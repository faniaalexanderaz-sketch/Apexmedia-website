# Evasioni di Moda — sito vetrina (demo Apex Media)

Boutique di abbigliamento · Corso Acqui 94, 15121 Alessandria · Tel. 0131 381843

Due pagine, entrambe prerenderizzate in build (SEO locale, anteprime social, funzionano anche senza JavaScript):

- `/` il sito della boutique (one-page editoriale)
- `/presentazione/` "Il progetto": la spiegazione per il titolare (obiettivi, percorso del cliente,
  sezione per sezione, identità visiva, animazioni, tecnica, cosa serve, prossimi passi)

Stack: React + TypeScript + Vite, GSAP (ScrollTrigger, SplitText, matchMedia).
Tipografia: Bodoni Moda (titoli), Cormorant Garamond (corsivi e citazioni), Manrope (interfaccia).

## Comandi

```bash
npm install
npm run dev        # sviluppo
npm run build      # build + prerender in dist/
npm run preview    # anteprima della build
```

Deploy su Vercel: importare il repository con **Root Directory = `evasioni-di-moda`** (`vercel.json` già pronto).
Variabili di build:
- `SITE_URL` (es. `https://www.evasionidimoda.it`): attiva canonical e Open Graph assoluti.
- `DEMO=false`: rimuove il `noindex` alla messa online (di default la demo non viene indicizzata).

## Dove si modificano i contenuti

| Cosa | File |
| --- | --- |
| Indirizzo, telefono, orari, WhatsApp, social, link Maps | `src/data/store.ts` |
| Nuovi arrivi (aggiungi/togli oggetti all'elenco) | `src/data/newArrivals.ts` |
| Categorie / collezioni | `src/data/collections.ts` |
| Ispirazioni di stagione | `src/data/editorial.ts` |
| Recensioni del nastro a scorrimento | `src/data/reviews.ts` |
| Elenco foto (alt, dimensioni, punto focale) | `src/data/images.ts` |
| Testi della pagina "Il progetto" | `src/presentation/content.ts` |

## Da confermare con il titolare prima della pubblicazione

- **Orari di apertura** → `store.hours`: oggi presi dalla scheda pubblica Nextdoor (lun–sab 9–12:30, 15:30–19:30).
  Con `null` il sito invita a chiamare. Lo stato "Aperto ora" si calcola sull'ora italiana.
- **Recensioni** → `src/data/reviews.ts`: recensioni Google reali a 5 stelle trascritte dalla scheda Maps
  (nome + iniziale). Aggiornarle periodicamente.
- **Civico e telefono**: in rete compaiono anche Corso Acqui 91 e 0131 1951940 (scheda "Evasioni di Moda Shoes").
- **Seconda sede** al Centro Commerciale Gli Archi (via Sclavo 15): citata in rete, da confermare.
- **Numero WhatsApp** → `store.whatsapp` (finché è `null` i pulsanti WhatsApp non compaiono).
- **Profili social ufficiali** → `store.socials`.
- **Categorie reali** dell'assortimento e testi della sezione "Il negozio".
- **Fotografie**: quelle attuali sono dimostrative (Unsplash License) e non rappresentano capi in vendita.
  Per sostituirle: caricare in `public/images/` i file `<nome>-<larghezza>.webp` con le larghezze indicate
  in `src/data/images.ts` (o aggiornare la voce corrispondente).
- Prezzi: il campo `price` dei nuovi arrivi va compilato solo con prezzi confermati.

Nessun dato del negozio è stato inventato: compaiono solo indirizzo e telefono verificati.
