(function (root) {
  "use strict";
  const C4 = root.C4 || require("./apx4.js"), PI = Math.PI;
  const RED = "#FF2A3D", GRN = "#2fe07a", TEAL = "#19e0d0", ORA = "#ff7a1a", PUR = "#b06bff", YEL = "#ffd21c", GREY = "#7a7a84", BLU = "#2a7bff", WHT = "#f4f1ea";
  const pulse = (o, tl) => o.scale.setScalar(1 + 0.16 * Math.abs(Math.sin(tl * 9))), hands = (k) => (o, tl) => { o.userData.hand.rotation.z = -tl * k; o.userData.hand2.rotation.z = -tl * k / 12; };
  const FILM = C4.film5({ WT: __W__, VOEND: __VOEND__, caps: __CAPS__, motion: [115], end: 107,
    scenes: [
      { a: 0, b: 5, col: RED, cam: "push", items: [{ w: -1, p: "timer", a: ["10:00"], at: [0, 0], s: 1.9, out: 1 }, { w: 1, p: "timer", a: ["09:59"], at: [0, 0], s: 1.9, in: "pop", out: 3, sfx: "tick" }, { w: 3, p: "timer", a: ["09:58"], at: [0, 0], s: 1.9, in: "pop", sfx: "tick" }, { w: -1, p: "tag", a: ["OFFERTA", YEL], at: [0, 130], s: 1.3 }] },
      { a: 5, b: 10, col: RED, cam: "low", items: [{ w: -1, p: "timer", a: ["09:57"], at: [0, 0], s: 1.9 }, { w: 7, p: "cross", at: [0, 60, 90], s: 2.4, in: "spin", sfx: "thud" }] },
      { a: 10, b: 13, col: TEAL, cam: "right", items: [{ w: 10, p: "phone", a: [["SHOP", "-50%"], "#0d1719", TEAL], at: [0, 0], s: 2.1, in: "spin" }] },
      { a: 13, b: 19, col: TEAL, cam: "push", items: [{ w: -1, p: "phone", a: [["SHOP", "-50%"], "#0d1719", TEAL], at: [-85, -10], s: 1.6 }, { w: 14, p: "timer", a: ["10:00"], at: [85, 70], s: 1.15, out: 16 }, { w: 16, p: "timer", a: ["09:59"], at: [85, 70], s: 1.15, in: "pop", out: 18, sfx: "tick" }, { w: 18, p: "timer", a: ["09:58"], at: [85, 70], s: 1.15, in: "pop", sfx: "tick" }] },
      { a: 19, b: 25, col: YEL, cam: "left", items: [{ w: 19, p: "timer", a: ["10 MIN", YEL], at: [0, -20], s: 1.7 }, { w: 24, p: "tag", a: ["-50%", RED, "#fff"], at: [0, 130], s: 1.6, in: "spin" }] },
      { a: 25, b: 28, col: RED, cam: "low", items: [{ w: 25, p: "heart", a: [RED], at: [0, 40, 0], s: 3.0, in: "pop", upd: pulse, sfx: "boom" }] },
      { a: 28, b: 29, col: GRN, cam: "push", items: [{ w: 28, p: "creditcard", a: [BLU], at: [-40, 0], s: 2.0, in: "spin", sfx: "cash" }, { w: 28, p: "stack", a: [4], at: [110, 90], sfx: 0 }] },
      { a: 29, b: 38, col: PUR, cam: "right", items: [{ w: -1, p: "phone", a: [["OFFERTA", "00:07"], "#150d1c", RED], at: [0, 0], s: 2.0, out: 32 }, { w: 32, p: "cross", at: [0, 80, 0], s: 2.2, in: "spin", out: 36 }, { w: 36, p: "phone", a: [["OFFERTA", "10:00"], "#150d1c", GRN], at: [0, 0], s: 2.0, in: "spin", sfx: "notif" }] },
      { a: 38, b: 43, col: PUR, cam: "low", items: [{ w: 38, p: "timer", a: ["10:00"], at: [0, 0], s: 2.0, in: "spin", lab: "RIPARTE", labCol: PUR, labFg: "#fff" }] },
      { a: 43, b: 49, col: ORA, cam: "push", items: [{ w: 43, p: "clock", at: [-40, 0], s: 2.1, upd: hands(5) }, { w: 48, p: "tag", a: ["OFFERTA", YEL], at: [120, 110], s: 1.0 }, { w: 48, p: "cross", at: [120, 10, 150], s: 0.9, in: "spin", sfx: 0 }] },
      { a: 49, b: 52, col: ORA, cam: "left", items: [{ w: -1, p: "clock", at: [-80, -10], s: 1.7, upd: hands(5) }, { w: 51, p: "pawn", a: [ORA, 2.2], at: [90, 50], in: "pop", lab: "IL TUO", labCol: ORA, labFg: "#fff" }] },
      { a: 52, b: 55, col: RED, cam: "low", items: [{ w: -1, p: "timer", a: ["00:59"], at: [0, 0], s: 1.8 }, { w: 54, p: "num", txt: "URGENZA", at: [0, 230, 0], size: 170, col: RED }] },
      { a: 55, b: 58, col: RED, cam: "push", items: [{ w: 55, p: "clock", at: [0, 0], s: 2.4, in: "spin", upd: hands(22) }] },
      { a: 58, b: 63, col: YEL, cam: "right", items: [{ w: -1, p: "tag", a: ["39 €", WHT], at: [-90, 0], s: 1.6 }, { w: 60, p: "tag", a: ["29 €", GRN], at: [90, 0], s: 1.6 }, { w: 58, p: "cross", at: [0, 40, 110], s: 1.6, in: "spin" }] },
      { a: 63, b: 66, col: YEL, cam: "low", items: [{ w: 63, p: "question", at: [0, 20, 0], s: 2.6, in: "pop" }, { w: 63, p: "cross", at: [0, 30, 60], s: 2.2, in: "spin", sfx: 0 }] },
      { a: 66, b: 68, col: GRN, cam: "push", items: [{ w: -1, p: "creditcard", a: [BLU], at: [-50, 0], s: 1.9 }, { w: 67, p: "stack", a: [5], at: [110, 80], sfx: "cash" }] },
      { a: 68, b: 76, col: PUR, cam: "left", items: [{ w: 73, p: "tag", a: ["ULTIMI 3", RED, "#fff"], at: [0, -70], s: 1.8 }, { w: 74, p: "box", at: [-95, 90] }, { w: 74, p: "box", at: [0, 110], sfx: 0 }, { w: 75, p: "box", at: [95, 90] }] },
      { a: 76, b: 80, col: PUR, cam: "low", items: [{ w: 77, p: "calendar", a: ["SOLO PER", "OGGI"], at: [0, 0], s: 2.3, in: "spin" }] },
      { a: 80, b: 88, col: GRN, cam: "push", items: [{ w: 80, p: "tag", a: ["OFFERTA VERA", GRN], at: [-20, 0], s: 2.0 }, { w: 81, p: "check", at: [140, 170, 50], s: 1.1, in: "spin", sfx: "ding" }, { w: 86, p: "clock", at: [-130, 150], s: 0.9, upd: hands(20) }, { w: 87, p: "cross", at: [-130, 10, 200], s: 0.8, in: "spin" }] },
      { a: 88, b: 92, col: TEAL, cam: "right", items: [{ w: 88, p: "timer", a: ["04:59"], at: [0, 0], s: 2.0, in: "spin" }] },
      { a: 92, b: 97, col: TEAL, cam: "low", items: [{ w: -1, p: "clock", at: [0, 0], s: 2.0, upd: hands(1.2) }, { w: 96, p: "num", txt: "ASPETTA", at: [0, 250, 0], size: 180, col: TEAL }] },
      { a: 97, b: 101, col: YEL, cam: "push", items: [{ w: 98, p: "calendar", a: ["DOMANI", "+1"], at: [-30, 0], s: 2.1 }, { w: 99, p: "check", at: [140, 110, 60], s: 1.2, in: "spin", sfx: "ding" }] },
      { a: 101, b: 104, col: RED, cam: "left", items: [{ w: -1, p: "tag", a: ["OFFERTA", YEL], at: [0, 0], s: 2.4 }, { w: 101, p: "cross", at: [0, 55, 80], s: 2.2, in: "spin", sfx: "thud" }] },
      { a: 104, b: 107, col: RED, cam: "low", items: [{ w: 104, p: "timer", a: ["00:00"], at: [0, -40], s: 1.6 }, { w: 106, p: "tag", a: ["TRAPPOLA", RED, "#fff"], at: [0, 110], s: 1.9, sfx: "boom" }] },
    ] });
  if (typeof module !== "undefined" && module.exports) module.exports = FILM;
  root.FILM4 = FILM;
  if (typeof THREE !== "undefined") C4.film5Browser(FILM);
})(typeof window !== "undefined" ? window : globalThis);
