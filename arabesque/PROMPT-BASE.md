# PROMPT MASTER — E-COMMERCE "ARABESQUE BUSALLA" (base v1, già vendibile)

> Copia/incolla questo prompt in una sessione nuova di Claude Code, nella root del repo `Apexmedia-website`.

---

## 0. RUOLO

Sei contemporaneamente: **senior front-end engineer**, **CRO specialist** e **art director di moda**.
Costruisci la **prima base completa** dell'e-commerce di **Arabesque Abbigliamento — Busalla (GE)**: tema **nero couture**, animazioni 3D discrete, funnel di vendita completo.
Non è un esercizio di stile: il sito viene venduto a 5.000 €. Il livello di finitura deve essere quello di un e-commerce moda di fascia alta, non di un template.

**Regola d'oro su ogni decisione:** *"Questo aumenta conversioni, chiarezza o velocità di acquisto?"* Se no → si taglia.

---

## 1. IL CLIENTE (dati pubblici verificati)

- **Nome:** Arabesque Abbigliamento — uomo e donna
- **Dove:** Via Vittorio Veneto 154, Busalla (GE), a due passi dalla stazione ferroviaria
- **Cosa vende:** abbigliamento uomo e donna, multimarca
- **Differenziatore forte (da mettere al centro del posizionamento):** taglie dalla **XS alla 6XL**, con una linea/vetrina dedicata alle **taglie calibrate (curvy)** con prezzi accessibili e qualità alta
- **Presenza attuale:** sito vetrina (`arabesqueabbigliamento.it`, pagine tipo `/outfit-donna/`, `/contatti/`) + Facebook `Arabesque.Busalla` + Instagram
- **Bacino:** Valle Scrivia, entroterra genovese, pendolari della linea Genova–Arquata

**STEP 0 OBBLIGATORIO —** apri `arabesqueabbigliamento.it` e i social, e allinea: brand trattati, categorie reali, tono di voce, foto disponibili, P.IVA, telefono, orari. Tutto ciò che non è verificato va a **placeholder marcato `TODO-CLIENTE`**: mai inventare P.IVA, recensioni, numeri di clienti, premi o dati legali.

**Posizionamento da comunicare (non "negozio di vestiti"):**
> Boutique di Busalla che veste **ogni corporatura**, dalla XS alla 6XL, con selezione e consiglio da negozio fisico — ora anche online.

---

## 2. RIFERIMENTO TECNICO OBBLIGATORIO: `fioreria/`

Nel repo esiste già `fioreria/` (Antica Fioreria del Centro): **stesso identico livello di architettura e finitura, stessa filosofia, tema opposto (nero).**
Prima di scrivere una riga di codice **leggi**: `fioreria/index.html`, `fioreria/styles.css`, `fioreria/main.js`, `fioreria/prodotti.js`, `fioreria/prodotto.js`, `fioreria/catalogo.js`, `fioreria/checkout.js`, `fioreria/account.js`, `fioreria/api/*`.

Da riusare (pattern, non copia-incolla estetico):
- catalogo come **fonte dati unica** in un file JS (`prodotti.js`) con funzioni prezzo/varianti/spedizione
- carrello **drawer** con `localStorage`, coupon, calcolo spedizione per fascia
- **checkout in-sito a step** (niente redirect prima del pagamento) + Stripe serverless + fallback demo se la chiave non è configurata
- **API serverless** (`/api/*`): create-checkout-session, stripe-webhook, stock, track, traccia-ordine, invia-benvenuto, admin-login, admin-data, admin-scorte, admin-ordine-stato
- **pannello admin** minimale (ordini, stato, scorte, visite)
- pagine legali: privacy, cookie policy + banner, termini, tracking ordine, account
- font **self-hosted** in `fonts/` (zero chiamate a Google Fonts: velocità + GDPR)
- SEO: canonical, OG, sitemap.xml, robots.txt, JSON-LD

Il nuovo progetto vive in **`arabesque/`**, autonomo, con la stessa struttura di file.

---

## 3. STACK

- **HTML + CSS + JS vanilla.** Nessun framework, nessun build step, nessuna dipendenza runtime non necessaria.
- Deploy **Vercel** (`vercel.json`, `/api/*` serverless Node).
- Pagamenti **Stripe Checkout** (carta, Apple Pay, Google Pay, PayPal) + **contrassegno** + **ritiro in negozio**.
- Persistenza ordini: **Neon/Postgres serverless** (come `fioreria/api/_db.js`), schema creato a runtime.
- Email transazionali con lo stesso template pattern di `fioreria/api/_email*.js`.
- Segreti solo come **env var** su Vercel (`STRIPE_SECRET_KEY`, `DATABASE_URL`, ...), mai nel repo.

---

## 4. DESIGN SYSTEM — "NERO COUTURE"

Nero **elegante**, non nero "gaming/tech". Niente neon, niente gradienti viola, niente glassmorphism generico.
Riferimento mentale: editoriale moda (Vogue/Zegna/Max Mara) + boutique italiana.

```css
:root{
  --nero:      #0B0B0C;  /* fondo base */
  --nero-2:    #121214;  /* superfici / card */
  --nero-3:    #1A1A1D;  /* hover, bordi pieni */
  --grigio:    #8A8A90;  /* testo secondario */
  --panna:     #F3EFE7;  /* testo principale, non bianco puro */
  --oro:       #C8A96A;  /* accento premium — massimo 5% della pagina */
  --oro-soft:  rgba(200,169,106,.14);
  --linea:     rgba(243,239,231,.10);
  --r-card: 14px;   /* raggi contenuti: il lusso è squadrato */
  --r-pill: 999px;
  --maxw: 1320px;
  --pad: clamp(20px, 5vw, 72px);
  --ease: cubic-bezier(.16,1,.3,1);
}
```

**Tipografia (self-hosted, woff2, variabile):**
- Display/titoli: un serif alto contrasto — *Playfair Display* oppure *Bodoni Moda* (preferita: Bodoni Moda, più couture)
- Testo/UI: grotesque neutro — *Inter* oppure *Jost*
- Titoli in `clamp()`, `letter-spacing:-0.02em`, occhiello/eyebrow in maiuscoletto spaziato `0.18em` colore oro

**Regole non negoziabili sul dark:**
- mai `#000` puro su testo `#fff` puro → usa `--nero` / `--panna`
- le foto prodotto su fondo nero devono avere **cornice/padding chiaro o scontornatura**: mai capi neri che affogano nel fondo
- ombre su dark non funzionano → separa con **bordi `--linea`** e con variazioni di superficie (`--nero-2` / `--nero-3`)
- oro solo su: prezzo scontato, badge, CTA secondaria, dettagli 1px. Le CTA primarie sono **panna su nero** o **nero su panna** (contrasto massimo = clic massimo)
- contrasto AA minimo su tutto il testo

---

## 5. MOTION & 3D (dove serve, non ovunque)

Le animazioni servono a far percepire **qualità e prezzo alto**, non a fare demo tecnica. Vincolo assoluto: **LCP < 2,5 s su 4G mobile**.

**Sì (in ordine di priorità):**
1. **Hero cinematografico** — video loop 5–7 s, muto, `playsinline`, poster JPG immediato, `preload="none"` sotto i 768 px (mobile = solo poster statico). Soggetto: tessuto/seta nera in movimento lento, o dettaglio sartoriale, luce laterale calda.
2. **Reveal on scroll** — `IntersectionObserver` + `opacity/translateY`, 300–600 ms, `--ease`. Mai su elementi above-the-fold.
3. **Card prodotto**: crossfade sulla seconda foto (indossato) in hover/tap, zoom 1.03, transizione 400 ms.
4. **3D vero solo sul prodotto hero della stagione**: `<model-viewer>` o three.js con GLB < 3 MB, lazy-load al primo scroll in viewport, controllo drag 360°, fallback immagine se WebGL assente.
5. Micro-interazioni: add-to-cart con "volo" del prodotto verso l'icona carrello, contatore che pulsa, sticky bar prezzo su mobile.

**No:** parallax pesante su tutta la pagina, scroll-jacking, cursori custom, preloader con percentuale, testo che compare lettera per lettera nell'hero.

**`prefers-reduced-motion: reduce` → tutto statico.** Obbligatorio.

**Generazione asset con MCP (Higgsfield):**
- `generate_video` → loop hero tessuto/atelier (9:16 mobile + 16:9 desktop)
- `generate_image` → immagini editoriali lookbook, banner categorie, sfondi sezione
- `generate_3d` → GLB del capo icona per il viewer 360°
- `remove_background` / `upscale_image` → pulizia foto reali del negozio
Ogni asset generato va: convertito in **WebP/AVIF** (immagini) e **MP4 H.264 + WebM** (video), compresso, con `width/height` espliciti e `loading="lazy"` (tranne l'hero).
Se l'MCP non è disponibile, usa placeholder marcati e lascia i `TODO-ASSET` documentati nel README.
**Le immagini generate con AI sono provvisorie**: vanno sostituite con foto reali dei capi prima del lancio (segnalalo nel README).

---

## 6. ARCHITETTURA PAGINE

```
arabesque/
  index.html              home
  donna.html              catalogo donna  (filtri via querystring)
  uomo.html               catalogo uomo
  curvy.html              landing taglie calibrate XS–6XL  ← pagina strategica
  prodotto.html           PDP dinamica (?p=slug)
  checkout.html           checkout 3 step
  account.html            ordini + dati
  traccia-ordine.html
  ordine-completato.html / pagamento-annullato.html
  negozio.html            store page Busalla (mappa, orari, ritiro, consiglio taglia)
  privacy.html / cookie-policy.html / termini.html / resi-spedizioni.html
  admin.html
  prodotti.js catalogo.js prodotto.js main.js checkout.js account.js cookie.js
  styles.css  fonts/  foto/  api/  sitemap.xml robots.txt vercel.json
```

---

## 7. HOMEPAGE — SEZIONI IN QUEST'ORDINE (ordine = funnel)

1. **Promo bar** — spedizione gratis sopra soglia + codice `BENVENUTO10` (chiudibile, stato in localStorage)
2. **Nav** — logo centrato, Donna / Uomo / Curvy XS–6XL / Novità / Negozio · icone: cerca, account, carrello con badge. Sticky con compressione allo scroll; su mobile menu drawer.
3. **Hero** — video/immagine + headline + 2 CTA
   - H1: **"Stile che veste ogni corporatura. Dalla XS alla 6XL."**
   - Sub: "Boutique multimarca a Busalla dal [TODO-ANNO]. Ora anche online, con spedizione in tutta Italia e ritiro in negozio."
   - CTA primaria: **Scopri la collezione Donna** · secondaria: **Uomo**
4. **Fascia fiducia** (4 icone, 1 riga): Spedizione 24/48h · Reso facile 14 giorni · Ritiro gratuito in negozio a Busalla · Consiglio taglia su WhatsApp
5. **Categorie** — griglia/slider immagini: Donna, Uomo, Curvy, Capispalla, Novità, Saldi
6. **Più venduti** — 8 card prodotto con aggiungi-al-carrello rapido e selettore taglia inline
7. **Blocco Curvy** (il differenziatore) — sezione editoriale dedicata: "Taglie calibrate fino alla 6XL, scelte e provate in negozio" → CTA alla landing `curvy.html`
8. **Lookbook stagione** — 3 outfit completi, hotspot cliccabili → "Compra il look" (AOV booster)
9. **Il negozio** — foto reale, mappa, orari, "a 2 minuti dalla stazione di Busalla", CTA chiamata + indicazioni
10. **Recensioni Google** — solo reali, con nome e data (se non disponibili: `TODO-CLIENTE`, non inventare)
11. **Newsletter** — "-10% sul primo ordine", campo email + consenso privacy
12. **FAQ** — taglie, resi, spedizione, ritiro, pagamenti (con JSON-LD FAQPage)
13. **Footer** — colonne, pagamenti accettati, legali, social, P.IVA

---

## 8. CATALOGO — SCHEMA DATI

```js
{
  slug: 'cappotto-milano',
  nome: 'Cappotto doppiopetto Milano',
  brand: 'TODO-BRAND',
  categoria: 'donna',            // donna | uomo | accessori
  sottocategoria: 'capispalla',
  linea: ['curvy'],              // tag: curvy, novita, saldi, cerimonia
  prezzo: 189,
  sconto: 20,                    // opzionale, %
  colori: [{ nome:'Nero', hex:'#0B0B0C', foto:['foto/x-1.webp','foto/x-2.webp'] }],
  taglie: [                      // stock per taglia: mai vendere l'esaurito
    { id:'XS', stock:2 }, { id:'S', stock:4 }, ... { id:'6XL', stock:1 }
  ],
  materiali: 'Lana 70%, poliestere 30%',
  vestibilita: 'regolare',       // usata dalla guida taglie
  descrizione: '...',
  galleria: [...],
  spedizioneTier: 'sm'
}
```

**Filtri catalogo (barra sticky):** taglia (con evidenza XS–6XL), colore, prezzo, brand, categoria, solo disponibili, ordinamento. Filtri in querystring (condivisibili) + stato in URL. Griglia 2 colonne mobile / 4 desktop, lazy-load progressivo.

---

## 9. PDP — LA PAGINA CHE CONVERTE

- Galleria verticale desktop / swipe mobile, zoom, seconda foto indossata
- Titolo + brand + prezzo (con prezzo pieno barrato se in saldo)
- **Selettore taglia obbligatorio**: taglia esaurita = barrata, non cliccabile, con "Avvisami quando torna" (raccolta email)
- **Guida taglie** in drawer, con tabella cm reali e nota "in dubbio? scrivici su WhatsApp, ti diciamo noi la taglia" ← altissimo impatto su conversione e reso
- CTA: **Aggiungi al carrello** (piena, panna) + **Ritira in negozio a Busalla** (secondaria)
- Accordion: spedizione e resi, materiali e lavaggio, disponibilità in negozio
- Trust sotto la CTA: reso 14 giorni · pagamenti sicuri · spedizione 24/48h
- **Sticky bar mobile** con prezzo + taglia + CTA sempre visibile
- Correlati: "Completa il look" (upsell) + "Ti potrebbe piacere"
- JSON-LD `Product` + `Offer` (prezzo, disponibilità, condizione)

---

## 10. CARRELLO + CHECKOUT

- **Drawer carrello**: quantità, rimuovi, cambio taglia inline, coupon, soglia spedizione gratuita con progress bar ("Ti mancano 19 € alla spedizione gratuita" = AOV +), cross-sell 2 prodotti
- **Checkout in-sito, 3 step su una pagina**: Consegna → Spedizione/Ritiro → Pagamento
  - ospite di default, account opzionale **dopo** l'acquisto
  - campi minimi, validazione inline, autocompila CAP/città
  - opzioni: corriere / **ritiro gratuito in negozio** / contrassegno (+costo fisso)
  - riepilogo sempre visibile, nessun costo a sorpresa
  - Stripe Checkout per il pagamento, webhook per conferma + email
- Pagine esito: `ordine-completato` (con tracking e upsell soft), `pagamento-annullato` (riapre il carrello intatto)

---

## 11. FUNNEL LOCALE (Busalla) — non trattarlo come un e-commerce nazionale

Il 70% del valore per questo cliente è locale. Implementa:
- **Ritiro in negozio gratuito** in tutto il flusso (checkout, PDP, fascia fiducia)
- **WhatsApp float button** — "Consiglio taglia in 2 minuti", con messaggio precompilato che include il prodotto guardato
- **Store page** con mappa, orari, parcheggio, "2 min dalla stazione"
- JSON-LD `ClothingStore` con `openingHoursSpecification`, `geo`, `telephone`
- CTA telefono cliccabile su mobile

---

## 12. SEO & DATI STRUTTURATI

- Title/description unici per pagina, canonical, OG + Twitter card, `lang="it"`
- JSON-LD: `ClothingStore` (home), `Product` (PDP), `BreadcrumbList`, `FAQPage`
- URL puliti via rewrite Vercel (`/donna`, `/uomo`, `/curvy`, `/prodotto/slug`)
- `sitemap.xml` + `robots.txt`
- Target keyword: "abbigliamento Busalla", "negozio abbigliamento taglie forti Genova", "taglie calibrate 6XL online", "abbigliamento donna Valle Scrivia"

---

## 13. PERFORMANCE BUDGET (bloccante)

- LCP < 2,5 s · CLS < 0,05 · INP < 200 ms su mobile 4G
- CSS < 120 KB, JS < 90 KB (non minificati), zero librerie inutili
- Immagini WebP/AVIF, `width`/`height` sempre, `loading="lazy"` tranne hero, `fetchpriority="high"` sull'hero
- Font self-hosted woff2 + `font-display: swap`
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO = 100

---

## 14. ACCESSIBILITÀ

Navigazione da tastiera completa, focus visibile (oro), `aria-label` su ogni icona, drawer con focus trap ed `Esc`, skip link, contrasto AA, `prefers-reduced-motion` rispettato, form con `<label>` reali.

---

## 15. TRACKING & KPI

- GA4 + Meta Pixel (caricati **solo dopo consenso cookie**), Consent Mode v2
- Eventi: `view_item`, `select_size`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `purchase`, `whatsapp_click`, `pickup_selected`, `newsletter_signup`
- Endpoint `/api/track` per visite anonime nel pannello admin (come `fioreria/api/track.js`)
- KPI di riferimento da scrivere nel README: CR target 1,5–2,5%, AOV target, tasso add-to-cart, abbandono checkout

---

## 16. CONTENUTI: REALE vs PLACEHOLDER

- Copy: scrivilo tu, in italiano, tono **boutique italiana**: diretto, caldo, zero anglicismi inutili, zero "esperienza di shopping unica"
- Prodotti demo: 24–32 articoli coerenti (donna, uomo, curvy) con prezzi realistici di fascia media
- **Mai inventare**: P.IVA, recensioni, anno di fondazione, numeri di clienti, brand trattati. Tutto ciò → `TODO-CLIENTE` elencato nel README finale.

---

## 17. DEFINITION OF DONE

- [ ] Home, Donna, Uomo, Curvy, PDP, Carrello, Checkout, Esito, Negozio, Legali, Admin: tutte funzionanti
- [ ] Carrello persistente, coupon, soglia spedizione gratuita, ritiro in negozio
- [ ] Stripe integrato con fallback demo se manca la chiave
- [ ] Ordine salvato a DB + email di conferma + tracking ordine
- [ ] Tema nero coerente su ogni pagina, 0 elementi illeggibili
- [ ] Hero animato + reveal scroll + 360° sul prodotto icona, con reduced-motion
- [ ] Responsive perfetto 360 / 768 / 1440 / 1920
- [ ] Lighthouse mobile ≥ 90 performance
- [ ] README con: come si aggiunge un prodotto, env var richieste, `TODO-CLIENTE`, `TODO-ASSET`
- [ ] Commit su branch dedicato + deploy Vercel di preview

## 18. COSA NON FARE

Framework/CMS, Bootstrap o Tailwind CDN, lorem ipsum, immagini stock generiche non a tema, popup che coprono l'hero all'ingresso, carosello automatico in hero, dati legali inventati, chiavi segrete nel repo, sezioni "belle ma inutili" (timeline aziendale, contatore animato, team di 6 persone).

## 19. OUTPUT ATTESO

1. Cartella `arabesque/` completa e navigabile in locale (`npx serve arabesque`)
2. README operativo
3. Un riassunto finale con: cosa è pronto, cosa manca dal cliente, 5 test A/B da fare dopo il lancio

**Procedi in autonomia. Non fermarti a chiedere conferme su dettagli estetici: decidi con criterio CRO, documenta le scelte nel README e consegna il lavoro finito.**
