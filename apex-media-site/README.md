# Apex Media — sito infoapex.eu

Next.js (App Router) + TypeScript + Tailwind CSS 4. GSAP, @gsap/react e Lenis sono installati per la fase 2.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Dove si cambiano i contenuti

Tutti i testi stanno in `src/data/`:

- `site.ts` — contatti, link di navigazione
- `portfolio.ts` — clienti, screenshot (`/public/work`)
- `services.ts` — servizi, passaggi del metodo, numeri
- `pricing.ts` — pacchetti e prezzi
- `faq.ts` — domande frequenti
- `team.ts` — Alex e Federico (la sezione "Chi siamo" compare solo quando ci sono le foto)
- `contact.ts` — voci del form

## Asset

- `/public/work/*.webp` — screenshot reali dei siti dei clienti (desktop 1440×900, mobile 390×844, pagina intera)
- `/public/clients/*.webp` — materiale dei clienti così come fornito
- `/public/brand/apex-logo-original.webp` — logo originale in cristallo
