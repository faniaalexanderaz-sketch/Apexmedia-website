# App nativa Essenza d'Oriente — Guida rapida

Tre prompt da dare a **Claude Code sul Mac**, uno alla volta e in ordine. Ogni prompt parte solo quando il precedente è finito e funziona nel simulatore.

| # | File | Cosa costruisce | Tempo indicativo |
|---|------|-----------------|------------------|
| 1 | `PROMPT-1-fondamenta.md` | Progetto, design system, motore animazioni, database, login vero | 1 sessione |
| 2 | `PROMPT-2-app-cliente.md` | Tutte le schermate del cliente: prenotazione, tessera, premi, menu, quiz, buoni regalo | 1–2 sessioni |
| 3 | `PROMPT-3-area-riservata-e-app-store.md` | Area riservata titolari/terapisti, notifiche, test, preparazione App Store | 1–2 sessioni |

## Prima di iniziare (una volta sola)

1. **Mac con macOS aggiornato** e almeno 30 GB liberi.
2. **Xcode** dall'App Store del Mac. Aprilo una volta, accetta la licenza, poi in *Settings → Components* scarica un simulatore iOS (iPhone 16 Pro va bene).
3. **Node.js LTS** (da nodejs.org) e **Watchman**: nel Terminale `brew install watchman` (se non hai Homebrew: brew.sh).
4. **Claude Code**: `npm install -g @anthropic-ai/claude-code`, poi nel Terminale `claude` e fai il login.
5. **Account Supabase** (supabase.com, gratis) → crea un progetto nuovo "essenza-oriente", regione **Frankfurt (eu-central-1)** per il GDPR. Tieni a portata di mano: Project URL, anon key, service role key, password del database.
6. **Account Resend** (resend.com, gratis fino a 3.000 email/mese) per le email con il codice: verifica il dominio `essenzadoriente.it` (i record DNS vanno su Vercel, dove è gestito il dominio).
7. **Account Expo** (expo.dev, gratis) per le build.
8. Solo per pubblicare: **Apple Developer Program** (99 €/anno) e **Google Play Console** (25 € una tantum).

## Come usare i prompt

1. Crea una cartella vuota, es. `~/Progetti/essenza-oriente-app`, e copia dentro la cartella `assets-brand/` (logo, foto dei trattamenti, volantino: si trovano nel repo `essenza-oriente/foto/` e `essenza-oriente/logo-app/`).
2. Apri il Terminale nella cartella e scrivi `claude`.
3. Incolla **tutto** il testo del Prompt 1. Quando Claude Code chiede le chiavi di Supabase, incollale (non vanno mai scritte nel codice: finiscono nel file `.env`).
4. A fine prompt, Claude Code apre l'app nel **simulatore iPhone** con `npx expo run:ios`. Provala. Se qualcosa non va, scriviglielo in parole semplici.
5. Solo quando è tutto ok → Prompt 2 → poi Prompt 3.

## Comandi utili

- Avviare l'app nel simulatore: `npx expo run:ios`
- Avviare su un iPhone vero collegato via cavo: `npx expo run:ios --device`
- Pannello titolari dal computer (versione web): `npx expo start --web`
- Test automatici: `npm test` · flussi completi nel simulatore: `maestro test .maestro`

## Cosa NON fa il simulatore

- La fotocamera (scanner QR): nel simulatore c'è il campo "inserisci il codice a mano"; il QR si prova su iPhone vero.
- Le notifiche push reali: si provano su iPhone vero con una build di sviluppo.
- Face ID: si simula da menu *Features → Face ID* del simulatore.
