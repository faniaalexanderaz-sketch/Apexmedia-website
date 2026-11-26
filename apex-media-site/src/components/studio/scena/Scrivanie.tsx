"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { StatoAgente } from "@/lib/studio/calcoli";
import { GEO, TelaViva, mat, matLed, matLucido, tela } from "./base";
import { SH, SW, disegnaApp, disegnaRiposo } from "./schermi";

/* =============================================================
   La postazione di lavoro: computer tutto-in-uno sottile, portatile
   in alluminio, tastiera, mouse, tazza, quaderno, telefono.
   Design pulito e originale, senza marchi veri. Gli schermi sono
   vivi: per chi lavora l'app del suo mestiere si muove davvero.
   ============================================================= */

type V3 = [number, number, number];

const ALLUMINIO = () => mat("#d4d6dc", 0.28, 0.85);
const GRAFITE = () => mat("#55585f", 0.32, 0.8);
const NERO_VETRO = () => matLucido("#07080b");

/* ---------- Colori e marchio Apex ---------- */

/** Il marchio Apex (le due vele) come forma piatta alta 1, centrata: va dove di solito sta il logo del computer. */
let geoMarchio: THREE.ShapeGeometry | null = null;
function marchioApex(): THREE.ShapeGeometry {
  if (geoMarchio) return geoMarchio;
  const forma = (p: [number, number][]) => { const s = new THREE.Shape(); s.moveTo(p[0][0], -p[0][1]); for (const q of p.slice(1)) s.lineTo(q[0], -q[1]); s.closePath(); return s; };
  const g = new THREE.ShapeGeometry([
    forma([[14, 0], [0, 26], [7.2, 26], [17.6, 6.6]]),
    forma([[18.9, 9.2], [28, 26], [20.9, 26], [15.2, 15.6]]),
    forma([[13.4, 14.2], [17.3, 21.4], [9.5, 21.4]]),
  ]);
  g.translate(-14, 13, 0); g.scale(1 / 26, 1 / 26, 1);
  geoMarchio = g;
  return g;
}
const mescola = (a: string, b: string, k: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
/** I colori del computer di ognuno, dal suo colore personale: retro e piede pieni, mento e tastiera pastello. */
function tinte(accento: string) {
  return { retro: mat(mescola(accento, "#ffffff", 0.18), 0.32, 0.55), mento: mat(mescola(accento, "#ffffff", 0.62), 0.3, 0.45), pastello: mat(mescola(accento, "#ffffff", 0.78), 0.32, 0.4), logo: mat(mescola(accento, "#000000", 0.25), 0.12, 0.9) };
}

/** Più nitidi sul computer, più leggeri sul telefono. */
const nitidezza = () => (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches ? 1 : 1.5);

const fermi = new Map<string, THREE.CanvasTexture>();
/** Schermo fermo: sfondo col marchio per chi è libero, l'app attenuata per chi è in coda. */
function schermoFermo(tipo: string, stato: StatoAgente, accento: string): THREE.CanvasTexture {
  const k = `${tipo}|${stato}|${accento}`;
  const gia = fermi.get(k);
  if (gia) return gia;
  const s = nitidezza();
  const t = tela(Math.round(SW * s), Math.round(SH * s), (x) => {
    x.scale(s, s);
    if (stato === "libero") { disegnaRiposo(x, accento); return; }
    disegnaApp(x, tipo, accento, 3, stato === "attesa");
    if (stato === "coda") { x.fillStyle = "rgba(10,12,18,0.42)"; x.fillRect(0, 0, SW, SH); }
  });
  fermi.set(k, t);
  return t;
}

const _v = new THREE.Vector3();
/** Schermo vivo: per chi lavora (o ti aspetta) l'app si muove tre volte al secondo (sul telefono più piano).
   Si aggiorna solo quando la telecamera è abbastanza vicina da leggerlo: da lontano resta fermo e non costa nulla. */
export function useSchermo(tipo: string, stato: StatoAgente, accento: string, fase: number, dove?: [number, number]): THREE.Texture {
  const vivo = stato === "lavora" || stato === "attesa";
  const viva = useMemo(() => (vivo ? new TelaViva(SW, SH, nitidezza()) : null), [vivo]);
  useEffect(() => () => viva?.dispose(), [viva]);
  const telefono = useMemo(() => nitidezza() === 1, []);
  useFrame(({ clock, camera }) => {
    if (!viva) return;
    if (dove && camera.position.distanceTo(_v.set(dove[0], 1, dove[1])) > (telefono ? 15 : 24) && viva.pronta) return;
    const p = Math.floor(clock.elapsedTime * (telefono ? 1.5 : 3) + fase * 11);
    viva.aggiorna(p, (x) => disegnaApp(x, tipo, accento, p, stato === "attesa"));
  });
  return viva?.t ?? schermoFermo(tipo, stato, accento);
}

/* ---------- Tastiera (trama dei tasti condivisa) ---------- */

let tasti: THREE.CanvasTexture | null = null;
function texTasti(): THREE.CanvasTexture {
  if (tasti) return tasti;
  tasti = tela(512, 160, (x, w, h) => {
    x.fillStyle = "#c9ccd3"; x.fillRect(0, 0, w, h);
    const righe = [14, 14, 13, 12, 11];
    righe.forEach((n, r) => {
      const y = 8 + r * 29, lw = (w - 16) / 14.6;
      let px = 8 + (r === 4 ? 0 : r * 4);
      for (let i = 0; i < n; i++) {
        const largo = r === 4 && i === 4 ? lw * 4.6 : r === 0 && i === 13 ? lw * 1.4 : lw - 4;
        x.fillStyle = "#f4f5f7"; x.beginPath(); x.roundRect(px, y, largo, 24, 4); x.fill();
        px += largo + 4;
      }
    });
  });
  return tasti;
}

export function Tastiera({ p, rot = 0, accento }: { p: V3; rot?: number; accento?: string }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[0.42, 0.01, 0.13]} radius={0.004} smoothness={2} position={[0, 0.005, 0]} material={accento ? tinte(accento).pastello : ALLUMINIO()} />
      <mesh position={[0, 0.0105, 0.004]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.405, 0.112]} /><meshStandardMaterial map={texTasti()} roughness={0.5} /></mesh>
    </group>
  );
}

export function Mouse({ p, accento }: { p: V3; accento?: string }) {
  return <mesh geometry={GEO.sfera} material={accento ? tinte(accento).pastello : mat("#f6f6f8", 0.25)} position={[p[0], p[1] + 0.008, p[2]]} scale={[0.034, 0.018, 0.058]} />;
}

/* ---------- Computer tutto-in-uno ---------- */

/** Computer tutto-in-uno sottile: piede in alluminio inclinato, mento chiaro, cornice nera sottile, luce soffusa dietro. */
export function Computer({ x, y = 0.785, z, rot = 0, largo = 1.0, tipo, stato, accento, fase }: { x: number; y?: number; z: number; rot?: number; largo?: number; tipo: string; stato: StatoAgente; accento: string; fase: number }) {
  const map = useSchermo(tipo, stato, accento, fase, [x, z]);
  const wSchermo = largo - 0.03, hSchermo = (wSchermo * 9) / 16, mento = 0.075 * largo, alto = hSchermo + 0.03 + mento;
  const yc = 0.13 + alto / 2;
  const t = tinte(accento);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {/* piede colorato: base sottile e braccio inclinato */}
      <RoundedBox args={[0.24 * largo, 0.008, 0.19]} radius={0.004} smoothness={2} position={[0, 0.004, 0.02]} material={t.retro} receiveShadow />
      <mesh geometry={GEO.box} material={t.retro} position={[0, 0.13, -0.045]} rotation={[0.2, 0, 0]} scale={[0.18 * largo, 0.27, 0.012]} castShadow />
      {/* luce soffusa dietro, col colore di chi ci lavora: una cornice sottile, così il marchio sul retro resta in vista */}
      {[[0, alto / 2 - 0.01, largo * 0.96, 0.012], [0, -alto / 2 + 0.01, largo * 0.96, 0.012], [-largo / 2 + 0.01, 0, 0.012, alto * 0.94], [largo / 2 - 0.01, 0, 0.012, alto * 0.94]].map(([dx, dy, w, h], i) => (
        <mesh key={i} geometry={GEO.box} material={matLed(accento, stato === "libero" ? 0.35 : 0.9)} position={[dx, yc + dy, -0.021]} rotation={[-0.06, 0, 0]} scale={[w, h, 0.004]} />
      ))}
      <group position={[0, yc, -0.012]} rotation={[-0.06, 0, 0]}>
        <RoundedBox args={[largo, alto, 0.012]} radius={0.006} smoothness={2} material={t.retro} castShadow />
        {/* marchio Apex lucido sul retro, al centro */}
        <mesh geometry={marchioApex()} material={t.logo} position={[0, 0.02, -0.0065]} rotation={[0, Math.PI, 0]} scale={0.16 * largo} />
        <mesh geometry={GEO.box} material={NERO_VETRO()} position={[0, mento / 2, 0.0062]} scale={[largo - 0.006, alto - mento - 0.004, 0.001]} />
        <mesh position={[0, mento / 2, 0.0072]}><planeGeometry args={[wSchermo, hSchermo]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
        {/* mento pastello con il marchio piccolo */}
        <mesh geometry={GEO.box} material={t.mento} position={[0, -alto / 2 + mento / 2, 0.0064]} scale={[largo - 0.004, mento - 0.004, 0.001]} />
        <mesh geometry={marchioApex()} material={t.logo} position={[0, -alto / 2 + mento / 2, 0.0072]} scale={mento * 0.42} />
      </group>
    </group>
  );
}

/* ---------- Portatile ---------- */

/** Portatile in alluminio: tastiera, trackpad, coperchio aperto con lo schermo vivo. Il davanti guarda verso +z (chi lo usa). */
export function Portatile({ x, y = 0.785, z, rot = 0, tipo, stato, accento, fase, scala = 1, grafite }: { x: number; y?: number; z: number; rot?: number; tipo: string; stato: StatoAgente; accento: string; fase: number; scala?: number; grafite?: boolean }) {
  const map = useSchermo(tipo, stato, accento, fase, [x, z]);
  const m = grafite ? GRAFITE() : ALLUMINIO();
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]} scale={scala}>
      <RoundedBox args={[0.34, 0.012, 0.235]} radius={0.005} smoothness={2} position={[0, 0.006, 0]} material={m} castShadow receiveShadow />
      <mesh position={[0, 0.0125, -0.025]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, 0.1]} /><meshStandardMaterial map={texTasti()} roughness={0.5} color={grafite ? "#7d8088" : "#ffffff"} /></mesh>
      <mesh geometry={GEO.box} material={mat(grafite ? "#4d5057" : "#c9cbd1", 0.2, 0.7)} position={[0, 0.0122, 0.07]} scale={[0.11, 0.0008, 0.07]} />
      <group position={[0, 0.012, -0.115]} rotation={[-0.28, 0, 0]}>
        <RoundedBox args={[0.34, 0.225, 0.006]} radius={0.004} smoothness={2} position={[0, 0.1125, -0.003]} material={m} castShadow />
        {/* marchio Apex luminoso sul coperchio */}
        <mesh geometry={marchioApex()} material={matLed("#ffffff", 1.6)} position={[0, 0.118, -0.0063]} rotation={[0, Math.PI, 0]} scale={0.045} />
        <mesh geometry={GEO.box} material={NERO_VETRO()} position={[0, 0.1125, 0.0002]} scale={[0.334, 0.219, 0.001]} />
        <mesh position={[0, 0.116, 0.0012]}><planeGeometry args={[0.318, 0.179]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

/* ---------- Oggetti da scrivania ---------- */

export function Tazza({ p, c }: { p: V3; c: string }) {
  return (
    <group position={p}>
      <mesh geometry={GEO.cil} material={mat(c, 0.35)} position={[0, 0.045, 0]} scale={[0.08, 0.09, 0.08]} castShadow />
      <mesh geometry={GEO.cil} material={mat("#3b2418", 0.25)} position={[0, 0.087, 0]} scale={[0.07, 0.004, 0.07]} />
      <mesh geometry={GEO.toro} material={mat(c, 0.35)} position={[0.045, 0.045, 0]} rotation={[0, 0, 0]} scale={[0.025, 0.028, 0.08]} />
    </group>
  );
}

export function Quaderno({ p, rot = 0, c = "#26324d" }: { p: V3; rot?: number; c?: string }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[0.15, 0.014, 0.21]} radius={0.004} smoothness={2} position={[0, 0.007, 0]} material={mat(c, 0.7)} />
      <mesh geometry={GEO.box} material={mat("#f2ede2", 0.9)} position={[0.002, 0.007, 0]} scale={[0.148, 0.01, 0.2]} />
      <mesh geometry={GEO.box} material={mat("#1b1d26", 0.6)} position={[0.055, 0.0145, 0]} scale={[0.006, 0.002, 0.212]} />
      <mesh geometry={GEO.cil} material={mat("#c39b55", 0.3, 0.8)} position={[0.095, 0.006, 0.01]} rotation={[Math.PI / 2, 0, 0.05]} scale={[0.009, 0.15, 0.009]} />
    </group>
  );
}

export function TelefonoBanco({ p, rot = 0 }: { p: V3; rot?: number }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <RoundedBox args={[0.074, 0.008, 0.152]} radius={0.003} smoothness={2} position={[0, 0.004, 0]} material={mat("#2b2e36", 0.3, 0.6)} />
      <mesh geometry={GEO.box} material={NERO_VETRO()} position={[0, 0.0082, 0]} scale={[0.07, 0.0008, 0.147]} />
    </group>
  );
}
