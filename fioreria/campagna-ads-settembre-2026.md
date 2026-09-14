# Campagna Google Ads — Antica Fioreria del Centro (e-commerce, tutta Italia)
**Periodo:** 15 settembre – 14 ottobre 2026 (30 giorni) · **Budget:** €270 (€9/giorno)

Questo file è pensato per essere seguito passo-passo dentro Google Ads, anche se non l'hai mai usato. Tutto il testo da copiare è già scritto: non devi inventare nulla, solo incollare.

Differenza chiave rispetto alla campagna di Essenza d'Oriente: **lì vendevi appuntamenti in una città, qui vendi prodotti in tutta Italia.** Cambia il canale (non solo Ricerca, ma soprattutto Shopping), cambia il modo di misurare (non "prenotazioni" ma **ricavo**), cambia la metrica di successo (non CPA, ma **ROAS** = quanti euro di vendite per ogni euro speso).

---

## 0. Scelta del canale — 3 opzioni, una sola è corretta

| Opzione | Perché sì/no con €9/giorno in tutta Italia |
|---|---|
| **Google Shopping (Standard) + una piccola Ricerca (CONSIGLIATA)** | Shopping mostra **foto + prezzo + nome** prima del click: chi clicca ha già visto cosa compra e quanto costa → CTR alto, CPC basso (€0,15–0,35 nel settore casa/decoro), traffico molto più qualificato. Su un e-commerce di oggetti belli, la foto fa metà del lavoro di vendita. La mini-campagna Ricerca serve a coprire brand e le ricerche esplicite ("fiori artificiali online"). |
| Solo Google Ricerca (testo) | Funziona, ma paghi €0,35–0,70 a click per mostrare solo testo: con €9/giorno fai ~15-20 click/giorno invece di 30-45, e senza foto il click è "freddo". Da usare al 100% **solo se il Merchant Center non parte** (vedi sezione 4). |
| Performance Max / Meta Ads | PMax ha bisogno di ~50 conversioni/mese per ottimizzarsi: con €9/giorno resta in apprendimento tutto il mese e brucia il budget. Meta è ottimo **dopo**, come remarketing verso chi ha già visto i prodotti — non come primo euro speso. |

**Decisione: €6/giorno su Shopping + €3/giorno su Ricerca.**
Niente Display, niente partner di ricerca, niente PMax. Un budget piccolo va concentrato dove c'è intento d'acquisto già formato.

Se dopo 30 giorni il ROAS è ≥ 3, fase 2: porta Shopping a €12/giorno e aggiungi €3/giorno di remarketing (Meta o Display) verso chi ha aggiunto al carrello senza comprare — è lì che si recupera il 10-15% di ordini persi.

---

## 1. Dati negozio (da usare in annunci, estensioni e feed)

- **Nome:** Antica Fioreria del Centro
- **Che cosa vende:** composizioni floreali **artificiali** di pregio, fatte a mano in bottega
- **Storia:** bottega di Alessandria **dal 1953** ← elemento di fiducia forte, va in ogni annuncio
- **Indirizzo:** Via Emilio Faà di Bruno 6, Alessandria (AL) — aperti mar-dom 8:30–19:30
- **Telefono / WhatsApp:** +39 327 337 0547
- **Sito:** https://anticafioreriadelcentro.it/
- **Spedizione:** assicurata in tutta Italia in **48/72h** — €12 formati S/M, €15 formati L/XL
- **Reso:** **gratuito entro 14 giorni**
- **Pagamenti:** carta, Apple Pay, Google Pay, **contrassegno** (+€15) — il contrassegno è un'arma di conversione enorme su un pubblico 45+ che non si fida a pagare online
- **Ritiro gratuito in bottega** ad Alessandria
- **Promozioni attive:** Saldi Estivi fino a −20% · codice **BENVENUTO10** −10% sul primo ordine
- **Prezzi:** da €26 (oggettistica) a €100 circa per le composizioni, con pezzi premium oltre
- **Scontrino medio stimato (AOV):** €85–95 spedizione inclusa

**Pagine già pronte per essere usate come landing:**

| Pagina | URL |
|---|---|
| Home | `https://anticafioreriadelcentro.it/` |
| Collezione completa | `https://anticafioreriadelcentro.it/collezione.html` |
| Novità | `https://anticafioreriadelcentro.it/collezione.html?cat=novita` |
| Regali floreali | `https://anticafioreriadelcentro.it/collezione.html?cat=regali` |
| Decorazioni | `https://anticafioreriadelcentro.it/collezione.html?cat=decorazioni` |
| Anniversario | `https://anticafioreriadelcentro.it/collezione.html?cat=anniversario` |
| Autunno | `https://anticafioreriadelcentro.it/collezione.html?cat=autunno` |
| Bouquet | `https://anticafioreriadelcentro.it/collezione.html?cat=bouquet` |
| Singolo prodotto | `https://anticafioreriadelcentro.it/prodotto.html?p=SLUG` (es. `?p=provenza`) |

**Regola:** ogni gruppo di annunci punta alla categoria giusta, **mai alla home**. Chi cerca "regalo floreale" deve atterrare sulla pagina dei regali, non su una home da esplorare. Coerenza annuncio → landing = conversion rate più alto e CPC più basso (Google premia la pertinenza).

---

## 2. Obiettivo e KPI

- **Obiettivo campagna:** **acquisti sul sito** (ordine completato, carta o contrassegno)
- **CPC medio stimato:** Shopping €0,15–0,35 · Ricerca €0,35–0,70
- **Click stimati nei 30 giorni:** 700–1.100 totali
- **Conversion rate atteso e-commerce di questo tipo:** 0,8–1,8%
- **Ordini stimati nel mese:** 8–16
- **Valore medio ordine:** ~€90
- **Ricavo stimato:** €720–1.400 → **ROAS target: ≥ 3** (€3 di vendite per €1 speso)
- **CPA massimo accettabile:** €25 per ordine (su AOV €90 con margine su prodotto artigianale, regge)

**La metrica che comanda è il ROAS, non il numero di click.** Un gruppo con tanti click e zero ordini va spento senza pietà entro il giorno 12.

KPI da controllare ogni 3-4 giorni: impressioni, CTR, CPC, ordini, valore conversione, ROAS. **Non toccare nulla nei primi 7 giorni** (fase di apprendimento).

---

## 3. Struttura account

```
Account Google Ads
├─ CAMPAGNA A — "AFC – Shopping Italia"          €6/giorno   (66% del budget)
│  ├─ Tipo: Shopping → Campagna Shopping standard (NON "Performance Max")
│  ├─ Collegata a: Google Merchant Center (feed prodotti)
│  ├─ Offerta: "Massimizza i clic" con CPC max €0,35 → dal giorno 10 "ROAS target 300%" se ≥15 conversioni
│  ├─ Priorità campagna: Bassa (default, va bene con una sola campagna Shopping)
│  └─ Gruppi di prodotti: 4 (vedi sezione 4)
│
├─ CAMPAGNA B — "AFC – Ricerca Italia"            €3/giorno   (34% del budget)
│  ├─ Tipo: Ricerca | SOLO Rete di Ricerca (disattiva "Rete Display" e "partner di ricerca")
│  ├─ Obiettivo: Vendite
│  ├─ Offerta: "Massimizza i clic" con CPC max €0,60
│  └─ Gruppi di annunci: 4 (2 attivi subito, 2 in pausa — vedi sezione 5)
│
├─ Località (entrambe): Italia — escludi nulla all'inizio
├─ Opzioni località: "Presenza: persone che si trovano in Italia"
├─ Lingua: Italiano
├─ Budget: standard, MAI accelerato
└─ Estensioni: sezione 7
```

**Perché due campagne separate e non una sola:** budget separati = controllo. Se la Ricerca spendesse tutto il budget comune, lo Shopping (che converte meglio) resterebbe a secco. Con due campagne decidi tu quanto va dove.

---

## 4. CAMPAGNA A — Shopping: Merchant Center e feed prodotti

Questa è la parte che porta più ordini ed è anche l'unica che richiede un po' di lavoro tecnico iniziale. Fallo **prima** di aprire Google Ads.

### 4.1 Crea il Merchant Center (gratis)
1. Vai su [merchantcenter.google.com](https://merchantcenter.google.com) e crea l'account con la stessa email di Google Ads.
2. **Informazioni attività:** nome "Antica Fioreria del Centro", indirizzo Via Emilio Faà di Bruno 6, Alessandria, paese di vendita **Italia**.
3. **Verifica e rivendica il sito:** ti chiede di dimostrare che il sito è tuo. Il modo più semplice: incolla il meta tag che ti dà Google dentro `<head>` di `index.html`, pubblica, poi clicca "Verifica".
4. **Impostazioni spedizione** (obbligatorie, altrimenti i prodotti vengono rifiutati): crea un servizio "Italia – corriere assicurato" con tariffa fissa **€12**, tempo di consegna **2–3 giorni lavorativi**. Se vuoi essere preciso, aggiungi una seconda regola €15 per i formati L/XL, ma per partire va benissimo la tariffa unica €12.
5. **Informazioni su resi:** reso gratuito, 14 giorni. Compilalo: Google lo mostra come badge e alza il CTR.
6. **Collega Google Ads:** Merchant Center → Impostazioni → Account collegati → Google Ads → inserisci l'ID account → poi accetta il collegamento dentro Google Ads.

### 4.2 Il feed prodotti
Non esiste ancora un feed sul sito. Con ~35 prodotti la strada più veloce e affidabile è il **foglio Google**:

Merchant Center → **Prodotti → Feed → "+" → Google Sheets → "Genera un modello di foglio Google"**. Ti crea un foglio con le colonne giuste. Compila una riga per prodotto con queste colonne (le uniche davvero obbligatorie):

| Colonna | Cosa scrivere | Esempio |
|---|---|---|
| `id` | lo slug del prodotto | `provenza` |
| `title` | vedi formula sotto | `Brezza di Provenza — Composizione floreale artificiale con lisianthus e lavanda` |
| `description` | la descrizione lunga già presente sul sito | *(copia da `prodotti.js`, campo `descLunga`)* |
| `link` | URL della pagina prodotto | `https://anticafioreriadelcentro.it/prodotto.html?p=provenza` |
| `image_link` | URL assoluto della foto | `https://anticafioreriadelcentro.it/foto/p-provenza.jpg` |
| `availability` | `in stock` | `in stock` |
| `price` | prezzo formato M con valuta | `75 EUR` |
| `sale_price` | prezzo scontato, se il prodotto è in saldo | `60 EUR` |
| `brand` | sempre uguale | `Antica Fioreria del Centro` |
| `condition` | sempre uguale | `new` |
| `identifier_exists` | sempre `no` (sono pezzi artigianali senza codice a barre) | `no` |
| `google_product_category` | categoria Google | `Casa e giardino > Decorazioni > Fiori artificiali` |
| `product_type` | la tua categoria interna | `Composizioni > Regali floreali` |

**Formula del titolo di prodotto (questa è la leva più sottovalutata dello Shopping):** il titolo del feed è ciò che Google confronta con la ricerca dell'utente. Deve contenere le parole che la gente digita, non solo il nome poetico.

> `[Nome prodotto] — Composizione floreale artificiale [fiore principale] [colore] — [uso/occasione]`

Esempi pronti:
- `Brezza di Provenza — Composizione floreale artificiale con lisianthus, lavanda e limoni, vaso in ceramica`
- `Cuore di Rose — Composizione di rose artificiali rosse a forma di cuore, idea regalo anniversario`
- `Girasoli e Cannella — Centrotavola autunnale con girasoli artificiali e cannella`
- `Giardino Verticale — Pannello di piante artificiali da parete per interni`

Regola: **nome + "artificiale/i" + tipo di fiore + occasione**. Senza la parola "artificiale" o "finti" nel titolo, il prodotto non compare per le ricerche giuste.

7. Dopo il caricamento, Merchant Center impiega **2-3 giorni** ad approvare i prodotti. **Non è un passaggio da fare il giorno del lancio: fallo 5 giorni prima.**

### 4.3 Gruppi di prodotti dentro la campagna Shopping
Dentro la campagna, suddividi per `product_type` (Google Ads → campagna Shopping → Gruppi di prodotti → suddividi per "Tipo di prodotto"):

| Gruppo di prodotti | CPC max iniziale | Perché |
|---|---|---|
| Composizioni €50–100 (il cuore del catalogo) | €0,35 | È il grosso degli ordini, prezzo accessibile |
| Regali e occasioni (cuore di rose, scrigni, anniversario) | €0,35 | Intento regalo = decisione veloce |
| Decorazioni e oggettistica sotto €50 | €0,20 | Prezzo basso, marginalità minore: paga meno il click |
| Premium sopra €150 (bonsai, pezzi unici) | €0,15 | Ciclo di acquisto lungo: non ci si spende budget a settembre |

**"Tutto il resto":** lascialo attivo a €0,15, così nessun prodotto resta invisibile.

### 4.4 Se il Merchant Center non parte in tempo
Piano B senza discussioni: **sposta tutti i €9/giorno sulla Campagna B (Ricerca)** e attiva anche i gruppi 3 e 4 della sezione 5 fin dal giorno 1. Meglio una Ricerca piena che uno Shopping a metà.

---

## 5. CAMPAGNA B — Ricerca: gruppi di annunci, keyword e copy — TUTTO pronto da incollare

**Attenzione — due errori comuni da evitare:**
- **Non copiare i simboli `` ` `` (apice inverso) che vedi intorno agli URL** — servono solo per evidenziare il testo, non fanno parte del link. Copia solo da `https://` fino alla fine.
- **Il campo "URL finale" a livello di singola parola chiave è facoltativo:** lascialo vuoto. Basta l'URL finale dell'annuncio.

**Non confondere le 3 caselle diverse dentro un gruppo di annunci:**
- **Parole chiave** (scheda "Parole chiave") → è dove incolli l'elenco con virgolette `"..."` e parentesi quadre `[...]`. Servono a far apparire l'annuncio. NON vanno scritte dentro l'annuncio.
- **Titoli** (dentro "Crea annuncio") → massimo **30 caratteri ciascuno**. Già verificati uno per uno qui sotto.
- **Descrizioni** (sempre dentro "Crea annuncio") → massimo **90 caratteri ciascuna**. Anche queste già verificate.

Il numero tra parentesi dopo ogni titolo/descrizione (es. "(27)") è la conta caratteri di controllo — **non fa parte del testo, non incollarlo.**

**Quali gruppi attivare subito:** con €3/giorno di Ricerca, **attiva solo il Gruppo 1 e il Gruppo 4 (brand)**. Crea anche il 2 e il 3 ma lasciali **in pausa**: li accendi al giorno 10 solo se il Gruppo 1 sta portando ordini e il budget regge. Quattro gruppi accesi insieme con €3/giorno significa 20 centesimi a testa: non succede niente a nessuno.

---

### Gruppo 1 — Fiori artificiali (generico, il più cercato — ATTIVO dal giorno 1)
**CPC max iniziale:** €0,60 · **Landing:** `https://anticafioreriadelcentro.it/collezione.html`

**Keyword** (crea sia la versione "a frase" tra virgolette sia quella "esatta" tra parentesi quadre):
```
"fiori artificiali"
[fiori artificiali]
"fiori finti"
[fiori finti]
"composizioni floreali artificiali"
[composizioni floreali artificiali]
"fiori artificiali online"
"composizione fiori finti"
"fiori finti belli"
"fiori artificiali di qualità"
"piante artificiali da interno"
"fiori artificiali realistici"
"composizioni floreali finte"
"negozio fiori artificiali online"
"fiori artificiali con vaso"
```

**Titoli (15, ognuno verificato ≤ 30 caratteri):**
1. Fiori Artificiali di Pregio (27)
2. Antica Fioreria dal 1953 (24)
3. Fatti a Mano in Bottega (23)
4. Consegna in 48/72h (18)
5. Spedizione Tutta Italia (23)
6. Reso Gratuito 14 Giorni (23)
7. Saldi fino al -20% (18)
8. -10% con BENVENUTO10 (20)
9. Composizioni da € 26 (20)
10. Sembrano Veri al Tatto (22)
11. Zero Acqua, Zero Cure (21)
12. Paghi Anche alla Consegna (25)
13. Imballo Assicurato (18)
14. Scopri la Collezione (20)
15. Durano per Sempre (17)

**Descrizioni (4, ognuna verificata ≤ 90 caratteri):**
1. Composizioni floreali artificiali fatte a mano in bottega dal 1953. Spedizione 48/72h. (86)
2. Sembrano veri, durano per sempre: niente acqua, niente cure. Reso gratuito 14 giorni. (85)
3. Saldi fino al -20% e -10% sul primo ordine con BENVENUTO10. Scopri la collezione. (81)
4. Carta, Apple Pay, Google Pay o contrassegno. Imballo assicurato in tutta Italia. (80)

**URL finale (SEMPRE con https://):** `https://anticafioreriadelcentro.it/collezione.html`
**Percorso visualizzato (campo separato, mai con https://):** `collezione`

---

### Gruppo 2 — Regali floreali e occasioni (in PAUSA, accendi dal giorno 10)
**CPC max:** €0,60 · **Landing:** `https://anticafioreriadelcentro.it/collezione.html?cat=regali`

**Keyword:**
```
"regalo floreale"
"idea regalo fiori"
"regalo fiori che durano"
"composizione floreale regalo"
"regalo anniversario fiori"
"rose che durano per sempre"
"rose eterne"
[rose eterne]
"rose di sapone"
"regalo per la mamma fiori"
"regalo compleanno donna fiori"
"cuore di rose regalo"
"fiori da regalare a distanza"
"regalo elegante per casa"
```

**Titoli (15, ognuno verificato ≤ 30 caratteri):**
1. Regali Floreali che Durano (26)
2. Antica Fioreria dal 1953 (24)
3. Rose che Non Appassiscono (25)
4. Consegna in 48/72h (18)
5. Confezione Curata a Mano (24)
6. Reso Gratuito 14 Giorni (23)
7. Cuore di Rose e Scrigni (23)
8. -10% con BENVENUTO10 (20)
9. Idea Regalo da € 26 (19)
10. Spedizione Tutta Italia (23)
11. Un Regalo che Resta (19)
12. Paghi Anche alla Consegna (25)
13. Fatti a Mano in Bottega (23)
14. Regalo Già Pronto (17)
15. Scopri le Idee Regalo (21)

**Descrizioni (4, ognuna verificata ≤ 90 caratteri):**
1. Rose, cuori e scrigni floreali che non appassiscono mai. Confezione curata a mano. (82)
2. Il regalo arriva in 48/72h in tutta Italia, imballato e assicurato. Reso gratuito. (82)
3. Composizioni artigianali dal 1953: un regalo che resta in casa per anni, non giorni. (84)
4. -10% sul primo ordine con BENVENUTO10. Paghi con carta o alla consegna. (71)

**URL finale (SEMPRE con https://):** `https://anticafioreriadelcentro.it/collezione.html?cat=regali`
**Percorso visualizzato (mai con https://):** `regali-floreali`

---

### Gruppo 3 — Decorazioni e centrotavola per la casa (in PAUSA, accendi dal giorno 10)
**CPC max:** €0,50 · **Landing:** `https://anticafioreriadelcentro.it/collezione.html?cat=decorazioni`

**Keyword:**
```
"centrotavola fiori artificiali"
"centrotavola autunnale"
"decorazioni floreali casa"
"composizione per tavolo"
"piante finte da arredamento"
"pannello verde da parete"
"giardino verticale artificiale"
"decorazione ingresso casa"
"ghirlanda porta"
"coroncina fiori porta"
"decorazioni autunnali casa"
"centrotavola elegante"
```

**Titoli (15, ognuno verificato ≤ 30 caratteri):**
1. Centrotavola Artificiali (24)
2. Decorazioni Fatte a Mano (24)
3. Antica Fioreria dal 1953 (24)
4. Consegna in 48/72h (18)
5. Giardino Verticale da Parete (28)
6. Coroncine e Ghirlande (21)
7. Reso Gratuito 14 Giorni (23)
8. Saldi fino al -20% (18)
9. Zero Acqua, Zero Cure (21)
10. Decori da € 26 (14)
11. Spedizione Tutta Italia (23)
12. La Casa Cambia Faccia (21)
13. Paghi Anche alla Consegna (25)
14. Pezzi Unici di Bottega (22)
15. Scopri le Decorazioni (21)

**Descrizioni (4, ognuna verificata ≤ 90 caratteri):**
1. Centrotavola, coroncine e pannelli verdi fatti a mano nella bottega dal 1953. (77)
2. Decorazioni che non appassiscono: niente acqua, niente cure, bellezza tutto l'anno. (83)
3. Spedizione assicurata in 48/72h in tutta Italia. Reso gratuito entro 14 giorni. (79)
4. Saldi fino al -20% sulla collezione. Paghi con carta o alla consegna. (69)

**URL finale (SEMPRE con https://):** `https://anticafioreriadelcentro.it/collezione.html?cat=decorazioni`
**Percorso visualizzato (mai con https://):** `decorazioni`

---

### Gruppo 4 — Brand (CPC bassissimo, protezione del nome — ATTIVO dal giorno 1)
**CPC max:** €0,25 · **Landing:** `https://anticafioreriadelcentro.it/`

Serve a non farsi rubare da altri chi cerca già il negozio per nome, e costa pochissimo (pochi centesimi a click) perché sei l'unico pertinente.

**Keyword:**
```
"antica fioreria del centro"
[antica fioreria del centro]
"antica fioreria"
"antica fioreria alessandria"
"fioreria del centro alessandria"
"antica fioreria recensioni"
"antica fioreria online"
```

**Titoli (15, ognuno verificato ≤ 30 caratteri):**
1. Antica Fioreria del Centro (26)
2. Sito Ufficiale (14)
3. Bottega di Alessandria 1953 (27)
4. Composizioni Artificiali (24)
5. Consegna in 48/72h (18)
6. Spedizione Tutta Italia (23)
7. Reso Gratuito 14 Giorni (23)
8. Saldi fino al -20% (18)
9. -10% con BENVENUTO10 (20)
10. Ritiro Gratis in Bottega (24)
11. Paghi Anche alla Consegna (25)
12. Fatti a Mano Uno per Uno (24)
13. Tutta la Collezione Qui (23)
14. Scrivici su WhatsApp (20)
15. Via Faà di Bruno 6 (18)

**Descrizioni (4, ognuna verificata ≤ 90 caratteri):**
1. Sito ufficiale della bottega di Alessandria dal 1953. Composizioni fatte a mano. (80)
2. Spedizione assicurata in 48/72h in tutta Italia o ritiro gratuito in bottega. (77)
3. Carta, Apple Pay, Google Pay o contrassegno. Reso gratuito entro 14 giorni. (75)
4. Saldi fino al -20% e -10% sul primo ordine con il codice BENVENUTO10. (69)

**URL finale (SEMPRE con https://):** `https://anticafioreriadelcentro.it/`
**Percorso visualizzato:** *(lascia vuoto per il gruppo Brand)*

---

### Gruppo 5 — OPZIONALE ma ad altissimo potenziale: commemorazione (ottobre)
Da fine settembre a inizio novembre in Italia esplode la ricerca di **fiori artificiali per il cimitero** in vista di Ognissanti (1 novembre). È il momento dell'anno con più domanda per i fiori finti, con un pubblico che cerca esattamente "che non appassiscano" e compra online senza problemi.

**Attivalo solo se la bottega può realizzare e spedire composizioni adatte (coroncine, vasi da lapide, composizioni resistenti all'esterno).** Se non avete prodotti dedicati, **non attivarlo**: porteresti traffico su una collezione che non risponde alla richiesta, bruciando budget e abbassando il tasso di conversione dell'intero account.

Se invece la risposta è sì: crea il gruppo, prepara una piccola pagina o categoria dedicata, e sposta qui €2/giorno dal 5 al 30 ottobre.

**Keyword:**
```
"fiori artificiali cimitero"
[fiori artificiali cimitero]
"fiori finti per lapide"
"composizioni per cimitero"
"fiori che durano cimitero"
"coroncina per lapide"
"fiori artificiali resistenti esterno"
```

**Titoli (15, ognuno verificato ≤ 30 caratteri):**
1. Fiori per la Commemorazione (27)
2. Composizioni che Durano (23)
3. Antica Fioreria dal 1953 (24)
4. Fatti a Mano in Bottega (23)
5. Consegna in 48/72h (18)
6. Spedizione Tutta Italia (23)
7. Resistono a Sole e Pioggia (26)
8. Coroncine e Composizioni (24)
9. Un Ricordo che Resta (20)
10. Reso Gratuito 14 Giorni (23)
11. Paghi Anche alla Consegna (25)
12. Imballo Assicurato (18)
13. Ordina Entro il 28/10 (21)
14. Materiali di Pregio (19)
15. Scrivici su WhatsApp (20)

**Descrizioni (4, ognuna verificata ≤ 90 caratteri):**
1. Composizioni artificiali di pregio per la commemorazione, fatte a mano dal 1953. (80)
2. Non appassiscono e resistono all'esterno: un ricordo che resta bello tutto l'anno. (82)
3. Spedizione assicurata in 48/72h in tutta Italia. Ordina in tempo per il 1 novembre. (83)
4. Paghi con carta o alla consegna. Reso gratuito entro 14 giorni. (63)

**URL finale:** la categoria o pagina dedicata che create · **Percorso visualizzato:** `commemorazione`

---

## 6. Keyword negative (da inserire subito, a livello di campagna, su ENTRAMBE le campagne)

Su un e-commerce nazionale le negative valgono più che in locale: senza, metà del budget se ne va in ricerche di persone che vogliono fiori **veri**, tutorial o lavoro.

Vai in **Parole chiave → Parole chiave a corrispondenza inversa → a livello di campagna** e incolla:
```
gratis
gratuito
fai da te
come fare
tutorial
youtube
video
lavoro
offerte di lavoro
stipendio
corso
corsi
scuola
formazione
all'ingrosso
ingrosso
grossista
stock
usato
usati
subito.it
wish
temu
shein
amazon
ikea
leroy merlin
funerale
funebre
cuscino funebre
corona funebre
matrimonio noleggio
noleggio
affitto
fiori veri
fiori freschi
consegna a domicilio fiori freschi
significato dei fiori
come coltivare
semi
bulbi
vaso vuoto
```

> Nota su "funerale/funebre": sono escluse perché chi cerca quei termini vuole quasi sempre una **consegna urgente di fiori freschi** in una città specifica, cosa che voi non fate. Diverso è "cimitero" nel Gruppo 5, dove l'intento è proprio "fiori che durano". Se attivi il Gruppo 5, togli "cimitero" da eventuali negative.

Rivedi il **rapporto "Termini di ricerca"** ogni 3-4 giorni e aggiungi negative man mano che emergono ricerche fuori target. Nei primi 10 giorni è **l'attività che rende di più in assoluto**: ogni negativa aggiunta è budget che torna sui prodotti giusti.

---

## 7. Estensioni annuncio (obbligatorie, aumentano CTR e Quality Score) — testo pronto

- **Sitelink (4, con 2 righe di descrizione ciascuno — URL SEMPRE con https://):**
  1. Titolo: "Tutta la collezione" → `https://anticafioreriadelcentro.it/collezione.html` · Riga 1: "Oltre 30 composizioni fatte a mano" · Riga 2: "Filtra per occasione e stagione"
  2. Titolo: "Idee regalo" → `https://anticafioreriadelcentro.it/collezione.html?cat=regali` · Riga 1: "Rose, cuori e scrigni floreali" · Riga 2: "Confezione curata, arriva pronto"
  3. Titolo: "Novità" → `https://anticafioreriadelcentro.it/collezione.html?cat=novita` · Riga 1: "Gli ultimi pezzi usciti dalla bottega" · Riga 2: "Quantità limitate"
  4. Titolo: "Consegna e resi" → `https://anticafioreriadelcentro.it/#consegna` · Riga 1: "Spedizione assicurata in 48/72h" · Riga 2: "Reso gratuito entro 14 giorni"

- **Callout (Google ne chiede almeno 4, limite 25 caratteri — questi sono già verificati):**
  ```
  Fatti a mano dal 1953 (21)
  Consegna in 48/72h (18)
  Reso gratuito 14 giorni (23)
  Anche contrassegno (18)
  ```
  Se lo spazio lo consente, aggiungi anche:
  ```
  Imballo assicurato (18)
  Zero acqua, zero cure (21)
  Ritiro in bottega (17)
  Pezzi unici (11)
  ```

- **Snippet strutturato — tipo "Tipi":**
  ```
  Composizioni floreali, Bouquet artificiali, Centrotavola, Rose di sapone, Coroncine, Piante da parete, Idee regalo
  ```

- **Estensione promozione** (potentissima su e-commerce, usala):
  Tipo di promozione: **Codice promozionale** · Codice: `BENVENUTO10` · Sconto: **10%** · Su: "Ordini" · Occasione: *(nessuna)* · Date: tutta la durata della campagna · URL: `https://anticafioreriadelcentro.it/collezione.html`

- **Estensione prezzo** (tipo "Categorie di prodotti") — 4 voci, prezzi reali dal catalogo:
  ```
  Idee regalo      | da € 26  | Oggettistica e decori fatti a mano
  Composizioni     | da € 53  | Il formato classico della bottega
  Bouquet e ceste  | da € 60  | Fiori artificiali real touch
  Pezzi premium    | da € 92  | Composizioni da esposizione
  ```

- **Estensione di chiamata:** +39 327 337 0547, attiva mar-dom 8:30–19:30. Su e-commerce converte meno che in locale, ma su un pubblico 50+ che vuole "parlare con qualcuno prima di comprare" recupera ordini: tienila.

- **Estensione immagine:** carica 4-6 foto quadrate (1200×1200) dei prodotti più belli. Sulla Ricerca alza il CTR anche del 10%.

---

## 8. Tracciamento conversioni (senza questo la campagna è cieca)

Da fare **il giorno prima del lancio**, non dopo. Su un e-commerce non basta contare gli ordini: serve **il valore in euro di ogni ordine**, altrimenti non puoi calcolare il ROAS né lasciare che Google ottimizzi.

La pagina di ringraziamento è `ordine-completato.html` e viene raggiunta in tre modi: `?sessione=...` (pagamento con carta), `?contrassegno=1`, `?demo=1`. **Il `?demo=1` non va mai contato come conversione.**

### 8.1 Rendi disponibile il valore dell'ordine (passaggio tecnico, 2 minuti)
Dentro `ordine-completato.html`, subito dopo la riga che mostra il riepilogo (`document.getElementById('riepilogo').hidden = false;`), aggiungi:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'acquisto',
  valore_ordine: ordine.totale,
  numero_ordine: numeroOrdine || '',
  metodo: /[?&]contrassegno=1(&|$)/.test(location.search) ? 'contrassegno' : 'carta'
});
```

Così Google Tag Manager riceve l'evento `acquisto` con l'importo reale già scontato.

### 8.2 Crea la conversione in Google Ads
**Strumenti e impostazioni → Conversioni → "+" Nuova azione di conversione → Sito web**
- Categoria: **Acquisto**
- Nome: `Ordine completato`
- Valore: **"Usa valori diversi per ogni conversione"** → il valore arriva dal tag (punto 8.3)
- Conteggio: **Ogni** (un cliente può comprare più volte)
- Finestra di conversione: 30 giorni
- Includi in "Conversioni": **Sì** (è la conversione principale su cui ottimizza l'algoritmo)

### 8.3 Collega il tag in Google Tag Manager
1. Trigger: **Evento personalizzato** → nome evento `acquisto`.
2. Variabili: crea due **Variabili di livello dati** → `valore_ordine` e `numero_ordine`.
3. Tag: **Conversione Google Ads** → incolla ID conversione ed etichetta presi dal punto 8.2 → Valore conversione = `{{valore_ordine}}` · ID transazione = `{{numero_ordine}}` · Valuta = `EUR` → attiva sul trigger `acquisto`.
4. Attiva anche **Conversioni avanzate** (email hashata dal checkout): recupera il 5-15% di conversioni che i browser bloccano.
5. Aggiungi il **tag di remarketing Google Ads** su tutte le pagine: ti serve per la fase 2 e per creare il pubblico "ha visitato senza comprare". Costa zero attivarlo oggi, vale molto tra 30 giorni.

### 8.4 Conversioni secondarie (utili, ma NON primarie)
Crea anche queste, impostandole come **"Secondaria"** (Google le mostra nei report ma non ci ottimizza sopra):
- **Aggiunta al carrello** (trigger su click del pulsante di acquisto sulla pagina prodotto)
- **Click su WhatsApp** (`https://wa.me/393273370547`)
- **Inizio checkout** (visualizzazione di `checkout.html`)

Servono a capire **dove si rompe l'imbuto**: se hai 40 aggiunte al carrello e 3 ordini, il problema non è Google Ads, è il checkout.

Senza il punto 8.1-8.3 attivo **prima** del lancio, i primi 10 giorni di dati sono inutilizzabili per l'ottimizzazione.

---

## 9. Programmazione annunci e dispositivi

- **Programmazione:** tutti i giorni, **08:00–23:00**. Gli acquisti e-commerce di arredo/regalo si concentrano la sera (20:00–23:00) e nella pausa pranzo. La fascia 00:00–08:00 porta click curiosi e pochissimi ordini: tagliala.
- **Dispositivi:** parti senza aggiustamenti. Dal giorno 12, guarda il rapporto Dispositivi: se il desktop converte 2-3 volte meglio del mobile (succede spesso su ticket sopra €70), metti **+20% sull'offerta desktop** e **−20% sul mobile**.
- **Località:** tutta Italia. Dal giorno 15 controlla il rapporto per regione: se Sicilia/Sardegna/Calabria generano molti click e zero ordini (capita per i tempi e i costi di spedizione percepiti), escludile e recupera budget per il Nord.

---

## 10. Calendario di lancio e ottimizzazione (30 giorni)

| Giorni | Azione |
|---|---|
| **−5** | Merchant Center creato, sito verificato, feed caricato (approvazione prodotti: 2-3 giorni) |
| **−1** | Tracciamento conversioni attivo e testato con un ordine di prova, estensioni caricate, negative inserite |
| **1–7** | Fase di apprendimento: **NON toccare offerte né keyword.** Solo due controlli al giorno: la spesa non sfora €9 e i prodotti Shopping sono "Approvati" |
| **8** | Prima revisione: rapporto Termini di ricerca → aggiungi negative. Metti in pausa le keyword con >15 click e 0 conversioni |
| **10** | Se il Gruppo 1 porta ordini: accendi Gruppo 2 e 3 spostando €1/giorno dalla Ricerca allo Shopping o viceversa, in base a chi ha il ROAS migliore. Se hai ≥15 conversioni, passa lo Shopping a "ROAS target 300%" |
| **11–18** | Ottimizzazione feed: i prodotti con molte impressioni e pochi click hanno la foto o il titolo sbagliati → riscrivi il titolo con la formula della sezione 4.2. Sposta CPC verso i gruppi di prodotti che vendono |
| **19–24** | Test A/B sulla Ricerca: nel gruppo con più volume, scambia titolo 1 e titolo 7 e osserva il CTR dopo 5 giorni. Controlla il rapporto per regione e per dispositivo |
| **25–30** | Consolidamento: tieni solo gruppi e prodotti con ROAS ≥ 2,5. Report finale: spesa, ordini, ricavo, ROAS reale, prodotto più venduto, costo per ordine |

---

## 11. Guida passo-passo dentro Google Ads (per chi parte da zero)

Segui l'ordine esatto, non saltare passaggi.

**Passo 1 — Prima di tutto: Merchant Center e conversioni**
1. Crea il Merchant Center e carica il feed (sezione 4). È la cosa più lunga: falla per prima.
2. Vai su [ads.google.com](https://ads.google.com), accedi o crea l'account con l'email del negozio.
3. **Strumenti e impostazioni → Configurazione → Collegamenti:** collega **Merchant Center**, **Google Analytics 4** e **Google Business Profile** (per il negozio di Alessandria).
4. **Strumenti e impostazioni → Conversioni:** crea `Ordine completato` come da sezione 8. Fai un ordine di prova (anche in contrassegno, poi lo annulli) e verifica che la conversione venga registrata. **Questo è l'unico passaggio in cui può servire aiuto tecnico una tantum: senza, tutto il resto è cieco.**

**Passo 2 — Crea la CAMPAGNA A (Shopping)**
1. **Campagne → "+" Nuova campagna → Obiettivo: Vendite → Tipo: Shopping**.
2. Seleziona l'account Merchant Center e il paese di vendita **Italia**.
3. Tipo di campagna: **Campagna Shopping standard** (NON "Performance Max"). Se non la vedi, è nascosta sotto "Mostra altre impostazioni" o va creata passando da "Crea una campagna senza indicazioni relative a un obiettivo".
4. Nome: `AFC – Shopping Italia`. Budget: **€6/giorno**. Offerta: **Massimizza i clic** con limite CPC **€0,35**.
5. Località: Italia · Opzioni località: **"Presenza: persone che si trovano nelle zone target"**.
6. Salva, poi entra in **Gruppi di prodotti** e suddividi per tipo di prodotto come da sezione 4.3.

**Passo 3 — Crea la CAMPAGNA B (Ricerca)**
1. **"+" Nuova campagna → Obiettivo: Vendite → Tipo: Ricerca**.
2. Come raggiungere l'obiettivo: spunta solo **"Visite al sito web"** e inserisci `https://anticafioreriadelcentro.it/`.
3. Nome: `AFC – Ricerca Italia`.
4. Reti: **deseleziona "Rete Display"** e **deseleziona "Includi partner di ricerca Google"**.
5. Località: Italia, opzione **"Presenza"**. Lingua: **Italiano**. Budget: **€3/giorno**, tipo Standard.
6. Offerta: **"Clic"** con **"Imposta un limite di offerta massima CPC"** a **€0,60**.

**Passo 4 — Crea i gruppi di annunci della Ricerca**
Per ciascun gruppo della sezione 5:
1. **Gruppi di annunci → "+" Nuovo gruppo di annunci**, nome come nel titolo del gruppo.
2. Imposta il **CPC max** indicato.
3. **Keyword:** incolla l'elenco così com'è, con virgolette e parentesi quadre incluse (Google riconosce da solo il tipo di corrispondenza).
4. **"+" Nuovo annuncio → Annuncio adattabile della rete di ricerca:**
   - **URL finale:** la riga "URL finale" del gruppo, completa di `https://`.
   - **Titoli:** tutti e 15, uno per campo.
   - **Descrizioni:** tutte e 4.
   - **Percorso visualizzato:** la riga indicata (questo campo NON vuole `https://`, è solo testo cosmetico dopo il dominio).
5. Metti **in pausa** i gruppi 2 e 3 (li accendi al giorno 10).

**Passo 5 — Estensioni**
Aggiungile a **entrambe** le campagne, da **Annunci ed estensioni → Estensioni**: sitelink, callout, snippet strutturato, promozione BENVENUTO10, prezzo, chiamata, immagine (sezione 7). Le estensioni promozione e prezzo si applicano anche allo Shopping tramite Merchant Center (promozioni: Merchant Center → Marketing → Promozioni).

**Passo 6 — Programmazione annunci**
Su entrambe: **Campagna → Programmazione annunci → Modifica → +** → tutti i giorni **08:00–23:00**.

**Passo 7 — Keyword negative**
**Parole chiave → Parole chiave a corrispondenza inversa → a livello di campagna** → incolla l'elenco della sezione 6 su **entrambe** le campagne (sì, anche sullo Shopping: lì le negative sono l'unico modo per controllare per cosa esci).

**Passo 8 — Controllo finale prima di pubblicare**
- [ ] Prodotti del feed in stato **"Approvati"** nel Merchant Center (non "In attesa" o "Non approvati")
- [ ] Conversione `Ordine completato` in stato "Registrazione" e testata con un ordine di prova
- [ ] Valore conversione in euro che arriva davvero (non €0 e non un valore fisso)
- [ ] Rete Display e partner di ricerca **disattivati** sulla Ricerca
- [ ] Località Italia con opzione **"Presenza"** selezionata
- [ ] Budget €6 + €3 = €9/giorno confermati, tipo Standard
- [ ] Estensioni caricate su entrambe le campagne, promozione BENVENUTO10 inclusa
- [ ] Gruppi 2 e 3 in pausa, gruppi 1 e 4 attivi
- [ ] Keyword negative caricate su entrambe le campagne
- [ ] Programmazione 08:00–23:00 impostata

Quando tutte le caselle sono spuntate, pubblica. Segna la data di inizio: da lì partono i 7 giorni di apprendimento in cui non tocchi nulla.

---

## 12. Prima di spendere il primo euro: 5 fix sul sito che valgono più della campagna (1 già fatto)

Il traffico a pagamento amplifica quello che il sito già fa. Se il sito converte all'1% invece che al 2%, con €270 stai regalando metà budget. In ordine di impatto:

1. **✅ Fatto — dominio allineato a `anticafioreriadelcentro.it`.** I 42 riferimenti al vecchio indirizzo `.vercel.app` (canonical, sitemap, tag Open Graph, link nelle email di benvenuto) sono stati sostituiti in `index.html`, `collezione.html`, `prodotto.html`, `sitemap.xml` e `api/invia-benvenuto.js`. È stato aggiunto anche il **redirect 301** dal vecchio dominio `.vercel.app` verso `anticafioreriadelcentro.it` in `vercel.json`: chi ha ancora salvato o cliccato il vecchio link non trova una pagina di errore, atterra comunque sul sito giusto. **Resta da fare solo un passaggio fuori dal codice, in pannello Vercel:** collegare il dominio `anticafioreriadelcentro.it` al progetto (Vercel → progetto → Settings → Domains → Add) se non è già collegato, altrimenti il redirect non ha un dominio di destinazione attivo su cui atterrare.
2. **Recensioni con nome e voto in alto nella pagina prodotto.** Il nastro recensioni oggi sta in fondo alla home: chi arriva dall'annuncio sulla scheda prodotto non lo vede mai. Spostane 2-3 sotto il pulsante d'acquisto.
3. **Spedizione gratuita sopra una soglia** (es. €99, sopra lo scontrino medio attuale). Oggi €12 di spedizione su un ordine da €60 è un +20% che si vede al momento peggiore. Una soglia gratis alza lo scontrino medio invece di abbassare il margine.
4. **Rassicurazioni accanto al pulsante d'acquisto, non in fondo:** "Reso gratuito 14 giorni · Spedizione assicurata 48/72h · Paghi anche alla consegna". Tre righe che tolgono tre paure, nel punto esatto in cui nascono.
5. **Checkout: mostra il totale finale prima di chiedere i dati.** Il costo del contrassegno (+€15) e della spedizione devono essere visibili prima, non dopo aver compilato l'indirizzo: le sorprese sul prezzo sono la prima causa di carrelli abbandonati.

---

## Regola guida finale
Con €270 non si fa notorietà: si va a prendere **chi sta già cercando di comprare fiori artificiali oggi**. Per questo il budget sta su Shopping e Ricerca, il valore di ogni ordine va tracciato in euro dal primo giorno, e ogni gruppo che entro il giorno 12 non produce ricavo viene spento e il suo budget spostato su quello che vende. L'unica domanda a ogni revisione è: **quanti euro di vendite sono tornati per ogni euro speso?**
