/* "Questa palestra guadagna da chi non viene." — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c", CY = "#5ad0ff";
  const WIDE_L = { eye: [[-280, 215, 430], [-195, 195, 370]], look: [[10, 110, -120], [5, 110, -130]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 100, -180] };
  const WIDE_R = { eye: [[290, 215, 430], [205, 195, 370]], look: [[-10, 110, -120], [-5, 110, -130]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 100, -180] };
  const RUN = { eye: [[-250, 162, -296], [-225, 158, -292]], look: [[-60, 122, -196], [-60, 124, -196]], fov: [52, 48], ease: "drift", aperture: 1.3 };
  const DESK = { eye: [[20, 176, 190], [50, 166, 222]], look: [[210, 126, 338], [212, 128, 338]], fov: [46, 42], ease: "drift", aperture: 0.9 };
  const FACE = { eye: [[150, 162, 190], [165, 160, 225]], look: [[210, 152, 372], [210, 154, 372]], fov: [34, 30], ease: "drift", aperture: 1.6, focus: [210, 154, 372] };
  const RACK = { eye: [[120, 150, 150], [150, 142, 110]], look: [[345, 84, 20], [345, 86, 20]], fov: [40, 36], ease: "drift", aperture: 1.2 };
  const LD = { keyPos: [-100, 310, 120], target: [210, 90, 340], pt: [[210, 200, 300], 1.0, "#dfeaff"] };
  const run = (t, A, c, i, speed) => { const x = A.S.gym.tm[i]; A.put(c, C4.walkPose(t + i * 0.37, [x, 0, -196], PI, speed || 2.5, { seed: i + 1, over: { lean: 0.12, smile: 0.5 } })); c.g.position.y = 13; };
  const desk = (t, A, over) => A.put(A.rc, C4.standPose(t, [210, 0, 372], PI, { seed: 2, over: Object.assign({ smile: 0.9, headPitch: 0.05, arm: [[-0.6, 0.1, -0.9, 0, 0.3], [-0.5, 0.1, -1.0, 0, 0.4]] }, over || {}) }));
  const talk = (t) => Math.max(0, s(t * 10) * 0.5 + s(t * 6.1) * 0.35);
  /* 500 members as dots; the room holds 150 */
  const dots = (g, t, t0, mode, tm) => { const a = smooth(seg(t, t0, t0 + 0.3)); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = "rgba(10,11,13,0.82)"; g.beginPath(); g.roundRect(110, 270, 860, 640, 30); g.fill(); const k = mode === "all" ? 0 : smooth(seg(t, tm, tm + 0.6));
    for (let i = 0; i < 500; i++) { const x = 152 + (i % 25) * 32.3, y = 312 + Math.floor(i / 25) * 29.5, inn = i < 150; g.fillStyle = mode === "all" ? "#d9dce1" : inn ? (k > i / 150 ? "#2fbf5a" : "#d9dce1") : (mode === "rest" ? (k > (i - 150) / 350 ? "rgba(255,42,61,0.9)" : "#5c6370") : "#5c6370"); g.beginPath(); g.arc(x, y, 9.5, 0, 6.3); g.fill(); } g.restore(); };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [23, 34], motion: [31, 115], end: 107,
    sets: { gym: { type: "gym", args: [], off: 0, light: "gym", grade: { contrast: 1.08, sat: 1.08, vignette: 0.55 }, accent: "#FF2A3D" } },
    cast: (A, mk) => {
      A.rc = mk({ skin: "#e0a880", top: "#1a6f9a", bottom: "#15161a", hair: "#22160e", seed: 2, sleeves: "short" });
      A.m = [mk({ skin: "#f0c4a0", top: "#ff5a8a", bottom: "#1f2430", hair: "#5a2e1a", hairStyle: "bun", seed: 4, sleeves: "short", eye: "#3a4a2a" }), mk({ skin: "#c98d62", top: "#f2d21c", bottom: "#2a2a2e", hair: "#17120e", seed: 7, sleeves: "short", lod: 1 }), mk({ skin: "#f6d6ba", top: "#7b7f86", bottom: "#33363d", hair: "#b08a4a", seed: 8, sleeves: "short", lod: 1 })]; },
    shots: [
      { a: 0, b: 7, set: "gym", cam: WIDE_L, tags: [{ w: 2, txt: "GUADAGNA", x: 330, y: 320, rot: -3 }, { w: 4, txt: "DA CHI NON VIENE", x: 700, y: 430, col: RED, fg: "#fff", rot: 2 }], stage: (t, A) => run(t, A, A.m[0], 1) },
      { a: 7, b: 15, set: "gym", cam: DESK, light: LD, tags: [{ w: 7, txt: "500 ABBONATI", y: 290 }, { w: 9, txt: "x 40 € AL MESE", y: 395, size: 58 }, { w: 13, txt: "20.000 €", big: true, col: GRN, y: 530, size: 150, sfx: "cash" }], stage: (t, A) => { desk(t, A); const p = [210, 0, 272]; A.put(A.m[1], C4.standPose(t, p, 0, { seed: 4, over: { smile: 0.8 } })); } },
      { a: 15, b: 23, set: "gym", cam: WIDE_R, tags: [{ w: 19, txt: "POSTO PER 150", y: 300, col: CY, size: 78 }], stage: (t, A) => { run(t, A, A.m[0], 1); run(t, A, A.m[2], 3, 2.2); } },
      { a: 23, b: 34, set: "gym", cam: RUN, stage: (t, A) => { run(t, A, A.m[0], 1); run(t, A, A.m[2], 3, 2.2); } },
      { a: 34, b: 40, set: "gym", cam: WIDE_L, stage: (t, A) => run(t, A, A.m[0], 1), draw: (g, t) => { dots(g, t, FILM.WT[34], "all"); C4.tag(g, 540, 960, "500 PER 150 POSTI", { col: RED, fg: "#fff", p: C4.pop2(t, FILM.WT[37]), size: 62 }); } },
      { a: 40, b: 44, set: "gym", cam: WIDE_L, stage: (t, A) => run(t, A, A.m[0], 1), draw: (g, t) => { dots(g, t, FILM.WT[40] - 1, "cap", FILM.WT[42]); C4.tag(g, 540, 960, "NE VENGONO 150", { col: GRN, fg: "#fff", p: C4.pop2(t, FILM.WT[43] - 0.05), size: 62 }); } },
      { a: 44, b: 52, set: "gym", cam: WIDE_L, stage: (t, A) => run(t, A, A.m[0], 1), draw: (g, t) => { dots(g, t, FILM.WT[40] - 1, "rest", FILM.WT[46]); C4.tag(g, 540, 960, "350 PAGANO E RESTANO A CASA", { col: RED, fg: "#fff", p: C4.pop2(t, FILM.WT[47] - 0.05), size: 54 }); } },
      { a: 52, b: 63, slide: true, set: "gym", cam: DESK, light: LD, tags: [{ w: 58, txt: "GENNAIO", y: 290, col: YEL }, { w: 61, txt: "ABBONAMENTO ANNUALE", y: 400, size: 58 }], stage: (t, A) => { desk(t, A, { arm: [[-0.6, 0.1, -0.9, 0, 0.3], [-0.95, 0.0, -0.7 + 0.04 * s(t * 3), 0, 0.2]] }); const p = [210, 0, 272]; A.put(A.m[1], C4.standPose(t, p, 0, { seed: 4, over: { smile: 1, brow: 0.5, arm: [[0.04, 0, -0.16, 0, 0.5], [-0.85, 0.05, -0.8, 0, 0.3]] } })); } },
      { a: 63, b: 75, set: "gym", cam: RUN, tags: [{ w: 65, txt: "LA VERSIONE DI TE", y: 300, size: 60 }, { w: 71, txt: "3 VOLTE A SETTIMANA", y: 410, col: CY, size: 60 }], stage: (t, A) => run(t, A, A.m[0], 1, 2.9) },
      { a: 75, b: 87, set: "gym", cam: WIDE_R, tags: [{ w: 77, txt: "NON È UNA TRUFFA", y: 290, size: 60 }, { w: 84, txt: "PAGHI LA POSSIBILITÀ", x: 540, y: 400, col: GRN, fg: "#fff", size: 60 }, { w: 86, txt: "NON L'USO", y: 510, col: GREY }], stage: (t, A) => { run(t, A, A.m[0], 1); run(t, A, A.m[2], 3, 2.2); } },
      { a: 87, b: 97, set: "gym", cam: RACK, tags: [{ w: 90, txt: "PALESTRA", y: 290 }, { w: 93, txt: "STREAMING", y: 395 }, { w: 96, txt: "APP", y: 500 }], stage: () => 0 },
      { a: 97, b: 107, set: "gym", cam: FACE, light: LD, stage: (t, A) => desk(t, A, { open: talk(t) * 0.7, smile: 0.95, brow: 0.4, headYaw: -0.3 }), draw: (g, t) => { C4.bubble(g, 540, 330, "Cosa posso vendere", C4.pop2(t, FILM.WT[102] - 0.05), { tail: 0.3, size: 44 }); C4.bubble(g, 540, 450, "in abbonamento?", C4.pop2(t, FILM.WT[105] - 0.05), { tail: 0, size: 44 }); } },
      { end: true, set: "gym", cam: { eye: [[-190, 185, 420], [-110, 178, 365]], look: [[0, 120, -130], [10, 120, -130]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 175, 290] }, stage: (t, A) => { run(t, A, A.m[0], 1); run(t, A, A.m[2], 3, 2.2); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
