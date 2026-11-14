# Prompt per un nuovo video 3D Apex Media

Apri una nuova chat di Claude Code su questo repo (branch con la cartella `reels/`) e incolla tutto il blocco.
Cambia solo le 4 righe sotto "DA DECIDERE" se vuoi un altro tema o altri colori.

```text
/hyperframes Devi creare un Reel motion design 3D per Apex Media (agenzia di performance marketing).
Formato 9:16, 1080x1920, 30 fps, 20-24 secondi, italiano, con musica ed effetti sonori.
Vai fino al render MP4 senza fermarti a chiedere conferme: le decisioni sono già tutte qui sotto.

== DA DECIDERE (già compilato, cambia solo se serve) ==
TEMA: "100 post, 0 clienti" — pubblicare contenuti non è vendere. Servono contenuti che portano a un'azione.
MESSAGGIO UNICO: "Smettila di pubblicare. Inizia a convertire."
COLORI: nero puro #000000, arancio fluo #FF5A1F (accento: tutto ciò che funziona), bianco #FFFFFF (testo),
        grigio spento #5A5A5A (il problema: post inutili). Niente blu, niente lime, niente rosa.
CTA FINALE: "RICHIEDI L'AUDIT GRATUITO →" + "LINK IN BIO"

== PRIMA DI SCRIVERE CODICE: LEGGI IL PROGETTO DI RIFERIMENTO ==
In questo repo c'è già un video 3D finito: reels/apex-funnel-3d/. Leggi nell'ordine:
1. reels/apex-funnel-3d/REVIEW.md  (cosa ha funzionato e il punto debole)
2. reels/apex-funnel-3d/index.html (variabili colore, host delle scene, tracce audio)
3. reels/apex-funnel-3d/compositions/world.html (tutto il mondo 3D)
4. reels/apex-funnel-3d/compositions/t-traffico.html (un overlay di testo tipo)
Riusa la TECNICA, non il contenuto. Il nuovo video deve avere oggetti, camera e storia diversi.

Tecnica che funziona (già verificata in questo ambiente, non reinventarla):
- Three.js r149 caricato come script classico da assets/vendor/three.min.js (copialo dal progetto di riferimento).
- Un solo mondo 3D in una sub-composition che dura tutto il film; una funzione render(t) pura, guidata da un
  tween GSAP su un oggetto proxy con onUpdate. Niente requestAnimationFrame, niente Math.random (PRNG con seed).
- Renderer con preserveDrawingBuffer: true, pixelRatio 1, 1080x1920.
- Camera a keyframe [tempo, posizione, target, up, roll, fov, ease] interpolati: una camera che non stacca mai.
- Particelle: THREE.Points con ShaderMaterial additivo, posizioni calcolate in JS come funzione pura di (indice, t),
  più LineSegments per le scie di velocità.
- Oggetti: ShaderMaterial con linee di bordo via fwidth(uv), corpo nero, colore fluo emissivo, nebbia verso il nero.
- Testi: sub-composition HTML separate sopra il mondo, con perspective e rotazioni 3D (rotationX, z) in GSAP.
- Font: Big Shoulders Display 900 (numeri giganti, righe condensate) + Unbounded 900/500 (parole d'urto, etichette),
  file woff2 in assets/fonts/ (copiali dal progetto di riferimento) con @font-face in ogni file che li usa.
- Colori come variabili CSS in index.html (data-composition-variables), letti nel mondo 3D con getComputedStyle.

== STORIA (5 momenti, una sola camera continua) ==
Inventa tu gli oggetti 3D, ma rispetta questa struttura e fai in modo che ogni scena CAUSI la successiva:
1. GANCIO 0-3 s: frase già leggibile al frame 0 + il problema visibile in 3D
   (es. un muro infinito di "post" grigi, lastre tutte uguali, che scorrono senza che succeda nulla).
2. IL DATO CHE ILLUDE 3-7 s: un contatore gigante che sale (like, views, post pubblicati) mentre il numero
   "CLIENTI" resta a 0. Parola d'urto: "E I CLIENTI?"
3. IL MECCANISMO 7-13 s: il cambio. Un post diverso si accende in arancio e fa partire una reazione fisica
   (es. tessere che cadono a domino, un percorso che si illumina, un oggetto che si assembla): contenuto → click →
   contatto → cliente. Qui serve il momento più spettacolare: la camera ENTRA dentro l'oggetto.
4. IL RISULTATO 13-17 s, sul drop della musica: il mondo grigio si accende tutto in arancio, numero che sale
   (clienti al mese). Se usi numeri non reali, scrivi "SIMULAZIONE" sotto.
5. BRAND 17-22 s: logo Apex in 3D estruso (triangolo con triangolo pieno interno: la geometria è in world.html del
   riferimento) che si blocca su un colpo di musica, wordmark APEXMEDIA, messaggio unico, CTA. Ultima riga ferma ≥ 2 s.

== ASTICELLA DI QUALITÀ: deve essere nettamente meglio del riferimento ==
Il riferimento ha questi limiti, il nuovo video li deve superare:
- MUSICA PRIMA DI TUTTO. Genera la musica prima di animare, misurala e costruisci i tempi sui suoi battiti.
  Nel riferimento è stata adattata dopo e la traccia è povera di medi.
- Più profondità: almeno 3 piani (primo piano che passa vicino alla camera, soggetto, sfondo), nebbia, parallasse.
- Più varietà di materiali: non solo wireframe. Almeno un oggetto con facce piene ombreggiate e riflesso sul pavimento.
- Motion blur sui movimenti veloci (data-motion-blur="on" sulla root, verifica il costo di render).
- Niente tempi morti: qualcosa di nuovo ogni 1,5-2 s, tagli e colpi sui battiti, layout nuovo a ogni battuta (2 s).
- Ogni transizione ha una causa fisica nel mondo (si entra in un oggetto, un oggetto diventa il successivo).
  Nessuna dissolvenza generica.
- Almeno un momento "come ha fatto?": un tuffo dentro un oggetto, una trasformazione, un'esplosione ordinata.
- Testo: mai più di 5 parole per riga, numeri enormi (≥ 230 px), tutto il testo tra y 168 e 1330 px,
  nessun testo che esce dal frame (nel riferimento è successo due volte: controlla con gli snapshot).

== AUDIO (procedura che ha funzionato) ==
1. Musica: connettore Higgsfield, generate_audio con model "elevenlabs_music_v2_5", duration 24, force_instrumental true.
   Prima chiama get_preferences e fai un get_cost. Costa circa 3,5 crediti a traccia: massimo 4 tracce.
   Prompt musica: stile + BPM esatto (120) + "strong mid and high frequencies, sounds full on phone speakers" +
   struttura semplice (build poi drop poi colpo finale). Niente nomi di brand o persone nel prompt.
2. Misura ogni traccia: `npx hyperframes beats <file> --json` e l'energia per banda con ffmpeg astats
   (sotto 150 Hz, 400-2000 Hz, sopra 5 kHz, finestre da 0,5 s). SCARTA le tracce quasi solo sub-bass.
   Scegli quella con un drop netto e misurabile.
3. Allinea: usa data-media-start sull'<audio> perché il drop cada esattamente sulla scena 4, e metti i tagli sui battiti.
4. Effetti: `npx hyperframes media-use resolve --type sfx --intent "<cosa>" --project .` (Openverse, senza login).
   Controlla titolo e licenza nel manifest: tieni solo CC0 e solo se il titolo corrisponde al suono cercato
   (una volta è arrivata una voce registrata). Whoosh sui movimenti di camera, colpo sul logo, niente di più.
5. Sul render finale: `npx hyperframes audio <mp4> --json` → circa -14 LUFS, true peak ≤ -1 dB, zero clipping.
   Nella consegna scrivi che l'audio è misurato, non ascoltato.

== CICLO DI LAVORO OBBLIGATORIO ==
1. Scrivi SPEC.md: ogni scena con secondi, oggetto 3D, mossa di camera, testo, suono.
2. Costruisci prima solo il mondo 3D, fai snapshot a 12-14 istanti e GUARDALI. Correggi prima di aggiungere i testi.
3. Aggiungi testi e audio, poi `npx hyperframes check --json`: zero errori.
4. Snapshot di nuovo. Per ogni fotogramma chiediti: si capisce cosa sto guardando senza spiegazioni?
   Il testo si legge a 360 px di larghezza? C'è qualcosa che esce dal frame o si sovrappone?
5. Fai un secondo giro di critica severa (come un direttore creativo che non l'ha fatto lui): elenca i 5 punti
   più deboli e correggili TUTTI prima di consegnare. Non consegnare la prima versione che funziona.
6. Render in reels/<nome-progetto>/renders/, ricomprimi con ffmpeg (libx264 crf 21, aac 192k, faststart),
   scrivi REVIEW.md, commit e push sul branch di lavoro, inviami l'MP4.

== CONSEGNA ==
- L'MP4 e, in chat: cosa racconta ogni scena, cosa hai misurato, il punto più debole rimasto, crediti spesi.
- Una descrizione Instagram pronta (gancio in prima riga, CTA "commenta AUDIT", 8 hashtag).
```

## Come cambiare tema e colori

| Vuoi | Cambia |
| --- | --- |
| Altro argomento | le righe TEMA e MESSAGGIO UNICO, e gli esempi tra parentesi nella STORIA |
| Altri colori | la riga COLORI: sempre 1 solo fluo dominante + bianco + 1 colore "spento" per il problema |
| Altra durata | "20-24 secondi" in alto e i secondi dei 5 momenti (tienili multipli di 2 s: sono battute a 120 BPM) |
| Formato orizzontale | "9:16, 1080x1920" → "16:9, 1920x1080" e togli la regola "tra y 168 e 1330 px" |
