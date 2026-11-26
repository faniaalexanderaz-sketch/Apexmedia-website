"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GEO, mat } from "./base";

/* =============================================================
   Luci arcobaleno: strisce LED incassate nel pavimento con i
   colori che scorrono, un alone colorato sul marmo nero (finto,
   senza luci vere: non pesa sul telefono) e lampade LED a tubo
   che cambiano colore piano. Un solo materiale per tutte le
   strisce: costa come un oggetto solo.
   ============================================================= */

const V = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
/** Colore arcobaleno che scorre lungo la striscia (u), più intenso al centro (v). */
const F = /* glsl */ `
uniform float uT;
uniform float uScala;
uniform float uForza;
uniform float uAlone;
varying vec2 vUv;
vec3 arcobaleno(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main() {
  vec3 c = arcobaleno(fract(vUv.x * uScala - uT * 0.08));
  float centro = 1.0 - abs(vUv.y - 0.5) * 2.0;
  float a = uAlone > 0.5 ? pow(centro, 2.2) * 0.32 : 1.0;
  gl_FragColor = vec4(c * (uAlone > 0.5 ? 1.0 : uForza), a);
}
`;

function materiale(scala: number, alone: boolean, forza = 2.4) {
  return new THREE.ShaderMaterial({
    vertexShader: V, fragmentShader: F, transparent: alone, depthWrite: !alone, toneMapped: false,
    blending: alone ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uT: { value: 0 }, uScala: { value: scala }, uForza: { value: forza }, uAlone: { value: alone ? 1 : 0 } },
  });
}

/** Una striscia LED nel pavimento da (x1,z1) a (x2,z2), con l'alone colorato attorno. */
function Striscia({ da, a, m, alone }: { da: [number, number]; a: [number, number]; m: THREE.Material; alone: THREE.Material }) {
  const dx = a[0] - da[0], dz = a[1] - da[1], l = Math.hypot(dx, dz), ang = Math.atan2(-dz, dx);
  const p: [number, number, number] = [(da[0] + a[0]) / 2, 0, (da[1] + a[1]) / 2];
  // la u è in metri, misurata da dove parte la striscia: i colori proseguono uguali da una striscia all'altra
  const geo = useMemo(() => [0.08, 1.3].map((largo) => {
    const g = new THREE.PlaneGeometry(l, largo);
    const uv = g.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setX(i, da[0] + uv.getX(i) * l);
    return g;
  }), [l, da]);
  useEffect(() => () => geo.forEach((g) => g.dispose()), [geo]);
  return (
    <group position={p} rotation={[0, ang, 0]}>
      <mesh geometry={geo[0]} material={m} position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh geometry={geo[1]} material={alone} position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} />
    </group>
  );
}

/** Anello LED a terra attorno a un tappeto tondo. */
function Anello({ x, z, r, m, alone }: { x: number; z: number; r: number; m: THREE.Material; alone: THREE.Material }) {
  const geo = useMemo(() => {
    // anello con la u che gira tutto attorno, così i colori corrono in cerchio
    const g = new THREE.RingGeometry(r - 0.025, r + 0.025, 128, 1);
    const g2 = new THREE.RingGeometry(r - 0.55, r + 0.55, 128, 1);
    for (const x of [g, g2]) {
      const pos = x.getAttribute("position"), uv = x.getAttribute("uv");
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), rr = Math.hypot(px, py);
        uv.setXY(i, (Math.atan2(py, px) + Math.PI) / (Math.PI * 2), x === g ? 0.5 : (rr - (r - 0.55)) / 1.1);
      }
    }
    return [g, g2];
  }, [r]);
  useEffect(() => () => geo.forEach((g) => g.dispose()), [geo]);
  return (
    <group position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo[0]} material={m} position={[0, 0, 0.007]} />
      <mesh geometry={geo[1]} material={alone} position={[0, 0, 0.005]} renderOrder={2} />
    </group>
  );
}

/** Lampada LED a tubo: luce piena che cambia colore, alone colorato sul pavimento. */
function Tubo({ x, z, fase, h = 1.7 }: { x: number; z: number; fase: number; h?: number }) {
  const luce = useRef<THREE.MeshBasicMaterial>(null), pozza = useRef<THREE.MeshBasicMaterial>(null);
  const c = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    c.setHSL((clock.elapsedTime * 0.05 + fase) % 1, 1, 0.55);
    luce.current?.color.copy(c).multiplyScalar(2.6);
    pozza.current?.color.copy(c);
  });
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={GEO.cil} material={mat("#16171c", 0.4, 0.6)} position={[0, 0.02, 0]} scale={[0.26, 0.04, 0.26]} />
      <mesh geometry={GEO.cil} position={[0, h / 2 + 0.04, 0]} scale={[0.07, h, 0.07]}><meshBasicMaterial ref={luce} toneMapped={false} /></mesh>
      <mesh geometry={GEO.cil} material={mat("#16171c", 0.4, 0.6)} position={[0, h + 0.06, 0]} scale={[0.09, 0.04, 0.09]} />
      <mesh geometry={GEO.disco} position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.6} renderOrder={2}>
        <meshBasicMaterial ref={pozza} map={texPozza()} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

let pozza: THREE.CanvasTexture | null = null;
function texPozza(): THREE.CanvasTexture {
  if (pozza) return pozza;
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(0.35, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  pozza = new THREE.CanvasTexture(c);
  return pozza;
}

export function LedArcobaleno() {
  const { linea, alone, cerchio, aloneCerchio } = useMemo(() => ({ linea: materiale(0.12, false), alone: materiale(0.12, true), cerchio: materiale(2, false), aloneCerchio: materiale(2, true) }), []);
  useEffect(() => () => { linea.dispose(); alone.dispose(); cerchio.dispose(); aloneCerchio.dispose(); }, [linea, alone, cerchio, aloneCerchio]);
  useFrame(({ clock }) => { for (const m of [linea, alone, cerchio, aloneCerchio]) m.uniforms.uT.value = clock.elapsedTime; });
  return (
    <group userData={{ dinamico: true }}>
      {/* due binari di luce lungo il corridoio centrale, interrotti dove si attraversa */}
      {[-0.15, 1.15].map((z) => (
        <group key={z}>
          <Striscia da={[-20.5, z]} a={[-9.2, z]} m={linea} alone={alone} />
          <Striscia da={[-7.2, z]} a={[7.2, z]} m={linea} alone={alone} />
          <Striscia da={[9.2, z]} a={[20.5, z]} m={linea} alone={alone} />
        </group>
      ))}
      {/* anello attorno alla tua scrivania */}
      <Anello x={0} z={5.2} r={3.95} m={cerchio} alone={aloneCerchio} />
      {/* lampade LED a tubo che cambiano colore */}
      <Tubo x={-22} z={-0.6} fase={0} />
      <Tubo x={-10.6} z={7.6} fase={0.17} />
      <Tubo x={-13.4} z={1.2} fase={0.33} h={1.4} />
      <Tubo x={6.8} z={7.8} fase={0.5} />
      <Tubo x={-6.8} z={7.8} fase={0.66} />
      <Tubo x={22.2} z={-1.5} fase={0.83} />
    </group>
  );
}
