"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CINEMA } from "@/lib/studio/agenti";
import { GEO, MAT_VETRO, TelaViva, mat, matLed, matLucido, matOttone } from "./base";
import { disegnaGioco } from "./gioco";
import { useSchermo } from "./Scrivanie";

/* =============================================================
   Il mini cinema, a sinistra dell'ufficio: sala buia con moquette,
   pareti fonoassorbenti, grande schermo, tre file di poltrone rosse
   di velluto, luci a gradino, angolo popcorn, console di gioco
   (design originali) e due postazioni tablet all'ingresso.
   ============================================================= */

type V3 = [number, number, number];
const Box = ({ p, s, r, m, ombra = true }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean }) => <mesh geometry={GEO.box} material={m} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow />;

/** Poltrona da cinema in velluto rosso con braccioli scuri e il bordo in ottone. Guarda verso -x (lo schermo). */
function Poltrona({ x, z }: { x: number; z: number }) {
  const velluto = mat("#9e1622", 0.95), scuro = mat("#2a1416", 0.7);
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI / 2, 0]}>
      <RoundedBox args={[0.62, 0.16, 0.56]} radius={0.06} smoothness={3} position={[0, 0.46, 0.02]} material={velluto} castShadow receiveShadow />
      <RoundedBox args={[0.62, 0.78, 0.14]} radius={0.07} smoothness={3} position={[0, 0.86, 0.3]} rotation={[0.16, 0, 0]} material={velluto} castShadow />
      <RoundedBox args={[0.56, 0.3, 0.04]} radius={0.02} smoothness={2} position={[0, 1.0, 0.23]} rotation={[0.16, 0, 0]} material={mat("#b3202c", 0.95)} />
      {[-0.34, 0.34].map((l) => (
        <group key={l}>
          <RoundedBox args={[0.08, 0.62, 0.6]} radius={0.03} smoothness={2} position={[l, 0.31, 0.04]} material={scuro} castShadow />
          <Box p={[l, 0.63, 0.04]} s={[0.09, 0.02, 0.58]} m={matOttone()} ombra={false} />
        </group>
      ))}
    </group>
  );
}

/** Console di gioco dal design originale: «Apex Box», cubo nero opaco con l'anello di luce viola. */
function ApexBox({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <RoundedBox args={[0.3, 0.3, 0.3]} radius={0.04} smoothness={3} position={[0, 0.15, 0]} material={mat("#111216", 0.6)} castShadow />
      <mesh geometry={GEO.toro} material={matLed("#8b6dff", 2.6)} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.09, 0.09, 0.3]} />
      <mesh geometry={GEO.cil} material={mat("#1c1d24", 0.5)} position={[0, 0.302, 0]} scale={[0.16, 0.004, 0.16]} />
    </group>
  );
}
/** Seconda console originale: torre bianca slanciata con i fianchi curvi e la luce blu. */
function TorreBianca({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <RoundedBox args={[0.12, 0.44, 0.34]} radius={0.05} smoothness={3} position={[-0.04, 0.22, 0]} material={mat("#f4f4f6", 0.25)} castShadow />
      <RoundedBox args={[0.12, 0.44, 0.34]} radius={0.05} smoothness={3} position={[0.04, 0.22, 0]} material={mat("#f4f4f6", 0.25)} castShadow />
      <RoundedBox args={[0.05, 0.42, 0.32]} radius={0.02} smoothness={2} position={[0, 0.22, 0]} material={matLucido("#0d0e12")} />
      <Box p={[0, 0.22, 0.17]} s={[0.012, 0.36, 0.004]} m={matLed("#3d7dff", 3)} ombra={false} />
    </group>
  );
}
function Joypad({ p, r = 0, c }: { p: V3; r?: number; c: string }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <RoundedBox args={[0.17, 0.04, 0.085]} radius={0.018} smoothness={2} material={mat(c, 0.35)} />
      {[-0.07, 0.07].map((x) => <mesh key={x} geometry={GEO.sfera} material={mat(c, 0.35)} position={[x, -0.01, 0.035]} scale={[0.05, 0.04, 0.07]} />)}
    </group>
  );
}

/** Tablet su un leggio, con lo schermo vivo (calendario, reel, campagne). */
function Leggio({ x, z, rot, tipo, accento }: { x: number; z: number; rot: number; tipo: string; accento: string }) {
  const map = useSchermo(tipo, "lavora", accento, x + z, [x, z]);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh geometry={GEO.cil} material={mat("#1c1d22", 0.4, 0.6)} position={[0, 0.02, 0]} scale={[0.4, 0.04, 0.4]} castShadow />
      <mesh geometry={GEO.cil} material={mat("#c9ccd4", 0.3, 0.85)} position={[0, 0.55, 0]} scale={[0.04, 1.06, 0.04]} castShadow />
      <group position={[0, 1.1, 0.02]} rotation={[-0.65, 0, 0]}>
        <RoundedBox args={[0.42, 0.3, 0.012]} radius={0.012} smoothness={2} material={mat("#2b2e36", 0.3, 0.6)} castShadow />
        <mesh position={[0, 0, 0.0065]}><planeGeometry args={[0.39, 0.27]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

/** Lo schermo grande: il trailer del gioco «Apex City», si ridisegna solo da vicino. */
function Schermo({ x, z, w }: { x: number; z: number; w: number }) {
  const telefono = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches, []);
  const viva = useMemo(() => new TelaViva(640, 360, telefono ? 1.5 : 2), [telefono]);
  useEffect(() => () => viva.dispose(), [viva]);
  const v = useMemo(() => new THREE.Vector3(x, 2, z), [x, z]);
  useFrame(({ clock, camera }) => {
    if (viva.pronta && camera.position.distanceTo(v) > (telefono ? 18 : 28)) return;
    const t = clock.elapsedTime + 20;
    viva.aggiorna(Math.floor(t * (telefono ? 10 : 18)), (c) => disegnaGioco(c, t));
  });
  const h = (w * 9) / 16;
  return (
    <group position={[x, 0.55 + h / 2, z]} rotation={[0, Math.PI / 2, 0]} userData={{ dinamico: true }}>
      <Box p={[0, 0, -0.06]} s={[w + 0.3, h + 0.3, 0.06]} m={mat("#050507", 0.8)} />
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={viva.t} toneMapped={false} /></mesh>
      {/* alone della luce dello schermo sulla moquette */}
      <mesh geometry={GEO.piano} position={[0, -h / 2 - 0.53, 1.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[w, 3.2, 1]}>
        <meshBasicMaterial color="#6a4cff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Le file di poltrone: dove si siede chi è libero (vedi POSTI_RELAX in agenti.ts). */
export const FILE_CINEMA = [-27.9, -26.6, -25.3];
export const POSTI_CINEMA_Z = [1.4, 2.4, 3.4, 4.4, 5.4];

export function Cinema() {
  const { x0, x1, z0, z1, porta } = CINEMA;
  const moquette = mat("#2a1418", 0.98), pannello = mat("#1b1a20", 0.92), pannello2 = mat("#24222b", 0.9), fianco = mat("#121216", 0.6);
  const largo = x1 - x0, fondo = z1 - z0;
  return (
    <group>
      {/* pedana con la moquette, attaccata al lato sinistro dell'ufficio */}
      <mesh geometry={GEO.box} material={fianco} position={[(x0 + x1) / 2, -0.47, (z0 + z1) / 2]} scale={[largo, 0.7, fondo]} receiveShadow />
      <mesh geometry={GEO.box} material={moquette} position={[(x0 + x1) / 2, 0.005, (z0 + z1) / 2]} scale={[largo, 0.01, fondo]} receiveShadow />
      <mesh geometry={GEO.box} material={matLed("#ffc23a", 2.8)} position={[x0 - 0.01, -0.16, (z0 + z1) / 2]} scale={[0.04, 0.05, fondo - 0.4]} />
      <mesh geometry={GEO.box} material={matLed("#ffc23a", 2.8)} position={[(x0 + x1) / 2, -0.16, z1 + 0.01]} scale={[largo - 0.4, 0.05, 0.04]} />
      <mesh geometry={GEO.box} material={matLed("#ffc23a", 2.8)} position={[(x0 + x1) / 2, -0.16, z0 - 0.01]} scale={[largo - 0.4, 0.05, 0.04]} />
      {/* pareti fonoassorbenti a pannelli: fondo e lato dello schermo alte, davanti bassa a vetri per guardare dentro */}
      <Box p={[x0 + 0.1, 1.6, (z0 + z1) / 2]} s={[0.2, 3.2, fondo]} m={pannello} />
      <Box p={[(x0 + x1) / 2, 1.6, z0 + 0.1]} s={[largo, 3.2, 0.2]} m={pannello} />
      {Array.from({ length: 8 }, (_, i) => <Box key={i} p={[x0 + 0.6 + i * 1.05, 1.7, z0 + 0.22]} s={[0.9, 2.4, 0.04]} m={i % 2 ? pannello2 : pannello} ombra={false} />)}
      <Box p={[(x0 + x1) / 2, 0.45, z1 - 0.1]} s={[largo, 0.9, 0.2]} m={pannello} />
      <Box p={[(x0 + x1) / 2, 0.91, z1 - 0.1]} s={[largo, 0.03, 0.24]} m={matOttone()} ombra={false} />
      {/* luci a gradino e strisce sul soffitto basso del fondo */}
      <mesh geometry={GEO.box} material={matLed("#ffb347", 2.2)} position={[(x0 + x1) / 2, 0.03, z0 + 0.26]} scale={[largo - 0.6, 0.02, 0.02]} />
      <mesh geometry={GEO.box} material={matLed("#ffb347", 2.2)} position={[x0 + 0.24, 0.03, (z0 + z1) / 2]} scale={[0.02, 0.02, fondo - 0.6]} />
      {[1, 2, 3].map((k) => <mesh key={k} geometry={GEO.box} material={matLed("#ff5a5a", 1.6)} position={[x0 + 0.24, 3.0, z0 + (fondo * k) / 4]} scale={[0.02, 0.08, 0.5]} />)}

      <Schermo x={x0 + 0.26} z={(z0 + z1) / 2 + 0.6} w={6.4} />
      {/* mobile sotto lo schermo con le due console e i joypad */}
      <group position={[x0 + 0.75, 0, (z0 + z1) / 2 + 0.6]}>
        <RoundedBox args={[0.5, 0.45, 2.6]} radius={0.04} smoothness={2} position={[0, 0.225, 0]} material={mat("#16151a", 0.5)} castShadow receiveShadow />
        <Box p={[0.255, 0.42, 0]} s={[0.01, 0.02, 2.5]} m={matLed("#8b6dff", 2.2)} ombra={false} />
        <ApexBox p={[0, 0.45, -0.7]} />
        <TorreBianca p={[0, 0.45, 0.7]} />
        <Joypad p={[0.05, 0.47, -0.15]} r={0.4} c="#1b1c22" />
        <Joypad p={[0.05, 0.47, 0.18]} r={-0.3} c="#f4f4f6" />
      </group>

      {/* tre file di poltrone rosse */}
      {FILE_CINEMA.map((fx) => POSTI_CINEMA_Z.map((fz) => <Poltrona key={`${fx}|${fz}`} x={fx} z={fz} />))}
      {/* corridoio con le lucine a terra verso le file */}
      {[-30.6, -29.2, -27.9, -26.6, -25.3, -24.0].map((x) => <mesh key={x} geometry={GEO.cil} material={matLed("#ffcf7a", 2.4)} position={[x, 0.012, porta[0] + 0.25]} scale={[0.05, 0.01, 0.05]} />)}

      {/* angolo popcorn e tablet all'ingresso */}
      <group position={[x1 - 0.8, 0, z1 - 1.2]}>
        <RoundedBox args={[0.7, 1.0, 0.6]} radius={0.04} smoothness={2} position={[0, 0.5, 0]} material={mat("#c4161c", 0.5)} castShadow />
        {[-0.24, -0.08, 0.08, 0.24].map((dx) => <Box key={dx} p={[dx, 0.5, 0.305]} s={[0.07, 0.96, 0.01]} m={mat("#f6f1e6", 0.6)} ombra={false} />)}
        <mesh geometry={GEO.box} material={MAT_VETRO} position={[0, 1.3, 0]} scale={[0.66, 0.6, 0.56]} />
        {Array.from({ length: 24 }, (_, i) => <mesh key={i} geometry={GEO.sfera} material={mat(i % 3 ? "#ffe3a3" : "#fff4d6", 0.8)} position={[-0.25 + (i % 6) * 0.1, 1.04 + Math.floor(i / 6) * 0.05, -0.2 + ((i * 7) % 5) * 0.1]} scale={0.07} />)}
        <Box p={[0, 1.62, 0]} s={[0.7, 0.06, 0.6]} m={mat("#c4161c", 0.5)} />
        <mesh geometry={GEO.box} material={matLed("#ffe27a", 2.4)} position={[0, 1.66, 0.31]} scale={[0.5, 0.05, 0.01]} />
      </group>
      <Leggio x={x1 - 0.8} z={z0 + 1.0} rot={-Math.PI / 2} tipo="calendario" accento="#ff7a2f" />
      <Leggio x={x1 - 2.2} z={z0 + 1.0} rot={-Math.PI / 2} tipo="reel" accento="#5b2eff" />
    </group>
  );
}
