"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import type { Capelli } from "@/lib/studio/agenti";
import { C, GEO, MAT_INVISIBILE, mat, matLuce } from "./base";

/* =============================================================
   Un personaggio: testa grande, felpa colorata, seduto o in piedi.
   Si anima in base a quello che sta facendo: batte sui tasti se
   lavora, alza la mano se aspetta te, si guarda intorno se è libero.
   Quando cambia posto (scrivania ↔ area relax) sparisce e riappare.
   ============================================================= */

export type Umore = "lavora" | "attesa" | "coda" | "libero" | "ospite";
export type Posa = "seduto" | "in_piedi";

type Props = {
  x: number; z: number; rot?: number; y?: number;
  posa?: Posa; umore: Umore;
  felpa: string; pelle: string; capelli: Capelli; coloreCapelli: string;
  /** sfasa le animazioni, così non si muovono tutti insieme */
  fase?: number;
  tazza?: boolean;
  selezionato?: boolean;
  fermo?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

const PANTALONI = "#2c3040", SCARPE = "#f4f4f6";

function Chioma({ tipo, c }: { tipo: Capelli; c: string }) {
  const m = mat(c);
  return (
    <>
      {/* calotta spostata indietro e in alto: lascia scoperto il viso */}
      <mesh geometry={GEO.sfera} material={m} position={[0, 0.045, 0.05]} scale={0.61} castShadow />
      {tipo === "caschetto" ? <mesh geometry={GEO.sfera} material={m} position={[0, -0.09, 0.1]} scale={[0.62, 0.5, 0.5]} castShadow /> : null}
      {tipo === "chignon" ? <mesh geometry={GEO.sfera} material={m} position={[0, 0.31, 0.12]} scale={0.26} castShadow /> : null}
      {tipo === "ciuffo" ? <mesh geometry={GEO.sfera} material={m} position={[0.06, 0.27, -0.15]} scale={[0.3, 0.2, 0.26]} castShadow /> : null}
      {tipo === "ricci" ? [[-0.2, 0.2, 0.05], [0.2, 0.2, 0.05], [0, 0.3, 0.02], [-0.13, 0.1, 0.25], [0.13, 0.1, 0.25], [0, 0.27, -0.14]].map((p, i) => <mesh key={i} geometry={GEO.sfera} material={m} position={p as [number, number, number]} scale={0.25} castShadow />) : null}
    </>
  );
}

export function Personaggio({ x, z, rot = 0, y = 0, posa = "seduto", umore, felpa, pelle, capelli, coloreCapelli, fase = 0, tazza, selezionato, fermo, onClick, children }: Props) {
  const radice = useRef<Group>(null);
  const corpo = useRef<Group>(null);
  const testa = useRef<Group>(null);
  const sx = useRef<Group>(null);
  const dx = useRef<Group>(null);
  const anello = useRef<Mesh>(null);
  const qui = useRef({ x, z, rot, y, scala: 1 });
  const [posaVista, setPosaVista] = useState(posa);
  const [sopra, setSopra] = useState(false);
  const inPiedi = posaVista === "in_piedi";

  useFrame((stato, dtGrezzo) => {
    const r = radice.current, q = qui.current;
    if (!r) return;
    const dt = Math.min(dtGrezzo, 0.05);
    const t = stato.clock.elapsedTime + fase * 1.7;

    // cambio di posto: si rimpicciolisce, si sposta, ricompare
    if (q.x !== x || q.z !== z) {
      q.scala -= dt * 5;
      if (q.scala <= 0.02) { q.x = x; q.z = z; q.rot = rot; q.y = y; q.scala = 0.02; setPosaVista(posa); }
    } else {
      q.scala = Math.min(1, q.scala + dt * 3.5);
      q.rot = rot; q.y = y;
    }
    const s = 1 - Math.pow(1 - q.scala, 3);
    r.position.set(q.x, q.y, q.z);
    r.rotation.y = q.rot;
    r.scale.setScalar(s * (sopra ? 1.06 : 1));

    if (anello.current) {
      const visibile = selezionato || umore === "attesa";
      anello.current.visible = visibile;
      if (visibile) { const p = 1 + Math.sin(t * 3) * 0.06; anello.current.scale.set(1.5 * p, 1.5 * p, 1); }
    }
    if (fermo) return;

    const verso = (o: Group | null, asse: "x" | "y" | "z", a: number, k = 8) => { if (o) o.rotation[asse] += (a - o.rotation[asse]) * Math.min(1, dt * k); };
    let bS = 0.75, bD = 0.75, bDz = 0, tX = 0, tY = 0, corpoX = -0.08;
    if (inPiedi) { bS = 0.12; bD = tazza ? 1.35 : 0.12; tY = Math.sin(t * 0.6) * 0.25; corpoX = 0; }
    else if (umore === "lavora") { bS = 1.12 + Math.sin(t * 15) * 0.07; bD = 1.12 + Math.sin(t * 15 + 2.1) * 0.07; tX = 0.1 + Math.sin(t * 1.8) * 0.03; tY = Math.sin(t * 0.7) * 0.06; corpoX = -0.14; }
    else if (umore === "attesa") { bS = 0.95; bD = 2.75; bDz = 0.6 + Math.sin(t * 5) * 0.25; tY = 0.75; tX = -0.1; corpoX = -0.04; }
    else if (umore === "coda") { bS = 0.95; bD = 0.95; tY = Math.sin(t * 0.5) * 0.35; tX = Math.sin(t * 0.9) * 0.04; }
    else if (umore === "ospite") { bS = 0.9; bD = 0.9; tY = Math.sin(t * 0.45) * 0.4; tX = -0.05; }
    else { bS = tazza ? 0.6 : 0.5; bD = tazza ? 1.25 : 0.5; tY = Math.sin(t * 0.4) * 0.45; tX = -0.08; corpoX = 0.06; }
    verso(sx.current, "x", bS); verso(dx.current, "x", bD); verso(dx.current, "z", bDz, 12);
    verso(testa.current, "x", tX, 5); verso(testa.current, "y", tY, 4);
    verso(corpo.current, "x", corpoX, 4);
    if (corpo.current) corpo.current.position.y = (inPiedi ? 0.1 : 0) + Math.sin(t * 1.6) * 0.008;
  });

  const tocca = onClick ? {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onClick(); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setSopra(true); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { setSopra(false); document.body.style.cursor = ""; },
  } : {};

  return (
    <group ref={radice} position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh ref={anello} geometry={GEO.anello} material={matLuce(selezionato ? C.viola : C.oro, 0.9)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03 - y, 0]} visible={false} />
      <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 0.95, -0.05]} scale={[1.15, 1.9, 1.15]} {...tocca} />

      {/* gambe */}
      {inPiedi ? (
        <>
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[-0.1, 0.36, 0]} scale={[1, 1.35, 1]} castShadow />
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[0.1, 0.36, 0]} scale={[1, 1.35, 1]} castShadow />
          <mesh geometry={GEO.box} material={mat(SCARPE)} position={[-0.1, 0.05, -0.04]} scale={[0.15, 0.1, 0.26]} castShadow />
          <mesh geometry={GEO.box} material={mat(SCARPE)} position={[0.1, 0.05, -0.04]} scale={[0.15, 0.1, 0.26]} castShadow />
        </>
      ) : (
        <>
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[-0.11, 0.6, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[0.11, 0.6, -0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[-0.11, 0.36, -0.4]} castShadow />
          <mesh geometry={GEO.gamba} material={mat(PANTALONI)} position={[0.11, 0.36, -0.4]} castShadow />
          <mesh geometry={GEO.box} material={mat(SCARPE)} position={[-0.11, 0.1, -0.45]} scale={[0.15, 0.1, 0.26]} castShadow />
          <mesh geometry={GEO.box} material={mat(SCARPE)} position={[0.11, 0.1, -0.45]} scale={[0.15, 0.1, 0.26]} castShadow />
        </>
      )}

      <group ref={corpo} rotation={[-0.08, 0, 0]}>
        {/* busto, cappuccio */}
        <mesh geometry={GEO.busto} material={mat(felpa)} position={[0, 0.88, 0]} castShadow />
        <mesh geometry={GEO.sfera} material={mat(felpa)} position={[0, 1.07, 0.15]} scale={[0.34, 0.2, 0.24]} castShadow />

        {/* braccia: il perno è la spalla */}
        <group ref={sx} position={[-0.25, 1.02, 0]} rotation={[0.75, 0, 0]}>
          <mesh geometry={GEO.braccio} material={mat(felpa)} position={[0, -0.2, 0]} castShadow />
          <mesh geometry={GEO.sfera} material={mat(pelle)} position={[0, -0.44, 0]} scale={0.15} castShadow />
        </group>
        <group ref={dx} position={[0.25, 1.02, 0]} rotation={[0.75, 0, 0]}>
          <mesh geometry={GEO.braccio} material={mat(felpa)} position={[0, -0.2, 0]} castShadow />
          <mesh geometry={GEO.sfera} material={mat(pelle)} position={[0, -0.44, 0]} scale={0.15} castShadow />
          {tazza ? <mesh geometry={GEO.cil} material={mat(C.bianco)} position={[0, -0.5, -0.07]} rotation={[-1.3, 0, 0]} scale={[0.13, 0.15, 0.13]} castShadow /> : null}
        </group>

        {/* testa */}
        <group ref={testa} position={[0, 1.37, -0.02]}>
          <mesh geometry={GEO.sfera} material={mat(pelle)} scale={0.58} castShadow />
          <Chioma tipo={capelli} c={coloreCapelli} />
          <mesh geometry={GEO.sfera} material={mat("#1b1d26")} position={[-0.1, -0.01, -0.268]} scale={0.062} />
          <mesh geometry={GEO.sfera} material={mat("#1b1d26")} position={[0.1, -0.01, -0.268]} scale={0.062} />
          <mesh geometry={GEO.sfera} material={mat("#f29b8a")} position={[-0.19, -0.09, -0.2]} scale={[0.09, 0.05, 0.05]} />
          <mesh geometry={GEO.sfera} material={mat("#f29b8a")} position={[0.19, -0.09, -0.2]} scale={[0.09, 0.05, 0.05]} />
        </group>
      </group>
      {children}
    </group>
  );
}

/** Sedia da ufficio nera con base a stella. `rot` come il personaggio che ci si siede. */
export function Sedia({ x, z, rot = 0, c = "#252832" }: { x: number; z: number; rot?: number; c?: string }) {
  const m = mat(c);
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh geometry={GEO.box} material={m} position={[0, 0.5, 0.02]} scale={[0.54, 0.09, 0.52]} castShadow />
      <mesh geometry={GEO.box} material={m} position={[0, 0.88, 0.27]} rotation={[0.1, 0, 0]} scale={[0.5, 0.58, 0.07]} castShadow />
      <mesh geometry={GEO.cil} material={m} position={[0, 0.28, 0.02]} scale={[0.08, 0.38, 0.08]} />
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} geometry={GEO.box} material={m} position={[Math.sin((i * Math.PI * 2) / 5) * 0.17, 0.07, 0.02 + Math.cos((i * Math.PI * 2) / 5) * 0.17]} rotation={[0, (i * Math.PI * 2) / 5, 0]} scale={[0.05, 0.04, 0.36]} castShadow />)}
    </group>
  );
}
