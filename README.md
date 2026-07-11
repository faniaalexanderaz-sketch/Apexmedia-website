# Apex Media

Sito vetrina di Apex Media, agenzia di social media. Next.js (App Router) +
TypeScript + Tailwind CSS v4.

## Sviluppo

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Struttura

- `src/app` — pagine: Home (`/`), Servizi (`/servizi`), Portfolio
  (`/portfolio`), Contatti (`/contatti`)
- `src/components` — Navbar, Footer, Button, Card e componenti condivisi
- `src/app/api/contact` — endpoint del form di contatto (attualmente logga
  le richieste lato server; da collegare a un servizio email/CRM reale
  prima del lancio, es. Resend)
- `public/images` — asset fotografici e logo del brand

## Build

```bash
npm run build
npm run start
```
