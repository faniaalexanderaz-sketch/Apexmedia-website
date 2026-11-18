"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
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

/* Quattro blocchi impilati, uno per canale, alti in proporzione ai contatti.
   Salgono uno dopo l’altro e si incastrano sopra il precedente; l’etichetta entra accanto.
   Il movimento arriva da driver.values.stack, scritto da GSAP.
   Le etichette sono testo HTML sopra il canvas: a ogni frame si proietta sullo schermo
   il punto accanto a ciascun blocco e l’etichetta si sposta lì. */

type Channel = { label: string; value: number };

const SIDE = 1.5;
const TOTAL_H = 3.3;
const GAP = 0.05;
const STACK_X = -0.55;
const TONES = ["#17181d", "#4b4840", "#958e80", "#d3ccbe"];
const CAM_DIR = new THREE.Vector3(5.2, 4.4, 8.2).normalize();
const CAM_TARGET = new THREE.Vector3(0.55, TOTAL_H * 0.5, 0);

const backOut = gsap.parseEase("back.out(1.5)");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const BLOCK_START = 0.2;
const BLOCK_DUR = 0.4;

function useBlocks(channels: Channel[]) {
  return useMemo(() => {
    const total = channels.reduce((s, c) => s + c.value, 0) || 1;
    const hs = channels.map((c) => Math.max(0.16, (c.value / total) * TOTAL_H));
    return channels.map((c, i) => {
      // Base del blocco: somma delle altezze sotto di lui, più gli spazi
      const below = hs.slice(0, i).reduce((s, h) => s + h + GAP, 0);
      return { ...c, h: hs[i], y: below + hs[i] / 2, tone: TONES[i % TONES.length] };
    });
  }, [channels]);
}

/** Inquadratura: abbastanza lontana da contenere pila ed etichette, qualunque sia la forma del canvas */
function Framing() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const dist = Math.max(
      (TOTAL_H / 2 + 0.75) / Math.tan(vfov / 2),
      2.75 / Math.tan(hfov / 2),
    );
    cam.position.copy(CAM_DIR).multiplyScalar(dist).add(CAM_TARGET);
    cam.lookAt(CAM_TARGET);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

function Stack({
  driver,
  channels,
  labels,
  onDone,
}: {
  driver: SceneDriver;
  channels: Channel[];
  labels: RefObject<(HTMLDivElement | null)[]>;
  onDone: () => void;
}) {
  const blocks = useBlocks(channels);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const done = useRef(false);
  const v = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();

  useFrame(() => {
    const s = driver.values.stack ?? 1;
    blocks.forEach((b, i) => {
      const t = clamp01((s - i * BLOCK_START) / BLOCK_DUR);
      const g = groups.current[i];
      if (g) {
        const e = backOut(t);
        // Sale dal basso e si appoggia sopra il blocco precedente
        g.position.y = b.y - (1 - e) * 0.9;
        g.scale.setScalar(Math.max(0.0001, Math.min(1, t * 1.6)));
        g.visible = t > 0;
      }
      const l = labels.current?.[i];
      const a = anchors.current[i];
      if (l && a) {
        // Il punto accanto al blocco, nella sua posizione finale, proiettato sullo schermo
        a.getWorldPosition(v);
        v.y += b.y - (g?.position.y ?? b.y);
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * size.width;
        const y = (-v.y * 0.5 + 0.5) * size.height;
        const lt = clamp01((t - 0.45) / 0.45);
        l.style.opacity = String(lt);
        l.style.transform = `translate3d(${x + (1 - lt) * 14}px, ${y}px, 0) translateY(-50%)`;
      }
    });
    if (!done.current && s >= 1) {
      done.current = true;
      onDone();
    }
  });

  return (
    <group position={[STACK_X, 0, 0]}>
      {blocks.map((b, i) => (
        <group
          key={b.label}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={[0, b.y, 0]}
        >
          <RoundedBox
            args={[SIDE, b.h, SIDE]}
            radius={Math.min(0.06, b.h / 3)}
            smoothness={driver.light ? 2 : 4}
          >
            <meshStandardMaterial color={b.tone} roughness={0.8} metalness={0} />
          </RoundedBox>
          {/* Angolo destro posteriore: è il punto più a destra del blocco visto da questa camera */}
          <object3D
            ref={(o) => {
              anchors.current[i] = o;
            }}
            position={[SIDE / 2 + 0.28, 0, -SIDE / 2]}
          />
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

export default function ChannelStack({
  driver,
  channels,
  onReady,
}: {
  driver: SceneDriver;
  channels: Channel[];
  onReady: () => void;
}) {
  const light = driver.light;
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  // Su mobile l’ombra non si ricalcola a ogni frame: si scatta una volta all’inizio e una alla fine
  const [settled, setSettled] = useState(false);
  const invalidateRef = useRef<() => void>(() => {});
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        frameloop="demand"
        dpr={light ? [1, 1.5] : [1, 2]}
        camera={{ fov: 22, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ touchAction: "pan-y" }}
        onCreated={({ invalidate }) => {
          invalidateRef.current = invalidate;
        }}
      >
        <Bridge driver={driver} onReady={onReady} />
        <Framing />
        <hemisphereLight args={["#ffffff", "#d9d2c5", 0.9]} />
        <directionalLight position={[-4, 7, 6]} intensity={2.1} color="#fffaf0" />
        <directionalLight position={[6, 3, -3]} intensity={0.5} color="#f1ece2" />
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={1.6} position={[0, 5, 4]} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={0.6} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
        <Stack
          driver={driver}
          channels={channels}
          labels={labels}
          onDone={() => {
            setSettled(true);
            requestAnimationFrame(() => invalidateRef.current());
          }}
        />
        <ContactShadows
          key={light && settled ? "fine" : "inizio"}
          position={[STACK_X, -0.001, 0]}
          scale={6}
          far={0.9}
          blur={3}
          opacity={0.38}
          color="#2a2620"
          frames={light ? 1 : Infinity}
          resolution={light ? 256 : 512}
        />
      </Canvas>
      {channels.map((c, i) => (
        <div
          key={c.label}
          ref={(el) => {
            labels.current[i] = el;
          }}
          className="channel-label"
          style={{ opacity: 0 }}
        >
          <span className="channel-label-name">{c.label}</span>
          <span className="channel-label-value">{c.value}</span>
        </div>
      ))}
    </div>
  );
}
