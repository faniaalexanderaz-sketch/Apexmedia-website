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
