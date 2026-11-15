# PROMPT — Video 6: "9,99" (l'effetto della cifra a sinistra)

Stato: **da approvare**. Non si genera audio e non si scrive codice finché non arriva il via.

---

## 1. Obiettivo

Reel 9:16 da 40–44 s per Instagram e TikTok, narrato in italiano, che spiega perché i prezzi finiscono in ,99
e chiude su Apex Media come chi "sceglie ogni parola" della pubblicità.

Deve battere i 5 video precedenti su tre cose:
1. **Camera**: ogni inquadratura è progettata come una ripresa vera (obiettivo, posizione, punto di mira, movimento, curva),
   con movimenti composti (dolly + pan + roll), mai un'orbita generica.
2. **Ritmo**: un evento visivo ogni 0,5–1 s, cambio di inquadratura ogni 1–2,2 s, nessun fotogramma morto.
3. **Finitura**: profondità di campo finta (sfocatura sugli oggetti lontani), motion blur sui movimenti veloci,
   transizioni fisiche (la camera passa attraverso un oggetto), effetti sonori sincronizzati.

## 2. Messaggio unico

Il prezzo non è un numero: è una frase che il cervello legge in mezzo secondo. Chi fa pubblicità sceglie ogni parola.

## 3. Voice over (testo definitivo)

Voce: ElevenLabs v4, preset "Callum" (la stessa dei video precedenti), via Higgsfield.

```text
Questo prezzo ti sta mentendo.
Nove euro e novantanove.
Il tuo cervello legge da sinistra. Vede un nove. E si ferma lì.
Per lui non sono quasi dieci euro. Sono nove.
Sembra un trucco da poco.
Ma in un esperimento famoso, lo stesso vestito è stato messo in vendita a tre prezzi.
Trentaquattro dollari. Trentanove. Quarantaquattro.
Quale ha venduto di più?
Trentanove.
Più caro di cinque dollari. Ma ha vinto il nove.
Si chiama effetto della cifra a sinistra.
Lo trovi nei supermercati. Negli abbonamenti. Negli annunci online.
Il prezzo non è solo un numero.
È una frase che il cervello legge in mezzo secondo.
E chi fa pubblicità sceglie ogni parola. Anche quella.
```

Fonte del colpo di scena: Anderson & Simester, esperimento sul catalogo di abbigliamento (2003).
A schermo compare in piccolo "esperimento Anderson & Simester, 2003".

## 4. Musica ed effetti

- **Base**: sottofondo storytelling di suspense, 110 BPM, senza batteria forte. Basso pizzicato smorzato sul tempo,
  ticchettio leggero, tappeto scuro, piccolo riser prima della risposta "Trentanove", poi una sola apertura più piena
  fino alla fine. Volume circa 18 dB sotto la voce.
- **Effetti sonori**: CC0 da Openverse, solo se il titolo corrisponde al suono:

| Momento | Suono |
| --- | --- |
| Il 9,99 si spezza | crack di vetro corto |
| Cartellini che cadono | 3 "tick" di plastica |
| "Quale ha venduto di più?" | ticchettio di orologio, 1,2 s |
| "Trentanove" | registratore di cassa (ka-ching) |
| Cambi di scena principali | whoosh corto (max 4 nel video) |
| Logo finale | colpo basso morbido |

## 5. Look

| Elemento | Valore |
| --- | --- |
| Fondo | nero #000, alone radiale bianco al 9% al centro |
| Tratto | bianco #FFFFFF con glow 12–18 px; secondario #8C8C8C; spento #4C4C4C |
| Accento | **rosso fluo #FF2A3D**, solo su: il 9, il prezzo vincente, la parola chiave, la CTA |
| Superfici | facce dei cartellini riempite di nero al 90% (nascondono le linee dietro = solidità) |
| Profondità | nebbia in profondità + sfocatura 0–6 px in base alla distanza dal punto di fuoco |
| Motion blur | media di 3 sotto-fotogrammi per frame (shutter 180°) |
| Font titoli | Unbounded 900 maiuscolo |
| Font numeri | Big Shoulders Display 900, cifre tabellari |
| Didascalie | in alto (y 214–700), parole chiave nere su blocco rosso inclinato −9°, le altre bianche |

## 6. Sistema di camera (regole valide per tutte le inquadrature)

- Camera vera: posizione occhio + punto di mira + up, focale espressa in F (800 = grandangolo, 1000 = normale,
  1400 = tele, 1900 = tele lungo). Taglio sul piano vicino a 26 unità.
- Ogni inquadratura combina almeno due movimenti tra: dolly, pan, tilt, roll, cambio focale.
- Curve: arrivi `expo.out` / `power4.out`; movimenti di camera `power2.inOut`; uscite e tuffi `power3.in`.
- Ogni stacco: o **match cut** (stessa forma nella stessa posizione), o **tuffo attraverso un oggetto**,
  o **whip** con motion blur. Mai dissolvenze.
- Micro-movimento a mano (handheld) di 2 unità su tutte le inquadrature ferme.
- Pulsazione di scala dell'1,8% su ogni battito della base.

## 7. Shot list (tempi stimati: verranno agganciati ai tempi reali della voce)

Unità: 1 unità = 1 cm. L'oggetto eroe è un **cartellino del prezzo** 3D: 240 × 150 × 12, con foro e cordino.

| # | Tempo | Voce | Camera | Cosa succede | Didascalia | Suono |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0,0–1,6 | "Questo prezzo ti sta mentendo." | Tele F 1900 a 2 m dal cartellino, dolly in avanti da 260 a 190, roll −4° → 0° | Frame 0: cartellino "9,99 €" già a fuoco che oscilla appeso al cordino. A 1,2 s le cifre "9," tremano | MENTENDO (blocco rosso) | basso che sale |
| 2 | 1,6–3,1 | "Nove euro e novantanove." | Push-in macro: da F 1400 a F 2600 sulla cifra "9", la camera scivola di 40 a destra | Ogni cifra si accende in sequenza sulla parola detta: 9 · , · 9 · 9 | 9,99 € | 4 tick |
| 3 | 3,1–4,6 | "Il tuo cervello legge da sinistra." | Whip a destra; F 1000; camera dietro una testa stilizzata in sezione (profilo), sguardo verso il cartellino | Un raggio parte dall'occhio e scorre da sinistra verso destra sul prezzo | DA SINISTRA | whoosh |
| 4 | 4,6–6,0 | "Vede un nove. E si ferma lì." | Dolly lungo il raggio, la camera "viaggia" con lo sguardo e frena di colpo sul 9 (power4.out) | Il raggio si blocca sul 9; il resto del prezzo sfuma al 20% | SI FERMA (rosso) | freno secco |
| 5 | 6,0–7,9 | "Per lui non sono quasi dieci euro. Sono nove." | Tilt dal basso, F 900, il "10" gigante sullo sfondo fuori fuoco, il "9" in primo piano a fuoco | Un 10 enorme dietro, un 9 davanti che lo copre; rack focus 10 → 9 sulla parola "nove" | SONO NOVE. | — |
| 6 | 7,9–9,3 | "Sembra un trucco da poco." | Overhead a piombo, F 1000, rotazione lenta di 25° | Il cartellino cade sul pavimento e si spezza in due pezzi | DA POCO | crack di vetro |
| 7 | 9,3–11,3 | "Ma in un esperimento famoso…" | Crane dall'alto verso il basso, F 1000, si scopre un manichino stilizzato con abito a trapezio | L'abito si disegna al tratto dall'alto in basso | ESPERIMENTO + "Anderson & Simester, 2003" | — |
| 8 | 11,3–13,0 | "lo stesso vestito… a tre prezzi." | Dolly laterale lungo tre manichini identici, F 1200, parallasse con pali in primo piano | Tre manichini uguali; tre cartellini vuoti appesi | TRE PREZZI | — |
| 9 | 13,0–14,0 | "Trentaquattro dollari." | Taglio stretto sul cartellino 1, F 1600, piccolo push | Il cartellino ruota su sé stesso (flip 180°) e mostra 34 $ | 34 $ | tick |
| 10 | 14,0–14,8 | "Trentanove." | Stesso schema sul cartellino 2 (match cut sulla stessa posizione) | Flip → 39 $ | 39 $ | tick |
| 11 | 14,8–15,9 | "Quarantaquattro." | Stesso schema sul cartellino 3 (match cut) | Flip → 44 $ | 44 $ | tick |
| 12 | 15,9–17,6 | "Quale ha venduto di più?" | Pull-back veloce a F 900 fino a vedere i tre insieme, poi micro-orbita di 12° | Tre colonne di vendita vuote crescono di poco e si fermano tutte alla stessa altezza; suspense | QUALE? | orologio |
| 13 | 17,6–19,0 | "Trentanove." | Snap zoom (F 900 → 1700 in 0,2 s) sul manichino centrale | La colonna del 39 esplode verso l'alto in rosso, sopra le altre due | 39 (gigante, rosso) | ka-ching |
| 14 | 19,0–21,6 | "Più caro di cinque dollari. Ma ha vinto il nove." | Camera in volo lungo la colonna rossa, dal basso in cima, roll 0° → 8° | In cima alla colonna il "9" di 39 si stacca e diventa una corona di luce | HA VINTO IL 9 | riser corto |
| 15 | 21,6–24,0 | "Si chiama effetto della cifra a sinistra." | Tuffo attraverso il 9 (la camera passa dentro la cifra) → match cut su un muro di cifre | Muro infinito di prezzi; tutti i primi numeri si accendono in rosso, gli altri restano grigi | CIFRA A SINISTRA | whoosh |
| 16 | 24,0–25,2 | "Lo trovi nei supermercati." | Dolly frontale lungo uno scaffale, F 1000, carrello che entra da sinistra | Scaffale con prodotti stilizzati e cartellini 1,99 · 2,99 · 4,99 | SUPERMERCATI | — |
| 17 | 25,2–26,4 | "Negli abbonamenti." | Match cut: lo scaffale diventa una griglia di 3 piani abbonamento; tilt dal basso | 9,99 · 14,99 · 19,99 al mese | ABBONAMENTI | — |
| 18 | 26,4–27,8 | "Negli annunci online." | Match cut: i piani diventano un feed di telefono che scorre in verticale; camera dietro una mano | Annunci con "-50%", "29,99" che passano | ONLINE | whoosh |
| 19 | 27,8–30,0 | "Il prezzo non è solo un numero." | Crane in alto con pull-back lungo, F 800 | Centinaia di cartellini sospesi nello spazio come una costellazione | SOLO UN NUMERO | — |
| 20 | 30,0–32,6 | "È una frase che il cervello legge in mezzo secondo." | Push lento verso un singolo cartellino al centro, rack focus | Un timer 0,5 s si consuma attorno al cartellino | 0,5 SECONDI (rosso) | tick rapido |
| 21 | 32,6–35,0 | "E chi fa pubblicità sceglie ogni parola." | Orbita stretta di 90° attorno al cartellino, F 1300 | Le cifre del prezzo vengono "scelte" una per una come lettere di una frase | OGNI PAROLA | — |
| 22 | 35,0–36,4 | "Anche quella." | Taglio secco frontale, F 1500, nessun movimento per 0,6 s, poi micro push | Il 9 si accende rosso da solo; il resto si spegne | ANCHE QUELLA. | silenzio, poi colpo |
| 23 | 36,4–40,0 | — | Il cartellino ruota di 180° e il suo retro è il logo Apex Media (match cut) | Logo estruso rosso, wordmark APEXMEDIA, "Capire la pubblicità, prima di farla", pulsante "Segui Apex Media →" | — | colpo basso morbido |

## 8. Didascalie

- Parola per parola, sincronizzate sui tempi reali della voce (trascrizione + riallineamento sulle pause).
- Massimo 3 righe a schermo, sempre tra y 214 e 700, mai sotto i 66 px.
- Parole chiave: nere su blocco rosso #FF2A3D, inclinate −9°, entrata con scatto (scala 2,4 → 1 in 0,22 s).
- Numeri detti a voce (9,99 · 34 · 39 · 44): in Big Shoulders 900 a 180–260 px.

## 9. Controlli prima della consegna

1. `hyperframes check`: zero errori.
2. Snapshot di ogni inquadratura a metà della sua durata: ogni fotogramma si capisce senza audio?
3. Nessun testo fuori dal fotogramma, nessuna sovrapposizione tra didascalie e oggetti principali.
4. Ritmo: snapshot ogni 0,5 s sui primi 6 secondi; tra due fotogrammi vicini deve cambiare qualcosa.
5. Audio: −14 LUFS circa, true peak ≤ −1 dB, nessun clipping. Ascolto a carico tuo (io misuro soltanto).
6. Critica finale: elenco dei 5 punti più deboli, corretti prima del render definitivo.

## 10. Costi previsti

- Voce: 1 generazione ElevenLabs v4.
- Musica: 2 tracce candidate, ne scelgo una misurandola (circa 7 crediti Higgsfield in tutto, voce inclusa ~10).
- Effetti sonori: gratuiti (Openverse, CC0).
