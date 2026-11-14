# Review — apex-funnel-fatturato

Render: `renders/apex-funnel-fatturato-9x16.mp4` · 1080x1920 · 30 fps · 21.0 s · **senza audio**.

## Scelte creative
- Storyline "Il funnel che moltiplica" (scelta dal cliente). Non costruite: "Prima vs Dopo", "Le 3 leve del fatturato".
- Il funnel è il logo Apex capovolto: nella scena finale ruota di 180° e diventa il marchio (legame metodo → brand).
- Fondo scuro con alone viola: è il look del sito Apex (styles.css), non un default.
- Numeri della scena "crescita" etichettati "simulazione" (non sono dati reali).

## Misurato
- `hyperframes check`: 0 errori. Warning tenuti: `film_silent` (manca l'audio, vedi sotto), `gsap_repeated_fromto_without_baseline` sui contatori (proxy JS, nessun effetto visivo).
- Snapshot a 0 / 1.4 / 2.8 / 4.6 / 6.2 / 8.4 / 10.4 / 11.7 / 13 / 14.6 / 15.9 / 16.6 / 17.2 / 19.5 / 20.75 s e frame del render finale.
- Corretto: sovrapposizione "funnel." / "10.000" (P0).

## Non verificato
- Audio: assente. Le fonti gratuite senza account (Openverse) hanno restituito file non adatti (una registrazione vocale, un impatto al posto di un whoosh). Serve il sign-in HeyGen (gratuito) per musica + SFX.

## Scatto più debole
- 16.0–16.6 s: il logo ancora capovolto, da solo sullo schermo per mezzo secondo. Con più tempo: scintille o wordmark che anticipano di 0.2 s.
