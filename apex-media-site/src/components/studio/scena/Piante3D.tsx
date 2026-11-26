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

/** Arredi veri (stessa libreria, stesse regole): sedie, lampade, divano, poltrona, tavolino, oggetti. */
export const MODELLI_ARREDI = ["modern_arm_chair_01", "desk_lamp_arm_01", "sofa_03", "mid_century_lounge_chair", "modern_coffee_table_01", "marble_bust_01", "wall_clock", "brass_vase_02", "stationery_supplies"] as const;
export type Arredo = (typeof MODELLI_ARREDI)[number];

const url = (t: TipoPianta) => `/studio/3d/${MODELLI_PIANTE[t]}.glb`;
const urlFile = (f: string) => `/studio/3d/${f}.glb`;

/** Un modello qualsiasi: a misura reale per `scala`, oppure portato ad `altezza` metri; poggiato sul piano y. */
function ModelloFile({ file, altezza, scala, rot }: { file: string; altezza?: number; scala?: number; rot: number }) {
  const { scene } = useGLTF(urlFile(file));
  const ogg = useMemo(() => {
    const c = scene.clone(true);
    const b = new THREE.Box3().setFromObject(c);
    const k = altezza ? altezza / Math.max(0.01, b.max.y - b.min.y) : scala ?? 1;
    // gli oggetti piccoli non proiettano ombre: costano tanto e non si notano
    const ombra = (b.max.y - b.min.y) * k > 0.5;
    c.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = ombra; m.receiveShadow = true; } });
    c.scale.setScalar(k);
    const b2 = new THREE.Box3().setFromObject(c);
    const centro = b2.getCenter(new THREE.Vector3());
    c.position.set(-centro.x, -b2.min.y, -centro.z);
    return c;
  }, [scene, altezza, scala]);
  return <group rotation={[0, rot, 0]}><primitive object={ogg} /></group>;
}

export function Oggetto3D({ file, x, y = 0, z, altezza, scala, rot = 0, riserva }: { file: Arredo; x: number; y?: number; z: number; altezza?: number; scala?: number; rot?: number; riserva?: React.ReactNode }) {
  return (
    <group position={[x, y, z]} userData={{ dinamico: true }}>
      <Suspense fallback={riserva ?? null}><ModelloFile file={file} altezza={altezza} scala={scala} rot={rot} /></Suspense>
    </group>
  );
}


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
  MODELLI_ARREDI.forEach((f) => useGLTF.preload(urlFile(f)));
}
