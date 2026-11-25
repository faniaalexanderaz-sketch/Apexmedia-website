"use client";

import * as THREE from "three";
import { useEffect, useState } from "react";
import type { StatoAgente } from "@/lib/studio/calcoli";

/* =============================================================
   Mattoni della scena: colori, geometrie e materiali condivisi
   (una sola istanza per tipo, così centinaia di pezzi costano poco),
   forme base e tele disegnate a mano per schermi e scritte.
   ============================================================= */

export const C = {
  sfondo: "#eff0f4",
  pavimento: "#f8f4eb",
  bordo: "#ead2a3",
  muro: "#fcfaf4",
  legno: "#edd6a8",
  legnoScuro: "#d8b87e",
  bianco: "#ffffff",
  grigio: "#d9dbe2",
  ink: "#20232e",
  schermo: "#151823",
  viola: "#5b2eff",
  blu: "#2f6bff",
  verde: "#17b26a",
  giallo: "#ffd84d",
  oro: "#f2b632",
  rosso: "#e5484d",
  foglia: "#2f9e63",
  foglia2: "#52bb80",
};

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cil: new THREE.CylinderGeometry(0.5, 0.5, 1, 22),
  sfera: new THREE.SphereGeometry(0.5, 18, 12),
  cono: new THREE.ConeGeometry(0.5, 1, 14),
  piano: new THREE.PlaneGeometry(1, 1),
  anello: new THREE.RingGeometry(0.42, 0.5, 48),
  disco: new THREE.CircleGeometry(0.5, 48),
  busto: new THREE.CapsuleGeometry(0.21, 0.26, 6, 16),
  braccio: new THREE.CapsuleGeometry(0.065, 0.34, 4, 12),
  gamba: new THREE.CapsuleGeometry(0.085, 0.2, 4, 12),
  /** vaso svasato: più largo in alto */
  vaso: new THREE.CylinderGeometry(0.5, 0.36, 1, 28),
  /** foglia: disco schiacciato, si scala per allungarla */
  foglia: new THREE.SphereGeometry(0.5, 14, 8),
  toro: new THREE.TorusGeometry(0.5, 0.07, 10, 40),
  arco: new THREE.TorusGeometry(0.3, 0.035, 8, 24, Math.PI),
};

const materiali = new Map<string, THREE.Material>();
/** Materiale condiviso per colore: opaco e morbido (plastica, tessuto, legno verniciato). */
export function mat(colore: string, ruvido = 0.72, metallo = 0): THREE.Material {
  const k = `${colore}:${ruvido}:${metallo}`;
  let m = materiali.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: colore, roughness: ruvido, metalness: metallo }); materiali.set(k, m); }
  return m;
}
/** Ottone satinato: gambe dei tavoli, cornici, applique. */
export function matOttone(): THREE.Material { return mat("#c39b55", 0.3, 0.92); }
/** Marmo bianco lucido per i piani. */
export function matMarmo(): THREE.Material { return mat("#f1ede6", 0.16, 0.05); }
/** Metallo spazzolato (gambe, supporti, lampade). */
export function matMetallo(colore = "#c9ccd4"): THREE.Material { return mat(colore, 0.32, 0.85); }
/** Superficie lucida (schermi spenti, vetro scuro, ceramica). */
export function matLucido(colore: string): THREE.Material { return mat(colore, 0.18, 0.1); }
/** Luce LED: colore oltre 1, così il bagliore (bloom) la fa brillare. Senza bagliore resta un colore pieno. */
export function matLed(colore: string, forza = 2.4): THREE.Material {
  const k = `led:${colore}:${forza}`;
  let m = materiali.get(k);
  if (!m) { const c = new THREE.Color(colore).multiplyScalar(forza); m = new THREE.MeshBasicMaterial({ color: c, toneMapped: false }); materiali.set(k, m); }
  return m;
}
/** Vetro delle pareti: trasparente, non fa ombra. */
export const MAT_VETRO = new THREE.MeshStandardMaterial({ color: "#dfe9f5", roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.22, depthWrite: false });
/** Materiale che non risente delle luci (schermi, scritte, anelli). */
export function matLuce(colore: string, opacita = 1): THREE.Material {
  const k = `luce:${colore}:${opacita}`;
  let m = materiali.get(k);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: colore, transparent: opacita < 1, opacity: opacita, depthWrite: opacita >= 1, toneMapped: false }); materiali.set(k, m); }
  return m;
}
export const MAT_INVISIBILE = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

type Forma = { p?: [number, number, number]; s?: [number, number, number] | number; r?: [number, number, number]; c: string; ombra?: boolean; riceve?: boolean };
export function Box({ p, s, r, c, ombra = true, riceve = false }: Forma) {
  return <mesh geometry={GEO.box} material={mat(c)} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow={riceve} />;
}
export function Cil({ p, s, r, c, ombra = true, riceve = false }: Forma) {
  return <mesh geometry={GEO.cil} material={mat(c)} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow={riceve} />;
}
export function Sfera({ p, s, r, c, ombra = true }: Forma) {
  return <mesh geometry={GEO.sfera} material={mat(c)} position={p} scale={s} rotation={r} castShadow={ombra} />;
}
export function Cono({ p, s, r, c, ombra = true }: Forma) {
  return <mesh geometry={GEO.cono} material={mat(c)} position={p} scale={s} rotation={r} castShadow={ombra} />;
}

/* ---------- Font del sito dentro le tele ---------- */

export type Font = { titoli: string; testo: string; pronto: number };
/** Legge le famiglie di next/font dalle variabili CSS e avvisa quando sono caricate, così le tele si ridisegnano. */
export function useFont(): Font {
  const [f, setF] = useState<Font>({ titoli: "system-ui, sans-serif", testo: "system-ui, sans-serif", pronto: 0 });
  useEffect(() => {
    const stile = getComputedStyle(document.documentElement);
    const titoli = (stile.getPropertyValue("--font-space-grotesk").trim() || "system-ui") + ", system-ui, sans-serif";
    const testo = (stile.getPropertyValue("--font-jakarta").trim() || "system-ui") + ", system-ui, sans-serif";
    let vivo = true;
    Promise.all([document.fonts.load(`700 40px ${titoli}`), document.fonts.load(`600 20px ${testo}`)])
      .catch(() => null)
      .then(() => { if (vivo) setF({ titoli, testo, pronto: 1 }); });
    return () => { vivo = false; };
  }, []);
  return f;
}

export function tela(w: number, h: number, disegna: (x: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d");
  if (x) disegna(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function rett(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number, colore: string) {
  x.fillStyle = colore;
  x.beginPath();
  x.roundRect(px, py, w, h, r);
  x.fill();
}

/* ---------- Schermi dei monitor ---------- */

const W = 256, H = 148, RIS = 1.5;
const CHIARO = "#e9ecf5", MEDIO = "#4a5068", BUIO = "#262b3d";
const SCHEDE: Record<string, [string, string, string]> = {
  regia: ["Lavori", "Brief", "Team"], piano: ["Piano", "Idee", "Calendario"], grafico: ["Numeri", "Report", "Note"],
  reel: ["Script", "Ganci", "Anteprima"], griglia: ["Slide", "Testi", "Copertina"], testo: ["Caption", "Storie", "Hashtag"],
  timeline: ["Montaggio", "Sottotitoli", "Export"], ads: ["Campagne", "Annunci", "Budget"], pagina: ["Pagina", "Testi", "Test A/B"],
  chat: ["Messaggi", "Commenti", "Risposte"], calendario: ["Uscite", "Controlli", "Canali"], spunte: ["Controllo", "Testo", "Note"],
};

/** Il disegno tipico di ogni mestiere. `p` fa muovere i dettagli (barre che crescono, cursore). */
function disegnaTipo(x: CanvasRenderingContext2D, w: number, h: number, tipo: string, accento: string, p = 0) {
  const chiaro = CHIARO, medio = MEDIO, buio = BUIO;
  const righe = (px: number, py: number, lung: number[], col = medio, alt = 5, passo = 11) => lung.forEach((l, i) => rett(x, px, py + i * passo, l, alt, 2, col));
  switch (tipo) {
    case "timeline": case "reel": {
      if (tipo === "reel") { rett(x, 18, 24, 58, 104, 6, buio); rett(x, 22, 28, 50, 96, 4, accento); rett(x, 30, 96, 34, 6, 3, chiaro); righe(88, 30, [120, 96, 138, 80], medio, 6, 13); rett(x, 88, 92, 150, 34, 4, buio); for (let i = 0; i < 24; i++) rett(x, 94 + i * 6, 109 - (8 + ((i * 7) % 13)) / 2, 3, 8 + ((i * 7) % 13), 1, accento); }
      else { rett(x, 14, 24, 132, 62, 4, buio); rett(x, 58, 36, 44, 38, 4, accento); righe(156, 26, [84, 60, 76], medio); rett(x, 14, 94, 228, 12, 3, accento); rett(x, 14, 110, 150, 12, 3, "#2f6bff"); rett(x, 170, 110, 72, 12, 3, "#ffd84d"); rett(x, 14, 126, 96, 10, 3, medio); rett(x, 120, 126, 122, 10, 3, "#17b26a"); rett(x, 132, 90, 2, 50, 1, chiaro); }
      break;
    }
    case "grafico": case "ads": {
      const v = [22, 30, 26, 41, 38, 52, 60, 58 + ((p * 7) % 26)];
      v.forEach((val, i) => rett(x, 18 + i * 20, 120 - val, 13, val, 3, i === v.length - 1 ? accento : medio));
      rett(x, 184, 28, 58, 40, 5, buio); rett(x, 192, 36, 30, 6, 2, medio); rett(x, 192, 48, 42, 11, 3, chiaro);
      rett(x, 184, 78, 58, 40, 5, buio); rett(x, 192, 86, 26, 6, 2, medio); rett(x, 192, 98, 36, 11, 3, tipo === "ads" ? "#17b26a" : accento);
      rett(x, 18, 126, 152, 3, 1, buio);
      break;
    }
    case "griglia": {
      for (let i = 0; i < 6; i++) { const px = 16 + (i % 3) * 78, py = 26 + Math.floor(i / 3) * 58; rett(x, px, py, 68, 50, 5, i === 0 ? accento : buio); rett(x, px + 8, py + 10, 38, 6, 2, i === 0 ? "#fff" : medio); rett(x, px + 8, py + 22, 50, 4, 2, i === 0 ? "#ffffffaa" : "#333a52"); }
      break;
    }
    case "testo": case "spunte": {
      if (tipo === "spunte") { for (let i = 0; i < 5; i++) { rett(x, 22, 28 + i * 22, 13, 13, 3, i < 3 ? "#17b26a" : buio); rett(x, 44, 31 + i * 22, [150, 118, 170, 96, 134][i], 7, 3, i < 3 ? medio : chiaro); } }
      else { rett(x, 22, 28, 150, 10, 3, chiaro); righe(22, 50, [206, 188, 212, 150, 198, 90], medio, 6, 13); rett(x, 116, 114, 3, 12, 1, accento); }
      break;
    }
    case "pagina": {
      rett(x, 40, 24, 176, 116, 6, "#f4f5fa"); rett(x, 54, 36, 96, 9, 3, "#20232e"); rett(x, 54, 52, 130, 5, 2, "#b9bfd0"); rett(x, 54, 61, 104, 5, 2, "#b9bfd0"); rett(x, 54, 76, 58, 16, 8, accento); rett(x, 54, 102, 44, 28, 4, "#dde1ec"); rett(x, 104, 102, 44, 28, 4, "#dde1ec"); rett(x, 154, 102, 44, 28, 4, "#dde1ec");
      break;
    }
    case "chat": {
      rett(x, 18, 28, 132, 22, 11, buio); rett(x, 28, 36, 90, 6, 3, medio);
      rett(x, 104, 58, 134, 22, 11, accento); rett(x, 116, 66, 96, 6, 3, "#ffffffcc");
      rett(x, 18, 88, 104, 22, 11, buio); rett(x, 28, 96, 66, 6, 3, medio);
      rett(x, 150, 118, 88, 20, 10, accento); rett(x, 162, 125, 50, 6, 3, "#ffffffcc");
      break;
    }
    case "calendario": case "piano": {
      for (let g = 0; g < 7; g++) { rett(x, 14 + g * 33, 26, 28, 7, 2, medio); for (let r = 0; r < 3; r++) { const pieno = (g * 3 + r * 5) % 4 !== 0; rett(x, 14 + g * 33, 40 + r * 34, 28, 28, 4, pieno ? [accento, "#2f6bff", "#17b26a", "#ffd84d"][(g + r) % 4] : buio); } }
      break;
    }
    default: {
      // regia: l'elenco dei lavori con il loro stato
      for (let i = 0; i < 5; i++) { rett(x, 16, 26 + i * 23, 224, 18, 9, buio); x.fillStyle = ["#ffd84d", "#2f6bff", "#2f6bff", "#17b26a", "#8a90a6"][i]; x.beginPath(); x.arc(28, 35 + i * 23, 4, 0, 7); x.fill(); rett(x, 40, 31 + i * 23, [120, 150, 96, 134, 110][i], 7, 3, medio); rett(x, 196, 30 + i * 23, 36, 10, 5, i === 0 ? "#ffd84d" : "#333a52"); }
    }
  }
}

function cornice(x: CanvasRenderingContext2D, w: number, schede: string[] | null, attiva: number, accento: string) {
  rett(x, 0, 0, w, 16, 0, "#1d2130");
  for (let i = 0; i < 3; i++) { x.fillStyle = ["#ff5f57", "#febc2e", "#28c840"][i]; x.beginPath(); x.arc(10 + i * 11, 8, 3, 0, 7); x.fill(); }
  if (!schede) return;
  x.font = "600 8px system-ui, sans-serif"; x.textBaseline = "middle";
  schede.forEach((n, i) => {
    const px = 46 + i * 62;
    rett(x, px, 2, 58, 14, 4, i === attiva ? "#131622" : "#262b3d");
    if (i === attiva) rett(x, px + 6, 13, 46, 2, 1, accento);
    x.fillStyle = i === attiva ? "#e9ecf5" : "#7d849c"; x.fillText(n, px + 7, 9);
  });
}

function salvaschermo(x: CanvasRenderingContext2D, w: number) {
  x.globalAlpha = 0.5;
  x.fillStyle = "#5b61ff";
  x.beginPath(); x.moveTo(w / 2, 44); x.lineTo(w / 2 - 30, 100); x.lineTo(w / 2 - 14, 100); x.lineTo(w / 2 + 8, 58); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(w / 2 + 11, 64); x.lineTo(w / 2 + 30, 100); x.lineTo(w / 2 + 15, 100); x.lineTo(w / 2 + 3, 78); x.closePath(); x.fill();
  x.globalAlpha = 1;
}

/** Un fotogramma dello schermo di chi lavora: cambia scheda, scrive, spunta, muove il mouse. */
export function disegnaSchermoVivo(x: CanvasRenderingContext2D, tipo: string, accento: string, p: number, attesa: boolean) {
  const w = W, h = H;
  rett(x, 0, 0, w, h, 0, "#131622");
  const schede = SCHEDE[tipo] ?? SCHEDE.regia;
  const scheda = Math.floor(p / 9) % 3, q = p % 9;
  cornice(x, w, schede, scheda, accento);
  if (scheda === 0) {
    disegnaTipo(x, w, h, tipo, accento, p);
  } else if (scheda === 1) {
    // documento che si riempie riga dopo riga
    rett(x, 22, 26, 140, 9, 3, CHIARO);
    const lung = [206, 188, 212, 150, 198, 176, 120];
    const fatte = Math.min(lung.length, 1 + Math.floor(q * 0.9));
    for (let i = 0; i < fatte; i++) {
      const parz = i === fatte - 1 ? Math.max(18, (lung[i] * ((q % 3) + 1)) / 3) : lung[i];
      rett(x, 22, 46 + i * 13, parz, 6, 3, MEDIO);
      if (i === fatte - 1 && p % 2 === 0) rett(x, 24 + parz, 44 + i * 13, 2, 10, 1, accento);
    }
  } else {
    // lista di controllo che si spunta da sola
    const voci = [150, 118, 170, 96, 134];
    const spunte = Math.min(voci.length, Math.floor(q / 1.6));
    voci.forEach((l, i) => {
      rett(x, 22, 28 + i * 22, 13, 13, 3, i < spunte ? "#17b26a" : BUIO);
      if (i < spunte) { x.strokeStyle = "#fff"; x.lineWidth = 2; x.beginPath(); x.moveTo(25, 35 + i * 22); x.lineTo(28, 38 + i * 22); x.lineTo(33, 31 + i * 22); x.stroke(); }
      rett(x, 44, 31 + i * 22, l, 7, 3, i < spunte ? MEDIO : CHIARO);
    });
    rett(x, 190, 120, 50, 14, 7, spunte >= voci.length ? "#17b26a" : accento);
  }
  // barra di avanzamento e puntatore del mouse
  rett(x, 0, h - 4, w, 4, 0, "#1d2130");
  rett(x, 0, h - 4, (w * ((p % 27) + 1)) / 27, 4, 0, accento);
  const mx = 60 + ((p * 37) % 170), my = 40 + ((p * 23) % 80);
  x.fillStyle = "#ffffff"; x.beginPath(); x.moveTo(mx, my); x.lineTo(mx, my + 11); x.lineTo(mx + 3, my + 8); x.lineTo(mx + 7, my + 9); x.closePath(); x.fill();
  if (attesa) { x.fillStyle = "#ffd84d"; x.beginPath(); x.arc(w - 14, 8, 5, 0, 7); x.fill(); }
}

/** Tela dello schermo più fitta (1,5x) ma con le coordinate di sempre (256×148). */
export function telaSchermo(disegna?: (x: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  return tela(Math.round(W * RIS), Math.round(H * RIS), (x) => { x.scale(RIS, RIS); disegna?.(x); });
}

/** Tela che si ridisegna nel tempo (schermi accesi, schermo gigante). Si aggiorna solo quando cambia il passo. */
export class TelaViva {
  readonly t: THREE.CanvasTexture;
  private readonly x: CanvasRenderingContext2D | null;
  private passo = -1;
  constructor(w: number, h: number, scala = 1) {
    const c = document.createElement("canvas");
    c.width = Math.round(w * scala); c.height = Math.round(h * scala);
    this.x = c.getContext("2d");
    this.x?.scale(scala, scala);
    this.t = new THREE.CanvasTexture(c);
    this.t.colorSpace = THREE.SRGBColorSpace;
    this.t.anisotropy = 8;
  }
  aggiorna(passo: number, disegna: (x: CanvasRenderingContext2D) => void) {
    if (!this.x || passo === this.passo) return;
    this.passo = passo;
    this.x.save(); disegna(this.x); this.x.restore();
    this.t.needsUpdate = true;
  }
  dispose() { this.t.dispose(); }
}

export const nuovoSchermoVivo = () => new TelaViva(W, H, RIS);

const schermi = new Map<string, THREE.CanvasTexture>();

/** Schermo fermo: salvaschermo per chi è libero, il lavoro attenuato per chi è in coda. */
export function schermo(tipo: string, stato: StatoAgente | "ospite", accento: string): THREE.CanvasTexture {
  const chiave = `${tipo}|${stato}|${accento}`;
  const gia = schermi.get(chiave);
  if (gia) return gia;
  const t = telaSchermo((x) => {
    const w = W, h = H;
    rett(x, 0, 0, w, h, 0, "#131622");
    if (stato === "libero") { salvaschermo(x, w); return; }
    x.globalAlpha = stato === "coda" ? 0.55 : 1;
    cornice(x, w, SCHEDE[tipo] ?? null, 0, accento);
    disegnaTipo(x, w, h, tipo, accento);
    x.globalAlpha = 1;
    if (stato === "attesa") { x.fillStyle = "#ffd84d"; x.beginPath(); x.arc(w - 14, 8, 5, 0, 7); x.fill(); }
  });
  schermi.set(chiave, t);
  return t;
}
