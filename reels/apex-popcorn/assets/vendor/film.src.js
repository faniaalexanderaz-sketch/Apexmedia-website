(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const BILLS = [["LUCE", "€€"], ["AFFITTO", "€€€"], ["PERSONALE", "€€€"]];
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [118], end: 110,
    scenes: [
      { a: 0, b: 6, col: RED, cam: "push", items: [{ w: -1, p: "screen", a: [["FILM"], "#1a0a0c", WHT], at: [0, 0], s: 1.8, lab: "CINEMA", labCol: RED, labFg: "#fff" }, { w: 2, p: "cross", at: [0, 70, 90], s: 2.2, in: "spin", sfx: "thud" }] },
      { a: 6, b: 9, col: YEL, cam: "low", items: [{ w: -1, p: "popcorn", at: [-30, 0], s: 2.6, in: "pop" }, { w: 6, p: "stack", a: [5], at: [125, 100], sfx: "cash" }] },
      { a: 9, b: 15, col: TEAL, cam: "right", items: [{ w: 11, p: "ticket", a: ["CINEMA", YEL], at: [0, 0], s: 2.2, in: "spin" }, { w: 13, p: "tag", a: ["9 €", WHT], at: [110, 130], s: 1.3 }] },
      { a: 15, b: 25, col: PUR, cam: "push", items: [{ w: -1, p: "ticket", a: ["9 €", YEL], at: [-95, -30], s: 1.3 }, { w: 17, p: "stack", a: [6], at: [85, 30], s: 1.3, sfx: "cash", lab: "A CHI FA IL FILM", labCol: PUR, labFg: "#fff", labSize: 46 }, { w: 24, p: "screen", a: [["FILM"], "#1a0a0c", WHT], at: [85, -110], s: 0.9, in: "rise" }] },
      { a: 25, b: 29, col: PUR, cam: "low", items: [{ w: -1, p: "coin", at: [0, 0], s: 3.0, spin: 2, lab: "AL CINEMA", labCol: WHT }, { w: 28, p: "arrow", a: [RED, true], at: [130, 60], s: 1.4 }] },
      { a: 29, b: 33, col: ORA, cam: "left", items: [{ w: 30, p: "shop", a: [ORA, "BAR"], at: [0, 0], s: 2.0 }] },
      { a: 33, b: 39, col: YEL, cam: "push", items: [{ w: 34, p: "popcorn", at: [-40, 0], s: 2.4 }, { w: 37, p: "tag", a: ["6 €", YEL], at: [110, 110], s: 1.5, sfx: "thud" }] },
      { a: 39, b: 45, col: YEL, cam: "right", items: [{ w: -1, p: "popcorn", at: [-80, 0], s: 1.8 }, { w: 41, p: "coin", at: [90, 60], s: 1.5, spin: 3, lab: "POCHI CENTESIMI", labCol: WHT, labSize: 44 }] },
      { a: 45, b: 50, col: GRN, cam: "low", items: [{ w: -1, p: "stack", a: [6], at: [0, 0], s: 1.5 }, { w: 46, p: "stack", a: [4], at: [-120, 70], s: 1.2, sfx: "cash" }, { w: 47, p: "stack", a: [5], at: [120, 70], s: 1.2, sfx: "cash" }, { w: 49, p: "num", txt: "GUADAGNO", at: [0, 235, 0], size: 160, col: GRN }] },
      { a: 50, b: 57, col: ORA, cam: "push", items: [{ w: 53, p: "shop", a: [ORA, "BAR"], at: [-80, 70], s: 1.2 }, { w: 56, p: "door", a: [RED], at: [100, -50], s: 1.2, in: "rise", lab: "INGRESSO", labCol: WHT, labSize: 46 }] },
      { a: 57, b: 65, col: ORA, cam: "low", items: [{ w: -1, p: "popcorn", at: [0, 0], s: 2.2 }, { w: 59, p: "star", at: [-120, 200, 0], s: 0.8, in: "pop", bob: 10 }, { w: 61, p: "star", at: [120, 240, 0], s: 0.9, in: "pop", bob: 10 }, { w: 64, p: "star", at: [0, 290, 0], s: 1.0, in: "pop", bob: 10 }] },
      { a: 65, b: 71, col: TEAL, cam: "right", items: [{ w: 66, p: "screen", a: [["FILM"], "#1a0a0c", WHT], at: [-60, -30], s: 1.5 }, { w: 70, p: "door", a: [TEAL], at: [120, 70], s: 1.0, upd: (o, tl) => { o.userData.leaf.rotation.y = -1.1 * Math.min(1, Math.max(0, (tl - 0.25) / 0.4)); } }] },
      { a: 71, b: 78, col: GRN, cam: "push", items: [{ w: 72, p: "popcorn", at: [-90, 20], s: 1.8 }, { w: 75, p: "coins", a: [8], at: [0, 110], s: 1.2, sfx: "coin" }, { w: 77, p: "card", a: ["BOLLETTE", BILLS, GRN, -1], at: [90, -20], s: 1.4, in: "spin" }] },
      { a: 78, b: 83, col: PUR, cam: "top", items: [{ w: 78, p: "shop", a: [PUR], at: [-120, -20], s: 1.0 }, { w: 80, p: "shop", a: [TEAL], at: [0, 60], s: 1.0 }, { w: 81, p: "shop", a: [ORA], at: [120, -20], s: 1.0 }] },
      { a: 83, b: 87, col: TEAL, cam: "low", items: [{ w: 84, p: "printer", at: [0, 0], s: 1.8 }, { w: 86, p: "tag", a: ["POCO", GRN], at: [130, 130], s: 1.2 }] },
      { a: 87, b: 90, col: RED, cam: "push", items: [{ w: 88, p: "cartridge", a: [TEAL], at: [-60, 0], s: 1.9 }, { w: 88, p: "cartridge", a: [PUR], at: [0, 40], s: 1.9, sfx: 0 }, { w: 88, p: "cartridge", a: [YEL], at: [60, 0], s: 1.9, sfx: 0 }, { w: 89, p: "tag", a: ["TANTO", RED, "#fff"], at: [0, 140], s: 1.4, sfx: "thud" }] },
      { a: 90, b: 94, col: TEAL, cam: "left", items: [{ w: 91, p: "razor", a: [BLU], at: [-20, 0], s: 2.0, in: "spin" }, { w: 93, p: "tag", a: ["POCO", GRN], at: [120, 120], s: 1.2 }] },
      { a: 94, b: 97, col: RED, cam: "low", items: [{ w: 95, p: "tag", a: ["LAMETTE", WHT], at: [0, -20], s: 2.0 }, { w: 96, p: "tag", a: ["TANTO", RED, "#fff"], at: [0, 120], s: 1.5, sfx: "thud" }] },
      { a: 97, b: 102, col: YEL, cam: "push", items: [{ w: -1, p: "star", at: [0, 40, 0], s: 2.8, spin: 2, bob: 6, in: "pop" }, { w: 101, p: "ticket", a: ["CINEMA", YEL], at: [0, 150], s: 1.2 }] },
      { a: 102, b: 110, col: GRN, cam: "right", items: [{ w: -1, p: "ticket", a: ["CINEMA", YEL], at: [-95, -10], s: 1.3 }, { w: 103, p: "cross", at: [-95, 20, 80], s: 1.3, in: "spin" }, { w: 106, p: "popcorn", at: [85, 0], s: 1.9 }, { w: 109, p: "stack", a: [4], at: [170, 120], sfx: "cash" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
