"use client";

import * as THREE from "three";
import { useEffect, useState } from "react";

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
  /** true dopo il primo disegno */
  get pronta() { return this.passo !== -1; }
  aggiorna(passo: number, disegna: (x: CanvasRenderingContext2D) => void) {
    if (!this.x || passo === this.passo) return;
    this.passo = passo;
    this.x.save(); disegna(this.x); this.x.restore();
    this.t.needsUpdate = true;
  }
  dispose() { this.t.dispose(); }
}
