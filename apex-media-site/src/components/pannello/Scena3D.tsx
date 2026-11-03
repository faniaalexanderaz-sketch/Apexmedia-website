"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import type { Group } from "three";

/* Goccia di vetro verde-oro: ruota piano, segue il mouse con un
   parallasse leggero. Solo desktop con mouse e senza reduced-motion;
   altrimenti l'illustrazione SVG statica. Nessuna texture, 30 fps. */

function Goccia({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => {
    const o = g.current;
    if (!o) return;
    o.rotation.y += dt * 0.25;
    o.rotation.x += (mouse.current.y * 0.35 - o.rotation.x) * 0.06;
    o.rotation.z += (-mouse.current.x * 0.25 - o.rotation.z) * 0.06;
    o.position.x += (mouse.current.x * 0.25 - o.position.x) * 0.06;
    o.position.y += (-mouse.current.y * 0.2 - o.position.y) * 0.06;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <group ref={g}>
        <mesh scale={[1, 1.22, 1]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial color="#4f9a74" roughness={0.06} metalness={0.02} clearcoat={1} clearcoatRoughness={0.05} transmission={0.75} thickness={0.9} ior={1.45} envMapIntensity={1.8} attenuationColor="#c9a96e" attenuationDistance={2.5} />
        </mesh>
        <mesh position={[0.35, 0.55, 0.6]} scale={0.22}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial color="#e8cf98" roughness={0.1} metalness={0.9} clearcoat={1} envMapIntensity={1.6} />
        </mesh>
      </group>
    </Float>
  );
}

function Limita30fps() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let vivo = true;
    const loop = () => { if (!vivo) return; invalidate(); setTimeout(loop, 1000 / 30); };
    loop();
    return () => { vivo = false; };
  }, [invalidate]);
  return null;
}

export function IllustrazioneGoccia() {
  return (
    <svg viewBox="0 0 200 200" className="p-scena" aria-hidden="true">
      <defs>
        <radialGradient id="gocciaV" cx="38%" cy="30%" r="75%"><stop offset="0%" stopColor="#6fa98b" /><stop offset="55%" stopColor="#2f6b4f" /><stop offset="100%" stopColor="#163a2b" /></radialGradient>
        <radialGradient id="gocciaO" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#f3e2b8" /><stop offset="100%" stopColor="#b08f52" /></radialGradient>
      </defs>
      <ellipse cx="100" cy="104" rx="62" ry="76" fill="url(#gocciaV)" />
      <ellipse cx="78" cy="68" rx="18" ry="26" fill="#fff" opacity=".28" />
      <circle cx="122" cy="70" r="14" fill="url(#gocciaO)" />
      <ellipse cx="100" cy="186" rx="44" ry="7" fill="#1f4d3a" opacity=".12" />
    </svg>
  );
}

export function Scena3D() {
  const mouse = useRef({ x: 0, y: 0 });
  const [attiva] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1100px) and (hover: hover) and (prefers-reduced-motion: no-preference)").matches);
  useEffect(() => {
    if (!attiva) return;
    const onMove = (e: MouseEvent) => { mouse.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }; };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [attiva]);
  if (!attiva) return <IllustrazioneGoccia />;
  return (
    <div className="p-scena">
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0, 4.2], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <Limita30fps />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} color="#fff6e3" />
        <pointLight position={[-2.5, -1.5, 2.5]} intensity={6} color="#c9a96e" distance={8} />
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[2, 3, 2]} scale={[4, 2, 1]} color="#fff2cf" />
          <Lightformer intensity={1} position={[-3, -1, 2]} scale={[3, 3, 1]} color="#bfe3cf" />
          <Lightformer intensity={0.6} position={[0, -3, -2]} scale={[5, 2, 1]} color="#c9a96e" />
        </Environment>
        <Goccia mouse={mouse} />
      </Canvas>
    </div>
  );
}
