# Review — apex-post-clienti-3d

Render: `renders/apex-post-clienti-9x16.mp4` · 1080x1920 · 30 fps · 18,4 s · con audio.

## Cosa racconta
0–1,7 s  muro di 40 post grigi che cade sulla camera e si schianta sul primo battito: "100 POST. / 0 CLIENTI."
1,7–5,1 s corsa in un corridoio di post che si alzano dal pavimento: LIKE 0→12.480, "CLIENTI: 0", "E I CLIENTI?"
5,1–10,3 s un post si accende e parte un domino a spirale: CONTENUTO → CLICK → CONTATTO; la camera si tuffa
          nell'ultima lastra: schermo pieno arancio con "CLIENTE" durante la pausa della musica.
10,3–13,7 s drop: 170 lastre arancio volano e si impilano in una torre a elica; "CLIENTI AL MESE 0→37 · SIMULAZIONE".
13,7–18,4 s in cima alla torre il logo Apex 3D si blocca sul colpo; messaggio finale e CTA.

## Tecnica
- Three.js r149, un solo mondo, camera continua; ogni frame = media di 4 sotto-frame (motion blur reale).
- Lastre con facce piene ombreggiate e copia specchiata sotto il pavimento (riflesso).
- Griglia musicale 140 BPM; cambi scena sulle battute.

## Audio
- Musica: ElevenLabs Music v2.5 via Higgsfield (2 tracce generate, ~7 crediti), tagliata a 3,469 s: drop a 10,29 s.
- SFX CC0 (Openverse): whoosh, swish, bass drop.
- Misurato, non ascoltato: −13,2 LUFS, true peak −1,3 dB, zero clipping.

## Check
- `hyperframes check`: 0 errori. Avvisi tenuti: "E I CLIENTI?" a schermo 0,77 s (3 parole enormi, voluto per ritmo);
  testo a 70 px dal bordo sinistro (fuori dalla zona sicura più stretta di TikTok, dentro quella di Instagram).

## Punti deboli
- 2,0–2,6 s: all'inizio del corridoio le lastre sono molto mosse e si leggono poco come "post".
- I numeri (12.480 like, 37 clienti) sono inventati: sostituire con un caso reale appena disponibile.
