# Apex Media

## Instagram skills (`/ig-*`)

The voice profile lives in the repo at `.claude/instagram/voice.md`. The skills
look for it at `~/.claude/instagram/voice.md`, which does not survive between
cloud sessions. Before running any `/ig-*` skill:

```bash
mkdir -p ~/.claude/instagram && cp -n .claude/instagram/*.md ~/.claude/instagram/
```

After a skill writes or updates `voice.md`, `swipe.md` or `log.md` in
`~/.claude/instagram/`, copy the file back into `.claude/instagram/` and commit
it.

`hookscore.py` is tuned on English: for Italian hooks use it only to discard
obviously weak options, not to pick the winner.

## Studio (`/studio`)

L'area riservata del titolare: ufficio 3D degli agenti AI, conti, clienti e
lavori. Vive nel sito Next.js in `apex-media-site/` ed è online su
https://infoapex.eu/studio (password: variabile `STUDIO_PASSWORD` su Vercel).
Ogni merge su `main` la pubblica (progetto Vercel `apex-media-site`).

Prima di toccarla leggi `apex-media-site/README.md`, sezione "Studio", e
`apex-media-site/AGENTS.md`: questa versione di Next.js (16.4) è diversa da
quella che conosci, le guide sono in `node_modules/next/dist/docs/`.

Dove sta cosa:

- `src/lib/studio/`: `agenti.ts` (pianta dell'ufficio, stanze, percorsi,
  agenti e istruzioni), `dati.ts` (lettura e tutte le azioni), `promemoria.ts`,
  `piano.ts` ("Prepara il mese"), `claude.ts` (chiamata all'AI: Claude se c'è
  `ANTHROPIC_API_KEY`, altrimenti Gemini con `GEMINI_API_KEY`, in `gemini.ts`),
  `regole.ts` (regole fisse del cervello e tono confidenziale con Alex),
  `calcoli.ts`
- `src/components/studio/`: `StudioApp` (guscio, campanella), `Ufficio`
  (scena, promemoria, reparto cliente), `Team` (elenco a sinistra e chat),
  `Conti`, `Lavori`, `Moduli`, `scena/` (3D: `Scena`, `Arredi`, `Stanze`,
  `Personaggio`, `base`, `Piante3D` per i modelli 3D, `Statico` che unisce gli
  oggetti fermi), `Joystick` (telefono)
- modelli 3D: in `public/studio/3d/`, presi da Poly Haven (CC0) e compressi con
  `npx @gltf-transform/cli@4 optimize ... --compress meshopt --texture-compress webp --texture-size 512 --simplify`;
  mentre caricano si vede la versione disegnata, gli oggetti piccoli non fanno ombra
- stile: `src/app/(studio)/studio.css`

Database: Postgres (Neon dal Marketplace di Vercel), letto da `POSTGRES_URL`
o `DATABASE_URL`. Le tabelle `studio_*` si creano e si aggiornano da sole al
primo accesso: una colonna nuova va aggiunta anche in `aggiungiColonne` di
`dati.ts`. Senza database parte la modalità demo (dati di esempio in
`src/db/demo.ts`). Gli agenti scrivono davvero solo con `ANTHROPIC_API_KEY` o
`GEMINI_API_KEY` (oggi c'è la seconda).

La telecamera si muove da sola solo quando il titolare sceglie una zona o una
persona: non agganciarla a dati che cambiano (agenti, fumo, giro del relax).

Come lavorare con il titolare:

- Rispondi in italiano, diretto e pratico: non è uno sviluppatore e usa
  spesso il telefono. Spiega i passaggi su Vercel uno per uno.
- Aggiungi e migliora, non riscrivere da zero. Se una modifica tocca il sito
  pubblico o i pannelli `/admin` e `/jenny`, chiedi prima.
- Per ogni modifica: `tsc`, `eslint`, `next build`, prova nel browser con
  Playwright (1440×900 e 390×844, `STUDIO_PASSWORD` di prova in locale),
  poi push diretto su `main` (il titolare non vuole PR: va pubblicato
  subito) e controllo che la versione nuova sia online.
- Vercel (piano gratuito) fa al massimo 100 deploy al giorno: spingi solo
  su `main`, non anche sul branch di lavoro (ogni push è un deploy), e
  raggruppa le modifiche in pochi push.
- Il repo è collegato a più progetti Vercel e ogni push li fa partire tutti:
  il limite di deploy si raggiunge in fretta. Se un push su `main` non crea
  il deploy, avvialo a mano con `create_deployment` usando lo SHA completo
  del commit di `main` (quello corto viene rifiutato).
- Il titolare non può scaricare né mandare file: tutto il lavoro lo fai tu,
  con modelli da librerie libere scaricabili senza account o costruiti nel
  codice.
- Niente copie di marchi o giochi esistenti (loghi Apple, PlayStation, GTA):
  design originali che danno la stessa sensazione.
- Il controllo Netlify `dulcet-raindrop` fallisce da prima dello Studio: non
  blocca il merge.

### Prossimi lavori sullo Studio (richiesti dal titolare)

La grafica è ancora troppo indietro: va resa molto più moderna, definita e di
alta qualità, sia su computer sia su telefono, senza renderla lenta sul telefono.

1. Personaggi molto più realistici, rifatti nel codice: proporzioni da
   adulti, volti con naso, occhi e bocca, capelli curati, mani, divise Apex
   con pieghe e dettagli, donne e uomini diversi. Tenere tutte le animazioni,
   attività e percorsi esistenti, rendendoli più fluidi.
2. Scrivanie moderne con computer tutto-in-uno sottili e portatili in stile
   Mac (senza loghi veri), tastiere, mouse, oggetti da lavoro.
3. Schermi che funzionano davvero: contenuti animati, nitidi e leggibili
   (caption che si scrivono, grafici delle campagne, montaggio, calendario).
   I ragazzi ogni tanto prendono il telefono con lo schermo acceso.
4. Giardino interno molto più bello: piante vere, prato, sentieri, panchine
   di design, luci.
5. Zona spa all'aperto accanto al giardino: jacuzzi con acqua animata e
   bolle, lettini, asciugamani, luci calde. Chi è libero ogni tanto ci va,
   si siede in acqua e poi torna.
6. Materiali, luci e rifiniture di livello premium.
