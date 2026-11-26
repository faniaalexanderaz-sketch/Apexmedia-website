/* =============================================================
   Cosa si vede sugli schermi dei computer: ogni mestiere ha la sua
   app, con testi veri e leggibili che si scrivono, grafici delle
   campagne che crescono, il montaggio con la testina che scorre,
   il calendario delle uscite, la chat con i clienti.
   Coordinate fisse 512×288 (16:9); `p` è il passo dell'animazione
   (3 al secondo), `fine` vale true per il disegno fermo.
   ============================================================= */

export const SW = 512, SH = 288;

type X = CanvasRenderingContext2D;

let famiglia = "";
function font(): string {
  if (famiglia) return famiglia;
  if (typeof document === "undefined") return "system-ui, sans-serif";
  const f = getComputedStyle(document.documentElement).getPropertyValue("--font-jakarta").trim();
  famiglia = (f ? `${f}, ` : "") + "system-ui, -apple-system, Segoe UI, sans-serif";
  return famiglia;
}
const F = (peso: number, px: number) => `${peso} ${px}px ${font()}`;

const SFONDO = "#0f1117", PANNELLO = "#181b24", PANNELLO2 = "#20242f", RIGA = "#2a2f3c", TESTO = "#eef0f6", GRIGIO = "#9aa1b4", TENUE = "#636a7e";
const VERDE = "#2fd08a", GIALLO = "#ffc93d", BLU = "#4f8bff", ROSSO = "#ff5d6c", VIOLA = "#7b5cff", ARANCIO = "#ff8a3d";

function r(x: X, px: number, py: number, w: number, h: number, rad: number, c: string) {
  x.fillStyle = c; x.beginPath(); x.roundRect(px, py, w, h, rad); x.fill();
}
function t(x: X, s: string, px: number, py: number, peso: number, size: number, c: string, allinea: CanvasTextAlign = "left") {
  x.fillStyle = c; x.font = F(peso, size); x.textAlign = allinea; x.textBaseline = "alphabetic"; x.fillText(s, px, py); x.textAlign = "left";
}
const ora = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
function cerchio(x: X, cx: number, cy: number, raggio: number, c: string) { x.fillStyle = c; x.beginPath(); x.arc(cx, cy, raggio, 0, Math.PI * 2); x.fill(); }
/** Testo che si scrive: mostra i primi `n` caratteri, con il cursore. */
function scrivi(x: X, s: string, n: number, px: number, py: number, larg: number, size: number, c: string, cursore: string, passo = size * 1.45) {
  x.font = F(500, size); x.fillStyle = c; x.textBaseline = "alphabetic";
  const parole = s.slice(0, Math.max(0, n)).split(" ");
  let rigaTxt = "", y = py;
  for (const p of parole) {
    const prova = rigaTxt ? `${rigaTxt} ${p}` : p;
    if (x.measureText(prova).width > larg && rigaTxt) { x.fillText(rigaTxt, px, y); rigaTxt = p; y += passo; } else rigaTxt = prova;
  }
  x.fillText(rigaTxt, px, y);
  if (n < s.length || Math.floor(n / 2) % 2 === 0) r(x, px + x.measureText(rigaTxt).width + 2, y - size + 2, 2, size + 1, 1, cursore);
}

/** Barra in alto: semafori, nome dell'app, schede, ora. */
function barra(x: X, app: string, schede: string[], attiva: number, accento: string) {
  r(x, 0, 0, SW, 26, 0, "#151821");
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => cerchio(x, 12 + i * 12, 13, 4, c));
  t(x, app, 54, 17, 700, 11, TESTO);
  let px = 54 + x.measureText(app).width + 14;
  schede.forEach((s, i) => {
    x.font = F(600, 10);
    const w = x.measureText(s).width + 16;
    r(x, px, 5, w, 16, 5, i === attiva ? PANNELLO2 : "transparent");
    if (i === attiva) r(x, px + 6, 19, w - 12, 2, 1, accento);
    t(x, s, px + 8, 16.5, 600, 10, i === attiva ? TESTO : TENUE);
    px += w + 4;
  });
  t(x, ora(), SW - 12, 17, 600, 10, GRIGIO, "right");
  cerchio(x, SW - 52, 13, 6, accento);
}

/* ---------- Le app ---------- */

const LAVORI = [
  ["Reel Fioreria · Natale", "Giulia", GIALLO, "da guardare"], ["Campagna Google · Essenza", "Davide", BLU, "al lavoro"], ["Carosello Bagnarino", "Luca", BLU, "al lavoro"],
  ["Landing audit gratuito", "Elena", VERDE, "fatto"], ["Solleciti di novembre", "Sara", TENUE, "in coda"],
] as const;

function regia(x: X, p: number, a: string) {
  barra(x, "Regia", ["Lavori", "Team", "Brief"], 0, a);
  t(x, "Lavori di oggi", 16, 52, 700, 17, TESTO);
  t(x, `${12 + (p % 3)} attivi · 3 in scadenza`, 16, 69, 500, 10, GRIGIO);
  r(x, SW - 118, 38, 102, 24, 12, a); t(x, "+ Nuovo lavoro", SW - 67, 54, 700, 10, "#fff", "center");
  LAVORI.forEach(([nome, chi, col, stato], i) => {
    const y = 82 + i * 38, scelta = i === p % 5;
    r(x, 12, y, SW - 24, 32, 9, scelta ? PANNELLO2 : PANNELLO);
    cerchio(x, 28, y + 16, 5, col);
    t(x, nome, 42, y + 20, 600, 12, TESTO);
    t(x, chi, 300, y + 20, 500, 11, GRIGIO);
    r(x, SW - 108, y + 8, 84, 16, 8, col === TENUE ? RIGA : col + "33"); t(x, stato, SW - 66, y + 20, 700, 9, col === TENUE ? GRIGIO : col, "center");
  });
}

function piano(x: X, p: number, a: string) {
  barra(x, "Piano editoriale", ["Settimana", "Idee", "Obiettivi"], 0, a);
  t(x, "Settimana 49 · Fioreria del Centro", 16, 50, 700, 14, TESTO);
  const giorni = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"], cw = (SW - 32) / 7;
  const carte: [number, number, string, string][] = [[0, 0, "Reel", "Composizioni"], [1, 0, "Storie", "Sondaggio"], [2, 0, "Carosello", "5 idee regalo"], [3, 1, "Reel", "Dietro le quinte"], [4, 0, "Post", "Promo -15%"], [5, 0, "Reel", "Consegna"], [2, 1, "Storie", "Domande"], [6, 0, "Storie", "Recap"]];
  const tipo: Record<string, string> = { Reel: ARANCIO, Storie: VIOLA, Carosello: BLU, Post: VERDE };
  giorni.forEach((g, i) => { t(x, g, 16 + i * cw + cw / 2, 74, 700, 10, i === 3 ? a : GRIGIO, "center"); r(x, 16 + i * cw + 3, 80, cw - 6, 188, 8, PANNELLO); });
  carte.forEach(([g, k, ti, de], i) => {
    const vola = i === p % carte.length;
    const px = 16 + g * cw + 7, py = 88 + k * 62 - (vola ? 4 : 0);
    r(x, px, py, cw - 14, 54, 7, vola ? PANNELLO2 : RIGA);
    r(x, px, py, 4, 54, 2, tipo[ti]);
    t(x, ti, px + 9, py + 17, 700, 10, tipo[ti]);
    t(x, de.length > 11 ? de.slice(0, 10) + "…" : de, px + 9, py + 33, 500, 9, TESTO);
    t(x, ["18:30", "12:00", "19:00"][i % 3], px + 9, py + 47, 500, 8, TENUE);
  });
}

function grafico(x: X, p: number, a: string, cassa: boolean) {
  barra(x, cassa ? "Incassi" : "Analisi", cassa ? ["Mese", "Fatture", "Clienti"] : ["Risultati", "Reel", "Campagne"], 0, a);
  const kpi: [string, string, string, string][] = cassa
    ? [["Incassato", `${(1570 + (p % 9) * 10).toLocaleString("it-IT")} €`, "+12%", VERDE], ["Da incassare", "980 €", "3 fatture", GIALLO], ["Scaduto", "400 €", "1 cliente", ROSSO]]
    : [["Contatti", String(128 + (p % 7)), "+18%", VERDE], ["Costo a contatto", "6,40 €", "-9%", VERDE], ["Ritorno", "4,2×", "+0,6", VERDE]];
  kpi.forEach(([n, v, d, c], i) => {
    const px = 14 + i * 164;
    r(x, px, 36, 156, 66, 10, PANNELLO);
    t(x, n, px + 12, 54, 600, 10, GRIGIO);
    t(x, v, px + 12, 82, 800, 22, TESTO);
    r(x, px + 12, 87, 44, 12, 6, c + "33"); t(x, d, px + 34, 96, 700, 8, c, "center");
  });
  r(x, 14, 112, SW - 28, 162, 10, PANNELLO);
  t(x, cassa ? "Entrate ultimi 12 mesi" : "Contatti per settimana", 26, 132, 700, 11, TESTO);
  const v = cassa ? [9, 11, 10, 13, 12, 15, 14, 16, 15, 18, 19, 21] : [12, 15, 13, 19, 22, 21, 27, 30, 29, 35, 38, 44];
  const max = Math.max(...v), w = SW - 70, h = 112, ox = 40, oy = 262;
  for (let k = 0; k <= 3; k++) { r(x, ox, oy - (h * k) / 3, w, 1, 0, RIGA); t(x, String(Math.round((max * k) / 3)), ox - 6, oy - (h * k) / 3 + 3, 500, 8, TENUE, "right"); }
  const fino = Math.min(v.length, 3 + (p % 14));
  if (cassa) {
    v.slice(0, fino).forEach((q, i) => r(x, ox + 6 + i * (w / 12), oy - (q / max) * h, w / 12 - 10, (q / max) * h, 4, i === fino - 1 ? a : "#3a4157"));
  } else {
    const g = x.createLinearGradient(0, oy - h, 0, oy); g.addColorStop(0, a + "66"); g.addColorStop(1, a + "00");
    x.beginPath(); x.moveTo(ox, oy);
    v.slice(0, fino).forEach((q, i) => x.lineTo(ox + (i * w) / 11, oy - (q / max) * h));
    x.lineTo(ox + ((fino - 1) * w) / 11, oy); x.closePath(); x.fillStyle = g; x.fill();
    x.beginPath(); v.slice(0, fino).forEach((q, i) => (i ? x.lineTo(ox + (i * w) / 11, oy - (q / max) * h) : x.moveTo(ox, oy - (q / max) * h)));
    x.strokeStyle = a; x.lineWidth = 2.5; x.stroke();
    const ul = fino - 1; cerchio(x, ox + (ul * w) / 11, oy - (v[ul] / max) * h, 5, "#fff"); cerchio(x, ox + (ul * w) / 11, oy - (v[ul] / max) * h, 3, a);
  }
}

const SCRIPT = ["Gancio: «3 errori che ti fanno perdere clienti a Natale»", "Errore 1: non dire il prezzo. Chi chiede, se ne va.", "Errore 2: rispondere ai messaggi dopo un giorno.", "Chiusura: scrivici DONO e ti mandiamo la guida."];
function reel(x: X, p: number, a: string) {
  barra(x, "Reel", ["Script", "Ganci", "Anteprima"], 0, a);
  // telefono verticale con il reel
  r(x, 18, 36, 128, 240, 16, "#05060a");
  const g = x.createLinearGradient(0, 40, 0, 272); g.addColorStop(0, "#ff8a3d"); g.addColorStop(1, "#7b2eff");
  x.fillStyle = g; x.beginPath(); x.roundRect(23, 41, 118, 230, 12); x.fill();
  cerchio(x, 82, 130 + Math.sin(p * 0.6) * 4, 26, "rgba(255,255,255,0.22)");
  r(x, 58, 160, 48, 60, 18, "rgba(255,255,255,0.18)");
  const parole = ["3 ERRORI", "CHE TI", "COSTANO", "CLIENTI"], k = Math.floor(p / 2) % 4;
  t(x, parole[k], 82, 236, 900, 15, "#fff", "center");
  r(x, 30, 258, 104 * ((p % 30) / 30), 3, 2, "#fff");
  // script che si scrive
  t(x, "Script · 30 secondi", 162, 54, 700, 13, TESTO);
  const n = (p * 3) % 240;
  let usati = 0;
  SCRIPT.forEach((s, i) => {
    const y = 76 + i * 50;
    t(x, `0:${String(i * 8).padStart(2, "0")}`, 162, y + 12, 700, 9, a);
    const qui = Math.max(0, Math.min(s.length, n - usati));
    if (qui > 0 || i === 0) scrivi(x, s, qui, 196, y + 12, 300, 11, i === 0 ? TESTO : "#c9cee0", a, 15);
    usati += s.length;
  });
}

function griglia(x: X, p: number, a: string) {
  barra(x, "Caroselli", ["Slide", "Testi", "Copertina"], 0, a);
  const slide = ["5 segnali che ti serve un massaggio", "1. Collo rigido al mattino", "2. Mal di testa dopo il lavoro", "3. Dormi male", "Prenota: 20% di sconto"];
  const scelta = Math.floor(p / 4) % slide.length;
  slide.slice(0, 4).forEach((s, i) => {
    const px = 16 + i * 122, py = 44, sel = i === Math.min(3, scelta);
    r(x, px - 2, py - 2, 116, 146, 10, sel ? a : "transparent");
    const g = x.createLinearGradient(px, py, px + 112, py + 142);
    g.addColorStop(0, i === 0 ? "#2b1a5e" : "#f6f1ea"); g.addColorStop(1, i === 0 ? "#5b2eff" : "#ece4d8");
    x.fillStyle = g; x.beginPath(); x.roundRect(px, py, 112, 142, 8); x.fill();
    const chiaro = i === 0;
    const parole = s.split(" "); let riga = "", y = py + 34;
    x.font = F(800, i === 0 ? 14 : 12);
    for (const w of parole) { const pr = riga ? `${riga} ${w}` : w; if (x.measureText(pr).width > 92) { t(x, riga, px + 10, y, 800, i === 0 ? 14 : 12, chiaro ? "#fff" : "#1d1a26"); riga = w; y += 17; } else riga = pr; }
    t(x, riga, px + 10, y, 800, i === 0 ? 14 : 12, chiaro ? "#fff" : "#1d1a26");
    t(x, `${i + 1}/5`, px + 102, py + 132, 700, 8, chiaro ? "#ffffffaa" : "#8a8494", "right");
  });
  r(x, 16, 204, SW - 32, 70, 10, PANNELLO);
  t(x, "Testo della slide", 28, 224, 700, 10, GRIGIO);
  scrivi(x, slide[Math.min(3, scelta)], 4 + ((p * 2) % 40), 28, 246, SW - 70, 14, TESTO, a);
}

const CAPTION = "Il Natale da noi profuma di fiori freschi. Composizioni pronte in 24 ore, consegna in tutta Alessandria. Scrivici FIORI in privato e ti mandiamo il catalogo.";
function testo(x: X, p: number, a: string) {
  barra(x, "Caption", ["Caption", "Storie", "Hashtag"], 0, a);
  r(x, 14, 36, 330, 238, 10, PANNELLO);
  t(x, "Reel · Composizioni di Natale", 28, 58, 700, 12, TESTO);
  const n = (p * 4) % (CAPTION.length + 40);
  scrivi(x, CAPTION, n, 28, 84, 300, 12.5, "#dfe3ee", a, 18);
  ["#alessandria", "#fioreria", "#natale"].forEach((h, i) => { r(x, 28 + i * 86, 238, 80, 20, 10, a + "33"); t(x, h, 68 + i * 86, 252, 700, 9.5, a, "center"); });
  r(x, 354, 36, 144, 112, 10, PANNELLO);
  t(x, "Controllo", 366, 56, 700, 11, TESTO);
  [["Prima riga", true], ["Un beneficio", n > 60], ["Una richiesta", n > 120], ["3 hashtag", n > 150]].forEach(([s, ok], i) => {
    cerchio(x, 372, 74 + i * 19, 6, ok ? VERDE : RIGA);
    t(x, String(s), 384, 78 + i * 19, 500, 10, ok ? TESTO : TENUE);
  });
  r(x, 354, 156, 144, 118, 10, PANNELLO);
  t(x, "Caratteri", 366, 176, 600, 10, GRIGIO);
  t(x, `${Math.min(n, CAPTION.length)}/2200`, 366, 202, 800, 18, TESTO);
  r(x, 366, 214, 120, 6, 3, RIGA); r(x, 366, 214, 120 * Math.min(1, n / CAPTION.length), 6, 3, a);
  t(x, "Uscita: ven 18:30", 366, 246, 600, 10, GRIGIO);
}

function timeline(x: X, p: number, a: string) {
  barra(x, "Montaggio", ["Montaggio", "Sottotitoli", "Esporta"], 0, a);
  // anteprima
  r(x, 14, 34, 300, 160, 8, "#000");
  const g = x.createLinearGradient(14, 34, 314, 194); g.addColorStop(0, "#1d2c4a"); g.addColorStop(1, "#3c2a4f"); x.fillStyle = g; x.fillRect(16, 36, 296, 156);
  const dx = Math.sin(p * 0.25) * 10;
  cerchio(x, 160 + dx, 92, 22, "#e8b894"); r(x, 124 + dx, 116, 72, 76, 26, "#5b2eff");
  r(x, 70, 160, 180, 24, 6, "rgba(0,0,0,0.55)"); t(x, ["Benvenuti da Bagnarino", "il coworking in centro", "prova gratis un giorno"][Math.floor(p / 6) % 3], 160, 177, 700, 12, "#fff", "center");
  r(x, 22, 42, 34, 14, 4, ROSSO); t(x, "REC", 39, 52, 800, 8, "#fff", "center");
  // pannello a destra
  r(x, 324, 34, 174, 160, 8, PANNELLO);
  t(x, "Clip", 336, 54, 700, 11, TESTO);
  ["intervista_01.mp4", "ufficio_b-roll.mp4", "logo_finale.mov"].forEach((s, i) => { r(x, 336, 64 + i * 40, 40, 30, 4, ["#3c2a4f", "#1d2c4a", "#5b2eff"][i]); t(x, s, 382, 82 + i * 40, 500, 9, "#c9cee0"); });
  // tracce
  r(x, 14, 202, SW - 28, 74, 8, PANNELLO);
  const tracce: [string, string, number[]][] = [["V1", "#5b8cff", [0, 70, 150, 230, 330]], ["T1", GIALLO, [20, 120, 200, 290, 360]], ["A1", VERDE, [0, 420]]];
  tracce.forEach(([n, c, tagli], k) => {
    const y = 210 + k * 21;
    t(x, n, 24, y + 12, 700, 9, GRIGIO);
    for (let i = 0; i < tagli.length - 1; i++) r(x, 46 + tagli[i], y, tagli[i + 1] - tagli[i] - 3, 16, 3, n === "A1" ? "#1f3a30" : c + (i % 2 ? "cc" : "99"));
    if (n === "A1") for (let i = 0; i < 100; i++) { const hh = 2 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31)) * 11; r(x, 48 + i * 4.2, y + 8 - hh / 2, 2, hh, 1, c); }
  });
  const testina = 46 + ((p * 6) % 420);
  r(x, testina, 204, 2, 70, 1, ROSSO); cerchio(x, testina + 1, 204, 4, ROSSO);
  r(x, 236, 38, 72, 16, 4, "rgba(0,0,0,0.6)"); t(x, `00:${String(Math.floor(((p * 6) % 420) / 14)).padStart(2, "0")}:${String((p * 7) % 25).padStart(2, "0")}`, 272, 50, 700, 9, "#fff", "center");
}

function ads(x: X, p: number, a: string) {
  barra(x, "Campagne", ["Campagne", "Annunci", "Budget"], 0, a);
  t(x, "Campagne attive", 16, 52, 700, 15, TESTO);
  r(x, SW - 128, 38, 112, 22, 11, PANNELLO); t(x, "Ultimi 7 giorni", SW - 72, 53, 600, 10, GRIGIO, "center");
  const intest = ["Campagna", "Stato", "Budget/g", "Costo", "Contatti"], xs = [16, 220, 290, 360, 430];
  r(x, 12, 64, SW - 24, 24, 6, PANNELLO2);
  intest.forEach((s, i) => t(x, s, xs[i] + 4, 80, 700, 9.5, GRIGIO));
  const righe: [string, boolean, string, string, number][] = [["Massaggi di coppia · Ricerca", true, "10 €", "0,62 €", 34], ["Natale · Meta lead", true, "15 €", "5,80 €", 41], ["Coworking · prova gratis", true, "8 €", "0,48 €", 22], ["Remarketing sito", false, "5 €", "—", 0]];
  righe.forEach(([n, on, b, c, k], i) => {
    const y = 94 + i * 32;
    r(x, 12, y, SW - 24, 28, 6, i === p % 4 ? PANNELLO2 : PANNELLO);
    t(x, n, xs[0] + 4, y + 18, 600, 10.5, TESTO);
    r(x, xs[1] + 4, y + 7, 28, 14, 7, on ? VERDE : RIGA); cerchio(x, on ? xs[1] + 25 : xs[1] + 11, y + 14, 5, "#fff");
    t(x, b, xs[2] + 4, y + 18, 600, 10.5, TESTO); t(x, c, xs[3] + 4, y + 18, 600, 10.5, TESTO);
    t(x, String(k + (on ? (p + i) % 3 : 0)), xs[4] + 4, y + 18, 800, 11, on ? VERDE : TENUE);
  });
  r(x, 12, 226, SW - 24, 50, 8, PANNELLO);
  t(x, "Spesa", 26, 246, 600, 10, GRIGIO); t(x, "214 €", 26, 266, 800, 15, TESTO);
  for (let i = 0; i < 24; i++) { const hh = 6 + Math.abs(Math.sin(i * 0.7 + p * 0.2)) * 22; r(x, 110 + i * 15.5, 268 - hh, 9, hh, 3, i === 23 ? a : "#3a4157"); }
}

function pagina(x: X, p: number, a: string) {
  barra(x, "Landing", ["Pagina", "Testi", "Test A/B"], 0, a);
  r(x, 14, 34, 340, 242, 8, "#f6f4f0");
  r(x, 14, 34, 340, 18, 0, "#e5e2dc"); r(x, 70, 39, 220, 9, 4, "#fff"); t(x, "essenzadoriente.it/natale", 180, 47, 600, 7, "#8a8494", "center");
  t(x, "Regala un massaggio", 30, 84, 800, 19, "#1d1a26");
  t(x, "di coppia a Natale", 30, 106, 800, 19, a);
  t(x, "Prenoti in 30 secondi, paghi in centro.", 30, 126, 500, 10.5, "#5a5466");
  const pulsa = 1 + Math.sin(p * 1.2) * 0.04;
  r(x, 30, 140, 132 * pulsa, 32, 16, a); t(x, "Prenota ora", 30 + 66 * pulsa, 160, 800, 11.5, "#fff", "center");
  t(x, "★★★★★  4,9 su Google · 212 recensioni", 30, 194, 600, 9.5, "#8a6d1f");
  [0, 1, 2].forEach((i) => { r(x, 30 + i * 104, 206, 96, 58, 8, "#ebe6df"); r(x, 38 + i * 104, 216, 60, 7, 3, "#c9c2b6"); r(x, 38 + i * 104, 230, 76, 5, 2, "#d8d2c8"); r(x, 38 + i * 104, 240, 50, 5, 2, "#d8d2c8"); });
  r(x, 364, 34, 134, 242, 8, PANNELLO);
  t(x, "Test A/B", 376, 56, 700, 12, TESTO);
  [["A", "Prenota ora", 3.1], ["B", "Regala ora", 3.8 + (p % 5) * 0.05]].forEach(([l, s, v], i) => {
    const y = 70 + i * 74;
    r(x, 376, y, 110, 64, 8, i ? a + "22" : PANNELLO2);
    t(x, `Variante ${l}`, 386, y + 18, 700, 10, i ? a : GRIGIO);
    t(x, String(s), 386, y + 34, 500, 9.5, TESTO);
    t(x, `${Number(v).toFixed(1).replace(".", ",")}%`, 386, y + 55, 800, 15, i ? VERDE : TESTO);
  });
  r(x, 376, 222, 110, 40, 8, VERDE + "22"); t(x, "B vince +23%", 431, 247, 800, 10.5, VERDE, "center");
}

const DM: [boolean, string][] = [[false, "Ciao! Quanto costa la giornata di prova?"], [true, "Ciao Giulia! La prima giornata è gratis 🙂"], [false, "Davvero? Posso venire domani?"], [true, "Certo, ti aspettiamo dalle 9. Ti mando la posizione?"]];
function chat(x: X, p: number, a: string) {
  barra(x, "Messaggi", ["Messaggi", "Commenti", "Risposte"], 0, a);
  r(x, 0, 26, 150, SH - 26, 0, PANNELLO);
  ["Giulia R.", "Marco T.", "Elisa B.", "Fabio C.", "Sara M."].forEach((n, i) => {
    const y = 36 + i * 46;
    r(x, 6, y, 138, 40, 8, i === 0 ? PANNELLO2 : "transparent");
    cerchio(x, 26, y + 20, 12, ["#ff8a3d", "#4f8bff", "#2fd08a", "#ffc93d", "#ff5d6c"][i]);
    t(x, n, 44, y + 17, 700, 10, TESTO); t(x, ["Posso venire domani?", "Grazie mille!", "Info prezzi", "Ok perfetto", "A che ora aprite?"][i], 44, y + 31, 500, 8.5, GRIGIO);
    if (i === 2 || i === 4) cerchio(x, 134, y + 20, 4, a);
  });
  t(x, "Giulia R.", 164, 48, 800, 13, TESTO); cerchio(x, 228, 44, 3.5, VERDE); t(x, "online", 236, 48, 500, 9, GRIGIO);
  const visti = 1 + (Math.floor(p / 5) % 4);
  let y = 62;
  DM.slice(0, visti).forEach(([mio, s]) => {
    x.font = F(500, 10.5);
    const w = Math.min(250, x.measureText(s).width + 22);
    const px = mio ? SW - 14 - w : 164;
    r(x, px, y, w, 26, 13, mio ? a : PANNELLO2);
    t(x, s.length > 44 ? s.slice(0, 43) + "…" : s, px + 11, y + 17, 500, 10.5, "#fff");
    y += 34;
  });
  if (visti < 4 && p % 2 === 0) { r(x, SW - 60, y, 46, 24, 12, PANNELLO2); [0, 1, 2].forEach((k) => cerchio(x, SW - 47 + k * 10, y + 12, 3, (p + k) % 3 ? GRIGIO : "#fff")); }
  r(x, 160, SH - 38, SW - 174, 28, 14, PANNELLO);
  t(x, "Scrivi un messaggio…", 176, SH - 20, 500, 10, TENUE);
}

function calendario(x: X, p: number, a: string) {
  barra(x, "Uscite", ["Calendario", "Controlli", "Canali"], 0, a);
  const d = new Date(), mese = d.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  const primo = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() + 6) % 7, giorniMese = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  t(x, mese.charAt(0).toUpperCase() + mese.slice(1), 16, 52, 800, 15, TESTO);
  ["Instagram", "TikTok", "Facebook"].forEach((c, i) => { cerchio(x, 300 + i * 74, 47, 4, [ARANCIO, "#25f4ee", BLU][i]); t(x, c, 308 + i * 74, 51, 600, 9, GRIGIO); });
  const g = ["L", "M", "M", "G", "V", "S", "D"], cw = (SW - 28) / 7, ch = 36;
  g.forEach((d, i) => t(x, d, 14 + i * cw + cw / 2, 72, 700, 9, TENUE, "center"));
  const oggi = primo + d.getDate() - 1;
  for (let k = 0; k < 35; k++) {
    const c = k % 7, rr = Math.floor(k / 7), giorno = k - primo;
    const px = 14 + c * cw, py = 78 + rr * ch;
    r(x, px + 2, py + 2, cw - 4, ch - 4, 6, k === oggi ? a + "33" : PANNELLO);
    const valido = giorno >= 0 && giorno < giorniMese;
    if (valido) t(x, String(giorno + 1), px + 8, py + 14, 700, 8.5, k === oggi ? a : GRIGIO);
    const n = (k * 7 + 3) % 5;
    if (valido && n < 3) { r(x, px + 6, py + 19, cw - 14, 9, 3, [ARANCIO, "#25f4ee", BLU][n] + "aa"); t(x, ["Reel 18:30", "Video 12:00", "Post 19:00"][n], px + 9, py + 26.5, 700, 6.5, "#0f1117"); }
  }
  const k = 20 + (Math.floor(p / 3) % 8), c = k % 7, rr = Math.floor(k / 7);
  x.strokeStyle = a; x.lineWidth = 2; x.beginPath(); x.roundRect(14 + c * cw + 2, 78 + rr * ch + 2, cw - 4, ch - 4, 6); x.stroke();
}

const VOCI = ["Il beneficio è nella prima riga", "Una sola richiesta d'azione", "Niente frasi da intelligenza artificiale", "Tono di Alex: diretto e caldo", "Prezzo e scadenza chiari"];
function spunte(x: X, p: number, a: string) {
  barra(x, "Revisione", ["Controllo", "Testo", "Note"], 0, a);
  r(x, 14, 36, 230, 238, 10, PANNELLO);
  t(x, "Controllo qualità", 26, 58, 700, 12, TESTO);
  const fatte = Math.floor(p / 3) % (VOCI.length + 2);
  VOCI.forEach((s, i) => {
    const y = 74 + i * 38, ok = i < fatte;
    r(x, 24, y, 210, 30, 8, ok ? VERDE + "18" : PANNELLO2);
    r(x, 32, y + 8, 14, 14, 4, ok ? VERDE : RIGA);
    if (ok) { x.strokeStyle = "#fff"; x.lineWidth = 2; x.beginPath(); x.moveTo(35, y + 15); x.lineTo(38.5, y + 18.5); x.lineTo(43.5, y + 11.5); x.stroke(); }
    t(x, s.length > 30 ? s.slice(0, 29) + "…" : s, 54, y + 19, 500, 9.5, ok ? TESTO : GRIGIO);
  });
  r(x, 254, 36, 244, 238, 10, PANNELLO);
  t(x, "Testo", 266, 58, 700, 12, TESTO);
  x.font = F(500, 10.5);
  r(x, 266, 70, 214, 30, 4, ROSSO + "22"); t(x, "Non è solo un massaggio, è", 270, 82, 500, 10, "#ff9aa4"); t(x, "un'esperienza unica e magica.", 270, 95, 500, 10, "#ff9aa4");
  r(x, 266, 70, 200, 1.5, 0, ROSSO); r(x, 266, 83, 160, 1.5, 0, "transparent");
  r(x, 266, 108, 214, 30, 4, VERDE + "22");
  scrivi(x, "Un'ora per staccare davvero. Prenoti in 30 secondi.", (p * 3) % 60, 270, 120, 205, 10, "#8ff0c2", VERDE, 13);
  t(x, `${fatte >= VOCI.length ? "Pronto da consegnare" : "In revisione…"}`, 266, 262, 800, 12, fatte >= VOCI.length ? VERDE : GIALLO);
}

/* ---------- Documento e lista (le altre due schede) ---------- */

const BRIEF: Record<string, string> = {
  regia: "Brief: lanciare la promo di dicembre per Essenza d'Oriente. Obiettivo 40 prenotazioni. Servono 3 reel, 2 caroselli, campagna Meta 15 euro al giorno.",
  piano: "Obiettivo della settimana: 25 ordini online per Natale. Ogni contenuto chiude con una sola richiesta: scrivici FIORI in privato.",
  grafico: "Cosa ha funzionato: i reel con il prezzo nei primi 3 secondi. Da tagliare: i post solo foto. Prossima settimana: 2 reel in più.",
  reel: "Gancio alternativo: «Il regalo che nessuno si aspetta (e costa meno di una cena)». Inquadratura stretta sulle mani.",
  griglia: "Copertina: titolo grande su sfondo viola, massimo 8 parole. Ultima slide: prenota con il 20% di sconto entro il 20.",
  testo: "Storie: 1) sondaggio «regali fiori a Natale?» 2) dietro le quinte 3) prezzo 4) link per ordinare.",
  timeline: "Tagli: 00:12 risposta sul prezzo, 01:40 la sala riunioni, 03:05 la battuta sul caffè. Sottotitoli gialli, parole chiave in grassetto.",
  ads: "Soglia: se il costo a contatto supera 8 euro per 3 giorni, si ferma la campagna e si cambia la creatività.",
  pagina: "Blocchi: promessa, prova (recensioni), offerta, 3 obiezioni, bottone WhatsApp. Un solo campo: il numero di telefono.",
  chat: "Risposta se dice sì: posizione, orario, cosa portare. Se non risponde: sollecito gentile dopo 2 giorni.",
  calendario: "Mancano: copertina del reel di venerdì e sottotitoli del video di domenica. Tutto il resto è pronto.",
  spunte: "Tolte 3 lineette lunghe, accorciata la prima riga, aggiunto il prezzo. Il testo ora suona scritto da Alex.",
};

function documento(x: X, tipo: string, p: number, a: string) {
  barra(x, "Documenti", ["Brief", "Note", "Condivisi"], 0, a);
  r(x, 60, 34, SW - 120, SH - 34, 6, "#f7f6f2");
  t(x, "Brief di lavoro", 84, 66, 800, 16, "#1d1a26");
  r(x, 84, 74, 60, 3, 2, a);
  scrivi(x, BRIEF[tipo] ?? BRIEF.regia, (p * 5) % 190, 84, 100, SW - 172, 12.5, "#3a3546", a, 19);
}

function lista(x: X, p: number, a: string) {
  barra(x, "Da fare", ["Oggi", "Settimana", "Fatto"], 0, a);
  const voci = ["Rispondere al cliente", "Caricare i file sul Drive", "Mandare la bozza ad Alex", "Aggiornare il calendario", "Controllare i numeri"];
  const fatte = Math.min(voci.length, Math.floor((p % 15) / 2.5));
  t(x, "Oggi", 24, 60, 800, 16, TESTO);
  t(x, `${fatte} di ${voci.length} fatte`, 24, 78, 500, 10, GRIGIO);
  voci.forEach((s, i) => {
    const y = 92 + i * 36, ok = i < fatte;
    r(x, 18, y, SW - 36, 30, 8, PANNELLO);
    r(x, 28, y + 8, 14, 14, 7, ok ? VERDE : RIGA);
    t(x, s, 52, y + 19, 600, 11, ok ? GRIGIO : TESTO);
    if (ok) r(x, 52, y + 15, x.measureText(s).width, 1.5, 0, GRIGIO);
  });
}

/* ---------- Punto d'ingresso ---------- */

const APP: Record<string, (x: X, p: number, a: string) => void> = {
  regia, piano, grafico: (x, p, a) => grafico(x, p, a, false), cassa: (x, p, a) => grafico(x, p, a, true), reel, griglia, testo, timeline, ads, pagina, chat, calendario, spunte,
};

/** Un fotogramma dello schermo di chi lavora: l'app del suo mestiere, poi il brief che si scrive, poi la lista. */
export function disegnaApp(x: X, tipo: string, accento: string, p: number, attesa: boolean) {
  r(x, 0, 0, SW, SH, 0, SFONDO);
  const giro = p % 75;
  if (giro < 50) (APP[tipo] ?? regia)(x, p, accento);
  else if (giro < 64) documento(x, tipo, giro - 50, accento);
  else lista(x, giro - 64, accento);
  if (attesa) { r(x, SW - 150, SH - 40, 138, 28, 14, GIALLO); t(x, "Pronto: guardalo tu", SW - 81, SH - 22, 800, 10.5, "#1d1a26", "center"); }
  // puntatore
  const mx = 120 + ((p * 37) % 300), my = 60 + ((p * 23) % 180);
  x.fillStyle = "#fff"; x.strokeStyle = "#000"; x.lineWidth = 1;
  x.beginPath(); x.moveTo(mx, my); x.lineTo(mx, my + 14); x.lineTo(mx + 4, my + 10); x.lineTo(mx + 9, my + 11); x.closePath(); x.fill(); x.stroke();
}

/** Sfondo di chi è libero: il marchio Apex su un gradiente, con l'ora. */
export function disegnaRiposo(x: X, accento: string) {
  const g = x.createLinearGradient(0, 0, SW, SH); g.addColorStop(0, "#151233"); g.addColorStop(0.6, "#2a1a6e"); g.addColorStop(1, accento);
  x.fillStyle = g; x.fillRect(0, 0, SW, SH);
  for (let i = 0; i < 5; i++) { x.globalAlpha = 0.08; cerchio(x, 80 + i * 110, 230 - (i % 2) * 120, 70 + i * 12, "#fff"); }
  x.globalAlpha = 1;
  x.fillStyle = "#ffffff"; x.save(); x.translate(SW / 2 - 28, 70); x.scale(2, 2);
  x.beginPath(); x.moveTo(14, 0); x.lineTo(0, 26); x.lineTo(7.2, 26); x.lineTo(17.6, 6.6); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(18.9, 9.2); x.lineTo(28, 26); x.lineTo(20.9, 26); x.lineTo(15.2, 15.6); x.closePath(); x.fill();
  x.restore();
  t(x, ora(), SW / 2, 178, 300, 44, "#fff", "center");
  t(x, new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }), SW / 2, 202, 600, 12, "#ffffffcc", "center");
}
