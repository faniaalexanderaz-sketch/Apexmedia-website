"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* =============================================================
   Piante vere: modelli 3D fotografati da Poly Haven (licenza CC0,
   liberi da diritti), compressi in public/studio/3d. Ogni pianta si
   adatta all'altezza voluta; finché il modello carica si vede la
   pianta disegnata a mano, così la scena non resta mai vuota.
   ============================================================= */

export const MODELLI_PIANTE = {
  alta: "potted_plant_01",
  media: "potted_plant_02",
  pachira: "pachira_aquatica_01",
  calathea: "calathea_orbifolia_01",
  anthurium: "anthurium_botany_01",
  grassa: "potted_plant_04",
  felce: "fern_02",
} as const;
export type TipoPianta = keyof typeof MODELLI_PIANTE;

const url = (t: TipoPianta) => `/studio/3d/${MODELLI_PIANTE[t]}.glb`;

function Modello({ tipo, altezza, rot }: { tipo: TipoPianta; altezza: number; rot: number }) {
  const { scene } = useGLTF(url(tipo));
  const pianta = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    });
    const b = new THREE.Box3().setFromObject(c);
    const s = altezza / Math.max(0.01, b.max.y - b.min.y);
    c.scale.setScalar(s);
    const b2 = new THREE.Box3().setFromObject(c);
    const centro = b2.getCenter(new THREE.Vector3());
    c.position.set(-centro.x, -b2.min.y, -centro.z);
    return c;
  }, [scene, altezza]);
  return <group rotation={[0, rot, 0]}><primitive object={pianta} /></group>;
}

/** Pianta vera alta `altezza` metri; `riserva` si vede mentre il modello arriva. */
export function Pianta3D({ tipo, x, z, altezza, rot = 0, riserva }: { tipo: TipoPianta; x: number; z: number; altezza: number; rot?: number; riserva?: React.ReactNode }) {
  return (
    <group position={[x, 0, z]} userData={{ dinamico: true }}>
      <Suspense fallback={riserva ?? null}><Modello tipo={tipo} altezza={altezza} rot={rot} /></Suspense>
    </group>
  );
}

/** Scarica i modelli appena si apre lo Studio. */
export function precaricaPiante() {
  (Object.keys(MODELLI_PIANTE) as TipoPianta[]).forEach((t) => useGLTF.preload(url(t)));
}
