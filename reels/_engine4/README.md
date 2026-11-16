# Apex Engine 4 — standard for every new reel

Approved standard (restaurant demo, `engine4-demo`). Existing videos made with older engines are not touched.

## Rules
- Always a real set: no scene is text on a black background. If the script names no place, pick one that fits the topic.
- Clean cuts on the rhythm of the sentence, or the lateral slide (`trans: "slide"`). Inside a shot the camera never stops abruptly.
- Camera on arc-length splines with eased speed and a damped look target (`C4.rig`). No shake.
- 30 fps, 1080x1920, constant frame rate.
- Three-point light on the main subject plus practical lights in the set; captions sit over the set.
- Ricchi Piano: micro-sounds only, no music bed.

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
