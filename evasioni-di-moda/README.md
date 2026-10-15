# Evasioni di Moda — sito vetrina (demo Apex Media)

Boutique di abbigliamento · Corso Acqui 94, 15121 Alessandria · Tel. 0131 381843

Sito one-page editoriale: React + TypeScript + Vite, animazioni GSAP (ScrollTrigger, SplitText),
HTML prerenderizzato in build (SEO locale, anteprime social, funziona anche senza JavaScript).

## Comandi

```bash
npm install
npm run dev        # sviluppo
npm run build      # build + prerender in dist/
npm run preview    # anteprima della build
```

Deploy su Vercel: importare il repository con **Root Directory = `evasioni-di-moda`** (`vercel.json` già pronto).
Impostare la variabile `SITE_URL` (es. `https://www.evasionidimoda.it`) per attivare canonical e Open Graph assoluti.

## Dove si modificano i contenuti

| Cosa | File |
| --- | --- |
| Indirizzo, telefono, orari, WhatsApp, social, link Maps | `src/data/store.ts` |
| Nuovi arrivi (aggiungi/togli oggetti all'elenco) | `src/data/newArrivals.ts` |
| Categorie / collezioni | `src/data/collections.ts` |
| Ispirazioni di stagione | `src/data/editorial.ts` |
| Elenco foto (alt, dimensioni, punto focale) | `src/data/images.ts` |

## Da confermare con il titolare prima della pubblicazione

- **Orari di apertura** → `store.hours` (finché è `null` il sito invita a chiamare).
- **Numero WhatsApp** → `store.whatsapp` (finché è `null` i pulsanti WhatsApp non compaiono).
- **Profili social ufficiali** → `store.socials`.
- **Categorie reali** dell'assortimento e testi della sezione "Il negozio".
- **Fotografie**: quelle attuali sono dimostrative (Unsplash License) e non rappresentano capi in vendita.
  Per sostituirle: caricare in `public/images/` i file `<nome>-<larghezza>.webp` con le larghezze indicate
  in `src/data/images.ts` (o aggiornare la voce corrispondente).
- Prezzi: il campo `price` dei nuovi arrivi va compilato solo con prezzi confermati.

Nessun dato del negozio è stato inventato: compaiono solo indirizzo e telefono verificati.
