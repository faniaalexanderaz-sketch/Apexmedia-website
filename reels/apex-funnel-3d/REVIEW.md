# Review — apex-funnel-3d

Render: `renders/apex-funnel-3d-9x16.mp4` · 1080x1920 · 30 fps · 21.0 s · con audio.

## Scelte
- Un unico mondo 3D (Three.js) con camera continua: barre ferme → flusso di 8.000 particelle → funnel a vortice → tuffo dentro il funnel → barre che esplodono → logo Apex estruso.
- Look: nero puro, lime fluo #C8FF00 (accento), rosa fluo #FF2D78 (problema). Niente blu. Colori come variabili in `index.html`.
- Font: Big Shoulders Display 900 (numeri e righe condensate) + Unbounded 900/500 (parole d'urto ed etichette).
- Logo in lime invece dell'oro del sito, per coerenza col look fluo (variabile `color-accent`).
- Numeri della crescita etichettati "simulazione".

## Audio
- Musica: generata (ElevenLabs Music v2.5 via Higgsfield), tagliata a 2,03 s così il drop cade a 14,0 s.
- SFX da Openverse: "Deep Whoosh #1", "swosh-08", "bass drop" (tutti CC0).
- Misurato, non ascoltato: −14,1 LUFS integrato, true peak −1,2 dB, nessun clipping, picco a 18,07 s (slam del logo).
- La traccia ha poca energia nei medi: su altoparlante del telefono la parte prima del drop suona leggera.

## Check
- `hyperframes check`: 0 errori. Warning tenuti: file world.html lungo (mondo 3D in un solo file), sovrapposizione voluta quando "FUNNEL" viene risucchiato, particelle al bordo del frame.

## Scatto più debole
- 14,0–14,5 s: all'uscita dal funnel le piastrelle vicine alla camera riempiono il frame per pochi fotogrammi.
