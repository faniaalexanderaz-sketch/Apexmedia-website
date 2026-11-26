"use client";

import { Oggetto3D } from "./Piante3D";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Capelli, Punto, Taglio } from "@/lib/studio/agenti";
import { C, GEO, MAT_INVISIBILE, TelaViva, mat, matLucido, matLuce, matMetallo, tela, matLed, rett } from "./base";
import { ALTEZZA_OCCHI, geoPersona, materialiCorpo, raggioBusto } from "./corpo";

/* =============================================================
   Un membro del team: corpo da adulto con volto, mani e capelli
   veri, divisa Apex con il logo sulla schiena. Cammina lungo i
   corridoi quando cambia posto (scrivania, area relax, spa, la tua
   scrivania), si siede, scrive al computer, ogni tanto prende in
   mano il telefono, alza la mano se aspetta te. Ogni articolazione
   si muove con uno smorzamento morbido: niente scatti.
   ============================================================= */

export type Umore = "lavora" | "attesa" | "coda" | "libero" | "visita" | "ospite";

type Props = {
  /** dove deve andare; se cambia, ci arriva a piedi */
  meta: Punto;
  instrada: (da: { x: number; z: number }, a: { x: number; z: number }) => [number, number][];
  umore: Umore;
  divisa: string;
  accento: string;
  pelle: string;
  /** taglio semplice (vecchio); se c'è `taglio` vale quello */
  capelli: Capelli;
  taglio?: Taglio;
  coloreCapelli: string;
  donna?: boolean;
  barba?: boolean;
  extra?: "cuffie" | "microfono" | "occhiali";
  fase?: number;
  tazza?: boolean;
  /** in pausa sigaretta nell'angolo fumatori */
  fumo?: boolean;
  selezionato?: boolean;
  /** true per i clienti: niente logo Apex sulla schiena */
  ospite?: boolean;
  /** grandezza della persona rispetto agli arredi */
  scala?: number;
  onClick?: () => void;
  /** etichetta o fumetto, segue la testa */
  children?: React.ReactNode;
};

const PANTALONI = "#23283a";
const VELOCITA = 2.1;
/** Altezza dell'anca da seduti su una sedia normale (meta.y = 0). */
const SEDUTO = 0.56;
const OCCHI = ["#4a2f1f", "#2f2219", "#4f6b3a", "#3c5f80", "#5a3b22", "#33261c"];

/** Logo Apex e scritta APEX bianchi su trasparente, per la schiena delle divise. */
let logoSchiena: THREE.CanvasTexture | null = null;
function texLogo(): THREE.CanvasTexture {
  if (logoSchiena) return logoSchiena;
  logoSchiena = tela(320, 400, (x) => {
    x.fillStyle = "#ffffff";
    x.save(); x.translate(60, 28); x.scale(7.2, 7.2);
    x.beginPath(); x.moveTo(14, 0); x.lineTo(0, 26); x.lineTo(7.2, 26); x.lineTo(17.6, 6.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(18.9, 9.2); x.lineTo(28, 26); x.lineTo(20.9, 26); x.lineTo(15.2, 15.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(13.4, 14.2); x.lineTo(17.3, 21.4); x.lineTo(9.5, 21.4); x.closePath(); x.fill();
    x.restore();
    x.font = "800 76px Arial, Helvetica, sans-serif"; x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillText("APEX", 160, 320);
    x.font = "700 40px Arial, Helvetica, sans-serif";
    x.fillText("MEDIA", 160, 376);
  });
  return logoSchiena;
}
let logoPetto: THREE.CanvasTexture | null = null;
function texPetto(): THREE.CanvasTexture {
  if (logoPetto) return logoPetto;
  logoPetto = tela(128, 128, (x) => {
    x.fillStyle = "#ffffff"; x.translate(12, 16); x.scale(3.7, 3.7);
    x.beginPath(); x.moveTo(14, 0); x.lineTo(0, 26); x.lineTo(7.2, 26); x.lineTo(17.6, 6.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(18.9, 9.2); x.lineTo(28, 26); x.lineTo(20.9, 26); x.lineTo(15.2, 15.6); x.closePath(); x.fill();
  });
  return logoPetto;
}

/* ---------- Telefono con lo schermo acceso: un feed che scorre, uguale per tutti ---------- */

let feed: TelaViva | null = null;
const POST = [
  ["#ff7a2f", "#5b2eff", "Fioreria · Natale"], ["#17b26a", "#0f3b2c", "Bagnarino coworking"], ["#2f6bff", "#9fb4ff", "Essenza d'Oriente"],
  ["#f4b81e", "#ff4d6d", "Reel · 12,4K"], ["#5b2eff", "#ff8a3d", "Apex Media"],
] as const;
function texFeed(): THREE.CanvasTexture {
  if (!feed) feed = new TelaViva(120, 240, 2);
  return feed.t;
}
function aggiornaFeed(t: number) {
  feed?.aggiorna(Math.floor(t * 6), (x) => {
    const w = 120, h = 240;
    rett(x, 0, 0, w, h, 0, "#0e0f14");
    const off = (t * 26) % 150;
    for (let i = -1; i < 3; i++) {
      const [a, b, nome] = POST[(Math.floor(t * 26 / 150) + i + 50) % POST.length];
      const y = 26 + i * 150 - off;
      x.fillStyle = a; x.beginPath(); x.arc(12, y + 8, 6, 0, 7); x.fill();
      x.fillStyle = "#e9ecf5"; x.font = "700 9px system-ui, sans-serif"; x.fillText(nome, 22, y + 11);
      const g = x.createLinearGradient(0, y + 20, w, y + 120); g.addColorStop(0, a); g.addColorStop(1, b);
      x.fillStyle = g; x.fillRect(0, y + 20, w, 100);
      x.fillStyle = "rgba(255,255,255,0.9)"; x.font = "800 14px system-ui, sans-serif"; x.fillText(i % 2 ? "-20% oggi" : "Prenota ora", 10, y + 80);
      x.fillStyle = "#ff4d6d"; x.beginPath(); x.arc(12, y + 131, 4, 0, 7); x.fill();
      rett(x, 22, y + 128, 40, 6, 3, "#3a3f52");
    }
    rett(x, 0, 0, w, 18, 0, "#0e0f14");
    x.fillStyle = "#ffffff"; x.font = "700 9px system-ui, sans-serif"; x.fillText("9:41", 8, 12);
    rett(x, 92, 6, 18, 7, 2, "#ffffff");
    rett(x, 40, h - 8, 40, 3, 2, "#ffffff");
  });
}

/* ---------- Pose ---------- */

/** Bersagli delle articolazioni: [sinistra, destra]. `aper` > 0 apre il braccio verso l'esterno, `prona` gira il palmo verso il basso. */
type Posa = {
  cx: [number, number]; kn: [number, number]; cav: [number, number];
  spX: [number, number]; aper: [number, number]; gom: [number, number]; polX: [number, number]; prona: [number, number];
  bX: number; bY: number; bZ: number; tX: number; tY: number; tZ: number; bacY: number;
};
const nuovaPosa = (): Posa => ({ cx: [0, 0], kn: [0, 0], cav: [0, 0], spX: [0.06, 0.06], aper: [0.08, 0.08], gom: [0.18, 0.18], polX: [0, 0], prona: [0.2, 0.2], bX: 0, bY: 0, bZ: 0, tX: 0, tY: 0, tZ: 0, bacY: 0 });
const braccia = (p: Posa, i: 0 | 1, spX: number, aper: number, gom: number, prona = 0.2, polX = 0) => { p.spX[i] = spX; p.aper[i] = aper; p.gom[i] = gom; p.prona[i] = prona; p.polX[i] = polX; };
const seduto = (p: Posa) => { p.cx = [1.5, 1.5]; p.kn = [-1.45, -1.45]; p.cav = [-0.05, -0.05]; };

const smorza = (o: THREE.Object3D | null, asse: "x" | "y" | "z", a: number, k: number, dt: number) => { if (o) o.rotation[asse] = THREE.MathUtils.damp(o.rotation[asse], a, k, dt); };
const angolo = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _su = new THREE.Vector3(0, 1, 0);

export function Personaggio({ meta, instrada, umore, divisa, accento, pelle, capelli, taglio, coloreCapelli, donna = false, barba = false, extra, fase = 0, tazza, fumo, selezionato, ospite, scala = 1, onClick, children }: Props) {
  const g = useMemo(() => geoPersona({
    donna, barba, extra, taglio: taglio ?? (capelli === "corti" && donna ? "caschetto" : capelli),
    colori: { divisa, accento, pelle, capelli: coloreCapelli, pantaloni: ospite ? "#3a3f4f" : PANTALONI, ospite },
    occhi: OCCHI[Math.abs(Math.round(fase * 7)) % OCCHI.length],
  }), [donna, barba, extra, taglio, capelli, divisa, accento, pelle, coloreCapelli, ospite, fase]);
  const M = materialiCorpo();
  const m = g.m;

  const radice = useRef<THREE.Group>(null);
  const bacino = useRef<THREE.Group>(null), busto = useRef<THREE.Group>(null), testa = useRef<THREE.Group>(null), palpebre = useRef<THREE.Mesh>(null);
  const coscia = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const ginocchio = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const caviglia = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const spalla = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const gomito = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const polso = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const vestito = useRef<THREE.Group>(null), nudo = useRef<THREE.Group>(null);
  const maniche = useRef<(THREE.Mesh | null)[]>([]), bracciaNude = useRef<(THREE.Mesh | null)[]>([]);
  const telefono = useRef<THREE.Group>(null), libro = useRef<THREE.Group>(null), joypad = useRef<THREE.Group>(null), tablet = useRef<THREE.Group>(null);
  const inMano = useRef<THREE.Group>(null);
  const anello = useRef<THREE.Mesh>(null);
  const nuvola = useRef<THREE.Group>(null);
  const [sopra, setSopra] = useState(false);
  const sbuffi = useMemo(() => (fumo ? [0, 1, 2, 3].map(() => new THREE.MeshBasicMaterial({ color: "#e9e9ee", transparent: true, opacity: 0, depthWrite: false })) : []), [fumo]);
  useEffect(() => () => sbuffi.forEach((x) => x.dispose()), [sbuffi]);
  const schermoTel = useMemo(() => texFeed(), []);

  // stato del movimento, fuori da React: cambia a ogni fotogramma
  const st = useRef({
    x: meta.x, z: meta.z, rot: meta.rot, y: meta.posa === "seduto" ? meta.y + SEDUTO - m.anca : meta.y, v: 0,
    via: [] as [number, number][], passo: 0, iniziato: false, partenza: { x: meta.x, z: meta.z, y: 0 }, da: { x: meta.x, z: meta.z }, seg: 0, battito: 2 + (fase % 3),
  });
  const chiave = `${meta.x.toFixed(2)}|${meta.z.toFixed(2)}`;
  useEffect(() => {
    const s = st.current;
    if (!s.iniziato) return;
    if (Math.hypot(s.x - meta.x, s.z - meta.z) < 0.05) return;
    s.via = instrada({ x: s.x, z: s.z }, { x: meta.x, z: meta.z });
    s.partenza = { x: s.x, z: s.z, y: s.y }; s.da = { x: s.x, z: s.z }; s.seg = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  const logo = useMemo(() => (ospite ? null : texLogo()), [ospite]);
  const petto = useMemo(() => (ospite ? null : texPetto()), [ospite]);
  const posa = useRef(nuovaPosa());

  useFrame((stato, dtGrezzo) => {
    const r = radice.current, s = st.current;
    if (!r) return;
    const dt = Math.min(dtGrezzo, 0.05);
    const tempo = stato.clock.elapsedTime, t = tempo + fase * 1.7;
    s.iniziato = true;
    aggiornaFeed(tempo);

    const cammina = s.via.length > 0;
    const att = meta.attivita;
    const P = posa.current;
    Object.assign(P, nuovaPosa());

    if (cammina) {
      const [tx, tz] = s.via[0];
      const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
      const ultimo = s.via.length === 1;
      // accelera dolce, rallenta arrivando
      s.v = THREE.MathUtils.damp(s.v, ultimo ? Math.min(VELOCITA, 0.6 + d * 1.6) : VELOCITA, 3.5, dt);
      const passo = Math.min(d, s.v * dt);
      if (d > 0.001) { s.x += (dx / d) * passo; s.z += (dz / d) * passo; s.rot += angolo(Math.atan2(-dx, -dz) - s.rot) * (1 - Math.exp(-dt * 9)); }
      s.passo += passo * 3.6;
      // entra o esce dalla jacuzzi scendendo gli scalini: la quota segue il tratto percorso
      const lungo = Math.max(0.3, Math.hypot(tx - s.da.x, tz - s.da.z)), fatto = 1 - d / lungo;
      const morbido = (k: number) => { const q = Math.min(1, Math.max(0, k)); return q * q * (3 - 2 * q); };
      const fondo = -0.98;
      if (ultimo && meta.y < -0.6) s.y = THREE.MathUtils.damp(s.y, Math.max(fondo, meta.y) * morbido((fatto - 0.25) / 0.75), 9, dt);
      else if (s.seg === 0 && s.partenza.y < -1.0) s.y = THREE.MathUtils.damp(s.y, fondo * (1 - morbido(fatto / 0.75)), 7, dt);
      else s.y = THREE.MathUtils.damp(s.y, 0, 8, dt);
      if (d - passo < 0.02) { s.via.shift(); s.da = { x: s.x, z: s.z }; s.seg++; }
    } else {
      s.v = 0;
      s.rot += angolo(meta.rot - s.rot) * (1 - Math.exp(-dt * 5));
      const yMeta = meta.posa === "seduto" ? meta.y + SEDUTO - m.anca : meta.y;
      s.y = THREE.MathUtils.damp(s.y, yMeta, 5, dt);
    }
    const sedutoOra = !cammina && meta.posa === "seduto";
    const spa = !cammina && att === "spa";

    // ---- scelta della posa ----
    const tel = (i: 0 | 1 = 1) => { braccia(P, i, 0.38, -0.2, 1.78, 1.25); braccia(P, (1 - i) as 0 | 1, 0.3, -0.12, 1.62, 1.4); P.tX = -0.42; P.bX = -0.04; };
    const ciclo = (periodo: number, durata: number, sfasa = 0) => ((t + sfasa) % periodo) < durata;
    let mostra: "telefono" | "libro" | "joypad" | "tablet" | null = null;

    if (cammina) {
      const f = s.passo, a = Math.sin(f), ampio = Math.min(1, s.v / VELOCITA);
      P.cx = [a * 0.46 * ampio, -a * 0.46 * ampio];
      P.kn = [-(0.06 + 0.95 * Math.pow(Math.max(0, Math.cos(f)), 1.4)) * ampio, -(0.06 + 0.95 * Math.pow(Math.max(0, -Math.cos(f)), 1.4)) * ampio];
      P.cav = [-(P.cx[0] + P.kn[0]) * 0.8 + 0.1 * ampio, -(P.cx[1] + P.kn[1]) * 0.8 + 0.1 * ampio];
      braccia(P, 0, -a * 0.4 * ampio + 0.05, 0.08, 0.28 + Math.max(0, -a) * 0.3, 0.25);
      braccia(P, 1, a * 0.4 * ampio + 0.05, 0.08, 0.28 + Math.max(0, a) * 0.3, 0.25);
      P.bacY = a * 0.1 * ampio; P.bY = -a * 0.08 * ampio; P.bZ = Math.cos(f) * 0.02; P.bX = -0.05; P.tY = -P.bY - P.bacY * 0.5;
    } else if (spa) {
      seduto(P); P.cx = [1.25, 1.25]; P.kn = [-0.85, -0.85];
      braccia(P, 0, -0.4, 1.05, 0.35, 0); braccia(P, 1, -0.4, 1.05, 0.35, 0);
      P.bX = 0.16; P.tX = 0.12 + Math.sin(t * 0.3) * 0.05; P.tY = Math.sin(t * 0.25) * 0.4;
    } else if (umore === "visita") {
      braccia(P, 0, 0.45, -0.25, 1.45, 1.35); mostra = "tablet";
      const saluta = Math.sin(t * 0.9) > 0.55;
      if (saluta) braccia(P, 1, 2.45, 0.38, 0.45 + Math.sin(t * 9) * 0.3, 0.1);
      P.tY = Math.sin(t * 0.5) * 0.15; P.tX = 0.04;
    } else if (att === "gioca") {
      seduto(P); P.cx = [1.4, 1.4];
      const k = Math.sin(t * 12) * 0.05;
      braccia(P, 0, 0.5 + k, -0.22, 1.28, 1.3, Math.sin(t * 17) * 0.06); braccia(P, 1, 0.5 - k, -0.22, 1.28, 1.3, Math.sin(t * 15 + 1) * 0.06);
      P.bX = -0.12 + Math.sin(t * 0.7) * 0.04; P.tX = 0.02; P.tY = Math.sin(t * 0.8) * 0.06; P.bZ = Math.sin(t * 0.55) * 0.05; mostra = "joypad";
    } else if (att === "pingpong-sx" || att === "pingpong-dx") {
      const fasePalla = (tempo * 0.7) % 2;
      const vicino = att === "pingpong-sx" ? Math.min(fasePalla, 2 - fasePalla) : Math.abs(fasePalla - 1);
      const colpo = Math.max(0, 1 - vicino / 0.35);
      P.cx = [0.32, 0.38]; P.kn = [-0.55, -0.6]; P.cav = [0.22, 0.22];
      braccia(P, 0, 0.45, 0.1, 1.0, 0.6);
      braccia(P, 1, 0.55 + colpo * 0.8, 0.55 - colpo * 0.9, 1.15 - colpo * 0.55, 0.4);
      P.bX = -0.2 - colpo * 0.05; P.bY = -colpo * 0.35; P.tY = colpo * 0.3; P.tX = 0.1;
    } else if (att === "telefono") {
      if (sedutoOra) seduto(P);
      tel(); mostra = "telefono"; P.tY = Math.sin(t * 0.4) * 0.08;
    } else if (att === "legge") {
      if (sedutoOra) seduto(P);
      braccia(P, 0, 0.6, -0.26, 1.32, 1.1); braccia(P, 1, 0.6, -0.26, 1.32, 1.1); P.tX = -0.38; P.tY = Math.sin(t * 0.3) * 0.06; mostra = "libro";
    } else if (att === "sole") {
      seduto(P); P.cx = [1.45, 1.38]; P.kn = [-0.18, -0.35]; P.cav = [-0.3, -0.2];
      P.bX = 0.82; P.tX = -0.38 + Math.sin(t * 0.2) * 0.05;
      braccia(P, 0, 0.15, 0.22, 0.35, 0.3); braccia(P, 1, 0.15, 0.22, 0.35, 0.3);
      if (ciclo(40, 14, fase * 5)) { tel(); P.tX = -0.6; mostra = "telefono"; }
    } else if (!sedutoOra && fumo) {
      const tiro = (t % 4.5) < 1.1;
      braccia(P, 0, 0.05, 0.06, 0.2, 0.2);
      braccia(P, 1, tiro ? 0.35 : 0.15, tiro ? -0.15 : 0.05, tiro ? 2.4 : 1.35, 0.8);
      P.tY = Math.sin(t * 0.5) * 0.25; P.tX = tiro ? 0.08 : -0.02; P.cx = [0.05, -0.04]; P.kn = [-0.08, 0];
    } else if (!sedutoOra) {
      // in piedi: peso su una gamba, si guarda intorno, beve il caffè
      const peso = Math.sin(t * 0.25);
      P.cx = [0.04 * peso, -0.04 * peso]; P.kn = [-Math.max(0, peso) * 0.12, -Math.max(0, -peso) * 0.12]; P.bZ = peso * 0.02;
      P.tY = Math.sin(t * 0.6) * 0.3; P.tX = Math.sin(t * 0.37) * 0.05;
      if (tazza) { const sorso = ciclo(7, 1.4, fase); braccia(P, 1, sorso ? 0.45 : 0.25, -0.12, sorso ? 2.35 : 1.8, 0.9); if (sorso) P.tX = 0.12; }
    } else if (umore === "lavora") {
      seduto(P);
      if (ciclo(46, 7, fase * 7)) { tel(); mostra = "telefono"; }
      else {
        braccia(P, 0, 0.55, 0.2, 1.05, 1.45, -0.15 + Math.sin(t * 14) * 0.08);
        braccia(P, 1, 0.55, 0.2, 1.05, 1.45, -0.15 + Math.sin(t * 14 + 2.1) * 0.08);
        // ogni tanto prende il mouse
        if (ciclo(9, 3, fase)) braccia(P, 1, 0.5, 0.35, 1.0, 1.5, -0.1 + Math.sin(t * 3) * 0.03);
        P.bX = -0.07; P.tX = -0.06 + Math.sin(t * 1.8) * 0.02; P.tY = Math.sin(t * 0.7) * 0.06;
      }
    } else if (umore === "attesa") {
      seduto(P);
      braccia(P, 0, 0.55, 0.2, 1.05, 1.45);
      braccia(P, 1, 2.75, 0.25, 0.35 + Math.sin(t * 6) * 0.25, 0.2);
      P.tY = 0.6; P.tX = 0.06;
    } else if (umore === "coda") {
      seduto(P);
      if (ciclo(22, 9, fase * 3)) { tel(); mostra = "telefono"; }
      else { braccia(P, 0, 0.45, 0.05, 0.95, 1.3); braccia(P, 1, 0.45, 0.05, 0.95, 1.3); P.bX = 0.08; P.tY = Math.sin(t * 0.5) * 0.35; P.tX = Math.sin(t * 0.9) * 0.04; }
    } else if (umore === "ospite") {
      seduto(P); braccia(P, 0, 0.42, -0.08, 1.0, 1.2); braccia(P, 1, 0.42, -0.08, 1.0, 1.2); P.tY = Math.sin(t * 0.45) * 0.4; P.tX = -0.03;
    } else {
      seduto(P);
      if (tazza) braccia(P, 1, 0.3, -0.1, 1.8, 0.9);
      else braccia(P, 1, 0.35, 0.05, 0.9, 0.6);
      braccia(P, 0, 0.35, 0.05, 0.9, 0.6);
      P.tY = Math.sin(t * 0.4) * 0.45; P.tX = -0.06; P.bX = 0.06;
      if (ciclo(30, 10, fase * 4)) { tel(); mostra = "telefono"; }
    }

    // ---- applica, con smorzamento morbido ----
    const kA = cammina ? 16 : 5, kB = cammina ? 14 : 4.5;
    for (const i of [0, 1] as const) {
      const lato = i === 0 ? -1 : 1;
      smorza(coscia[i].current, "x", P.cx[i], kA, dt); smorza(ginocchio[i].current, "x", P.kn[i], kA, dt); smorza(caviglia[i].current, "x", P.cav[i], kA, dt);
      smorza(spalla[i].current, "x", P.spX[i], kB, dt); smorza(spalla[i].current, "z", lato * P.aper[i], kB, dt);
      smorza(gomito[i].current, "x", P.gom[i], kB, dt);
      smorza(polso[i].current, "x", P.polX[i], 10, dt); smorza(polso[i].current, "y", lato * P.prona[i], 6, dt);
    }
    smorza(busto.current, "x", P.bX, 4, dt); smorza(busto.current, "y", P.bY, 6, dt); smorza(busto.current, "z", P.bZ, 4, dt);
    smorza(bacino.current, "y", P.bacY, 8, dt);
    smorza(testa.current, "x", P.tX, 4, dt); smorza(testa.current, "y", P.tY, 3.5, dt); smorza(testa.current, "z", P.tZ, 3, dt);

    // respiro e passo
    const bob = cammina ? 0.022 * Math.cos(s.passo * 2) - 0.012 : 0;
    if (busto.current) { busto.current.position.y = m.anca + bob; busto.current.scale.y = 1 + Math.sin(t * 1.5) * 0.005; }
    if (bacino.current) bacino.current.position.y = m.anca + bob;

    // occhi che sbattono
    s.battito -= dt;
    if (s.battito < -0.13) s.battito = 2.2 + ((t * 7.3) % 3.2);
    if (palpebre.current) palpebre.current.rotation.x = s.battito < 0 ? -1.25 : spa ? 0.25 : 0.55;

    r.position.set(s.x, s.y, s.z);
    r.rotation.y = s.rot;
    r.scale.setScalar((sopra ? 1.04 : 1) * scala);

    // vestiti: in jacuzzi costume, altrimenti divisa
    if (vestito.current) vestito.current.visible = !spa;
    if (nudo.current) nudo.current.visible = spa;
    maniche.current.forEach((x) => { if (x) x.visible = !spa; });
    bracciaNude.current.forEach((x) => { if (x) x.visible = spa; });

    if (telefono.current) telefono.current.visible = mostra === "telefono";
    if (libro.current) libro.current.visible = mostra === "libro";
    if (joypad.current) joypad.current.visible = mostra === "joypad";
    if (tablet.current) tablet.current.visible = mostra === "tablet";
    // tazza, racchetta e sigaretta restano dritte nel mondo mentre la mano si muove
    if (inMano.current) {
      inMano.current.visible = !cammina;
      const padre = inMano.current.parent;
      if (padre) { padre.updateWorldMatrix(true, false); padre.getWorldQuaternion(_q); _q2.setFromAxisAngle(_su, s.rot); inMano.current.quaternion.copy(_q.invert().multiply(_q2)); }
    }

    if (anello.current) {
      const vis = Boolean(selezionato) || umore === "attesa" || umore === "visita";
      anello.current.visible = vis && !cammina && !spa;
      if (vis) { const p = 1 + Math.sin(t * 3) * 0.06; anello.current.scale.set(1.3 * p, 1.3 * p, 1); }
    }
    if (nuvola.current) {
      nuvola.current.visible = Boolean(fumo) && !cammina;
      nuvola.current.children.forEach((o, k) => {
        const f = (t * 0.45 + k / 4) % 1;
        o.position.set(Math.sin(t + k) * 0.06 * f, 1.62 + f * 0.9, -0.22 - f * 0.2);
        o.scale.setScalar(0.05 + f * 0.2);
        sbuffi[k].opacity = 0.32 * (1 - f) * Math.min(1, f * 6);
      });
    }
  });

  const tocca = onClick ? {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onClick(); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setSopra(true); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { setSopra(false); document.body.style.cursor = ""; },
  } : {};

  const yLogo = donna ? 0.31 : 0.34;
  const rDietro = raggioBusto(donna, yLogo) * 0.62;
  const xPetto = -0.085, rPetto = raggioBusto(donna, yLogo + 0.01);
  const zPetto = -Math.sqrt(Math.max(0, rPetto * rPetto - xPetto * xPetto)) * 0.62;
  return (
    <group ref={radice} position={[meta.x, meta.y, meta.z]} rotation={[0, meta.rot, 0]} userData={{ dinamico: true }}>
      <mesh ref={anello} geometry={GEO.anello} material={matLuce(selezionato ? C.viola : C.oro, 0.9)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false} />
      <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 0.9, -0.05]} scale={[0.9, 1.8, 0.9]} {...tocca} />

      <group ref={bacino} position={[0, m.anca, 0]}>
        <mesh geometry={g.bacino} material={M.stoffa} castShadow />
        {([0, 1] as const).map((i) => (
          <group key={i} ref={coscia[i]} position={[(i ? 1 : -1) * 0.088 * m.largo, 0, 0]}>
            <mesh geometry={g.coscia} material={M.stoffa} castShadow />
            <group ref={ginocchio[i]} position={[0, -m.coscia, 0]}>
              <mesh geometry={g.stinco} material={M.stoffa} castShadow />
              <group ref={caviglia[i]} position={[0, -m.stinco, 0]}>
                <mesh geometry={g.scarpa} material={M.plastica} castShadow />
              </group>
            </group>
          </group>
        ))}
      </group>

      <group ref={busto} position={[0, m.anca, 0]}>
        <group ref={vestito}>
          <mesh geometry={g.busto} material={M.stoffa} castShadow />
          {logo ? (
            <mesh position={[0, yLogo, rDietro + 0.004]} scale={[0.19, 0.24, 1]}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={logo} transparent roughness={0.6} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
          ) : null}
          {petto ? (
            <mesh position={[xPetto, yLogo + 0.01, zPetto - 0.004]} rotation={[0, Math.PI + 0.35, 0]} scale={0.055}>
              <planeGeometry args={[1, 1]} />
              <meshStandardMaterial map={petto} transparent roughness={0.6} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
          ) : null}
        </group>
        <group ref={nudo} visible={false}><mesh geometry={g.bustoSpa} material={M.pelle} /></group>
        <mesh geometry={g.collo} material={M.pelle} />

        <group ref={testa} position={[0, m.collo, 0]} scale={m.testa}>
          <mesh geometry={g.testa} material={M.pelle} castShadow />
          <mesh geometry={g.occhi} material={M.occhi} />
          <mesh ref={palpebre} geometry={g.palpebre} material={M.pelle} position={ALTEZZA_OCCHI} rotation={[0.55, 0, 0]} />
          <mesh geometry={g.capelli} material={M.capelli} castShadow />
          {g.accessori ? <mesh geometry={g.accessori} material={M.plastica} /> : null}
        </group>

        {([0, 1] as const).map((i) => {
          const lato = i ? 1 : -1;
          return (
            <group key={i} ref={spalla[i]} position={[lato * m.spalla[0], m.spalla[1], 0]}>
              <mesh ref={(x) => { maniche.current[i * 2] = x; }} geometry={g.omero} material={M.stoffa} castShadow />
              <mesh ref={(x) => { bracciaNude.current[i * 2] = x; }} geometry={g.omeroNudo} material={M.pelle} visible={false} />
              <group ref={gomito[i]} position={[0, -m.omero, 0]}>
                <mesh ref={(x) => { maniche.current[i * 2 + 1] = x; }} geometry={g.avambraccio} material={M.stoffa} castShadow />
                <mesh ref={(x) => { bracciaNude.current[i * 2 + 1] = x; }} geometry={g.avambraccioNudo} material={M.pelle} visible={false} />
                <group ref={polso[i]} position={[0, -m.avambraccio, 0]}>
                  <mesh geometry={i ? g.manoD : g.manoS} material={M.pelle} />
                  {i === 1 ? (
                    <group position={[-0.012, -0.075, -0.035]}>
                      <group ref={inMano}>
                        {tazza ? (
                          <group position={[0, -0.01, 0]}>
                            <mesh geometry={GEO.cil} material={mat(C.bianco, 0.25)} scale={[0.075, 0.095, 0.075]} castShadow />
                            <mesh geometry={GEO.cil} material={mat("#3b2418", 0.4)} position={[0, 0.046, 0]} scale={[0.066, 0.004, 0.066]} />
                            <mesh geometry={GEO.toro} material={mat(C.bianco, 0.25)} position={[0.045, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.04, 0.04, 0.12]} />
                          </group>
                        ) : null}
                        {meta.attivita === "pingpong-sx" || meta.attivita === "pingpong-dx" ? (
                          <group rotation={[0, 0, 0]}>
                            <mesh geometry={GEO.cil} material={mat("#7a5236", 0.6)} position={[0, 0, 0]} scale={[0.028, 0.1, 0.028]} />
                            <mesh geometry={GEO.cil} material={mat("#d4302f", 0.6)} position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.16, 0.012, 0.17]} />
                          </group>
                        ) : null}
                        {fumo ? (
                          <group position={[0.02, 0.02, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
                            <mesh geometry={GEO.cil} material={mat("#f6f4ee", 0.6)} scale={[0.008, 0.075, 0.008]} />
                            <mesh geometry={GEO.cil} material={mat("#d9a25a", 0.7)} position={[0, 0.03, 0]} scale={[0.0085, 0.022, 0.0085]} />
                            <mesh geometry={GEO.cil} material={matLed("#ff6a1f", 3)} position={[0, -0.039, 0]} scale={[0.0085, 0.006, 0.0085]} />
                          </group>
                        ) : null}
                      </group>
                    </group>
                  ) : null}
                </group>
              </group>
            </group>
          );
        })}

        {/* oggetti tenuti con due mani, davanti al petto */}
        <group ref={telefono} position={[0.02, 0.32, -0.36]} rotation={[-0.95, 0, 0]} visible={false}>
          <RoundedBox args={[0.075, 0.155, 0.009]} radius={0.004} smoothness={2} material={matLucido("#15161c")} />
          <mesh position={[0, 0, 0.0052]}><planeGeometry args={[0.068, 0.146]} /><meshBasicMaterial map={schermoTel} toneMapped={false} /></mesh>
        </group>
        <group ref={libro} position={[0, 0.3, -0.4]} rotation={[-0.85, 0, 0]} visible={false}>
          <mesh geometry={GEO.box} material={mat("#7a2e3a", 0.7)} position={[-0.075, 0, 0]} rotation={[0, 0.22, 0]} scale={[0.15, 0.22, 0.012]} />
          <mesh geometry={GEO.box} material={mat("#7a2e3a", 0.7)} position={[0.075, 0, 0]} rotation={[0, -0.22, 0]} scale={[0.15, 0.22, 0.012]} />
          <mesh geometry={GEO.box} material={mat("#f4efe2", 0.9)} position={[0, 0, 0.012]} scale={[0.28, 0.2, 0.014]} />
        </group>
        <group ref={joypad} position={[0, 0.25, -0.43]} rotation={[0.4, 0, 0]} visible={false}>
          <RoundedBox args={[0.17, 0.04, 0.085]} radius={0.018} smoothness={2} material={mat("#f4f4f6", 0.3)} />
          <mesh geometry={GEO.sfera} material={mat("#f4f4f6", 0.3)} position={[-0.07, -0.012, 0.035]} scale={[0.05, 0.04, 0.07]} />
          <mesh geometry={GEO.sfera} material={mat("#f4f4f6", 0.3)} position={[0.07, -0.012, 0.035]} scale={[0.05, 0.04, 0.07]} />
          <mesh geometry={GEO.box} material={matLed("#4f7dff", 2)} position={[0, 0.021, -0.03]} scale={[0.06, 0.004, 0.006]} />
          {[-0.035, 0.035].map((x) => <mesh key={x} geometry={GEO.cil} material={mat("#1b1d26", 0.5)} position={[x, 0.024, 0.005]} scale={[0.018, 0.012, 0.018]} />)}
        </group>
        <group ref={tablet} position={[-0.07, 0.27, -0.38]} rotation={[-0.75, 0.2, 0]} visible={false}>
          <RoundedBox args={[0.24, 0.17, 0.008]} radius={0.006} smoothness={2} material={matLucido("#1b1d28")} />
          <mesh position={[0, 0, 0.0045]}><planeGeometry args={[0.226, 0.156]} /><meshBasicMaterial map={schermoTel} toneMapped={false} /></mesh>
        </group>
      </group>
      {fumo ? <group ref={nuvola}>{sbuffi.map((x, k) => <mesh key={k} geometry={GEO.sfera} material={x} />)}</group> : null}
      {children}
    </group>
  );
}

/** Sedia da ufficio vera (modello 3D); quella disegnata resta come riserva mentre carica. `rot` come chi ci si siede. */
export function Sedia({ x, z, rot = 0, c = "#2a2d3a" }: { x: number; z: number; rot?: number; c?: string }) {
  return <Oggetto3D file="modern_arm_chair_01" x={x} z={z} rot={rot + Math.PI} scala={1.08} riserva={<group position={[-x, 0, -z]}><SediaDisegnata x={x} z={z} rot={rot} c={c} /></group>} />;
}

function SediaDisegnata({ x, z, rot = 0, c = "#2a2d3a" }: { x: number; z: number; rot?: number; c?: string }) {
  const m = mat(c, 0.85), metallo = matMetallo("#b9bcc6");
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh geometry={GEO.box} material={m} position={[0, 0.5, 0.02]} scale={[0.56, 0.1, 0.54]} castShadow receiveShadow />
      <mesh geometry={GEO.box} material={m} position={[0, 0.9, 0.29]} rotation={[0.12, 0, 0]} scale={[0.52, 0.62, 0.08]} castShadow />
      {[-0.3, 0.3].map((l) => <mesh key={l} geometry={GEO.box} material={m} position={[l, 0.66, 0.05]} scale={[0.05, 0.05, 0.36]} castShadow />)}
      <mesh geometry={GEO.cil} material={metallo} position={[0, 0.28, 0.02]} scale={[0.07, 0.38, 0.07]} />
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} geometry={GEO.box} material={metallo} position={[Math.sin((i * Math.PI * 2) / 5) * 0.17, 0.07, 0.02 + Math.cos((i * Math.PI * 2) / 5) * 0.17]} rotation={[0, (i * Math.PI * 2) / 5, 0]} scale={[0.05, 0.035, 0.36]} castShadow />)}
      {[0, 1, 2, 3, 4].map((i) => <mesh key={`r${i}`} geometry={GEO.sfera} material={mat("#1b1d26", 0.5)} position={[Math.sin((i * Math.PI * 2) / 5) * 0.34, 0.035, 0.02 + Math.cos((i * Math.PI * 2) / 5) * 0.34]} scale={0.07} />)}
    </group>
  );
}
