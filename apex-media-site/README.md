# Apex Media — sito infoapex.eu

Sito di Apex Media, agenzia di marketing per attività locali ad Alessandria.
Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, animazioni GSAP (ScrollTrigger, SplitText) e Lenis su desktop.
Deploy su Vercel: ogni push su `main` pubblica il sito.

## Avvio in locale

```bash
cd apex-media-site
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run lint
```

## Dove si cambiano i contenuti

Tutti i testi stanno in `src/data/`. I componenti non vanno toccati.

| File | Cosa contiene |
|---|---|
| `site.ts` | contatti (WhatsApp, email), città, link di navigazione, anno del footer |
| `portfolio.ts` | i clienti del portfolio con settore, lavoro svolto, link e screenshot |
| `services.ts` | i 4 servizi, i passaggi del metodo, i 3 numeri della sezione Metodo |
| `pricing.ts` | i 3 pacchetti: nome, prezzo, voci, etichetta "Il più scelto" |
| `faq.ts` | domande e risposte |
| `team.ts` | Alex e Federico: nome, ruolo, foto |
| `contact.ts` | le voci dei menu a tendina del form (servizio, budget) |

### Pacchetti

In `pricing.ts` ogni pacchetto è un oggetto con `name`, `price` (numero, il simbolo € viene aggiunto da solo),
`features` (lista di voci), `cta` (testo del bottone) e `formValue` (voce che viene preselezionata nel form).
`highlight: true` mette la striscia tricolore e l'etichetta `badge` sul pacchetto consigliato.

### FAQ

In `faq.ts` aggiungi o togli oggetti `{ q: "Domanda?", a: "Risposta." }`. L'ordine del file è l'ordine in pagina.

### Team

In `team.ts` la sezione "Chi siamo" compare solo quando entrambi i membri hanno una foto.
Metti le foto (verticali, proporzione 3:4, WebP) in `public/team/` e compila:

```ts
{ name: "Alex Fania", role: "Strategia e clienti", photo: { src: "/team/alex.webp", width: 1200, height: 1600 } }
```

## Aggiungere un cliente al portfolio

1. Fai gli screenshot del sito del cliente (desktop 1440×900, mobile 390×844, pagina intera) e salvali in WebP
   in `public/work/` con i nomi `<slug>-desktop.webp`, `<slug>-mobile.webp`, `<slug>-full.webp`.
   Lo script usato per i clienti attuali: Playwright + sharp, dimensioni finali 1600×1000, 640×1385, 1200×(altezza).
2. In `src/data/portfolio.ts` aggiungi un oggetto all'array `portfolio`:

```ts
{
  slug: "nome-cliente",
  name: "Nome Cliente",
  sector: "Settore, città",
  work: "Cosa abbiamo fatto, in una riga",
  url: "https://sito-del-cliente.it",
  domain: "sito-del-cliente.it",
  caption: "sito-del-cliente.it — cosa mostra l'hero",
  shots: { ...shot("nome-cliente"), full: { src: "/work/nome-cliente-full.webp", width: 1200, height: 5800 } },
}
```

   `height` del full è l'altezza reale del file a pagina intera (serve per lo scorrimento dentro la cornice).
3. Il cliente compare da solo nella rotazione dell'hero, nella barra clienti, nella griglia "Lavori" della home
   e nella pagina `/portfolio`. L'ordine dell'array è l'ordine in pagina.

## Tracciamento

- Vercel Analytics e Speed Insights sono sempre attivi (senza cookie).
- Eventi personalizzati (vedi `src/lib/track.ts`): `click_whatsapp` (posizione), `form_submit` (servizio, budget),
  `click_email`, `click_portfolio` (cliente), `click_pacchetto` (pacchetto), `click_cta` (posizione).
  Un elemento si traccia aggiungendo `data-track="nome_evento"` e, se serve, `data-track-posizione="..."`.
- GA4 e Meta Pixel si attivano solo con le variabili d'ambiente `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID`
  (vedi `.env.example`) e solo dopo il consenso dal banner cookie. Senza variabili il banner non compare.

## Deploy

Il progetto Vercel `apex-media-site` è collegato al repository GitHub con root directory `apex-media-site/`.

- Push su `main` → deploy di produzione automatico.
- Push su un altro branch → deploy di anteprima con URL dedicato.
- Deploy manuale dalla dashboard Vercel: progetto → Deployments → "Redeploy" sull'ultimo, oppure da terminale
  con `npx vercel --prod` dentro la cartella `apex-media-site/` (serve il login Vercel).

Le variabili d'ambiente si impostano in Vercel → Settings → Environment Variables; dopo averle cambiate serve un nuovo deploy.

## Asset

- `public/work/*.webp` — screenshot reali dei siti dei clienti
- `public/clients/*.webp` — materiale dei clienti così come fornito (loghi a colori)
- `public/brand/apex-logo-original.webp` — logo originale in cristallo
- `src/app/icon.svg`, `src/app/apple-icon.png` — favicon e icona iOS ricavate dal marchio
- `src/app/opengraph-image.tsx` — immagine di anteprima social generata a runtime (1200×630)

## Pannello risultati (`/login`, `/admin`, `/jenny`)

Pannello dei risultati di Essenza d'Oriente, su **Vercel Postgres** (Drizzle ORM, schema in `src/db/schema.ts`: `clicks`, `bookings`, `monthly_notes`, `monthly_adspend`, `settings`). Il sito statico manda i click a `POST /api/track`.

- `/login`: un solo campo password. `ADMIN_PASSWORD` → admin (modifica), `CLIENT_PASSWORD` → cliente (sola lettura, si apre in cinese). Cookie httpOnly 30 giorni, 5 tentativi al minuto.
- Contenuto: 4 numeri del mese con confronto al mese precedente, andamento 12 mesi, contatti per giorno, sorgenti, canali, blocco Treatwell (lordo, commissione impostabile, netto, scontrino medio, nuovi/ritorno, 12 mesi, top 5), note del mese IT/中文, dettaglio prenotazioni ordinabile, export PDF (`/stampa`, via Salva come PDF del browser).
- Import report Treatwell Connect (CSV) con anteprima e dedup: nomi, telefoni ed email non vengono salvati, solo un hash per il dedup e il flag nuovo/ritorno.
- Testi in `src/i18n/pannello/it.json` e `zh-CN.json`. Identità visiva in `src/app/(pannello)/pannello.css`. 3D (react-three-fiber) solo desktop, SVG statico altrove.

### Database

1. Vercel → progetto `apex-media-site` → Storage → Create Database → **Postgres** → Connect: Vercel aggiunge le variabili `POSTGRES_*`.
2. In locale: `vercel env pull .env.local`, poi `npm run db:push` applica lo schema. Da rifare a ogni modifica di `src/db/schema.ts`.
3. Senza database (test): `DB_LOCAL_DIR=./.pglite npm run db:push` e `DB_LOCAL_DIR=./.pglite npm run dev` usano PGlite.
4. Senza nessuna variabile: **modalità demo**, Postgres in memoria con 12 mesi di dati di esempio (`src/db/demo.ts`), banner "Modalità demo" nel pannello. Dopo `npm run db:sql` lo schema SQL della demo si rigenera da `src/db/schema.ts`.

Variabili d'ambiente richieste: `POSTGRES_*` (generate da Vercel), `ADMIN_PASSWORD`, `CLIENT_PASSWORD`. Opzionale `TRACK_ALLOWED_ORIGINS`. Deploy: ogni push su `main` pubblica; a mano `vercel --prod`.

## Studio (`/studio`)

Area riservata di Apex Media: l'ufficio 3D degli agenti, i conti e i lavori. Si apre da `/studio` con una password (cookie httpOnly 30 giorni, 5 tentativi al minuto).

- **Ufficio**: scena 3D (react-three-fiber) di 46×34 m in marmo e ottone, con muro e insegna LED di Apex Media: Regia, sala Strategia & Funnel a vetri (Sofia, Marco, Elena, Davide attorno a un tavolo ovale in marmo, schermo con i numeri delle campagne), Cassa, Contenuti, Studio video, Tavolo social (Chiara, Simone, Alice: Instagram, TikTok, Facebook), area relax, giardino con prato, albero fiorito e panchine, spa all'aperto sulla terrazza (jacuzzi con bolle e lettini: chi è libero ogni tanto ci va), la tua scrivania e un reparto per ogni cliente. Le persone hanno volto, mani e capelli veri e ogni tanto prendono in mano il telefono; gli schermi mostrano l'app del mestiere di ognuno, con testi leggibili. All'apertura la vista è ravvicinata sul centro dell'ufficio; "Tutto" mostra la pianta intera.
- **Team e chat**: a sinistra l'elenco del team diviso per stanza, con lo stato di ognuno (sul telefono è una striscia di volti in alto). Tocchi un nome e si apre la chat: ogni messaggio diventa un lavoro, la risposta arriva nella stessa conversazione, e da lì approvi o chiedi una modifica (che può diventare una regola del cervello condiviso). Tutto segue i dati: chi ha un lavoro sta alla scrivania; chi ha qualcosa da dirti cammina lungo i corridoi fino alla tua scrivania e te lo dice in un fumetto; chi è libero va in area relax e ogni 30 secondi cambia posto. Il team porta la divisa Apex con il logo sulla schiena. Su schermi grandi con mouse ci sono anche ombre morbide, occlusione ambientale e bagliore dei LED; sul telefono no, per restare fluido.
- **Promemoria** (campanella in alto e barra "Da fare per te"): lavori consegnati, lavori in scadenza o in ritardo, fatture scadute o in scadenza (te li ricorda Sara, che scrive anche il sollecito), fatture del mese da creare, numeri della campagna mancanti, clienti senza lavori nel mese. "Più tardi" li nasconde fino a domani su quel dispositivo.
- **Reparto cliente**: tocchi un cliente in ufficio e vedi quanto ti paga (gli importi si cambiano con un tocco), cosa c'è da fare diviso per mestiere (piano, post, reel, video, caption, campagne, sito, pubblicazione), fatture da incassare e resa della campagna. "Prepara il mese" crea i lavori standard dai servizi del cliente, con chi li fa e la scadenza; rifarlo non crea doppioni. Le regole sono in `src/lib/studio/piano.ts`.
- **Conti**: entrate ricorrenti, incassato del mese con obiettivo, da incassare e scaduto, grafico a 12 mesi, ultimi incassi; per ogni cliente servizi (prezzo modificabile con un tocco), fatture e resa della campagna. "Crea le fatture del mese" genera una fattura per ogni servizio mensile attivo.
- **Lavori**: bacheca dei lavori degli agenti (da guardare, al lavoro, in coda, fatti), con scadenza.
- **Dati di esempio**: in modalità demo la striscia gialla ha "Cancella i dati di esempio" (bisogna scrivere SVUOTA).

Variabili d'ambiente:

| Variabile | A cosa serve |
|---|---|
| `STUDIO_PASSWORD` | password dello Studio. Se manca vale `ADMIN_PASSWORD`. `CLIENT_PASSWORD` non apre mai lo Studio |
| `ANTHROPIC_API_KEY` | facoltativa: con la chiave gli agenti scrivono davvero (una chiamata a Claude per lavoro). Senza, i lavori restano in coda e lo Studio funziona da bacheca |
| `STUDIO_MODEL` | facoltativa: modello usato dagli agenti (predefinito `claude-opus-5-5`) |

Database: si collega da Vercel → Storage → Neon (Postgres). Il codice legge `POSTGRES_URL` o, se manca, `DATABASE_URL`. Stesse tabelle Postgres del pannello più le `studio_*` (`clienti`, `servizi`, `fatture`, `campagne`, `lavori`, `regole`), definite in `src/db/schema.ts`. **Si creano da sole al primo accesso** (`src/lib/studio/dati.ts`), non serve `db:push`. Senza database parte la modalità demo con tre clienti e importi di esempio.

Dove si cambia cosa:

- agenti, reparti, istruzioni, pianta dell'ufficio e percorsi: `src/lib/studio/agenti.ts`
- promemoria: `src/lib/studio/promemoria.ts`
- lavori creati da "Prepara il mese": `src/lib/studio/piano.ts`
- conti e formule: `src/lib/studio/calcoli.ts`
- chiamata a Claude: `src/lib/studio/claude.ts`
- scena 3D: `src/components/studio/scena/` (`Scena.tsx` composizione e telecamera, `Arredi.tsx` mobili e zone, `Stanze.tsx` sala Strategia, tavolo social, palme e ulivi, `Esterni.tsx` giardino e spa all'aperto con la jacuzzi, `Scrivanie.tsx` computer tutto-in-uno, portatili e oggetti da scrivania, `schermi.ts` le app disegnate sugli schermi, `Personaggio.tsx` e `corpo.ts` persone, volti, capelli, divise e pose). Con `?alta=1` nell'indirizzo la qualità resta al massimo, con `?leggera=1` resta leggera
- team a sinistra e chat: `src/components/studio/Team.tsx`
- stile: `src/app/(studio)/studio.css`

Se un cliente ha il dominio del sito compilato e quel sito manda i click a `/api/track`, i numeri della campagna (contatti, spesa, prenotazioni) arrivano da soli dal tracciamento; quelli inseriti a mano hanno la precedenza.
