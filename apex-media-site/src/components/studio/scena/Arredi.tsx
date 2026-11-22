"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { StatoAgente } from "@/lib/studio/calcoli";
import { Box, C, Cil, Cono, GEO, MAT_INVISIBILE, Sfera, mat, matLuce, rett, schermo, tela, type Font } from "./base";

/* Tutto ciò che non è una persona: pavimento, muri, scrivanie, piante, lavagna,
   tabellone, cervello condiviso, area relax, sala clienti, cassa, percorsi. */

export const LARGO = 35, FONDO = 23;
const MURO_Z = -FONDO / 2;

function puntatore(su: boolean) { document.body.style.cursor = su ? "pointer" : ""; }
function cliccabile(onClick?: () => void) {
  return onClick ? {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onClick(); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); puntatore(true); },
    onPointerOut: () => puntatore(false),
  } : {};
}

/* ---------- Pavimento e muri ---------- */

export function Pavimento() {
  const ombra = useMemo(() => tela(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(40,44,70,0.34)"); g.addColorStop(0.75, "rgba(40,44,70,0.08)"); g.addColorStop(1, "rgba(40,44,70,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }), []);
  useEffect(() => () => ombra.dispose(), [ombra]);
  return (
    <group>
      {/* alone sotto la lastra: l'ufficio sembra appoggiato sulla pagina */}
      <mesh geometry={GEO.piano} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 1.2]} scale={[LARGO * 1.5, FONDO * 1.75, 1]}>
        <meshBasicMaterial map={ombra} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <RoundedBox args={[LARGO, 0.7, FONDO]} radius={0.3} smoothness={4} position={[0, -0.35, 0]} material={mat(C.pavimento)} receiveShadow />
      {/* bordi in legno ai lati, muro alto in fondo */}
      <RoundedBox args={[0.34, 0.62, FONDO]} radius={0.12} smoothness={3} position={[-LARGO / 2 + 0.17, 0.31, 0]} material={mat(C.bordo)} castShadow receiveShadow />
      <RoundedBox args={[0.34, 0.62, FONDO]} radius={0.12} smoothness={3} position={[LARGO / 2 - 0.17, 0.31, 0]} material={mat(C.bordo)} castShadow receiveShadow />
      <RoundedBox args={[LARGO, 3.9, 0.36]} radius={0.14} smoothness={3} position={[0, 1.95, MURO_Z + 0.18]} material={mat(C.muro)} castShadow receiveShadow />
      <Box p={[0, 0.16, MURO_Z + 0.4]} s={[LARGO - 0.7, 0.32, 0.1]} c={C.bordo} ombra={false} />
    </group>
  );
}

/** Tappeto sottile che delimita una zona. `tondo` per i tappeti circolari. */
export function Tappeto({ x, z, w, d, c, tondo }: { x: number; z: number; w: number; d: number; c: string; tondo?: boolean }) {
  return tondo
    ? <mesh geometry={GEO.cil} material={mat(c)} position={[x, 0.012, z]} scale={[w, 0.024, w]} receiveShadow />
    : <RoundedBox args={[w, 0.024, d]} radius={0.011} smoothness={2} position={[x, 0.012, z]} material={mat(c)} receiveShadow />;
}

/** Scritta stesa sul pavimento: nome della zona e una riga sotto. */
export function ScrittaPavimento({ x, z, nome, sotto, font }: { x: number; z: number; nome: string; sotto: string; font: Font }) {
  const t = useMemo(() => tela(768, 96, (c) => {
    c.textBaseline = "top";
    c.fillStyle = "#8f8a7c";
    c.font = `700 34px ${font.titoli}`;
    c.letterSpacing = "5px";
    c.fillText(nome.toUpperCase(), 4, 6);
    c.fillStyle = "#b5b0a2";
    c.font = `500 24px ${font.testo}`;
    c.letterSpacing = "0px";
    c.fillText(sotto, 4, 56);
  }), [nome, sotto, font]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <mesh geometry={GEO.piano} rotation={[-Math.PI / 2, 0, 0]} position={[x + 3.2, 0.03, z]} scale={[6.4, 0.8, 1]}>
      <meshBasicMaterial map={t} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ---------- Scrivanie ---------- */

/** Un posto di lavoro: il monitor guarda la telecamera, chi lavora gli sta davanti di spalle. */
function Monitor({ x, z, tipo, stato, accento }: { x: number; z: number; tipo: string; stato: StatoAgente; accento: string }) {
  const map = schermo(tipo, stato, accento);
  return (
    <group position={[x, 0.78, z]}>
      <Cil p={[0, 0.015, 0]} s={[0.34, 0.03, 0.22]} c={C.grigio} />
      <Box p={[0, 0.16, 0]} s={[0.07, 0.3, 0.05]} c={C.grigio} />
      <group position={[0, 0.5, 0]} rotation={[-0.16, 0, 0]}>
        <RoundedBox args={[1.12, 0.69, 0.06]} radius={0.028} smoothness={2} material={mat(C.schermo)} castShadow />
        <mesh geometry={GEO.piano} position={[0, 0, 0.032]} scale={[1.03, 0.6, 1]}>
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export type PostoScrivania = { x: number; tipo: string; stato: StatoAgente; accento: string };

/** Scrivania lunga con gambe bianche; `z` è la fila dei posti a sedere, il piano sta 0.9 più indietro. */
export function Scrivania({ z, posti }: { z: number; posti: PostoScrivania[] }) {
  const xs = posti.map((p) => p.x);
  const centro = (Math.min(...xs) + Math.max(...xs)) / 2;
  const largo = Math.max(...xs) - Math.min(...xs) + 2.3;
  const zc = z - 0.9;
  return (
    <group>
      <RoundedBox args={[largo, 0.08, 1.0]} radius={0.035} smoothness={3} position={[centro, 0.74, zc]} material={mat(C.legno)} castShadow receiveShadow />
      {[-1, 1].map((l) => <Box key={l} p={[centro + l * (largo / 2 - 0.16), 0.35, zc]} s={[0.07, 0.7, 0.84]} c={C.bianco} />)}
      {largo > 5 ? <Box p={[centro, 0.35, zc]} s={[0.07, 0.7, 0.84]} c={C.bianco} /> : null}
      <Box p={[centro, 0.52, zc - 0.36]} s={[largo - 0.4, 0.26, 0.04]} c={C.bianco} />
      {posti.map((p, i) => (
        <group key={i}>
          <Monitor x={p.x} z={zc - 0.14} tipo={p.tipo} stato={p.stato} accento={p.accento} />
          <Box p={[p.x - 0.06, 0.795, zc + 0.27]} s={[0.5, 0.03, 0.17]} c={C.bianco} ombra={false} />
          <Box p={[p.x + 0.36, 0.795, zc + 0.28]} s={[0.08, 0.03, 0.12]} c={C.bianco} ombra={false} />
          {/* un oggetto diverso per posto: tazza, lampada o pianta piccola */}
          {i % 3 === 0 ? <Cil p={[p.x + 0.72, 0.84, zc + 0.1]} s={[0.1, 0.12, 0.1]} c={[C.viola, C.blu, C.oro][i % 3]} /> : null}
          {i % 3 === 1 ? <group position={[p.x - 0.74, 0.78, zc - 0.05]}><Cil p={[0, 0.06, 0]} s={[0.14, 0.12, 0.14]} c={C.bianco} /><Cono p={[0, 0.24, 0]} s={[0.07, 0.3, 0.07]} c={C.foglia} /><Cono p={[0.06, 0.2, 0]} s={[0.06, 0.24, 0.06]} r={[0, 0, -0.5]} c={C.foglia2} /><Cono p={[-0.06, 0.2, 0]} s={[0.06, 0.24, 0.06]} r={[0, 0, 0.5]} c={C.foglia2} /></group> : null}
          {i % 3 === 2 ? <group position={[p.x + 0.76, 0.78, zc - 0.1]}><Cil p={[0, 0.01, 0]} s={[0.16, 0.02, 0.16]} c={C.ink} /><Box p={[0, 0.2, 0]} s={[0.025, 0.4, 0.025]} c={C.ink} /><Cono p={[-0.06, 0.4, 0.04]} s={[0.16, 0.12, 0.16]} r={[0.4, 0, 0.5]} c={C.ink} /></group> : null}
        </group>
      ))}
    </group>
  );
}

/* ---------- Piante ---------- */

export function Pianta({ x, z, s = 1, vaso = C.bianco }: { x: number; z: number; s?: number; vaso?: string }) {
  const foglie = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2, piega = i % 3 === 0 ? 0.18 : 0.52;
    return { p: [Math.sin(a) * piega * 0.42, 0.62 + (i % 3 === 0 ? 0.42 : 0.26), Math.cos(a) * piega * 0.42] as [number, number, number], r: [Math.cos(a) * piega, 0, -Math.sin(a) * piega] as [number, number, number], h: i % 3 === 0 ? 1.15 : 0.82, c: i % 2 ? C.foglia : C.foglia2 };
  }), []);
  return (
    <group position={[x, 0, z]} scale={s}>
      <Cil p={[0, 0.22, 0]} s={[0.5, 0.44, 0.5]} c={vaso} />
      <Cil p={[0, 0.44, 0]} s={[0.44, 0.02, 0.44]} c="#6b4a34" ombra={false} />
      {foglie.map((f, i) => <Cono key={i} p={f.p} r={f.r} s={[0.13, f.h, 0.13]} c={f.c} />)}
    </group>
  );
}

/* ---------- Muro di fondo: tabellone, lavagna, quadri ---------- */

export type Conteggi = { attesa: number; lavora: number; coda: number; liberi: number };

/** Tabellone scuro al centro del muro: quanti lavori per stato, aggiornato dai dati veri. */
export function Tabellone({ n, font }: { n: Conteggi; font: Font }) {
  const t = useMemo(() => tela(1280, 300, (x, w, h) => {
    rett(x, 0, 0, w, h, 34, "#14161f");
    const voci: [string, number, string][] = [["da guardare", n.attesa, "#ffd84d"], ["al lavoro", n.lavora, "#5b8cff"], ["in coda", n.coda, "#b9bfd0"], ["liberi", n.liberi, "#2fd08a"]];
    const cella = (w - 80) / 4;
    voci.forEach(([nome, valore, colore], i) => {
      const px = 40 + i * cella;
      rett(x, px + 8, 44, cella - 16, h - 88, 28, "#1f2230");
      x.fillStyle = colore; x.beginPath(); x.arc(px + 52, 110, 13, 0, 7); x.fill();
      x.fillStyle = "#f3f4f8"; x.font = `700 110px ${font.titoli}`; x.textBaseline = "alphabetic";
      x.fillText(String(valore), px + 82, 150);
      x.fillStyle = "#9da3b6"; x.font = `600 38px ${font.testo}`;
      x.fillText(nome, px + 40, 216);
    });
  }), [n.attesa, n.lavora, n.coda, n.liberi, font]);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <group position={[0, 2.35, MURO_Z + 0.42]}>
      <RoundedBox args={[8.6, 2.1, 0.12]} radius={0.05} smoothness={3} material={mat("#14161f")} castShadow />
      <mesh geometry={GEO.piano} position={[0, 0, 0.065]} scale={[8.4, 1.97, 1]}><meshBasicMaterial map={t} toneMapped={false} /></mesh>
    </group>
  );
}

export function Lavagna({ x }: { x: number }) {
  const colori = ["#ffe28a", "#ffb3c7", "#b9d2ff", "#bff0cf", "#ffe28a", "#d8c7ff", "#ffd0a8", "#b9d2ff", "#ffe28a", "#bff0cf", "#ffb3c7", "#d8c7ff"];
  return (
    <group position={[x, 2.25, MURO_Z + 0.4]}>
      <RoundedBox args={[4.1, 2.0, 0.08]} radius={0.035} smoothness={2} material={mat(C.bianco)} castShadow />
      <Box p={[0, -1.04, 0.07]} s={[4.1, 0.06, 0.14]} c={C.grigio} ombra={false} />
      {colori.map((c, i) => <Box key={i} p={[-1.5 + (i % 6) * 0.6, 0.42 - Math.floor(i / 6) * 0.72, 0.05]} s={[0.46, 0.46, 0.02]} r={[0, 0, ((i * 37) % 9 - 4) * 0.012]} c={c} ombra={false} />)}
    </group>
  );
}

export function Quadro({ x, c, largo = 1.15 }: { x: number; c: string; largo?: number }) {
  return (
    <group position={[x, 2.45, MURO_Z + 0.4]}>
      <RoundedBox args={[largo, 1.45, 0.07]} radius={0.03} smoothness={2} material={mat(C.ink)} castShadow />
      <Box p={[0, 0, 0.04]} s={[largo - 0.14, 1.31, 0.01]} c={C.bianco} ombra={false} />
      <Box p={[0, 0.12, 0.05]} s={[largo - 0.4, 0.7, 0.01]} c={c} ombra={false} />
      <Box p={[-0.1, -0.42, 0.05]} s={[largo - 0.6, 0.08, 0.01]} c={C.grigio} ombra={false} />
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
      <Tappeto x={0} z={0} w={3.1} d={3.1} c="#e9e6fb" tondo />
      <Cil p={[0, 0.6, 0]} s={[1.0, 1.2, 1.0]} c={C.bianco} />
      <Cil p={[0, 1.22, 0]} s={[1.12, 0.06, 1.12]} c={C.grigio} />
      <group ref={palla} position={[0, 2.2, 0]}>
        <lineSegments geometry={archi}><lineBasicMaterial color={attivo ? C.viola : "#7f8fff"} transparent opacity={0.75} toneMapped={false} /></lineSegments>
        <mesh geometry={GEO.sfera} material={matLuce("#8f7bff", 0.14)} scale={1.25} />
        {nodi.map((v, i) => <mesh key={i} geometry={GEO.sfera} material={matLuce(i % 5 === 0 ? C.viola : C.blu)} position={v} scale={0.085} />)}
      </group>
      <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 1.5, 0]} scale={[2.2, 3.2, 2.2]} {...cliccabile(onClick)} />
      {children}
    </group>
  );
}

/* ---------- Area relax ---------- */

export function Relax() {
  const divano = "#7d6bff", cuscino = "#a79bff";
  return (
    <group>
      <Tappeto x={-11.4} z={5.4} w={8.4} d={5.6} c="#e6ecff" />
      {/* divano rivolto verso la telecamera */}
      <group position={[-11.3, 0, 3.55]}>
        <RoundedBox args={[4.5, 0.42, 1.25]} radius={0.14} smoothness={3} position={[0, 0.25, 0.1]} material={mat(divano)} castShadow receiveShadow />
        <RoundedBox args={[4.5, 0.95, 0.4]} radius={0.16} smoothness={3} position={[0, 0.62, -0.42]} material={mat(divano)} castShadow />
        <RoundedBox args={[0.42, 0.72, 1.25]} radius={0.16} smoothness={3} position={[-2.25, 0.42, 0.1]} material={mat(divano)} castShadow />
        <RoundedBox args={[0.42, 0.72, 1.25]} radius={0.16} smoothness={3} position={[2.25, 0.42, 0.1]} material={mat(divano)} castShadow />
        <RoundedBox args={[0.7, 0.5, 0.2]} radius={0.09} smoothness={3} position={[0, 0.72, -0.14]} rotation={[-0.25, 0, 0.08]} material={mat(cuscino)} castShadow />
        <RoundedBox args={[0.6, 0.45, 0.2]} radius={0.09} smoothness={3} position={[1.75, 0.7, -0.14]} rotation={[-0.25, 0, -0.1]} material={mat(C.giallo)} castShadow />
      </group>
      {/* tavolino con tazze */}
      <group position={[-11.3, 0, 5.75]}>
        <Cil p={[0, 0.4, 0]} s={[1.5, 0.07, 1.5]} c={C.legno} />
        <Cil p={[0, 0.2, 0]} s={[0.16, 0.4, 0.16]} c={C.bianco} />
        <Cil p={[0, 0.02, 0]} s={[0.7, 0.04, 0.7]} c={C.bianco} />
        <Cil p={[-0.3, 0.5, 0.1]} s={[0.13, 0.13, 0.13]} c={C.bianco} />
        <Cil p={[0.25, 0.5, -0.2]} s={[0.13, 0.13, 0.13]} c={C.viola} />
        <Box p={[0.2, 0.46, 0.3]} s={[0.42, 0.04, 0.3]} r={[0, 0.4, 0]} c={C.blu} />
      </group>
      {/* pouf */}
      <Sfera p={[-14.1, 0.36, 7.3]} s={[1.5, 0.8, 1.5]} c={C.giallo} />
      <Sfera p={[-8.5, 0.36, 7.5]} s={[1.5, 0.8, 1.5]} c="#6f9bff" />
      {/* bancone del caffè lungo la parete sinistra */}
      <group position={[-16.45, 0, 5.0]}>
        <RoundedBox args={[0.95, 0.92, 3.4]} radius={0.06} smoothness={2} position={[0, 0.46, 0]} material={mat(C.bianco)} castShadow receiveShadow />
        <RoundedBox args={[1.05, 0.07, 3.5]} radius={0.03} smoothness={2} position={[0, 0.955, 0]} material={mat(C.legno)} castShadow />
        <RoundedBox args={[0.55, 0.62, 0.5]} radius={0.05} smoothness={2} position={[0, 1.3, 0.1]} material={mat(C.ink)} castShadow />
        <Box p={[0.2, 1.12, 0.1]} s={[0.2, 0.04, 0.3]} c={C.grigio} ombra={false} />
        <Sfera p={[0.28, 1.5, 0.26]} s={0.05} c={C.rosso} ombra={false} />
        {[0, 1, 2].map((i) => <Cil key={i} p={[0.05, 1.05 + i * 0.03, -0.75 - i * 0.02]} s={[0.13, 0.13, 0.13]} c={C.bianco} />)}
        <Cil p={[0, 1.08, -1.25]} s={[0.2, 0.2, 0.2]} c={C.oro} />
        <Cil p={[0, 1.12, 1.15]} s={[0.24, 0.26, 0.24]} c="#bfe3ff" />
      </group>
      {/* lampada da terra */}
      <group position={[-8.2, 0, 3.25]}>
        <Cil p={[0, 0.03, 0]} s={[0.5, 0.06, 0.5]} c={C.ink} />
        <Cil p={[0, 1.05, 0]} s={[0.05, 2.1, 0.05]} c={C.ink} />
        <Cono p={[0, 2.2, 0]} s={[0.7, 0.5, 0.7]} c={C.giallo} />
      </group>
      {/* ping pong */}
      <group position={[-5.4, 0, 8.6]}>
        <RoundedBox args={[2.9, 0.08, 1.6]} radius={0.03} smoothness={2} position={[0, 0.78, 0]} material={mat("#2b4fd6")} castShadow receiveShadow />
        <Box p={[0, 0.825, 0]} s={[2.9, 0.005, 0.04]} c={C.bianco} ombra={false} />
        <Box p={[0, 0.9, 0]} s={[0.03, 0.16, 1.7]} c={C.bianco} />
        {[[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]].map(([a, b], i) => <Box key={i} p={[a, 0.39, b]} s={[0.07, 0.78, 0.07]} c={C.ink} />)}
        <Cil p={[-0.8, 0.84, 0.3]} s={[0.2, 0.03, 0.2]} c={C.rosso} />
        <Sfera p={[0.5, 0.86, -0.2]} s={0.07} c={C.bianco} />
      </group>
    </group>
  );
}

/* ---------- Sala clienti ---------- */

export function TavoloClienti({ x, z, vuota, onClick }: { x: number; z: number; vuota: boolean; onClick?: () => void }) {
  return (
    <group position={[x, 0, z]}>
      <Tappeto x={0} z={0} w={7.0} d={7.0} c="#f0e9da" tondo />
      <Cil p={[0, 0.74, 0]} s={[2.7, 0.08, 2.7]} c={C.legno} riceve />
      <Cil p={[0, 0.37, 0]} s={[0.3, 0.7, 0.3]} c={C.bianco} />
      <Cil p={[0, 0.03, 0]} s={[1.3, 0.06, 1.3]} c={C.bianco} />
      <Cil p={[0, 0.84, 0]} s={[0.3, 0.12, 0.3]} c={C.bianco} />
      <Cono p={[0, 1.1, 0]} s={[0.12, 0.5, 0.12]} c={C.foglia} /><Cono p={[0.09, 1.03, 0]} s={[0.1, 0.4, 0.1]} r={[0, 0, -0.5]} c={C.foglia2} /><Cono p={[-0.09, 1.03, 0]} s={[0.1, 0.4, 0.1]} r={[0, 0, 0.5]} c={C.foglia2} />
      {vuota ? <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 0.8, 0]} scale={[5.4, 1.8, 5.4]} {...cliccabile(onClick)} /> : null}
    </group>
  );
}

/** Posto attorno al tavolo dei clienti: posizione e rotazione verso il centro. */
export function postoCliente(cx: number, cz: number, i: number, quanti: number): { x: number; z: number; rot: number } {
  // si parte dal lato lontano (di fronte alla telecamera) e si allarga a ventaglio, lasciando libero il lato vicino
  const n = Math.max(quanti, 3);
  const apertura = n <= 4 ? Math.PI * 1.15 : Math.PI * 1.6;
  const a = Math.PI + (n === 1 ? 0 : (i / (n - 1) - 0.5) * apertura);
  return { x: cx + Math.sin(a) * 2.05, z: cz + Math.cos(a) * 2.05, rot: a };
}

/* ---------- Cassa ---------- */

export type DatiCassa = { incassato: number; obiettivo: number; ricorrente: number; mese: string };

function Pila({ x, z, monete, ritardo }: { x: number; z: number; monete: number; ritardo: number }) {
  const g = useRef<THREE.Group>(null);
  const nata = useRef<number | null>(null);
  // ogni pila nuova cade dall'alto e si assesta
  useFrame((s) => {
    if (!g.current) return;
    if (nata.current === null) nata.current = s.clock.elapsedTime + ritardo;
    const t = Math.max(0, s.clock.elapsedTime - nata.current);
    const k = Math.min(1, t / 0.55);
    const rimbalzo = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
    g.current.position.y = (1 - rimbalzo) * 2.4 + (k >= 1 ? Math.max(0, Math.sin((t - 0.55) * 18) * 0.05 * Math.exp(-(t - 0.55) * 6)) : 0);
    g.current.visible = s.clock.elapsedTime >= nata.current;
  });
  const h = monete * 0.07;
  return (
    <group position={[x, 0, z]}>
      <group ref={g} visible={false}>
        <Cil p={[0, h / 2, 0]} s={[0.42, h, 0.42]} c={C.oro} />
        {Array.from({ length: monete }, (_, i) => <Cil key={i} p={[0, i * 0.07 + 0.066, 0]} s={[0.435, 0.012, 0.435]} c="#d99a17" ombra={false} />)}
        <Cil p={[0, h + 0.004, 0]} s={[0.3, 0.008, 0.3]} c="#ffd768" ombra={false} />
      </group>
    </group>
  );
}

/** Schermo delle entrate sul muro e, sotto, le monete: una pila ogni fetta dell'obiettivo raggiunta. */
export function Cassa({ x, dati, font, onClick, children }: { x: number; dati: DatiCassa; font: Font; onClick: () => void; children?: React.ReactNode }) {
  const quota = dati.obiettivo > 0 ? Math.min(1, dati.incassato / dati.obiettivo) : null;
  const t = useMemo(() => tela(1024, 440, (c, w, h) => {
    rett(c, 0, 0, w, h, 36, "#0f2a20");
    c.textBaseline = "alphabetic";
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

  // fino a 10 pile: una ogni decimo dell'obiettivo, oppure una ogni 250 € se l'obiettivo non c'è
  const pile = Math.max(0, Math.min(10, quota !== null ? Math.floor(quota * 10 + 0.001) : Math.floor(dati.incassato / 250)));
  return (
    <group position={[x, 0, 0]}>
      <group position={[0, 2.3, MURO_Z + 0.42]}>
        <RoundedBox args={[5.5, 2.45, 0.12]} radius={0.05} smoothness={3} material={mat("#0f2a20")} castShadow />
        <mesh geometry={GEO.piano} position={[0, 0, 0.065]} scale={[5.36, 2.3, 1]}><meshBasicMaterial map={t} toneMapped={false} /></mesh>
      </group>
      <group position={[0, 0, MURO_Z + 2.3]}>
        <Tappeto x={0} z={0.5} w={6.6} d={3.6} c="#e3f5eb" />
        <RoundedBox args={[5.0, 0.1, 1.3]} radius={0.04} smoothness={3} position={[0, 0.62, 0]} material={mat(C.legno)} castShadow receiveShadow />
        {[-2.2, 2.2].map((l) => <Box key={l} p={[l, 0.29, 0]} s={[0.08, 0.58, 1.1]} c={C.bianco} />)}
        {/* cassaforte */}
        <RoundedBox args={[1.0, 1.0, 0.9]} radius={0.07} smoothness={3} position={[-1.85, 1.17, -0.05]} material={mat("#2b3142")} castShadow />
        <Cil p={[-1.85, 1.17, 0.42]} r={[Math.PI / 2, 0, 0]} s={[0.4, 0.05, 0.4]} c={C.grigio} />
        <Box p={[-1.85, 1.17, 0.46]} s={[0.3, 0.05, 0.03]} c={C.ink} ombra={false} />
        <group position={[0, 0.67, 0]}>
          {Array.from({ length: pile }, (_, i) => <Pila key={i} x={-0.95 + (i % 5) * 0.58} z={-0.22 + Math.floor(i / 5) * 0.5} monete={3 + ((i * 5) % 4) + Math.floor(i / 5)} ritardo={0.4 + i * 0.09} />)}
        </group>
        <mesh geometry={GEO.box} material={MAT_INVISIBILE} position={[0, 1.2, 0]} scale={[5.4, 2.4, 1.8]} {...cliccabile(onClick)} />
        {children}
      </group>
    </group>
  );
}

/* ---------- Percorsi sul pavimento ---------- */

/** Linea curva dal Direttore a chi ha un lavoro aperto, con un punto che la percorre. */
export function Percorso({ da, a, stato, fase }: { da: [number, number]; a: [number, number]; stato: StatoAgente; fase: number }) {
  const punto = useRef<THREE.Mesh>(null);
  const curva = useMemo(() => {
    const p0 = new THREE.Vector3(da[0], 0.045, da[1]), p2 = new THREE.Vector3(a[0], 0.045, a[1] + 0.75);
    const mezzo = p0.clone().lerp(p2, 0.5);
    const lato = new THREE.Vector3(-(p2.z - p0.z), 0, p2.x - p0.x).normalize().multiplyScalar((fase % 2 ? 1 : -1) * Math.min(2.6, p0.distanceTo(p2) * 0.22));
    return new THREE.QuadraticBezierCurve3(p0, mezzo.add(lato), p2);
  }, [da, a, fase]);
  const punti = useMemo(() => curva.getPoints(40), [curva]);
  const colore = stato === "attesa" ? C.oro : stato === "lavora" ? C.blu : "#c3c7d3";
  useFrame((s) => {
    if (!punto.current) return;
    const t = stato === "lavora" ? (s.clock.elapsedTime * 0.22 + fase * 0.37) % 1 : stato === "attesa" ? 0.5 + Math.sin(s.clock.elapsedTime * 1.5 + fase) * 0.4 : 0.5;
    punto.current.position.copy(curva.getPoint(stato === "attesa" ? 1 - t : t));
    punto.current.position.y = 0.12;
  });
  return (
    <group>
      <Line points={punti} color={colore} lineWidth={stato === "coda" ? 2 : 3.2} dashed={stato === "coda"} dashSize={0.35} gapSize={0.25} transparent opacity={stato === "coda" ? 0.8 : 0.9} toneMapped={false} />
      {stato !== "coda" ? <mesh ref={punto} geometry={GEO.sfera} material={matLuce(colore)} scale={0.3} /> : null}
    </group>
  );
}
