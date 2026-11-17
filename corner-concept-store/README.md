# CORNER Concept Store

Demo di e-commerce per CORNER Concept Store, via Modena 15, Alessandria.
Next.js 16 (App Router), TypeScript, Tailwind 4. Nessun database: catalogo in JSON, carrello nel browser.

## Avvio

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run start
```

## Deploy su Vercel

Il progetto vive in una sottocartella del repository: in Vercel va impostata la **Root Directory** su
`corner-concept-store`. Framework, build e output vengono rilevati da soli. Non servono variabili d'ambiente;
`NEXT_PUBLIC_SITE_URL` va impostata solo quando c'è il dominio definitivo (vedi `.env.example`).

## Dove mettere le mani

| Cosa | Dove |
| --- | --- |
| Prodotti, prezzi, taglie, giacenze, foto | `data/products.json` |
| Ritratti di "Gnute da Corner" | `data/gnute.json` |
| Indirizzo, telefono, orari, link | `lib/site.ts` |
| Spedizione (6,90 €, gratis da 150 €), resi | `lib/shipping.ts` |
| Data di chiusura del drop | `lib/drop.ts` |
| Colori, font, pillole, bottoni | `app/globals.css` |
| Logo (tracciati SVG) | `components/Logo.tsx`, `components/logo-data.ts` |
| Carta da parati anni '70 | `public/pattern/` |

Un prodotto in `products.json`:

- `sizes`: ogni taglia ha la sua giacenza (`stock`). A zero la taglia compare barrata; se sono tutte a zero il capo è "Venduto".
- `unique: true` mostra "Pezzo unico"; `dropNumber` lo inserisce nel drop Vintage Barbour Days.
- `newRank` (1-8) lo mette tra i nuovi arrivi in home.
- `pairsWith`: gli slug dei tre capi di "Abbinalo con".
- `images`: percorsi in `/public/products/` oppure URL diretti `https://images.unsplash.com/photo-...`.
  Se una foto non risponde, al suo posto compare un riquadro crema con il nome del capo.

## Cosa è finto in questa demo

- **Pagamento**: nessun addebito. Il checkout chiama `app/api/orders/route.ts`, che ricalcola prezzi e giacenze
  dal catalogo e restituisce un numero d'ordine. I dati della carta non lasciano il browser. Per andare in
  produzione quel file è il punto in cui creare il pagamento Stripe.
- **Ordini**: restano nel `localStorage` di chi li fa. Non parte nessuna email.
- **Giacenze**: sono quelle scritte nel JSON, non scalano dopo un ordine.
- **Conto alla rovescia del drop**: si rinnova ogni sabato alle 19:30. Prima della messa online va messa la data
  vera in `DROP.closesAt`.
- **Foto**: 16 capi usano ritagli delle foto del negozio; 8 capi (tra cui i quattro Barbour) e i ritratti di
  "Gnute da Corner" usano foto Unsplash di esempio, da sostituire.
- **Mappa**: immagine statica da OpenStreetMap. Il segnaposto è sulla via, la posizione esatta del civico 15 va verificata.
- **Privacy**: pagina segnaposto. Mancano informativa, partita IVA e banner cookie.
