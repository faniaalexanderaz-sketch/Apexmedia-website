/* =============================================================
   «Apex City»: il videogioco che gira sulla TV del relax.
   Un gioco d'azione originale in una città di mare al tramonto:
   inseguimento in auto, il protagonista frena, scende, si ripara
   e spara alle auto della polizia, le stelle del ricercato salgono
   fino a sei, arriva l'elicottero col faro, poi la fuga e la
   missione compiuta. Disegnato a mano su tela 640×360, ogni
   fotogramma dipende solo dal tempo (si può ripartire ovunque).
   ============================================================= */

type X = CanvasRenderingContext2D;
const W = 640, H = 360, ORIZ = 150, CX = W / 2;

const CICLO = 52;
/** Fasi del giro, in secondi. */
const F = { titolo: 3, guida: 17, scende: 21, spara: 38, fuga: 45 } as const;

function rett(x: X, a: number, b: number, w: number, h: number, c: string) { x.fillStyle = c; x.fillRect(a, b, w, h); }
function stella(x: X, cx: number, cy: number, r: number, piena: boolean, c: string) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath();
  if (piena) { x.fillStyle = c; x.fill(); }
  x.strokeStyle = piena ? "#000" : "rgba(255,255,255,0.75)"; x.lineWidth = 1.6; x.stroke();
}

/* ---------- Città ---------- */

function cielo(x: X, t: number) {
  const g = x.createLinearGradient(0, 0, 0, ORIZ);
  g.addColorStop(0, "#1b0f45"); g.addColorStop(0.45, "#b3246e"); g.addColorStop(0.85, "#ff8c4a"); g.addColorStop(1, "#ffc37a");
  x.fillStyle = g; x.fillRect(0, 0, W, ORIZ + 2);
  x.fillStyle = "#ffe2a0"; x.beginPath(); x.arc(CX + 150, ORIZ - 6, 34, 0, 7); x.fill();
  x.globalAlpha = 0.25; x.fillStyle = "#fff";
  for (let i = 0; i < 5; i++) { const nx = ((i * 157 + t * 6) % (W + 200)) - 100; x.beginPath(); x.ellipse(nx, 40 + (i % 3) * 22, 60, 7, 0, 0, 7); x.fill(); }
  x.globalAlpha = 1;
}

/** Palazzi ai lati della strada, che scorrono con la velocità. */
function palazzi(x: X, scorre: number) {
  for (let lato = -1; lato <= 1; lato += 2) {
    for (let i = 0; i < 9; i++) {
      const f = ((i / 9) + scorre) % 1, k = f * f;
      const bx = CX + lato * (40 + k * 420), alto = 40 + ((i * 53) % 70) + k * 210, largo = 16 + k * 150;
      const base = ORIZ + k * (H - ORIZ) * 0.55;
      const sx = lato < 0 ? bx - largo : bx;
      x.fillStyle = ["#2a1747", "#341a52", "#22153c"][i % 3]; x.fillRect(sx, base - alto, largo, alto);
      x.fillStyle = i % 2 ? "#ffd47a" : "#8ef2ff";
      const fin = Math.max(2, largo / 7);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) if ((i + r + c) % 3) x.fillRect(sx + 3 + c * fin * 1.6, base - alto + 6 + r * (alto / 7), fin * 0.8, alto / 16);
      // insegna al neon
      x.shadowBlur = 10; x.shadowColor = i % 2 ? "#ff3ea5" : "#2ee9ff"; x.fillStyle = x.shadowColor;
      x.fillRect(sx + largo * 0.15, base - alto - 6 - k * 6, largo * 0.7, 3 + k * 5); x.shadowBlur = 0;
    }
  }
}

function strada(x: X, scorre: number) {
  x.fillStyle = "#24202e"; x.beginPath(); x.moveTo(CX - 18, ORIZ); x.lineTo(CX + 18, ORIZ); x.lineTo(W + 140, H); x.lineTo(-140, H); x.closePath(); x.fill();
  x.fillStyle = "#3a3346"; x.beginPath(); x.moveTo(CX + 18, ORIZ); x.lineTo(CX + 26, ORIZ); x.lineTo(W + 320, H); x.lineTo(W + 140, H); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(CX - 18, ORIZ); x.lineTo(CX - 26, ORIZ); x.lineTo(-320, H); x.lineTo(-140, H); x.closePath(); x.fill();
  for (let i = 0; i < 9; i++) {
    const f = ((i / 9) + scorre) % 1, y = ORIZ + f * f * (H - ORIZ);
    x.fillStyle = "#f5efd0"; x.fillRect(CX - (1 + f * 6), y, 2 + f * 12, 3 + f * 26);
  }
  // lampioni
  for (let i = 0; i < 5; i++) {
    const f = ((i / 5) + scorre * 0.9) % 1, k = f * f, y = ORIZ + k * (H - ORIZ);
    for (const l of [-1, 1]) {
      const px = CX + l * (30 + k * 380), alto = 10 + k * 150;
      x.strokeStyle = "#140c20"; x.lineWidth = 1 + k * 4; x.beginPath(); x.moveTo(px, y); x.lineTo(px, y - alto); x.stroke();
      x.shadowBlur = 14; x.shadowColor = "#ffd27a"; x.fillStyle = "#ffe8b0"; x.beginPath(); x.arc(px - l * k * 14, y - alto, 2 + k * 5, 0, 7); x.fill(); x.shadowBlur = 0;
    }
  }
}

/* ---------- Veicoli e persone ---------- */

function auto(x: X, cx: number, cy: number, s: number, colore: string, frena = false) {
  x.fillStyle = "rgba(0,0,0,0.45)"; x.beginPath(); x.ellipse(cx, cy + 40 * s, 84 * s, 10 * s, 0, 0, 7); x.fill();
  x.fillStyle = colore; x.beginPath();
  x.moveTo(cx - 76 * s, cy + 34 * s); x.lineTo(cx - 68 * s, cy); x.lineTo(cx - 42 * s, cy - 26 * s); x.lineTo(cx + 42 * s, cy - 26 * s); x.lineTo(cx + 68 * s, cy); x.lineTo(cx + 76 * s, cy + 34 * s); x.closePath(); x.fill();
  x.fillStyle = "#11152a"; x.beginPath(); x.moveTo(cx - 36 * s, cy - 22 * s); x.lineTo(cx + 36 * s, cy - 22 * s); x.lineTo(cx + 50 * s, cy - 1 * s); x.lineTo(cx - 50 * s, cy - 1 * s); x.closePath(); x.fill();
  x.fillStyle = "rgba(255,255,255,0.18)"; x.fillRect(cx - 30 * s, cy - 20 * s, 18 * s, 16 * s);
  x.shadowBlur = frena ? 26 : 14; x.shadowColor = "#ff2d4b"; x.fillStyle = frena ? "#ff5a6e" : "#ff2d4b";
  x.fillRect(cx - 70 * s, cy + 8 * s, 34 * s, 7 * s); x.fillRect(cx + 36 * s, cy + 8 * s, 34 * s, 7 * s); x.shadowBlur = 0;
  x.fillStyle = "#0a0a0e"; x.fillRect(cx - 78 * s, cy + 30 * s, 24 * s, 15 * s); x.fillRect(cx + 54 * s, cy + 30 * s, 24 * s, 15 * s);
  x.fillStyle = "#e9e9f0"; x.fillRect(cx - 18 * s, cy + 20 * s, 36 * s, 8 * s);
  x.fillStyle = "#11152a"; x.font = `800 ${Math.round(7 * s)}px system-ui, sans-serif`; x.textAlign = "center"; x.fillText("APX 83", cx, cy + 27 * s); x.textAlign = "left";
}

function polizia(x: X, cx: number, cy: number, s: number, t: number, colpita = 0) {
  x.fillStyle = "rgba(0,0,0,0.4)"; x.beginPath(); x.ellipse(cx, cy + 22 * s, 56 * s, 7 * s, 0, 0, 7); x.fill();
  x.fillStyle = "#101320"; x.fillRect(cx - 50 * s, cy - 2 * s, 100 * s, 24 * s);
  x.fillStyle = "#eef0f6"; x.fillRect(cx - 50 * s, cy - 2 * s, 100 * s, 9 * s);
  x.fillStyle = "#101320"; x.beginPath(); x.moveTo(cx - 32 * s, cy - 2 * s); x.lineTo(cx - 22 * s, cy - 20 * s); x.lineTo(cx + 22 * s, cy - 20 * s); x.lineTo(cx + 32 * s, cy - 2 * s); x.closePath(); x.fill();
  x.fillStyle = "#e9ecf5"; x.font = `800 ${Math.max(5, Math.round(6 * s))}px system-ui, sans-serif`; x.textAlign = "center"; x.fillText("POLIZIA", cx, cy + 15 * s); x.textAlign = "left";
  const lampo = Math.floor(t * 8) % 2;
  for (const [dx, c] of [[-9, lampo ? "#ff2d4b" : "#3d7dff"], [9, lampo ? "#3d7dff" : "#ff2d4b"]] as const) {
    x.shadowBlur = 24 * s; x.shadowColor = c; x.fillStyle = c; x.fillRect(cx + dx * s - 8 * s, cy - 26 * s, 16 * s, 5 * s); x.shadowBlur = 0;
  }
  // scintille dove arrivano i colpi
  if (colpita > 0) for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 9; x.strokeStyle = `rgba(255,${200 + i * 9},120,${colpita})`; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx - 12 * s, cy + 4 * s); x.lineTo(cx - 12 * s + Math.cos(a) * 14 * s, cy + 4 * s + Math.sin(a) * 10 * s); x.stroke(); }
}

function agente(x: X, cx: number, cy: number, s: number, t: number) {
  x.fillStyle = "#121a33";
  x.fillRect(cx - 5 * s, cy - 26 * s, 10 * s, 18 * s);
  x.beginPath(); x.arc(cx, cy - 30 * s, 4.5 * s, 0, 7); x.fill();
  x.fillRect(cx - 5 * s, cy - 8 * s, 4 * s, 10 * s); x.fillRect(cx + 1 * s, cy - 8 * s, 4 * s, 10 * s);
  x.fillStyle = "#2f4a9a"; x.fillRect(cx - 6 * s, cy - 35 * s, 12 * s, 3 * s);
  if (Math.floor(t * 5 + cx) % 3 === 0) { x.fillStyle = "#ffe27a"; x.beginPath(); x.arc(cx - 9 * s, cy - 20 * s, 3 * s, 0, 7); x.fill(); }
}

/** Il protagonista visto da dietro: giacca viola, jeans, scarpe bianche. `spara` alza le braccia con la pistola. */
function protagonista(x: X, cx: number, cy: number, s: number, t: number, corre: boolean, spara: boolean, flash: boolean) {
  const passo = corre ? Math.sin(t * 13) : 0;
  x.fillStyle = "rgba(0,0,0,0.45)"; x.beginPath(); x.ellipse(cx, cy + 2, 26 * s, 6 * s, 0, 0, 7); x.fill();
  // gambe
  x.fillStyle = "#2c3e70";
  x.save(); x.translate(cx - 8 * s, cy - 46 * s); x.rotate(passo * 0.35); x.fillRect(-6 * s, 0, 12 * s, 46 * s); x.fillStyle = "#f2f2f5"; x.fillRect(-7 * s, 42 * s, 14 * s, 7 * s); x.restore();
  x.fillStyle = "#2c3e70";
  x.save(); x.translate(cx + 8 * s, cy - 46 * s); x.rotate(-passo * 0.35); x.fillRect(-6 * s, 0, 12 * s, 46 * s); x.fillStyle = "#f2f2f5"; x.fillRect(-7 * s, 42 * s, 14 * s, 7 * s); x.restore();
  // busto con la giacca
  x.fillStyle = "#5b2eff"; x.beginPath(); x.moveTo(cx - 22 * s, cy - 92 * s); x.lineTo(cx + 22 * s, cy - 92 * s); x.lineTo(cx + 18 * s, cy - 44 * s); x.lineTo(cx - 18 * s, cy - 44 * s); x.closePath(); x.fill();
  x.fillStyle = "#4521c9"; x.fillRect(cx - 1 * s, cy - 90 * s, 2 * s, 44 * s);
  // braccia
  x.strokeStyle = "#5b2eff"; x.lineWidth = 9 * s; x.lineCap = "round";
  if (spara) {
    // braccia tese in avanti verso il bersaglio, a sinistra: pistola impugnata con due mani
    const mx = cx - 30 * s, my = cy - 92 * s;
    x.beginPath(); x.moveTo(cx - 18 * s, cy - 86 * s); x.lineTo(mx, my); x.stroke();
    x.beginPath(); x.moveTo(cx + 18 * s, cy - 86 * s); x.lineTo(mx + 4 * s, my + 2 * s); x.stroke();
    x.fillStyle = "#d9a77f"; x.beginPath(); x.arc(mx, my, 5 * s, 0, 7); x.fill();
    x.fillStyle = "#151515"; x.fillRect(mx - 12 * s, my - 6 * s, 14 * s, 6 * s);
    if (flash) {
      x.shadowBlur = 30; x.shadowColor = "#ffcf5a"; x.fillStyle = "#fff3b0";
      x.beginPath(); for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = i % 2 ? 6 * s : 16 * s; x.lineTo(mx - 16 * s + Math.cos(a) * r, my - 3 * s + Math.sin(a) * r); } x.fill(); x.shadowBlur = 0;
    }
  } else {
    x.beginPath(); x.moveTo(cx - 20 * s, cy - 86 * s); x.lineTo(cx - 24 * s - passo * 6 * s, cy - 52 * s); x.stroke();
    x.beginPath(); x.moveTo(cx + 20 * s, cy - 86 * s); x.lineTo(cx + 24 * s + passo * 6 * s, cy - 52 * s); x.stroke();
  }
  x.lineCap = "butt";
  // testa e capelli
  x.fillStyle = "#d9a77f"; x.fillRect(cx - 5 * s, cy - 100 * s, 10 * s, 8 * s);
  x.fillStyle = "#1d1410"; x.beginPath(); x.arc(cx, cy - 108 * s, 11 * s, 0, 7); x.fill();
}

/* ---------- Interfaccia del gioco ---------- */

function interfaccia(x: X, t: number, stelle: number, soldi: number, colpi: number | null, vita = 0.86) {
  // stelle del ricercato, in alto a destra: lampeggiano quando salgono
  const lamp = Math.floor(t * 4) % 2 === 0;
  for (let i = 0; i < 6; i++) stella(x, W - 22 - (5 - i) * 24, 22, 9, i < stelle && (lamp || i < stelle - 1), "#ffd24a");
  x.textAlign = "right"; x.fillStyle = "#7dff9a"; x.font = "800 20px system-ui, sans-serif"; x.shadowBlur = 4; x.shadowColor = "#000";
  x.fillText(`$${soldi.toLocaleString("it-IT")}`, W - 14, 58); x.shadowBlur = 0;
  if (colpi !== null) { x.fillStyle = "#fff"; x.font = "700 13px system-ui, sans-serif"; x.fillText(`PISTOLA  ${colpi}/120`, W - 14, 78); }
  x.textAlign = "left";
  // radar con vita e armatura
  const rx = 64, ry = H - 64;
  x.save(); x.beginPath(); x.arc(rx, ry, 46, 0, 7); x.clip();
  x.fillStyle = "#1a1f2e"; x.fillRect(rx - 50, ry - 50, 100, 100); x.fillStyle = "#24345a"; x.fillRect(rx - 50, ry - 50, 34, 100);
  x.strokeStyle = "#4a5470"; x.lineWidth = 6; for (let k = -2; k < 3; k++) { const yy = ry + k * 22 + ((t * 20) % 22); x.beginPath(); x.moveTo(rx - 16, yy); x.lineTo(rx + 50, yy); x.stroke(); }
  for (let i = 0; i < Math.min(stelle, 5); i++) { x.fillStyle = Math.floor(t * 8 + i) % 2 ? "#ff2d4b" : "#3d7dff"; x.beginPath(); x.arc(rx + Math.sin(i * 2.3 + t) * 26, ry - 10 + Math.cos(i * 1.7 + t * 0.7) * 24, 4, 0, 7); x.fill(); }
  x.restore();
  x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 3; x.beginPath(); x.arc(rx, ry, 46, 0, 7); x.stroke();
  x.fillStyle = "#fff"; x.beginPath(); x.moveTo(rx, ry - 8); x.lineTo(rx - 6, ry + 6); x.lineTo(rx + 6, ry + 6); x.closePath(); x.fill();
  rett(x, rx - 46, ry + 52, 92, 6, "#13361f"); rett(x, rx - 46, ry + 52, 92 * vita, 6, "#3ee07a");
  rett(x, rx - 46, ry + 60, 92, 4, "#13233f"); rett(x, rx - 46, ry + 60, 92 * 0.6, 4, "#4f8bff");
}

function scritta(x: X, testo: string, sotto: string, colore: string, k: number) {
  x.globalAlpha = Math.min(1, k * 3);
  rett(x, 0, H / 2 - 40, W, 80, "rgba(0,0,0,0.55)");
  x.textAlign = "center"; x.shadowBlur = 18; x.shadowColor = colore; x.fillStyle = colore;
  x.font = "900 italic 40px system-ui, sans-serif"; x.fillText(testo, CX, H / 2 + 6);
  x.shadowBlur = 0; x.fillStyle = "#fff"; x.font = "700 15px system-ui, sans-serif"; x.fillText(sotto, CX, H / 2 + 30);
  x.textAlign = "left"; x.globalAlpha = 1;
}

function sottotitolo(x: X, s: string) {
  x.font = "700 15px system-ui, sans-serif"; x.textAlign = "center";
  const w = x.measureText(s).width + 20;
  rett(x, CX - w / 2, H - 46, w, 24, "rgba(0,0,0,0.6)");
  x.fillStyle = "#ffe08a"; x.fillText(s, CX, H - 29); x.textAlign = "left";
}

/* ---------- Le fasi ---------- */

function titolo(x: X, t: number) {
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#12052b"); g.addColorStop(1, "#3b0a52"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "rgba(255,62,165,0.18)" : "rgba(46,233,255,0.14)"; x.fillRect(0, 200 + i * 12, W, 3); }
  x.textAlign = "center"; x.shadowColor = "#ff3ea5"; x.shadowBlur = 24; x.fillStyle = "#fff"; x.font = "900 italic 80px system-ui, sans-serif"; x.fillText("APEX", CX, 150);
  x.shadowColor = "#2ee9ff"; x.fillStyle = "#2ee9ff"; x.font = "900 italic 56px system-ui, sans-serif"; x.fillText("CITY", CX, 212); x.shadowBlur = 0;
  for (let i = 0; i < 6; i++) stella(x, CX - 75 + i * 30, 250, 10, true, "#ffd24a");
  if (Math.floor(t * 2) % 2) { x.fillStyle = "#ffd36e"; x.font = "700 18px system-ui, sans-serif"; x.fillText("PREMI UN TASTO", CX, 305); }
  x.textAlign = "left";
}

function guida(x: X, t: number, k: number, frena: number) {
  const vel = 1 - frena;
  cielo(x, t); palazzi(x, (t * 0.35 * vel) % 1); strada(x, (t * 1.1 * vel) % 1);
  const caccia = k > 0.35;
  if (caccia) for (let i = 0; i < 2; i++) polizia(x, CX - 70 + i * 140 + Math.sin(t * 1.7 + i) * 30, 238 + i * 6 - frena * 30, 0.55 + i * 0.1, t);
  auto(x, CX + Math.sin(t * 1.3) * 30 * vel, 292, 1, "#ff3ea5", frena > 0);
  const stelle = k < 0.35 ? 1 : k < 0.7 ? 2 : 3;
  interfaccia(x, t, stelle, 48250 + Math.floor(t * 37), null);
  x.textAlign = "right"; x.fillStyle = "#fff"; x.font = "900 italic 44px system-ui, sans-serif"; x.fillText(String(Math.round((caccia ? 178 : 132) * vel + Math.sin(t) * 8)), W - 70, H - 22);
  x.font = "700 15px system-ui, sans-serif"; x.fillText("km/h", W - 22, H - 24); x.textAlign = "left";
  if (k < 0.3) sottotitolo(x, "Porta la macchina al porto prima che arrivi la polizia.");
  else if (frena > 0) sottotitolo(x, "Inchioda! Scendi e copriti.");
}

function scende(x: X, t: number, k: number) {
  // vista di lato: l'auto ferma, la portiera si apre, lui scende
  cielo(x, t);
  rett(x, 0, ORIZ, W, H - ORIZ, "#24202e");
  rett(x, 0, ORIZ + 40, W, 6, "#3a3346");
  for (let i = 0; i < 8; i++) { x.fillStyle = "#2a1747"; x.fillRect(i * 90 - 20, ORIZ - 60 - (i % 3) * 30, 70, 60 + (i % 3) * 30); }
  const ax = 230, ay = 250;
  x.fillStyle = "rgba(0,0,0,0.45)"; x.beginPath(); x.ellipse(ax + 90, ay + 46, 130, 12, 0, 0, 7); x.fill();
  x.fillStyle = "#ff3ea5"; x.beginPath(); x.moveTo(ax - 30, ay + 36); x.lineTo(ax - 20, ay); x.lineTo(ax + 40, ay - 8); x.lineTo(ax + 80, ay - 44); x.lineTo(ax + 170, ay - 44); x.lineTo(ax + 210, ay - 6); x.lineTo(ax + 220, ay + 36); x.closePath(); x.fill();
  x.fillStyle = "#11152a"; x.beginPath(); x.moveTo(ax + 88, ay - 38); x.lineTo(ax + 162, ay - 38); x.lineTo(ax + 192, ay - 8); x.lineTo(ax + 60, ay - 8); x.closePath(); x.fill();
  for (const rx of [ax + 20, ax + 170]) { x.fillStyle = "#0a0a0e"; x.beginPath(); x.arc(rx, ay + 38, 20, 0, 7); x.fill(); x.fillStyle = "#9aa0b4"; x.beginPath(); x.arc(rx, ay + 38, 9, 0, 7); x.fill(); }
  // portiera che si apre
  const ap = Math.min(1, k * 2.2);
  x.fillStyle = "#e0338f"; x.beginPath(); x.moveTo(ax + 70, ay - 8); x.lineTo(ax + 70 - ap * 50, ay - 8 - ap * 6); x.lineTo(ax + 70 - ap * 50, ay + 30); x.lineTo(ax + 70, ay + 30); x.closePath(); x.fill();
  // lui che scende e si gira
  const esce = Math.max(0, (k - 0.3) / 0.7);
  const px = ax + 80 - esce * 150, py = ay + 50;
  x.globalAlpha = Math.min(1, esce * 3);
  protagonista(x, px, py, 0.85, t, esce > 0.2 && esce < 0.95, false, false);
  x.globalAlpha = 1;
  // la polizia arriva da destra
  polizia(x, W - 40 - (1 - k) * 160, 268, 1.1, t);
  interfaccia(x, t, 3 + (k > 0.6 ? 1 : 0), 48250 + Math.floor(t * 37), null);
  sottotitolo(x, k < 0.5 ? "Fuori dalla macchina!" : "Arrivano le volanti: riparati dietro l'auto.");
}

function spara(x: X, t: number, k: number, colpi: number) {
  // terza persona: lui di spalle a destra, la strada con le volanti di traverso e gli agenti al riparo
  cielo(x, t); palazzi(x, 0.12); strada(x, 0.37);
  // elicottero col faro che spazza la strada
  if (k > 0.4) {
    const ex = CX + Math.sin(t * 0.6) * 160, ey = 50 + Math.sin(t * 1.3) * 6, fx = CX + Math.sin(t * 0.9) * 200;
    x.fillStyle = "rgba(255,255,220,0.13)"; x.beginPath(); x.moveTo(ex, ey + 8); x.lineTo(fx - 70, H); x.lineTo(fx + 70, H); x.closePath(); x.fill();
    x.fillStyle = "#0c0f1a"; x.beginPath(); x.ellipse(ex, ey, 26, 10, 0, 0, 7); x.fill(); x.fillRect(ex + 18, ey - 3, 34, 5);
    x.strokeStyle = "rgba(20,20,30,0.8)"; x.lineWidth = 3; const pa = t * 40; x.beginPath(); x.moveTo(ex + Math.cos(pa) * 44, ey - 12); x.lineTo(ex - Math.cos(pa) * 44, ey - 12); x.stroke();
    if (Math.floor(t * 6) % 2) { x.fillStyle = "#ff2d4b"; x.beginPath(); x.arc(ex + 50, ey - 1, 2.5, 0, 7); x.fill(); }
  }
  // volanti e agenti
  const bersagli: [number, number, number][] = [[CX - 120, 236, 0.75], [CX + 40, 228, 0.65], [CX - 10, 252, 0.9]];
  const colpo = Math.floor(t * 3.2) % 3, fuoco = (t * 3.2) % 1 < 0.35;
  bersagli.forEach(([bx, by, bs], i) => {
    polizia(x, bx, by, bs, t, fuoco && colpo === i ? 1 - ((t * 3.2) % 1) / 0.35 : 0);
    agente(x, bx + 58 * bs, by + 20 * bs, bs * 0.9, t + i);
  });
  // colpi della polizia che arrivano (scintille sull'asfalto)
  for (let i = 0; i < 3; i++) { const f = (t * 2.3 + i * 0.37) % 1; if (f < 0.15) { x.fillStyle = "#ffe08a"; x.beginPath(); x.arc(CX + 60 + i * 40, 320 - i * 8, 3, 0, 7); x.fill(); } }
  // lui, con lo sparo e la scia del proiettile verso il bersaglio
  const sx = CX + 150, sy = H - 6;
  protagonista(x, sx, sy, 1.15, t, false, true, fuoco);
  if (fuoco) {
    const [bx, by] = bersagli[colpo];
    x.strokeStyle = "rgba(255,230,140,0.9)"; x.lineWidth = 2; x.beginPath(); x.moveTo(sx - 1.15 * 46, sy - 1.15 * 95); x.lineTo(bx - 12, by + 4); x.stroke();
  }
  // mirino
  const [mx, my] = bersagli[colpo];
  x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 1.5; x.beginPath(); x.arc(mx - 12, my + 4, 9, 0, 7); x.moveTo(mx - 24, my + 4); x.lineTo(mx - 16, my + 4); x.moveTo(mx - 8, my + 4); x.lineTo(mx, my + 4); x.stroke();
  const stelle = Math.min(6, 4 + Math.floor(k * 3));
  interfaccia(x, t, stelle, 48250 + Math.floor(t * 37), colpi, 0.86 - k * 0.3);
  if (stelle === 6 && Math.floor(t * 2) % 2) { x.textAlign = "center"; x.fillStyle = "#ff6b81"; x.font = "900 16px system-ui, sans-serif"; x.fillText("SEI STELLE: TUTTA LA CITTÀ TI CERCA", CX, 104); x.textAlign = "left"; }
}

function fuga(x: X, t: number, k: number) {
  cielo(x, t); palazzi(x, (t * 0.2) % 1); strada(x, (t * 0.8) % 1);
  polizia(x, CX - 40, 224, 0.45 - k * 0.2, t);
  protagonista(x, CX + 20, H - 6, 1.1, t, true, false, false);
  interfaccia(x, t, k < 0.4 ? 6 : 0, 48250 + Math.floor(t * 37) + (k > 0.5 ? 25000 : 0), 87, 0.56);
  if (k > 0.45) scritta(x, "MISSIONE COMPIUTA", "+ $25.000   ·   Ricercato: seminato", "#ffd24a", k - 0.45);
  else sottotitolo(x, "Corri nel vicolo e seminali!");
}

/** Un fotogramma del gioco al tempo t (secondi). */
export function disegnaGioco(x: X, t: number) {
  const g = t % CICLO;
  x.save();
  if (g < F.titolo) titolo(x, t);
  else if (g < F.guida) { const k = (g - F.titolo) / (F.guida - F.titolo); guida(x, t, k, Math.max(0, (k - 0.85) / 0.15)); }
  else if (g < F.scende) scende(x, t, (g - F.guida) / (F.scende - F.guida));
  else if (g < F.spara) { const k = (g - F.scende) / (F.spara - F.scende); spara(x, t, k, 120 - Math.floor(k * 60)); }
  else if (g < F.fuga) fuga(x, t, (g - F.spara) / (F.fuga - F.spara));
  else { const k = (g - F.fuga) / (CICLO - F.fuga); guida(x, t, 0.1 + k * 0.2, 0); }
  // vignettatura e righe dello schermo
  const v = x.createRadialGradient(CX, H / 2, H * 0.35, CX, H / 2, W * 0.62);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.38)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
  x.restore();
}
