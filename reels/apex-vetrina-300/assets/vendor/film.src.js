/* "Ha messo in vetrina un vestito da trecento euro. Per vendere quello da centoventi." — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const XA = -95, XB = 95, ZP = -150;
  const BOTH = { eye: [[-50, 185, 430], [25, 176, 395]], look: [[0, 118, -150], [0, 120, -150]], fov: [58, 55], ease: "drift", aperture: 0.8 };
  const PANB = { eye: [[150, 165, 160], [205, 160, 110]], look: [[XB, 128, ZP], [XB, 130, ZP]], fov: [42, 38], ease: "drift", aperture: 1.1 };
  const PANA = { eye: [[-205, 160, 110], [-150, 165, 160]], look: [[XA, 128, ZP], [XA, 130, ZP]], fov: [38, 42], ease: "drift", aperture: 1.1 };
  const WIDE_L = { eye: [[-280, 215, 430], [-195, 195, 370]], look: [[10, 112, -110], [5, 112, -120]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 110, -150] };
  const WIDE_R = { eye: [[290, 215, 430], [205, 195, 370]], look: [[-10, 112, -110], [-5, 112, -120]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 110, -150] };
  const DESK = { eye: [[30, 176, 190], [62, 166, 222]], look: [[230, 124, 338], [232, 126, 338]], fov: [46, 42], ease: "drift", aperture: 0.9 };
  const FACE = { eye: [[168, 162, 195], [182, 160, 228]], look: [[230, 152, 372], [230, 154, 372]], fov: [34, 30], ease: "drift", aperture: 1.6, focus: [230, 154, 372] };
  const LD = { keyPos: [-100, 310, 120], target: [230, 90, 340], pt: [[230, 200, 300], 1.1, "#ffe2c8"] };
  const show = (A, both, k) => { A.mA.visible = true; A.mB.visible = !!both; if (both) A.mB.scale.setScalar(k === undefined ? 1 : k); };
  const price = (g, t, which, t0, col, scr) => { const p = C4.pop2(t, t0); if (p <= 0) return; const o = { col: col || "#fff", p, size: which === "A" ? 70 : 82, rot: which === "A" ? -3 : 3 }, tx = which === "A" ? "120 €" : "300 €"; if (scr) C4.tag(g, 540, 320, tx, Object.assign(o, { size: 110 })); else C4.wtag(g, [which === "A" ? XA : XB, 252, ZP], tx, o); };
  const look = (t, A, c, p, yaw, mood) => A.put(c, C4.standPose(t, p, yaw, { seed: 5, over: mood === "no" ? { smile: 0.1, brow: -0.3, headRoll: 0.12, headYaw: 0.2 * s(t * 0.8), arm: [[0.04, 0, -0.16, 0, 0.5], [-0.5, 0.1, -1.9, 0.2, 0.4]] } : { smile: 1, brow: 0.5, arm: [[0.04, 0, -0.16, 0, 0.5], [-1.2, 0.05, -0.3, 0, 0.15]] } }));
  const owner = (t, A, over) => A.put(A.o, C4.standPose(t, [230, 0, 372], PI, { seed: 2, over: Object.assign({ smile: 0.95, brow: 0.3, headYaw: 0.15 * s(t * 0.7), arm: [[-0.6, 0.1, -0.9, 0, 0.3], [-0.5, 0.1, -1.0, 0, 0.4]] }, over || {}) }));
  const bars = (g, t, t0) => { const a = smooth(seg(t, t0, t0 + 0.3)); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = "rgba(10,11,13,0.82)"; g.beginPath(); g.roundRect(170, 250, 740, 420, 28); g.fill(); const k1 = smooth(seg(t, t0 + 0.2, t0 + 0.7)), k2 = smooth(seg(t, t0 + 0.6, t0 + 1.1)); g.fillStyle = "#d9dce1"; g.fillRect(250, 620 - 300 * k1, 190, 300 * k1); g.fillStyle = "#2fbf5a"; g.fillRect(640, 620 - 120 * k2, 190, 120 * k2); g.font = '900 54px "Big Shoulders Display"'; g.textAlign = "center"; g.fillStyle = "#fff"; if (k1 > 0.9) g.fillText("300 €", 345, 300); if (k2 > 0.9) g.fillText("120 €", 735, 480); g.restore(); };
  const menu = (g, t, t0) => { const a = smooth(seg(t, t0, t0 + 0.3)); if (a <= 0) return; const x = 190, y = 280 - (1 - a) * 30, rows = [["Tagliata di manzo", 38, 1], ["Tagliatelle al ragù", 14, 0], ["Risotto ai funghi", 15, 0], ["Pollo arrosto", 16, 0]]; g.save(); g.globalAlpha = a; g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = "#f6efe4"; g.beginPath(); g.roundRect(x, y, 700, 420, 26); g.fill(); g.shadowColor = "transparent"; g.fillStyle = "#1c1c1e"; g.font = '900 40px "Unbounded"'; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("MENÙ", x + 46, y + 62);
    rows.forEach((r, i) => { const yy = y + 138 + i * 68; if (r[2]) { g.fillStyle = "rgba(255,42,61,0.16)"; g.fillRect(x + 24, yy - 30, 652, 60); } g.font = '500 31px "Unbounded"'; g.fillStyle = "#1c1c1e"; g.textAlign = "left"; g.fillText(r[0], x + 46, yy); g.textAlign = "right"; g.font = '900 38px "Unbounded"'; g.fillStyle = r[2] ? "#FF2A3D" : "#1c1c1e"; g.fillText(r[1] + " €", x + 654, yy); }); g.restore(); };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [29, 40], motion: [37, 133], end: 125,
    sets: { sh: { type: "shop", args: ["clothes"], off: 0, light: "shop", grade: { contrast: 1.06, sat: 1.06, vignette: 0.55 } } },
    cast: (A, mk, ex) => {
      A.o = mk({ skin: "#f0c4a0", top: "#1c1c1e", bottom: "#1c1c1e", hair: "#5a2e1a", hairStyle: "bun", seed: 5, eye: "#3a4a2a" });
      A.c = [mk({ skin: "#e6b08a", top: "#c9962a", bottom: "#1f2430", hair: "#3a2416", hairStyle: "long", seed: 4 }), mk({ skin: "#f6d6ba", top: "#2c3e57", bottom: "#23262e", hair: "#b08a4a", hairStyle: "long", seed: 8, lod: 1 })];
      A.mA = ex(C4.props.mannequin("#2f7f78")); A.mA.position.set(XA, 14, ZP); A.mB = ex(C4.props.mannequin("#17171a", true)); A.mB.position.set(XB, 14, ZP); },
    shots: [
      { a: 0, b: 9, set: "sh", cam: PANB, stage: (t, A) => show(A, true), draw: (g, t) => price(g, t, "B", FILM.WT[7] - 0.05, YEL, true) },
      { a: 9, b: 14, set: "sh", cam: PANA, stage: (t, A) => show(A, true), draw: (g, t) => price(g, t, "A", FILM.WT[13] - 0.05, GRN, true) },
      { a: 14, b: 18, set: "sh", cam: WIDE_L, stage: (t, A) => { show(A, true); owner(t, A); }, draw: (g, t) => { price(g, t, "A", 0); price(g, t, "B", 0); } },
      { a: 18, b: 29, set: "sh", cam: BOTH, tags: [{ w: 25, txt: "NON LO COMPRAVA NESSUNO", y: 300, size: 54 }, { w: 27, txt: "SEMBRAVA CARO", y: 410, col: RED, fg: "#fff" }], stage: (t, A, sh) => { show(A, false); const k = smooth(seg(t, FILM.WT[27], sh.t1 + 0.4)); look(t, A, A.c[0], [XA + 20 + k * 120, 0, -20 + k * 90], PI + 0.1 - k * 1.2, "no"); }, draw: (g, t) => price(g, t, "A", 0) },
      { a: 29, b: 40, set: "sh", cam: WIDE_R, stage: (t, A) => { show(A, false); owner(t, A); }, draw: (g, t) => price(g, t, "A", 0) },
      { a: 40, b: 48, slide: true, set: "sh", cam: BOTH, stage: (t, A) => show(A, true, C4.pop2(t, FILM.WT[44] - 0.1, 0.35)), draw: (g, t) => { price(g, t, "A", 0); price(g, t, "B", FILM.WT[47] - 0.05, YEL); } },
      { a: 48, b: 56, set: "sh", cam: PANA, tags: [{ w: 55, txt: "L'AFFARE", y: 300, col: GRN, fg: "#fff", size: 84, sfx: "cash" }], stage: (t, A) => { show(A, true); look(t, A, A.c[0], [XA + 70, 0, -40], PI + 0.5, "yes"); }, draw: (g, t) => 0 },
      { a: 56, b: 60, set: "sh", cam: BOTH, tags: [{ w: 56, txt: "STESSO VESTITO", x: 330, y: 310, rot: -3 }, { w: 58, txt: "STESSO PREZZO", x: 730, y: 420, rot: 2 }], stage: (t, A) => { show(A, true); look(t, A, A.c[0], [XA + 70, 0, -40], PI + 0.5, "yes"); }, draw: (g, t) => { price(g, t, "A", 0, GRN); price(g, t, "B", 0, YEL); } },
      { a: 60, b: 67, set: "sh", cam: WIDE_L, stage: (t, A) => { show(A, true); owner(t, A); }, draw: (g, t) => bars(g, t, FILM.WT[60]) },
      { a: 67, b: 71, set: "sh", cam: PANB, tags: [{ w: 69, txt: "EFFETTO ÀNCORA", y: 300, col: YEL, size: 84 }], stage: (t, A) => show(A, true) },
      { a: 71, b: 85, set: "sh", cam: BOTH, tags: [{ w: 72, txt: "1° PREZZO CHE VEDI: 300 €", y: 290, col: YEL, size: 56 }, { w: 79, txt: "IL 2° SEMBRA BASSO: 120 €", y: 400, col: GRN, fg: "#fff", size: 56 }], stage: (t, A) => { show(A, true); look(t, A, A.c[1], [20, 0, 10], PI - 0.2, "yes"); }, draw: (g, t) => { price(g, t, "A", 0, GRN); price(g, t, "B", 0, YEL); } },
      { a: 85, b: 96, slide: true, set: "sh", cam: WIDE_R, stage: (t, A) => { show(A, true); owner(t, A); }, draw: (g, t) => { menu(g, t, FILM.WT[87]); C4.tag(g, 540, 770, "IL PIÙ CARO STA IN ALTO", { col: RED, fg: "#fff", p: C4.pop2(t, FILM.WT[92] - 0.05), size: 58 }); } },
      { a: 96, b: 109, set: "sh", cam: FACE, light: LD, tags: [{ w: 97, txt: "NON SERVE A ESSERE VENDUTO", y: 290, col: GREY, size: 50 }, { w: 104, txt: "FA SEMBRARE GIUSTI GLI ALTRI", y: 400, col: GRN, fg: "#fff", size: 50 }], stage: (t, A) => owner(t, A, { headYaw: -0.3, smile: 1 }) },
      { a: 109, b: 125, set: "sh", cam: DESK, light: LD, tags: [{ w: 119, txt: "DIPENDE DA COSA GLI METTI ACCANTO", y: 300, col: YEL, size: 46 }], stage: (t, A) => { owner(t, A, { arm: [[-0.6, 0.1, -0.9, 0, 0.3], [-0.95, 0.0, -0.7 + 0.04 * s(t * 3), 0, 0.2]] }); const p = [230, 0, 272]; A.put(A.c[0], C4.standPose(t, p, 0, { seed: 4, over: { smile: 1, brow: 0.5, arm: [[0.04, 0, -0.16, 0, 0.5], [-0.85, 0.05, -0.8, 0, 0.3]] } })); } },
      { end: true, set: "sh", cam: { eye: [[-190, 185, 420], [-110, 178, 365]], look: [[0, 120, -130], [10, 120, -130]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 175, 290] }, stage: (t, A) => { show(A, true); owner(t, A); } },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
