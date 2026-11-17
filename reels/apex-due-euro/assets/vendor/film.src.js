/* "Ha alzato il menù di due euro. Nessuno se n'è accorto. Sono diciottomila euro l'anno." (ristorante) — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const WIDE = { eye: [[-300, 250, 425], [-215, 228, 395]], look: [[30, 95, 20], [25, 95, 10]], fov: [64, 60], ease: "drift", aperture: 0.6, focus: [60, 100, 0] };
  const WIDE_R = { eye: [[320, 250, 425], [240, 228, 395]], look: [[-50, 95, 20], [-45, 95, 10]], fov: [64, 60], ease: "drift", aperture: 0.6, focus: [-60, 100, -60] };
  const BOARD = { eye: [[60, 188, 70], [95, 194, 20]], look: [[190, 205, -316], [190, 206, -316]], fov: [46, 42], ease: "drift", aperture: 0.6 };
  const FACE = { eye: [[-70, 164, 30], [-95, 160, -10]], look: [[-150, 152, -176], [-150, 154, -176]], fov: [34, 30], ease: "drift", aperture: 1.6, focus: [-150, 154, -176] };
  const T1C = { eye: [[10, 158, 215], [62, 140, 150]], look: [[150, 105, 40], [182, 122, 40]], fov: [44, 34], ease: "inout", aperture: [0.8, 1.8], focus: [196, 124, 40] };
  const T1W = { eye: [[-40, 170, 250], [0, 160, 215]], look: [[150, 100, 40], [152, 102, 40]], fov: [46, 42], ease: "drift", aperture: 0.9 };
  const COUNTER = { eye: [[-30, 180, 90], [-70, 170, 45]], look: [[-150, 128, -150], [-152, 130, -150]], fov: [44, 40], ease: "drift", aperture: 1.0 };
  const OP = [-150, 0, -176];
  const owner = (t, A, mood, over) => A.put(A.o, C4.standPose(t, OP, 0, { seed: 2, over: Object.assign(mood === "bad" ? { smile: 0.08, brow: -0.5, browTilt: -0.25, headPitch: 0.14, headYaw: 0.3 * s(t * 0.9), arm: [[-0.5, 0.1, -1.9, 0.2, 0.5], [-0.3, 0.05, -1.2, 0, 0.5]] } : { smile: 0.95, brow: 0.4, headYaw: 0.15 * s(t * 0.7), arm: [[-0.55, 0.1, -1.0, 0, 0.4], [-0.55, 0.1, -1.0, 0, 0.4]] }, over || {}) }));
  const table = (t, A, i, a, b, ob) => { const q = A.S.r.tables[i]; if (a) A.put(a, C4.sitPose(t, [q[0] - 48, 0, q[1]], PI / 2, { seed: i * 3 + 1, over: { smile: 0.8, lean: 0.12, open: Math.max(0, s(t * 9 + i) * 0.5 + s(t * 5.3) * 0.4) * 0.8, arm: [[-0.85 - 0.2 * s(t * 2.3 + i), 0.22, -1.25 - 0.3 * s(t * 2.3 + i), 0.2, 0.25], [-0.6, 0.05, -1.2, 0, 0.6]] } })); if (b) A.put(b, C4.sitPose(t, [q[0] + 48, 0, q[1]], -PI / 2, { seed: i * 3 + 2, over: Object.assign({ smile: 0.9, headYaw: 0.1 * s(t * 0.7 + i), headRoll: 0.05 * s(t * 0.9), arm: [[-0.62, 0.05, -1.25, 0, 0.5], [-0.62, 0.05, -1.25, 0, 0.5]] }, ob || {}) })); };
  const full = (t, A) => { table(t, A, 0, A.g[0], A.g[1]); table(t, A, 1, A.g[2], A.g[3]); table(t, A, 2, A.g[4], null); };
  const waiter = (t, A, x0, v, z) => { const x = x0 + t * v, ph = t * 1.15 * PI; A.put(A.wt, C4.walkPose(t, [x, 0, z], v > 0 ? PI / 2 : -PI / 2, 1.15, { seed: 5, over: { headYaw: v > 0 ? -0.3 : 0.3, arm: [[s(ph - 0.35) * 0.4, 0, -0.25, 0, 0.55], [-0.75, 0.12, -1.75, -0.4, 0.15]] } })); A.tray.visible = true; A.tray.position.set(x + (v > 0 ? 27 : -27), 132 + Math.cos(ph * 2 - 0.7) * 0.9, z - 22 * (v > 0 ? 1 : -1)); };
  const menu = (g, t, t0, flip, o) => { o = o || {}; const a = smooth(seg(t, t0, t0 + 0.3)); if (a <= 0) return; const x = 190, y = (o.y || 330) - (1 - a) * 30, rows = [["Antipasto", 9], ["Primo", 12], ["Secondo", 16], ["Dolce", 6]], k = smooth(seg(t, flip, flip + 0.35)); g.save(); g.globalAlpha = a; g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = "#f6efe4"; g.beginPath(); g.roundRect(x, y, 700, 420, 26); g.fill(); g.shadowColor = "transparent"; g.fillStyle = "#1c1c1e"; g.font = '900 40px "Unbounded"'; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("MENÙ", x + 46, y + 62);
    rows.forEach((r, i) => { const yy = y + 138 + i * 68; g.font = '500 34px "Unbounded"'; g.fillStyle = "#1c1c1e"; g.textAlign = "left"; g.fillText(r[0], x + 46, yy); g.textAlign = "right"; g.font = '900 38px "Unbounded"'; g.fillStyle = k > 0.5 ? "#FF2A3D" : "#1c1c1e"; g.fillText((r[1] + (k > 0.5 ? 2 : 0)) + " €", x + 654, yy); }); g.restore(); };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [32, 43], motion: [40, 117], end: 109,
    sets: { r: { type: "pizzeria", args: [{ trattoria: true }], off: 0, light: "pizza", grade: { contrast: 1.05, sat: 1.0, vignette: 0.5 } } },
    cast: (A, mk, ex) => {
      A.o = mk({ skin: "#e0a880", top: "#2a2f3a", bottom: "#1c1d22", hair: "#3a3a3a", seed: 9, apron: "#1b1c20", bow: "#7a1422" }, { glasses: true });
      A.wt = mk({ skin: "#f0c4a0", top: "#efece4", bottom: "#15161a", hair: "#22160e", seed: 2, apron: "#1b1c20", lod: 1 });
      A.g = [mk({ skin: "#c98d62", top: "#2c3e57", bottom: "#2a2a2e", hair: "#17120e", seed: 7 }), mk({ skin: "#f0c4a0", top: "#b23a48", bottom: "#1f2430", hair: "#5a2e1a", hairStyle: "long", seed: 4, eye: "#3a4a2a" }), mk({ skin: "#f6d6ba", top: "#4a5a3a", bottom: "#33363d", hair: "#b08a4a", seed: 8, lod: 1 }), mk({ skin: "#e6b08a", top: "#c9962a", bottom: "#1f2430", hair: "#3a2416", hairStyle: "bun", seed: 5, lod: 1 }), mk({ skin: "#f2c9a5", top: "#7b7f86", bottom: "#2a2a2e", hair: "#6a4a2a", seed: 3, lod: 1 })];
      A.bd = ex(C4.props.menuBoard("COPERTO\n+ 2 €")); A.bd.position.set(190, 213, -314);
      A.tray = ex(C4.grp()); A.tray.add(C4.cyl(19, 19, 1.2, C4.MAT.paint("#c9ccd2", 0.25, 1), [0, 0, 0])); const p1 = C4.props.dish(); p1.position.y = 0.7; p1.scale.setScalar(0.8); A.tray.add(p1); },
    shots: [
      { a: 0, b: 7, set: "r", cam: T1W, stage: (t, A) => table(t, A, 0, A.g[0], A.g[1]), draw: (g, t) => { menu(g, t, 0.02, FILM.WT[5] - 0.1); C4.tag(g, 800, 300, "+ 2 €", { col: YEL, p: C4.pop2(t, FILM.WT[5] - 0.05), size: 96, rot: 4 }); } },
      { a: 7, b: 11, set: "r", cam: T1C, light: { target: [150, 90, 40], pt: [[150, 172, 40], 1.4, "#ffb46a"] }, tags: [{ w: 7, txt: "NESSUNO SE N'È ACCORTO", y: 300, size: 58 }], stage: (t, A) => table(t, A, 0, A.g[0], A.g[1], { smile: 1, squint: 0.5 }) },
      { a: 11, b: 15, set: "r", cam: FACE, tags: [{ w: 12, txt: "+ 18.000 €", big: true, col: GRN, y: 400, size: 150, sfx: "cash" }, { w: 14, txt: "L'ANNO", y: 530 }], stage: (t, A) => owner(t, A, "good", { headYaw: 0.25 }) },
      { a: 15, b: 21, set: "r", cam: WIDE, tags: [{ w: 17, txt: "30 COPERTI A SERA", x: 700, y: 300, size: 62 }], stage: (t, A) => { owner(t, A, "bad"); full(t, A); } },
      { a: 21, b: 32, set: "r", cam: FACE, stage: (t, A) => owner(t, A, "bad"), draw: (g, t) => { C4.bubble(g, 540, 330, "Se alzo i prezzi,", C4.pop2(t, FILM.WT[25] - 0.05), { tail: -0.3, size: 44 }); C4.bubble(g, 540, 450, "li perdo tutti", C4.pop2(t, FILM.WT[29] - 0.05), { tail: 0, size: 44 }); } },
      { a: 32, b: 43, set: "r", cam: WIDE_R, stage: (t, A, sh) => { owner(t, A, "bad"); full(t, A); waiter(t - sh.t0, A, 300, -62, -30); } },
      { a: 43, b: 53, slide: true, set: "r", cam: BOARD, tags: [{ w: 47, txt: "2 € IN PIÙ A COPERTO", y: 1240, col: YEL, size: 66 }], stage: (t, A) => { A.bd.visible = true; } },
      { a: 53, b: 57, set: "r", cam: WIDE, tags: [{ w: 53, txt: "30 x 2 €", x: 700, y: 300 }, { w: 53, dt: 0.3, txt: "60 €", big: true, x: 700, y: 450, col: "#fff", sfx: "cash" }, { w: 55, txt: "A SERA", x: 700, y: 580 }], stage: (t, A) => { A.bd.visible = true; owner(t, A, "good"); full(t, A); } },
      { a: 57, b: 62, set: "r", cam: FACE, tags: [{ w: 57, txt: "300 SERE L'ANNO", y: 290, size: 62 }, { w: 60, txt: "18.000 €", big: true, col: GRN, y: 420, size: 160, sfx: "cash" }], stage: (t, A) => owner(t, A, "good", { headYaw: 0.25 }) },
      { a: 62, b: 68, set: "r", cam: T1C, light: { target: [150, 90, 40], pt: [[150, 172, 40], 1.4, "#ffb46a"] }, tags: [{ w: 64, txt: "NESSUNO HA DETTO NIENTE", y: 300, size: 56 }], stage: (t, A) => table(t, A, 0, A.g[0], A.g[1], { smile: 1, squint: 0.5 }) },
      { a: 68, b: 78, set: "r", cam: WIDE_R, tags: [{ w: 72, txt: "NON IL PREZZO ESATTO", x: 360, y: 310, col: GREY, size: 56, rot: -3 }, { w: 75, txt: "COME SONO STATI", x: 700, y: 430, col: GRN, fg: "#fff", size: 60, rot: 2 }], stage: (t, A, sh) => { A.bd.visible = true; owner(t, A, "good"); full(t, A); waiter(t - sh.t0, A, 300, -62, -30); } },
      { a: 78, b: 92, set: "r", cam: COUNTER, tags: [{ w: 83, txt: "QUASI TUTTO GUADAGNO", y: 290, col: GRN, fg: "#fff", size: 60 }, { w: 86, txt: "STESSA CUCINA", y: 400, size: 54 }, { w: 88, txt: "STESSO AFFITTO", y: 495, size: 54 }, { w: 90, txt: "STESSO PERSONALE", y: 590, size: 54 }], stage: (t, A) => owner(t, A, "good") },
      { a: 92, b: 109, slide: true, set: "r", cam: WIDE, tags: [{ w: 97, txt: "NON È UN PROBLEMA DI CLIENTI", x: 640, y: 300, col: GREY, size: 46 }, { w: 101, txt: "È PAURA DI + 2 €", x: 700, y: 410, col: RED, fg: "#fff", size: 64 }], stage: (t, A, sh) => { A.bd.visible = true; owner(t, A, "good"); full(t, A); waiter(t - sh.t0, A, -320, 55, -30); } },
      { end: true, set: "r", cam: { eye: [[-190, 180, 420], [-110, 172, 360]], look: [[10, 125, -80], [20, 125, -80]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 170, 280] }, stage: (t, A) => { owner(t, A, "good"); full(t, A); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
