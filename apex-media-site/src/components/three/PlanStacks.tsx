"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

/* Tre pile di tasselli, una per pacchetto: ogni tassello è un contenuto del mese (8, 14, 18).
   I tasselli cadono e si impilano uno dopo l’altro; il tassello in cima al pacchetto più scelto è giallo.
   Il movimento arriva da driver.values.plans, scritto da GSAP.
   La camera guarda quasi di fronte: le tre pile cadono sopra le tre colonne di testo sotto il canvas. */

type PlanInfo = { id: string; contents: number; highlight?: boolean };

const SPACING = 3;
const TILE = 1.45;
const TILE_H = 0.13;
const PITCH = 0.165;
const DROP = 1.6;
const TONES = ["#d6cfc2", "#8f887b", "#1b1c21"];
const YELLOW = "#FFD84D";
const CAM_DIR = new THREE.Vector3(0.18, 0.42, 1).normalize();

const land = gsap.parseEase("back.out(1.5)");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Quanto è avanti la pila numero `s` (0 → 1), dato l’avanzamento complessivo */
export function stackProgress(p: number, s: number) {
  return clamp01((p - s * 0.08) / 0.84);
}

function Framing({ maxTiles }: { maxTiles: number }) {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const tall = maxTiles * PITCH;
    const target = new THREE.Vector3(0, tall * 0.42, 0);
    // Larghezza: tre colonne esatte; altezza: la pila più alta con un po’ d’aria
    const dist = Math.max(
      (SPACING * 1.5) / Math.tan(hfov / 2),
      (tall * 0.62 + 0.4) / Math.tan(vfov / 2),
    );
    cam.position.copy(CAM_DIR).multiplyScalar(dist).add(target);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate, maxTiles]);
  return null;
}

function Stacks({
  driver,
  plans,
  onDone,
}: {
  driver: SceneDriver;
  plans: PlanInfo[];
  onDone: () => void;
}) {
  const tiles = useRef<(THREE.Group | null)[][]>(plans.map(() => []));
  const done = useRef(false);

  useFrame(() => {
    const p = driver.values.plans ?? 1;
    plans.forEach((plan, s) => {
      const local = stackProgress(p, s);
      const n = plan.contents;
      tiles.current[s].forEach((g, k) => {
        if (!g) return;
        // Ogni tassello cade nel suo turno e atterra con un piccolo rimbalzo
        const start = (k / n) * 0.78;
        const t = clamp01((local - start) / 0.22);
        g.position.y = TILE_H / 2 + k * PITCH + (1 - land(t)) * DROP;
        g.visible = t > 0;
      });
    });
    if (!done.current && p >= 1) {
      done.current = true;
      onDone();
    }
  });

  return (
    <group>
      {plans.map((plan, s) => (
        <group key={plan.id} position={[(s - 1) * SPACING, 0, 0]}>
          {Array.from({ length: plan.contents }).map((_, k) => {
            const top = k === plan.contents - 1;
            const color = plan.highlight && top ? YELLOW : TONES[s % TONES.length];
            return (
              <group
                key={k}
                ref={(g) => {
                  tiles.current[s][k] = g;
                }}
                position={[0, TILE_H / 2 + k * PITCH, 0]}
              >
                <RoundedBox
                  args={[TILE, TILE_H, TILE]}
                  radius={0.04}
                  smoothness={driver.light ? 2 : 3}
                >
                  <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    metalness={0}
                    emissive={plan.highlight && top ? YELLOW : "#000000"}
                    emissiveIntensity={plan.highlight && top ? 0.12 : 0}
                  />
                </RoundedBox>
              </group>
            );
          })}
        </group>
      ))}
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
  const told = useRef(false);
  useFrame(() => {
    if (told.current) return;
    told.current = true;
    requestAnimationFrame(onReady);
  });
  return null;
}

export default function PlanStacks({
  driver,
  plans,
  onReady,
}: {
  driver: SceneDriver;
  plans: PlanInfo[];
  onReady: () => void;
}) {
  const light = driver.light;
  const maxTiles = useMemo(() => Math.max(...plans.map((p) => p.contents)), [plans]);
  // Su mobile l’ombra non si ricalcola a ogni frame: una volta all’inizio, una alla fine
  const [settled, setSettled] = useState(false);
  const invalidateRef = useRef<() => void>(() => {});
  return (
    <Canvas
      frameloop="demand"
      dpr={light ? [1, 1.5] : [1, 2]}
      camera={{ fov: 18, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
      onCreated={({ invalidate }) => {
        invalidateRef.current = invalidate;
      }}
    >
      <Bridge driver={driver} onReady={onReady} />
      <Framing maxTiles={maxTiles} />
      <hemisphereLight args={["#ffffff", "#d9d2c5", 0.95]} />
      <directionalLight position={[-5, 8, 7]} intensity={2} color="#fffaf0" />
      <directionalLight position={[6, 3, -3]} intensity={0.5} color="#f1ece2" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 5, 5]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[-7, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
      <Stacks
        driver={driver}
        plans={plans}
        onDone={() => {
          setSettled(true);
          requestAnimationFrame(() => invalidateRef.current());
        }}
      />
      <ContactShadows
        key={light && settled ? "fine" : "inizio"}
        position={[0, -0.001, 0]}
        scale={[SPACING * 3 + 1, 4]}
        far={0.8}
        blur={2.6}
        opacity={0.4}
        color="#2a2620"
        frames={light ? 1 : Infinity}
        resolution={light ? 256 : 512}
      />
    </Canvas>
  );
}
