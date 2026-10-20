# PROMPT 1 di 3 — Fondamenta: progetto, design system, animazioni, database, login

Copia da qui in giù e incollalo in Claude Code.

---

Sei un team senior: iOS/React Native engineer, product designer, motion designer e backend engineer Postgres/Supabase. Costruiamo l'app ufficiale di **Essenza d'Oriente — Centro Olistico** (Alessandria) da pubblicare su **App Store e Google Play**. Livello atteso: app da agenzia da 10.000 €, che sembra fatta da Apple. Questo è il **prompt 1 di 3**: fondamenta. Non costruire ancora le schermate complete del cliente (prompt 2) né l'area riservata (prompt 3), ma prepara tutto perché si innestino senza rifare nulla.

Lavora in modo autonomo: pianifica, crea, esegui typecheck/lint/test, apri il simulatore e verifica a schermo. Chiedimi solo le chiavi (Supabase, Resend) quando servono. Non scrivere mai chiavi nel codice: `.env` + `app.config.ts` + secrets delle edge functions.

## 1. Il cliente (dati reali, non inventarne altri)

- Essenza d'Oriente — Centro Olistico · 东方之心养生馆
- Via San Lorenzo 46, 15121 Alessandria (AL), a due passi dal Duomo
- Tel e WhatsApp: +39 331 715 3533
- Aperto **7 giorni su 7, 09:30–22:30**, anche domeniche, festivi e Natale
- 5,0 ★ su Google, 146 recensioni · "Il centro olistico più recensito di Alessandria"
- Terapisti: **Jenny** e **Luca**
- Pagamento in sede: contanti, carta, bancomat. Nessuna carta richiesta per prenotare.
- Social: instagram.com/essenza.oriente · tiktok.com/@essenzaoriente.al · Facebook
- P.IVA 14409690964
- Claim: "Un piccolo rifugio d'Oriente nel cuore di Alessandria" · "Vieni come sei: al resto pensiamo noi" · "Durata e prezzo sempre in chiaro"

## 2. Obiettivi di business (guidano ogni scelta)

1. Far tornare i clienti più spesso (da una visita ogni 2–3 mesi a una al mese).
2. Spostare le prenotazioni da Treatwell/telefono all'app (canale diretto, zero commissioni).
3. Alzare lo scontrino medio (upsell durata ed extra).
4. Raccogliere contatti e consenso alle notifiche.

## 3. Stack (obbligatorio)

- **Expo** (ultima SDK stabile), **React Native New Architecture**, **TypeScript strict**, **Expo Router** (file-based, typed routes). Build di sviluppo con `expo-dev-client` (serve per Skia, fotocamera, notifiche): si avvia con `npx expo run:ios`.
- Animazioni: **react-native-reanimated** (ultima stabile, worklet sul thread UI, 120 Hz su ProMotion), **react-native-gesture-handler**, **@shopify/react-native-skia** (shader, gradienti animati, particelle, path che si disegnano, effetti olografici), **expo-haptics**, **expo-blur**, **react-native-svg**. Lottie solo se davvero serve.
- **GSAP non gira nelle app native** (funziona solo nel browser). Implementa quindi un piccolo **motore "stile GSAP"** in `src/motion/` sopra Reanimated: `timeline()` con posizioni relative ("<", "+=0.2"), `stagger`, `fromTo`, easing nominati, `SplitText` nativo (testo diviso in lettere/parole animabili), `DrawPath` (path SVG/Skia che si disegna con strokeDashoffset/`end`), `Flip`/elemento condiviso tra schermate. Così le coreografie si scrivono come in GSAP ma girano native a 60–120 fps. Sul pannello web dei titolari (prompt 3) si può usare GSAP vero.
- Dati: **@supabase/supabase-js**, **TanStack Query** con persistenza offline su **react-native-mmkv**, **zod**, **react-hook-form**, **date-fns** (locale `it`, fuso `Europe/Rome`).
- Sessione: storage sicuro con **expo-secure-store** (adapter per supabase-js), `persistSession: true`, `autoRefreshToken: true`, refresh quando l'app torna in primo piano (AppState).
- Altro: expo-image, expo-linear-gradient, expo-font, expo-splash-screen, expo-notifications, expo-camera, expo-calendar, expo-sharing, expo-local-authentication, expo-apple-authentication, expo-web-browser/auth-session (Google), react-native-qrcode-svg.
- Qualità: ESLint + Prettier, Jest + React Native Testing Library, **Maestro** per i test end-to-end nel simulatore. Script npm: `typecheck`, `lint`, `test`, `e2e`.

Struttura cartelle:
```
app/            route Expo Router: (auth), (onboarding), (tabs), gestione/ (prompt 3)
src/ui/         componenti del design system
src/motion/     motore animazioni stile GSAP + preset
src/theme/      token, temi dinamici, tipografia
src/lib/        supabase, query client, utility (date, prezzi, telefono)
src/features/   auth, booking, loyalty, treatments, notifications, staff
supabase/       migrations/, functions/, seed.sql, templates/ (email)
assets-brand/   logo, foto (già presente)
```

## 4. Design system "Essenza" (il brand reale, da rispettare)

### Colori base (token)
```
pergamena #D6E6C0  sfondo principale (salvia chiaro dal logo)
pergamenaScura #C6DBA9
salvia #DCE9D5     superfici/card
salviaScura #9FB894 bordi, stati disattivi
bosco #2C5138      primario: titoli, bottoni, tab attiva
boscoScuro #22402C tessera, header scuri
ink #2A3A2E        testo forte
testo #4C5A4E      testo corrente
oro #B99A45        punti, sigilli, premi, livelli
oroChiaro #D9C68C  bagliori, progress
cuore #C0392B      SOLO per il 心 (firma del brand), mai per errori
whatsapp #1FA855   solo bottone WhatsApp
linea rgba(44,81,56,.16)
```
Niente nero puro, niente bianco puro come sfondo, niente verde lime.

### Colori che cambiano (tema vivo)
Il tema non è statico. Crea `ThemeProvider` con transizioni animate (interpolazione colore su Reanimated, 1,2 s) tra:
1. **Ciclo del giorno** (automatico sull'ora locale):
   - *Alba* 06–11: pergamena luminosa, riflessi oro chiaro, luce che entra da in alto a destra.
   - *Giorno* 11–17: palette base.
   - *Tramonto* 17–20: pergamena che scalda verso ambra/miele, oro più intenso, ombre più lunghe.
   - *Notte* 20–06: tema scuro "bosco" (sfondo #16261B, superfici #22402C, testo #E8EFE0, oro brillante), candele: bagliore caldo pulsante lento.
2. **Livello fedeltà**: la tessera e gli accenti cambiano tinta — *Germoglio* verde salvia, *Bambù* verde giada con filo d'oro, *Loto* rosa-oro iridescente. Al passaggio di livello: transizione cromatica a tutto schermo.
3. **Modalità scura di sistema**: se l'utente ha iOS in scuro, usa sempre la palette Notte.
4. **Sfondo vivo**: gradiente "mesh" su Skia che si muove lentissimo (macchie di luce oro e salvia che respirano, 20–30 s per ciclo), con grana leggera tipo carta di riso. Si ferma quando l'app è in background e con "Riduci movimento".
Rispetta sempre il contrasto WCAG AA in ogni tema (verificalo con una funzione di test).

### Tipografia (font locali con expo-font)
- **Cinzel** 600/700: nome del brand, livelli, titoli cerimoniali.
- **Fraunces** (variabile, anche corsivo): titoli display, numeri dei punti (cifre tabellari).
- **Cormorant Garamond** 600/700: titoli di sezione, nomi dei trattamenti.
- **Lato** 400/700: testo e interfaccia.
- **Noto Serif SC**: solo per 东方之心养生馆.
Scala: 34 / 28 / 22 / 18 / 16 / 14 / 12. Supporta Dynamic Type (fino a +2 livelli senza rompere i layout).

### Logo
File in `assets-brand/logo-app-scelto.png`. Ricostruiscilo **identico in vettoriale** (react-native-svg) come componente `<Logo variant="full | horizontal | emblem" tone="color | gold | light" />`:
- emblema: loto oro a linee sottili dentro doppio cerchio (esterno bosco, interno oro) con fogliolina di bambù oro in basso a sinistra;
- "ESSENZA D'ORIENTE" in Cinzel, bosco;
- "CENTRO OLISTICO" maiuscolo spaziato oro tra due linee sottili;
- "东方之心养生馆" con il 心 bianco dentro un cuore rosso.
Ogni tratto dell'emblema è un path separato, così si può **disegnare** in animazione. Genera da qui: icona app iOS/Android (emblema oro su bosco scuro, anche versione adaptive Android e icona "dark/tinted" di iOS 18), splash screen nativo.

### Forma e materia
Raggio 14 card, 22 bottom sheet, pillola per i bottoni. Ombre verdi morbide (mai grigie). Divisori sottili "bambù". Sigillo in stile timbro cinese (rosso/oro) per premi e offerte. Icone lineari tratto 1.5 (lucide-react-native), colore bosco. Aree di tocco ≥ 44 pt. Safe area rispettata ovunque: tab bar e bottoni in basso appoggiati subito sopra l'indicatore Home, senza fasce vuote.

### Componenti da creare ora (con varianti, stati e storie di esempio in una schermata `/_catalogo` visibile solo in sviluppo)
Button (primary con riflesso oro, secondary, ghost, whatsapp; stati pressed/disabled/loading), Card, LoyaltyCard (struttura, la logica nel prompt 2), TreatmentCard, TimeSlot, Chip/Filtro, Sigillo, BottomSheet (trascinabile, flick per chiudere), TabBar personalizzata, Header che si comprime, Toast, Skeleton (shimmer salvia), EmptyState, ErrorState con "Riprova", OfflineBanner, OtpInput (6 caselle), Avatar, Badge, Counter animato, Accordion, Segmented control, Switch con molla.

## 5. Motore animazioni (`src/motion/`) — la firma dell'app

Preset riutilizzabili, tutti con alternativa semplice (dissolvenza) se "Riduci movimento" è attivo:
- `easing.essenza` = bezier(0.2, 0.8, 0.2, 1); `spring.molla` = morbida con leggero rimbalzo; `spring.secca` per le micro-interazioni.
- **Transizioni dal dito**: ogni navigazione registra il punto toccato; la nuova schermata si apre con una maschera circolare che si espande da lì (Skia clip o MaskedView), la precedente arretra (scala 0,96, opacità 0,6).
- **Elemento condiviso**: foto della card trattamento che vola e diventa l'header del dettaglio (Reanimated shared transitions o implementazione propria con misure).
- **Pressione bottoni**: scala 0,96 con molla, onda (ripple) dal punto toccato, haptic leggero; bottone primario con **riflesso oro** diagonale ogni 4 s (shader Skia o gradiente animato); effetto magnetico leggero che segue il dito.
- **Testo**: `SplitText` (lettere che salgono con stagger 25 ms), contatori numerici che "rotolano".
- **Path che si disegnano** (`DrawPath`): usato per logo, icone della tab attiva, spunta di conferma.
- **Particelle** Skia: polvere d'oro (max 40, solo quando visibile), petali di loto per i premi.
- **Haptics** coerenti: selezione = `selectionAsync`, successo = `notificationAsync(Success)`, errore = `Warning`.
Regole: solo trasformazioni e opacità (o Skia), nessun ricalcolo di layout durante le animazioni, micro-interazioni 150–250 ms, momenti "wow" 500–900 ms. Le animazioni guidano l'attenzione verso Prenota e Riscatta, non distraggono. Profila con il Performance Monitor: 60 fps minimi su iPhone 12.

**Splash animato** (da fare ora): splash nativo bosco scuro → l'emblema si disegna tratto per tratto (1,2 s) → "ESSENZA D'ORIENTE" sale lettera per lettera → le linee di "CENTRO OLISTICO" si allungano → il cuore 心 pulsa una volta → dissolvenza verso onboarding o Home. Durante lo splash si ripristina la sessione (niente flash della schermata di login).

## 6. Backend Supabase (progetto nuovo del cliente, regione Frankfurt)

Usa la **Supabase CLI** con migrazioni versionate in `supabase/migrations/` (`supabase link`, `supabase db push`). Replica questo schema, che è quello già collaudato nella versione precedente dell'app. **RLS attiva su tutte le tabelle.**

### Tipi
- `app_role`: cliente, staff, admin
- `booking_status`: confermata, completata, annullata, no_show
- `ledger_reason`: benvenuto, visita, premio, amica, compleanno, rettifica
- `redemption_status`: attivo, usato, scaduto
- `referral_status`: in_attesa, completato

### Tabelle
- **profiles** (id = auth.users.id, nome, cognome, telefono, email, data_nascita, pref_terapista, pref_pressione, allergie, note, consenso_privacy_at, consenso_marketing_at, prima_volta_chiusa, codice_amica unico, quiz_result jsonb, expo_push_token, created_at)
- **user_roles** (user_id, role app_role) — ruoli MAI sul profilo; funzioni `has_role(uid, role)` e `is_staff(uid)` SECURITY DEFINER
- **treatments** (id text slug, nome, breve, sottotitolo, descrizione, benefici text[], per_chi, come_si_svolge, cosa_indossare, avvertenze, categoria [massaggi|brevi|piedi], varianti jsonb [{min, price}], durata_slot, minuti_consigliati, foto, tag, extra bool, abbinato_a, attivo, ordine)
- **therapists** (id, nome, attivo, ordine) — seed: Jenny, Luca
- **opening_hours** (weekday 0–6, apre, chiude, chiuso) — seed: tutti i giorni 09:30–22:30
- **closures** (giorno, fino, dalle, alle, motivo, therapist_id nullable)
- **bookings** (cliente_id, treatment_id, minuti, extra text[], therapist_id nullable, inizio, fine, stato, prezzo, importo_pagato, nota, gravidanza, redemption_id, omaggio_benvenuto, da_app, creato_da, motivo_annullamento, created_at, updated_at)
- **slot_occupancy** (booking_id, therapist_id, inizio, fine) — mantenuta da trigger, con **vincolo di esclusione** (`btree_gist`, `tstzrange`) che impedisce sovrapposizioni per terapista anche con prenotazioni simultanee
- **points_ledger** (cliente_id, punti ±, motivo, booking_id, nota, creato_da, created_at) — il saldo è SEMPRE la somma, mai salvato altrove; il client non può inserire righe
- **rewards** (id, nome, dettaglio, punti, valore, treatment_id, attivo, ordine) — seed: r250 "Trattamento da 25 € in omaggio" 250 pt · r400 "Upgrade Riflessologia 40→60 min" 400 pt · r600 "Massaggio Oli Essenziali 60 min" 600 pt · r900 "Massaggio Spa 90 min" 900 pt
- **redemptions** (cliente_id, reward_id, codice univoco, stato, scade_il = +30 gg, usato_il, validato_da)
- **referrals** (invitante_id, invitata_id, stato, punti_accreditati)
- **gift_vouchers** (cliente_id, codice, treatment_id, importo, destinatario, messaggio, stato richiesto|pagato|usato, payment_provider, payment_reference, pagato_il, usato_il)
- **notifications** (cliente_id, tipo, titolo, testo, booking_id, dedup_key unica, read_at, created_at)
- **client_notes** (cliente_id, nota, updated_by) — solo staff
- **staff_audit** (attore, azione, cliente_id, booking_id, dettagli jsonb) — scritto dai trigger
- **app_settings** (riga unica id=1: punti_per_euro 1, soglia_bambu 300, soglia_loto 800, molt_bambu 1.25, molt_loto 1.5, punti_benvenuto 50, punti_amica 100, punti_compleanno 50, offerta jsonb {attiva, titolo, testo, treatment_id, prezzo, prezzo_pieno})

### Seed trattamenti (listino reale)
| id | nome | categoria | varianti |
|----|------|-----------|----------|
| oli-essenziali | Massaggio Oli Essenziali (cervicale e schiena), tag "Più scelto" | massaggi | 60 min 60 € |
| tuina-shiatsu | Tuina Shiatsu | massaggi | 50 min 50 € |
| massaggio-spa | Massaggio Spa (corpo completo) | massaggi | 90 min 90 € |
| riflessologia | Riflessologia Plantare | piedi | 40 min 35 € · 60 min 50 € (consigliato 60) |
| coppettazione | Coppettazione (Cupping) | brevi | 25 € (slot 30 min) |
| gua-sha | Gua Sha | brevi | 25 € (slot 30 min) |
| pulizia-orecchie | Pulizia delle Orecchie (cǎi ěr 采耳) | brevi | 25 € (slot 30 min) |
| pedicure | Pedicure stile tradizionale cinese (xiūjiǎo 修脚) | piedi | 35 € (slot 45 min) |
I testi completi delle schede sono nel prompt 2: per ora metti descrizione breve.

### Funzioni Postgres (RPC, SECURITY DEFINER, `search_path` fisso, controllo ruolo dentro)
Cliente: `my_loyalty()` (saldo, livello sugli ultimi 12 mesi, prossimo premio, punti mancanti), `qr_token()` (token firmato HMAC con segreto in `vault`/tabella privata, scadenza 30 s, mai l'id in chiaro), `available_slots(treatment, minuti, extra[], giorno, therapist, exclude)` (apertura − chiusure − occupazione, slot ogni 30 min, niente passato, minimo 1 h di anticipo, "Indifferente" = basta un terapista libero), `booking_price()`, `booking_duration()`, `create_booking(...)` (applica il Gua Sha omaggio alla prima prenotazione da app una sola volta, premio se passato, transazione atomica), `cancel_my_booking(id)` e `reschedule_my_booking(id, inizio, therapist)` (solo fino a 12 h prima), `redeem_reward(reward)` (controllo saldo + scalare punti atomico + codice), `apply_referral(codice)`, `request_gift_voucher(...)`, `my_notifications()`, `read_notifications(id)`.
Staff (prompt 3, ma crea ora le firme): `staff_complete_booking(id, importo)` → `_award_visit` (punti = importo × punti_per_euro × moltiplicatore livello; bonus amica alla prima visita completata dell'invitata, una volta), `staff_set_booking_status`, `staff_cancel_booking(id, motivo)`, `staff_reschedule_booking`, `staff_create_booking`, `staff_walkin_visit`, `staff_resolve_qr(token)`, `staff_validate_redemption(codice)`, `staff_set_gift_status`, `staff_clients(q)`, `staff_dashboard()`, `admin_adjust_points(cliente, punti, nota)` (motivo obbligatorio), `admin_set_staff_role(user, ruolo)`, `admin_staff_list()`.
Trigger: `handle_new_user` (crea profilo, ruolo cliente, 50 punti benvenuto una sola volta, codice amica), sincronizzazione `slot_occupancy`, notifiche cliente su prenotazione/punti, audit su bookings/ledger/redemptions.
Job giornaliero con **pg_cron** `daily_loyalty_maintenance()`: scadenza premi, punti compleanno, scadenza punti dopo 12 mesi senza visite, promemoria del giorno dopo.

Scrivi **test SQL** (pgTAP o script) che provano: un cliente non legge dati di altri; un cliente non può inserire punti; due prenotazioni sullo stesso slot/terapista → la seconda fallisce; il premio scala i punti una sola volta anche con due richieste simultanee.

## 7. Autenticazione (vera, niente codici finti)

- **Login senza password con codice a 6 cifre via email** (`signInWithOtp({ email, options: { shouldCreateUser: true } })` senza redirect, poi `verifyOtp({ email, token, type: 'email' })`). Stesso flusso per registrazione e accesso.
- **Template email** in `supabase/templates/` per Magic Link, Confirm signup, Email change, Reauthentication, tutti con **`{{ .Token }}` grande al centro e nessun link**, oggetto "Il tuo codice Essenza d'Oriente: {{ .Token }}", logo, colori del brand, "Scade tra 10 minuti. Se non sei stato tu, ignora questa email.", indirizzo e telefono in fondo. Configurali in `supabase/config.toml` e spiegami come caricarli sul progetto remoto. OTP: 6 cifre, scadenza 600 s.
- **SMTP personalizzato con Resend** dal dominio `essenzadoriente.it` (mittente `Essenza d'Oriente <ciao@notify.essenzadoriente.it>`): dammi i record DNS da aggiungere (il dominio è gestito su Vercel) e i passaggi per impostare l'SMTP in Supabase.
- **Accedi con Apple** (obbligatorio per App Store se offri Google) e **Continua con Google**.
- Login con **SMS** (+39) già predisposto dietro un flag, da attivare con Twilio più avanti.
- `OtpInput`: 6 caselle, autofocus, incolla del codice intero, `textContentType="oneTimeCode"` (iOS suggerisce il codice dalla mail), timer "Rinvia tra 60 s", errori chiari in italiano (codice errato, scaduto, troppi tentativi).
- Dopo il primo accesso: **Completa il profilo** (nome, cognome, telefono, data di nascita facoltativa, consenso privacy obbligatorio, consenso marketing facoltativo).
- **Sessione persistente**: chi entra resta dentro finché non preme "Esci". Onboarding solo al primo avvio.
- Guardie di navigazione: senza sessione → login; profilo incompleto → completa profilo; ruolo staff/admin → accesso anche a `/gestione` (prompt 3).
- **Account di revisione per Apple**: prevedi un utente `review@essenzadoriente.it` con login a password nascosto (5 tocchi sul logo nella schermata di accesso) e dati di esempio, da comunicare ad Apple in fase di revisione.

## 8. Schermate di questo prompt

1. Splash animato (sezione 5).
2. Onboarding 3 passi swipe con parallasse: "50 punti subito e un Gua Sha in omaggio alla prima prenotazione dall'app" · "Come funziona: prenoti, vieni, accumuli punti, scegli il tuo premio" · "Attiva le notifiche: promemoria e premi, mai spam" (richiesta permesso solo qui, dopo il tocco).
3. Login con email + codice, Apple, Google.
4. Completa il profilo.
5. Guscio con tab bar (Home · Prenota · Tessera al centro in oro · Premi · Profilo) con schermate segnaposto eleganti (non "Lorem ipsum": titolo, icona, "In arrivo nel prossimo passaggio") che il prompt 2 sostituirà.
6. Profilo minimo: dati, Esci, **Elimina account** (obbligatorio per Apple: edge function `delete-account` che cancella i dati personali e l'utente).

## 9. Consegna di questo prompt

- `npm run typecheck`, `npm run lint`, `npm test` puliti; test SQL verdi.
- App avviata nel **simulatore iPhone 16 Pro** e in un iPhone SE (schermo piccolo): splash, onboarding, login vero con codice ricevuto davvero per email, profilo, tab bar, cambio tema (forza alba/tramonto/notte da un menu di sviluppo), nessuna fascia vuota in basso.
- Flusso Maestro `login.yaml` che arriva fino alla Home.
- `README.md` con: come avviare, variabili d'ambiente, come applicare migrazioni e template email, record DNS per Resend.
- Dimmi in 10 righe cosa hai fatto, cosa devo fare io (chiavi, DNS) e cosa resta per il prompt 2.
