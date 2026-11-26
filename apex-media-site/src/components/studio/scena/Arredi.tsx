"use client";

import { Pianta3D } from "./Piante3D";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Line, MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { FONDO, LARGO } from "@/lib/studio/agenti";
import type { StatoAgente } from "@/lib/studio/calcoli";
import { C, GEO, MAT_INVISIBILE, MAT_VETRO, TelaViva, disegnaSchermoVivo, mat, matLed, matLucido, matLuce, matMetallo, matOttone, rett, schermo, nuovoSchermoVivo, tela, type Font } from "./base";

/* =============================================================
   Tutto ciò che non è una persona: pavimento in marmo, muro con
   l'insegna LED di Apex Media, scrivanie, studio video, area relax,
   la tua scrivania, i reparti dei clienti, la cassa, le piante.
   Le misure seguono la pianta in src/lib/studio/agenti.ts.
   ============================================================= */

export const MURO_Z = -FONDO / 2;
const FRONTE_MURO = MURO_Z + 0.4;

function puntatore(su: boolean) { document.body.style.cursor = su ? "pointer" : ""; }
export function cliccabile(onClick?: () => void) {
  return onClick ? {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onClick(); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); puntatore(true); },
    onPointerOut: () => puntatore(false),
  } : {};
}

type V3 = [number, number, number];
function Box({ p, s, r, m, ombra = true, riceve = false }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean; riceve?: boolean }) {
  return <mesh geometry={GEO.box} material={m} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow={riceve} />;
}
function Cil({ p, s, r, m, ombra = true }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean }) {
  return <mesh geometry={GEO.cil} material={m} position={p} scale={s} rotation={r} castShadow={ombra} />;
}
function Sfera({ p, s, m, ombra = true }: { p: V3; s: V3 | number; m: THREE.Material; ombra?: boolean }) {
  return <mesh geometry={GEO.sfera} material={m} position={p} scale={s} castShadow={ombra} />;
}

/** Striscia LED: una barretta luminosa da un punto all'altro (in pianta), all'altezza y. */
export function Led({ da, a, y, c, spessore = 0.06, forza = 2.4 }: { da: [number, number]; a: [number, number]; y: number; c: string; spessore?: number; forza?: number }) {
  const dx = a[0] - da[0], dz = a[1] - da[1];
  return <mesh geometry={GEO.box} material={matLed(c, forza)} position={[(da[0] + a[0]) / 2, y, (da[1] + a[1]) / 2]} rotation={[0, Math.atan2(-dz, dx), 0]} scale={[Math.hypot(dx, dz), spessore, spessore]} />;
}

/* ---------- Pavimento, muri, luci di perimetro ---------- */

/** Marmo bianco tipo Calacatta: venature grigie e qualche filo d'oro, lastre grandi con fughe sottili. */
function useMarmo() {
  return useMemo(() => {
    const t = tela(1536, 1536, (x, w, h) => {
      let seme = 23;
      const rnd = () => { seme = (seme * 9301 + 49297) % 233280; return seme / 233280; };
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#141418"); g.addColorStop(0.5, "#0e0e12"); g.addColorStop(1, "#16161b");
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      // nuvole leggere
      for (let i = 0; i < 40; i++) { const cx = rnd() * w, cy = rnd() * h, r = 80 + rnd() * 260; const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, "rgba(70,70,82,0.22)"); gr.addColorStop(1, "rgba(70,70,82,0)"); x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
      const vena = (colore: string, spessore: number, alfa: number) => {
        let px = rnd() * w, py = rnd() * h;
        const ang = rnd() * Math.PI * 2;
        x.strokeStyle = colore; x.globalAlpha = alfa; x.lineCap = "round";
        for (let k = 0; k < 6; k++) {
          const lung = 120 + rnd() * 260, a = ang + (rnd() - 0.5) * 1.1;
          const nx = px + Math.cos(a) * lung, ny = py + Math.sin(a) * lung;
          x.lineWidth = spessore * (0.4 + rnd());
          x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px + (rnd() - 0.5) * 120, py + (rnd() - 0.5) * 120, nx + (rnd() - 0.5) * 120, ny + (rnd() - 0.5) * 120, nx, ny); x.stroke();
          px = nx; py = ny;
        }
        x.globalAlpha = 1;
      };
      for (let i = 0; i < 22; i++) vena("#c9c9d2", 5, 0.07);
      for (let i = 0; i < 46; i++) vena("#e8e6ee", 1.3, 0.28);
      for (let i = 0; i < 9; i++) vena("#d8ad5e", 1.5, 0.55);
      // fughe tra le lastre
      x.fillStyle = "rgba(200,170,110,0.22)";
      for (let k = 0; k <= 4; k++) { x.fillRect(k * (w / 4) - 1, 0, 2, h); x.fillRect(0, k * (h / 4) - 1, w, 2); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(LARGO / 10, FONDO / 10);
    return t;
  }, []);
}

export function Pavimento({ riflessi = false }: { riflessi?: boolean }) {
  const marmo = useMarmo();
  const ombra = useMemo(() => tela(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(40,44,70,0.32)"); g.addColorStop(0.75, "rgba(40,44,70,0.07)"); g.addColorStop(1, "rgba(40,44,70,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }), []);
  useEffect(() => () => { ombra.dispose(); marmo.dispose(); }, [ombra, marmo]);
  const bordo = mat("#2b2724", 0.4);
  return (
    <group>
      <mesh geometry={GEO.piano} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 1.5]} scale={[LARGO * 1.45, FONDO * 1.7, 1]}>
        <meshBasicMaterial map={ombra} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <RoundedBox args={[LARGO, 0.7, FONDO]} radius={0.3} smoothness={4} position={[0, -0.47, 0]} material={mat("#1a1a20", 0.6)} receiveShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
        <planeGeometry args={[LARGO - 0.4, FONDO - 0.4]} />
        {riflessi ? (
          // marmo nero lucido che riflette davvero persone, LED e schermi
          <MeshReflectorMaterial map={marmo} resolution={1024} blur={[260, 80]} mixBlur={0.9} mixStrength={0.9} mixContrast={1} mirror={0.35} depthScale={0.4} minDepthThreshold={0.6} maxDepthThreshold={1.2} roughness={0.32} metalness={0} envMapIntensity={0.35} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        ) : (
          <meshStandardMaterial map={marmo} roughness={0.22} metalness={0} envMapIntensity={0.4} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        )}
      </mesh>
      {/* bordi bassi ai lati con la luce LED blu sul filo */}
      {[-1, 1].map((l) => (
        <group key={l}>
          <RoundedBox args={[0.36, 0.55, FONDO]} radius={0.12} smoothness={3} position={[l * (LARGO / 2 - 0.18), 0.27, 0]} material={bordo} castShadow receiveShadow />
          <Box p={[l * (LARGO / 2 - 0.37), 0.53, 0.2]} s={[0.04, 0.04, FONDO - 0.8]} m={matOttone()} ombra={false} />
          <Led da={[l * (LARGO / 2 - 0.37), -FONDO / 2 + 0.6]} a={[l * (LARGO / 2 - 0.37), FONDO / 2 - 0.4]} y={0.47} c="#ffcf7a" spessore={0.035} forza={2} />
        </group>
      ))}
      {/* muro di fondo con zoccolo e striscia viola in cima */}
      <RoundedBox args={[LARGO, 5.2, 0.4]} radius={0.15} smoothness={3} position={[0, 2.6, MURO_Z + 0.2]} material={mat("#efe8dc", 0.85)} castShadow receiveShadow />
      <Box p={[0, 0.16, FRONTE_MURO + 0.03]} s={[LARGO - 0.7, 0.32, 0.08]} m={mat("#2b2724", 0.35)} ombra={false} />
      <Box p={[0, 0.33, FRONTE_MURO + 0.08]} s={[LARGO - 0.7, 0.03, 0.03]} m={matOttone()} ombra={false} />
      <Box p={[0, 4.75, FRONTE_MURO + 0.05]} s={[LARGO - 0.7, 0.04, 0.05]} m={matOttone()} ombra={false} />
      {/* applique in ottone lungo il muro */}
      {[-6.0, 6.0, 12.6, 19.8].map((x) => <Applique key={x} x={x} />)}
      <Led da={[-LARGO / 2 + 0.4, FRONTE_MURO + 0.05]} a={[LARGO / 2 - 0.4, FRONTE_MURO + 0.05]} y={5.12} c="#7b5cff" spessore={0.07} forza={2.8} />
    </group>
  );
}

/** Pannello a doghe di legno dietro l'insegna, come negli studi di registrazione. */
function Doghe({ x0, x1 }: { x0: number; x1: number }) {
  const n = Math.round((x1 - x0) / 0.16);
  const legno = mat("#b98b5c", 0.55), scuro = mat("#2a2420", 0.9);
  return (
    <group position={[0, 0, FRONTE_MURO]}>
      <Box p={[(x0 + x1) / 2, 2.55, 0.02]} s={[x1 - x0 + 0.1, 4.3, 0.04]} m={scuro} ombra={false} />
      {Array.from({ length: n }, (_, i) => <Box key={i} p={[x0 + 0.08 + i * 0.16, 2.55, 0.08]} s={[0.09, 4.3, 0.08]} m={legno} ombra={false} />)}
      <Led da={[x0, 0.12]} a={[x1, 0.12]} y={0.42} c="#7b5cff" spessore={0.04} />
    </group>
  );
}

/** Insegna LED di Apex Media: il marchio estruso e la scritta, illuminati. */
export function InsegnaApex({ font }: { font: Font }) {
  const marchio = useMemo(() => {
    const forma = (p: [number, number][]) => { const s = new THREE.Shape(); s.moveTo(p[0][0], -p[0][1]); for (const q of p.slice(1)) s.lineTo(q[0], -q[1]); s.closePath(); return s; };
    const g = new THREE.ExtrudeGeometry([
      forma([[14, 0], [0, 26], [7.2, 26], [17.6, 6.6]]),
      forma([[18.9, 9.2], [28, 26], [20.9, 26], [15.2, 15.6]]),
      forma([[13.4, 14.2], [17.3, 21.4], [9.5, 21.4]]),
    ], { depth: 2.2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.3, bevelSegments: 2 });
    g.translate(-14, 13, 0);
    return g;
  }, []);
  const scritta = useMemo(() => tela(1024, 160, (x, w, h) => {
    x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `700 118px ${font.titoli}`;
    x.letterSpacing = "18px";
    x.fillStyle = "#ffffff";
    x.fillText("APEX MEDIA", w / 2 + 9, h / 2 + 4);
  }), [font]);
  useEffect(() => () => { marchio.dispose(); scritta.dispose(); }, [marchio, scritta]);
  const alone = useMemo(() => new THREE.MeshBasicMaterial({ map: scritta, transparent: true, color: new THREE.Color("#ffffff").multiplyScalar(2.2), toneMapped: false, depthWrite: false }), [scritta]);
  return (
    <group position={[0, 0, FRONTE_MURO + 0.14]}>
      <mesh geometry={marchio} material={matLed("#8b6dff", 2.6)} position={[0, 3.35, 0]} scale={0.1} />
      <mesh geometry={GEO.piano} material={alone} position={[0, 1.45, 0.02]} scale={[7.2, 1.125, 1]} />
    </group>
  );
}

/* ---------- Scrivanie e monitor ---------- */

/** Schermo vivo: per chi lavora (o ti aspetta) cambia due volte al secondo. */
function useSchermo(tipo: string, stato: StatoAgente, accento: string, fase: number): THREE.CanvasTexture {
  const vivo = stato === "lavora" || stato === "attesa";
  const viva = useMemo(() => (vivo ? nuovoSchermoVivo() : null), [vivo]);
  useEffect(() => () => viva?.dispose(), [viva]);
  useFrame(({ clock }) => {
    viva?.aggiorna(Math.floor(clock.elapsedTime * 2 + fase * 3.7), (x) => disegnaSchermoVivo(x, tipo, accento, Math.floor(clock.elapsedTime * 2 + fase * 3.7), stato === "attesa"));
  });
  return viva?.t ?? schermo(tipo, stato, accento);
}

function Monitor({ x, z, tipo, stato, accento, largo = 1.45, rot = 0 }: { x: number; z: number; tipo: string; stato: StatoAgente; accento: string; largo?: number; rot?: number }) {
  const map = useSchermo(tipo, stato, accento, x + z);
  const alto = largo * 0.6;
  return (
    <group position={[x, 0.78, z]} rotation={[0, rot, 0]} userData={{ dinamico: true }}>
      <Cil p={[0, 0.012, 0]} s={[0.4, 0.024, 0.27]} m={matMetallo("#b8bbc4")} />
      <Box p={[0, 0.2, 0.02]} s={[0.07, 0.38, 0.045]} m={matMetallo("#b8bbc4")} />
      <group position={[0, 0.42 + alto / 2, 0]} rotation={[-0.12, 0, 0]}>
        {/* luce LED dietro lo schermo, col colore di chi ci lavora */}
        <mesh geometry={GEO.box} material={matLed(accento, stato === "libero" ? 0.6 : 1.6)} position={[0, 0, -0.045]} scale={[largo + 0.08, alto + 0.08, 0.01]} />
        <RoundedBox args={[largo, alto, 0.05]} radius={0.02} smoothness={2} material={matLucido("#15171f")} castShadow />
        <mesh geometry={GEO.piano} position={[0, 0.005, 0.027]} scale={[largo - 0.06, alto - 0.06, 1]}>
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export type PostoScrivania = { x: number; tipo: string; stato: StatoAgente; accento: string };

/** Scrivania lunga: piano in rovere, gambe in metallo, pannello frontale, LED col colore del reparto. `z` è la fila delle sedie. */
export function Scrivania({ z, posti, led, larga }: { z: number; posti: PostoScrivania[]; led: string; larga?: boolean }) {
  const xs = posti.map((p) => p.x);
  const centro = (Math.min(...xs) + Math.max(...xs)) / 2;
  const largo = Math.max(...xs) - Math.min(...xs) + (larga ? 3.2 : 2.4);
  const zc = z - 0.9;
  const rovere = mat("#7a5236", 0.42), metallo = matOttone();
  return (
    <group>
      <RoundedBox args={[largo, 0.07, 1.05]} radius={0.03} smoothness={3} position={[centro, 0.75, zc]} material={rovere} castShadow receiveShadow />
      {[-1, 1].map((l) => (
        <group key={l} position={[centro + l * (largo / 2 - 0.12), 0, zc]}>
          <Box p={[0, 0.36, -0.42]} s={[0.05, 0.72, 0.05]} m={metallo} />
          <Box p={[0, 0.36, 0.42]} s={[0.05, 0.72, 0.05]} m={metallo} />
          <Box p={[0, 0.03, 0]} s={[0.06, 0.04, 0.9]} m={metallo} />
        </group>
      ))}
      <Box p={[centro, 0.47, zc - 0.48]} s={[largo - 0.3, 0.42, 0.03]} m={mat("#5e3f2a", 0.5)} />
      <Led da={[centro - largo / 2 + 0.2, zc + 0.5]} a={[centro + largo / 2 - 0.2, zc + 0.5]} y={0.69} c={led} spessore={0.035} forza={2.2} />
      {posti.map((p, i) => (
        <group key={i}>
          {larga ? (
            <>
              <Monitor x={p.x - 0.74} z={zc - 0.16} tipo={p.tipo} stato={p.stato} accento={p.accento} largo={1.3} rot={0.18} />
              <Monitor x={p.x + 0.74} z={zc - 0.16} tipo={p.tipo === "timeline" ? "reel" : p.tipo} stato={p.stato} accento={p.accento} largo={1.3} rot={-0.18} />
            </>
          ) : <Monitor x={p.x} z={zc - 0.16} tipo={p.tipo} stato={p.stato} accento={p.accento} />}
          <RoundedBox args={[0.52, 0.025, 0.17]} radius={0.01} smoothness={2} position={[p.x - 0.06, 0.795, zc + 0.26]} material={mat("#f7f7f9", 0.5)} />
          <Box p={[p.x + 0.38, 0.795, zc + 0.27]} s={[0.07, 0.025, 0.11]} m={mat("#f7f7f9", 0.5)} ombra={false} />
          {i % 3 === 0 ? <Cil p={[p.x + 0.78, 0.84, zc + 0.12]} s={[0.1, 0.12, 0.1]} m={mat(p.accento, 0.4)} /> : null}
          {i % 3 === 1 ? <Succulenta x={p.x - 0.82} y={0.785} z={zc - 0.05} /> : null}
          {i % 3 === 2 ? <Lampada x={p.x + 0.82} y={0.785} z={zc - 0.12} /> : null}
        </group>
      ))}
    </group>
  );
}

function Lampada({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <Cil p={[0, 0.012, 0]} s={[0.16, 0.024, 0.16]} m={mat("#1e2029", 0.4)} />
      <Box p={[0, 0.2, 0]} s={[0.022, 0.4, 0.022]} m={mat("#1e2029", 0.4)} />
      <mesh geometry={GEO.cono} material={mat("#1e2029", 0.4)} position={[-0.06, 0.4, 0.05]} rotation={[0.4, 0, 0.5]} scale={[0.17, 0.13, 0.17]} castShadow />
      <Sfera p={[-0.09, 0.36, 0.08]} s={0.045} m={matLed("#ffe6a8", 2)} ombra={false} />
    </group>
  );
}

/* ---------- Piante ---------- */

/** Piccola pianta grassa da scrivania. */
export function Succulenta({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <mesh geometry={GEO.vaso} material={mat("#f1ede6", 0.5)} position={[0, 0.06, 0]} scale={[0.15, 0.12, 0.15]} castShadow />
      {[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return <mesh key={i} geometry={GEO.foglia} material={mat(i % 2 ? "#5fae7a" : "#7cc093", 0.7)} position={[Math.sin(a) * 0.035, 0.16, Math.cos(a) * 0.035]} rotation={[Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6]} scale={[0.05, 0.12, 0.03]} />; })}
    </group>
  );
}

const VERDI = ["#2f7d4f", "#3a9160", "#4fa872", "#2a6e45"];

/** Monstera: foglie larghe su steli inclinati, vaso in terracotta. */
/** Monstera: modello 3D vero, con quella disegnata come riserva mentre carica. */
export function Monstera({ x, z, s = 1, vaso }: { x: number; z: number; s?: number; vaso?: string }) {
  return <Pianta3D tipo="media" x={x} z={z} altezza={1.7 * s} rot={z * 1.3} riserva={<group position={[-x, 0, -z]}><MonsteraDisegnata x={x} z={z} s={s} vaso={vaso} /></group>} />;
}

function MonsteraDisegnata({ x, z, s = 1, vaso = "#c8794e" }: { x: number; z: number; s?: number; vaso?: string }) {
  const foglie = useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + (i % 2) * 0.3, inclina = 0.55 + (i % 3) * 0.18, h = 0.75 + (i % 4) * 0.16;
    return { a, inclina, h, c: VERDI[i % VERDI.length] };
  }), []);
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh geometry={GEO.vaso} material={mat(vaso, 0.75)} position={[0, 0.26, 0]} scale={[0.62, 0.52, 0.62]} castShadow receiveShadow />
      <Cil p={[0, 0.53, 0]} s={[0.56, 0.02, 0.56]} m={mat("#4a3426", 0.95)} ombra={false} />
      {foglie.map((f, i) => (
        <group key={i} position={[0, 0.5, 0]} rotation={[0, f.a, 0]}>
          <group rotation={[f.inclina, 0, 0]}>
            <Box p={[0, f.h / 2, 0]} s={[0.025, f.h, 0.025]} m={mat("#3c7a4c", 0.8)} />
            <mesh geometry={GEO.foglia} material={mat(f.c, 0.6)} position={[0, f.h + 0.14, -0.05]} rotation={[-0.9, 0, 0]} scale={[0.46, 0.04, 0.38]} castShadow />
          </group>
        </group>
      ))}
    </group>
  );
}

/** Sansevieria: foglie dritte e appuntite, bordo chiaro. */
/** Sansevieria: modello 3D vero, con quella disegnata come riserva mentre carica. */
export function Sansevieria({ x, z, s = 1, vaso }: { x: number; z: number; s?: number; vaso?: string }) {
  return <Pianta3D tipo="anthurium" x={x} z={z} altezza={1.25 * s} rot={z * 1.3} riserva={<group position={[-x, 0, -z]}><SansevieriaDisegnata x={x} z={z} s={s} vaso={vaso} /></group>} />;
}

function SansevieriaDisegnata({ x, z, s = 1, vaso = "#2b2e3a" }: { x: number; z: number; s?: number; vaso?: string }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <Cil p={[0, 0.26, 0]} s={[0.48, 0.52, 0.48]} m={mat(vaso, 0.5)} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2, r = i % 2 ? 0.11 : 0.05, h = 0.9 + (i % 4) * 0.22;
        return (
          <group key={i} position={[Math.sin(a) * r, 0.5, Math.cos(a) * r]} rotation={[Math.cos(a) * 0.12, a, -Math.sin(a) * 0.12]}>
            <mesh geometry={GEO.cono} material={mat(i % 3 ? "#2f6b43" : "#3d7d50", 0.6)} position={[0, h / 2, 0]} scale={[0.12, h, 0.035]} castShadow />
            <mesh geometry={GEO.cono} material={mat("#c9d77a", 0.6)} position={[0, h / 2 - 0.02, 0]} scale={[0.135, h * 0.96, 0.02]} />
          </group>
        );
      })}
    </group>
  );
}

/** Ficus ad alberello: tronco, chioma a nuvole. */
/** Ficus: modello 3D vero, con quella disegnata come riserva mentre carica. */
export function Ficus({ x, z, s = 1, vaso }: { x: number; z: number; s?: number; vaso?: string }) {
  return <Pianta3D tipo="pachira" x={x} z={z} altezza={2.0 * s} rot={z * 1.3} riserva={<group position={[-x, 0, -z]}><FicusDisegnata x={x} z={z} s={s} vaso={vaso} /></group>} />;
}

function FicusDisegnata({ x, z, s = 1, vaso = "#f2eee7" }: { x: number; z: number; s?: number; vaso?: string }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh geometry={GEO.vaso} material={mat(vaso, 0.5)} position={[0, 0.3, 0]} scale={[0.6, 0.6, 0.6]} castShadow receiveShadow />
      <Cil p={[0, 1.0, 0]} s={[0.07, 1.1, 0.07]} m={mat("#7b5a3e", 0.9)} />
      {[[0, 1.95, 0, 0.75], [0.3, 1.7, 0.15, 0.55], [-0.28, 1.75, -0.1, 0.55], [0.05, 2.25, -0.18, 0.5], [-0.12, 1.6, 0.25, 0.45]].map(([a, b, c2, r], i) => (
        <Sfera key={i} p={[a, b, c2]} s={[r, r * 0.85, r]} m={mat(VERDI[i % VERDI.length], 0.75)} />
      ))}
    </group>
  );
}

/** Mensola a muro con una pianta ricadente. */
export function MensolaPothos({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, FRONTE_MURO + 0.2]}>
      <Box p={[0, 0, 0]} s={[1.4, 0.06, 0.4]} m={mat("#c8a274", 0.55)} />
      <mesh geometry={GEO.vaso} material={mat("#f1ede6", 0.5)} position={[-0.3, 0.16, 0]} scale={[0.26, 0.26, 0.26]} castShadow />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <Sfera key={i} p={[-0.3 + Math.sin(i * 1.3) * 0.12, 0.25 - i * 0.16, 0.08 + (i % 2) * 0.05]} s={[0.13, 0.09, 0.11]} m={mat(VERDI[i % 4], 0.7)} />)}
      {[0, 1, 2].map((i) => <Box key={`l${i}`} p={[0.22 + i * 0.13, 0.17, 0]} s={[0.09, 0.28 + (i % 2) * 0.06, 0.24]} m={mat(["#5b2eff", "#ffd84d", "#2f6bff"][i], 0.6)} />)}
    </group>
  );
}

/* ---------- Tappeti e scritte a terra ---------- */

export function Tappeto({ x, z, w, d, c, tondo }: { x: number; z: number; w: number; d: number; c: string; tondo?: boolean }) {
  return tondo
    ? <mesh geometry={GEO.cil} material={mat(c, 0.95)} position={[x, 0.012, z]} scale={[w, 0.024, w]} receiveShadow />
    : <RoundedBox args={[w, 0.024, d]} radius={0.011} smoothness={2} position={[x, 0.012, z]} material={mat(c, 0.95)} receiveShadow />;
}

export function ScrittaPavimento({ x, z, nome, sotto, font }: { x: number; z: number; nome: string; sotto: string; font: Font }) {
  const t = useMemo(() => tela(768, 96, (c) => {
    c.textBaseline = "top";
    c.fillStyle = "#e8d7b0";
    c.font = `700 34px ${font.titoli}`;
    c.letterSpacing = "5px";
    c.fillText(nome.toUpperCase(), 4, 6);
    c.fillStyle = "#9d927c";
    c.font = `500 24px ${font.testo}`;
    c.letterSpacing = "0px";
    c.fillText(sotto, 4, 56);
  }), [nome, sotto, font]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <mesh geometry={GEO.piano} rotation={[-Math.PI / 2, 0, 0]} position={[x + 3.2, 0.04, z]} scale={[6.4, 0.8, 1]}>
      <meshBasicMaterial map={t} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ---------- Muro: tabellone, lavagna, quadri ---------- */

export type Conteggi = { attesa: number; lavora: number; coda: number; liberi: number };

/* ---------- Schermo gigante sul muro ---------- */

type Slide = (c: CanvasRenderingContext2D, w: number, h: number, t: number, font: Font, n: Conteggi) => void;

function marchio(c: CanvasRenderingContext2D, x: number, y: number, s: number, colore: string) {
  c.fillStyle = colore;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x - 30 * s, y + 56 * s); c.lineTo(x - 14 * s, y + 56 * s); c.lineTo(x + 8 * s, y + 14 * s); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x + 11 * s, y + 20 * s); c.lineTo(x + 30 * s, y + 56 * s); c.lineTo(x + 15 * s, y + 56 * s); c.lineTo(x + 3 * s, y + 34 * s); c.closePath(); c.fill();
}

function titolo(c: CanvasRenderingContext2D, testo: string, x: number, y: number, px: number, font: Font, colore = "#ffffff") {
  c.fillStyle = colore; c.font = `700 ${px}px ${font.titoli}`; c.letterSpacing = "-1px"; c.fillText(testo, x, y); c.letterSpacing = "0px";
}
function riga(c: CanvasRenderingContext2D, testo: string, x: number, y: number, px: number, font: Font, colore = "#b9c0d8") {
  c.fillStyle = colore; c.font = `500 ${px}px ${font.testo}`; c.fillText(testo, x, y);
}
function sfondo(c: CanvasRenderingContext2D, w: number, h: number, a: string, b: string) {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, w, h);
}
const entra = (t: number) => Math.min(1, t / 0.8);

const SLIDE: Slide[] = [
  // 1. il marchio
  (c, w, h, t, f) => {
    sfondo(c, w, h, "#1a0f4d", "#5b2eff");
    for (let i = 0; i < 14; i++) { c.globalAlpha = 0.08; c.fillStyle = "#ffffff"; c.beginPath(); c.arc((i * 173 + t * 40) % (w + 200) - 100, 120 + ((i * 97) % 480), 40 + (i % 4) * 30, 0, 7); c.fill(); }
    c.globalAlpha = entra(t);
    marchio(c, w / 2, 120, 3, "#ffffff");
    c.textAlign = "center"; titolo(c, "APEX MEDIA", w / 2, 400, 110, f); riga(c, "Più clienti per le attività locali", w / 2, 470, 44, f, "#e2dcff"); c.textAlign = "left";
    c.globalAlpha = 1;
  },
  // 2. reel
  (c, w, h, t, f) => {
    sfondo(c, w, h, "#0f1220", "#26135f");
    const e = entra(t);
    c.globalAlpha = e; titolo(c, "Reel che portano", 90, 190, 76, f); titolo(c, "prenotazioni.", 90, 280, 76, f, "#a58bff");
    riga(c, "Gancio, script, montaggio e sottotitoli: tutto in casa.", 90, 350, 32, f);
    rett(c, 90, 400, 300, 74, 37, "#5b2eff"); c.fillStyle = "#fff"; c.font = `700 30px ${f.testo}`; c.fillText("Scrivici su WhatsApp", 120, 447); c.globalAlpha = 1;
    // telefono con il reel che scorre
    const px = 880, py = 60 + (1 - e) * 60;
    rett(c, px, py, 270, 520, 40, "#05060b"); rett(c, px + 12, py + 12, 246, 496, 30, "#ff7a2f");
    const g = c.createLinearGradient(0, py, 0, py + 500); g.addColorStop(0, "#ff7a2f"); g.addColorStop(1, "#5b2eff"); c.fillStyle = g; c.beginPath(); c.roundRect(px + 12, py + 12, 246, 496, 30); c.fill();
    c.fillStyle = "#fff"; c.font = `700 40px ${f.titoli}`; c.fillText(`${Math.floor(1200 + t * 3100).toLocaleString("it-IT")}`, px + 34, py + 420); riga(c, "visualizzazioni", px + 34, py + 460, 24, f, "#ffffffcc");
    rett(c, px + 34, py + 480, 200 * Math.min(1, t / 5), 8, 4, "#ffffff");
  },
  // 3. il team dal vivo
  (c, w, h, t, f, n) => {
    sfondo(c, w, h, "#12141d", "#1b2034");
    titolo(c, "Il team, adesso", 70, 110, 60, f); riga(c, "dati dal vivo dello studio", 70, 156, 28, f, "#8d95b0");
    const voci: [string, number, string][] = [["da guardare", n.attesa, "#ffd84d"], ["al lavoro", n.lavora, "#5b8cff"], ["in coda", n.coda, "#b9bfd0"], ["liberi", n.liberi, "#2fd08a"]];
    const cella = (w - 140) / 4;
    voci.forEach(([nome, valore, colore], i) => {
      const px = 70 + i * cella, y = 210 + (1 - entra(t - i * 0.15)) * 40;
      rett(c, px, y, cella - 24, 300, 30, "#1f2335");
      c.fillStyle = colore; c.beginPath(); c.arc(px + 44, y + 54, 13, 0, 7); c.fill();
      c.fillStyle = "#f3f4f8"; c.font = `700 130px ${f.titoli}`; c.fillText(String(valore), px + 34, y + 200);
      riga(c, nome, px + 36, y + 258, 34, f, "#9da3b6");
    });
  },
  // 4. campagne
  (c, w, h, t, f) => {
    sfondo(c, w, h, "#071a14", "#0f3b2c");
    titolo(c, "Campagne Google e Meta.", 70, 130, 64, f); titolo(c, "Ogni euro misurato.", 70, 205, 64, f, "#3ee08f");
    const v = [30, 42, 38, 55, 61, 58, 74, 82, 96, 110];
    v.forEach((val, i) => { const k = Math.max(0, Math.min(1, (t - i * 0.12) / 0.6)); rett(c, 90 + i * 104, 600 - val * 3 * k, 70, val * 3 * k, 10, i === v.length - 1 ? "#3ee08f" : "#1f5c46"); });
    rett(c, 760, 250, 400, 130, 24, "#0b2a20"); riga(c, "costo per contatto", 790, 300, 28, f, "#7fc7a8"); titolo(c, `${(9.8 - Math.min(t, 6) * 0.6).toFixed(2).replace(".", ",")} €`, 790, 360, 56, f);
  },
  // 5. siti e landing
  (c, w, h, t, f) => {
    sfondo(c, w, h, "#f6f3ee", "#e8e2ff");
    titolo(c, "Siti e landing", 70, 150, 76, f, "#16131f"); titolo(c, "che convertono.", 70, 240, 76, f, "#5b2eff");
    riga(c, "Una sola azione chiara: chiama, prenota, ordina.", 70, 300, 32, f, "#4b4660");
    const y = 340 + (1 - entra(t)) * 50;
    rett(c, 700, y - 260, 460, 470, 22, "#ffffff"); rett(c, 730, y - 220, 260, 26, 8, "#16131f"); rett(c, 730, y - 176, 380, 14, 7, "#c9c4d6"); rett(c, 730, y - 150, 320, 14, 7, "#c9c4d6");
    rett(c, 730, y - 100, 220 + Math.sin(t * 4) * 6, 56, 28, "#5b2eff"); c.fillStyle = "#fff"; c.font = `700 24px ${f.testo}`; c.fillText("Prenota ora", 770, y - 64);
    for (let i = 0; i < 3; i++) rett(c, 730 + i * 140, y, 120, 120, 14, "#efecf7");
  },
];
const DURATA = 7;

/** Schermo LED gigante: pubblicità di Apex Media a rotazione, con una slide sui numeri del team. */
export function SchermoGigante({ x, n, font }: { x: number; n: Conteggi; font: Font }) {
  const largo = 6.2, alto = largo * 9 / 16;
  const viva = useMemo(() => new TelaViva(1280, 720), []);
  useEffect(() => () => viva.dispose(), [viva]);
  const dati = useRef({ n, font });
  useEffect(() => { dati.current = { n, font }; }, [n, font]);
  useFrame(({ clock }) => {
    const tempo = clock.elapsedTime;
    viva.aggiorna(Math.floor(tempo * 8), (x) => {
      const i = Math.floor(tempo / DURATA) % SLIDE.length, t = tempo % DURATA;
      const w = 1280, h = 720, { font: f, n: conti } = dati.current;
      x.textBaseline = "alphabetic"; x.textAlign = "left";
      SLIDE[i](x, w, h, t, f, conti);
      // dissolvenza tra una slide e l'altra
      const buio = t < 0.35 ? 1 - t / 0.35 : t > DURATA - 0.35 ? (t - (DURATA - 0.35)) / 0.35 : 0;
      if (buio > 0) { x.globalAlpha = buio; x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.globalAlpha = 1; }
      // striscia in basso che scorre
      rett(x, 0, h - 54, w, 54, 0, "rgba(10,10,20,0.78)");
      x.fillStyle = "#ffffff"; x.font = `600 24px ${f.testo}`;
      const scritta = "APEX MEDIA  ·  infoapex.eu  ·  Social, reel, campagne e siti per le attività di Alessandria  ·  ";
      const lw = x.measureText(scritta).width, off = (tempo * 90) % lw;
      for (let k = -1; k < 3; k++) x.fillText(scritta, k * lw - off, h - 19);
      SLIDE.forEach((_, k) => rett(x, w - 40 - (SLIDE.length - k) * 22, 24, 14, 14, 7, k === i ? "#ffffff" : "rgba(255,255,255,0.35)"));
    });
  });
  return (
    <group position={[x, 2.95, FRONTE_MURO + 0.08]} userData={{ dinamico: true }}>
      <mesh geometry={GEO.box} material={matLed("#8b6dff", 2.4)} position={[0, 0, -0.03]} scale={[largo + 0.2, alto + 0.2, 0.02]} />
      <RoundedBox args={[largo + 0.1, alto + 0.1, 0.1]} radius={0.04} smoothness={2} material={matLucido("#0b0c12")} castShadow />
      <mesh geometry={GEO.piano} position={[0, 0, 0.056]} scale={[largo, alto, 1]}><meshBasicMaterial map={viva.t} toneMapped={false} /></mesh>
    </group>
  );
}

export function Tabellone({ x, n, font }: { x: number; n: Conteggi; font: Font }) {
  const larghezza = 4.6;
  const t = useMemo(() => tela(1280, 300, (c, w, h) => {
    rett(c, 0, 0, w, h, 34, "#14161f");
    const voci: [string, number, string][] = [["da guardare", n.attesa, "#ffd84d"], ["al lavoro", n.lavora, "#5b8cff"], ["in coda", n.coda, "#b9bfd0"], ["liberi", n.liberi, "#2fd08a"]];
    const cella = (w - 80) / 4;
    voci.forEach(([nome, valore, colore], i) => {
      const px = 40 + i * cella;
      rett(c, px + 8, 44, cella - 16, h - 88, 28, "#1f2230");
      c.fillStyle = colore; c.beginPath(); c.arc(px + 52, 110, 13, 0, 7); c.fill();
      c.fillStyle = "#f3f4f8"; c.font = `700 110px ${font.titoli}`;
      c.fillText(String(valore), px + 82, 150);
      c.fillStyle = "#9da3b6"; c.font = `600 38px ${font.testo}`;
      c.fillText(nome, px + 40, 216);
    });
  }), [n.attesa, n.lavora, n.coda, n.liberi, font]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <group position={[x, 2.6, FRONTE_MURO + 0.06]}>
      <RoundedBox args={[larghezza, larghezza * 0.244, 0.1]} radius={0.05} smoothness={3} material={matLucido("#14161f")} castShadow />
      <mesh geometry={GEO.piano} position={[0, 0, 0.055]} scale={[larghezza - 0.15, larghezza * 0.244 - 0.09, 1]}><meshBasicMaterial map={t} toneMapped={false} /></mesh>
    </group>
  );
}

export function Lavagna({ x }: { x: number }) {
  const colori = ["#ffe28a", "#ffb3c7", "#b9d2ff", "#bff0cf", "#ffe28a", "#d8c7ff", "#ffd0a8", "#b9d2ff", "#ffe28a", "#bff0cf", "#ffb3c7", "#d8c7ff"];
  return (
    <group position={[x, 2.4, FRONTE_MURO + 0.05]}>
      <RoundedBox args={[4.1, 2.0, 0.08]} radius={0.035} smoothness={2} material={mat(C.bianco, 0.4)} castShadow />
      <Box p={[0, -1.04, 0.07]} s={[4.1, 0.06, 0.14]} m={matMetallo()} ombra={false} />
      {colori.map((c, i) => <Box key={i} p={[-1.5 + (i % 6) * 0.6, 0.42 - Math.floor(i / 6) * 0.72, 0.05]} s={[0.46, 0.46, 0.02]} r={[0, 0, ((i * 37) % 9 - 4) * 0.012]} m={mat(c, 0.9)} ombra={false} />)}
    </group>
  );
}

export function Quadro({ x, c, largo = 1.15, y = 2.6 }: { x: number; c: string; largo?: number; y?: number }) {
  return (
    <group position={[x, y, FRONTE_MURO + 0.04]}>
      <RoundedBox args={[largo, 1.45, 0.07]} radius={0.03} smoothness={2} material={mat(C.ink, 0.5)} castShadow />
      <Box p={[0, 0, 0.04]} s={[largo - 0.14, 1.31, 0.01]} m={mat(C.bianco, 0.9)} ombra={false} />
      <Box p={[0, 0.12, 0.05]} s={[largo - 0.4, 0.7, 0.01]} m={mat(c, 0.8)} ombra={false} />
      <Box p={[-0.1, -0.42, 0.05]} s={[largo - 0.6, 0.08, 0.01]} m={mat(C.grigio, 0.9)} ombra={false} />
    </group>
  );
}

/* ---------- Muro: insieme completo ---------- */

export function Muro({ font, n }: { font: Font; n: Conteggi }) {
  return (
    <group>
      <Doghe x0={-6.8} x1={6.8} />
      <InsegnaApex font={font} />
      <SchermoGigante x={10.3} n={n} font={font} />
      <MensolaPothos x={21} y={3.6} />
    </group>
  );
}

/** Applique: braccio in ottone e luce calda verso l'alto. */
function Applique({ x }: { x: number }) {
  return (
    <group position={[x, 3.3, FRONTE_MURO + 0.05]}>
      <Box p={[0, 0, 0.02]} s={[0.12, 0.3, 0.04]} m={matOttone()} ombra={false} />
      <Cil p={[0, 0.12, 0.16]} s={[0.22, 0.2, 0.22]} m={matOttone()} ombra={false} />
      <Cil p={[0, 0.23, 0.16]} s={[0.17, 0.02, 0.17]} m={matLed("#ffd9a0", 2.2)} ombra={false} />
    </group>
  );
}

/* ---------- Cervello condiviso ---------- */

export function Cervello({ x, z, attivo, onClick, children }: { x: number; z: number; attivo: boolean; onClick: () => void; children?: React.ReactNode }) {
  const palla = useRef<THREE.Group>(null);
  const { nodi, archi } = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(0.78, 1);
    const visti = new Map<string, THREE.Vector3>();
    const pos = ico.getAttribute("position");
    for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); visti.set(`${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`, v); }
    return { nodi: [...visti.values()], archi: new THREE.EdgesGeometry(ico, 1) };
  }, []);
  useEffect(() => () => archi.dispose(), [archi]);
  useFrame((s, dt) => { if (palla.current) { palla.current.rotation.y += dt * 0.35; palla.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.15; palla.current.position.y = 2.2 + Math.sin(s.clock.elapsedTime * 1.2) * 0.06; } });
  return (
    <group position={[x, 0, z]}>
      <Tappeto x={0} z={0} w={3.1} d={3.1} c="#e6e1fb" tondo />
      <Cil p={[0, 0.6, 0]} s={[1.0, 1.2, 1.0]} m={mat(C.bianco, 0.35)} />
      <Cil p={[0, 1.22, 0]} s={[1.12, 0.06, 1.12]} m={matMetallo()} />
      <mesh geometry={GEO.toro} material={matLed("#7b5cff", 2.6)} position={[0, 1.255, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.1, 1.1, 0.25]} />
      <group ref={palla} position={[0, 2.2, 0]} userData={{ dinamico: true }}>
        <lineSegments geometry={archi}><lineBasicMaterial color={attivo ? "#9b85ff" : "#8f9dff"} transparent opacity={0.85} toneMapped={false} /></lineSegments>
        <mesh geometry={GEO.sfera} material={matLuce("#8f7bff", 0.14)} scale={1.25} />
        {nodi.map((v, i) => <mesh key={i} geometry={GEO.sfera} material={matLed(i % 5 === 0 ? "#8b6dff" : "#5b8cff", 1.8)} position={v} scale={0.085} />)}
      </group>
      <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 1.5, 0]} scale={[2.2, 3.2, 2.2]} {...cliccabile(onClick)} />
      {children}
    </group>
  );
}

/* ---------- Studio video ---------- */

export function StudioVideo({ x, z }: { x: number; z: number }) {
  const anello = useRef<THREE.Mesh>(null);
  const luceAnello = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.2, 2.2), toneMapped: false }), []);
  useEffect(() => () => luceAnello.dispose(), [luceAnello]);
  useFrame((s) => { luceAnello.color.setScalar(2.2 + Math.sin(s.clock.elapsedTime * 2) * 0.15); });
  return (
    <group position={[x, 0, z]}>
      <Tappeto x={0.4} z={1.2} w={5.4} d={4.2} c="#2a2d38" />
      {/* fondale bianco: telo verticale e foglio steso a terra */}
      <Box p={[0.4, 1.1, -1.15]} s={[3.4, 2.2, 0.04]} m={mat("#f7f7fa", 0.9)} riceve />
      <Box p={[0.4, 0.03, -0.2]} s={[3.4, 0.02, 1.9]} m={mat("#f7f7fa", 0.9)} ombra={false} riceve />
      {[-1.4, 2.2].map((l) => <Box key={l} p={[l, 1.2, -1.2]} s={[0.05, 2.4, 0.05]} m={matMetallo("#2a2d38")} />)}
      <Box p={[0.4, 2.38, -1.2]} s={[3.8, 0.05, 0.05]} m={matMetallo("#2a2d38")} />
      {/* luce ad anello e treppiede */}
      <group position={[-0.9, 0, 1.6]}>
        <Cil p={[0, 0.8, 0]} s={[0.03, 1.6, 0.03]} m={matMetallo("#2a2d38")} />
        {[0, 1, 2].map((i) => <Box key={i} p={[Math.sin(i * 2.1) * 0.25, 0.1, Math.cos(i * 2.1) * 0.25]} r={[Math.cos(i * 2.1) * 0.6, 0, -Math.sin(i * 2.1) * 0.6]} s={[0.025, 0.5, 0.025]} m={matMetallo("#2a2d38")} />)}
        <mesh ref={anello} geometry={GEO.toro} material={luceAnello} position={[0, 1.75, 0]} rotation={[0, -0.4, 0]} scale={[0.55, 0.55, 0.6]} />
      </group>
      {/* telecamera sul cavalletto */}
      <group position={[1.4, 0, 2.2]} rotation={[0, 0.25, 0]}>
        {[0, 1, 2].map((i) => <Box key={i} p={[Math.sin(i * 2.1) * 0.22, 0.55, Math.cos(i * 2.1) * 0.22]} r={[Math.cos(i * 2.1) * 0.35, 0, -Math.sin(i * 2.1) * 0.35]} s={[0.03, 1.15, 0.03]} m={matMetallo("#2a2d38")} />)}
        <RoundedBox args={[0.32, 0.26, 0.46]} radius={0.04} smoothness={2} position={[0, 1.22, 0]} material={mat("#1b1d26", 0.4)} castShadow />
        <Cil p={[0, 1.22, -0.33]} r={[Math.PI / 2, 0, 0]} s={[0.2, 0.22, 0.2]} m={matLucido("#111318")} />
        <Sfera p={[0.12, 1.37, 0.12]} s={0.04} m={matLed("#ff3b3b", 2.5)} ombra={false} />
      </group>
      {/* softbox */}
      <group position={[2.6, 0, 0.6]} rotation={[0, -0.7, 0]}>
        <Cil p={[0, 0.9, 0]} s={[0.03, 1.8, 0.03]} m={matMetallo("#2a2d38")} />
        <Box p={[0, 1.95, 0]} s={[0.9, 0.9, 0.35]} m={mat("#22242e", 0.6)} />
        <Box p={[0, 1.95, -0.18]} s={[0.82, 0.82, 0.02]} m={matLed("#fff6e6", 1.6)} ombra={false} />
      </group>
      {/* insegna REC */}
      <group position={[0.4, 2.0, -1.1]}>
        <RoundedBox args={[0.9, 0.34, 0.06]} radius={0.05} smoothness={2} material={mat("#1b1d26", 0.5)} />
        <Sfera p={[-0.25, 0, 0.05]} s={0.1} m={matLed("#ff4040", 2.8)} ombra={false} />
        <Box p={[0.12, 0, 0.04]} s={[0.36, 0.08, 0.02]} m={matLed("#ff4040", 2.4)} ombra={false} />
      </group>
    </group>
  );
}

/* ---------- Schermo delle campagne ---------- */

export type DatiAds = { spesa: number; contatti: number; mese: string; righe: { nome: string; colore: string; contatti: number }[] };

export function SchermoAds({ x, z, dati, font }: { x: number; z: number; dati: DatiAds; font: Font }) {
  const t = useMemo(() => tela(900, 520, (c, w, h) => {
    rett(c, 0, 0, w, h, 26, "#0f1424");
    c.fillStyle = "#8ea4ff"; c.font = `600 30px ${font.testo}`; c.letterSpacing = "3px";
    c.fillText(`CAMPAGNE · ${dati.mese.toUpperCase()}`, 40, 64);
    c.letterSpacing = "0px";
    c.fillStyle = "#ffffff"; c.font = `700 92px ${font.titoli}`;
    c.fillText(String(dati.contatti), 40, 168);
    c.fillStyle = "#9aa6c8"; c.font = `500 28px ${font.testo}`;
    c.fillText(`contatti · ${Math.round(dati.spesa)} € spesi`, 40, 210);
    const max = Math.max(1, ...dati.righe.map((r) => r.contatti));
    dati.righe.slice(0, 4).forEach((r, i) => {
      const y = 262 + i * 60;
      c.fillStyle = "#c7cde0"; c.font = `600 26px ${font.testo}`;
      c.fillText(r.nome.length > 18 ? r.nome.slice(0, 17) + "…" : r.nome, 40, y + 28);
      rett(c, 330, y + 6, w - 380, 28, 14, "#1d2540");
      rett(c, 330, y + 6, Math.max(28, ((w - 380) * r.contatti) / max), 28, 14, r.colore);
    });
    if (!dati.righe.length) { c.fillStyle = "#7f8aa8"; c.font = `500 28px ${font.testo}`; c.fillText("Nessun numero ancora questo mese", 40, 300); }
  }), [dati, font]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <group position={[x, 0, z]} rotation={[0, -0.35, 0]}>
      <Box p={[0, 0.04, 0]} s={[1.2, 0.08, 0.7]} m={matMetallo("#2a2d38")} />
      <Box p={[0, 0.8, 0]} s={[0.08, 1.5, 0.08]} m={matMetallo("#2a2d38")} />
      <RoundedBox args={[2.8, 1.65, 0.08]} radius={0.04} smoothness={2} position={[0, 2.1, 0]} material={matLucido("#10131c")} castShadow />
      <mesh geometry={GEO.piano} position={[0, 2.1, 0.045]} scale={[2.68, 1.55, 1]}><meshBasicMaterial map={t} toneMapped={false} /></mesh>
    </group>
  );
}

/* ---------- Area relax ---------- */

function Divano({ x, z, c, w = 4.8 }: { x: number; z: number; c: string; w?: number }) {
  const m = mat(c, 0.95);
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[w, 0.42, 1.2]} radius={0.15} smoothness={3} position={[0, 0.27, 0.1]} material={m} castShadow receiveShadow />
      <RoundedBox args={[w, 0.95, 0.38]} radius={0.16} smoothness={3} position={[0, 0.62, -0.42]} material={m} castShadow />
      <RoundedBox args={[0.42, 0.72, 1.2]} radius={0.16} smoothness={3} position={[-w / 2, 0.42, 0.1]} material={m} castShadow />
      <RoundedBox args={[0.42, 0.72, 1.2]} radius={0.16} smoothness={3} position={[w / 2, 0.42, 0.1]} material={m} castShadow />
      {[-1.6, 0, 1.6].map((px) => <RoundedBox key={px} args={[1.45, 0.14, 1.0]} radius={0.06} smoothness={2} position={[px, 0.52, 0.12]} material={mat(c, 0.95)} castShadow />)}
      <RoundedBox args={[0.7, 0.5, 0.2]} radius={0.09} smoothness={3} position={[-1.7, 0.78, -0.14]} rotation={[-0.25, 0, 0.08]} material={mat("#ffd84d", 0.95)} castShadow />
      <RoundedBox args={[0.6, 0.45, 0.2]} radius={0.09} smoothness={3} position={[1.75, 0.76, -0.14]} rotation={[-0.25, 0, -0.1]} material={mat("#f4f1ff", 0.95)} castShadow />
      {[-1, 1].map((l) => <Box key={l} p={[l * (w / 2 - 0.2), 0.03, 0.55]} s={[0.06, 0.06, 0.06]} m={matMetallo("#2a2d38")} />)}
    </group>
  );
}

export function Relax() {
  return (
    <group>
      <Tappeto x={-16.4} z={4.6} w={12.6} d={7.6} c="#e6e9fb" />
      <Tappeto x={-17.6} z={4.9} w={6.2} d={3.2} c="#d3d9f7" />
      <Divano x={-17.6} z={3.0} c="#6c5ce7" />
      {/* mobile basso dietro il divano, con libri e piante */}
      <group position={[-17.6, 0, 1.95]}>
        <RoundedBox args={[5.4, 0.7, 0.45]} radius={0.04} smoothness={2} position={[0, 0.35, 0]} material={mat("#f3eee6", 0.6)} castShadow receiveShadow />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Box key={i} p={[-2.2 + i * 0.12, 0.88, 0]} s={[0.09, 0.32 + (i % 3) * 0.06, 0.3]} m={mat(["#5b2eff", "#ffd84d", "#2f6bff", "#f4f1ff", "#17b26a", "#ff8a3d", "#20232e"][i], 0.6)} />)}
        <Succulenta x={1.2} y={0.7} z={0} />
        <Succulenta x={2.1} y={0.7} z={0.05} />
        <Lampada x={0.4} y={0.7} z={0} />
      </group>
      {/* poltrona */}
      <group position={[-12.3, 0, 7.4]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[1.2, 0.4, 1.1]} radius={0.14} smoothness={3} position={[0, 0.3, 0]} material={mat("#ffb347", 0.95)} castShadow />
        <RoundedBox args={[1.2, 0.8, 0.3]} radius={0.14} smoothness={3} position={[0, 0.65, 0.42]} material={mat("#ffb347", 0.95)} castShadow />
      </group>
      {/* bancone del caffè lungo il lato sinistro */}
      <group position={[-22.25, 0, 3.0]}>
        <RoundedBox args={[0.95, 0.95, 4.6]} radius={0.05} smoothness={2} position={[0, 0.47, 0]} material={mat("#f6f3ee", 0.6)} castShadow receiveShadow />
        <RoundedBox args={[1.05, 0.07, 4.7]} radius={0.03} smoothness={2} position={[0, 0.98, 0]} material={mat("#3b3d47", 0.25, 0.2)} castShadow />
        <Led da={[0.53, -2.3]} a={[0.53, 2.3]} y={0.9} c="#ffb347" spessore={0.04} forza={2} />
        <RoundedBox args={[0.55, 0.66, 0.55]} radius={0.06} smoothness={2} position={[0, 1.34, -0.4]} material={matMetallo("#cfd2d9")} castShadow />
        <Box p={[0.22, 1.16, -0.4]} s={[0.2, 0.04, 0.3]} m={mat("#2a2d38", 0.4)} ombra={false} />
        <Sfera p={[0.29, 1.52, -0.25]} s={0.05} m={matLed("#40ff8a", 2.5)} ombra={false} />
        {[0, 1, 2].map((i) => <Cil key={i} p={[0.05, 1.07 + i * 0.03, 0.9 - i * 0.02]} s={[0.13, 0.13, 0.13]} m={mat(C.bianco, 0.3)} />)}
        <Cil p={[0, 1.1, 1.6]} s={[0.22, 0.22, 0.22]} m={mat("#ffd84d", 0.5)} />
        <Sfera p={[0.05, 1.18, -1.6]} s={[0.36, 0.2, 0.36]} m={mat("#ff8a3d", 0.6)} />
        <Sfera p={[0.15, 1.2, -1.45]} s={0.15} m={mat("#ffd84d", 0.6)} />
      </group>
      {/* ping pong */}
      <group position={[-12.3, 0, 5.3]}>
        <RoundedBox args={[2.9, 0.08, 1.6]} radius={0.03} smoothness={2} position={[0, 0.78, 0]} material={mat("#2b4fd6", 0.5)} castShadow receiveShadow />
        <Box p={[0, 0.825, 0]} s={[2.9, 0.005, 0.04]} m={mat(C.bianco, 0.6)} ombra={false} />
        <Box p={[0, 0.9, 0]} s={[0.03, 0.16, 1.7]} m={mat(C.bianco, 0.8)} />
        {[[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].map(([a, b], i) => <Box key={i} p={[a, 0.39, b]} s={[0.07, 0.78, 0.07]} m={matMetallo("#2a2d38")} />)}
        <Pallina />
      </group>
      <Monstera x={-22} z={8.0} s={1.1} />
      <Ficus x={-10.2} z={2.0} s={0.95} />
      {/* lampada ad arco */}
      <group position={[-14.4, 0, 2.6]}>
        <Cil p={[0, 0.04, 0]} s={[0.5, 0.08, 0.5]} m={mat("#e9e6df", 0.3)} />
        <Cil p={[0, 1.2, 0]} s={[0.04, 2.4, 0.04]} m={matMetallo("#2a2d38")} />
        <mesh geometry={GEO.sfera} material={mat("#f4f1ea", 0.4)} position={[-0.6, 2.3, 0.5]} scale={[0.6, 0.35, 0.6]} castShadow />
        <Sfera p={[-0.6, 2.15, 0.5]} s={0.12} m={matLed("#ffe6b0", 2.2)} ombra={false} />
      </group>
    </group>
  );
}

/** Pallina da ping pong che rimbalza da un lato all'altro. */
function Pallina() {
  const p = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!p.current) return;
    const t = (s.clock.elapsedTime * 0.7) % 2, k = t < 1 ? t : 2 - t;
    p.current.position.set(-1.25 + k * 2.5, 0.85 + Math.abs(Math.sin(k * Math.PI * 2)) * 0.35, Math.sin(s.clock.elapsedTime) * 0.3);
  });
  return <mesh ref={p} geometry={GEO.sfera} material={mat("#ffffff", 0.3)} scale={0.07} userData={{ dinamico: true }} />;
}

/* ---------- La tua scrivania ---------- */

export function TuaScrivania({ x, z, nome, accesa, font, onClick }: { x: number; z: number; nome: string; accesa: boolean; font: Font; onClick: () => void }) {
  const targa = useMemo(() => tela(512, 128, (c, w, h) => {
    rett(c, 0, 0, w, h, 20, "#1a1c27");
    c.fillStyle = "#ffffff"; c.font = `700 64px ${font.titoli}`; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(nome, w / 2, h / 2 + 4);
  }), [nome, font]);
  useEffect(() => () => targa.dispose(), [targa]);
  const faro = useRef<THREE.Mesh>(null);
  useFrame((s) => { if (faro.current) faro.current.scale.setScalar(accesa ? 0.11 + Math.sin(s.clock.elapsedTime * 4) * 0.02 : 0.09); });
  return (
    <group position={[x, 0, z]}>
      <Tappeto x={0} z={1.0} w={7.6} d={7.6} c="#efe5d2" tondo />
      {/* scrivania rivolta verso di te, sedia dietro */}
      <RoundedBox args={[3.6, 0.09, 1.3]} radius={0.04} smoothness={3} position={[0, 0.76, 0]} material={mat("#2b2724", 0.45)} castShadow receiveShadow />
      <RoundedBox args={[3.4, 0.68, 0.06]} radius={0.02} smoothness={2} position={[0, 0.4, 0.6]} material={mat("#3a3430", 0.5)} castShadow />
      {[-1.65, 1.65].map((l) => <Box key={l} p={[l, 0.38, 0]} s={[0.08, 0.76, 1.2]} m={mat("#3a3430", 0.5)} />)}
      <Led da={[-1.65, 0.64]} a={[1.65, 0.64]} y={0.08} c="#7b5cff" spessore={0.04} />
      <mesh position={[0, 0.4, 0.635]}>
        <planeGeometry args={[1.5, 0.375]} />
        <meshBasicMaterial map={targa} toneMapped={false} />
      </mesh>
      {/* portatile con il logo verso di te */}
      <group position={[0, 0.81, -0.05]}>
        <Box p={[0, 0, 0]} s={[0.78, 0.025, 0.52]} m={matMetallo("#c7cad2")} />
        <Box p={[0, 0.25, -0.24]} r={[-0.2, 0, 0]} s={[0.78, 0.5, 0.02]} m={matMetallo("#c7cad2")} />
        <Sfera p={[0, 0.26, -0.215]} s={[0.09, 0.09, 0.01]} m={matLed("#8b6dff", 2)} ombra={false} />
      </group>
      <Succulenta x={-1.3} y={0.805} z={0.1} />
      <Cil p={[1.25, 0.86, 0.2]} s={[0.12, 0.14, 0.12]} m={mat(C.viola, 0.4)} />
      {/* luce che lampeggia quando qualcuno ti aspetta */}
      <Cil p={[1.5, 0.84, -0.3]} s={[0.14, 0.06, 0.14]} m={mat("#1e2029", 0.4)} />
      <mesh ref={faro} userData={{ dinamico: true }} geometry={GEO.sfera} material={accesa ? matLed("#ffc93d", 3) : mat("#8a8d98", 0.4)} position={[1.5, 0.93, -0.3]} scale={0.09} />
      {/* sedia direzionale */}
      <group position={[0, 0, -1.05]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[0.7, 0.14, 0.66]} radius={0.05} smoothness={2} position={[0, 0.52, 0]} material={mat("#1f2029", 0.7)} castShadow />
        <RoundedBox args={[0.68, 1.05, 0.14]} radius={0.06} smoothness={2} position={[0, 1.08, 0.34]} rotation={[0.1, 0, 0]} material={mat("#1f2029", 0.7)} castShadow />
        <Cil p={[0, 0.27, 0]} s={[0.07, 0.4, 0.07]} m={matMetallo()} />
        <Cil p={[0, 0.04, 0]} s={[0.7, 0.04, 0.7]} m={matMetallo()} />
      </group>
      <Sansevieria x={-3.2} z={-1.1} s={1.05} />
      <Monstera x={3.3} z={-1.1} s={0.9} vaso="#2b2e3a" />
      <mesh geometry={GEO.box} material={MAT_INVISIBILE} position={[0, 0.9, 0]} scale={[3.8, 1.8, 2.4]} {...cliccabile(onClick)} />
    </group>
  );
}

/* ---------- Reparto di un cliente ---------- */

export type ContiCliente = { daFare: number; inCorso: number; daGuardare: number; fatti: number; scaduti: number };

export function RepartoCliente({ x, z, nome, colore, conti, quota, font, onClick }: { x: number; z: number; nome: string; colore: string; conti: ContiCliente; quota: string; font: Font; onClick: () => void }) {
  const insegna = useMemo(() => tela(640, 200, (c, w, h) => {
    rett(c, 0, 0, w, h, 28, "#ffffff");
    rett(c, 0, 0, 22, h, 0, colore);
    c.fillStyle = "#14161f"; c.font = `700 ${nome.length > 18 ? 50 : 60}px ${font.titoli}`; c.textBaseline = "middle";
    c.fillText(nome.length > 22 ? nome.slice(0, 21) + "…" : nome, 54, 78);
    c.fillStyle = "#6b7080"; c.font = `600 34px ${font.testo}`;
    c.fillText(quota, 54, 148);
  }), [nome, colore, quota, font]);
  const bacheca = useMemo(() => tela(640, 420, (c, w) => {
    rett(c, 0, 0, w, 420, 26, "#14161f");
    c.fillStyle = "#9da3b6"; c.font = `600 28px ${font.testo}`; c.letterSpacing = "3px";
    c.fillText("DA FARE QUESTO MESE", 34, 58);
    c.letterSpacing = "0px";
    const voci: [string, number, string][] = [["in coda", conti.daFare, "#b9bfd0"], ["al lavoro", conti.inCorso, "#5b8cff"], ["da guardare", conti.daGuardare, "#ffd84d"], ["fatti", conti.fatti, "#2fd08a"]];
    voci.forEach(([n, v, col], i) => {
      const px = 34 + (i % 2) * 296, py = 92 + Math.floor(i / 2) * 150;
      rett(c, px, py, 276, 132, 20, "#1f2230");
      c.fillStyle = col; c.beginPath(); c.arc(px + 30, py + 36, 10, 0, 7); c.fill();
      c.fillStyle = "#ffffff"; c.font = `700 72px ${font.titoli}`; c.fillText(String(v), px + 52, py + 96);
      c.fillStyle = "#9da3b6"; c.font = `600 26px ${font.testo}`; c.fillText(n, px + 150, py + 92);
    });
    if (conti.scaduti) { rett(c, w - 210, 24, 180, 46, 23, "#e5484d"); c.fillStyle = "#fff"; c.font = `700 26px ${font.testo}`; c.fillText(`${conti.scaduti} in ritardo`, w - 192, 56); }
  }), [conti, font]);
  useEffect(() => () => { insegna.dispose(); bacheca.dispose(); }, [insegna, bacheca]);
  const tinta = useMemo(() => "#" + new THREE.Color(colore).lerp(new THREE.Color("#f6f1e8"), 0.86).getHexString(), [colore]);
  return (
    <group position={[x, 0, z]}>
      <Tappeto x={0} z={0.4} w={6.6} d={5.8} c={tinta} />
      <Led da={[-3.25, 3.25]} a={[3.25, 3.25]} y={0.04} c={colore} spessore={0.045} forza={2.2} />
      {/* tavolo tondo */}
      <Cil p={[0, 0.74, 0.2]} s={[2.1, 0.07, 2.1]} m={mat("#efe2c8", 0.45)} />
      <Cil p={[0, 0.37, 0.2]} s={[0.16, 0.72, 0.16]} m={matMetallo()} />
      <Cil p={[0, 0.02, 0.2]} s={[0.9, 0.04, 0.9]} m={matMetallo()} />
      <Succulenta x={0.35} y={0.775} z={0.35} />
      <Box p={[-0.35, 0.79, 0.4]} s={[0.36, 0.02, 0.26]} r={[0, 0.3, 0]} m={mat(colore, 0.5)} ombra={false} />
      {/* insegna sul totem e bacheca dei lavori */}
      <group position={[-1.9, 0, -2.0]} rotation={[0, 0.25, 0]}>
        <Box p={[0, 0.8, 0]} s={[0.08, 1.6, 0.08]} m={matMetallo("#2a2d38")} />
        <Box p={[0, 0.03, 0]} s={[0.7, 0.06, 0.5]} m={matMetallo("#2a2d38")} />
        <RoundedBox args={[2.0, 0.66, 0.06]} radius={0.04} smoothness={2} position={[0, 1.75, 0]} material={mat("#ffffff", 0.5)} castShadow />
        <mesh geometry={GEO.piano} position={[0, 1.75, 0.035]} scale={[1.96, 0.61, 1]}><meshBasicMaterial map={insegna} toneMapped={false} /></mesh>
      </group>
      <group position={[1.75, 0, -2.0]} rotation={[0, -0.25, 0]}>
        {[-0.7, 0.7].map((l) => <Box key={l} p={[l, 0.75, 0]} s={[0.05, 1.5, 0.05]} m={matMetallo("#2a2d38")} />)}
        <RoundedBox args={[1.9, 1.25, 0.06]} radius={0.04} smoothness={2} position={[0, 1.55, 0]} material={matLucido("#14161f")} castShadow />
        <mesh geometry={GEO.piano} position={[0, 1.55, 0.035]} scale={[1.84, 1.2, 1]}><meshBasicMaterial map={bacheca} toneMapped={false} /></mesh>
      </group>
      <Sansevieria x={-2.9} z={2.6} s={0.8} vaso="#f2eee7" />
      <mesh geometry={GEO.box} material={MAT_INVISIBILE} position={[0, 1.2, 0.2]} scale={[6.4, 2.4, 5.6]} {...cliccabile(onClick)} />
    </group>
  );
}

/** Parete di vetro tra due reparti clienti. */
export function Vetro({ x, z, lungo }: { x: number; z: number; lungo: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={GEO.box} material={MAT_VETRO} position={[0, 1.15, 0]} scale={[0.04, 2.2, lungo]} />
      <Box p={[0, 2.27, 0]} s={[0.06, 0.05, lungo]} m={matMetallo("#2a2d38")} ombra={false} />
      <Box p={[0, 0.03, 0]} s={[0.07, 0.06, lungo]} m={matMetallo("#2a2d38")} ombra={false} />
    </group>
  );
}

/* ---------- Cassa ---------- */

export type DatiCassa = { incassato: number; obiettivo: number; ricorrente: number; mese: string };

function Pila({ x, z, monete, ritardo }: { x: number; z: number; monete: number; ritardo: number }) {
  const g = useRef<THREE.Group>(null);
  const nata = useRef<number | null>(null);
  useFrame((s) => {
    if (!g.current) return;
    if (nata.current === null) nata.current = s.clock.elapsedTime + ritardo;
    const t = Math.max(0, s.clock.elapsedTime - nata.current);
    const k = Math.min(1, t / 0.55);
    g.current.position.y = (1 - (1 - Math.pow(1 - k, 3))) * 2.4 + (k >= 1 ? Math.max(0, Math.sin((t - 0.55) * 18) * 0.05 * Math.exp(-(t - 0.55) * 6)) : 0);
    g.current.visible = s.clock.elapsedTime >= nata.current;
  });
  const h = monete * 0.07, oro = mat("#f2b632", 0.28, 0.75);
  return (
    <group position={[x, 0, z]}>
      <group ref={g} visible={false} userData={{ dinamico: true }}>
        <mesh geometry={GEO.cil} material={oro} position={[0, h / 2, 0]} scale={[0.42, h, 0.42]} castShadow />
        {Array.from({ length: monete }, (_, i) => <mesh key={i} geometry={GEO.cil} material={mat("#d99a17", 0.3, 0.7)} position={[0, i * 0.07 + 0.066, 0]} scale={[0.435, 0.012, 0.435]} />)}
      </group>
    </group>
  );
}

export function Cassa({ x, dati, font, onClick, children }: { x: number; dati: DatiCassa; font: Font; onClick: () => void; children?: React.ReactNode }) {
  const quota = dati.obiettivo > 0 ? Math.min(1, dati.incassato / dati.obiettivo) : null;
  const t = useMemo(() => tela(1024, 440, (c, w) => {
    rett(c, 0, 0, w, 440, 36, "#0f2a20");
    c.fillStyle = "#7fd7ab"; c.font = `600 40px ${font.testo}`; c.letterSpacing = "4px";
    c.fillText(`ENTRATE DI ${dati.mese.toUpperCase()}`, 56, 92);
    c.letterSpacing = "0px";
    c.fillStyle = "#ffffff"; c.font = `700 150px ${font.titoli}`;
    c.fillText(new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", useGrouping: "always", maximumFractionDigits: 0 }).format(dati.incassato), 50, 250);
    rett(c, 56, 294, w - 112, 26, 13, "#1c4a38");
    if (quota !== null) rett(c, 56, 294, Math.max(26, (w - 112) * quota), 26, 13, "#35e08f");
    c.fillStyle = "#a9c9ba"; c.font = `500 36px ${font.testo}`;
    c.fillText(quota !== null ? `${Math.round(quota * 100)}% dell'obiettivo · ricorrente ${Math.round(dati.ricorrente)} €/mese` : `ricorrente ${Math.round(dati.ricorrente)} €/mese`, 56, 382);
  }), [dati.incassato, dati.ricorrente, dati.mese, quota, font]);
  useEffect(() => () => t.dispose(), [t]);
  const pile = Math.max(0, Math.min(10, quota !== null ? Math.floor(quota * 10 + 0.001) : Math.floor(dati.incassato / 250)));
  return (
    <group position={[x, 0, 0]}>
      <group position={[0, 2.6, FRONTE_MURO + 0.06]}>
        <RoundedBox args={[5.5, 2.45, 0.12]} radius={0.05} smoothness={3} material={matLucido("#0f2a20")} castShadow />
        <mesh geometry={GEO.piano} position={[0, 0, 0.065]} scale={[5.36, 2.3, 1]}><meshBasicMaterial map={t} toneMapped={false} /></mesh>
        <Led da={[-2.75, 0.1]} a={[2.75, 0.1]} y={-1.3} c="#35e08f" spessore={0.04} />
      </group>
      <group position={[3.2, 0, MURO_Z + 3.4]}>
        <Tappeto x={-1.6} z={1.6} w={8.6} d={5.4} c="#e1f3e8" />
        <RoundedBox args={[2.6, 0.1, 1.3]} radius={0.04} smoothness={3} position={[0, 0.62, 0]} material={mat("#e7cfa1", 0.5)} castShadow receiveShadow />
        {[-1.15, 1.15].map((l) => <Box key={l} p={[l, 0.29, 0]} s={[0.08, 0.58, 1.1]} m={mat("#f3f1ec", 0.6)} />)}
        <RoundedBox args={[0.9, 1.0, 0.85]} radius={0.07} smoothness={3} position={[1.85, 0.5, -0.05]} material={mat("#2b3142", 0.4, 0.4)} castShadow />
        <Cil p={[1.85, 0.55, 0.4]} r={[Math.PI / 2, 0, 0]} s={[0.36, 0.05, 0.36]} m={matMetallo()} />
        <group position={[0, 0.67, 0]}>
          {Array.from({ length: pile }, (_, i) => <Pila key={i} x={-0.95 + (i % 5) * 0.48} z={-0.25 + Math.floor(i / 5) * 0.5} monete={3 + ((i * 5) % 4) + Math.floor(i / 5)} ritardo={0.4 + i * 0.09} />)}
        </group>
        <mesh geometry={GEO.box} material={MAT_INVISIBILE} position={[0.4, 1.2, 0]} scale={[3.6, 2.4, 1.8]} {...cliccabile(onClick)} />
        {children}
      </group>
    </group>
  );
}

/* ---------- Percorsi dal Direttore ---------- */

export function Percorso({ da, a, fase }: { da: [number, number]; a: [number, number]; fase: number }) {
  const punto = useRef<THREE.Mesh>(null);
  const curva = useMemo(() => {
    const p0 = new THREE.Vector3(da[0], 0.045, da[1]), p2 = new THREE.Vector3(a[0], 0.045, a[1] + 0.75);
    const mezzo = p0.clone().lerp(p2, 0.5);
    const lato = new THREE.Vector3(-(p2.z - p0.z), 0, p2.x - p0.x).normalize().multiplyScalar((fase % 2 ? 1 : -1) * Math.min(3, p0.distanceTo(p2) * 0.2));
    return new THREE.QuadraticBezierCurve3(p0, mezzo.add(lato), p2);
  }, [da, a, fase]);
  const punti = useMemo(() => curva.getPoints(48), [curva]);
  useFrame((s) => {
    if (!punto.current) return;
    punto.current.position.copy(curva.getPoint((s.clock.elapsedTime * 0.2 + fase * 0.37) % 1));
    punto.current.position.y = 0.12;
  });
  return (
    <group userData={{ dinamico: true }}>
      <Line points={punti} color="#5b8cff" lineWidth={2.6} transparent opacity={0.75} toneMapped={false} />
      <mesh ref={punto} geometry={GEO.sfera} material={matLed("#5b8cff", 2.2)} scale={0.26} />
    </group>
  );
}
