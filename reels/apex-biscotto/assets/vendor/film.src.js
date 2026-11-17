/* "Regala un biscotto a ogni cliente. E incassa mille euro in più al mese." (forno) — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const WIDE_L = { eye: [[-270, 215, 425], [-185, 195, 365]], look: [[10, 118, -130], [5, 118, -140]], fov: [58, 54], ease: "drift", aperture: 0.6, focus: [20, 110, -150] };
  const WIDE_R = { eye: [[290, 215, 425], [205, 195, 365]], look: [[-10, 118, -130], [-5, 118, -140]], fov: [58, 54], ease: "drift", aperture: 0.6, focus: [20, 110, -150] };
  const FACE = { eye: [[78, 170, -10], [62, 167, -45]], look: [[20, 166, -215], [20, 168, -215]], fov: [38, 34], ease: "drift", aperture: 1.5, focus: [20, 156, -215] };
  const OTS = { eye: [[150, 176, 80], [125, 170, 45]], look: [[18, 142, -215], [18, 144, -215]], fov: [42, 38], ease: "drift", aperture: 1.1, focus: [20, 150, -215] };
  const CASE = { eye: [[-80, 170, 30], [-102, 162, -8]], look: [[-150, 130, -150], [-150, 132, -150]], fov: [38, 34], ease: "drift", aperture: 1.2 };
  const TRAY = { eye: [[118, 156, -24], [102, 150, -48]], look: [[62, 114, -140], [62, 115, -140]], fov: [34, 31], ease: "drift", aperture: 1.5 };
  const TILL = { eye: [[90, 170, 0], [112, 162, -30]], look: [[172, 126, -150], [173, 127, -150]], fov: [36, 33], ease: "drift", aperture: 1.3 };
  const BP = [20, 0, -215];
  const baker = (t, A, over) => A.put(A.b, C4.standPose(t, BP, 0, { seed: 2, over: Object.assign({ smile: 0.9, brow: 0.2, headYaw: 0.12 * s(t * 0.7), arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-0.6 + 0.04 * s(t * 3), 0.1, -0.95 + 0.06 * s(t * 3), 0.1, 0.4]] }, over || {}) }));
  const offer = { arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-1.0, -0.1, -0.7, 0, 0.15]], smile: 1, brow: 0.5 };
  const talk = (t) => Math.max(0, s(t * 10) * 0.5 + s(t * 6.1) * 0.35);
  const guests = (t, A, n, yes) => { [[40, 0, -78], [-70, 0, -74], [140, 0, -72], [-190, 0, -70]].slice(0, n).forEach((p, i) => { const up = yes === i ? smooth(seg(t, A.yesT, A.yesT + 0.5)) : 0; A.put(A.g[i], C4.standPose(t, p, PI, { seed: i * 3 + 1, over: { smile: 0.7 + up * 0.3, headYaw: 0.15 * s(t * 0.8 + i), arm: [[-0.35, 0.05, -1.6 + 0.08 * s(t * 1.3 + i), 0.2, 0.35], [-0.2 - up * 2.2, 0.05 + up * 0.2, -0.3 - up * 0.5, 0, 0.3]] } })); }); };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [32, 43], motion: [40, 120], end: 112,
    sets: { f: { type: "bar", args: [{ bakery: true }], off: 0, light: "day", grade: { contrast: 1.06, sat: 1.06, vignette: 0.55 } } },
    cast: (A, mk, ex) => {
      A.b = mk({ skin: "#f0c4a0", top: "#efece4", bottom: "#2a2c33", hair: "#5a2e1a", hairStyle: "bun", seed: 5, eye: "#3a4a2a", apron: "#b98a4a" });
      A.g = [mk({ skin: "#c98d62", top: "#2c3e57", bottom: "#2a2a2e", hair: "#17120e", seed: 7 }), mk({ skin: "#f6d6ba", top: "#b23a48", bottom: "#1f2430", hair: "#b08a4a", hairStyle: "long", seed: 8, lod: 1 }), mk({ skin: "#e6b08a", top: "#4a5a3a", bottom: "#33363d", hair: "#3a2416", seed: 3, lod: 1 }), mk({ skin: "#f2c9a5", top: "#c9962a", bottom: "#23262e", hair: "#6a4a2a", hairStyle: "bun", seed: 4, lod: 1 })];
      A.tray = ex(C4.props.biscuitTray()); A.tray.position.set(62, 110, -140); A.tray.scale.setScalar(1.2); },
    shots: [
      { a: 0, b: 6, set: "f", cam: OTS, tags: [{ w: 1, txt: "1 BISCOTTO GRATIS", y: 300, col: YEL, size: 70 }], stage: (t, A) => { baker(t, A, offer); guests(t, A, 1); A.tray.visible = true; } },
      { a: 6, b: 14, set: "f", cam: FACE, tags: [{ w: 8, txt: "+ 1.000 €", big: true, col: GRN, y: 400, size: 160, sfx: "cash" }, { w: 12, txt: "AL MESE", y: 530 }], stage: (t, A) => baker(t, A, { smile: 1, brow: 0.5 }) },
      { a: 14, b: 22, set: "f", cam: WIDE_L, tags: [{ w: 20, txt: "60 PERSONE AL GIORNO", y: 300, size: 62 }], stage: (t, A) => { baker(t, A); guests(t, A, 3); } },
      { a: 22, b: 27, set: "f", cam: { eye: [[-60, 178, 430], [-140, 170, 400]], look: (t) => [lerp(20, 260, seg(t, FILM.WT[22], FILM.WT[27] + 0.5)), 118, 250], fov: [52, 50], ease: "drift", damp: 0.45, aperture: 0.6 }, tags: [{ w: 22, txt: "COMPRANO IL PANE", y: 290, size: 56 }, { w: 25, txt: "SALUTANO", y: 395, size: 56 }, { w: 26, txt: "ESCONO", y: 500, col: GREY, size: 56 }], stage: (t, A, sh) => { baker(t, A); const x = lerp(0, 280, seg(t, sh.t0, sh.t1 + 0.5)); A.put(A.g[0], C4.walkPose(t, [x, 0, 260], PI / 2, 1.5, { seed: 3, over: { smile: 0.5 } })); } },
      { a: 27, b: 32, set: "f", cam: CASE, tags: [{ w: 28, txt: "I BISCOTTI RESTANO LÌ", y: 300, col: RED, fg: "#fff", size: 60 }], stage: (t, A) => baker(t, A, { smile: 0.2, brow: -0.3 }) },
      { a: 32, b: 43, set: "f", cam: WIDE_R, stage: (t, A) => { baker(t, A); guests(t, A, 2); } },
      { a: 43, b: 51, slide: true, set: "f", cam: TRAY, tags: [{ w: 47, txt: "UN VASSOIO SUL BANCONE", y: 300, col: YEL, size: 58 }], stage: (t, A) => { baker(t, A); A.tray.visible = true; A.tray.scale.setScalar(1.2 * C4.pop2(t, FILM.WT[47] - 0.1, 0.35)); } },
      { a: 51, b: 56, set: "f", cam: OTS, tags: [{ w: 53, txt: "GRATIS", x: 330, y: 560, col: YEL, rot: -3 }, { w: 55, txt: "A TUTTI", x: 730, y: 560, rot: 3 }], stage: (t, A) => { baker(t, A, Object.assign({ open: talk(t) * 0.7 }, offer)); guests(t, A, 1); A.tray.visible = true; A.tray.scale.setScalar(1.2); }, draw: (g, t) => C4.bubble(g, 470, 380, "Vuole assaggiare?", C4.pop2(t, FILM.WT[51] - 0.05), { tail: 0.6, size: 46 }) },
      { a: 56, b: 66, set: "f", cam: WIDE_L, tags: [{ w: 58, txt: "1 SU 5 COMPRA", y: 300, col: GRN, fg: "#fff", size: 74 }, { w: 62, txt: "CONFEZIONE DA 6 €", y: 415, size: 58 }], stage: (t, A) => { A.yesT = FILM.WT[60]; baker(t, A, offer); guests(t, A, 4, 0); A.tray.visible = true; A.tray.scale.setScalar(1.2); } },
      { a: 66, b: 70, set: "f", cam: CASE, tags: [{ w: 66, txt: "12", big: true, col: "#fff", y: 400, size: 200 }, { w: 67, txt: "CONFEZIONI AL GIORNO", y: 540, size: 56 }], stage: (t, A) => baker(t, A) },
      { a: 70, b: 72, set: "f", cam: TILL, tags: [{ w: 70, txt: "72 €", big: true, col: "#fff", y: 400, size: 180, sfx: "cash" }], stage: (t, A) => baker(t, A) },
      { a: 72, b: 82, set: "f", cam: TRAY, tags: [{ w: 74, txt: "- COSTO DEGLI ASSAGGI", y: 290, col: GREY, size: 54 }, { w: 81, txt: "+ 40 €", big: true, col: GRN, y: 430, size: 160, sfx: "cash" }, { w: 81, dt: 0.3, txt: "AL GIORNO", y: 560 }], stage: (t, A) => { baker(t, A); A.tray.visible = true; A.tray.scale.setScalar(1.2); } },
      { a: 82, b: 88, set: "f", cam: FACE, tags: [{ w: 82, txt: "IN UN MESE", y: 290 }, { w: 86, txt: "+ 1.000 €", big: true, col: GRN, y: 420, size: 160, sfx: "cash" }], stage: (t, A) => baker(t, A, { smile: 1, brow: 0.5 }) },
      { a: 88, b: 95, set: "f", cam: WIDE_R, tags: [{ w: 88, txt: "NESSUNO SCONTO", y: 290, size: 60 }, { w: 90, txt: "NESSUNA PUBBLICITÀ", y: 400, size: 60 }, { w: 92, txt: "SOLO UN BISCOTTO", y: 510, col: YEL, size: 64 }], stage: (t, A) => { baker(t, A, offer); guests(t, A, 3); A.tray.visible = true; A.tray.scale.setScalar(1.2); } },
      { a: 95, b: 103, set: "f", cam: CASE, tags: [{ w: 97, txt: "NON COMPRI QUELLO CHE NON CONOSCI", y: 300, col: GREY, size: 46 }], stage: (t, A) => baker(t, A) },
      { a: 103, b: 112, set: "f", cam: OTS, tags: [{ w: 105, txt: "FAI PROVARE UNA COSA PICCOLA", y: 290, col: YEL, size: 50 }, { w: 109, txt: "VENDERAI QUELLA GRANDE", y: 400, col: GRN, fg: "#fff", size: 54 }], stage: (t, A) => { baker(t, A, offer); guests(t, A, 1); A.tray.visible = true; A.tray.scale.setScalar(1.2); } },
      { end: true, set: "f", cam: { eye: [[-190, 185, 410], [-110, 178, 355]], look: [[10, 125, -140], [15, 125, -140]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 175, 280] }, stage: (t, A) => { baker(t, A); guests(t, A, 3); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
