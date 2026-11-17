(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const RICE = "#fbf7ea", BREAD = "#c58a3c", FRY = "#f2c230";
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [106], end: 98,
    scenes: [
      { a: 0, b: 7, col: RED, cam: "push", items: [{ w: -1, p: "bowl", a: [WHT, RICE], at: [-95, 70], s: 1.5 }, { w: -1, p: "bowl", a: [WHT, FRY], at: [0, 100], s: 1.5 }, { w: -1, p: "bowl", a: [WHT, "#e0563c"], at: [95, 70], s: 1.5 }, { w: 5, p: "tag", a: ["15 €", YEL], at: [0, -50], s: 1.9, sfx: "thud" }] },
      { a: 7, b: 11, col: YEL, cam: "low", items: [{ w: -1, p: "question", at: [-50, 20, 0], s: 2.6, in: "spin" }, { w: 10, p: "stack", a: [5], at: [110, 80], sfx: "cash" }] },
      { a: 11, b: 16, col: TEAL, cam: "right", items: [{ w: 11, p: "pawn", a: [TEAL, 2.3], at: [-60, 40], in: "pop" }, { w: 12, p: "door", a: [RED], at: [80, -40], s: 1.2, in: "rise" }, { w: 15, p: "star", at: [-60, 150, 40], in: "spin", bob: 5 }] },
      { a: 16, b: 20, col: TEAL, cam: "push", items: [{ w: 16, p: "bowl", a: [WHT, RICE], at: [-90, 60], s: 1.3 }, { w: 16, p: "bowl", a: [WHT, FRY], at: [0, 90], s: 1.3, sfx: 0 }, { w: 17, p: "bowl", a: [WHT, "#e0563c"], at: [90, 60], s: 1.3 }, { w: 17, p: "bowl", a: [WHT, BREAD], at: [-45, -30], s: 1.3, sfx: 0 }, { w: 18, p: "bowl", a: [WHT, "#7ac74f"], at: [45, -30], s: 1.3 }, { w: 18, p: "num", txt: "30 €", at: [0, 200, 0], size: 220, col: TEAL }] },
      { a: 20, b: 28, col: PUR, cam: "left", items: [{ w: 22, p: "shop", a: [PUR, "IL LOCALE"], at: [-30, -20], s: 1.8 }, { w: 25, p: "card", a: ["CONTI", [["COSTI", "OK"], ["MARGINE", "OK"]], GRN, 1], at: [120, 110], s: 1.0, in: "spin" }, { w: 27, p: "check", at: [120, 150, 110], s: 0.9, in: "pop", sfx: "ding" }] },
      { a: 28, b: 29, col: ORA, cam: "push", items: [{ w: 28, p: "num", txt: "1", at: [0, 120, 0], size: 420, col: ORA, sfx: "boom" }] },
      { a: 29, b: 37, col: ORA, cam: "low", items: [{ w: 33, p: "bowl", a: [WHT, RICE], at: [-110, 40], s: 1.7, lab: "RISO", labCol: WHT }, { w: 34, p: "bowl", a: [WHT, BREAD], at: [0, 80], s: 1.7, lab: "PANE", labCol: WHT }, { w: 36, p: "bowl", a: [WHT, FRY], at: [110, 40], s: 1.7, lab: "FRITTI", labCol: WHT }] },
      { a: 37, b: 42, col: ORA, cam: "right", items: [{ w: 37, p: "coin", at: [-90, 30], s: 1.8, spin: 3, lab: "COSTANO POCO", labCol: WHT, labSize: 44 }, { w: 40, p: "bowl", a: [WHT, RICE], at: [80, 20], s: 2.3, lab: "SAZIANO", labCol: ORA, labFg: "#fff" }] },
      { a: 42, b: 43, col: TEAL, cam: "push", items: [{ w: 42, p: "num", txt: "2", at: [0, 120, 0], size: 420, col: TEAL, sfx: "boom" }] },
      { a: 43, b: 48, col: TEAL, cam: "low", items: [{ w: 44, p: "bottle", a: [BLU], at: [-70, 20], s: 1.9 }, { w: 44, p: "bottle", a: [ORA], at: [10, 50], s: 1.6, sfx: 0 }, { w: 47, p: "tag", a: ["+ 4 €", RED, "#fff"], at: [115, 120], s: 1.4, sfx: "thud" }] },
      { a: 48, b: 54, col: TEAL, cam: "push", items: [{ w: -1, p: "bottle", a: [BLU], at: [-90, 10], s: 1.7 }, { w: 51, p: "stack", a: [6], at: [70, 40], s: 1.3, sfx: "cash" }, { w: 53, p: "arrow", a: [GRN], at: [160, 110], s: 1.2, in: "rise" }] },
      { a: 54, b: 55, col: PUR, cam: "push", items: [{ w: 54, p: "num", txt: "3", at: [0, 120, 0], size: 420, col: PUR, sfx: "boom" }] },
      { a: 55, b: 62, col: PUR, cam: "right", items: [{ w: 57, p: "pawn", a: [RED, 2.2], at: [-70, 30], in: "pop" }, { w: 59, p: "bowl", a: [WHT, RICE], at: [70, 0, 40], s: 1.3 }, { w: 60, p: "bowl", a: [WHT, FRY], at: [70, 36, 40], s: 1.3 }, { w: 61, p: "bowl", a: [WHT, "#e0563c"], at: [70, 72, 40], s: 1.3 }] },
      { a: 62, b: 69, col: PUR, cam: "low", items: [{ w: 65, p: "crowd", a: [5, WHT, 5, GREY, 5, 52], at: [0, 20], s: 1.5, in: "pop", sfx: "tick" }, { w: 67, p: "bowl", a: [WHT, RICE], at: [0, 130], s: 0.9 }] },
      { a: 69, b: 74, col: GRN, cam: "push", items: [{ w: 69, p: "scale", at: [0, -20], s: 1.6, upd: (o, tl) => o.userData.tilt(0.05 * Math.sin(tl * 3)) }, { w: 71, p: "tag", a: ["LA MEDIA", GRN], at: [0, 130], s: 1.4, in: "spin" }] },
      { a: 74, b: 75, col: YEL, cam: "push", items: [{ w: 74, p: "num", txt: "4", at: [0, 120, 0], size: 420, col: YEL, sfx: "boom" }] },
      { a: 75, b: 81, col: YEL, cam: "left", items: [{ w: 76, p: "bowl", a: [WHT, RICE], at: [-80, 60], s: 0.9 }, { w: 78, p: "bowl", a: [WHT, FRY], at: [10, 90], s: 0.7 }, { w: 80, p: "clock", at: [90, -50], s: 1.3, upd: hands(1.5) }] },
      { a: 81, b: 84, col: YEL, cam: "low", items: [{ w: -1, p: "clock", at: [0, 0], s: 2.1, upd: hands(6) }, { w: 82, p: "num", txt: "20 MIN", at: [0, 290, 0], size: 190, col: YEL }] },
      { a: 84, b: 89, col: RED, cam: "push", items: [{ w: 84, p: "pawn", a: [WHT, 2.4], at: [-60, 20], in: "pop" }, { w: 88, p: "tag", a: ["BASTA", RED, "#fff"], at: [85, 70], s: 1.7, sfx: "thud" }] },
      { a: 89, b: 94, col: RED, cam: "right", items: [{ w: -1, p: "pawn", a: [WHT, 2.4], at: [-60, 20] }, { w: 89, p: "cross", at: [-60, 40, 100], s: 1.7, in: "spin", sfx: "thud" }, { w: 93, p: "shop", a: [RED, "IL SISTEMA"], at: [100, -70], s: 1.1, in: "rise" }] },
      { a: 94, b: 98, col: RED, cam: "low", items: [{ w: -1, p: "frame", a: [240, 210], at: [0, -30] }, { w: 95, p: "pawn", a: [RED, 2.2], at: [0, 10], in: "pop" }, { w: 97, p: "tag", a: ["IL SISTEMA", RED, "#fff"], at: [0, 130], s: 1.4, sfx: "boom" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
