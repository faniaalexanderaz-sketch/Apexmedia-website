/* "Ha alzato i prezzi. Ha perso clienti. E ora guadagna di più." (pizzeria) — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const WIDE = { eye: [[-300, 250, 425], [-215, 228, 395]], look: [[30, 95, 20], [25, 95, 10]], fov: [64, 60], ease: "drift", aperture: 0.6, focus: [60, 100, 0] };
  const WIDE_R = { eye: [[320, 250, 425], [240, 228, 395]], look: [[-50, 95, 20], [-45, 95, 10]], fov: [64, 60], ease: "drift", aperture: 0.6, focus: [-60, 100, -60] };
  const BOARD = { eye: [[60, 188, 70], [95, 194, 20]], look: [[190, 205, -316], [190, 206, -316]], fov: [46, 42], ease: "drift", aperture: 0.6 };
  const OVEN = { eye: [[-10, 172, 90], [-55, 162, 40]], look: [[-185, 126, -200], [-188, 128, -200]], fov: [46, 42], ease: "drift", aperture: 0.9 };
  const FACE = { eye: [[-70, 164, 30], [-95, 160, -10]], look: [[-150, 152, -176], [-150, 154, -176]], fov: [34, 30], ease: "drift", aperture: 1.6, focus: [-150, 154, -176] };
  const T1C = { eye: [[10, 158, 215], [62, 140, 150]], look: [[150, 105, 40], [182, 122, 40]], fov: [44, 34], ease: "inout", aperture: [0.8, 1.8], focus: [196, 124, 40] };
  const COUNTER = { eye: [[-40, 176, 70], [-80, 166, 25]], look: [[-170, 106, -112], [-172, 108, -112]], fov: [42, 38], ease: "drift", aperture: 1.0 };
  const EMPTY = { eye: [[10, 178, 350], [-40, 166, 305]], look: [[-170, 84, 150], [-170, 86, 150]], fov: [46, 42], ease: "drift", aperture: 1.0 };
  const PZ = [-150, 0, -176];
  const cook = (t, A, fast, over) => { const k = fast ? 9 : 4, m = s(t * k), n = s(t * k * 0.5 + 1); A.put(A.pz, C4.standPose(t, PZ, 0, { seed: 2, over: Object.assign({ lean: 0.24, headPitch: 0.3, smile: fast ? 0.15 : 0.85, brow: fast ? -0.4 : 0.3, browTilt: fast ? -0.2 : 0, twist: n * 0.06, arm: [[-0.85 + m * 0.07, 0.12, -0.75 - m * 0.1, 0.1, 0.5], [-0.85 - m * 0.07, 0.12, -0.75 + m * 0.1, 0.1, 0.5]], sway: [0.02 * s(t * k - 0.6), 0.02 * s(t * k * 0.5 - 0.4), 0.03 * s(t * k - 0.9)] }, over || {}) })); };
  const table = (t, A, i, a, b, oa, ob) => { const q = A.S.piz.tables[i]; if (a) A.put(a, C4.sitPose(t, [q[0] - 48, 0, q[1]], PI / 2, { seed: i * 3 + 1, over: Object.assign({ smile: 0.75, lean: 0.12, open: Math.max(0, s(t * 9 + i) * 0.5 + s(t * 5.3) * 0.4) * 0.8, arm: [[-0.85 - 0.2 * s(t * 2.3 + i), 0.22, -1.25 - 0.3 * s(t * 2.3 + i), 0.2, 0.25], [-0.6, 0.05, -1.2, 0, 0.6]] }, oa || {}) })); if (b) A.put(b, C4.sitPose(t, [q[0] + 48, 0, q[1]], -PI / 2, { seed: i * 3 + 2, over: Object.assign({ smile: 0.85, headYaw: 0.1 * s(t * 0.7 + i), headRoll: 0.05 * s(t * 0.9), arm: [[-0.62, 0.05, -1.25, 0, 0.5], [-0.62, 0.05, -1.25, 0, 0.5]] }, ob || {}) })); };
  const waiter = (t, A, x0, v, z) => { const x = x0 + t * v, ph = t * 1.15 * PI; A.put(A.wt, C4.walkPose(t, [x, 0, z], v > 0 ? PI / 2 : -PI / 2, 1.15, { seed: 5, over: { headYaw: v > 0 ? -0.3 : 0.3, arm: [[s(ph - 0.35) * 0.4, 0, -0.25, 0, 0.55], [-0.75, 0.12, -1.75, -0.4, 0.15]] } })); A.tray.visible = true; A.tray.position.set(x + (v > 0 ? 27 : -27), 132 + Math.cos(ph * 2 - 0.7) * 0.9, z - 22 * (v > 0 ? 1 : -1)); };
  const price = (A, nine) => { A.b6.visible = !nine; A.b9.visible = !!nine; };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [35, 46], motion: [43, 149], end: 141,
    sets: { piz: { type: "pizzeria", args: [], off: 0, light: "pizza", grade: { contrast: 1.05, sat: 1.0, vignette: 0.5 } } },
    cast: (A, mk, ex) => {
      A.pz = mk({ skin: "#e0a880", top: "#f1eee6", bottom: "#2a2c33", hair: "#2a1a10", seed: 9, hat: "chef", apron: "#b3261a", sleeves: "short" }, { beard: false });
      A.wt = mk({ skin: "#f0c4a0", top: "#efece4", bottom: "#15161a", hair: "#22160e", seed: 2, apron: "#1b1c20", bow: "#15161a", lod: 1 });
      A.g = [mk({ skin: "#c98d62", top: "#2c3e57", bottom: "#2a2a2e", hair: "#17120e", seed: 7 }), mk({ skin: "#f0c4a0", top: "#b23a48", bottom: "#1f2430", hair: "#5a2e1a", hairStyle: "long", seed: 4, eye: "#3a4a2a" }), mk({ skin: "#f6d6ba", top: "#4a5a3a", bottom: "#33363d", hair: "#b08a4a", seed: 8, lod: 1 }), mk({ skin: "#e6b08a", top: "#c9962a", bottom: "#1f2430", hair: "#3a2416", hairStyle: "bun", seed: 5, lod: 1 }), mk({ skin: "#f2c9a5", top: "#7b7f86", bottom: "#2a2a2e", hair: "#6a4a2a", seed: 3, lod: 1 })];
      A.b6 = ex(C4.props.menuBoard("MARGHERITA\n6 €")); A.b9 = ex(C4.props.menuBoard("MARGHERITA\n9 €")); [A.b6, A.b9].forEach((b) => b.position.set(190, 213, -314));
      A.tray = ex(C4.grp()); A.tray.add(C4.cyl(19, 19, 1.2, C4.MAT.paint("#c9ccd2", 0.25, 1), [0, 0, 0])); const p1 = C4.props.pizza(13); p1.position.y = 0.7; A.tray.add(p1); },
    shots: [
      { a: 0, b: 4, set: "piz", cam: BOARD, tags: [{ w: 1, txt: "+ 3 €", big: true, col: YEL, y: 1240, size: 130 }], stage: (t, A) => price(A, true) },
      { a: 4, b: 7, set: "piz", cam: EMPTY, tags: [{ w: 5, txt: "- 20 CLIENTI", y: 320, col: RED, fg: "#fff", size: 78 }], stage: (t, A) => price(A, true) },
      { a: 7, b: 12, set: "piz", cam: FACE, tags: [{ w: 9, txt: "+ 120 € A SERA", big: true, col: GRN, y: 400, size: 120, sfx: "cash" }], stage: (t, A, sh) => { price(A, true); cook(t, A, false, { headPitch: 0.0, lean: 0.08, headYaw: 0.25, smile: 1, brow: 0.5 }); } },
      { a: 12, b: 24, set: "piz", cam: WIDE, tags: [{ w: 14, txt: "MARGHERITA 6 €", x: 730, y: 300, col: YEL }, { w: 18, txt: "100 PIZZE A SERA", x: 730, y: 410, size: 56 }, { w: 22, txt: "600 €", big: true, x: 730, y: 550, col: "#fff", sfx: "cash" }], stage: (t, A) => { price(A, false); cook(t, A, true); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 1, A.g[2], A.g[3]); table(t, A, 2, A.g[4], null); } },
      { a: 24, b: 35, set: "piz", cam: OVEN, tags: [{ w: 24, txt: "SALA PIENA", x: 330, y: 310, rot: -3 }, { w: 26, txt: "FORNO SEMPRE ACCESO", x: 700, y: 420, rot: 2, size: 54 }, { w: 33, txt: "RESTAVA POCO", y: 540, col: RED, fg: "#fff", sfx: "thud" }], stage: (t, A) => { price(A, false); cook(t, A, true); } },
      { a: 35, b: 46, set: "piz", cam: WIDE_R, stage: (t, A, sh) => { price(A, false); cook(t, A, true); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 1, A.g[2], A.g[3]); waiter(t - sh.t0, A, 300, -62, -30); } },
      { a: 46, b: 53, slide: true, set: "piz", cam: BOARD, tags: [{ w: 51, txt: "DA 6 A 9 €", y: 1240, col: YEL, size: 90, sfx: "cash" }], stage: (t, A) => price(A, t > FILM.WT[51] - 0.08) },
      { a: 53, b: 60, set: "piz", cam: WIDE, tags: [{ w: 53, txt: "- 20 CLIENTI", x: 720, y: 320, col: RED, fg: "#fff", rot: -3 }, { w: 59, txt: "NE RESTANO 80", x: 740, y: 440, rot: 2 }], stage: (t, A) => { price(A, true); cook(t, A, false); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 2, A.g[2], A.g[3]); } },
      { a: 60, b: 67, set: "piz", cam: COUNTER, tags: [{ w: 60, txt: "80 PIZZE x 9 €", y: 300 }, { w: 65, txt: "720 €", big: true, col: GRN, y: 450, sfx: "cash" }], stage: (t, A) => { price(A, true); cook(t, A, false); } },
      { a: 67, b: 82, set: "piz", cam: OVEN, tags: [{ w: 67, txt: "+ 120 €", big: true, col: GRN, y: 400, size: 160, until: 74 }, { w: 68, txt: "A SERA", y: 530, until: 74 }, { w: 74, txt: "20 PIZZE IN MENO", y: 330, size: 70 }], stage: (t, A) => { price(A, true); cook(t, A, false); } },
      { a: 82, b: 90, set: "piz", cam: FACE, tags: [{ w: 82, txt: "IN UN MESE", y: 290 }, { w: 88, txt: "+ 3.000 €", big: true, col: GRN, y: 420, size: 150, sfx: "cash" }], stage: (t, A) => { price(A, true); cook(t, A, false, { headPitch: 0.0, lean: 0.08, headYaw: 0.25, smile: 1, brow: 0.5 }); } },
      { a: 90, b: 105, slide: true, set: "piz", cam: { eye: [[-120, 178, 470], [-200, 170, 430]], look: (t) => [lerp(40, 260, seg(t, FILM.WT[90], FILM.WT[105])), 118, 330], fov: [52, 50], ease: "drift", damp: 0.45, aperture: 0.6 }, tags: [{ w: 94, txt: "CERCAVA SOLO IL PREZZO", y: 310, col: GREY, size: 58 }, { w: 103, txt: "PER 50 CENTESIMI", y: 430, col: RED, fg: "#fff" }],
        stage: (t, A, sh) => { price(A, true); cook(t, A, false); table(t, A, 0, A.g[0], A.g[1]); const x = lerp(20, 300, seg(t, sh.t0, sh.t1 + 0.5)); A.put(A.g[4], C4.walkPose(t, [x, 0, 340], PI / 2, 1.5, { seed: 3, over: { smile: 0.15, headYaw: 0.1 } })); } },
      { a: 105, b: 115, set: "piz", cam: T1C, light: { target: [150, 90, 40], pt: [[150, 172, 40], 1.4, "#ffb46a"] }, tags: [{ w: 109, txt: "HA SCELTO LA PIZZA", y: 300 }], stage: (t, A) => { price(A, true); table(t, A, 0, A.g[0], A.g[1], null, { smile: 1, squint: 0.4 + 0.3 * s(t * 2), headPitch: -0.06, open: 0.3 + 0.2 * s(t * 8) }); } },
      { a: 115, b: 123, set: "piz", cam: COUNTER, tags: [{ w: 117, txt: "IL PREZZO ALTO VA GIUSTIFICATO", y: 300, size: 52 }, { w: 121, txt: "IMPASTO MIGLIORE", y: 420, col: YEL }], stage: (t, A) => { price(A, true); cook(t, A, false); } },
      { a: 123, b: 125, set: "piz", cam: BOARD, tags: [{ w: 123, txt: "INGREDIENTI RACCONTATI", y: 1240, col: YEL, size: 58 }], stage: (t, A) => price(A, true) },
      { a: 125, b: 129, set: "piz", cam: WIDE_R, tags: [{ w: 125, txt: "UN LOCALE CHE RICORDI", y: 310, col: YEL, size: 60 }], stage: (t, A) => { price(A, true); cook(t, A, false); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 2, A.g[2], A.g[3]); } },
      { a: 129, b: 141, set: "piz", cam: WIDE, stage: (t, A, sh) => { price(A, true); cook(t, A, false); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 2, A.g[2], A.g[3]); waiter(t - sh.t0, A, -320, 62, -30); } },
      { end: true, set: "piz", cam: { eye: [[-190, 180, 420], [-110, 172, 360]], look: [[10, 125, -80], [20, 125, -80]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 170, 280] }, stage: (t, A) => { price(A, true); cook(t, A, false); table(t, A, 0, A.g[0], A.g[1]); table(t, A, 2, A.g[2], A.g[3]); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
