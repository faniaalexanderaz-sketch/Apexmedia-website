# Star Clean

Sito di Star Clean, impresa di pulizie di Alessandria. Obiettivo unico: richieste di preventivo e chiamate.

Next.js (App Router) + TypeScript + Tailwind. Deploy su Vercel, lead su Vercel Postgres, notifica email con Resend.

## Avvio

```bash
npm install
npm run dev
```

Senza database e senza Resend il modulo funziona lo stesso in demo: il lead finisce solo nei log del server.

## Deploy su Vercel

1. Nuovo progetto dal repo, **Root Directory** `star-clean`.
2. Storage, crea un database Postgres e collegalo al progetto. `POSTGRES_URL` arriva da sola. La tabella `leads` si crea al primo invio (schema in `db/schema.sql`).
3. Imposta le variabili di `.env.example` (`RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `RESEND_FROM`, `NEXT_PUBLIC_SITE_URL`, più GA e Ads se servono).

## Dove si cambia cosa

| Cosa | File |
| --- | --- |
| Telefono, dati legali, zone, interruttore demo | `content/sito.ts` |
| Testi delle tre pagine servizio | `content/servizi.ts` |
| Casi prima/dopo e relative foto | `content/casi.ts`, foto in `public/foto/` |
| Recensioni | `content/recensioni.ts` |
| Domande frequenti | `content/faq.ts` |
| Scelte del modulo (comuni, fasce m²) | `lib/lead.ts` |

## Prima di andare online

Finché `demo: true` in `content/sito.ts` il sito non è indicizzabile e mostra le recensioni di esempio con un'etichetta. Per pubblicare:

- [ ] Telefono vero in `content/sito.ts`
- [ ] Ragione sociale, P.IVA, sede, PEC, email
- [ ] Foto reali: hero, tre servizi, casi prima/dopo (stessa inquadratura, formato 4:3)
- [ ] Recensioni Google reali con nome e data, `esempio: false`. Se non ci sono, lista vuota e la sezione sparisce
- [ ] Conferma del titolare su: elenco "cosa è incluso", risposte FAQ su prodotti e assicurazione, "risponde Jonathan Germanò"
- [ ] Privacy policy riletta da chi segue la privacy del cliente
- [ ] Logo vettoriale al posto del marchio tipografico (`components/Logo.tsx`)
- [ ] `demo: false`

## Tracciamento

- `/preventivo` e gli altri moduli leggono `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` e li salvano col lead. Esempio per il QR del biglietto da visita: `/preventivo?utm_source=biglietto&utm_medium=qr`.
- `/grazie` invia l'evento `generate_lead` una sola volta e solo se si arriva dal modulo. Con `NEXT_PUBLIC_ADS_CONVERSIONE` invia anche la conversione Google Ads.
