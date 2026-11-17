(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const FILM = C4.film5({ v: 2, WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [131], end: 123,
    scenes: [
      { a: 0, b: 3, col: GRN, rk: 0.9, items: [{ w: -1, p: "arrow", a: [GRN], at: [-75, 0], s: 2.3, in: "rise", lab: "AUMENTO", labCol: GRN, labFg: "#fff" }, { w: -1, p: "stack", a: [5], at: [75, 60], s: 1.4 }, { w: 2, p: "stack", a: [3], at: [75, 62 * 1.4 + 6, 60], s: 1.4, sfx: "cash" }] },
      { a: 3, b: 12, col: RED, items: [{ w: 5, p: "calendar", a: ["FINE", "MESE"], at: [-85, 0], s: 1.6 }, { w: 7, p: "wallet", at: [85, 40], s: 1.6 }, { w: 9, p: "num", txt: "0 €", at: [85, 190, 40], size: 230, col: RED, sfx: "thud" }] },
      { a: 12, b: 16, col: TEAL, items: [{ w: 13, p: "stack", a: [5], at: [0, 0], s: 1.7, sfx: "cash" }, { w: 14, p: "num", txt: "+ 1.400 €", at: [0, 215, 0], size: 170, col: GRN }] },
      { a: 16, b: 20, col: RED, items: [{ w: 16, p: "cart", at: [-55, -10], s: 1.4 }, { w: 18, p: "bag", a: [RED], at: [95, 80], in: "pop" }, { w: 19, p: "num", txt: "- 1.400 €", at: [0, 225, 0], size: 170, col: RED }] },
      { a: 20, b: 24, col: GRN, items: [{ w: 20, p: "stack", a: [8], at: [-35, 0], s: 1.6, sfx: "cash" }, { w: 22, p: "arrow", a: [GRN], at: [115, 70], s: 1.3, in: "rise" }, { w: 23, p: "num", txt: "+ 1.800 €", at: [0, 265, 0], size: 170, col: GRN }] },
      { a: 24, b: 28, col: RED, items: [{ w: -1, p: "cart", at: [-70, -10], s: 1.4 }, { w: 25, p: "bag", a: [RED], at: [75, 90], in: "pop" }, { w: 26, p: "box", at: [150, 20], s: 1.0 }, { w: 27, p: "num", txt: "- 1.800 €", at: [0, 225, 0], size: 170, col: RED }] },
      { a: 28, b: 33, col: ORA, items: [{ w: -1, p: "stack", a: [4], at: [0, 0], s: 2.0, out: 32, lab: "+ 400 €", labCol: GRN, labFg: "#fff" }, { w: 32, p: "num", txt: "SPARITI", at: [0, 110, 0], size: 190, col: RED, sfx: "boom" }] },
      { a: 33, b: 42, col: PUR, items: [{ w: -1, p: "num", txt: "?", at: [-60, 170, 0], size: 500, col: PUR }, { w: 38, p: "hourglass", at: [105, 70], s: 1.25, sfx: "tick" }] },
      { a: 42, b: 49, col: YEL, items: [{ w: 44, p: "arrow", a: [RED], at: [-120, 40], s: 1.7, in: "rise" }, { w: 46, p: "tag", a: ["STILE DI VITA", YEL], at: [45, 10], s: 1.7 }] },
      { a: 49, b: 55, col: TEAL, items: [{ w: 49, p: "coins", a: [10], at: [-110, 80], s: 1.5, sfx: "coin" }, { w: 51, p: "stack", a: [5], at: [-25, 120], s: 1.1, sfx: "cash" }, { w: 53, p: "bars", a: [[45, 80, 125], TEAL], at: [95, -20], s: 1.25, in: "pop", upd: (o, tl) => o.userData.bars.forEach((b, i) => b.scale.y = 0.05 + 0.95 * sm((tl - i * 0.14) / 0.3)) }] },
      { a: 55, b: 58, col: GRN, items: [{ w: -1, p: "house", a: [GREY], at: [-100, 70], s: 0.8 }, { w: 56, p: "house", at: [45, -20], s: 1.9, sfx: "thud" }] },
      { a: 58, b: 60, col: RED, items: [{ w: 58, p: "car", a: [RED], at: [0, 0], s: 2.0, in: "right", sfx: "swoosh", lead: 0.1 }] },
      { a: 60, b: 62, col: ORA, items: [{ w: 60, p: "bowl", a: [WHT, "#e0563c"], at: [-60, 30], s: 1.9 }, { w: 61, p: "bottle", a: ["#7a1f3d"], at: [70, 0], s: 1.5 }] },
      { a: 62, b: 65, col: TEAL, items: [{ w: 62, p: "tag", a: ["NORMALE", WHT], at: [-20, 0], s: 2.2 }, { w: 64, p: "check", at: [130, 150, 50], s: 1.1, in: "spin", sfx: "ding" }] },
      { a: 65, b: 71, col: YEL, items: [{ w: 65, p: "arrow", a: [YEL], at: [-110, 20], s: 1.2, in: "rise" }, { w: 67, p: "arrow", a: [YEL], at: [0, 60], s: 1.5, in: "rise" }, { w: 70, p: "arrow", a: [YEL], at: [110, 20], s: 1.8, in: "rise" }] },
      { a: 71, b: 75, col: PUR, items: [{ w: 71, p: "stack", a: [4], at: [0, 0], s: 2.0, lab: "I 400 €", labCol: GRN, labFg: "#fff" }] },
      { a: 75, b: 84, col: TEAL, items: [{ w: 75, p: "house", a: [GREY], at: [-115, 10], s: 1.0 }, { w: 76, p: "car", a: [GREY], at: [10, 80], s: 1.0 }, { w: 77, p: "bowl", a: [GREY, GREY], at: [125, 0], s: 1.2 }, { w: 80, p: "calendar", a: ["DOPO", "1 MESE"], at: [0, -110], s: 1.2, in: "rise" }] },
      { a: 84, b: 91, col: GRN, cam: "push", items: [{ w: -1, p: "door", a: [GRN], at: [-30, -10], s: 1.8, upd: (o, tl) => { o.userData.leaf.rotation.y = -1.15 * sm((tl - 2.3) / 0.5); } }, { w: 89, p: "num", txt: "1", at: [140, 170, 20], size: 300, col: GRN, sfx: "ding" }] },
      { a: 91, b: 94, col: YEL, items: [{ w: 91, p: "calendar", a: ["GIORNO", "1"], at: [-45, 0], s: 2.0 }, { w: 93, p: "arrow", a: [GRN], at: [110, 70], s: 1.3, in: "rise" }] },
      { a: 94, b: 102, col: GRN, items: [{ w: 94, p: "stack", a: [4], at: [-120, 50], s: 1.3, lab: "METÀ", labCol: GRN, labFg: "#fff", upd: (o, tl, t, g) => { const k = sm((tl - 1.75) / 0.5); g.position.x += 150 * k; g.scale.multiplyScalar(1 - 0.75 * k); } }, { w: 100, p: "bank", a: ["ALTRO CONTO"], at: [65, -20], s: 1.5, sfx: "thud" }] },
      { a: 102, b: 107, col: PUR, items: [{ w: -1, p: "bank", a: ["ALTRO CONTO"], at: [60, -30], s: 1.3 }, { w: -1, p: "pawn", a: [WHT, 2.0], at: [-95, 60] }, { w: 104, p: "cross", at: [-20, 60, 60], s: 1.0, in: "spin" }] },
      { a: 107, b: 110, col: ORA, items: [{ w: 107, p: "stack", a: [4], at: [-90, 30], s: 1.3, lab: "L'ALTRA METÀ", labCol: ORA, labFg: "#fff", labSize: 46 }, { w: 109, p: "bowl", a: [WHT, "#e0563c"], at: [50, 60], s: 1.4 }, { w: 109, p: "heart", a: [RED], at: [50, 130, 60], s: 1.1, in: "pop", bob: 6, sfx: 0 }] },
      { a: 110, b: 117, col: RED, items: [{ w: -1, p: "stack", a: [8], at: [-30, 0], s: 1.6 }, { w: 110, p: "cross", at: [-30, 70, 110], s: 2.0, in: "spin", sfx: "thud", lead: 0 }, { w: 114, p: "arrow", a: [GRN], at: [130, 50], s: 1.4, in: "rise" }] },
      { a: 117, b: 123, col: GRN, items: [{ w: -1, p: "piggy", at: [-30, 0], s: 2.2, in: "pop" }, { w: 121, p: "stack", a: [4], at: [125, 110], s: 1.1, sfx: "cash", lab: "LA DIFFERENZA", labCol: GRN, labFg: "#fff", labSize: 44 }, { w: 122, p: "check", at: [-30, 215, 0], s: 1.2, in: "spin", sfx: "ding" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
