(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [111], end: 103,
    scenes: [
      { a: 0, b: 6, col: ORA, cam: "push", items: [{ w: -1, p: "truck", a: [ORA, "GRATIS"], at: [0, 0], s: 1.5, in: "left" }, { w: 4, p: "num", txt: "49 €", at: [0, 215, 0], size: 230, col: ORA }] },
      { a: 6, b: 11, col: RED, cam: "low", items: [{ w: -1, p: "cart", at: [-20, 0], s: 1.6 }, { w: 8, p: "stack", a: [4], at: [130, 100], sfx: "cash" }, { w: 10, p: "arrow", a: [RED], at: [-150, 90], s: 1.5, in: "rise" }] },
      { a: 11, b: 16, col: TEAL, cam: "right", items: [{ w: 13, p: "cart", at: [-50, -10], s: 1.5 }, { w: 15, p: "shirt", a: [BLU], at: [95, 80], s: 1.3 }] },
      { a: 16, b: 19, col: TEAL, cam: "push", items: [{ w: -1, p: "shirt", a: [BLU], at: [-30, 0], s: 2.1 }, { w: 17, p: "tag", a: ["30 €", WHT], at: [110, 100], s: 1.3 }] },
      { a: 19, b: 24, col: ORA, cam: "left", items: [{ w: 20, p: "truck", a: [ORA, "SPEDIZIONE"], at: [-30, -10], s: 1.4, in: "left" }, { w: 22, p: "tag", a: ["+ 6 €", RED, "#fff"], at: [110, 110], s: 1.5, sfx: "thud" }] },
      { a: 24, b: 28, col: RED, cam: "low", items: [{ w: -1, p: "tag", a: ["+ 6 €", RED, "#fff"], at: [0, 0], s: 2.5 }, { w: 27, p: "num", txt: "UN FURTO", at: [0, 240, 0], size: 150, col: RED }] },
      { a: 28, b: 34, col: GRN, cam: "push", items: [{ w: 29, p: "phone", a: [["GRATIS", "SOPRA", "49 €"], "#0f1a12", GRN], at: [0, 0], s: 2.1, in: "spin" }, { w: 33, p: "star", at: [150, 190, 40], in: "spin", bob: 5 }] },
      { a: 34, b: 43, col: YEL, cam: "right", items: [{ w: -1, p: "cart", at: [-70, -10], s: 1.4 }, { w: 35, p: "shirt", a: [BLU], at: [-70, 60, -10], s: 0.8, in: "pop" }, { w: 39, p: "socks", a: [ORA], at: [100, 70], s: 1.7 }, { w: 41, p: "tag", a: ["20 €", YEL], at: [100, 170], s: 1.1 }] },
      { a: 43, b: 46, col: RED, cam: "low", items: [{ w: -1, p: "socks", a: [ORA], at: [0, 0], s: 2.6 }, { w: 45, p: "cross", at: [0, 50, 80], s: 2.2, in: "spin", sfx: "thud" }] },
      { a: 46, b: 53, col: ORA, cam: "push", items: [{ w: 48, p: "tag", a: ["50 €", RED, "#fff"], at: [-75, 30], s: 2.0, sfx: "cash" }, { w: 52, p: "tag", a: ["36 €", GREY, "#fff"], at: [105, -30], s: 1.3 }, { w: 47, p: "stack", a: [5], at: [-170, 130] }] },
      { a: 53, b: 56, col: GRN, cam: "left", items: [{ w: -1, p: "tag", a: ["- 6 €", GRN], at: [0, 0], s: 2.5, in: "spin" }, { w: 55, p: "coin", at: [130, 110], s: 1.6, spin: 3 }] },
      { a: 56, b: 60, col: PUR, cam: "low", items: [{ w: 57, p: "shop", a: [PUR, "IL NEGOZIO"], at: [0, 0], s: 2.0 }, { w: 59, p: "check", at: [150, 160, 60], s: 1.2, in: "spin", sfx: "ding" }] },
      { a: 60, b: 65, col: RED, cam: "push", items: [{ w: -1, p: "truck", a: [ORA, "6 €"], at: [0, -10], s: 1.5 }, { w: 60, p: "cross", at: [0, 60, 90], s: 2.3, in: "spin", sfx: "thud" }] },
      { a: 65, b: 71, col: GRN, cam: "right", items: [{ w: 66, p: "crowd", a: [12, WHT, 12, GREY, 4, 40], at: [0, 70], s: 1.3, in: "pop", sfx: "tick" }, { w: 68, p: "cart", at: [0, -90], s: 1.5, in: "rise" }, { w: 70, p: "bag", a: [GRN], at: [0, 40, -90], s: 1.0, in: "pop" }] },
      { a: 71, b: 75, col: GRN, cam: "low", items: [{ w: -1, p: "truck", a: [GRN, "GRATIS"], at: [0, 0], s: 1.6, in: "left" }, { w: 74, p: "check", at: [150, 150, 70], s: 1.3, in: "spin", sfx: "ding" }] },
      { a: 75, b: 82, col: YEL, cam: "push", items: [{ w: 76, p: "tag", a: ["49 €", YEL], at: [0, 0], s: 2.6 }, { w: 81, p: "question", at: [150, 170, 50], s: 1.5, in: "spin" }] },
      { a: 82, b: 90, col: YEL, cam: "left", items: [{ w: -1, p: "stack", a: [3], at: [-95, 40], s: 1.4, lab: "DI SOLITO 40 €", labCol: WHT, labSize: 46 }, { w: 83, p: "tag", a: ["49 €", YEL], at: [85, 0], s: 1.9 }, { w: 84, p: "arrow", a: [RED], at: [165, 110], s: 1.1, in: "rise" }] },
      { a: 90, b: 98, col: TEAL, cam: "right", items: [{ w: -1, p: "phone", a: [["SOGLIA", "49 €"], "#0d1719", TEAL], at: [0, 0], s: 2.0 }, { w: 95, p: "star", at: [-150, 180, 40], in: "spin", bob: 5 }, { w: 97, p: "question", at: [150, 180, 40], s: 1.5, in: "spin" }] },
      { a: 98, b: 103, col: RED, cam: "low", items: [{ w: 98, p: "socks", a: [ORA], at: [-60, 0], s: 2.2 }, { w: 102, p: "question", at: [110, 60, 40], s: 2.0, in: "spin" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
