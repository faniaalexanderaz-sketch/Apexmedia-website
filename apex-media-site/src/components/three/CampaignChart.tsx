"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import type { SceneDriver } from "./driver";

/* Grafico a colonne in 3D: dodici settimane su una base con griglia, una freccia che sale sopra le colonne.
   Tutto il movimento arriva da driver.values (grow, arrow, camera), scritti da GSAP. */

const GAP = 0.66;
const COL = 0.44;
const MAX_H = 3.1;
const BASE_PAD = 0.55;
const BASE_DEPTH = 1.7;
const BASE_H = 0.14;

const INK = new THREE.Color("#17181d");
const PALE = new THREE.Color("#cbc4b6");
const YELLOW = "#FFD84D";

/** Ogni colonna cresce in questa parte del progresso, una dopo l’altra */
const COL_START = 0.045;
const COL_DUR = 0.45;

const backOut = gsap.parseEase("back.out(1.6)");
const camEase = gsap.parseEase("power2.inOut");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Chart({ driver, weeks }: { driver: SceneDriver; weeks: number[] }) {
  const n = weeks.length;
  const max = Math.max(...weeks, 1);
  const width = (n - 1) * GAP;
  const heights = weeks.map((w) => Math.max(0.12, (w / max) * MAX_H));
  const xs = heights.map((_, i) => i * GAP - width / 2);
  const light = driver.light;

  const cols = useRef<(THREE.Group | null)[]>([]);
  const tube = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();

  // Colonne dal grigio caldo chiaro al nero: più contatti, più scure
  const colors = useMemo(
    () => weeks.map((w) => PALE.clone().lerp(INK, clamp01((w / max - 0.15) / 0.85))),
    [weeks, max],
  );

  // Freccia: passa poco sopra la cima di ogni colonna e sale fino a superare l’ultima
  const { curve, geometry, segments, radial } = useMemo(() => {
    const pts = heights.map(
      (h, i) => new THREE.Vector3(xs[i], h + 0.42 + i * 0.012, 0),
    );
    pts.push(
      new THREE.Vector3(
        xs[n - 1] + GAP * 0.7,
        heights[n - 1] + 0.95,
        0,
      ),
    );
    const c = new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5);
    const seg = light ? 110 : 200;
    const rad = light ? 10 : 16;
    return {
      curve: c,
      geometry: new THREE.TubeGeometry(c, seg, 0.055, rad, false),
      segments: seg,
      radial: rad,
    };
  }, [heights, xs, n, light]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Griglia sottile sulla base
  const grid = useMemo(() => {
    const p: number[] = [];
    const x0 = -width / 2 - BASE_PAD;
    const x1 = width / 2 + BASE_PAD;
    const z0 = -BASE_DEPTH / 2;
    const z1 = BASE_DEPTH / 2;
    for (let i = 0; i <= n; i++) {
      const x = -width / 2 - GAP / 2 + i * GAP;
      p.push(x, 0.002, z0, x, 0.002, z1);
    }
    for (let j = 1; j < 4; j++) {
      const z = z0 + (j * BASE_DEPTH) / 4;
      p.push(x0, 0.002, z, x1, 0.002, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [n, width]);
  useEffect(() => () => grid.dispose(), [grid]);

  const tangent = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const { grow = 1, arrow = 1, camera: cam = 1 } = driver.values;

    // Colonne: una dopo l’altra, con un piccolo rimbalzo alla fine
    cols.current.forEach((g, i) => {
      if (!g) return;
      const t = clamp01((grow - i * COL_START) / COL_DUR);
      g.scale.y = Math.max(0.0001, backOut(t));
      g.visible = t > 0;
    });

    // Freccia: si disegna da sinistra a destra, la punta la segue lungo la curva
    const a = clamp01(arrow);
    if (tube.current) {
      tube.current.geometry.setDrawRange(
        0,
        Math.floor(segments * a) * radial * 6,
      );
      tube.current.visible = a > 0.002;
    }
    if (head.current) {
      const u = Math.max(0.001, a);
      head.current.position.copy(curve.getPointAt(u));
      curve.getTangentAt(u, tangent);
      head.current.quaternion.setFromUnitVectors(up, tangent.normalize());
      head.current.scale.setScalar(clamp01(a * 14));
      head.current.visible = a > 0.002;
    }

    // Camera: parte bassa e vicina alle prime colonne, poi sale e si allontana fino a vedere tutto
    const c = camEase(clamp01(cam));
    const aspect = size.width / Math.max(1, size.height);
    const vfov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    // Distanza finale per far stare in inquadratura tutta la base, qualunque sia la forma del canvas
    const fit = Math.max(
      (width / 2 + BASE_PAD + 0.6) / Math.tan(hfov / 2),
      (MAX_H + 1.6) / Math.tan(vfov / 2) / 1.7,
    );
    const endDir = new THREE.Vector3(0.46, 0.42, 0.78).normalize();
    const endTarget = new THREE.Vector3(0.25, MAX_H * 0.42, 0);
    const end = endDir.multiplyScalar(fit * 1.02).add(endTarget);
    const startTarget = new THREE.Vector3(xs[0] + GAP * 1.3, 0.45, 0);
    const start = new THREE.Vector3(xs[0] - 1.1, 0.75, 3.4);
    camPos.lerpVectors(start, end, c);
    target.lerpVectors(startTarget, endTarget, c);
    camera.position.copy(camPos);
    camera.lookAt(target);
  });

  return (
    <group>
      {/* Base */}
      <RoundedBox
        args={[width + BASE_PAD * 2, BASE_H, BASE_DEPTH]}
        radius={0.05}
        smoothness={light ? 2 : 4}
        position={[0, -BASE_H / 2, 0]}
      >
        <meshStandardMaterial color="#e3ddd2" roughness={0.92} metalness={0} />
      </RoundedBox>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color="#c3bbad" transparent opacity={0.75} />
      </lineSegments>

      {/* Colonne: il gruppo cresce dal basso, la colonna dentro è già alta quanto deve essere */}
      {heights.map((h, i) => (
        <group
          key={i}
          ref={(g) => {
            cols.current[i] = g;
          }}
          position={[xs[i], 0, 0]}
        >
          <RoundedBox
            args={[COL, h, COL]}
            radius={0.035}
            smoothness={light ? 2 : 3}
            position={[0, h / 2, 0]}
          >
            <meshStandardMaterial
              color={colors[i]}
              roughness={0.78}
              metalness={0}
            />
          </RoundedBox>
        </group>
      ))}

      {/* Freccia */}
      <mesh ref={tube} geometry={geometry}>
        <meshStandardMaterial color="#17181d" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh ref={head}>
        <coneGeometry args={[0.17, 0.42, light ? 20 : 32]} />
        <meshStandardMaterial
          color={YELLOW}
          emissive={YELLOW}
          emissiveIntensity={0.18}
          roughness={0.5}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

function Bridge({ driver, onReady }: { driver: SceneDriver; onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    driver.listeners.add(invalidate);
    invalidate();
    return () => {
      driver.listeners.delete(invalidate);
    };
  }, [driver, invalidate]);
  // Il primo frame è stato disegnato: ora il canvas può coprire l’immagine statica
  const told = useRef(false);
  useFrame(() => {
    if (told.current) return;
    told.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

export default function CampaignChart({
  driver,
  weeks,
  onReady,
}: {
  driver: SceneDriver;
  weeks: number[];
  onReady: () => void;
}) {
  const light = driver.light;
  return (
    <Canvas
      frameloop="demand"
      dpr={light ? [1, 1.5] : [1, 2]}
      camera={{ fov: 24, near: 0.1, far: 80, position: [-4, 1, 4] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <Bridge driver={driver} onReady={onReady} />
      <hemisphereLight args={["#ffffff", "#d9d2c5", 0.9]} />
      <directionalLight position={[-4, 7, 6]} intensity={2.1} color="#fffaf0" />
      <directionalLight position={[6, 3, -2]} intensity={0.55} color="#f1ece2" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 5, 4]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
      <Chart driver={driver} weeks={weeks} />
      <ContactShadows
        position={[0, -BASE_H - 0.001, 0]}
        scale={[(weeks.length - 1) * GAP + BASE_PAD * 2 + 2.4, BASE_DEPTH + 2.4]}
        far={1.2}
        blur={2.4}
        opacity={0.42}
        color="#2a2620"
        frames={1}
        resolution={light ? 256 : 512}
      />
    </Canvas>
  );
}
