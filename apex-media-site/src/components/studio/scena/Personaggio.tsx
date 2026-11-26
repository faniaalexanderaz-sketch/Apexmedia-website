"use client";

import { Oggetto3D } from "./Piante3D";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Capelli, Punto } from "@/lib/studio/agenti";
import { C, GEO, MAT_INVISIBILE, mat, matLucido, matLuce, matMetallo, tela, matLed } from "./base";

/* =============================================================
   Un membro del team: testa grande, divisa Apex con il logo sulla
   schiena, gambe e braccia articolate. Cammina lungo i corridoi
   quando cambia posto (scrivania, area relax, la tua scrivania),
   si siede, scrive al computer, alza la mano se aspetta te.
   ============================================================= */

export type Umore = "lavora" | "attesa" | "coda" | "libero" | "visita" | "ospite";

type Props = {
  /** dove deve andare; se cambia, ci arriva a piedi */
  meta: Punto;
  instrada: (da: { x: number; z: number }, a: { x: number; z: number }) => [number, number][];
  umore: Umore;
  divisa: string;
  accento: string;
  pelle: string;
  capelli: Capelli;
  coloreCapelli: string;
  extra?: "cuffie" | "microfono" | "occhiali";
  fase?: number;
  tazza?: boolean;
  /** in pausa sigaretta nell'angolo fumatori */
  fumo?: boolean;
  selezionato?: boolean;
  /** true per i clienti: niente logo Apex sulla schiena */
  ospite?: boolean;
  /** grandezza della persona rispetto agli arredi */
  scala?: number;
  onClick?: () => void;
  /** etichetta o fumetto, segue la testa */
  children?: React.ReactNode;
};

const PANTALONI = "#262a3a", SCARPE = "#f6f6f8", SUOLA = "#d8d9de";
const VELOCITA = 2.7;
const ALTEZZA_ANCA = 0.6;

/** Logo Apex e scritta APEX bianchi su trasparente, per la schiena delle divise. */
let logoSchiena: THREE.CanvasTexture | null = null;
function texLogo(): THREE.CanvasTexture {
  if (logoSchiena) return logoSchiena;
  logoSchiena = tela(160, 200, (x) => {
    x.fillStyle = "#ffffff";
    x.save(); x.translate(30, 14); x.scale(3.6, 3.6);
    x.beginPath(); x.moveTo(14, 0); x.lineTo(0, 26); x.lineTo(7.2, 26); x.lineTo(17.6, 6.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(18.9, 9.2); x.lineTo(28, 26); x.lineTo(20.9, 26); x.lineTo(15.2, 15.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(13.4, 14.2); x.lineTo(17.3, 21.4); x.lineTo(9.5, 21.4); x.closePath(); x.fill();
    x.restore();
    x.font = "800 38px Arial, Helvetica, sans-serif"; x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillText("APEX", 80, 160);
    x.font = "700 20px Arial, Helvetica, sans-serif";
    x.fillText("MEDIA", 80, 188);
  });
  return logoSchiena;
}
let logoPetto: THREE.CanvasTexture | null = null;
function texPetto(): THREE.CanvasTexture {
  if (logoPetto) return logoPetto;
  logoPetto = tela(64, 64, (x) => {
    x.fillStyle = "#ffffff"; x.translate(6, 8); x.scale(1.85, 1.85);
    x.beginPath(); x.moveTo(14, 0); x.lineTo(0, 26); x.lineTo(7.2, 26); x.lineTo(17.6, 6.6); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(18.9, 9.2); x.lineTo(28, 26); x.lineTo(20.9, 26); x.lineTo(15.2, 15.6); x.closePath(); x.fill();
  });
  return logoPetto;
}

function Chioma({ tipo, c }: { tipo: Capelli; c: string }) {
  const m = mat(c, 0.85);
  return (
    <>
      <mesh geometry={GEO.sfera} material={m} position={[0, 0.045, 0.05]} scale={0.61} castShadow />
      {tipo === "caschetto" ? <mesh geometry={GEO.sfera} material={m} position={[0, -0.09, 0.1]} scale={[0.62, 0.5, 0.5]} /> : null}
      {tipo === "chignon" ? <mesh geometry={GEO.sfera} material={m} position={[0, 0.31, 0.12]} scale={0.26} /> : null}
      {tipo === "ciuffo" ? <mesh geometry={GEO.sfera} material={m} position={[0.06, 0.27, -0.15]} scale={[0.3, 0.2, 0.26]} /> : null}
      {tipo === "ricci" ? [[-0.2, 0.2, 0.05], [0.2, 0.2, 0.05], [0, 0.3, 0.02], [-0.13, 0.1, 0.25], [0.13, 0.1, 0.25], [0, 0.27, -0.14]].map((p, i) => <mesh key={i} geometry={GEO.sfera} material={m} position={p as [number, number, number]} scale={0.25} />) : null}
    </>
  );
}

function Accessorio({ tipo }: { tipo: NonNullable<Props["extra"]> }) {
  if (tipo === "occhiali") {
    return (
      <group position={[0, -0.01, -0.285]}>
        {[-0.1, 0.1].map((x) => <mesh key={x} geometry={GEO.toro} material={mat("#1b1d26", 0.4)} position={[x, 0, 0]} scale={0.13} />)}
        <mesh geometry={GEO.box} material={mat("#1b1d26", 0.4)} position={[0, 0.01, 0]} scale={[0.07, 0.012, 0.012]} />
      </group>
    );
  }
  return (
    <group>
      <mesh geometry={GEO.arco} material={mat("#1b1d26", 0.35)} position={[0, 0.06, 0.02]} scale={1.03} />
      {[-0.31, 0.31].map((x) => <mesh key={x} geometry={GEO.cil} material={mat("#1b1d26", 0.35)} position={[x, 0.0, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[0.17, 0.07, 0.17]} />)}
      {[-0.35, 0.35].map((x) => <mesh key={`l${x}`} geometry={GEO.cil} material={matLuce(C.viola)} position={[x, 0.0, 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.01, 0.1]} />)}
      {tipo === "microfono" ? <mesh geometry={GEO.cil} material={mat("#1b1d26", 0.35)} position={[0.22, -0.13, -0.17]} rotation={[0.9, 0.4, 0]} scale={[0.022, 0.32, 0.022]} /> : null}
    </group>
  );
}

/** Una gamba: anca → coscia → ginocchio → stinco → scarpa. */
function Gamba({ lato, rif, ginocchio }: { lato: number; rif: React.RefObject<THREE.Group | null>; ginocchio: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={rif} position={[lato * 0.1, ALTEZZA_ANCA, 0]}>
      <mesh geometry={GEO.gamba} material={mat(PANTALONI, 0.9)} position={[0, -0.13, 0]} castShadow />
      <group ref={ginocchio} position={[0, -0.27, 0]}>
        <mesh geometry={GEO.gamba} material={mat(PANTALONI, 0.9)} position={[0, -0.12, 0]} scale={0.95} />
        <mesh geometry={GEO.box} material={mat(SCARPE, 0.5)} position={[0, -0.27, -0.045]} scale={[0.15, 0.09, 0.26]} />
        <mesh geometry={GEO.box} material={mat(SUOLA, 0.6)} position={[0, -0.31, -0.045]} scale={[0.155, 0.025, 0.265]} />
      </group>
    </group>
  );
}

const angolo = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export function Personaggio({ meta, instrada, umore, divisa, accento, pelle, capelli, coloreCapelli, extra, fase = 0, tazza, fumo, selezionato, ospite, scala = 1, onClick, children }: Props) {
  const radice = useRef<THREE.Group>(null);
  const corpo = useRef<THREE.Group>(null);
  const testa = useRef<THREE.Group>(null);
  const bS = useRef<THREE.Group>(null), bD = useRef<THREE.Group>(null);
  const gS = useRef<THREE.Group>(null), gD = useRef<THREE.Group>(null);
  const kS = useRef<THREE.Group>(null), kD = useRef<THREE.Group>(null);
  const tablet = useRef<THREE.Mesh>(null);
  const anello = useRef<THREE.Mesh>(null);
  const nuvola = useRef<THREE.Group>(null);
  const [sopra, setSopra] = useState(false);
  // quattro sbuffi di fumo, ognuno con la sua trasparenza
  const sbuffi = useMemo(() => (fumo ? [0, 1, 2, 3].map(() => new THREE.MeshBasicMaterial({ color: "#e9e9ee", transparent: true, opacity: 0, depthWrite: false })) : []), [fumo]);
  useEffect(() => () => sbuffi.forEach((m) => m.dispose()), [sbuffi]);

  // stato del movimento, fuori da React: cambia a ogni fotogramma
  const st = useRef({ x: meta.x, z: meta.z, rot: meta.rot, y: meta.y, seduto: meta.posa === "seduto", via: [] as [number, number][], passo: 0, iniziato: false });
  const chiave = `${meta.x.toFixed(2)}|${meta.z.toFixed(2)}`;
  useEffect(() => {
    const s = st.current;
    if (!s.iniziato) return;
    if (Math.hypot(s.x - meta.x, s.z - meta.z) < 0.05) return;
    s.via = instrada({ x: s.x, z: s.z }, { x: meta.x, z: meta.z });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  const logo = useMemo(() => (ospite ? null : texLogo()), [ospite]);
  const petto = useMemo(() => (ospite ? null : texPetto()), [ospite]);

  useFrame((stato, dtGrezzo) => {
    const r = radice.current, s = st.current;
    if (!r) return;
    const dt = Math.min(dtGrezzo, 0.05);
    const t = stato.clock.elapsedTime + fase * 1.7;
    s.iniziato = true;

    const cammina = s.via.length > 0;
    if (cammina) {
      const [tx, tz] = s.via[0];
      const dx = tx - s.x, dz = tz - s.z, d = Math.hypot(dx, dz);
      const passo = Math.min(d, VELOCITA * dt);
      if (d > 0.001) { s.x += (dx / d) * passo; s.z += (dz / d) * passo; s.rot += angolo(Math.atan2(-dx, -dz) - s.rot) * Math.min(1, dt * 10); }
      if (d - passo < 0.02) s.via.shift();
      s.seduto = false;
      s.y += (0 - s.y) * Math.min(1, dt * 8);
      s.passo += dt * 9.5;
    } else {
      s.rot += angolo(meta.rot - s.rot) * Math.min(1, dt * 6);
      s.y += (meta.y - s.y) * Math.min(1, dt * 6);
      s.seduto = meta.posa === "seduto";
    }

    r.position.set(s.x, s.y + (cammina ? Math.abs(Math.sin(s.passo)) * 0.035 : 0), s.z);
    r.rotation.y = s.rot;
    r.scale.setScalar((sopra ? 1.05 : 1) * scala);

    if (anello.current) {
      const vis = Boolean(selezionato) || umore === "attesa" || umore === "visita";
      anello.current.visible = vis && !cammina;
      if (vis) { const p = 1 + Math.sin(t * 3) * 0.06; anello.current.scale.set(1.5 * p, 1.5 * p, 1); }
    }

    const verso = (o: THREE.Group | null, asse: "x" | "y" | "z", a: number, k = 9) => { if (o) o.rotation[asse] += (a - o.rotation[asse]) * Math.min(1, dt * k); };

    // gambe
    if (cammina) {
      const a = Math.sin(s.passo);
      verso(gS.current, "x", a * 0.6, 20); verso(gD.current, "x", -a * 0.6, 20);
      verso(kS.current, "x", -Math.max(0, -a) * 0.8, 20); verso(kD.current, "x", -Math.max(0, a) * 0.8, 20);
    } else if (s.seduto) {
      verso(gS.current, "x", Math.PI / 2, 8); verso(gD.current, "x", Math.PI / 2, 8);
      verso(kS.current, "x", -1.3, 8); verso(kD.current, "x", -1.3, 8);
    } else {
      verso(gS.current, "x", 0); verso(gD.current, "x", 0); verso(kS.current, "x", 0); verso(kD.current, "x", 0);
    }

    // braccia, testa, busto
    let aS = 0.1, aD = 0.1, aDz = 0, tX = 0, tY = 0, cX = 0;
    if (cammina) { const a = Math.sin(s.passo); aS = -a * 0.55; aD = a * 0.55; cX = -0.06; tY = 0; }
    else if (umore === "visita") {
      // tiene il tablet e ogni tanto saluta con l'altra mano
      const saluta = Math.sin(t * 0.9) > 0.55;
      aS = 1.0; aD = saluta ? 2.9 : 0.15; aDz = saluta ? 0.5 + Math.sin(t * 9) * 0.3 : 0; tY = Math.sin(t * 0.5) * 0.15; tX = -0.08;
    } else if (!s.seduto && fumo) {
      // ogni tanto porta la sigaretta alla bocca
      const tiro = (t % 4.5) < 1.1;
      aS = 0.15; aD = tiro ? 2.35 : 0.45; aDz = tiro ? -0.35 : 0; tY = Math.sin(t * 0.5) * 0.25; tX = tiro ? -0.05 : 0.04;
    } else if (!s.seduto) { aS = 0.12; aD = tazza ? 1.35 : 0.12; tY = Math.sin(t * 0.6) * 0.3; }
    else if (umore === "lavora") { aS = 1.12 + Math.sin(t * 15) * 0.07; aD = 1.12 + Math.sin(t * 15 + 2.1) * 0.07; tX = 0.1 + Math.sin(t * 1.8) * 0.03; tY = Math.sin(t * 0.7) * 0.06; cX = -0.12; }
    else if (umore === "attesa") { aS = 0.95; aD = 2.75; aDz = 0.6 + Math.sin(t * 5) * 0.25; tY = 0.75; tX = -0.1; }
    else if (umore === "coda") { aS = 0.95; aD = 0.95; tY = Math.sin(t * 0.5) * 0.35; tX = Math.sin(t * 0.9) * 0.04; }
    else if (umore === "ospite") { aS = 0.9; aD = 0.9; tY = Math.sin(t * 0.45) * 0.4; tX = -0.05; }
    else { aS = tazza ? 0.6 : 0.5; aD = tazza ? 1.25 : 0.5; tY = Math.sin(t * 0.4) * 0.45; tX = -0.08; cX = 0.06; }
    verso(bS.current, "x", aS, cammina ? 20 : 8); verso(bD.current, "x", aD, cammina ? 20 : 8); verso(bD.current, "z", aDz, 12);
    verso(testa.current, "x", tX, 5); verso(testa.current, "y", tY, 4);
    verso(corpo.current, "x", cX, 4);
    if (corpo.current) corpo.current.position.y = Math.sin(t * 1.6) * 0.008;
    if (tablet.current) tablet.current.visible = umore === "visita" && !cammina;
    if (nuvola.current) {
      nuvola.current.visible = Boolean(fumo) && !cammina;
      nuvola.current.children.forEach((o, k) => {
        const f = (t * 0.45 + k / 4) % 1;
        o.position.set(Math.sin(t + k) * 0.06 * f, 1.42 + f * 1.0, -0.34 - f * 0.2);
        o.scale.setScalar(0.05 + f * 0.2);
        sbuffi[k].opacity = 0.38 * (1 - f) * Math.min(1, f * 6);
      });
    }
  });

  const tocca = onClick ? {
    onClick: (e: ThreeEvent<MouseEvent>) => { if (e.delta > 6) return; e.stopPropagation(); onClick(); },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setSopra(true); document.body.style.cursor = "pointer"; },
    onPointerOut: () => { setSopra(false); document.body.style.cursor = ""; },
  } : {};

  const tessuto = mat(divisa, 0.88);
  return (
    <group ref={radice} position={[meta.x, meta.y, meta.z]} rotation={[0, meta.rot, 0]} userData={{ dinamico: true }}>
      <mesh ref={anello} geometry={GEO.anello} material={matLuce(selezionato ? C.viola : C.oro, 0.9)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} visible={false} />
      <mesh geometry={GEO.cil} material={MAT_INVISIBILE} position={[0, 0.95, -0.05]} scale={[1.1, 1.9, 1.1]} {...tocca} />

      <Gamba lato={-1} rif={gS} ginocchio={kS} />
      <Gamba lato={1} rif={gD} ginocchio={kD} />

      <group ref={corpo}>
        {/* felpa della divisa, cappuccio, coulisse, badge col colore personale */}
        <mesh geometry={GEO.busto} material={tessuto} position={[0, 0.88, 0]} castShadow />
        <mesh geometry={GEO.sfera} material={tessuto} position={[0, 1.07, 0.15]} scale={[0.34, 0.2, 0.24]} />
        <mesh geometry={GEO.box} material={mat("#f3f1ff", 0.6)} position={[-0.05, 0.98, -0.205]} scale={[0.012, 0.13, 0.012]} />
        <mesh geometry={GEO.box} material={mat("#f3f1ff", 0.6)} position={[0.05, 0.98, -0.205]} scale={[0.012, 0.13, 0.012]} />
        <mesh geometry={GEO.cil} material={mat(accento, 0.5)} position={[0.11, 0.95, -0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.065, 0.012, 0.065]} />
        <mesh geometry={GEO.box} material={mat("#1c1f2c", 0.8)} position={[0, 0.6, 0]} scale={[0.4, 0.07, 0.3]} />
        {logo ? (
          <mesh position={[0, 0.9, 0.222]} scale={[0.27, 0.34, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial map={logo} transparent roughness={0.7} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
        ) : null}
        {petto ? (
          <mesh position={[-0.1, 0.97, -0.213]} rotation={[0, Math.PI, 0]} scale={0.085}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial map={petto} transparent roughness={0.7} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
        ) : null}
        {/* colletto bianco della divisa */}
        <mesh geometry={GEO.toro} material={mat("#f4f2ff", 0.7)} position={[0, 1.16, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.36, 0.36, 0.7]} />

        <group ref={bS} position={[-0.25, 1.02, 0]} rotation={[0.1, 0, 0]}>
          <mesh geometry={GEO.braccio} material={tessuto} position={[0, -0.2, 0]} castShadow />
          <mesh geometry={GEO.sfera} material={mat(pelle, 0.6)} position={[0, -0.44, 0]} scale={0.15} />
          <mesh ref={tablet} geometry={GEO.box} material={matLucido("#1b1d28")} position={[0.12, -0.46, -0.06]} rotation={[-0.3, 0, 0.1]} scale={[0.3, 0.02, 0.22]} visible={false} castShadow />
        </group>
        <group ref={bD} position={[0.25, 1.02, 0]} rotation={[0.1, 0, 0]}>
          <mesh geometry={GEO.braccio} material={tessuto} position={[0, -0.2, 0]} castShadow />
          <mesh geometry={GEO.sfera} material={mat(pelle, 0.6)} position={[0, -0.44, 0]} scale={0.15} />
          {tazza ? <mesh geometry={GEO.cil} material={mat(C.bianco, 0.3)} position={[0, -0.5, -0.07]} rotation={[-1.3, 0, 0]} scale={[0.13, 0.15, 0.13]} castShadow /> : null}
          {fumo ? (
            <group position={[0, -0.5, -0.09]} rotation={[-1.4, 0, 0]}>
              <mesh geometry={GEO.cil} material={mat("#f6f4ee", 0.6)} scale={[0.028, 0.16, 0.028]} />
              <mesh geometry={GEO.cil} material={mat("#d9a25a", 0.7)} position={[0, -0.06, 0]} scale={[0.03, 0.045, 0.03]} />
              <mesh geometry={GEO.cil} material={matLed("#ff6a1f", 3)} position={[0, 0.085, 0]} scale={[0.03, 0.014, 0.03]} />
            </group>
          ) : null}
        </group>

        <group ref={testa} position={[0, 1.37, -0.02]}>
          <mesh geometry={GEO.sfera} material={mat(pelle, 0.6)} scale={0.58} castShadow />
          <Chioma tipo={capelli} c={coloreCapelli} />
          <mesh geometry={GEO.sfera} material={matLucido("#1b1d26")} position={[-0.1, -0.01, -0.268]} scale={0.062} />
          <mesh geometry={GEO.sfera} material={matLucido("#1b1d26")} position={[0.1, -0.01, -0.268]} scale={0.062} />
          <mesh geometry={GEO.sfera} material={mat("#f29b8a", 0.8)} position={[-0.19, -0.09, -0.2]} scale={[0.09, 0.05, 0.05]} />
          <mesh geometry={GEO.sfera} material={mat("#f29b8a", 0.8)} position={[0.19, -0.09, -0.2]} scale={[0.09, 0.05, 0.05]} />
          <mesh geometry={GEO.box} material={mat("#7a3b30", 0.7)} position={[0, -0.13, -0.27]} scale={[0.08, 0.016, 0.02]} />
          {extra ? <Accessorio tipo={extra} /> : null}
        </group>
      </group>
      {fumo ? <group ref={nuvola}>{sbuffi.map((m, k) => <mesh key={k} geometry={GEO.sfera} material={m} />)}</group> : null}
      {children}
    </group>
  );
}

/** Sedia da ufficio: schienale imbottito, braccioli, base a stella cromata. `rot` come chi ci si siede. */
/** Sedia da ufficio vera (modello 3D); quella disegnata resta come riserva mentre carica. */
export function Sedia({ x, z, rot = 0, c = "#2a2d3a" }: { x: number; z: number; rot?: number; c?: string }) {
  return <Oggetto3D file="modern_arm_chair_01" x={x} z={z} rot={rot + Math.PI} scala={1.08} riserva={<group position={[-x, 0, -z]}><SediaDisegnata x={x} z={z} rot={rot} c={c} /></group>} />;
}

function SediaDisegnata({ x, z, rot = 0, c = "#2a2d3a" }: { x: number; z: number; rot?: number; c?: string }) {
  const m = mat(c, 0.85), metallo = matMetallo("#b9bcc6");
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh geometry={GEO.box} material={m} position={[0, 0.5, 0.02]} scale={[0.56, 0.1, 0.54]} castShadow receiveShadow />
      <mesh geometry={GEO.box} material={m} position={[0, 0.9, 0.29]} rotation={[0.12, 0, 0]} scale={[0.52, 0.62, 0.08]} castShadow />
      {[-0.3, 0.3].map((l) => <mesh key={l} geometry={GEO.box} material={m} position={[l, 0.66, 0.05]} scale={[0.05, 0.05, 0.36]} castShadow />)}
      <mesh geometry={GEO.cil} material={metallo} position={[0, 0.28, 0.02]} scale={[0.07, 0.38, 0.07]} />
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} geometry={GEO.box} material={metallo} position={[Math.sin((i * Math.PI * 2) / 5) * 0.17, 0.07, 0.02 + Math.cos((i * Math.PI * 2) / 5) * 0.17]} rotation={[0, (i * Math.PI * 2) / 5, 0]} scale={[0.05, 0.035, 0.36]} castShadow />)}
      {[0, 1, 2, 3, 4].map((i) => <mesh key={`r${i}`} geometry={GEO.sfera} material={mat("#1b1d26", 0.5)} position={[Math.sin((i * Math.PI * 2) / 5) * 0.34, 0.035, 0.02 + Math.cos((i * Math.PI * 2) / 5) * 0.34]} scale={0.07} />)}
    </group>
  );
}
