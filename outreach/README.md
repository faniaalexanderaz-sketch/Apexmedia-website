# Outreach Alessandria — Apex Media

Sistema per contattare attività di Alessandria che hanno un sito rotto, lento,
vecchio o inesistente, e proporre una demo gratuita + call o visita in negozio.

Mittente: **apex.info.studio@gmail.com** (Gmail collegato).
Cadenza: **20 email al giorno**, con approvazione prima dell'invio.

---

## Il flusso

1. **Ricerca** — si cercano attività della zona e si individua il loro sito.
2. **Audit** — si apre il sito e si verifica il problema. *Nessun invio senza un
   problema verificato*: è l'unica cosa che fa aprire una mail da uno sconosciuto.
3. **Riga in `prospects.csv`** — con `scenario` e `dettaglio` (il problema, in una frase).
4. **`node outreach/build-email.mjs --limit 20`** — genera le email in `outreach/out/`.
5. **Approvazione** — le email vengono mostrate prima di partire.
6. **Invio** — via Gmail, poi `stato` passa a `inviato` e si compila `data_invio`.

## `prospects.csv`

| colonna | cosa contiene |
|---|---|
| `attivita` | nome del negozio, come lo scrivono loro |
| `citta` | Alessandria o comune della provincia |
| `referente` | nome del titolare se lo si trova, altrimenti vuoto |
| `email` | indirizzo trovato (mai indovinato) |
| `telefono` | per il follow-up |
| `sito` | dominio senza `https://` |
| `scenario` | `sito_down` · `sito_lento_mobile` · `sito_vecchio` · `senza_sito` |
| `dettaglio` | **il problema verificato, in una frase concreta e specifica** |
| `fonte` | dove è stato trovato il contatto |
| `stato` | `bozza` · `pronto` · `inviato` · `risposto` · `no` |
| `data_invio` | compilata all'invio |
| `note` | esito, follow-up, cosa è stato detto |

Solo le righe con `stato = pronto` **e** una `email` finiscono nelle email generate.

### Come si scrive `dettaglio`

Male: "il vostro sito è migliorabile", "il sito non è ottimizzato".
Bene: "Aprendo il sito da telefono il numero di telefono non è cliccabile e il
menu esce fuori dallo schermo", "Il dominio è scaduto il 3 marzo: il sito
restituisce una pagina di errore".

La frase deve essere una cosa che il titolare può verificare in dieci secondi
prendendo in mano il telefono. Se non lo e', il prospect non è pronto.

## Regole di invio

- **20 email al giorno, non di più.** Da un Gmail normale oltre questa soglia
  la casella comincia a finire in spam e si brucia il dominio.
- Un solo follow-up, dopo 4 giorni lavorativi, solo a chi non ha risposto.
- Chi risponde «no» passa a `stato = no` e non viene più contattato.
- Mai lo stesso testo a due prospect della stessa via nello stesso giorno.

## File

- `email-template.html` — struttura HTML, con i segnaposto `{{...}}`
- `copy.mjs` — i testi, uno per scenario
- `build-email.mjs` — genera `out/*.html` e `out/manifest.json`
- `out/` — output rigenerato a ogni run, non versionato

## Scelte di conversione (perchè il template è così)

- **Fondo chiaro, poco HTML, zero immagini nel corpo.** Una cold email che
  sembra una newsletter finisce in Promozioni e non viene mai letta. Deve
  sembrare una mail scritta da una persona, con sopra il marchio.
- **Una sola CTA** (WhatsApp, dove i titolari rispondono davvero), con la
  risposta alla mail come alternativa nella riga sotto.
- **Sotto le 130 parole.**
- **Riga di opt-out in fondo**: è corretto verso il destinatario e riduce le
  segnalazioni come spam, che sono la cosa che brucia davvero la casella.
