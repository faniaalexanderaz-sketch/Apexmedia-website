# Review — apex-cosa-facciamo-3d

Render: `renders/apex-cosa-facciamo-9x16.mp4` · 1080x1920 · 30 fps · 31,6 s · con audio.

## Scene (140 BPM, cambi sui battiti 0, 6, 16, 20, 30, 40, 50, 60)
0–2,6 s   gancio: "I LIKE NON PAGANO LE FATTURE." + pioggia di cuori 3D che cadono a terra grigi
2,6–6,9 s problema: smartphone 3D da cui escono cuori; "Pubblichi ogni giorno. I follower salgono. I clienti? Zero."
6,9–8,6 s svolta: "NOI FACCIAMO L'OPPOSTO."
8,6–12,9 s 01 Social media: feed che si ferma su un post arancione che esce dallo schermo
12,9–17,1 s 02 Advertising: bersaglio 3D, tre frecce sui battiti, pubblico che si accende
17,1–21,4 s 03 Lead generation: calamita che attira 256 pedine in formazione
21,4–25,7 s risultati dal sito: 8,7x ROI medio, 150+ aziende, 24M+ reach; freccia 3D a spirale
25,7–31,6 s brand: logo 3D, "Clienti, non visualizzazioni.", CTA "Prenota la consulenza gratuita"

## Tecnica
Three.js r149, un solo mondo, camera continua; materiale lucido con speculare e rim; riflesso = mondo
renderizzato specchiato sotto il pavimento; motion blur = media di 3 sotto-frame.

## Audio
Musica ElevenLabs Music v2.5 via Higgsfield (2 tracce, ~12 crediti), media-start 5,178 s: drop a 8,57 s (inizio servizi).
SFX CC0 (Openverse). Misurato, non ascoltato: −12,9 LUFS, true peak −1,0 dB, zero clipping.

## Check
`hyperframes check`: 0 errori. Avviso tenuto: "I numeri parlano più di noi" a schermo 1,1 s (riga secondaria).

## Punti deboli
- Il post arancione che esce dal telefono è un rettangolo pieno: non mostra un contenuto.
- Scena risultati: molto spazio nero tra i numeri e la freccia.
- Render lento (~24 min).
