/* "Ha messo in vetrina un vestito da trecento euro. Per vendere quello da centoventi." — Apex Media, Engine 5 (void) */
(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js");
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", DR = "#d0222e";
  const MENU = [["TAGLIATA", "45 €"], ["PASTA", "14 €"], ["PIZZA", "9 €"], ["INSALATA", "8 €"]];
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [122], end: 114,
    scenes: [
      { a: 0, b: 4, col: RED, cam: "push", items: [{ w: -1, p: "frame", a: [230, 215], at: [0, -30] }, { w: -1, p: "dress", a: [DR], at: [0, 10], s: 1.25, in: "pop" }, { w: 3, p: "star", at: [95, 150, 60], in: "spin", bob: 5 }] },
      { a: 4, b: 9, col: YEL, cam: "low", items: [{ w: -1, p: "dress", a: [DR], at: [-40, 0], s: 1.6, spin: 0.5 }, { w: 7, p: "tag", a: ["300 €", YEL], at: [95, 90], s: 1.5, sfx: "thud" }] },
      { a: 9, b: 14, col: GRN, cam: "right", items: [{ w: 9, p: "stack", a: [4], at: [-120, 110], sfx: "cash" }, { w: 11, p: "dress", a: [BLU], at: [10, 0], s: 1.6, in: "pop" }, { w: 13, p: "tag", a: ["120 €", GRN], at: [125, 90], s: 1.4 }] },
      { a: 14, b: 18, col: PUR, cam: "push", items: [{ w: 15, p: "shop", a: [PUR, "ABBIGLIAMENTO"], at: [0, -20], s: 2.0 }, { w: 17, p: "bag", a: [PUR], at: [-95, 110], in: "pop" }, { w: 17, p: "bag", a: [RED], at: [95, 110], in: "pop", sfx: 0 }] },
      { a: 18, b: 23, col: TEAL, cam: "left", items: [{ w: 19, p: "dress", a: [BLU], at: [-40, 0], s: 1.7 }, { w: 21, p: "tag", a: ["120 €", "#f4f1ea"], at: [95, 90], s: 1.5 }] },
      { a: 23, b: 27, col: RED, cam: "low", items: [{ w: -1, p: "dress", a: [BLU], at: [0, -20], s: 1.5 }, { w: 25, p: "bag", a: [GREY], at: [-110, 100], s: 0.9, in: "left" }, { w: 26, p: "cross", at: [0, 70, 90], s: 2.3, in: "spin", sfx: "thud" }] },
      { a: 27, b: 29, col: ORA, cam: "push", items: [{ w: -1, p: "tag", a: ["120 €", "#f4f1ea"], at: [-35, 0], s: 2.6 }, { w: 28, p: "arrow", a: [RED], at: [110, 60], s: 1.5, in: "rise", lab: "CARO", labCol: RED, labFg: "#fff" }] },
      { a: 29, b: 34, col: YEL, cam: "right", items: [{ w: -1, p: "dress", a: [BLU], at: [-70, 0], s: 1.5, lab: "120 €", labCol: "#f4f1ea" }, { w: 33, p: "dress", a: [DR], at: [70, 0], s: 1.5, in: "right", sfx: "thud" }] },
      { a: 34, b: 37, col: YEL, cam: "low", items: [{ w: -1, p: "dress", a: [DR], at: [-40, 0], s: 1.7, spin: 0.5 }, { w: 36, p: "tag", a: ["300 €", YEL], at: [100, 90], s: 1.6, sfx: "thud" }] },
      { a: 37, b: 42, col: GRN, cam: "push", items: [{ w: -1, p: "dress", a: [DR], at: [85, -40], s: 1.15, lab: "300 €", labCol: YEL }, { w: 39, p: "dress", a: [BLU], at: [-60, 30], s: 1.6, in: "pop", lab: "120 €", labCol: GRN, labFg: "#fff" }, { w: 38, p: "star", at: [-60, 250, 30], in: "spin", bob: 5, spin: 2 }] },
      { a: 42, b: 45, col: GRN, cam: "left", items: [{ w: -1, p: "dress", a: [BLU], at: [-45, 0], s: 1.6 }, { w: 43, p: "stack", a: [3], at: [-140, 110], sfx: "cash" }, { w: 44, p: "tag", a: ["AFFARE", GRN, "#fff"], at: [100, 90], s: 1.5, in: "spin", sfx: "ding" }] },
      { a: 45, b: 47, col: TEAL, cam: "low", items: [{ w: 46, p: "dress", a: [BLU], at: [0, 0], s: 1.9, in: "spin", spin: 1.2 }] },
      { a: 47, b: 49, col: TEAL, cam: "push", items: [{ w: 48, p: "tag", a: ["120 €", "#f4f1ea"], at: [0, 0], s: 2.8, in: "spin" }] },
      { a: 49, b: 56, col: PUR, cam: "right", items: [{ w: 50, p: "scale", at: [0, -30], s: 1.6, upd: (o, tl) => o.userData.tilt(0.24 * Math.min(1, Math.max(0, (tl - 1.0) / 0.5)) + 0.02 * Math.sin(tl * 3)) }, { w: 53, p: "tag", a: ["300 €", YEL], at: [-105, 100], s: 1.15, in: "left" }, { w: 55, p: "tag", a: ["120 €", GRN], at: [105, 100], s: 1.15, in: "right" }] },
      { a: 56, b: 60, col: YEL, cam: "low", items: [{ w: 58, p: "anchor", a: ["#d9dbe0"], at: [0, 0], s: 1.7, sfx: "thud", lab: "EFFETTO ÀNCORA", labCol: YEL }] },
      { a: 60, b: 65, col: ORA, cam: "push", items: [{ w: 61, p: "tag", a: ["300 €", YEL], at: [30, 0], s: 2.5 }, { w: 61, p: "num", txt: "1°", at: [-130, 190, 60], size: 210, col: ORA }] },
      { a: 65, b: 69, col: ORA, cam: "left", items: [{ w: -1, p: "tag", a: ["300 €", YEL], at: [-95, -50], s: 1.3 }, { w: 68, p: "tag", a: ["120 €", "#f4f1ea"], at: [70, 50], s: 2.0 }, { w: 68, p: "num", txt: "2°", at: [150, 250, 50], size: 190, col: ORA }] },
      { a: 69, b: 74, col: TEAL, cam: "low", items: [{ w: -1, p: "tag", a: ["120 €", "#f4f1ea"], at: [0, 0], s: 2.0 }, { w: 71, p: "arrow", a: [RED], at: [-150, 40], s: 1.5, in: "rise" }, { w: 73, p: "arrow", a: [GRN, true], at: [150, 40], s: 1.5, in: "drop" }] },
      { a: 74, b: 78, col: PUR, cam: "right", items: [{ w: 77, p: "card", a: ["MENU", MENU, RED, -1], at: [0, 0], s: 2.1, in: "spin" }] },
      { a: 78, b: 85, col: PUR, cam: "push", items: [{ w: -1, p: "card", a: ["MENU", MENU, RED, -1], at: [0, 0], s: 2.1, out: 81 }, { w: 81, p: "card", a: ["MENU", MENU, RED, 0], at: [0, 0], s: 2.1, in: "pop", sfx: "ding" }, { w: 84, p: "arrow", a: [RED], at: [140, 150, 60], s: 1.3, in: "rise" }] },
      { a: 85, b: 90, col: RED, cam: "low", items: [{ w: -1, p: "tag", a: ["45 €", YEL], at: [0, 0], s: 2.5 }, { w: 89, p: "cross", at: [0, 60, 80], s: 2.2, in: "spin", sfx: "thud" }] },
      { a: 90, b: 95, col: GRN, cam: "left", items: [{ w: -1, p: "tag", a: ["45 €", GREY, "#fff"], at: [-100, -60], s: 1.2 }, { w: 92, p: "tag", a: ["14 €", GRN], at: [50, 40], s: 2.1 }, { w: 94, p: "check", at: [165, 110, 60], s: 1.2, in: "spin", sfx: "ding" }] },
      { a: 95, b: 98, col: GRN, cam: "top", items: [{ w: 95, p: "tag", a: ["14 €", GRN], at: [-120, 0], s: 1.4 }, { w: 96, p: "tag", a: ["9 €", GRN], at: [0, 70], s: 1.4 }, { w: 97, p: "tag", a: ["8 €", GRN], at: [120, 0], s: 1.4 }] },
      { a: 98, b: 103, col: YEL, cam: "push", items: [{ w: 99, p: "tag", a: ["? €", "#f4f1ea"], at: [0, 0], s: 2.6 }, { w: 102, p: "question", at: [150, 150, 40], s: 1.5, in: "spin" }] },
      { a: 103, b: 108, col: YEL, cam: "right", items: [{ w: -1, p: "tag", a: ["? €", "#f4f1ea"], at: [0, 0], s: 2.0 }, { w: 103, p: "arrow", a: [RED], at: [-150, 40], s: 1.5, in: "rise" }, { w: 105, p: "arrow", a: [GRN, true], at: [150, 40], s: 1.5 }] },
      { a: 108, b: 114, col: RED, cam: "low", items: [{ w: -1, p: "tag", a: ["120 €", "#f4f1ea"], at: [-85, 0], s: 1.7 }, { w: 110, p: "question", at: [85, 20, 0], s: 1.6, in: "pop", out: 113 }, { w: 113, p: "tag", a: ["300 €", YEL], at: [85, 0], s: 1.7, in: "right", sfx: "thud" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
