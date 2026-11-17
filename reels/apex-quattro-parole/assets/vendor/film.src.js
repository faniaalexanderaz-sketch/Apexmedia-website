/* "Quattro parole gli portano millecinquecento euro al mese." (bar) — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const WIDE_L = { eye: [[-270, 215, 425], [-185, 195, 365]], look: [[10, 118, -130], [5, 118, -140]], fov: [58, 54], ease: "drift", aperture: 0.6, focus: [20, 110, -150] };
  const WIDE_R = { eye: [[290, 215, 425], [205, 195, 365]], look: [[-10, 118, -130], [-5, 118, -140]], fov: [58, 54], ease: "drift", aperture: 0.6, focus: [20, 110, -150] };
  const FACE = { eye: [[78, 166, -10], [62, 163, -45]], look: [[20, 154, -215], [20, 156, -215]], fov: [34, 30], ease: "drift", aperture: 1.5, focus: [20, 156, -215] };
  const OTS = { eye: [[150, 176, 80], [125, 170, 45]], look: [[18, 142, -215], [18, 144, -215]], fov: [42, 38], ease: "drift", aperture: 1.1, focus: [20, 150, -215] };
  const CASE = { eye: [[-80, 170, 30], [-102, 162, -8]], look: [[-150, 130, -150], [-150, 132, -150]], fov: [38, 34], ease: "drift", aperture: 1.2 };
  const PLATE = { eye: [[112, 152, -30], [98, 146, -52]], look: [[62, 112, -140], [62, 113, -140]], fov: [32, 29], ease: "drift", aperture: 1.6 };
  const TILL = { eye: [[90, 170, 0], [112, 162, -30]], look: [[172, 126, -150], [173, 127, -150]], fov: [36, 33], ease: "drift", aperture: 1.3 };
  const BP = [20, 0, -215];
  const barista = (t, A, over) => A.put(A.b, C4.standPose(t, BP, 0, { seed: 2, over: Object.assign({ smile: 0.85, brow: 0.2, headYaw: 0.12 * s(t * 0.7), arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-0.6 + 0.04 * s(t * 3), 0.1, -0.95 + 0.06 * s(t * 3), 0.1, 0.4]] }, over || {}) }));
  const talk = (t) => Math.max(0, s(t * 10) * 0.5 + s(t * 6.1) * 0.35);
  const guests = (t, A, n, yes) => { [[40, 0, -78], [-70, 0, -74], [140, 0, -72], [-190, 0, -70]].slice(0, n).forEach((p, i) => { const up = yes === i ? smooth(seg(t, yes === i ? A.yesT : 0, (A.yesT || 0) + 0.5)) : 0; A.put(A.g[i], C4.standPose(t, p, PI, { seed: i * 3 + 1, over: { smile: 0.7 + up * 0.3, headYaw: 0.15 * s(t * 0.8 + i), arm: [[-0.35, 0.05, -1.6 + 0.08 * s(t * 1.3 + i), 0.2, 0.35], [-0.2 - up * 2.2, 0.05 + up * 0.2, -0.3 - up * 0.5, 0, 0.3]] } })); }); A.cup.visible = true; A.plate.visible = true; };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [26, 37], motion: [34, 111], end: 103,
    sets: { bar: { type: "bar", args: [], off: 0, light: "day", grade: { contrast: 1.06, sat: 1.06, vignette: 0.55 } } },
    cast: (A, mk, ex) => {
      A.b = mk({ skin: "#e0a880", top: "#efece4", bottom: "#15161a", hair: "#22160e", seed: 2, apron: "#3a2416", bow: "#15161a" });
      A.g = [mk({ skin: "#f0c4a0", top: "#b23a48", bottom: "#1f2430", hair: "#5a2e1a", hairStyle: "long", seed: 4, eye: "#3a4a2a" }), mk({ skin: "#c98d62", top: "#2c3e57", bottom: "#2a2a2e", hair: "#17120e", seed: 7, lod: 1 }), mk({ skin: "#f6d6ba", top: "#c9962a", bottom: "#33363d", hair: "#b08a4a", hairStyle: "bun", seed: 8, lod: 1 }), mk({ skin: "#e6b08a", top: "#4a5a3a", bottom: "#23262e", hair: "#3a2416", seed: 3, lod: 1 })];
      A.cup = ex(C4.props.cup()); A.cup.position.set(40, 110, -132); A.plate = ex(C4.grp()); const pl = C4.props.plate(11); A.plate.add(pl); const co = C4.props.cornetto(1.5); co.position.y = 2; A.plate.add(co); A.plate.position.set(62, 110, -140); },
    shots: [
      { a: 0, b: 8, set: "bar", cam: FACE, tags: [{ w: 0, txt: "4 PAROLE", y: 290, col: YEL }, { w: 4, txt: "+ 1.500 €", big: true, col: GRN, y: 420, size: 150, sfx: "cash" }, { w: 6, txt: "AL MESE", y: 540 }], stage: (t, A) => barista(t, A, { smile: 1, brow: 0.5 }) },
      { a: 8, b: 14, set: "bar", cam: WIDE_L, tags: [{ w: 10, txt: "300 CAFFÈ AL GIORNO", y: 300, size: 64 }], stage: (t, A) => { barista(t, A); guests(t, A, 3); } },
      { a: 14, b: 22, set: "bar", cam: OTS, tags: [{ w: 14, txt: "PER ANNI", y: 290, col: GREY }], stage: (t, A) => { barista(t, A, { open: t > FILM.WT[21] - 0.05 ? talk(t) : 0, smile: 0.5 }); guests(t, A, 1); }, draw: (g, t) => C4.bubble(g, 420, 520, "Zucchero?", C4.pop2(t, FILM.WT[21] - 0.05), { tail: 1 }) },
      { a: 22, b: 26, set: "bar", cam: CASE, tags: [{ w: 24, txt: "NUOVA DOMANDA", y: 300, col: YEL }], stage: (t, A) => barista(t, A) },
      { a: 26, b: 37, set: "bar", cam: WIDE_R, stage: (t, A) => { barista(t, A); guests(t, A, 3); } },
      { a: 37, b: 43, set: "bar", cam: FACE, tags: [{ w: 41, txt: "4 PAROLE", y: 560, col: YEL, size: 76 }], stage: (t, A) => barista(t, A, { open: t < FILM.WT[41] - 0.2 ? talk(t) : 0, smile: 0.9, brow: 0.5, arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-1.0, -0.1, -0.7, 0, 0.15]] }), draw: (g, t) => C4.bubble(g, 540, 360, "Ci aggiungo un cornetto?", C4.pop2(t, FILM.WT[37] - 0.05), { tail: -0.4, size: 46 }) },
      { a: 43, b: 49, set: "bar", cam: WIDE_L, tags: [{ w: 46, txt: "1 SU 4 DICE SÌ", y: 300, col: GRN, fg: "#fff", size: 74 }], stage: (t, A) => { A.yesT = FILM.WT[47]; barista(t, A); guests(t, A, 4, 0); } },
      { a: 49, b: 56, set: "bar", cam: CASE, tags: [{ w: 50, txt: "+ 75", big: true, col: GRN, y: 400, size: 190 }, { w: 51, txt: "CORNETTI AL GIORNO", y: 540, size: 60 }], stage: (t, A) => barista(t, A) },
      { a: 56, b: 62, set: "bar", cam: PLATE, tags: [{ w: 60, txt: "0,70 € L'UNO", y: 300, col: YEL, size: 74 }], stage: (t, A) => { barista(t, A); A.plate.visible = true; A.cup.visible = true; } },
      { a: 62, b: 66, set: "bar", cam: TILL, tags: [{ w: 62, txt: "52 €", big: true, col: "#fff", y: 400, size: 170, sfx: "cash" }, { w: 64, txt: "AL GIORNO", y: 530 }], stage: (t, A) => barista(t, A) },
      { a: 66, b: 73, set: "bar", cam: FACE, tags: [{ w: 66, txt: "IN UN MESE", y: 290 }, { w: 71, txt: "+ 1.500 €", big: true, col: GRN, y: 420, size: 150, sfx: "cash" }], stage: (t, A) => barista(t, A, { smile: 1, brow: 0.5 }) },
      { a: 73, b: 79, set: "bar", cam: WIDE_R, tags: [{ w: 73, txt: "STESSI CLIENTI", y: 300 }, { w: 75, txt: "STESSO BANCONE", y: 410 }, { w: 77, txt: "ZERO PUBBLICITÀ", y: 520, col: YEL }], stage: (t, A) => { barista(t, A); guests(t, A, 3); } },
      { a: 79, b: 92, slide: true, set: "bar", cam: WIDE_L, tags: [{ w: 89, txt: "NON SERVONO CLIENTI NUOVI", y: 300, col: GREY, size: 58 }], stage: (t, A) => { barista(t, A); guests(t, A, 4); } },
      { a: 92, b: 103, set: "bar", cam: OTS, tags: [{ w: 95, txt: "LA DOMANDA GIUSTA", y: 300, col: GRN, fg: "#fff", size: 68 }], stage: (t, A) => { barista(t, A, { open: talk(t) * 0.6, smile: 0.95, arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-1.0, -0.1, -0.7, 0, 0.15]] }); guests(t, A, 1); } },
      { end: true, set: "bar", cam: { eye: [[-190, 185, 410], [-110, 178, 355]], look: [[10, 125, -140], [15, 125, -140]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 175, 280] }, stage: (t, A) => { barista(t, A); guests(t, A, 3); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
