(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const walk = (dx, dur) => (o, tl, t, g) => { g.position.x += dx * sm(tl / dur); g.position.y += 3 * Math.abs(Math.sin(tl * 9)); };
  const FILM = C4.film5({ v: 2, WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [169], end: 161,
    scenes: [
      { a: 0, b: 4, col: RED, rk: 0.85, items: [{ w: -1, p: "shop", a: [RED, "SUPERMERCATO"], at: [0, 0], s: 2.0 }, { w: 1, p: "cart", at: [-120, 110], s: 0.9, in: "left" }] },
      { a: 4, b: 8, col: RED, items: [{ w: -1, p: "wallet", at: [-30, 0], s: 2.2, upd: (o, tl, t, g) => { const k = sm((tl - 1.4) / 0.5); g.scale.y *= 1 - 0.55 * k; } }, { w: 5, p: "coins", a: [9], at: [110, 90], s: 1.4, sfx: "coin" }, { w: 6, p: "arrow", a: [RED, true], at: [-150, 60], s: 1.3, sfx: "thud" }] },
      { a: 8, b: 13, col: YEL, items: [{ w: 11, p: "num", txt: "3", at: [0, 150, 0], size: 460, col: YEL, sfx: "boom" }, { w: 12, p: "tag", a: ["TRUCCHI", RED, "#fff"], at: [0, 20], s: 1.9 }] },
      { a: 13, b: 18, col: PUR, items: [{ w: 13, p: "pawn", a: [WHT, 2.4], at: [-55, 10], in: "pop" }, { w: 16, p: "eye", at: [90, 120], s: 1.3, in: "spin" }] },
      { a: 18, b: 25, col: RED, items: [{ w: 20, p: "num", txt: "3°", at: [-30, 160, 0], size: 420, col: RED, sfx: "boom" }, { w: 22, p: "cross", at: [130, 40, 40], s: 1.4, in: "spin" }, { w: 24, p: "num", txt: "?", at: [130, 150, 40], size: 300, col: WHT }] },
      { a: 25, b: 26, col: ORA, items: [{ w: 25, p: "num", txt: "1", at: [0, 140, 0], size: 480, col: ORA, sfx: "boom" }] },
      { a: 26, b: 31, col: ORA, items: [{ w: 27, p: "bread", at: [-70, 20], s: 2.0 }, { w: 30, p: "milk", at: [80, 0], s: 1.8 }] },
      { a: 31, b: 35, col: TEAL, items: [{ w: 31, p: "calendar", a: ["OGNI", "SETTIMANA"], at: [0, 0], s: 2.0 }] },
      { a: 35, b: 41, col: ORA, cam: "dolly", items: [{ w: -1, p: "shelf", a: [GREY], at: [-110, -60], s: 0.75 }, { w: -1, p: "shelf", a: [GREY], at: [110, -60], s: 0.75 }, { w: 38, p: "bread", at: [0, -260], s: 1.4, in: "pop" }, { w: 39, p: "milk", at: [55, -260], s: 1.2, in: "pop" }, { w: 40, p: "tag", a: ["IN FONDO", RED, "#fff"], at: [0, -170], s: 1.3, sfx: "thud" }] },
      { a: 41, b: 48, col: PUR, cam: "top", items: [{ w: -1, p: "shelf", a: [GREY], at: [-140, 0], s: 0.6 }, { w: -1, p: "shelf", a: [GREY], at: [0, 0], s: 0.6 }, { w: -1, p: "shelf", a: [GREY], at: [140, 0], s: 0.6 }, { w: 41, p: "cart", at: [-200, 120], s: 0.9, in: "left", upd: walk(400, 2.2) }] },
      { a: 48, b: 58, col: RED, items: [{ w: -1, p: "cart", at: [0, -20], s: 1.7 }, { w: 52, p: "box", at: [-30, 46, -20], s: 0.8, in: "drop" }, { w: 54, p: "bag", a: [RED], at: [30, 46, -20], s: 0.8, in: "drop" }, { w: 55, p: "bottle", a: [ORA], at: [0, 46, -10], s: 0.7, in: "drop" }, { w: 56, p: "gift", a: [PUR], at: [-10, 76, -20], s: 0.7, in: "drop" }] },
      { a: 58, b: 59, col: TEAL, items: [{ w: 58, p: "num", txt: "2", at: [0, 140, 0], size: 480, col: TEAL, sfx: "boom" }] },
      { a: 59, b: 64, col: TEAL, items: [{ w: -1, p: "shelf", a: [RED], at: [0, 0], s: 1.2 }] },
      { a: 64, b: 74, col: RED, cam: "push", items: [{ w: -1, p: "shelf", a: [RED], at: [-30, -40], s: 1.4 }, { w: 66, p: "tag", a: ["+ CARO", RED, "#fff"], at: [130, 120], s: 1.1, sfx: "cash" }, { w: 72, p: "eye", at: [-180, 100, 60], s: 0.9, in: "spin" }] },
      { a: 74, b: 84, col: GRN, cam: "low", items: [{ w: -1, p: "shelf", a: [RED], at: [-30, -40], s: 1.4 }, { w: 76, p: "tag", a: ["CONVIENE", GRN], at: [130, -20], s: 1.1, sfx: "ding" }, { w: 79, p: "arrow", a: [GRN, true], at: [-180, -10, 60], s: 1.0 }] },
      { a: 84, b: 86, col: YEL, items: [{ w: 84, p: "pawn", a: [WHT, 2.5], at: [0, 0], in: "pop", upd: (o, tl, t, g) => { g.rotation.z = 0.12 * Math.sin(tl * 4); } }, { w: 85, p: "num", txt: "?", at: [90, 150, 30], size: 300, col: YEL }] },
      { a: 86, b: 87, col: RED, cut: true, cam: { eye: [[0, 200, 560], [0, 196, 540]], look: [[0, 140, 0], [0, 140, 0]], fov: [36, 36], ease: "linear" }, items: [{ w: 86, p: "num", txt: "NO.", at: [0, 140, 0], size: 420, col: RED, sfx: "thud" }] },
      { a: 87, b: 90, col: RED, items: [{ w: 87, p: "box", a: [RED, "PREMIUM"], at: [0, 0], s: 2.3, in: "spin" }, { w: 89, p: "creditcard", a: [BLU], at: [120, 120], s: 1.0, sfx: "cash" }] },
      { a: 90, b: 97, col: PUR, items: [{ w: 92, p: "num", txt: "3", at: [-40, 160, 0], size: 460, col: PUR, sfx: "boom" }, { w: 94, p: "num", txt: "?", at: [120, 150, 40], size: 380, col: WHT }] },
      { a: 97, b: 99, col: PUR, items: [{ w: 97, p: "speaker", a: [RED], at: [-40, 0], s: 1.8, upd: (o, tl) => o.scale.setScalar(1 + 0.03 * Math.abs(Math.sin(tl * 6))) }, { w: 98, p: "note", a: [YEL], at: [90, 120], s: 1.4, in: "pop", bob: 10, spin: 1.2 }] },
      { a: 99, b: 104, col: ORA, items: [{ w: -1, p: "speaker", a: [RED], at: [0, 0], s: 1.8 }, { w: 101, p: "cross", at: [-130, 60, 40], s: 0.9, in: "spin" }, { w: 103, p: "check", at: [130, 60, 40], s: 1.0, in: "spin", sfx: "ding" }] },
      { a: 104, b: 107, col: TEAL, items: [{ w: 104, p: "note", a: [TEAL], at: [-80, 30], s: 1.8, in: "pop", bob: 6, spin: 0.6 }, { w: 105, p: "hourglass", at: [80, 0], s: 1.4, lab: "LENTA", labCol: TEAL }] },
      { a: 107, b: 114, col: TEAL, cam: "orbit", items: [{ w: 107, p: "pawn", a: [WHT, 2.0], at: [-150, 40], in: "pop", upd: walk(180, 4) }, { w: 107, p: "shelf", a: [YEL], at: [80, -90], s: 0.9, sfx: 0 }, { w: 110, p: "note", a: [YEL], at: [-120, 200, 0], s: 1.0, in: "pop", bob: 10 }] },
      { a: 114, b: 121, col: RED, items: [{ w: 114, p: "eye", at: [-110, 60], s: 1.1, in: "pop" }, { w: 118, p: "cart", at: [30, 0], s: 1.3, sfx: "cash" }, { w: 120, p: "stack", a: [6], at: [130, 120], s: 1.0, sfx: "cash" }] },
      { a: 121, b: 134, col: GRN, cam: "push", rk: 0.78, items: [{ w: 124, p: "bars", a: [[55, 130], [GREY, GRN]], at: [0, 0], s: 1.7, in: "pop", upd: (o, tl) => o.userData.bars.forEach((b, i) => b.scale.y = 0.05 + 0.95 * sm((tl - i * 0.6) / 0.6)) }, { w: 128, p: "num", count: [0, 38, 0.9, " %", "+ "], at: [0, 265, 0], size: 250, col: GRN }] },
      { a: 134, b: 137, col: YEL, items: [{ w: 134, p: "note", a: [YEL], at: [0, 20], s: 2.6, in: "spin", spin: 2 }] },
      { a: 137, b: 144, col: PUR, items: [{ w: -1, p: "pawn", a: [WHT, 2.3], at: [-80, 10] }, { w: 139, p: "cross", at: [-80, 60, 90], s: 1.5, in: "spin", sfx: "thud" }, { w: 141, p: "cart", at: [90, 0], s: 1.3 }] },
      { a: 144, b: 150, col: RED, cam: "low", items: [{ w: 145, p: "shop", a: [RED, "SUPERMERCATO"], at: [0, 0], s: 1.9, sfx: "boom" }, { w: 148, p: "pawn", a: [GREY, 1.3], at: [0, 10, 90], in: "drop" }] },
      { a: 150, b: 161, col: RED, rk: 0.95, items: [{ w: -1, p: "shop", a: [RED, "SUPERMERCATO"], at: [0, -60], s: 1.5 }, { w: 158, p: "wallet", at: [0, 220, 40], s: 1.3, in: "drop", upd: (o, tl, t, g) => { g.scale.y *= 1 - 0.5 * sm((tl - 0.6) / 0.4); } }, { w: 160, p: "coins", a: [10], at: [120, 60], s: 1.2, sfx: "coin" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
