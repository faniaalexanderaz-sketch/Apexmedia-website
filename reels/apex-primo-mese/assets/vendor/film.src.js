(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const SUBS = [["VIDEO", "10 €"], ["MUSICA", "10 €"], ["APP", "10 €"]];
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [109], end: 101,
    scenes: [
      { a: 0, b: 5, col: GRN, cam: "push", items: [{ w: -1, p: "calendar", a: ["1° MESE", "0 €"], at: [-20, 0], s: 2.3 }, { w: 4, p: "gift", a: [GRN], at: [120, 120], s: 1.3, lab: "GRATIS", labCol: GRN, labFg: "#fff" }] },
      { a: 5, b: 12, col: RED, cam: "low", items: [{ w: -1, p: "calendar", a: ["1° MESE", "0 €"], at: [-90, -10], s: 1.5 }, { w: 9, p: "stack", a: [7], at: [80, 40], s: 1.4, sfx: "cash" }, { w: 11, p: "arrow", a: [RED], at: [165, 120], s: 1.3, in: "rise" }] },
      { a: 12, b: 16, col: TEAL, cam: "right", items: [{ w: 12, p: "creditcard", a: [BLU], at: [0, 0], s: 2.4, in: "spin" }] },
      { a: 16, b: 20, col: TEAL, cam: "push", items: [{ w: -1, p: "creditcard", a: [BLU], at: [-75, 0], s: 1.6 }, { w: 19, p: "tag", a: ["0 €", GRN], at: [95, 70], s: 1.8 }] },
      { a: 20, b: 25, col: PUR, cam: "left", items: [{ w: 20, p: "screen", a: [["PLAY"], RED, "#fff"], at: [-30, -10], s: 1.7 }, { w: 24, p: "calendar", a: ["PROVA", "7 GG"], at: [120, 120], s: 1.0 }] },
      { a: 25, b: 29, col: PUR, cam: "low", items: [{ w: -1, p: "screen", a: [["PLAY"], RED, "#fff"], at: [0, 0], s: 1.7, out: 28 }, { w: 28, p: "question", at: [0, 30, 0], s: 2.8, in: "spin" }] },
      { a: 29, b: 35, col: RED, cam: "push", items: [{ w: 30, p: "calendar", a: ["MESE", "2"], at: [-90, 0], s: 1.6 }, { w: 33, p: "tag", a: ["- 10 €", RED, "#fff"], at: [90, 50], s: 1.8, sfx: "thud" }] },
      { a: 35, b: 38, col: RED, cam: "right", items: [{ w: -1, p: "calendar", a: ["MESE", "3"], at: [-90, 0], s: 1.6 }, { w: 36, p: "tag", a: ["- 10 €", RED, "#fff"], at: [90, 50], s: 1.8, sfx: "thud" }] },
      { a: 38, b: 42, col: RED, cam: "low", items: [{ w: -1, p: "calendar", a: ["MESE", "4"], at: [-90, 0], s: 1.6 }, { w: 39, p: "tag", a: ["- 10 €", RED, "#fff"], at: [90, 50], s: 1.8, sfx: "thud" }, { w: 41, p: "coins", a: [9], at: [0, 150], s: 1.2, sfx: "coin" }] },
      { a: 42, b: 45, col: ORA, cam: "push", items: [{ w: -1, p: "phone", a: [["0", "AVVISI"], "#16110b", ORA], at: [0, 0], s: 2.0 }, { w: 44, p: "cross", at: [0, 90, 60], s: 2.0, in: "spin", sfx: "thud" }] },
      { a: 45, b: 49, col: PUR, cam: "left", items: [{ w: 46, p: "shop", a: [PUR, "LE AZIENDE"], at: [0, 0], s: 1.9 }, { w: 48, p: "check", at: [150, 170, 60], s: 1.2, in: "spin", sfx: "ding" }] },
      { a: 49, b: 53, col: ORA, cam: "low", items: [{ w: 49, p: "tag", a: ["DISDICI", WHT], at: [-30, -10], s: 2.0 }, { w: 52, p: "dumbbell", at: [110, 110], s: 1.3, lab: "SFORZO", labCol: ORA, labFg: "#fff" }] },
      { a: 53, b: 58, col: GRN, cam: "push", items: [{ w: 53, p: "sofa", at: [0, 0], s: 1.6 }, { w: 55, p: "pawn", a: [WHT, 1.6], at: [0, 52, 6], in: "pop" }, { w: 57, p: "tag", a: ["FACILE", GRN], at: [0, 140], s: 1.4, in: "spin", sfx: "ding" }] },
      { a: 58, b: 67, col: GRN, cam: "right", items: [{ w: 60, p: "crowd", a: [10, WHT, 10, GREY, 5, 48], at: [0, 20], s: 1.5, in: "pop", sfx: "tick" }, { w: 66, p: "num", txt: "NIENTE", at: [0, 230, 0], size: 180, col: GRN }] },
      { a: 67, b: 73, col: YEL, cam: "low", items: [{ w: 67, p: "tag", a: ["10 €", YEL], at: [-30, 0], s: 2.4 }, { w: 70, p: "calendar", a: ["AL", "MESE"], at: [125, 130], s: 1.0 }, { w: 72, p: "arrow", a: [GRN, true], at: [-160, 100], s: 1.2 }] },
      { a: 73, b: 78, col: RED, cam: "push", items: [{ w: 75, p: "calendar", a: ["1 ANNO", "12"], at: [-95, 0], s: 1.5 }, { w: 77, p: "stack", a: [7], at: [85, 30], s: 1.3, sfx: "cash" }, { w: 77, p: "num", count: [10, 120, 0.6, " €"], at: [85, 215, 30], size: 190, col: RED }] },
      { a: 78, b: 84, col: RED, cam: "left", items: [{ w: 80, p: "screen", a: [["PLAY"], GREY, "#fff"], at: [0, 0], s: 1.8 }, { w: 82, p: "cross", at: [0, 70, 80], s: 2.2, in: "spin", sfx: "thud" }] },
      { a: 84, b: 92, col: TEAL, cam: "push", items: [{ w: 85, p: "phone", a: [["ESTRATTO", "CONTO"], "#0d1719", TEAL], at: [-80, -10], s: 1.8, in: "spin" }, { w: 91, p: "card", a: ["ABBONAMENTI", SUBS, RED, -1], at: [85, 50], s: 1.4 }] },
      { a: 92, b: 101, col: YEL, cam: "low", items: [{ w: -1, p: "card", a: ["ABBONAMENTI", SUBS, RED, -1], at: [-30, 0], s: 2.0, out: 97 }, { w: 97, p: "card", a: ["ABBONAMENTI", SUBS, RED, 2], at: [-30, 0], s: 2.0, in: "pop", sfx: "ding" }, { w: 100, p: "question", at: [150, 190, 40], s: 1.5, in: "spin" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
