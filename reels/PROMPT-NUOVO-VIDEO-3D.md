# Prompt per un nuovo video 3D Apex Media

Apri una nuova chat di Claude Code su questo repo (branch con la cartella `reels/`) e incolla tutto il blocco.
Non c'è niente da compilare: tema, colori, font, gancio e scene sono già decisi.

```text
/hyperframes Devi creare un Reel motion design 3D per Apex Media (agenzia di performance marketing).
Formato 9:16, 1080x1920, 30 fps, 16-18 secondi, italiano, con musica ed effetti sonori.
Deve essere MOLTO più veloce e dinamico del video di riferimento, con un gancio che ferma lo scroll, e visivamente diverso.
Vai fino al render MP4 senza fermarti a chiedere conferme: le decisioni sono già tutte qui sotto.

== DECISIONI GIÀ PRESE (non cambiarle, non chiedere conferma) ==
TEMA: "100 post, 0 clienti" — pubblicare contenuti non è vendere.
GANCIO (frame 0): "100 POST." e al primo battito "0 CLIENTI."
MESSAGGIO FINALE: "SMETTILA DI PUBBLICARE. INIZIA A CONVERTIRE."
CTA: "RICHIEDI L'AUDIT GRATUITO →" + "LINK IN BIO"
COLORI: nero puro #000000 · arancio fluo #FF5A1F (tutto ciò che converte, numeri chiave, logo, CTA) ·
        bianco #FFFFFF (testo) · grigio spento #5A5A5A (i post inutili). Nient'altro.
FONT: Big Shoulders Display 900 (numeri e righe) + Unbounded 900 (parole d'urto) e 500 (etichette).
LINGUAGGIO VISIVO: lastre lucide verticali in formato 4:5 (sono i "post") su un pavimento nero riflettente,
        che cadono a domino. Facce piene ombreggiate, bordo luminoso, riflesso sul pavimento. Niente wireframe.
MUSICA: elettronica aggressiva a 140 BPM, build breve e drop netto.
NOME PROGETTO: reels/apex-post-clienti-3d

== PRIMA DI SCRIVERE CODICE: LEGGI IL PROGETTO DI RIFERIMENTO ==
In questo repo c'è già un video 3D finito: reels/apex-funnel-3d/. Leggi nell'ordine:
1. reels/apex-funnel-3d/REVIEW.md  (cosa ha funzionato e il punto debole)
2. reels/apex-funnel-3d/index.html (variabili colore, host delle scene, tracce audio)
3. reels/apex-funnel-3d/compositions/world.html (tutto il mondo 3D)
4. reels/apex-funnel-3d/compositions/t-traffico.html (un overlay di testo tipo)
Riusa la TECNICA, non il contenuto.

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

== GANCIO: I PRIMI 1,5 SECONDI DECIDONO TUTTO ==
- Frame 0: "100 POST." enorme (almeno il 60% della larghezza), già leggibile, con un muro di lastre grigie
  che sta già cadendo verso la camera. Mai nero, mai logo, mai un'entrata lenta.
- A 0,43 s (primo battito): le lastre si schiantano a terra, scossa di camera, slam di "0 CLIENTI." in arancio.
- Entro 1,5 s il problema è chiaro senza audio.

== RITMO: PIÙ VELOCE DEL RIFERIMENTO ==
- Musica a 140 BPM (battito 0,43 s, battuta 1,71 s). Ogni cambio di scena cade su una battuta.
- Una novità visiva a ogni battito o due (ogni 0,4-0,9 s): un taglio, uno slam di testo, un cambio di camera.
- Nessuna inquadratura ferma più di 1,7 s, tranne la CTA finale (ferma ≥ 2 s).
- La camera non è mai ferma e non va mai a velocità costante: accelera, frena, ruota, si tuffa.
  Almeno 4 mosse forti (tuffo, giro a 180°, whip, risalita a razzo), più scosse sui colpi.
- Testi a raffica: parole singole che entrano in 0,15 s sui battiti. Mai frasi lunghe.
- Contrasto di velocità: una sola pausa di 0,4 s quasi in silenzio subito prima del drop, poi tutto esplode.

== DEVE ESSERE DIVERSO DAL RIFERIMENTO ==
Vietato riusare: il funnel a cono, la fila di barre che salgono, il pavimento a griglia di piastrelle, la nuvola di
puntini come elemento principale, il lime e il rosa. Dal riferimento tieni solo il logo 3D e i due font.

== STORIA (5 scene, una sola camera continua, tempi sulle battute a 140 BPM) ==
1. GANCIO 0-1,7 s
   3D: muro di lastre grigie che cade verso la camera e si schianta sul pavimento riflettente.
   Testo: "100 POST." → "0 CLIENTI." (arancio).
   Camera: arretra di scatto mentre il muro cade, poi whip a destra.
2. L'ILLUSIONE 1,7-5,1 s
   3D: corridoio infinito di lastre grigie tutte uguali; la camera ci corre in mezzo a tutta velocità.
   Testo: contatore gigante "LIKE" da 0 a 12.480; sotto, fisso, "CLIENTI 0". All'ultima battuta slam "E I CLIENTI?".
   Camera: corsa in avanti accelerando, rollio di 20°, frenata secca sulla domanda.
3. IL MECCANISMO 5,1-10,3 s
   3D: una sola lastra si accende in arancio, cade e fa partire un domino lungo un percorso a spirale;
   ogni lastra colpita diventa arancio.
   Testo: quattro parole a raffica, una per battuta: "CONTENUTO" → "CLICK" → "CONTATTO" → "CLIENTE".
   Camera: insegue il domino a pelo del pavimento, gira a 180° attorno alla spirale, poi si tuffa ATTRAVERSO
   l'ultima lastra. Qui la pausa di 0,4 s quasi in silenzio.
4. IL RISULTATO 10,3-13,7 s, sul drop
   3D: tutte le lastre si rialzano arancio e volano a impilarsi in una torre che cresce verso l'alto.
   Testo: "CLIENTI AL MESE" con contatore da 0 a 37, e sotto in piccolo "SIMULAZIONE".
   Camera: risalita a razzo lungo la torre, con scossa sul drop.
5. BRAND 13,7-17 s
   3D: in cima alla torre il logo Apex estruso (geometria in world.html del riferimento) arriva ruotando e si blocca
   sul colpo di musica; schegge arancio che esplodono dietro.
   Testo: "APEXMEDIA" → "SMETTILA DI PUBBLICARE." / "INIZIA A CONVERTIRE." (arancio) → pulsante arancio con la CTA →
   "LINK IN BIO". Ultima riga ferma ≥ 2 s.

== ASTICELLA DI QUALITÀ: deve essere nettamente meglio del riferimento ==
Il riferimento ha questi limiti, il nuovo video li deve superare:
- MUSICA PRIMA DI TUTTO. Genera la musica prima di animare, misurala e costruisci i tempi sui suoi battiti.
  Nel riferimento è stata adattata dopo e la traccia è povera di medi.
- Più profondità: almeno 3 piani (primo piano che passa vicino alla camera, soggetto, sfondo), nebbia, parallasse.
- Più varietà di materiali: non solo wireframe. Almeno un oggetto con facce piene ombreggiate e riflesso sul pavimento.
- Motion blur sui movimenti veloci (data-motion-blur="on" sulla root, verifica il costo di render).
- Ogni transizione ha una causa fisica nel mondo (si entra in un oggetto, un oggetto diventa il successivo).
  Nessuna dissolvenza generica.
- Almeno un momento "come ha fatto?": un tuffo dentro un oggetto, una trasformazione, un'esplosione ordinata.
- Testo: mai più di 5 parole per riga, numeri enormi (≥ 230 px), tutto il testo tra y 168 e 1330 px,
  nessun testo che esce dal frame (nel riferimento è successo due volte: controlla con gli snapshot).

== AUDIO (procedura che ha funzionato) ==
1. Musica: connettore Higgsfield, generate_audio con model "elevenlabs_music_v2_5", duration 20, force_instrumental true.
   Prima chiama get_preferences e fai un get_cost. Costa circa 3,5 crediti a traccia: massimo 4 tracce.
   Prompt musica: stile + BPM esatto (140) + "strong mid and high frequencies, sounds full on phone speakers" +
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
1. Scrivi SPEC.md partendo dalle 5 scene qui sopra: aggiungi solo i fotogrammi esatti, le curve di easing e i suoni.
2. Costruisci prima solo il mondo 3D, fai snapshot a 12-14 istanti e GUARDALI. Correggi prima di aggiungere i testi.
3. Aggiungi testi e audio, poi `npx hyperframes check --json`: zero errori.
4. Snapshot di nuovo. Per ogni fotogramma chiediti: si capisce cosa sto guardando senza spiegazioni?
   Il testo si legge a 360 px di larghezza? C'è qualcosa che esce dal frame o si sovrappone?
5. Controlla il ritmo: `npx hyperframes snapshot --range 0,2 --frames 12` sul gancio. Se tra due fotogrammi vicini
   non cambia quasi nulla, è troppo lento: accelera.
6. Fai un secondo giro di critica severa (come un direttore creativo che non l'ha fatto lui): elenca i 5 punti
   più deboli e correggili TUTTI prima di consegnare. Non consegnare la prima versione che funziona.
7. Render in reels/<nome-progetto>/renders/, ricomprimi con ffmpeg (libx264 crf 21, aac 192k, faststart),
   scrivi REVIEW.md, commit e push sul branch di lavoro, inviami l'MP4.

== CONSEGNA ==
- L'MP4 e, in chat: cosa racconta ogni scena, cosa hai misurato, il punto più debole rimasto, crediti spesi.
- Una descrizione Instagram pronta (gancio in prima riga, CTA "commenta AUDIT", 8 hashtag).
```

## Se un giorno vuoi un altro video

Cambia solo il blocco "DECISIONI GIÀ PRESE" e la sezione "STORIA". Regola per i colori: sempre 1 solo fluo dominante,
bianco per il testo e 1 colore spento per il problema.
