(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const ROWS = [["CAFFÈ", "3 €"], ["APP", "9 €"], ["SHOPPING", "50 €"], ["SPESA", "62 €"]];
  const FILM = C4.film5({ v: 2, WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [133], end: 125,
    scenes: [
      { a: 0, b: 7, col: RED, rk: 0.9, items: [{ w: -1, p: "stack", a: [8], at: [0, -20], s: 1.9, out: 4, lab: "STIPENDIO", labCol: WHT }, { w: 4, p: "door", a: [RED], at: [-115, 30], s: 0.95, in: "rise" }, { w: 5, p: "door", a: [RED], at: [0, 60], s: 0.95, in: "rise" }, { w: 6, p: "door", a: [RED], at: [115, 30], s: 0.95, in: "rise" }] },
      { a: 7, b: 13, col: PUR, items: [{ w: 7, p: "house", at: [-20, 0], s: 1.9, lab: "AFFITTO", labCol: WHT }, { w: 8, p: "cross", at: [-20, 70, 120], s: 2.1, in: "spin", sfx: "thud" }] },
      { a: 13, b: 22, col: YEL, items: [{ w: 13, p: "num", txt: "3°", at: [-95, 150, 0], size: 300, col: YEL, sfx: "boom" }, { w: 16, p: "num", txt: "?", at: [95, 150, 0], size: 420, col: WHT }, { w: 20, p: "arrow", a: [RED], at: [165, 100], s: 1.1, in: "rise" }] },
      { a: 22, b: 26, col: ORA, items: [{ w: 22, p: "num", txt: "1", at: [-110, 150, 0], size: 340, col: ORA, sfx: "boom" }, { w: 24, p: "coin", at: [45, 20], s: 3.0, spin: 3 }, { w: 25, p: "coins", a: [6], at: [130, 100], s: 1.2, sfx: "coin" }] },
      { a: 26, b: 34, col: TEAL, items: [{ w: 26, p: "tag", a: ["3 €", YEL], at: [-95, -30], s: 1.5 }, { w: 31, p: "cup", at: [30, 60], s: 2.0 }, { w: 33, p: "bottle", a: [ORA], at: [125, 10], s: 1.3 }] },
      { a: 34, b: 37, col: PUR, items: [{ w: -1, p: "coin", at: [0, 0], s: 1.3, spin: 4, lab: "NON LI SENTI", labCol: GREY, labFg: "#fff", labSize: 46 }] },
      { a: 37, b: 41, col: RED, items: [{ w: 37, p: "stack", a: [8], at: [-25, 0], s: 1.6, sfx: "cash" }, { w: 38, p: "num", count: [0, 1000, 0.5, " €"], at: [-25, 245, 0], size: 200, col: RED }, { w: 40, p: "calendar", a: ["OGNI", "ANNO"], at: [125, 120], s: 0.95 }] },
      { a: 41, b: 44, col: TEAL, items: [{ w: 41, p: "num", txt: "2", at: [-120, 150, 0], size: 340, col: TEAL, sfx: "boom" }, { w: 43, p: "app", a: [BLU, "A"], at: [20, 20], s: 1.3, sfx: "notif" }, { w: 43, p: "app", a: [RED, "V"], at: [110, 70], s: 1.3, sfx: 0 }] },
      { a: 44, b: 50, col: PUR, items: [{ w: -1, p: "app", a: [BLU, "A"], at: [-140, 20], s: 0.95 }, { w: -1, p: "app", a: [RED, "V"], at: [-70, 50], s: 0.95 }, { w: 45, p: "app", a: [GRN, "M"], at: [0, 20], s: 0.95, in: "pop" }, { w: 45, p: "app", a: [ORA, "G"], at: [70, 50], s: 0.95, in: "pop", sfx: 0 }, { w: 46, p: "app", a: [YEL, "F"], at: [140, 20], s: 0.95, in: "pop" }, { w: 48, p: "cross", at: [0, 10, 80], s: 0.7, in: "spin" }, { w: 48, p: "cross", at: [70, 10, 110], s: 0.7, in: "spin", sfx: 0 }, { w: 49, p: "cross", at: [140, 10, 80], s: 0.7, in: "spin" }] },
      { a: 50, b: 55, col: RED, items: [{ w: 51, p: "tag", a: ["300 €", RED, "#fff"], at: [-35, 0], s: 2.3 }, { w: 54, p: "arrow", a: [RED, true], at: [130, 70], s: 1.4, sfx: "thud" }] },
      { a: 55, b: 63, col: YEL, items: [{ w: 55, p: "num", txt: "3", at: [-110, 150, 0], size: 340, col: YEL, sfx: "boom" }, { w: 57, p: "num", txt: "?", at: [70, 150, 0], size: 420, col: WHT }, { w: 61, p: "pawn", a: [GREY, 2.0], at: [150, 110], in: "pop" }] },
      { a: 63, b: 69, col: PUR, items: [{ w: 63, p: "gift", a: [PUR], at: [-85, 20], s: 1.7 }, { w: 64, p: "bag", a: [RED], at: [70, 40], s: 1.5 }, { w: 66, p: "tag", a: ["ME LO MERITO", YEL], at: [0, 150], s: 1.35, in: "pop" }, { w: 68, p: "heart", a: [RED], at: [0, 215, 0], s: 1.2, in: "pop", bob: 6 }] },
      { a: 69, b: 71, col: RED, items: [{ w: 69, p: "calendar", a: ["OGGI", "NO"], at: [-35, 0], s: 2.0 }, { w: 70, p: "arrow", a: [RED, true], at: [120, 60], s: 1.4 }] },
      { a: 71, b: 74, col: TEAL, items: [{ w: 71, p: "iphone", at: [0, 0], s: 1.35, in: "pop", ry: 2.6, spin: 2.6 }] },
      { a: 74, b: 76, col: GRN, items: [{ w: 74, p: "box", at: [-65, 30], s: 1.7 }, { w: 74, p: "creditcard", a: [BLU], at: [75, 70], s: 1.3, in: "spin", sfx: "cash" }] },
      { a: 76, b: 80, col: YEL, items: [{ w: 76, p: "tag", a: ["50 €", YEL], at: [-45, 0], s: 2.3 }, { w: 79, p: "calendar", a: ["OGNI", "7 GG"], at: [120, 120], s: 1.0 }] },
      { a: 80, b: 85, col: TEAL, items: [{ w: 80, p: "heart", a: [RED], at: [-80, 50, 0], s: 2.3, in: "pop", upd: pulse }, { w: 83, p: "clock", at: [90, 0], s: 1.5, upd: hands(14), lab: "10 MIN", labCol: TEAL }] },
      { a: 85, b: 89, col: RED, items: [{ w: 85, p: "stack", a: [8], at: [-105, 30], s: 1.2, sfx: "cash" }, { w: 86, p: "stack", a: [8], at: [0, 60], s: 1.2, sfx: "cash" }, { w: 86, p: "stack", a: [8], at: [105, 30], s: 1.2, sfx: 0 }, { w: 86, p: "num", count: [0, 2600, 0.7, " €"], at: [0, 215, 0], size: 200, col: RED }] },
      { a: 89, b: 98, col: GRN, items: [{ w: -1, p: "star", at: [0, 70, -20], s: 2.4, spin: 2.2, bob: 6, in: "pop" }, { w: 94, p: "tag", a: ["STOP", RED, "#fff"], at: [0, 130], s: 1.9, sfx: "thud" }] },
      { a: 98, b: 105, col: TEAL, items: [{ w: 99, p: "calendar", a: ["1 VOLTA", "AL MESE"], at: [-95, 0], s: 1.5 }, { w: 103, p: "card", a: ["ESTRATTO", ROWS, RED, -1], at: [80, 20], s: 1.5, in: "spin" }] },
      { a: 105, b: 112, col: YEL, items: [{ w: -1, p: "card", a: ["ESTRATTO", ROWS, RED, -1], at: [-10, 0], s: 2.1, out: 107 }, { w: 107, p: "card", a: ["ESTRATTO", ROWS, RED, 2], at: [-10, 0], s: 2.1, in: "pop", sfx: "ding", lead: 0 }, { w: 111, p: "cross", at: [135, 170, 60], s: 1.0, in: "spin" }] },
      { a: 112, b: 117, col: RED, items: [{ w: -1, p: "stack", a: [6], at: [-40, 0], s: 1.6 }, { w: 112, p: "cross", at: [-40, 60, 110], s: 1.9, in: "spin", sfx: "thud", lead: 0 }, { w: 114, p: "arrow", a: [GRN], at: [120, 60], s: 1.4, in: "rise" }] },
      { a: 117, b: 125, col: GRN, items: [{ w: -1, p: "piggy", at: [-25, 0], s: 2.2, in: "pop" }, { w: 120, p: "coins", a: [8], at: [125, 110], s: 1.3, sfx: "coin" }, { w: 124, p: "check", at: [-25, 215, 0], s: 1.2, in: "spin", sfx: "ding" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
