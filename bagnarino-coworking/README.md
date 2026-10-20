# Bagnarino Coworking — sito pubblico (fase 1)

Web app vetrina del coworking di Bagnarino S.r.l., corso Lamarmora 46, Alessandria.
Mobile-first, HTML + CSS + JavaScript vanilla: **nessun framework e nessun build step**,
quello che c'è nella cartella è quello che va online.

In questa fase la prenotazione funziona in **modalità dimostrativa**: calendario e posti
sono finti ma realistici, e alla conferma il cliente invia la prenotazione su WhatsApp con
un messaggio già compilato (così nessuna richiesta vera va persa). Appena in fase 2 le API
`/api/disponibilita` e `/api/prenota` rispondono, il sito passa da solo alla modalità reale.

## Provarlo in locale

```bash
npx serve bagnarino-coworking
```

Apri l'indirizzo indicato (di solito http://localhost:3000). In locale `sitemap.xml` e
`robots.txt` non esistono: li genera una funzione di Vercel (vedi sotto).

## Struttura

| File | A cosa serve |
|---|---|
| `config.js` | **Tutti i dati in un punto solo**: azienda, contatti, WhatsApp, orari, postazioni, listino, fidelity, testi dei messaggi, chiusure, codici GA4/Meta |
| `index.html` | Home: hero con "pianta di oggi", fiducia, prezzi, come funziona, spazio, Bagnarino Card, per chi è, dove siamo, FAQ, CTA finale |
| `prenota.html` + `prenota.js` | Flusso di prenotazione in 3 passi (formula → giorno → dati), conferma, file calendario `.ics` |
| `main.js` | Script comune: legge `config.js` e riempie la pagina, festivi, posti liberi, link WhatsApp/telefono, mappa a richiesta, dati strutturati (LocalBusiness + CoworkingSpace + FAQPage), utm |
| `animazioni.js` | Animazioni leggere: GSAP + ScrollTrigger caricati **dopo** la pagina, solo sotto la piega. Rispetta "riduci movimento" |
| `cookie.js` | Banner cookie: compare solo quando in `config.js` ci sono i codici GA4 o Meta Pixel |
| `styles.css` | Stili (palette e font del brand) |
| `privacy.html`, `cookie.html`, `404.html` | Pagine legali e pagina non trovata |
| `api/seo.js` | Genera `sitemap.xml` e `robots.txt` leggendo il dominio da `SITO_URL` |
| `img/` | Logo SVG (chiaro/scuro), monogramma, favicon 32/180/192/512, immagine di condivisione 1200×630 |
| `fonts/` | Manrope e Inter in woff2, ospitati qui (niente Google Fonts) |
| `vendor/gsap/` | GSAP 3.15 + ScrollTrigger in locale |
| `vercel.json` | URL puliti, sitemap/robots, header di sicurezza e cache |

## Come cambiare prezzi, orari e testi

Tutto in `config.js`, senza toccare l'HTML:

- **Prezzi e formule**: `listino` (prezzo, nota, cosa include, testo del pulsante). L'ordine nel file è l'ordine delle card.
- **Formula in evidenza**: `evidenza: true` ed `etichetta` sulla formula scelta.
- **Numero di postazioni**: `postazioni`.
- **Orari**: `orari` (giorni, apertura, chiusura, ora oltre la quale non si prenota più per oggi).
- **Giorni di chiusura**: aggiungi la data in `chiusure`, formato `'2026-12-24'`. I festivi nazionali (Pasquetta compresa) il sito li conosce già.
- **Messaggi WhatsApp precompilati**: `whatsappTesti`.
- **Testi della Bagnarino Card**: `fidelity`.
- **Servizi non ancora confermati** (caffè, climatizzazione) e **sala riunioni**: restano nascosti finché sono `false`; con `true` compaiono.
- **Recensioni**: `recensioniAttive: true` solo dopo aver incollato recensioni Google vere in `index.html` (blocco già pronto, commentato).
- **Posti liberi mostrati in home (fase 1)**: `demo.postiLiberiOggi`.

Le foto: sostituire i blocchi "Foto in arrivo" in `index.html` (sezione `#spazio`) con
`<img>` WebP/AVIF con `width`/`height` e `loading="lazy"`. Mai foto di repertorio.

## Pubblicazione su Vercel

1. Nuovo progetto collegato a questo repository, **Root Directory: `bagnarino-coworking`**, Framework: *Other*.
2. Variabile d'ambiente **`SITO_URL`** = dominio definitivo senza barra finale (es. `https://www.esempio.it`).
   Finché il dominio non è scelto lasciala vuota: sitemap e robots usano l'indirizzo di produzione di Vercel,
   e canonical / Open Graph usano l'indirizzo su cui il sito sta girando. Nel codice non c'è nessun dominio scritto.
3. Le anteprime di Vercel ricevono un `robots.txt` che blocca l'indicizzazione; solo la produzione è aperta a Google.

## Collaudo fatto (fase 1)

- Playwright a 375, 768 e 1440 px su home, prenota, privacy e 404: nessuno scroll orizzontale, CTA sempre in vista
  (barra fissa in basso su mobile, pulsante "Prenota" in testata su desktop), nessun errore JavaScript.
- Flusso completo da mobile: card prezzo → formula già scelta → giorno → validazione errori → conferma →
  messaggio WhatsApp con riepilogo → file `.ics`. Provenienza utm salvata.
- Lighthouse mobile in locale: Prestazioni 100, Accessibilità 100, SEO 100, Best Practices 96
  (l'unico punto perso è la richiesta a `/api/disponibilita` che in fase 1 risponde 404: sparisce in fase 2).
  LCP 1,7 s, CLS 0. Peso home 253 KB (86 KB compressi) esclusi i font.

## Misurazione (pronta per la fase 3)

Gli eventi passano già da un unico punto (`BGN.traccia` in `main.js`): `view_item` (vista prezzi),
`begin_checkout` (apertura prenotazione), `generate_lead` (tocco su WhatsApp o Chiama),
`purchase` (prenotazione confermata in modalità reale). In modalità dimostrativa la conferma genera
`prenotazione_demo`, per non insegnare alle campagne conversioni mai salvate.
GA4 e Meta Pixel si accendono inserendo i codici in `config.js`, solo dopo il consenso cookie.

## Cosa manca (fasi successive)

- **Fase 2**: motore di prenotazione vero (`/api/*`, database, email, promemoria, fidelity digitale, carnet).
- **Fase 3**: area riservata per la titolare, GA4/Meta + Conversions API, report mensile, collaudo finale.

## [DA CONFERMARE] con Marcella Bagnarino prima del lancio

1. **Sala riunioni**: esiste? Quante persone, a che prezzo? (ora nascosta)
2. **Caffè/acqua** a disposizione? (ora nascosto)
3. **Climatizzazione** estiva e riscaldamento? (ora nascosto)
4. **Prezzi IVA inclusa?** Serve dirlo chiaramente, soprattutto a chi ha partita IVA.
5. **Stampe incluse**: c'è un limite di pagine al giorno/mese?
6. **Pagamento con carta (POS)** in sede: confermato? Carnet e mensili si pagano tutti il primo giorno?
7. **Postazione fissa**: quante delle 6 scrivanie sono fisse? La cassettiera ha la chiave?
8. **Disdetta gratis entro le 20:00 del giorno prima**: va bene come regola?
9. **Chiusure**: San Baudolino (10 novembre), ferie estive, ponti.
10. **Parcheggio**: ci sono convenzioni o parcheggi vicini da indicare?
11. **"A due passi dall'ospedale e da Piazza Libertà"**: confermare che sia la descrizione giusta.
12. **Videochiamate**: sono ammesse alle postazioni? (il testo del wi-fi le cita)
13. **Etichetta della card in evidenza**: oggi "La più conveniente" (vera). "La più scelta" solo quando ci saranno dati veri.
14. **Nome "Marcella"** nella schermata di conferma ("Marcella ti blocca il posto"): va bene usarlo?
15. **Foto vere** degli spazi (shooting Apex Media).
16. **Dominio** del sito.
