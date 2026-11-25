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
  `piano.ts` ("Prepara il mese"), `claude.ts` (chiamata a Claude), `calcoli.ts`
- `src/components/studio/`: `StudioApp` (guscio, campanella), `Ufficio`
  (scena, promemoria, reparto cliente), `Team` (elenco a sinistra e chat),
  `Conti`, `Lavori`, `Moduli`, `scena/` (3D: `Scena`, `Arredi`, `Stanze`,
  `Personaggio`, `base`)
- stile: `src/app/(studio)/studio.css`

Database: Postgres (Neon dal Marketplace di Vercel), letto da `POSTGRES_URL`
o `DATABASE_URL`. Le tabelle `studio_*` si creano e si aggiornano da sole al
primo accesso: una colonna nuova va aggiunta anche in `aggiungiColonne` di
`dati.ts`. Senza database parte la modalità demo (dati di esempio in
`src/db/demo.ts`). Gli agenti scrivono davvero solo con `ANTHROPIC_API_KEY`.

Come lavorare con il titolare:

- Rispondi in italiano, diretto e pratico: non è uno sviluppatore e usa
  spesso il telefono. Spiega i passaggi su Vercel uno per uno.
- Aggiungi e migliora, non riscrivere da zero. Se una modifica tocca il sito
  pubblico o i pannelli `/admin` e `/jenny`, chiedi prima.
- Per ogni modifica: `tsc`, `eslint`, `next build`, prova nel browser con
  Playwright (1440×900 e 390×844, `STUDIO_PASSWORD` di prova in locale),
  poi push diretto su `main` (il titolare non vuole PR: va pubblicato
  subito) e controllo che la versione nuova sia online.
- Il controllo Netlify `dulcet-raindrop` fallisce da prima dello Studio: non
  blocca il merge.
