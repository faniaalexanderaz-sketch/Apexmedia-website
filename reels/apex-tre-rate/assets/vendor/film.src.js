(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [96], end: 88,
    scenes: [
      { a: 0, b: 5, col: TEAL, cam: "push", items: [{ w: -1, p: "tag", a: ["33 €", TEAL], at: [-115, 0], s: 1.5 }, { w: 1, p: "tag", a: ["33 €", TEAL], at: [0, 70], s: 1.5 }, { w: 3, p: "tag", a: ["33 €", TEAL], at: [115, 0], s: 1.5 }] },
      { a: 5, b: 13, col: RED, cam: "low", items: [{ w: -1, p: "cart", at: [0, -30], s: 1.6 }, { w: 7, p: "bag", a: [RED], at: [-110, 90], in: "pop" }, { w: 8, p: "box", at: [110, 90] }, { w: 10, p: "cross", at: [0, 50, 150], s: 1.7, in: "spin", sfx: "thud" }] },
      { a: 13, b: 20, col: YEL, cam: "right", items: [{ w: 14, p: "shoe", a: [RED], at: [-30, 0], s: 2.4 }, { w: 18, p: "tag", a: ["100 €", YEL], at: [110, 120], s: 1.4, sfx: "thud" }] },
      { a: 20, b: 22, col: YEL, cam: "push", items: [{ w: -1, p: "shoe", a: [RED], at: [-70, 0], s: 1.7 }, { w: 20, p: "question", at: [100, 30, 40], s: 2.2, in: "spin" }] },
      { a: 22, b: 31, col: GRN, cam: "low", items: [{ w: -1, p: "shoe", a: [RED], at: [0, -70], s: 1.6 }, { w: 26, p: "tag", a: ["33 €", GRN], at: [-115, 70], s: 1.2 }, { w: 28, p: "tag", a: ["33 €", GRN], at: [0, 100], s: 1.2 }, { w: 29, p: "tag", a: ["33 €", GRN], at: [115, 70], s: 1.2 }] },
      { a: 31, b: 34, col: GRN, cam: "push", items: [{ w: -1, p: "shoe", a: [RED], at: [-75, 0], s: 1.8 }, { w: 32, p: "creditcard", a: [BLU], at: [95, 60], s: 1.3, in: "spin", sfx: "cash" }, { w: 33, p: "check", at: [95, 130, 60], s: 1.0, in: "pop", sfx: "ding" }] },
      { a: 34, b: 38, col: PUR, cam: "left", items: [{ w: -1, p: "scale", at: [0, -30], s: 1.6, upd: (o, tl) => o.userData.tilt(0.03 * Math.sin(tl * 3)) }, { w: 35, p: "tag", a: ["100 €", YEL], at: [-105, 100], s: 1.1 }, { w: 37, p: "tag", a: ["3 × 33 €", GRN], at: [105, 100], s: 1.1 }] },
      { a: 38, b: 47, col: PUR, cam: "push", items: [{ w: 41, p: "pawn", a: [PUR, 2.4], at: [-80, 20], in: "pop", lab: "IL CERVELLO", labCol: PUR, labFg: "#fff", labSize: 46 }, { w: 45, p: "tag", a: ["33 €", GRN], at: [80, 40], s: 1.8 }, { w: 45, p: "num", txt: "1°", at: [80, 240, 40], size: 190, col: PUR }] },
      { a: 47, b: 50, col: GRN, cam: "low", items: [{ w: -1, p: "tag", a: ["33 €", GRN], at: [-30, 0], s: 2.5 }, { w: 49, p: "arrow", a: [GRN, true], at: [130, 70], s: 1.4, lab: "POCO", labCol: GRN, labFg: "#fff" }] },
      { a: 50, b: 53, col: RED, cam: "push", items: [{ w: -1, p: "tag", a: ["100 €", RED, "#fff"], at: [-30, 0], s: 2.6 }, { w: 52, p: "arrow", a: [RED], at: [135, 70], s: 1.4, in: "rise", lab: "TANTO", labCol: RED, labFg: "#fff" }] },
      { a: 53, b: 58, col: ORA, cam: "right", items: [{ w: -1, p: "cart", at: [0, -40], s: 1.5 }, { w: 55, p: "bag", a: [ORA], at: [-105, 90] }, { w: 56, p: "shoe", a: [RED], at: [0, 120], s: 0.9 }, { w: 57, p: "box", at: [105, 90] }] },
      { a: 58, b: 63, col: ORA, cam: "low", items: [{ w: 58, p: "tag", a: ["33 €", WHT], at: [-110, 0], s: 1.2 }, { w: 60, p: "tag", a: ["25 €", WHT], at: [0, 60], s: 1.2 }, { w: 61, p: "tag", a: ["40 €", WHT], at: [110, 0], s: 1.2 }] },
      { a: 63, b: 67, col: RED, cam: "push", items: [{ w: 63, p: "tag", a: ["33 €", RED, "#fff"], at: [-110, 20], s: 1.3, sfx: "thud" }, { w: 63, p: "tag", a: ["25 €", RED, "#fff"], at: [0, 80], s: 1.3, sfx: 0 }, { w: 63, p: "tag", a: ["40 €", RED, "#fff"], at: [110, 20], s: 1.3, sfx: 0 }, { w: 65, p: "num", count: [0, 98, 0.5, " €"], at: [0, 230, 0], size: 230, col: RED }] },
      { a: 67, b: 70, col: TEAL, cam: "left", items: [{ w: 67, p: "shoe", a: [RED], at: [-115, 40], s: 1.3 }, { w: 68, p: "phone", a: [["NEW"], "#0d1719", TEAL], at: [0, -10], s: 1.3 }, { w: 69, p: "shirt", a: [ORA], at: [115, 40], s: 1.3 }] },
      { a: 70, b: 76, col: PUR, cam: "low", items: [{ w: -1, p: "tag", a: ["100 €", WHT], at: [-40, 0], s: 2.3 }, { w: 72, p: "arrow", a: [GRN, true], at: [130, 80], s: 1.3 }, { w: 73, p: "cross", at: [130, 30, 150], s: 1.0, in: "spin", sfx: "thud" }] },
      { a: 76, b: 79, col: RED, cam: "push", items: [{ w: 76, p: "calendar", a: ["MESE", "1"], at: [-110, 0], s: 1.2 }, { w: 77, p: "calendar", a: ["MESE", "2"], at: [0, 50], s: 1.2 }, { w: 78, p: "calendar", a: ["MESE", "3"], at: [110, 0], s: 1.2 }] },
      { a: 79, b: 84, col: YEL, cam: "right", items: [{ w: -1, p: "tag", a: ["33 €", WHT], at: [-110, 20], s: 1.2 }, { w: 80, p: "tag", a: ["33 €", WHT], at: [0, 70], s: 1.2 }, { w: 81, p: "tag", a: ["33 €", WHT], at: [110, 20], s: 1.2 }, { w: 83, p: "question", at: [0, 60, -80], s: 1.8, in: "spin" }] },
      { a: 84, b: 88, col: YEL, cam: "low", items: [{ w: 84, p: "tag", a: ["100 €", YEL], at: [0, 0], s: 2.8, in: "spin" }, { w: 87, p: "num", txt: "TOTALE", at: [0, 250, 0], size: 180, col: YEL, sfx: "boom" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
