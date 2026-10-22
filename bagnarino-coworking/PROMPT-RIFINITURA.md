# Bagnarino Coworking — PROMPT 4: rifinitura "non sembra fatto con l'AI"

> Da incollare in una nuova sessione (oppure da far eseguire a Claude in questa).
> Il sito funziona: prenotazioni, area riservata, Crescita. Questo giro tocca **solo
> l'aspetto e i contenuti della parte pubblica**, senza rompere il motore.

```
Lavora nella cartella `bagnarino-coworking/` del repo Apexmedia-website (leggi prima
README.md, config.js, index.html, styles.css, animazioni.js). Stack invariato: HTML/CSS/JS
senza build, GSAP locale in /vendor, funzioni Vercel in /api. Commenti in italiano.

## Obiettivo
Il logo e l'impianto piacciono. Ma diverse parti "sanno di AI": tutto con lo stesso
carattere, blu troppo elettrico, animazioni tutte uguali (sale dal basso + dissolvenza),
etichette "N° 01" ovunque, effetti decorativi senza scopo. Il risultato deve sembrare
il sito di un negozio vero di Alessandria dal 1983, curato da uno studio: sobrio,
caldo, premium. Ogni scelta deve aiutare a prenotare (CRO prima dell'estetica).

## 1. Palette: blu spento e premium (sostituisci i token in :root)
- Blu notte desaturato, non elettrico: --notte #141C26 · --inchiostro #1F2B3A ·
  --inchiostro-2 #34465C (niente blu saturi tipo #173A7A / #23468C).
- Ocra più caldo e meno giallo: --ocra #B98A45 · --ocra-vivo #CFA160 · --ocra-testo #7D5A22.
- Fondi: carta #F3EEE6, avorio #FAF7F1. Bianco puro solo dentro le card.
- Gradienti al massimo tra due toni vicini (es. #1F2B3A → #141C26). Vietati bagliori
  radiali colorati, glow azzurri, ombre colorate.
- Verifica contrasto AA su tutti i testi (testo ocra su chiaro = --ocra-testo).

## 2. Caratteri: coppia, non uno solo
- Titoli e numeri grandi: un serif contemporaneo con personalità, NON Newsreader.
  Proposta: **Fraunces** (variabile, asse "opsz", SOFT 0–30, pesi 500–600), ospitato in
  /fonts come gli altri (fontsource). Corsivo usato solo per 1–2 parole d'accento per pagina.
- Testi e interfaccia: **Plus Jakarta Sans** (già presente).
- Etichette piccole: Jakarta 600 maiuscoletto spaziato, niente monospace.
- Prezzi e cifre in Fraunces con numeri tabellari. Precarica solo i file usati sopra la piega.

## 3. Cosa TOGLIERE (sono i segnali "template AI")
- Le etichette "N° 01 —— Il luogo" su ogni sezione: sostituiscile con un occhiello
  semplice solo dove serve, o niente.
- Il "nastro" che scorre (ticker): via.
- Il manifesto con le parole che si colorano scorrendo: via. Al suo posto un paragrafo
  breve e vero, scritto come parlerebbe Marcella.
- La cifra "Tessere da socio: 0" e in generale le 4 cifre a griglia: tieni al massimo
  2 dati forti (es. "Dal 1983" e "€25 al giorno, tutto incluso").
- I numeri romani "i. ii. iii." nella sezione Per chi è.
- "Immagine illustrativa" ripetuto: una sola nota discreta in fondo alla pagina finché
  non arrivano le foto vere. Riduci le foto AI al minimo (vedi punto 6).
- Doppioni di inviti: un solo invito principale per schermata (la barra in basso c'è già).

## 4. Cosa RIFARE
### 4a. "La nostra storia" (oggi è un riquadro blu elettrico)
Trasformala in una sezione su carta chiara, stile archivio di negozio:
- linea del tempo ORIZZONTALE su computer (verticale su telefono) con 4 tappe:
  1983 · Concessionario Olivetti · Corso Lamarmora 46 · Oggi;
- anni in Fraunces grandi, testi brevi in Jakarta, filo sottile ocra;
- per ogni tappa uno spazio per una foto d'archivio vera (cornice tipo polaroid/scontrino
  con bordo dentellato); finché non c'è, un'icona disegnata a tratto (macchina da scrivere,
  insegna, vetrina, scrivania) — niente immagini generate;
- animazione legata allo scorrimento (GSAP scrub): il filo si disegna mentre scorri e
  ogni tappa si accende quando il filo la raggiunge. Niente "sale dal basso".
### 4b. Card dei prezzi
Mantieni prezzo grande + servizi sotto, ma: niente card blu con glow per la formula
consigliata → card avorio con bordo ocra spesso 2px e nastrino "Consigliata"; prezzi in
Fraunces; spunte ocra sottili invece del verde.
### 4c. Pulsanti
Rilievo più discreto: gradino 2px, niente riflesso che scorre, niente effetto magnetico.
Primario blu notte pieno, secondario contorno. Stati premuto/focus chiari.
### 4d. Animazioni (meno ma migliori)
- Una "firma" sola: l'apertura (foto che si assesta lentamente, titolo che compare per
  righe) e la linea del tempo legata allo scorrimento.
- Il resto: comparsa quasi impercettibile (opacità 0→1, 12px, 0.6s) o niente.
- Vietati: rotazioni 3D delle card, tilt al passaggio del mouse, contatori su tutto,
  parole che salgono una a una in ogni titolo.
- GSAP parte al primo gesto (già così) e rispetta "riduci movimento".

## 5. Cosa AGGIUNGERE (contenuti che convertono)
1. **"Ti accoglie Marcella"**: foto vera della titolare (da scattare), 2 righe in prima
   persona, numero diretto. È la prova che dietro c'è una persona: alza la fiducia.
2. **"Una giornata da noi"**: 4 momenti con orario (9:30 arrivi e ti sistemi · 11:00 caffè ·
   13:00 pausa pranzo in centro · 18:30 chiudi il portatile), ciascuno con un vantaggio concreto.
3. **"Sulla tua scrivania"**: elenco onesto di cosa c'è (presa, lampada, wi-fi, stampa,
   cassettiera solo per la fissa) e cosa NON c'è. Riduce le domande su WhatsApp.
4. **Offerta prima volta**: "Prima giornata? Prova a €25, se torni entro 7 giorni la
   seconda è a €20" — DA CONFERMARE con Marcella prima di pubblicarla (lascia il blocco
   spento in config.js finché non c'è l'ok).
5. **Recensioni Google**: sezione già predisposta (recensioniAttive), da accendere con
   3 recensioni vere + media stelle; mai recensioni inventate.

## 6. Foto
- Elenca in README una lista di scatti per lo shooting Apex Media (10 foto: vetrina da
  fuori, 1 scrivania da vicino, sala intera luce naturale, dettaglio stampante Olivetti,
  Marcella al banco, mani su tastiera, portici di corso Lamarmora, ecc.).
- Fino ad allora: hero con la foto attuale ma più scura e desaturata, ed elimina le altre
  foto AI dove non portano informazioni (scrivania dall'alto, macchina da scrivere già tolta).

## 7. Vincoli e collaudo
- Non toccare /api, admin, prenota.js oltre allo stile condiviso. `npm test` deve restare verde.
- Dopo ogni modifica a CSS/JS: `python3 strumenti/versiona.py` (versioni dei file).
- Playwright su iPhone SE, iPhone 13, 768 e 1440: nessuno scroll orizzontale, nessun
  errore JS, nessun elemento lasciato invisibile dalle animazioni. Screenshot prima/dopo
  di ogni sezione cambiata.
- Lighthouse mobile ≥ 95 prestazioni, 100 accessibilità/best practice/SEO.
- Deploy: Vercel gratuito ha 100 deploy/giorno per tutto il team → raggruppa tutto in
  UN solo commit su main e UN solo deploy a fine lavoro.
- Consegna: elenco in 5 righe di cosa è cambiato + screenshot telefono di home, prezzi, storia.
```
