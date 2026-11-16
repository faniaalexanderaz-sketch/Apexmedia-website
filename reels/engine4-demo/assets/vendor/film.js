/* Engine 4 demo film: restaurant interior, 4 animated characters, one clean cut + one continuous push from wide to close-up. */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), { lerp, seg, smooth } = C4;
  const WOMAN = [118, 0, -40], MAN = [22, 0, -40], HEAD_W = [112, 125, -40], D = 10, CUT = 3.4;
  const waiterX = (t) => -330 + t * 63;
  const FILM = { D, fps: 60, grade: { contrast: 1.07, sat: 1.1, vignette: 0.55 }, envBg: "#0d0a08",
    shots: [
      { t0: 0, t1: CUT, trans: "cut", cam: { eye: [[-250, 255, 640], [-120, 218, 575], [40, 188, 520]], look: [[0, 150, -80], [30, 138, -90]], fov: [60, 54], ease: "drift", aperture: 0.9, focus: [60, 100, -40] } },
      { t0: CUT, t1: D, trans: "cut", cam: { eye: [[-300, 178, 335], [-195, 152, 215], [-80, 136, 125], [-8, 130, 78]], look: [[40, 135, -90], [88, 122, -48], HEAD_W], fov: [52, 29], ease: "inout", damp: 0.5, aperture: [0.9, 2.4], focus: HEAD_W } },
    ],
  };
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE === "undefined") return;
  const T = THREE, { MAT, props, rbox, cyl, sph, grp, mesh } = C4; let A = {};
  FILM.build = (sc) => {
    sc.background = new T.Color("#0b0807"); sc.fog = new T.FogExp2("#22160d", 0.00062);
    const plane = (w, h, mat, p, r, recv) => mesh(new T.PlaneGeometry(w, h), mat, p, { r, cast: false, recv: !!recv });
    sc.add(plane(800, 1300, MAT.wood(9, 5, "#4f3120", true), [0, 0, 100], [-Math.PI / 2, 0, 0], true));
    sc.add(plane(800, 340, MAT.brick(8, 5.2), [0, 170, -470], [0, 0, 0])); sc.add(plane(1300, 340, MAT.brick(13, 5.2), [400, 170, 100], [0, -Math.PI / 2, 0])); sc.add(plane(1300, 340, MAT.plaster("#b39a7c", 6, 2), [-400, 170, 100], [0, Math.PI / 2, 0])); sc.add(plane(800, 1300, MAT.plaster("#6b5442", 4, 6), [0, 340, 100], [Math.PI / 2, 0, 0]));
    const wd = MAT.wood(4, 1, "#3c2415", true); sc.add(rbox(800, 92, 6, 2, wd, [0, 46, -466])); sc.add(rbox(6, 92, 1300, 2, wd, [396, 46, 100])); sc.add(rbox(6, 92, 1300, 2, wd, [-396, 46, 100])); for (let i = 0; i < 5; i++) sc.add(rbox(800, 16, 20, 3, MAT.wood(6, 1, "#2e1b10"), [0, 331, -380 + i * 230]));
    /* windows (blue hour outside) */
    [-180, 140].forEach((z) => { const g = grp([-397, 190, z]); g.rotation.y = Math.PI / 2; g.add(mesh(new T.PlaneGeometry(130, 170), MAT.glow("#5d86d0", 1.5), [0, 0, 0.5], { cast: false })); g.add(rbox(142, 8, 8, 2, wd, [0, 89, 3])); g.add(rbox(142, 8, 8, 2, wd, [0, -89, 3])); [-68, 0, 68].forEach((x) => g.add(rbox(7, 178, 8, 2, wd, [x, 0, 3]))); g.add(rbox(142, 6, 7, 2, wd, [0, 0, 3])); sc.add(g); });
    /* bar, shelves, bottles, neon */
    sc.add(rbox(430, 104, 62, 4, MAT.wood(3, 1, "#4a2c1a", true), [-40, 52, -380])); sc.add(rbox(444, 6, 72, 2.5, MAT.paint("#e9e4da", 0.18), [-40, 107, -380]));
    const bcol = ["#234a2c", "#5a2a14", "#1f3a52", "#6a5a1c", "#3a1420"], r = C4.rng(19); [168, 214].forEach((y) => { sc.add(rbox(360, 4, 22, 1.5, wd, [-40, y, -456])); for (let i = 0; i < 15; i++) { const b = props.bottle(bcol[Math.floor(r() * 5)]); b.position.set(-205 + i * 23.5 + r() * 4, y + 2, -456); b.scale.setScalar(0.85 + r() * 0.3); C4.noRecv(C4.noShadow(b)); sc.add(b); } });
    const neon = props.neon("Trattoria", "#ff7a3c", 250); neon.position.set(-40, 286, -466); sc.add(neon); const nl = C4.pool(620, 300, "#ff6a30", 0.55); nl.position.set(-40, 280, -468.5); sc.add(nl); A.nl = nl.material;
    /* tables */
    A.flames = []; A.pend = [];
    [[70, -40, 1], [-190, -210, 0], [-250, 40, 0], [215, -250, 0]].forEach((q, i) => { const tb = props.table(46, 74, "#cdc4b1"); tb.position.set(q[0], 0, q[1]); sc.add(tb); if (i) C4.noShadow(tb);
      [[48, 0, -Math.PI / 2], [-48, 0, Math.PI / 2]].forEach((c) => { const ch = props.chair(); ch.position.set(q[0] + c[0] * 1.12, 0, q[1]); ch.rotation.y = c[2]; sc.add(ch); if (i) C4.noShadow(ch); const pl = props.plate(12); pl.position.set(q[0] + c[0] * 0.5, 75, q[1]); sc.add(C4.noShadow(pl)); const gl = props.glass(i % 2 ? "#5a0f1c" : "#7a1422"); gl.position.set(q[0] + c[0] * 0.42, 75, q[1] - 17); sc.add(C4.noShadow(gl)); });
      const cd = props.candle(); cd.position.set(q[0], 75, q[1] + 6); sc.add(C4.noShadow(cd)); A.flames.push(cd.userData.flame); const bt = props.bottle("#234a2c"); bt.position.set(q[0] - 6, 75, q[1] - 22); sc.add(i ? C4.noShadow(bt) : bt);
      const pd = props.pendant(150, i % 2 ? "#3a3f45" : "#b0762c"); pd.position.set(q[0], 340, q[1]); sc.add(pd); const pb = props.beam(120, 178, "#ffcf99", 0.05); pd.add(pb); pb.position.y = -160 - 89; let pl2 = { intensity: 0 }; const fp = C4.pool(330, 330, "#ffb46a", i === 0 ? 0.0 : 0.5); fp.rotation.x = -Math.PI / 2; fp.position.set(q[0], 0.6, q[1]); sc.add(fp); if (i === 0) { pl2 = new T.PointLight("#ffb46a", i ? 1.7 : 1.35, 520, 1.5); pl2.position.set(q[0], 172, q[1]); sc.add(pl2); } A.pend.push({ pd, l: pl2, k: i ? 1.7 : 1.35 }); });
    /* string lights for background bokeh */
    const bulb = new T.SphereGeometry(1.25, 6, 4), bm = MAT.glow("#ffb45e", 3.2); [[-400, 400, -330, 0], [-400, 400, -120, 0], [392, 392, 0, 1], [-400, 400, -462, 0]].forEach((s, si) => { for (let i = 0; i <= 26; i++) { const k = i / 26, m = new T.Mesh(bulb, bm); if (s[3]) m.position.set(392, 262 - Math.sin(k * Math.PI * 3) * 10, -440 + k * 900); else m.position.set(lerp(s[0], s[1], k), 300 - Math.sin(k * Math.PI) * 26 - Math.abs(Math.sin(k * Math.PI * 4)) * 6 - (si === 3 ? 14 : 0), s[2]); sc.add(m); } });
    [[398, 190, -260, 20], [398, 175, -90, 200], [398, 195, 90, 330], [398, 180, 260, 90]].forEach((f) => { const fr = props.frame(52, 68, f[3]); fr.position.set(f[0] - 3, f[1], f[2]); fr.rotation.y = -Math.PI / 2; sc.add(fr); });
    [[-350, 0, -420], [350, 0, -420], [-350, 0, 420]].forEach((p, i) => { const pl = props.plant(i + 2); pl.position.set(p[0], 0, p[2]); pl.scale.setScalar(1.6); C4.noRecv(C4.noShadow(pl)); sc.add(pl); });
    A.dust = C4.dust(520, [-360, 20, -420, 360, 300, 420], 9); sc.add(A.dust);
    C4.threePoint(sc, { keyPos: [-240, 330, 330], target: [70, 90, -40], key: 1.0, keyCol: "#ffd9b0", angle: 0.8, fillPos: [-400, 220, 60], fill: 1.0, fillCol: "#8fb0ff", rimPos: [330, 250, -330], rim: 2.0, rimCol: "#ff9a50", sky: "#6b5648", ground: "#2c170c", amb: 0.55 });
    /* cast */
    A.woman = C4.character({ skin: "#e6b08a", top: "#b23a48", bottom: "#1f2430", hair: "#5a2e1a", hairStyle: "long", seed: 4, eye: "#3a4a2a" });
    A.man = C4.character({ skin: "#c98d62", top: "#2c3e57", bottom: "#2a2a2e", hair: "#17120e", hairStyle: "short", seed: 7 });
    A.waiter = C4.character({ skin: "#e0a880", top: "#efece4", bottom: "#15161a", hair: "#22160e", hairStyle: "short", seed: 2, apron: "#1b1c20", bow: "#15161a" });
    A.chef = C4.character({ skin: "#f2c9a5", top: "#f1eee6", bottom: "#2a2c33", hair: "#6a4a2a", hairStyle: "short", seed: 9, hat: "chef", buttons: "#1c1c1e", apron: "#f0ede6" });
    [A.woman, A.man, A.waiter, A.chef].forEach((c) => sc.add(c.g));
    A.tray = grp(); A.tray.add(cyl(19, 19, 1.2, MAT.paint("#c9ccd2", 0.25, 1), [0, 0, 0])); const p1 = props.plate(9); p1.position.set(-5, 0.8, 2); A.tray.add(p1); const g1 = props.glass("#7a1422"); g1.position.set(8, 0.8, -4); A.tray.add(g1); sc.add(A.tray);
  };
  FILM.update = (t) => {
    const s = Math.sin, laugh = smooth(seg(t, 6.6, 7.3)) * (1 - smooth(seg(t, 9.2, 9.9))), lb = laugh * s(t * 13) * 0.5;
    A.woman.pose(C4.sitPose(t, WOMAN, -Math.PI / 2, { seed: 1, over: { headYaw: 0.1 * s(t * 0.7) + 0.25 * smooth(seg(t, 8.6, 9.6)), headPitch: -0.04 - laugh * 0.2 + lb * 0.03, headRoll: 0.05 * s(t * 0.9) + laugh * 0.08, lean: 0.07 - laugh * 0.1 + lb * 0.015, smile: 0.65 + laugh * 0.35, open: laugh * (0.55 + 0.25 * s(t * 11)), squint: laugh * 0.9, brow: 0.2 + laugh * 0.5,
      arm: [[-0.62, 0.05, -1.25, 0, 0.5], [-0.62 - laugh * 0.5, -0.1 - laugh * 0.25, -1.3 - laugh * 0.75, 0.2, 0.35]], sway: [-(laugh * 0.06) + 0.012 * s(t * 0.9 - 0.5), 0.03 * s(t * 0.9 - 0.6) + lb * 0.03, 0] } }));
    const talk = 1 - laugh * 0.6, ge = s(t * 2.3) * 0.5 + s(t * 3.7 + 1) * 0.3;
    A.man.pose(C4.sitPose(t, MAN, Math.PI / 2, { seed: 3, over: { headYaw: 0.06 * s(t * 1.1), headPitch: 0.03 * s(t * 2.3), lean: 0.12, smile: 0.7, open: talk * Math.max(0, s(t * 9) * 0.5 + s(t * 5.3) * 0.4), brow: 0.3 + 0.3 * ge,
      arm: [[-0.9 - ge * 0.25, 0.25 + ge * 0.1, -1.25 - ge * 0.35, 0.3 * s(t * 2.3 - 0.4), 0.2], [-0.6, 0.05, -1.2, 0, 0.6]] } }));
    const wx = waiterX(t), ph = t * 1.15 * Math.PI;
    A.waiter.pose(C4.walkPose(t, [wx, 0, -255], Math.PI / 2, 1.15, { seed: 5, over: { headYaw: -0.35, arm: [[s(ph - 0.35) * 0.4, 0, -0.25, 0, 0.55], [-0.75, 0.12, -1.75, -0.4, 0.15]] } }));
    A.tray.position.set(wx + 27, 132 + Math.cos(ph * 2 - 0.7) * 0.9, -255 - 22); A.tray.rotation.set(s(ph - 0.8) * 0.015, 0, Math.cos(ph * 2 - 1) * 0.012);
    const up = smooth(seg(t, 5.2, 6.0)) * (1 - smooth(seg(t, 8, 8.8)));
    A.chef.pose({ pos: [70, 0, -440], yaw: 0, hipY: 84, lean: 0.2 - up * 0.14, twist: 0.08 * s(t * 0.8), breath: 0.008 * s(t * 1.6), headPitch: 0.3 - up * 0.3, headYaw: up * 0.25, smile: 0.5 + up * 0.4, blink: C4.blink(t, 1.1), brow: up * 0.5,
      arm: [[-0.75 + 0.08 * s(t * 4.2), 0.1, -0.95 + 0.14 * s(t * 4.2 + 0.6), 0.1, 0.7], [-0.7 + 0.1 * s(t * 3.1 + 1), 0.1, -1.0 + 0.16 * s(t * 3.1 + 1.5), 0.15 * s(t * 6), 0.7]], sway: [0.02 * s(t * 4.2 - 0.6), 0.02 * s(t * 3.1 - 0.4), 0] });
    A.flames.forEach((f, i) => { const k = 1 + 0.12 * s(t * 11 + i * 2) + 0.08 * s(t * 17.3 + i); f.scale.set(0.75, 1.7 * k, 0.75); f.position.x = s(t * 7 + i) * 0.25; });
    A.pend.forEach((p, i) => { p.l.intensity = p.k * (1 + 0.035 * s(t * 2.1 + i * 1.7) + 0.02 * s(t * 5.3 + i)); p.pd.rotation.z = 0.008 * s(t * 0.9 + i); });
    A.nl.opacity = 0.55 * (1 + 0.05 * s(t * 3.3) + 0.04 * s(t * 23)); A.dust.userData.update(t);
  };
  FILM.overlay = (g, t) => {
    const a = smooth(seg(t, 5.0, 5.5)); if (a <= 0) return; g.save(); g.globalAlpha = a; g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(0,0,0,0.75)"; g.shadowBlur = 28; g.shadowOffsetY = 6;
    g.font = '900 64px "Unbounded"'; g.fillStyle = "#fff"; g.fillText("UN LOCALE PIENO", 540, 1455 + (1 - a) * 24); g.fillStyle = "#ffcf8a"; g.font = '900 82px "Unbounded"'; g.fillText("NON È FORTUNA.", 540, 1548 + (1 - a) * 24); g.restore();
  };
})(typeof window !== "undefined" ? window : globalThis);
