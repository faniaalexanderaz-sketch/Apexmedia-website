# Apex Engine 4 — standard for every new reel

Approved standard (restaurant demo, `engine4-demo`). Existing videos made with older engines are not touched.

## Rules
- Always a real set: no scene is text on a black background. If the script names no place, pick one that fits the topic.
- Clean cuts on the rhythm of the sentence, or the lateral slide (`trans: "slide"`). Inside a shot the camera never stops abruptly.
- Camera on arc-length splines with eased speed and a damped look target (`C4.rig`). No shake.
- 30 fps, 1080x1920, constant frame rate.
- Three-point light on the main subject plus practical lights in the set; captions sit over the set.
- No music bed in any video (Apex Media and Ricchi Piano): voiceover and micro-sounds only. The owner adds the music when publishing.

## Call to action (spoken and on screen)
- Around second 15 a banner appears and the voiceover says, in the same voice and tone as the rest:
  "Se vuoi sapere come creo questi video, scrivi MOTION nei commenti." Then the story continues.
  Banner text: "Vuoi sapere come creo questi video? / Scrivi MOTION nei commenti".
- On the closing card the voiceover says:
  "Se vuoi sapere come creo questi video, scrivi MOTION e ti spiego tutto."
- Never say "da casa", "dallo studio" or "se vuoi imparare": Apex Media is an agency. (The first video, apex-parrucchiere-35, still has the old wording.)
- No exclamation marks, no emoji, no glow on the banner or the closing card.
- Both lines are part of the single voiceover take (same ElevenLabs voice, same prompt), not separate clips.
- The banner and the closing text are timed from the aligned word times of those sentences: the text appears on the first word of the spoken line.

## Workflow
1. `node _engine4/render4.cjs <project> preview` — 540x960, 15 fps, no shadows/blur. For approving moves, timing and text.
2. After approval: `node _engine4/render4.cjs <project> final` — full quality.
   The render log (`renders/progress.log`) shows clock time, frames done/total, measured s/frame and remaining time.
   Frames are cached per shot: only edited shots are rendered again.
3. Nothing is delivered unless the gate passes: camera smoothness (`camcheck.cjs`), frame count, constant frame rate, zero duplicated frames.

## Measured on the demo (cloud VM, 4 vCPU, software GL — no GPU)
- Final: 0.88 s/frame, 10 s of video in 4 min 52 s. Preview: 0.27 s/frame, 10 s in 47 s.
- Extra workers do not help (software GL already uses every core).
- Never quote a render time that has not been measured.


## Engine 5 ("void") — standard from now on

The user rejected the character/set look. Approved look: black background, a pool of coloured light, **one 3D object per spoken word**,
big captions at the top, no characters with faces, no built sets, no "story of a shop" scripts (use "hidden trick" topics everyone lives).
The call to action is spoken and shown **only at the end** (never mid-video). No music bed.

- `kit5.js`: `C4.film5(spec)` (pure) + `C4.film5Browser(FILM)`; props in `C4.P5` (stack, coin(s), tag, card, pawn, crowd, shop, house, scale, clock,
  calendar, arrow, check, cross, phone, screen, app, heart, star, bars, bag, box, sofa, dumbbell, door, dress, frame, gift, anchor, cart, shirt, socks,
  truck, ticket, popcorn, creditcard, shoe, bottle, bowl, printer, cartridge, wallet, timer, razor, question). `p: "num"` is a big number/word (`txt` or `count:[from,to,dur,suffix]`).
- A scene = one shot from word `a` to word `b`; each item enters on its word `w` (`w:-1` = already there). The camera frames each scene automatically from the item positions and sizes.
- Film file: `film5.head.txt` + scenes + `film5.tail.txt` -> `assets/vendor/film.src.js`; copy `apx4.js kit4.js kit5.js` into `assets/vendor/`.
- Tools: `gencaps.py <proj> [accent words]` (captions from script), `fixend.py <proj>` (whisper dropped the closing sentence), `cutcta.py <proj>` (remove a mid-video CTA from an old voice), `q5.sh p1 p2 …` (final renders in a row).
- Measured: preview about 1.5-2 min, final about 15-25 min per 40 s video on this 4-vCPU machine.

## Real 3D models (from Nov 2026)

Objects that must look real (wallet, cart, store, food, speaker, money...) are generated as textured PBR models (Higgsfield `tripo_3d`,
text-to-3D, detailed geometry and textures, about 12.5 credits each), then made light with `optglb.sh` (weld, simplify to ~4%, 2048 px textures).
Library: `_engine4/models/<name>.opt.glb` (raw downloads in `models/raw/`, not committed).
Per project: copy into `assets/models/<name>.glb`, run `packmodels.py <proj>` (writes `assets/vendor/models.js`, base64, because
file:// pages cannot fetch), copy `gltf149.js` into `assets/vendor/`, and list the names in the film spec: `models: ["wallet", ...]`.
In a scene: `{ p: "glb", a: [name, height, { byWidth, hw, env, rough }], s, spin | upd }`. Measured front directions: speaker and store face +x
(use `ry: -PI/2` to face the camera).
