/* "Risponde ai messaggi dopo sei ore. E il cliente ha già comprato da un altro." (negozio di bici) — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4, PI = Math.PI, s = Math.sin;
  const RED = "#FF2A3D", GRN = "#2fbf5a", GREY = "#b9bec6", YEL = "#f2d21c";
  const WIDE_L = { eye: [[-280, 215, 430], [-195, 195, 370]], look: [[10, 105, -120], [5, 105, -130]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 100, -180] };
  const WIDE_R = { eye: [[290, 215, 430], [205, 195, 370]], look: [[-10, 105, -120], [-5, 105, -130]], fov: [60, 56], ease: "drift", aperture: 0.6, focus: [0, 100, -180] };
  const DESK = { eye: [[30, 176, 190], [62, 166, 222]], look: [[230, 124, 338], [232, 126, 338]], fov: [46, 42], ease: "drift", aperture: 0.9 };
  const FACE = { eye: [[160, 170, 180], [176, 168, 214]], look: [[230, 172, 372], [230, 174, 372]], fov: [42, 38], ease: "drift", aperture: 1.6, focus: [230, 154, 372] };
  const REPAIR = { eye: [[215, 170, 30], [185, 164, -10]], look: [[55, 150, -150], [55, 152, -150]], fov: [46, 42], ease: "drift", aperture: 1.0 };
  const CUST = { eye: [[30, 172, 300], [5, 168, 265]], look: [[-80, 162, 80], [-80, 164, 80]], fov: [44, 40], ease: "drift", aperture: 1.2 };
  const LD = { keyPos: [-100, 310, 120], target: [230, 90, 340], pt: [[230, 200, 300], 1.1, "#ffe2c8"] }, LC = { target: [-80, 100, 80], pt: [[-80, 210, 140], 1.1, "#ffe2c8"] };
  const UB9 = (px) => '900 ' + px + 'px "Unbounded"', UB5 = (px) => '500 ' + px + 'px "Unbounded"';
  /* chat card: msgs = [[time, side(0 = incoming, 1 = outgoing), text, clock]] */
  const chat = (g, t, t0, title, msgs) => { const a = smooth(seg(t, t0, t0 + 0.3)); if (a <= 0) return; const y = 250 - (1 - a) * 30, h = 120 + msgs.length * 128; g.save(); g.globalAlpha = a; g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = "#ece5dd"; g.beginPath(); g.roundRect(140, y, 800, h, 30); g.fill(); g.shadowColor = "transparent"; g.fillStyle = "#1f6f5c"; g.beginPath(); g.roundRect(140, y, 800, 88, [30, 30, 0, 0]); g.fill(); g.fillStyle = "#fff"; g.font = UB9(32); g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(title, 180, y + 46);
    msgs.forEach((m, i) => { const p = C4.pop2(t, m[0]); if (p <= 0) return; const yy = y + 160 + i * 128; g.font = UB5(30); const w = Math.min(690, g.measureText(m[2]).width + 150), x = m[1] ? 920 - w : 160; g.save(); g.translate(x + (m[1] ? w : 0), yy); g.scale(p, p); g.fillStyle = m[1] ? "#d9fdd3" : "#fff"; g.beginPath(); g.roundRect(m[1] ? -w : 0, -48, w, 96, 22); g.fill(); g.fillStyle = "#1c1c1e"; g.font = UB5(30); g.textAlign = "left"; g.fillText(m[2], (m[1] ? -w : 0) + 24, -6); g.font = UB9(22); g.fillStyle = m[4] || "#7a8088"; g.textAlign = "right"; g.fillText(m[3], (m[1] ? 0 : w) - 20, 28); g.restore(); }); g.restore(); };
  const fix = (t, A) => { const p = [58, 0, -150], m = s(t * 7); A.put(A.o, C4.standPose(t, p, A.face(p, [0, 0, -220]), { seed: 2, over: { lean: 0.5, headPitch: 0.4, smile: 0.3, brow: -0.2, arm: [[-0.9 + m * 0.08, 0.1, -0.5 - m * 0.1, 0.1, 0.7], [-0.9 - m * 0.06, 0.1, -0.6 + m * 0.12, 0.2, 0.7]], sway: [0.02 * s(t * 7 - 0.6), 0, 0.03 * s(t * 7 - 0.9)] } })); };
  const seller = (t, A, c, mood, over) => A.put(c, C4.standPose(t, [230, 0, 372], PI, { seed: 2, over: Object.assign(mood === "bad" ? { smile: 0.08, brow: -0.5, browTilt: -0.25, headPitch: 0.3, arm: [[-0.5, -0.15, -1.5, 0.1, 0.5], [-0.5, -0.15, -1.5, 0.1, 0.5]] } : { smile: 0.95, brow: 0.4, headPitch: 0.22, arm: [[-0.5, -0.15, -1.5, 0.1, 0.5], [-0.5, -0.15, -1.5 + 0.03 * s(t * 14), 0.1, 0.45]] }, over || {}) }));
  const cust = (t, A, typing) => { const p = [-80, 0, 80]; A.put(A.c, C4.standPose(t, p, 0.35, { seed: 4, over: { smile: 0.7, headPitch: 0.3, arm: [[-0.45, -0.2, -1.5, 0.1, 0.5], [-0.45, -0.2, -1.5 + (typing ? 0.03 * s(t * 14) : 0), 0.1, 0.45]] } })); A.phone.visible = true; A.phone.position.set(p[0] + 9 + 4, 121, p[2] + 27); A.phone.rotation.set(-0.55, 0.35 + PI, 0); };
  const buy = (t, A, c) => { seller(t, A, c, "ok", { headPitch: 0.05, arm: [[-0.6, 0.1, -0.9, 0, 0.3], [-0.95, 0.0, -0.7 + 0.04 * s(t * 3), 0, 0.2]] }); A.put(A.c, C4.standPose(t, [230, 0, 272], 0, { seed: 4, over: { smile: 1, brow: 0.5, arm: [[0.04, 0, -0.16, 0, 0.5], [-0.85, 0.05, -0.8, 0, 0.3]] } })); };
  const FILM = C4.film({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, cta: [38, 49], motion: [46, 132], end: 124,
    sets: { sh: { type: "shop", args: ["bikes"], off: 0, light: "shop", grade: { contrast: 1.07, sat: 1.06, vignette: 0.55 } } },
    cast: (A, mk, ex) => {
      A.o = mk({ skin: "#e0a880", top: "#2a2f3a", bottom: "#1c1d22", hair: "#22160e", seed: 3, apron: "#c8232c", sleeves: "short" }, { beard: true, hairCol: "#22160e" });
      A.r = mk({ skin: "#f0c4a0", top: "#1f4fa8", bottom: "#1c1d22", hair: "#b08a4a", seed: 8, sleeves: "short" }, { glasses: true });
      A.c = mk({ skin: "#c98d62", top: "#c9962a", bottom: "#2a2a2e", hair: "#17120e", seed: 7 });
      A.phone = ex(C4.props.phone()); },
    shots: [
      { a: 0, b: 6, set: "sh", cam: REPAIR, stage: (t, A) => fix(t, A), draw: (g, t) => { const W = FILM.WT; chat(g, t, 0.02, "Negozio Bici", [[0.15, 0, "Avete questa bici?", "10:00"], [W[3] - 0.05, 1, "Sì, ce l'abbiamo", "16:00", "#FF2A3D"]]); C4.tag(g, 540, 700, "6 ORE DOPO", { col: RED, fg: "#fff", p: C4.pop2(t, W[4] - 0.05), size: 76 }); } },
      { a: 6, b: 15, set: "sh", cam: DESK, light: LD, tags: [{ w: 9, txt: "HA GIÀ COMPRATO", y: 300, col: RED, fg: "#fff", size: 64, sfx: "thud" }, { w: 12, txt: "DA UN ALTRO", y: 410 }], stage: (t, A) => buy(t, A, A.r) },
      { a: 15, b: 19, set: "sh", cam: WIDE_L, stage: (t, A) => fix(t, A) },
      { a: 19, b: 31, set: "sh", cam: CUST, light: LC, stage: (t, A) => cust(t, A, t < FILM.WT[30]), draw: (g, t) => { const W = FILM.WT; chat(g, t, W[19], "Negozio Bici", [[W[26] - 0.05, 1, "Avete questa bici, taglia M?", "10:00"]]); C4.tag(g, 540, 620, "ORE 10:00", { col: "#fff", p: C4.pop2(t, W[20] - 0.05), size: 64 }); } },
      { a: 31, b: 38, set: "sh", cam: REPAIR, tags: [{ w: 34, txt: "OCCUPATO", y: 300 }, { w: 36, txt: "RISPONDE ALLE 16:00", y: 410, col: RED, fg: "#fff", size: 62, sfx: "thud" }], stage: (t, A) => fix(t, A) },
      { a: 38, b: 49, set: "sh", cam: WIDE_R, stage: (t, A) => fix(t, A) },
      { a: 49, b: 51, set: "sh", cam: FACE, light: LD, tags: [{ w: 49, txt: "TROPPO TARDI", y: 320, col: RED, fg: "#fff", size: 96, sfx: "thud" }], stage: (t, A) => seller(t, A, A.o, "bad") },
      { a: 51, b: 64, slide: true, set: "sh", cam: CUST, light: LC, stage: (t, A) => cust(t, A, true), draw: (g, t) => { const W = FILM.WT; chat(g, t, W[51], "Altro negozio", [[W[59] - 0.05, 1, "Avete questa bici, taglia M?", "10:05"]]); C4.tag(g, 540, 620, "ORE 10:05", { col: "#fff", p: C4.pop2(t, W[52] - 0.05), size: 64 }); } },
      { a: 64, b: 74, set: "sh", cam: FACE, light: LD, stage: (t, A) => seller(t, A, A.r, "ok"), draw: (g, t) => { const W = FILM.WT; chat(g, t, W[64], "Altro negozio", [[W[64] + 0.1, 0, "Avete questa bici, taglia M?", "10:05"], [W[68] - 0.05, 1, "Sì, ce l'abbiamo. Passa quando vuoi", "10:06", "#2fbf5a"]]); C4.tag(g, 540, 700, "1 MINUTO DOPO", { col: GRN, fg: "#fff", p: C4.pop2(t, W[67] - 0.05), size: 70 }); } },
      { a: 74, b: 82, set: "sh", cam: DESK, light: LD, tags: [{ w: 74, txt: "ORE 11:00 · VENDUTA", y: 290, size: 60 }, { w: 80, txt: "900 €", big: true, col: GRN, y: 430, size: 170, sfx: "cash" }], stage: (t, A) => buy(t, A, A.r) },
      { a: 82, b: 93, set: "sh", cam: CUST, light: LC, tags: [{ w: 84, txt: "STA COMPRANDO ADESSO", y: 300, col: YEL, size: 58 }, { w: 89, txt: "SCRIVE A PIÙ NEGOZI", y: 410, size: 58 }], stage: (t, A) => cust(t, A, true) },
      { a: 93, b: 103, set: "sh", cam: FACE, light: LD, tags: [{ w: 94, txt: "VINCE CHI RISPONDE PER PRIMO", y: 300, col: YEL, size: 50 }, { w: 99, txt: "NON CHI È PIÙ BRAVO", y: 410, col: GREY, size: 54 }], stage: (t, A) => seller(t, A, A.o, "bad", { headPitch: 0.1, headYaw: -0.3 }) },
      { a: 103, b: 115, set: "sh", cam: FACE, light: LD, tags: [{ w: 104, txt: "1 · RISPOSTA AUTOMATICA", y: 290, size: 52 }, { w: 107, txt: "2 · ORARIO FISSO PER I MESSAGGI", y: 395, size: 46 }, { w: 113, txt: "3 · NUMERO DEDICATO", y: 500, size: 52 }], stage: (t, A) => seller(t, A, A.o, "ok", { headYaw: -0.3 }) },
      { a: 115, b: 124, set: "sh", cam: DESK, light: LD, tags: [{ w: 120, txt: "LA PUBBLICITÀ CHE COSTA MENO", y: 300, col: GRN, fg: "#fff", size: 50 }], stage: (t, A) => buy(t, A, A.o) },
      { end: true, set: "sh", cam: { eye: [[-190, 185, 420], [-110, 178, 365]], look: [[0, 120, -130], [10, 120, -130]], fov: [52, 50], ease: "drift", aperture: 5.5, focus: [-130, 175, 290] }, stage: (t, A) => fix(t, A) },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.filmBrowser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
