# PROMPT 2 di 3 — App del cliente completa

Copia da qui in giù e incollalo in Claude Code, nella stessa cartella del progetto, dopo che il prompt 1 funziona nel simulatore.

---

Prompt 2 di 3. Le fondamenta sono pronte (design system, motore animazioni in `src/motion/`, temi dinamici, Supabase con schema e RPC, login con codice email, tab bar). Ora costruisci **tutta l'app del cliente**, collegata ai dati reali. Riusa i componenti e le funzioni esistenti: non duplicare, non riscrivere lo schema se non per aggiungere ciò che manca (con nuove migrazioni). Niente dati finti, niente parola "demo", niente modi per il cliente di darsi punti.

Ogni schermata deve servire almeno uno degli obiettivi: tornare più spesso, prenotare dall'app, scontrino medio più alto, contatti e consensi. L'app resta **semplice**: tab bar con 5 voci, il resto nel menu.

## 1. Home

- Header vivo: foto `brand-banner-verticale` con parallasse, sfondo mesh del tema del momento (alba/giorno/tramonto/notte), che si comprime allo scroll (logo da full a horizontal). Hamburger a sinistra, campanella notifiche a destra con badge.
- Saluto: "Buongiorno/Buon pomeriggio/Buonasera, [nome]" + claim "Un piccolo rifugio d'Oriente nel cuore di Alessandria" (SplitText all'apertura del giorno).
- **Mini-tessera** con saldo (contatore che rotola), livello, barra d'avanzamento oro: "Ti mancano 40 punti per un Gua Sha in omaggio". Tocco → Tessera con transizione condivisa.
- **Prossimo appuntamento** reale (giorno, ora, trattamento, terapista, countdown "tra 2 giorni"), azioni: Indicazioni, Aggiungi al calendario, Sposta/Annulla (fino a 12 h prima).
- **Primo posto libero**: "Oggi alle 18:30 · Massaggio Oli Essenziali" calcolato da `available_slots`; pallino verde che pulsa accanto ad "Aperto ora · chiude alle 22:30". Tocco → prenotazione già al passo conferma.
- **Prenota di nuovo**: "Rifai il tuo Tuina Shiatsu" se ha già fatto un trattamento → salta alla scelta dell'orario.
- **Offerta della settimana** (da `app_settings.offerta`, se attiva) con sigillo che si timbra.
- **Trattamenti consigliati**: carosello 3D (le card ruotano in profondità mentre scorri, scala e luce in base alla posizione).
- **Prima volta?** card richiudibile (stato salvato in `prima_volta_chiusa`).
- **Recensioni**: "Il centro olistico più recensito di Alessandria · 5,0 ★ · 146 recensioni" + carosello con le 4 recensioni reali: Ella Grace (Local Guide) "Arrivata dall'Australia, esperienza bellissima: grazie a Jenny e a tutto il team!" · Lily Lily "Gentilezza, pulizia e personale efficiente." · Roberta Massobrio "Accoglienza cordiale e professionale. Riflessologia plantare con Luca, molto bravo." · Mirko "Riflessologia plantare professionale e precisa, rilassamento immediato." + bottone "Leggi tutte su Google".
- Stato nuovo utente (0 visite): "Prenota il tuo primo trattamento: il Gua Sha è in omaggio".
- Pull-to-refresh con il loto che si apre mentre tiri.
- Prima apertura della giornata: 2–3 foglie di bambù che scendono piano nell'header.

## 2. Trattamenti (lista + scheda)

Aggiorna i dati in `treatments` con una migrazione/seed (modificabili poi dall'area riservata):

1. **Massaggio Oli Essenziali** · cervicale e schiena · 60 min · 60 € · "Più scelto". Cos'è: massaggio manuale mirato su collo, spalle e schiena con oli essenziali che sciolgono i muscoli e rendono le manovre più scorrevoli; ideale per tensioni da postura, scrivania e stress. Benefici: allenta le contratture di collo e spalle, più mobilità del collo, rilassamento generale; l'aromaterapia aiuta il benessere psicofisico. Cosa indossare: torso nudo o intimo.
2. **Tuina Shiatsu** · 50 min · 50 €. Cos'è: unisce il Tuina, massaggio tradizionale cinese riconosciuto dall'OMS nel 1998 (dinamico: pressioni, sfregamenti, mobilizzazioni), e lo Shiatsu giapponese (pressione statica di dita e palmi lungo i meridiani). Benefici: scioglie le tensioni, migliora la circolazione, riduce lo stress, rilassa il sistema nervoso. Cosa indossare: si fa vestiti, abiti comodi.
3. **Massaggio Spa** · corpo completo · 90 min · 90 €. Cos'è: massaggio rilassante di tutto il corpo, il trattamento più lungo: puro benessere, non un intervento su una sola zona. Benefici: rilassamento profondo, meno stress, un'ora e mezza tutta per te. Cosa indossare: torso nudo o intimo.
4. **Riflessologia Plantare** · 40 min 35 € / 60 min 50 € (preseleziona 60 "Consigliato"). Cos'è: stimolazione di punti della pianta del piede, ognuno associato a un'area del corpo, tra tradizione cinese e riflessologia occidentale. Benefici: rilassamento, meno stress, sollievo dalle gambe pesanti. Cosa indossare: si tolgono solo le scarpe.
5. **Coppettazione (Cupping)** · seduta breve · 25 €. Cos'è: coppette in vetro, bambù o silicone con effetto ventosa che richiamano circolazione. Benefici: circolazione locale, rilascio delle tensioni, sollievo sulla schiena. Da sapere: segni rotondi rosso-violacei per qualche giorno, normali e temporanei. Sconsigliata: gravidanza, pelle lesa o ferite, fragilità capillare.
6. **Gua Sha** · seduta breve · 25 €. Cos'è: pietra piatta e liscia che scorre sulla pelle generando calore e circolazione; amato anche per il viso. Benefici: rilascio delle tensioni muscolari e connettivali. Da sapere: arrossamenti temporanei. Sconsigliato: problemi di coagulazione o fragilità capillare.
7. **Pulizia delle Orecchie (cǎi ěr 采耳)** · seduta breve · 25 €. Cos'è: tecnica delle case da tè di Chengdu; niente telecamere: cucchiaini e bastoncini in bambù o metallo, pinzette e un morbido piumino finale che vibra leggermente. Benefici: pulizia delicata, leggerezza, relax profondo. Come si svolge: comodamente seduti. Nota: benessere, non medico; per dolore, infezioni o calo dell'udito rivolgiti a un otorino.
8. **Pedicure stile tradizionale cinese (xiūjiǎo 修脚)** · seduta breve · 35 €. Cos'è: arte antica di Pechino, patrimonio culturale: ammollo caldo, poi strumenti dedicati per rifinire calli, duroni e unghie. Benefici: piedi lisci e curati, leggerezza, unghie rifinite con precisione. Nota: estetica, non podologia; con diabete, infezioni o problemi circolatori consulta prima un medico.

- **Lista**: filtri a pillola "Tutti · Massaggi · Trattamenti brevi · Piedi" (indicatore che scivola), ordinamento per durata o prezzo, card con foto, durata, prezzo, "+X punti". Ingresso a cascata.
- **Scheda**: foto grande che arriva dalla card (elemento condiviso), titolo SplitText, prezzo che conta in su, scelta durata se più varianti, sezioni Accordion "Cos'è · Benefici · Come si svolge · Cosa indossare · Da sapere", blocco **"Spesso abbinato a"** (Oli Essenziali + Coppettazione · Riflessologia + Pedicure · Tuina + Gua Sha) con "Aggiungi alla prenotazione", barra fissa in basso "Prenota · 60 €" con riflesso oro. "Durata e prezzo sempre in chiaro".

## 3. Prenota (massimo 4 passaggi, < 60 secondi)

Barra di avanzamento in alto, passi che scorrono orizzontalmente con profondità, swipe indietro.
1. **Trattamento** (saltato se arriva da una scheda o da "Prenota di nuovo").
2. **Giorno e ora**: calendario orizzontale di 14 giorni (giorni senza posti in grigio), griglia orari da `available_slots`, aggiornata in **Realtime** (se uno slot viene preso sparisce con animazione); badge "Ultimi 2 posti stasera" quando vero; scelta facoltativa "Con chi?" Jenny · Luca · Indifferente (preselezionato). Slot scelto: si espande e diventa oro.
3. **Extra (upsell, saltabile)**: "Aggiungi Gua Sha +25 € (+25 punti)", "Passa a 60 min +15 €" (solo se sensato), con prezzo totale che si aggiorna animato.
4. **Conferma**: riepilogo, punti che guadagnerà, premio disponibile da applicare, omaggio Gua Sha se prima prenotazione dall'app, nota per il terapista, **"Sei in gravidanza?"** Sì/No (se Sì e c'è la Coppettazione: avviso gentile e proposta di Riflessologia o Gua Sha), "Paghi in sede: contanti o carta. Nessuna carta richiesta ora", mini "Prima volta?".
- Bottone **Conferma**: si restringe in un cerchio, diventa una spunta che si disegna, esplode in un'onda che apre la schermata di successo.
- **Successo**: 心 rosso che pulsa, riepilogo, "Aggiungi al calendario" (expo-calendar con promemoria), "Indicazioni" (Apple Maps/Google Maps), "Condividi". Alla **prima prenotazione in assoluto**: pioggia di petali d'oro.
- Email di conferma (edge function `booking-email` con Resend: riepilogo, indirizzo, link Maps, allegato `.ics`).
- Sempre visibile, discreto: "Preferisci scriverci? WhatsApp" con messaggio precompilato.
- Errori: slot preso nel frattempo → "Questo orario è appena stato prenotato" + i 3 orari più vicini.

## 4. Tessera "Il Cammino del Loto"

- Card verticale a tutto schermo, tinta del livello (Germoglio salvia · Bambù giada con filo d'oro · Loto rosa-oro iridescente), texture, emblema oro, nome, livello in Cinzel, saldo grande in Fraunces.
- **Olografica**: si inclina in 3D seguendo il dito e il giroscopio (expo-sensors), riflesso oro che scorre in base all'inclinazione (shader Skia), polvere d'oro che fluttua.
- **QR** dinamico da `qr_token()` che si rigenera ogni 30 s con anello-timer; luminosità dello schermo al massimo mentre è aperta (expo-brightness), ripristinata all'uscita.
- Tocco → flip 3D con molla: retro con storico movimenti punti (data, motivo, +/-).
- Sotto: avanzamento di livello ("Ancora 90 punti per diventare Loto: punti x1,5 e regalo di compleanno"), regole del programma in Accordion.
- **Punti in arrivo in tempo reale** (Realtime su `points_ledger`): se l'app è aperta mentre lo staff completa la visita, il **sigillo** cade, si schiaccia come un timbro, polvere d'oro, il saldo rotola, la barra si riempie con un bagliore, haptic di successo. Passaggio di livello → transizione cromatica a tutto schermo + nuovo nome livello in SplitText.
- Pulsante "Aggiungi a Apple Wallet" predisposto (fase successiva: pass `.pkpass` generato da edge function), per ora nascosto dietro flag.

## 5. Premi

- Catalogo da `rewards` con stato bloccato/sbloccato e barra per ciascuno ("Ti mancano 40 punti").
- **Riscatta** → conferma in bottom sheet → `redeem_reward` → il loto dell'emblema si apre petalo per petalo, esplosione di petali d'oro → codice univoco grande + QR, valido 30 giorni, "Mostralo in cassa" → salvato in "I miei premi" (attivi, usati, scaduti).
- Premio attivo applicabile direttamente al passo Conferma della prenotazione.

## 6. Profilo

- Dati modificabili, preferenze (terapista, pressione, allergie agli oli, note), consensi con data, codice amica.
- **I miei appuntamenti**: prossimi e passati; sposta/annulla fino a 12 h prima, dopo solo "Chiama"/"WhatsApp".
- Notifiche: interruttori per promemoria, premi, offerte (max 1 a settimana).
- Info legali (P.IVA, Privacy, Cookie), Esci, Elimina account.
- In fondo, piccolo e grigio: "Area riservata" (prompt 3).

## 7. Menu a hamburger (pochi elementi, ben fatti)

Apertura: le 3 linee diventano una X, il menu scende come un sipario con bordo curvo, voci a cascata con blur che si toglie, loto in alto che si apre lentamente, polvere d'oro. Sfondo bosco scuro (o del tema notte). In alto: emblema + nome + saldo.
Voci (icone lineari oro):
1. **Chi siamo**: foto, storia breve, Jenny e Luca, "Il centro olistico più recensito di Alessandria", 5,0 ★.
2. **Prima volta?** (FAQ in Accordion): ti accogliamo e ti chiediamo preferenze e zone da evitare, nessuna preparazione; asciugamani, teli e ciabattine li forniamo noi; massaggi con olio: torso nudo o intimo, gli altri abiti comodi; arriva 5–10 minuti prima; gravidanza: dillo quando prenoti; sedute da 25 a 90 minuti; pagamento contanti o carta.
3. **Quale trattamento fa per me?** quiz in 3 domande con card grandi che si capovolgono (Dove senti tensione? Collo e spalle / Tutto il corpo / Gambe e piedi / Voglio solo staccare · Quanto tempo hai? 30 / 60 / 90 min · Preferisci? Pressione decisa / Delicata / Non so) → risultato con loto che si apre, foto che si espande, perché è adatto, "Prenota questo". Salva in `quiz_result`.
4. **Regala un trattamento**: trattamento o importo (30 / 50 / 90 €), nome di chi lo riceve, messaggio → anteprima del buono che si apre come una busta (flap 3D) con riflesso olografico → "Paga in sede o richiedi su WhatsApp" (messaggio precompilato) via `request_gift_voucher`; struttura pronta per Apple Pay/Stripe in futuro. Condivisione del buono come immagine.
5. **Porta un'amica**: codice grande, Condividi (share sheet nativo) con messaggio precompilato, contatore amiche e punti guadagnati. Inserimento codice di un'amica (`apply_referral`) nella schermata Completa profilo.
6. **Recensioni**.
7. **Come arrivare e orari**: mappa nativa (react-native-maps), "Aperto ora · chiude alle 22:30" dal database, Indicazioni / Chiama / WhatsApp.
8. **Contattaci** · 9. **Seguici** (Instagram, TikTok, Facebook) · 10. **Privacy e Cookie**.
In fondo: firma 心 rossa e "Un piccolo rifugio d'Oriente nel cuore di Alessandria".

## 8. Notifiche

- In app: campanella → lista da `my_notifications` (prenotazione confermata, punti accreditati, premio sbloccato, promemoria), segna come lette, badge che rimbalza e campanella che oscilla all'arrivo.
- **Push** con expo-notifications: salva `expo_push_token` nel profilo (solo con consenso); edge function `send-push` chiamata da trigger/cron per: promemoria 24 h e 2 h prima, punti accreditati, premio sbloccato, punti in scadenza (30 gg prima), "ci manchi" dopo 30 giorni senza visite, slot serali liberi dell'ultimo minuto solo per Bambù/Loto. Massimo 2 push a settimana per cliente (tranne promemoria). Tocco sulla push → apre la schermata giusta (deep link).

## 9. Micro-dettagli da app vera

- Skeleton in salvia con shimmer mentre arrivano i dati; mai spinner grigi.
- Offline: banner "Sei offline", dati già visti leggibili dalla cache, azioni in coda o disabilitate con spiegazione.
- Toast in italiano per ogni azione; errori con "Riprova", mai schermate bianche (Error Boundary con il loto).
- Tastiera: campi che restano visibili, "Avanti" passa al campo successivo, "Fine" chiude.
- Accessibilità: VoiceOver con etichette in italiano su ogni elemento, Dynamic Type, contrasto AA in tutti i temi, "Riduci movimento" rispettato.
- Testi: tono caldo e calmo, si dà del tu, niente gergo tecnico.

## 10. Consegna

- Typecheck, lint e test puliti; nuovi test per prezzi, durata, livelli, quiz, gravidanza/coppettazione.
- Flussi Maestro: `prenota.yaml` (dalla Home alla conferma), `premio.yaml`, `quiz.yaml`, `regalo.yaml`.
- Verifica nel simulatore su iPhone 16 Pro, iPhone SE e iPad (layout centrato elegante), in tutti e 4 i temi, con testo grande: nessun testo tagliato, nessuna fascia vuota in basso, 60 fps.
- Dimmi in 10 righe cosa hai fatto e cosa resta per il prompt 3.
