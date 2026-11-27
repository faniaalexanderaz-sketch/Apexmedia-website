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
| Testi e FAQ delle cinque pagine servizio | `content/servizi.ts` |
| Materiali dei pavimenti ("Che pavimento hai?", ancore #marmo #cementine #cemento #cotto #parquet) | `content/materiali.ts` |
| Casi prima/dopo e relative foto | `content/casi.ts`, foto in `public/foto/` |
| Recensioni | `content/recensioni.ts` |
| Domande frequenti | `content/faq.ts` |
| Scelte del modulo (servizi, materiali, comuni, fasce m²) | `lib/lead.ts` |
| Colori, caratteri, pulsanti | `app/globals.css` |
| Animazioni (GSAP, caricato dopo il primo disegno) | `lib/gsap.ts`, `components/anim/` |
| Dati strutturati (LocalBusiness + Service) | `lib/datiStrutturati.tsx` |

## Prima di andare online

Finché `demo: true` in `content/sito.ts` il sito non è indicizzabile e mostra le recensioni di esempio con un'etichetta. Per pubblicare:

- [ ] Ragione sociale, sede e PEC in `content/sito.ts`, P.IVA nella variabile `NEXT_PUBLIC_VAT`
- [ ] Prima/dopo: le tre coppie attuali sono immagini generate. Vanno sostituite con foto vere degli interventi (stessa inquadratura, formato quadrato) e `esempio: false` in `content/casi.ts`. Se non ci sono, la sezione sparisce da sola
- [ ] Casi prima/dopo veri anche per vetri e tapparelle, che oggi non ne hanno
- [ ] Recensioni Google reali con nome e data, `esempio: false`. Se non ci sono, lista vuota e la sezione sparisce
- [ ] Conferma del titolare su: elenco "cosa è incluso", risposte FAQ su prodotti e assicurazione, "risponde Jonathan Germanò"
- [ ] Privacy policy riletta da chi segue la privacy del cliente
- [ ] `demo: false`

## Da confermare con il titolare

Nel codice sono segnati con `DA CONFERMARE CON IL TITOLARE`:

- [ ] Resine **epossidiche** per la vetrificazione del cemento (sul foglio c'è scritto "eposilici")
- [ ] Condomini: si fanno o no? Se sì, vanno nelle pulizie industriali (oggi non compaiono)
- [ ] Altezza massima delle vetrine che si puliscono
- [ ] Tempi di asciugatura e durata dei trattamenti dei pavimenti
- [ ] Risposte delle FAQ di ogni servizio (`content/servizi.ts`) e generali (`content/faq.ts`)
- [ ] Il numero WhatsApp è lo stesso del cellulare (`sito.whatsapp`)
- [ ] Foto vere per pulizie civili e tapparelle (oggi c'è un pannello "foto da inserire")

## Link per gli annunci

- Preventivo con servizio e materiale già scelti: `/preventivo?servizio=pavimenti&materiale=cotto` (servizi: `civili`, `industriali`, `pavimenti`, `vetri`, `tapparelle`; materiali: `marmo`, `cementine`, `cemento`, `cotto`, `parquet`)
- Scheda di un materiale già aperta: `/trattamento-pavimenti#marmo`

## Tracciamento

- `/preventivo` e gli altri moduli leggono `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` e li salvano col lead. Esempio per il QR del biglietto da visita: `/preventivo?utm_source=biglietto&utm_medium=qr`.
- `/grazie` invia l'evento `generate_lead` una sola volta e solo se si arriva dal modulo. Con `NEXT_PUBLIC_ADS_CONVERSIONE` invia anche la conversione Google Ads.
