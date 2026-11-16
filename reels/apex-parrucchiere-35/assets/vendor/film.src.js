/* "Il parrucchiere da 10 euro ha chiuso. Quello da 35 ha la fila." — Apex Media, Engine 4 */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4;
  const WT = __W__, VOEND = __VOEND__, D = Math.round((VOEND + 3.0) * 30) / 30;
  const CH = 3000, PR = 6000, PI = Math.PI, CTA1 = WT[40], CTA1E = WT[53] - 0.3, END = WT[119] - 0.12;
  const walkX = (t) => -235 - (t - WT[94]) * 100;
  const cut = (a, b, set, cam, extra) => Object.assign({ t0: a, t1: b, trans: "cut", set, cam }, extra || {});
  const GC = { contrast: 1.03, sat: 0.84, vignette: 0.5 }, GP = { contrast: 1.07, sat: 1.1, vignette: 0.55 }, GS = { contrast: 1.06, sat: 1.05, vignette: 0.55 };
  const FILM = { D, fps: 30, grade: GP, envBg: "#0d0a08",
    shots: [
      cut(0, WT[15], "street", { eye: [[-290, 172, 660], [0, 168, 700], [245, 162, 650]], look: [[-262, 165, 0], [0, 152, 0], [262, 138, 60]], fov: [50, 52], ease: "inout", damp: 0.3, aperture: 0.5 }, { grade: GS }),
      cut(WT[15], WT[26], "cheap", { eye: [[CH + 265, 205, 390], [CH + 180, 182, 335]], look: [[CH - 40, 118, -150], [CH - 20, 118, -160]], fov: [56, 52], ease: "drift", aperture: 0.6, focus: [CH + 20, 110, -175] }, { grade: GC }),
      cut(WT[26], CTA1, "cheap", { eye: [[CH + 250, 172, 110], [CH + 215, 164, 70]], look: [[CH + 30, 150, -172], [CH + 32, 152, -172]], fov: [46, 43], ease: "drift", aperture: 1.0 }, { grade: GC }),
      cut(CTA1, WT[53], "street", { eye: [[150, 168, 760], [215, 160, 600], [255, 152, 470]], look: [[250, 150, 40], [285, 140, 40]], fov: [48, 44], ease: "drift", aperture: 0.6 }, { grade: GS }),
      Object.assign(cut(WT[53], WT[64], "prem", { eye: [[PR - 270, 205, 400], [PR - 170, 182, 335]], look: [[PR + 40, 118, -150], [PR + 20, 118, -160]], fov: [56, 51], ease: "drift", aperture: 0.7, focus: [PR + 20, 110, -175] }), { trans: "slide" }),
      cut(WT[64], WT[72], "prem", { eye: [[PR - 120, 160, -238], [PR - 96, 158, -228]], look: [[PR + 48, 150, -168], [PR + 52, 152, -166]], fov: [36, 32], ease: "drift", aperture: 1.6, focus: [PR + 54, 152, -166] }),
      cut(WT[72], WT[77], "prem", { eye: [[PR - 190, 160, 60], [PR - 135, 150, 15]], look: [[PR + 12, 122, -200], [PR + 16, 124, -200]], fov: [44, 41], ease: "drift", aperture: 1.0 }),
      cut(WT[77], WT[81], "prem", { eye: [[PR - 40, 128, 405], [PR - 72, 116, 372]], look: [[PR - 236, 98, 300], [PR - 232, 96, 300]], fov: [40, 37], ease: "drift", aperture: 1.4, focus: [PR - 205, 52, 300] }, { key: "coffee" }),
      cut(WT[81], WT[85], "prem", { eye: [[PR + 96, 156, 205], [PR + 122, 146, 176]], look: [[PR + 286, 104, 62], [PR + 288, 106, 62]], fov: [42, 39], ease: "drift", aperture: 1.2 }, { key: "wash" }),
      cut(WT[85], WT[88], "prem", { eye: [[PR - 165, 152, 30], [PR - 130, 148, -5]], look: [[PR + 22, 130, -195], [PR + 24, 132, -198]], fov: [36, 33], ease: "drift", aperture: 0.9 }, { key: "advice" }),
      cut(WT[88], WT[94], "prem", { eye: [[PR + 165, 152, -10], [PR + 135, 148, -44]], look: [[PR - 38, 132, -150], [PR - 40, 132, -152]], fov: [46, 43], ease: "drift", aperture: 0.8 }, { key: "photo" }),
      Object.assign(cut(WT[94], WT[105], "street", { eye: [[-130, 172, 720], [-330, 166, 690]], look: (t) => [walkX(t) - 60, 118, 150], fov: [52, 50], ease: "drift", damp: 0.45, aperture: 0.5 }, { grade: GS }), { trans: "slide" }),
      cut(WT[105], WT[109] + 0.15, "street", { eye: [[140, 166, 570], [185, 160, 505]], look: [[330, 132, 60], [338, 132, 60]], fov: [46, 43], ease: "drift", aperture: 0.7 }, { grade: GS, key: "back" }),
      cut(WT[109] + 0.15, END, "cheap", { eye: [[CH - 10, 190, 490], [CH + 28, 176, 430]], look: [[CH + 228, 138, 226], [CH + 230, 140, 226]], fov: [44, 41], ease: "drift", aperture: 1.0 }, { grade: GC, key: "agenda" }),
      cut(END, D, "prem", { eye: [[PR - 170, 172, 390], [PR - 95, 166, 335]], look: [[PR, 130, -150], [PR + 10, 130, -150]], fov: [50, 48], ease: "drift", aperture: 5.5, focus: [PR - 120, 165, 250] }, { key: "end" }),
    ],
  };
  FILM.WT = WT; FILM.sfx = [["whoosh", WT[15], 0.2], ["whoosh", WT[26], 0.18], ["pop", WT[18], 0.3], ["pop", WT[26], 0.3], ["cash", WT[30], 0.32], ["pop", WT[33], 0.25], ["pop", WT[34], 0.25], ["pop", WT[36], 0.25], ["thud", WT[39], 0.5], ["swoosh", CTA1 - 0.1, 0.3], ["ding", WT[50], 0.22], ["swoosh", WT[53] - 0.12, 0.34], ["pop", WT[56], 0.3], ["cash", WT[63], 0.32], ["whoosh", WT[64], 0.16], ["pop", WT[69], 0.3], ["whoosh", WT[72], 0.14], ["pop", WT[77], 0.28], ["pop", WT[81], 0.28], ["pop", WT[85], 0.28], ["pop", WT[88], 0.28], ["shutter", WT[89], 0.34], ["swoosh", WT[94] - 0.12, 0.32], ["pop", WT[102], 0.28], ["whoosh", WT[105], 0.16], ["whoosh", WT[109] + 0.15, 0.16], ["pop", WT[112], 0.28], ["pop", WT[116], 0.28], ["whoosh", END, 0.2], ["ding", WT[132], 0.26]];
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE === "undefined") return;
  const T = THREE, { props, grp } = C4, A = {}, s = Math.sin;
  const LIGHT = {
    street: { keyPos: [560, 430, 640], target: [250, 80, 150], key: 1.25, keyCol: "#ffd2a0", fillPos: [-600, 300, 700], fill: 0.9, fillCol: "#6f8fd0", rimPos: [-200, 520, 120], rim: 0.75, rimCol: "#9fb4ff", sky: "#3a4a78", ground: "#2a2018", amb: 0.72, pt: [[382, 150, 100], 1.7, "#ffb46a"], bg: "#0e1424", fog: ["#141a2c", 0.00034] },
    cheap: { keyPos: [CH + 130, 305, 270], target: [CH, 90, -160], key: 0.85, keyCol: "#e6efff", fillPos: [CH - 300, 250, 300], fill: 0.45, fillCol: "#d5e2ff", rimPos: [CH + 300, 280, -250], rim: 0.45, rimCol: "#ffffff", sky: "#c5d0dc", ground: "#5a5f66", amb: 0.5, pt: [[CH, 250, -100], 0.6, "#e6efff"], bg: "#0d0f12", fog: ["#1a1d22", 0.0002] },
    prem: { keyPos: [PR - 250, 310, 285], target: [PR + 20, 90, -170], key: 1.45, keyCol: "#ffd9b0", fillPos: [PR - 400, 220, 100], fill: 0.8, fillCol: "#8fb0ff", rimPos: [PR + 320, 260, -280], rim: 1.6, rimCol: "#ff9a50", sky: "#6b5648", ground: "#2c170c", amb: 0.75, pt: [[PR, 180, -150], 1.5, "#ffb46a"], bg: "#0b0807", fog: ["#22160d", 0.0006] },
  };
  const LOVR = { coffee: { target: [PR - 220, 60, 300], pt: [[PR - 205, 150, 300], 1.5, "#ffb46a"] }, wash: { keyPos: [PR + 80, 300, 300], target: [PR + 280, 90, 60], pt: [[PR + 250, 190, 90], 1.4, "#ffb46a"] }, end: {}, agenda: { keyPos: [CH + 60, 300, 420], target: [CH + 235, 90, 228] }, back: {}, advice: {}, photo: {} };
  FILM.build = (sc) => {
    sc.background = new T.Color("#0b0807"); sc.fog = new T.FogExp2("#22160d", 0.0006);
    A.sets = { street: C4.sets.street(), cheap: C4.sets.salon(false), prem: C4.sets.salon(true) }; A.sets.cheap.position.x = CH; A.sets.prem.position.x = PR;
    Object.keys(A.sets).forEach((k) => { const g = A.sets[k]; sc.add(g); g.updateMatrixWorld(true); A[k] = g.userData.A; if (C4.quality.bake !== false) C4.bake(g); if (A[k].dust) { A[k].dust.position.x = g.position.x; sc.add(A[k].dust); } });
    A.L = C4.threePoint(sc, Object.assign({}, LIGHT.prem, { angle: 0.85 })); A.pt = new T.PointLight("#ffb46a", 1.4, 520, 1.5); sc.add(A.pt);
    const mk = (o, d) => { const c = C4.character(o); if (d) C4.dress(c, d); sc.add(c.g); return c; };
    A.sc1 = props.scissors(); A.sc1.position.set(0, -9, 3); A.sc1.rotation.x = -1.2; A.sc2 = props.scissors(); A.sc2.position.set(0, -9, 3); A.sc2.rotation.x = -1.2;
    A.bC = mk({ skin: "#e0a880", top: "#e9e9e6", bottom: "#2a2d33", hair: "#2a1a10", seed: 3, apron: "#6d7278", sleeves: "short" }, { rightHand: A.sc1 });
    A.bP = mk({ skin: "#e6b08a", top: "#1b1c20", bottom: "#23262e", hair: "#1c120c", seed: 6, apron: "#7a4a24" }, { beard: true, hairCol: "#1c120c", rightHand: A.sc2 });
    A.g1 = mk({ skin: "#f0c4a0", top: "#4a5a3a", bottom: "#23262e", hair: "#5a3a1e", seed: 2 });
    A.g2 = mk({ skin: "#e6b08a", top: "#c9962a", bottom: "#1f2430", hair: "#3a2416", hairStyle: "long", seed: 4, eye: "#3a4a2a", lod: 1 });
    A.g3 = mk({ skin: "#c98d62", top: "#22324e", bottom: "#2a2a2e", hair: "#17120e", hairStyle: "bald", seed: 7, lod: 1 }, { beanie: "#b23a48" });
    A.g4 = mk({ skin: "#f2c9a5", top: "#2f7f78", bottom: "#1f2430", hair: "#6a3a22", hairStyle: "bun", seed: 5, lod: 1 }, { glasses: true });
    A.g5 = mk({ skin: "#f6d6ba", top: "#7b7f86", bottom: "#33363d", hair: "#b08a4a", seed: 8, lod: 1 });
    A.all = [A.bC, A.bP, A.g1, A.g2, A.g3, A.g4, A.g5];
    A.capeC = props.cape("#3a3d42"); A.capeC.position.set(CH, 48, -180); sc.add(A.capeC); A.capeP = props.cape("#16171a"); A.capeP.position.set(PR, 48, -180); sc.add(A.capeP); A.capeW = props.cape("#16171a"); A.capeW.position.set(PR + 262, 48, 60); A.capeW.rotation.z = 0.0; sc.add(A.capeW);
    A.cup = props.cup(); A.cup.position.set(PR - 205, 46, 300); A.cup.scale.setScalar(1.25); sc.add(A.cup); A.phone = props.phone(); sc.add(A.phone); A.agenda = props.agenda(); A.agenda.position.set(CH + 250, 105.5, 214); A.agenda.rotation.y = -PI / 2; sc.add(A.agenda);
    A.extras = [A.capeC, A.capeP, A.capeW, A.cup, A.phone, A.agenda]; A.caps = C4.parseCaps(FILM.capsText);
  };
  const face = (a, b) => Math.atan2(b[0] - a[0], b[2] - a[2]), put = (c, p) => { c.g.visible = true; c.pose(p); };
  function stage(t, sh) {
    const L = Object.assign({}, LIGHT[sh.set], LOVR[sh.key] || {}), R = A.L; C4.scene.background.set(L.bg); C4.scene.fog.color.set(L.fog[0]); C4.scene.fog.density = L.fog[1];
    Object.keys(A.sets).forEach((k) => { A.sets[k].visible = k === sh.set; if (A[k].dust) { A[k].dust.visible = k === sh.set; if (k === sh.set) A[k].dust.userData.update(t); } });
    R.key.position.set(L.keyPos[0], L.keyPos[1], L.keyPos[2]); R.key.target.position.set(L.target[0], L.target[1], L.target[2]); R.key.target.updateMatrixWorld(); R.key.color.set(L.keyCol); R.key.intensity = L.key; R.fill.position.set(L.fillPos[0], L.fillPos[1], L.fillPos[2]); R.fill.color.set(L.fillCol); R.fill.intensity = L.fill;
    R.rim.position.set(L.rimPos[0], L.rimPos[1], L.rimPos[2]); R.rim.target.position.set(L.target[0], L.target[1], L.target[2]); R.rim.target.updateMatrixWorld(); R.rim.color.set(L.rimCol); R.rim.intensity = L.rim; R.hemi.color.set(L.sky); R.hemi.groundColor.set(L.ground); R.hemi.intensity = L.amb;
    A.pt.position.set(L.pt[0][0], L.pt[0][1], L.pt[0][2]); A.pt.color.set(L.pt[2]); A.pt.intensity = L.pt[1] * (1 + 0.03 * s(t * 2.1) + 0.02 * s(t * 5.3));
    A.all.forEach((c) => (c.g.visible = false)); A.extras.forEach((e) => (e.visible = false)); if (sh.set === "street") A.street.pole.userData.tex.offset.y = -t * 0.35;
  }
  const queue = (t, n) => { const Q = [[A.g2, [325, 0, 150]], [A.g3, [258, 0, 172]], [A.g4, [190, 0, 190]], [A.g5, [122, 0, 212]]]; Q.slice(0, n).forEach((q, i) => { const y = face(q[1], [400, 0, 60]); put(q[0], C4.standPose(t, q[1], y, { seed: i * 2.3 + 1, over: i === 1 ? { headPitch: 0.3, arm: [[0.04, 0, -0.16, 0, 0.5], [-0.55, 0.1, -1.7, 0.2, 0.3]] } : i === 2 ? { headYaw: 0.5 * s(t * 0.8), smile: 0.8 } : { smile: 0.7 } })); }); };
  const cheapWork = (t, tired) => { put(A.g5, C4.sitPose(t, [CH, 0, -180], PI, { seed: 2, over: { hipY: 53, headPitch: 0.08, smile: 0.3 } })); A.capeC.visible = true; const bp = [CH + 54, 0, -166]; put(A.bC, C4.cutPose(t, bp, face(bp, [CH, 0, -180]), { seed: 1, speed: 11, over: { smile: 0.12, brow: -0.5, browTilt: -0.22, squint: 0.25 + tired * 0.2 } })); };
  const premWork = (t, over, cOver) => { put(A.g1, C4.sitPose(t, [PR, 0, -180], PI, { seed: 4, over: Object.assign({ hipY: 53, smile: 0.85, headYaw: 0.12 * s(t * 0.8) }, cOver || {}) })); A.capeP.visible = true; const bp = [PR + 54, 0, -166]; put(A.bP, C4.cutPose(t, bp, face(bp, [PR, 0, -180]), { seed: 2, speed: 5, calm: true, over: Object.assign({ smile: 0.85, brow: 0.3 }, over || {}) })); };
  const sofaGuest = (t, reach) => put(A.g2, C4.sitPose(t, [PR - 292, 0, 300], PI / 2, { seed: 6, over: { hipY: 50, smile: 0.9, headPitch: 0.1 + reach * 0.12, lean: 0.08 + reach * 0.16, arm: [[-0.5, 0.05, -1.1, 0, 0.6], [-0.75 - reach * 0.5, 0.05, -1.0 + reach * 0.35, 0, 0.35]] } }));
  FILM.update = (t, c, sh) => { stage(t, sh); const k = sh.key, u = c.u;
    if (sh.set === "street") { if (k === "back") { queue(t, 3); const p0 = [300, 0, 262], p1 = [378, 0, 70], q = smooth(seg(t, sh.t0, sh.t1 + 0.6)), pos = [lerp(p0[0], p1[0], q), 0, lerp(p0[2], p1[2], q)]; put(A.g1, C4.walkPose(t, pos, face(p0, p1), 1.5, { seed: 1, over: { smile: 0.9 } })); }
      else if (sh.t0 >= WT[94] - 0.01) { put(A.g5, C4.walkPose(t, [walkX(t), 0, 172], -PI / 2, 1.62, { seed: 3, over: { headYaw: -0.1, smile: 0.2 } })); }
      else queue(t, 4); return; }
    if (sh.set === "cheap") { if (k === "agenda") { const bp = [CH + 196, 0, 226]; put(A.bC, C4.standPose(t, bp, PI / 2, { seed: 1, over: { lean: 0.3, headPitch: 0.5, smile: 0.05, brow: -0.6, browTilt: -0.3, squint: 0.4, arm: [[-0.7, 0.12, -0.5, 0, 0.3], [-0.35 + 0.05 * s(t * 2), -0.1, -2.2 + 0.06 * s(t * 3.1), 0.2, 0.5]] } })); A.agenda.visible = true; return; }
      cheapWork(t, sh.t0 > WT[20] ? 1 : 0); put(A.g3, C4.sitPose(t, [CH - 330, 0, 60], PI / 2, { seed: 5, over: { headPitch: 0.25, hipY: 50 } })); put(A.g4, C4.sitPose(t, [CH - 330, 0, 122], PI / 2, { seed: 7, over: { headYaw: 0.4 * s(t * 0.7), hipY: 50 } })); put(A.g2, C4.standPose(t, [CH - 250, 0, 250], PI / 2 + 0.5, { seed: 9, over: { headYaw: -0.3 } })); return; }
    /* premium */
    if (k === "coffee") { const r = smooth(seg(t, sh.t0 + 0.2, sh.t1 - 0.2)); sofaGuest(t, r); A.cup.visible = true; return; }
    if (k === "wash") { put(A.g4, C4.sitPose(t, [PR + 262, 0, 60], -PI / 2, { seed: 3, over: { hipY: 52, lean: -0.36, headPitch: -0.5, smile: 0.95, squint: 0.9 } })); A.capeW.visible = true; const m = s(t * 4.2); put(A.bP, C4.standPose(t, [PR + 322, 0, 112], PI + 0.25, { seed: 2, over: { lean: 0.22, headPitch: 0.3, smile: 0.8, arm: [[-0.95 + m * 0.05, 0.1, -0.85 - m * 0.08, 0.1, 0.45], [-0.95 - m * 0.05, 0.1, -0.85 + m * 0.08, 0.1, 0.45]] } })); return; }
    if (k === "advice") { const n = s(t * 5) * 0.06; premWork(t, { headPitch: 0.05, headYaw: -0.25, lean: 0.08, open: Math.max(0, s(t * 9) * 0.5), arm: [[-0.5, 0.1, -1.0, 0, 0.5], [-1.5 + 0.05 * s(t * 3), -0.1, -0.12, 0, 0.12]] }, { headPitch: 0.06 + n }); return; }
    if (k === "photo") { const bp = [PR - 62, 0, -120]; put(A.g1, C4.sitPose(t, [PR, 0, -180], PI - 0.9, { seed: 4, over: { hipY: 53, smile: 1, headYaw: 0.1 } })); A.capeP.visible = true; A.capeP.rotation.y = 0; put(A.bP, C4.standPose(t, bp, face(bp, [PR, 0, -180]), { seed: 2, over: { smile: 0.9, headPitch: 0.05, arm: [[-1.25, 0.2, -0.95, 0, 0.5], [-1.25, 0.2, -0.95, 0, 0.5]] } })); const d = [PR - bp[0], -180 - bp[2]], dl = Math.hypot(d[0], d[1]); A.phone.visible = true; A.phone.position.set(bp[0] + (d[0] / dl) * 30, 140, bp[2] + (d[1] / dl) * 30); A.phone.rotation.set(0, face(bp, [PR, 0, -180]) + PI, 0); return; }
    premWork(t, k === "end" ? {} : (sh.t0 >= WT[64] - 0.01 && sh.t0 < WT[72] ? { headPitch: 0.02, headYaw: -0.6 * smooth(seg(t, sh.t0 + 0.2, sh.t0 + 1.0)), smile: 1, brow: 0.5, open: 0.0, lean: 0.1, headPitch: -0.02 } : {})); sofaGuest(t, 0); A.cup.visible = true;
  };
  FILM.capsText = __CAPS__;
  FILM.overlay = (g, t, sh) => { const p = C4.pop2, G = "#2fbf5a", RED = "#FF2A3D", Y = "#f2d21c";
    if (sh.t0 >= WT[15] - 0.01 && sh.t1 <= WT[26] + 0.01) C4.tag(g, 540, 430, "TAGLIO 10 €", { col: Y, p: p(t, WT[18] - 0.05), size: 84 });
    if (sh.t0 >= WT[26] - 0.01 && sh.t1 <= CTA1 + 0.01) { C4.tag(g, 540, 330, "20 TAGLI x 10 €", { col: "#fff", p: p(t, WT[26] - 0.05), size: 70 }); if (t < WT[39] - 0.06) C4.big(g, 540, 480, "200 €", { col: G, p: p(t, WT[30] - 0.05), size: 170 }); else C4.big(g, 540, 480, "30 €", { col: RED, p: p(t, WT[39] - 0.06), size: 190 });
      [["- AFFITTO", 33, 260], ["- PRODOTTI", 34, 540], ["- TASSE", 36, 820]].forEach((q, i) => C4.tag(g, q[2], 640, q[0], { col: "#d9dce1", p: p(t, WT[q[1]] - 0.05), size: 50, rot: i - 1 })); }
    C4.ctaBanner(g, t, CTA1, CTA1E - CTA1);
    if (sh.t0 >= WT[53] - 0.01 && sh.t1 <= WT[64] + 0.01) { C4.tag(g, 540, 330, "8 TAGLI x 35 €", { col: "#fff", p: p(t, WT[56] - 0.05), size: 70 }); C4.big(g, 540, 480, "280 €", { col: G, p: p(t, WT[63] - 0.05), size: 170 }); }
    if (sh.t0 >= WT[64] - 0.01 && sh.t1 <= WT[72] + 0.01) { C4.tag(g, 300, 360, "20 TAGLI · 200 €", { col: "#9aa0a8", p: p(t, WT[64] + 0.1), size: 50, rot: -3 }); C4.tag(g, 760, 450, "8 TAGLI · 280 €", { col: RED, fg: "#fff", p: p(t, WT[69] - 0.05), size: 58, rot: 2 }); }
    [[77, 81, "IL CAFFÈ ALL'ARRIVO"], [81, 85, "IL MASSAGGIO"], [85, 88, "IL CONSIGLIO GIUSTO"], [88, 94, "LA FOTO PRIMA E DOPO"]].forEach((q) => { if (t >= WT[q[0]] && t < WT[q[1]]) C4.tag(g, 540, 310, q[2], { col: "#fff", p: p(t, WT[q[0]] + 0.05), size: 62 }); });
    const fl = Math.exp(-(t - WT[89] - 0.1) * 9); if (t >= WT[89] + 0.1 && fl > 0.02) { g.fillStyle = "rgba(255,255,255," + (fl * 0.7).toFixed(3) + ")"; g.fillRect(0, 0, 1080, 1920); }
    if (sh.t0 >= WT[94] - 0.01 && sh.t1 <= WT[105] + 0.01) C4.tag(g, 540, 420, "PER 1 € IN MENO", { col: "#d9dce1", p: p(t, WT[102] - 0.05), size: 66 });
    if (sh.key === "agenda") { C4.tag(g, 740, 330, "CONTO VUOTO", { col: RED, fg: "#fff", p: p(t, WT[112] - 0.05), size: 62, rot: -3 }); C4.tag(g, 760, 440, "AGENDA PIENA", { col: "#fff", p: p(t, WT[116] - 0.05), size: 62, rot: 2 }); }
    C4.captions(g, t, A.caps, WT, { hide: [[CTA1 - 0.05, WT[53] - 0.04], [END, 1e9]], accent: sh.set === "cheap" ? "#FFB020" : "#FF2A3D" });
    if (sh.key === "end") C4.ctaEnd(g, t, END, { times: [WT[119] - 0.05, WT[129] - 0.05, WT[131] - 0.05, WT[133] - 0.05] });
  };
})(typeof window !== "undefined" ? window : globalThis);
