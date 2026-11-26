"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { JACUZZI, TERRAZZA } from "@/lib/studio/agenti";
import { GEO, MAT_VETRO, mat, matLed, matOttone, tela } from "./base";
import { Oggetto3D, Pianta3D } from "./Piante3D";

/* =============================================================
   Fuori dalle scrivanie: il giardino interno (prato vero, sentiero
   di pietre, cespugli e fiori, albero fiorito, panchine di design,
   luci) e la spa all'aperto sulla terrazza accanto: jacuzzi con
   l'acqua che si muove e le bolle, lettini, asciugamani, luci calde.
   ============================================================= */

type V3 = [number, number, number];
const Box = ({ p, s, r, m, ombra = true, riceve = true }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean; riceve?: boolean }) => <mesh geometry={GEO.box} material={m} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow={riceve} />;

/** Numeri pseudo-casuali ripetibili. */
function caso(seme: number) { let s = seme; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

/* ---------- Trame disegnate ---------- */

function usePrato() {
  return useMemo(() => {
    const t = tela(512, 512, (x, w, h) => {
      const r = caso(7);
      x.fillStyle = "#4d8a3c"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) { const g = x.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 60 + r() * 80); g.addColorStop(0, r() > 0.5 ? "rgba(120,170,70,0.35)" : "rgba(40,90,40,0.3)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h); }
      for (let i = 0; i < 9000; i++) {
        const px = r() * w, py = r() * h, l = 4 + r() * 9, a = -Math.PI / 2 + (r() - 0.5) * 0.9;
        x.strokeStyle = ["#3f7a33", "#5e9e45", "#6fb04f", "#2f6427", "#86c35f"][Math.floor(r() * 5)];
        x.globalAlpha = 0.55; x.lineWidth = 1 + r();
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
      }
      x.globalAlpha = 1;
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.45, 0.45);
    return t;
  }, []);
}

function useDoghe() {
  return useMemo(() => {
    const t = tela(512, 512, (x, w) => {
      const r = caso(19);
      for (let i = 0; i < 8; i++) {
        const y = i * 64;
        const base = ["#9a6a45", "#a87550", "#8f603e", "#b07d55"][i % 4];
        x.fillStyle = base; x.fillRect(0, y, w, 62);
        for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(60,35,20,${0.08 + r() * 0.12})`; x.lineWidth = 1 + r() * 2; const yy = y + 4 + r() * 54; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(w * 0.3, yy + (r() - 0.5) * 8, w * 0.7, yy + (r() - 0.5) * 8, w, yy + (r() - 0.5) * 6); x.stroke(); }
        x.fillStyle = "#3b2618"; x.fillRect(0, y + 62, w, 2);
        const giunto = (i * 197) % w; x.fillRect(giunto, y, 2, 62);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
}

function useMosaico() {
  return useMemo(() => {
    const t = tela(256, 256, (x, w, h) => {
      const r = caso(3);
      x.fillStyle = "#e8f1f2"; x.fillRect(0, 0, w, h);
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        x.fillStyle = ["#2aa7b8", "#38b9c6", "#1f8fa3", "#5fd0d6", "#2a9fb0"][Math.floor(r() * 5)];
        x.fillRect(i * 16 + 1, j * 16 + 1, 14, 14);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
}

/** Alone morbido (vapore, schiuma, bagliori). */
let alone: THREE.CanvasTexture | null = null;
function texAlone(): THREE.CanvasTexture {
  if (alone) return alone;
  alone = tela(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.45, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  return alone;
}

let aloneCaldo: THREE.MeshBasicMaterial | null = null;
const matAlone = () => (aloneCaldo ??= new THREE.MeshBasicMaterial({ map: texAlone(), color: "#ffb860", transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }));

/** Ciuffi d'erba: due piani incrociati con fili d'erba disegnati, ritagliati sulla trasparenza. */
let ciuffo: THREE.CanvasTexture | null = null;
function texCiuffo(): THREE.CanvasTexture {
  if (ciuffo) return ciuffo;
  ciuffo = tela(128, 128, (x, w, h) => {
    const r = caso(11);
    for (let i = 0; i < 46; i++) {
      const bx = 10 + r() * (w - 20), alt = 50 + r() * 74, curva = (r() - 0.5) * 30;
      x.strokeStyle = ["#3f7a33", "#5e9e45", "#7ab957", "#2f6427"][Math.floor(r() * 4)];
      x.lineWidth = 2 + r() * 2; x.lineCap = "round";
      x.beginPath(); x.moveTo(bx, h); x.quadraticCurveTo(bx + curva * 0.3, h - alt * 0.6, bx + curva, h - alt); x.stroke();
    }
  });
  return ciuffo;
}

/** Forma con gli angoli molto arrotondati, distesa sul pavimento. */
function forma(w: number, d: number, raggio: number, spessore: number): THREE.BufferGeometry {
  const s = new THREE.Shape(), x0 = -w / 2, z0 = -d / 2, r = Math.min(raggio, w / 2, d / 2);
  s.moveTo(x0 + r, z0); s.lineTo(x0 + w - r, z0); s.quadraticCurveTo(x0 + w, z0, x0 + w, z0 + r);
  s.lineTo(x0 + w, z0 + d - r); s.quadraticCurveTo(x0 + w, z0 + d, x0 + w - r, z0 + d);
  s.lineTo(x0 + r, z0 + d); s.quadraticCurveTo(x0, z0 + d, x0, z0 + d - r);
  s.lineTo(x0, z0 + r); s.quadraticCurveTo(x0, z0, x0 + r, z0);
  const g = new THREE.ExtrudeGeometry(s, { depth: spessore, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 2, curveSegments: 10 });
  g.rotateX(Math.PI / 2); g.translate(0, spessore, 0);
  return g;
}

/* ---------- Pezzi del giardino ---------- */

/** Panchina di design: doghe di teak su due blocchi di cemento levigato, schienale a doghe sul telaio nero. */
export function PanchinaDesign({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  const teak = mat("#a8743f", 0.45), cemento = mat("#cfcac2", 0.8), nero = mat("#1c1d22", 0.4, 0.6);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {[-0.72, 0.72].map((l) => <RoundedBox key={l} args={[0.24, 0.4, 0.52]} radius={0.04} smoothness={3} position={[l, 0.2, 0]} material={cemento} castShadow receiveShadow />)}
      {Array.from({ length: 6 }, (_, i) => <RoundedBox key={i} args={[1.95, 0.035, 0.075]} radius={0.012} smoothness={2} position={[0, 0.42, -0.22 + i * 0.088]} material={teak} castShadow receiveShadow />)}
      {[-0.72, 0.72].map((l) => <Box key={l} p={[l, 0.66, -0.3]} r={[-0.18, 0, 0]} s={[0.035, 0.5, 0.035]} m={nero} />)}
      {Array.from({ length: 3 }, (_, i) => <RoundedBox key={i} args={[1.95, 0.075, 0.03]} radius={0.01} smoothness={2} position={[0, 0.56 + i * 0.12, -0.31 - i * 0.022]} rotation={[-0.18, 0, 0]} material={teak} castShadow />)}
    </group>
  );
}

/** Lampioncino basso con l'anello di luce calda. */
function Paletto({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={GEO.cil} material={mat("#2a2622", 0.4, 0.7)} position={[0, 0.3, 0]} scale={[0.1, 0.6, 0.1]} castShadow />
      <mesh geometry={GEO.cil} material={matLed("#ffcf8a", 2.6)} position={[0, 0.56, 0]} scale={[0.092, 0.06, 0.092]} />
      <mesh geometry={GEO.cil} material={mat("#2a2622", 0.4, 0.7)} position={[0, 0.61, 0]} scale={[0.13, 0.03, 0.13]} />
      <mesh geometry={GEO.disco} material={matAlone()} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.3} />
    </group>
  );
}

/** Filo di lampadine sospeso tra due pali: curva che pende, lampadine calde. */
function Festone({ da, a, cala = 0.45, n = 14 }: { da: V3; a: V3; cala?: number; n?: number }) {
  const punti = useMemo(() => Array.from({ length: n + 1 }, (_, i) => {
    const k = i / n;
    return new THREE.Vector3(da[0] + (a[0] - da[0]) * k, da[1] + (a[1] - da[1]) * k - Math.sin(k * Math.PI) * cala, da[2] + (a[2] - da[2]) * k);
  }), [da, a, cala, n]);
  const filo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(punti), n * 2, 0.006, 4, false), [punti, n]);
  useEffect(() => () => filo.dispose(), [filo]);
  return (
    <group>
      <mesh geometry={filo} material={mat("#1b1b1f", 0.6)} />
      {punti.slice(1, -1).map((p, i) => <mesh key={i} geometry={GEO.sfera} material={matLed(i % 3 ? "#ffd59a" : "#ffe9c4", 3)} position={[p.x, p.y - 0.05, p.z]} scale={0.055} />)}
    </group>
  );
}

function Palo({ x, z, h = 3.1 }: { x: number; z: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={GEO.cil} material={mat("#1c1d22", 0.4, 0.6)} position={[0, h / 2, 0]} scale={[0.06, h, 0.06]} castShadow />
      <mesh geometry={GEO.cil} material={mat("#1c1d22", 0.4, 0.6)} position={[0, 0.02, 0]} scale={[0.22, 0.04, 0.22]} />
    </group>
  );
}

/** Ciuffi d'erba sparsi sul prato: una sola chiamata di disegno. */
function Erba({ cx, cz, w, d, n = 420 }: { cx: number; cz: number; w: number; d: number; n?: number }) {
  const rif = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const a = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), b = a.clone().rotateY(Math.PI / 2);
    const g = new THREE.BufferGeometry();
    const unite = [a, b].map((x) => x.toNonIndexed());
    const pos = new Float32Array([...unite[0].getAttribute("position").array, ...unite[1].getAttribute("position").array]);
    const uv = new Float32Array([...unite[0].getAttribute("uv").array, ...unite[1].getAttribute("uv").array]);
    const nor = new Float32Array(pos.length); for (let i = 1; i < nor.length; i += 3) nor[i] = 1;
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    return g;
  }, []);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: texCiuffo(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9, color: "#cfe8b5" }), []);
  useEffect(() => () => { geo.dispose(); m.dispose(); }, [geo, m]);
  useEffect(() => {
    const im = rif.current;
    if (!im) return;
    const r = caso(31), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const px = (r() - 0.5) * w, pz = (r() - 0.5) * d;
      // niente erba alta sul sentiero centrale né sotto le panchine
      o.position.set(cx + px, 0.06, cz + pz); o.rotation.set(0, r() * Math.PI, 0);
      const s = 0.14 + r() * 0.16; o.scale.set(s * 1.4, s, s * 1.4);
      o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  }, [cx, cz, w, d, n]);
  return <instancedMesh ref={rif} args={[geo, m, n]} userData={{ dinamico: true }} receiveShadow />;
}

/* ---------- Giardino ---------- */

/** Giardino interno: prato con bordo in travertino, sentiero di pietre, albero fiorito al centro, cespugli, fiori, panchine, luci. */
export function GiardinoNuovo({ alta }: { alta: boolean }) {
  const prato = usePrato();
  useEffect(() => () => prato.dispose(), [prato]);
  const cx = 15.0, cz = 4.4, W = 10.0, D = 6.2;
  const geoPrato = useMemo(() => forma(W, D, 1.4, 0.05), []);
  const geoBordo = useMemo(() => forma(W + 0.36, D + 0.36, 1.55, 0.035), []);
  useEffect(() => () => { geoPrato.dispose(); geoBordo.dispose(); }, [geoPrato, geoBordo]);
  const pietre = useMemo(() => {
    const r = caso(5), out: { p: V3; s: V3; r: number; c: string }[] = [];
    const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(10.4, 0, 1.9), new THREE.Vector3(12.6, 0, 3.2), new THREE.Vector3(14.6, 0, 5.6), new THREE.Vector3(16.8, 0, 6.0), new THREE.Vector3(19.4, 0, 7.1)]);
    for (let i = 0; i <= 16; i++) { const q = curva.getPoint(i / 16); out.push({ p: [q.x + (r() - 0.5) * 0.12, 0.085, q.z + (r() - 0.5) * 0.12], s: [0.26 + r() * 0.08, 0.04, 0.2 + r() * 0.07], r: r() * Math.PI, c: ["#d8d0c2", "#cfc6b6", "#e2dbcf"][i % 3] }); }
    return out;
  }, []);
  const sasso = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 7), []);
  useEffect(() => () => sasso.dispose(), [sasso]);
  return (
    <group>
      <mesh geometry={geoBordo} material={mat("#d9cfbd", 0.75)} position={[cx, 0, cz]} receiveShadow />
      <mesh geometry={geoPrato} position={[cx, 0.03, cz]} receiveShadow>
        <meshStandardMaterial map={prato} roughness={0.95} />
      </mesh>
      <Erba cx={cx} cz={cz} w={W - 1.4} d={D - 1.2} />
      {pietre.map((q, i) => <mesh key={i} geometry={sasso} material={mat(q.c, 0.85)} position={q.p} rotation={[0, q.r, 0]} scale={q.s} receiveShadow />)}
      {/* aiuola di ghiaia attorno all'albero */}
      <mesh geometry={GEO.cil} material={mat("#bdb4a5", 0.95)} position={[15.9, 0.075, 3.6]} scale={[2.6, 0.03, 2.6]} receiveShadow />
      <mesh geometry={GEO.toro} material={mat("#8f8677", 0.8)} position={[15.9, 0.09, 3.6]} rotation={[Math.PI / 2, 0, 0]} scale={[1.3, 1.3, 0.25]} />
      <Pianta3D tipo="jacaranda" x={15.9} z={3.6} altezza={4.4} rot={0.6} riserva={<group><mesh geometry={GEO.cil} material={mat("#6b5a48", 0.9)} position={[15.9, 1.1, 3.6]} scale={[0.22, 2.2, 0.22]} /><mesh geometry={GEO.sfera} material={mat("#9b7ad8", 0.8)} position={[15.9, 3.1, 3.6]} scale={[3.2, 1.8, 3.2]} /></group>} />
      {/* cespugli e fiori veri lungo i bordi */}
      <Pianta3D tipo="cespuglio" x={10.9} z={2.3} altezza={0.9} rot={0.3} />
      <Pianta3D tipo="cespuglio2" x={12.4} z={1.85} altezza={0.75} rot={1.1} />
      <Pianta3D tipo="cespuglio3" x={18.9} z={2.0} altezza={1.0} rot={2.2} />
      <Pianta3D tipo="cespuglio" x={19.4} z={5.0} altezza={0.85} rot={4.0} />
      <Pianta3D tipo="cespuglio2" x={10.7} z={6.2} altezza={0.7} rot={5.1} />
      <Pianta3D tipo="fiori" x={13.6} z={4.6} altezza={0.5} rot={0.2} />
      <Pianta3D tipo="fiori" x={17.6} z={5.0} altezza={0.55} rot={2.4} />
      <Pianta3D tipo="fiori" x={11.6} z={4.4} altezza={0.45} rot={4.4} />
      <Pianta3D tipo="pervinca" x={17.4} z={2.2} altezza={0.32} rot={1.4} />
      <Pianta3D tipo="pervinca" x={14.0} z={2.2} altezza={0.3} rot={3.4} />
      <Pianta3D tipo="pervinca" x={16.2} z={6.9} altezza={0.3} rot={0.4} />
      {/* panchine di design dove si siede chi è in pausa */}
      <PanchinaDesign x={13.4} z={6.8} />
      <PanchinaDesign x={18.6} z={6.8} />
      <Oggetto3D file="planter_box_01" x={15.95} z={7.05} scala={0.9} />
      {/* luci: paletti lungo il sentiero, festoni sopra il prato */}
      {[[11.3, 2.6], [13.5, 4.3], [15.6, 6.4], [18.2, 6.2], [19.6, 3.4], [12.2, 6.6]].map(([x, z], i) => <Paletto key={i} x={x} z={z} />)}
      <Palo x={10.25} z={1.55} /><Palo x={19.85} z={1.55} /><Palo x={10.25} z={7.35} /><Palo x={19.85} z={7.35} />
      <Festone da={[10.25, 3.05, 1.55]} a={[19.85, 3.05, 7.35]} cala={0.7} n={18} />
      <Festone da={[19.85, 3.05, 1.55]} a={[10.25, 3.05, 7.35]} cala={0.7} n={18} />
      <Festone da={[10.25, 3.05, 1.55]} a={[19.85, 3.05, 1.55]} cala={0.4} n={14} />
      <Festone da={[10.25, 3.05, 7.35]} a={[19.85, 3.05, 7.35]} cala={0.4} n={14} />
      {alta ? <pointLight position={[15.9, 0.6, 3.6]} color="#ffd9a8" intensity={5} distance={6} decay={2} /> : null}
    </group>
  );
}

/* ---------- Acqua della jacuzzi ---------- */

const ACQUA_V = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const ACQUA_F = /* glsl */ `
uniform float uT;
uniform vec3 uFondo;
uniform vec3 uChiaro;
uniform vec2 uGetti[4];
varying vec2 vUv;
float onda(vec2 p) {
  return sin(p.x * 7.0 + uT * 1.6) * 0.5 + sin(p.y * 9.0 - uT * 1.3) * 0.5 + sin((p.x + p.y) * 13.0 + uT * 2.4) * 0.3 + sin((p.x - p.y) * 17.0 - uT * 3.1) * 0.15;
}
void main() {
  vec2 p = vUv * 3.0;
  float e = 0.01, h = onda(p);
  vec2 g = vec2(onda(p + vec2(e, 0.0)) - h, onda(p + vec2(0.0, e)) - h) / e;
  // getti: l'acqua ribolle vicino alle bocchette
  float bolle = 0.0;
  for (int i = 0; i < 4; i++) {
    vec2 d = vUv - uGetti[i];
    float r = length(d);
    float k = smoothstep(0.16, 0.0, r);
    g += normalize(d + 1e-4) * sin(r * 90.0 - uT * 9.0) * k * 6.0;
    bolle += k * (0.5 + 0.5 * sin(atan(d.y, d.x) * 9.0 + uT * 7.0 + r * 60.0));
  }
  vec3 n = normalize(vec3(-g * 0.06, 1.0));
  float c = pow(0.5 + 0.5 * sin(p.x * 13.0 + sin(p.y * 11.0 + uT) * 2.0 + uT * 1.7) * sin(p.y * 12.0 + sin(p.x * 9.0 - uT) * 2.0 - uT * 1.3), 3.0);
  float bordo = smoothstep(0.0, 0.18, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  vec3 col = mix(uChiaro, uFondo, bordo * 0.55 + 0.25);
  col += c * 0.3 * vec3(0.75, 1.0, 1.0);
  float luce = pow(max(0.0, dot(n, normalize(vec3(0.35, 1.0, 0.25)))), 80.0);
  float luce2 = pow(max(0.0, dot(n, normalize(vec3(-0.5, 1.0, -0.4)))), 40.0);
  col += luce * 0.9 + luce2 * 0.25 * vec3(1.0, 0.85, 0.6);
  col = mix(col, vec3(0.95, 0.98, 1.0), clamp(bolle * 0.55, 0.0, 0.7));
  gl_FragColor = vec4(col, 0.78 + bolle * 0.15);
  #include <colorspace_fragment>
}
`;

function Acqua({ w, d, y }: { w: number; d: number; y: number }) {
  const m = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ACQUA_V, fragmentShader: ACQUA_F, transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 }, uFondo: { value: new THREE.Color("#0e7f95") }, uChiaro: { value: new THREE.Color("#5fe0e6") }, uGetti: { value: [new THREE.Vector2(0.18, 0.5), new THREE.Vector2(0.82, 0.5), new THREE.Vector2(0.5, 0.82), new THREE.Vector2(0.5, 0.18)] } },
  }), []);
  useEffect(() => () => m.dispose(), [m]);
  const rif = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { const x = rif.current?.material as THREE.ShaderMaterial | undefined; if (x) x.uniforms.uT.value = clock.elapsedTime; });
  return <mesh ref={rif} material={m} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} userData={{ dinamico: true }}><planeGeometry args={[w, d, 1, 1]} /></mesh>;
}

/** Bolle che salgono dalle bocchette e scoppiano in superficie. */
function Bolle({ w, d, fondo, pelo, n = 90 }: { w: number; d: number; fondo: number; pelo: number; n?: number }) {
  const rif = useRef<THREE.InstancedMesh>(null);
  const dati = useMemo(() => {
    const r = caso(13), getti: [number, number][] = [[-0.32, 0], [0.32, 0], [0, 0.32], [0, -0.32]];
    return Array.from({ length: n }, (_, i) => {
      const [gx, gz] = getti[i % 4];
      return { x: (gx + (r() - 0.5) * 0.18) * w, z: (gz + (r() - 0.5) * 0.18) * d, v: 0.35 + r() * 0.5, f: r(), s: 0.01 + r() * 0.022, o: r() * 6 };
    });
  }, [n, w, d]);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: "#eafcff", roughness: 0.05, metalness: 0, transparent: true, opacity: 0.65, emissive: "#9fe9f2", emissiveIntensity: 0.3 }), []);
  useEffect(() => () => m.dispose(), [m]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    const im = rif.current;
    if (!im) return;
    const t = clock.elapsedTime, h = pelo - fondo;
    dati.forEach((b, i) => {
      const k = ((t * b.v) / h + b.f) % 1;
      o.position.set(b.x + Math.sin(t * 3 + b.o) * 0.03 * k, fondo + k * h, b.z + Math.cos(t * 2.6 + b.o) * 0.03 * k);
      o.scale.setScalar(b.s * (0.6 + k * 0.8));
      o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={rif} args={[GEO.sfera, m, n]} userData={{ dinamico: true }} frustumCulled={false} />;
}

/** Vapore leggero che sale dall'acqua calda. */
function Vapore({ w, d, y }: { w: number; d: number; y: number }) {
  const gruppo = useRef<THREE.Group>(null);
  const mats = useMemo(() => Array.from({ length: 6 }, () => new THREE.MeshBasicMaterial({ map: texAlone(), color: "#ffffff", transparent: true, opacity: 0, depthWrite: false })), []);
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  const pos = useMemo(() => { const r = caso(21); return mats.map(() => [(r() - 0.5) * w * 0.7, (r() - 0.5) * d * 0.7, r()] as V3); }, [mats, w, d]);
  useFrame(({ clock, camera }) => {
    const g = gruppo.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.children.forEach((c, i) => {
      const k = (t * 0.12 + pos[i][2]) % 1;
      c.position.set(pos[i][0] + Math.sin(t * 0.4 + i) * 0.15, y + 0.1 + k * 1.3, pos[i][1]);
      c.scale.setScalar(0.6 + k * 1.2);
      c.quaternion.copy(camera.quaternion);
      mats[i].opacity = 0.16 * Math.sin(k * Math.PI);
    });
  });
  return <group ref={gruppo} userData={{ dinamico: true }}>{mats.map((m, i) => <mesh key={i} geometry={GEO.piano} material={m} />)}</group>;
}

/** Paperella che galleggia e gira piano. */
function Paperella({ r, y }: { r: number; y: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime * 0.18;
    g.current.position.set(Math.cos(t) * r, y + Math.sin(clock.elapsedTime * 2.2) * 0.012, Math.sin(t) * r);
    g.current.rotation.set(Math.sin(clock.elapsedTime * 1.7) * 0.08, -t - Math.PI / 2, 0);
  });
  return <group ref={g} userData={{ dinamico: true }}><Oggetto3D file="rubber_duck_toy" x={0} y={-0.03} z={0} altezza={0.11} /></group>;
}

/* ---------- Spa ---------- */

/** Lettino in teak con materasso bianco, schienale alzato, asciugamano a righe viola. Chi ci sta guarda verso +z. */
function Lettino({ x, z, telo }: { x: number; z: number; telo: string }) {
  const teak = mat("#a8743f", 0.45), cuscino = mat("#f3efe7", 0.92);
  return (
    <group position={[x, 0, z]}>
      {/* telaio e gambe */}
      <RoundedBox args={[0.72, 0.06, 1.95]} radius={0.02} smoothness={2} position={[0, 0.27, 0.05]} material={teak} castShadow receiveShadow />
      {[[-0.31, -0.85], [0.31, -0.85], [-0.31, 0.95], [0.31, 0.95]].map(([a, b], i) => <Box key={i} p={[a, 0.12, b]} s={[0.06, 0.24, 0.06]} m={teak} />)}
      {/* materasso: seduta e schienale alzato */}
      <RoundedBox args={[0.68, 0.09, 1.15]} radius={0.04} smoothness={3} position={[0, 0.345, 0.45]} material={cuscino} castShadow receiveShadow />
      <group position={[0, 0.32, -0.12]} rotation={[0.82, 0, 0]}>
        <RoundedBox args={[0.68, 0.09, 0.82]} radius={0.04} smoothness={3} position={[0, 0.03, -0.41]} material={cuscino} castShadow />
        <RoundedBox args={[0.5, 0.1, 0.2]} radius={0.05} smoothness={3} position={[0, 0.1, -0.7]} material={mat(telo, 0.9)} castShadow />
      </group>
      {/* asciugamano piegato in fondo, a righe */}
      <group position={[0, 0.41, 0.82]}>
        <RoundedBox args={[0.6, 0.06, 0.3]} radius={0.02} smoothness={2} material={mat("#ffffff", 0.95)} castShadow />
        {[-0.18, 0, 0.18].map((dx) => <mesh key={dx} geometry={GEO.box} material={mat(telo, 0.95)} position={[dx, 0.031, 0]} scale={[0.05, 0.002, 0.3]} />)}
      </group>
    </group>
  );
}

function Ombrellone({ x, z }: { x: number; z: number }) {
  const telo = useMemo(() => {
    const g = new THREE.ConeGeometry(1.5, 0.45, 4, 1, true);
    g.rotateY(Math.PI / 4);
    return g;
  }, []);
  useEffect(() => () => telo.dispose(), [telo]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={GEO.cil} material={mat("#a8743f", 0.45)} position={[0, 1.3, 0]} scale={[0.05, 2.6, 0.05]} castShadow />
      <mesh geometry={GEO.cil} material={mat("#cfcac2", 0.8)} position={[0, 0.05, 0]} scale={[0.5, 0.1, 0.5]} castShadow />
      <mesh geometry={telo} position={[0, 2.55, 0]} castShadow><meshStandardMaterial color="#cdbd9f" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={GEO.box} material={mat("#5b2eff", 0.8)} position={[0, 2.34, 0]} scale={[2.1, 0.02, 0.02]} rotation={[0, Math.PI / 4, 0]} />
    </group>
  );
}

function Bicchiere({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh geometry={GEO.cil} material={MAT_VETRO} position={[0, 0.07, 0]} scale={[0.07, 0.14, 0.07]} />
      <mesh geometry={GEO.cil} material={mat("#ffb347", 0.2)} position={[0, 0.05, 0]} scale={[0.06, 0.09, 0.06]} />
      <mesh geometry={GEO.cil} material={mat("#c6e34a", 0.5)} position={[0.03, 0.135, 0]} rotation={[0, 0, 1.2]} scale={[0.04, 0.008, 0.04]} />
    </group>
  );
}

/** Spa all'aperto sulla terrazza a destra dell'ufficio. */
export function Spa({ alta }: { alta: boolean }) {
  const doghe = useDoghe(), mosaico = useMosaico();
  useEffect(() => () => { doghe.dispose(); mosaico.dispose(); }, [doghe, mosaico]);
  const { x0, x1, z0, z1 } = TERRAZZA;
  const [jx, jz] = JACUZZI;
  const B = 1.45, C = 0.25; // metà vasca interna, larghezza del bordo in pietra
  const fondo = -1.0, pelo = -0.1, prof = 0.9;
  // la pedana è fatta di quattro pezzi attorno al buco della vasca
  const pezzi: [number, number, number, number][] = [
    [x0, jx - B - C, z0, z1], [jx + B + C, x1, z0, z1], [jx - B - C, jx + B + C, z0, jz - B - C], [jx - B - C, jx + B + C, jz + B + C, z1],
  ];
  const legno = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: doghe, roughness: 0.62 });
    return m;
  }, [doghe]);
  useEffect(() => () => legno.dispose(), [legno]);
  const piastrelle = useMemo(() => new THREE.MeshStandardMaterial({ map: mosaico, roughness: 0.25 }), [mosaico]);
  useEffect(() => () => piastrelle.dispose(), [piastrelle]);
  const pietra = mat("#e3dccf", 0.7), fianco = mat("#3a3530", 0.85);
  return (
    <group>
      {pezzi.map(([a, b, c, d], i) => {
        const w = b - a, dd = d - c;
        return (
          <group key={i}>
            <mesh geometry={GEO.box} material={fianco} position={[(a + b) / 2, -prof / 2 - 0.02, (c + d) / 2]} scale={[w, prof, dd]} receiveShadow />
            <Pedana x={(a + b) / 2} z={(c + d) / 2} w={w} d={dd} m={legno} />
          </group>
        );
      })}
      {/* bordo in pietra della vasca */}
      {[[0, -(B + C / 2), 2 * (B + C), C], [0, B + C / 2, 2 * (B + C), C], [-(B + C / 2), 0, C, 2 * B], [B + C / 2, 0, C, 2 * B]].map(([dx, dz, w, d], i) => (
        <RoundedBox key={i} args={[w, 0.07, d]} radius={0.02} smoothness={2} position={[jx + dx, 0.025, jz + dz]} material={pietra} castShadow receiveShadow />
      ))}
      <group position={[jx, 0, jz]}>
        {/* pareti e fondo in mosaico, gradino-seduta tutto attorno */}
        {[[0, -B, 2 * B, 0], [0, B, 2 * B, Math.PI], [-B, 0, 2 * B, Math.PI / 2], [B, 0, 2 * B, -Math.PI / 2]].map(([dx, dz, w, ry], i) => (
          <mesh key={i} material={piastrelle} position={[dx, (fondo - 0.01) / 2, dz]} rotation={[0, ry, 0]}><planeGeometry args={[w, -fondo]} /></mesh>
        ))}
        <mesh material={piastrelle} position={[0, fondo, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2 * B, 2 * B]} /></mesh>
        {[[0, -B + 0.25, 2 * B, 0.5], [0, B - 0.25, 2 * B, 0.5], [-B + 0.25, 0, 0.5, 2 * B - 1], [B - 0.25, 0, 0.5, 2 * B - 1]].map(([dx, dz, w, d], i) => (
          <mesh key={i} geometry={GEO.box} material={piastrelle} position={[dx, -0.81, dz]} scale={[w, 0.38, d]} />
        ))}
        {/* luci sott'acqua */}
        {[[-B + 0.02, 0.9, Math.PI / 2], [B - 0.02, -0.9, -Math.PI / 2], [0.7, B - 0.02, Math.PI], [-0.7, -B + 0.02, 0]].map(([dx, dz, ry], i) => (
          <mesh key={i} geometry={GEO.disco} material={matLed("#7ff3ff", 2.4)} position={[dx, -0.45, dz]} rotation={[0, ry, 0]} scale={0.14} />
        ))}
        <Acqua w={2 * B} d={2 * B} y={pelo} />
        <Bolle w={2 * B} d={2 * B} fondo={fondo + 0.05} pelo={pelo - 0.02} />
        <Vapore w={2 * B} d={2 * B} y={pelo} />
        <Paperella r={0.55} y={pelo} />
        {/* asciugamani arrotolati sul bordo */}
        {[[-B - 0.12, -B + 0.35], [B + 0.12, B - 0.4]].map(([dx, dz], i) => (
          <group key={i} position={[dx, 0.1, dz]}>
            {[0, 1].map((k) => <mesh key={k} geometry={GEO.cil} material={mat(k ? "#ffffff" : "#d9ccff", 0.95)} position={[0, 0.0 + k * 0.0, k * 0.17]} rotation={[0, 0, Math.PI / 2]} scale={[0.14, 0.2, 0.14]} castShadow />)}
          </group>
        ))}
      </group>
      {alta ? <pointLight position={[jx, 0.35, jz]} color="#6fe6ff" intensity={4} distance={4.5} decay={2} /> : null}
      {/* lettini, ombrelloni, tavolini con le bibite */}
      <Lettino x={25.0} z={-2.0} telo="#5b2eff" />
      <Lettino x={27.4} z={-2.0} telo="#ff7a2f" />
      <Lettino x={29.8} z={-2.0} telo="#17b26a" />
      <Ombrellone x={26.2} z={-2.9} />
      <Ombrellone x={28.6} z={-2.9} />
      <Oggetto3D file="side_table_01" x={26.2} z={-1.35} altezza={0.45} />
      <Oggetto3D file="side_table_01" x={28.6} z={-1.35} altezza={0.45} />
      <Bicchiere p={[26.15, 0.45, -1.35]} />
      <Bicchiere p={[28.65, 0.45, -1.3]} />
      <Oggetto3D file="wicker_basket_02" x={24.1} z={6.9} altezza={0.5} />
      <group position={[24.1, 0.42, 6.9]}>
        {[0, 1, 2].map((k) => <mesh key={k} geometry={GEO.cil} material={mat(["#ffffff", "#d9ccff", "#ffffff"][k], 0.95)} position={[-0.12 + k * 0.12, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.11, 0.34, 0.11]} castShadow />)}
      </group>
      {/* palme in vaso, lanterne, ringhiera di vetro */}
      <Pianta3D tipo="alta" x={31.5} z={-3.1} altezza={2.6} rot={1} />
      <Pianta3D tipo="alta" x={31.5} z={7.9} altezza={2.4} rot={2} />
      <Pianta3D tipo="cespuglio3" x={23.6} z={-3.1} altezza={0.9} rot={0.5} />
      <Pianta3D tipo="cespuglio" x={31.4} z={2.4} altezza={0.8} rot={3} />
      {[[25.4, 6.8], [29.6, 6.8], [31.4, 4.9], [24.0, -1.0]].map(([x, z], i) => <Oggetto3D key={i} file="lantern_01" x={x} z={z} altezza={0.55} rot={i} />)}
      {[[x1 - 0.04, (z0 + z1) / 2, 0.04, z1 - z0], [(x0 + x1) / 2 + 0.2, z0 + 0.04, x1 - x0 - 0.4, 0.04], [(x0 + x1) / 2 + 0.2, z1 - 0.04, x1 - x0 - 0.4, 0.04]].map(([x, z, w, d], i) => (
        <group key={i}>
          <mesh geometry={GEO.box} material={MAT_VETRO} position={[x, 0.55, z]} scale={[w, 1.1, d]} />
          <Box p={[x, 1.11, z]} s={[Math.max(w, 0.05), 0.035, Math.max(d, 0.05)]} m={matOttone()} ombra={false} />
        </group>
      ))}
      {/* striscia LED calda sotto il bordo della pedana */}
      <mesh geometry={GEO.box} material={matLed("#ffb860", 2)} position={[x1 + 0.005, -0.06, (z0 + z1) / 2]} scale={[0.02, 0.025, z1 - z0]} />
      <mesh geometry={GEO.box} material={matLed("#ffb860", 2)} position={[(x0 + x1) / 2, -0.06, z1 + 0.005]} scale={[x1 - x0, 0.025, 0.02]} />
      {/* festoni sopra la terrazza */}
      <Palo x={23.3} z={-3.45} /><Palo x={31.85} z={-3.45} /><Palo x={31.85} z={8.25} /><Palo x={23.3} z={8.25} />
      <Festone da={[23.3, 3.05, -3.45]} a={[31.85, 3.05, -3.45]} cala={0.45} />
      <Festone da={[31.85, 3.05, -3.45]} a={[31.85, 3.05, 8.25]} cala={0.55} />
      <Festone da={[23.3, 3.05, 8.25]} a={[31.85, 3.05, 8.25]} cala={0.45} />
      <Festone da={[23.3, 3.05, -3.45]} a={[31.85, 3.05, 8.25]} cala={0.9} n={20} />
    </group>
  );
}

/** Un pezzo di pedana: le doghe restano a misura (14 cm l'una) qualunque sia la grandezza. */
function Pedana({ x, z, w, d, m }: { x: number; z: number; w: number; d: number; m: THREE.Material }) {
  const g = useMemo(() => {
    const p = new THREE.PlaneGeometry(w, d);
    const uv = p.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 1.12, (uv.getY(i) * d) / 1.12);
    return p;
  }, [w, d]);
  useEffect(() => () => g.dispose(), [g]);
  return <mesh geometry={g} material={m} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />;
}
