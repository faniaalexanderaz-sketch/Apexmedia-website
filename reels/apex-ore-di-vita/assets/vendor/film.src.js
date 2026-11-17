(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const FILM = C4.film5({ v: 2, WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [126], end: 118,
    scenes: [
      { a: 0, b: 6, col: RED, rk: 0.8, items: [{ w: -1, p: "iphone", at: [-30, -10], s: 1.55, upd: (o, tl, t, g) => { g.rotation.y = -0.55 + t * 2.35; g.position.y = 6 * Math.sin(t * 2.4); } }, { w: 4, p: "tag", a: ["1.200 €", YEL], at: [95, 130], s: 1.25, sfx: "thud" }] },
      { a: 6, b: 12, col: TEAL, items: [{ w: -1, p: "hourglass", at: [-45, 0], s: 2.2, in: "spin" }, { w: 7, p: "num", count: [0, 150, 0.55, " ORE"], at: [0, 285, 0], size: 210, col: TEAL }, { w: 8, p: "clock", at: [125, 120], s: 0.95, upd: hands(14) }] },
      { a: 12, b: 17, col: GRN, items: [{ w: 12, p: "stack", a: [6], at: [-70, 20], s: 1.5, sfx: "cash" }, { w: 13, p: "num", txt: "1.400 €", at: [-70, 240, 20], size: 180, col: GRN }, { w: 16, p: "calendar", a: ["AL", "MESE"], at: [115, 90], s: 1.05 }] },
      { a: 17, b: 20, col: ORA, items: [{ w: 17, p: "clock", at: [0, 0], s: 2.2, upd: hands(10) }, { w: 18, p: "num", txt: "170 ORE", at: [0, 290, 0], size: 180, col: ORA }] },
      { a: 20, b: 24, col: YEL, items: [{ w: 21, p: "tag", a: ["8 €", YEL], at: [-45, 0], s: 2.5 }, { w: 23, p: "hourglass", at: [125, 100], s: 0.95, lab: "1 ORA", labCol: WHT, labSize: 46 }] },
      { a: 24, b: 33, col: RED, items: [{ w: -1, p: "iphone", at: [-85, 0], s: 1.2, ry: -0.5, spin: 1.6 }, { w: 29, p: "calendar", a: ["LAVORO", "1 MESE"], at: [75, 20], s: 1.7, sfx: "thud" }, { w: 32, p: "clock", at: [165, 150], s: 0.7, upd: hands(16) }] },
      { a: 33, b: 40, col: PUR, items: [{ w: -1, p: "num", txt: "?", at: [0, 190, 0], size: 520, col: PUR }, { w: 35, p: "tag", a: ["IL VERO PROBLEMA", PUR, "#fff"], at: [0, 140], s: 1.5, in: "pop" }] },
      { a: 40, b: 49, col: TEAL, items: [{ w: -1, p: "iphone", at: [0, -70], s: 1.15, ry: 2.2, spin: 1.6 }, { w: 41, p: "tag", a: ["33 €", TEAL], at: [-115, 90], s: 1.2 }, { w: 42, p: "tag", a: ["33 €", TEAL], at: [0, 120], s: 1.2 }, { w: 43, p: "tag", a: ["33 €", TEAL], at: [115, 90], s: 1.2 }] },
      { a: 49, b: 55, col: GRN, items: [{ w: 49, p: "tag", a: ["33 €", GRN], at: [-35, 0], s: 2.5, in: "spin" }, { w: 53, p: "coin", at: [130, 110], s: 1.3, spin: 3, lab: "NIENTE?", labCol: WHT, labSize: 46 }] },
      { a: 55, b: 60, col: ORA, items: [{ w: 55, p: "clock", at: [-135, 30], s: 0.92, upd: hands(12) }, { w: 56, p: "clock", at: [-45, 60], s: 0.92, upd: hands(12), sfx: "tick" }, { w: 56, p: "clock", at: [45, 60], s: 0.92, upd: hands(12), sfx: 0 }, { w: 57, p: "clock", at: [135, 30], s: 0.92, upd: hands(12), sfx: "tick" }, { w: 56, p: "num", txt: "4 ORE", at: [0, 250, 0], size: 190, col: ORA }] },
      { a: 60, b: 65, col: RED, items: [{ w: 60, p: "calendar", a: ["OGNI", "MESE"], at: [-85, 0], s: 1.6 }, { w: 63, p: "stack", a: [6], at: [90, 30], s: 1.2, sfx: "cash" }, { w: 63, p: "num", txt: "× 36", at: [90, 225, 30], size: 200, col: RED }] },
      { a: 65, b: 72, col: YEL, items: [{ w: -1, p: "star", at: [0, 60, 0], s: 2.8, spin: 2.2, bob: 6, in: "pop" }, { w: 68, p: "tag", a: ["IL TRUCCO", YEL], at: [0, 150], s: 1.5, in: "pop" }] },
      { a: 72, b: 80, col: PUR, items: [{ w: 72, p: "cart", at: [-90, -10], s: 1.3 }, { w: 77, p: "tag", a: ["PREZZO", WHT], at: [75, 30], s: 1.7 }, { w: 78, p: "num", txt: "÷ 8", at: [75, 250, 30], size: 210, col: PUR, sfx: "ding" }] },
      { a: 80, b: 87, col: ORA, items: [{ w: 81, p: "bowl", a: [WHT, "#e0563c"], at: [-85, 20], s: 1.9, lab: "40 €", labCol: YEL }, { w: 85, p: "hourglass", at: [90, 0], s: 1.5, lab: "5 ORE", labCol: ORA, labFg: "#fff" }] },
      { a: 87, b: 95, col: TEAL, items: [{ w: 90, p: "sneaker", a: [RED], at: [-85, 20], s: 1.6, lab: "120 €", labCol: YEL }, { w: 93, p: "calendar", a: ["LAVORO", "2 GG"], at: [95, 0], s: 1.6, sfx: "thud" }] },
      { a: 95, b: 100, col: GRN, items: [{ w: -1, p: "hourglass", at: [-85, 0], s: 1.6 }, { w: 99, p: "check", at: [90, 30, 40], s: 1.9, in: "spin", sfx: "ding" }] },
      { a: 100, b: 111, col: PUR, items: [{ w: -1, p: "tag", a: ["120 €", GREY, "#fff"], at: [-75, 120], s: 1.0 }, { w: 101, p: "cross", at: [-75, 5, 190], s: 0.9, in: "spin" }, { w: 105, p: "hourglass", at: [25, -20], s: 2.0, sfx: "thud" }, { w: 110, p: "heart", a: [RED], at: [25, 225, -20], s: 1.2, in: "pop", bob: 6 }] },
      { a: 111, b: 118, col: YEL, items: [{ w: -1, p: "stack", a: [8], at: [0, 0], s: 1.9, out: 116 }, { w: 113, p: "cross", at: [0, 80, 90], s: 1.7, in: "spin", out: 116 }, { w: 116, p: "clock", at: [0, 0], s: 2.1, in: "pop", upd: hands(10) }, { w: 117, p: "num", txt: "ORE", at: [0, 250, 0], size: 240, col: YEL, sfx: "boom" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
