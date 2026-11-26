"use client";

import { Pianta3D } from "./Piante3D";
import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { SALA, TAVOLO_SALA, TAVOLO_SOCIAL } from "@/lib/studio/agenti";
import type { StatoAgente } from "@/lib/studio/calcoli";
import { GEO, MAT_VETRO, mat, matLed, matLucido, matMarmo, matOttone, rett, schermo, tela, type Font } from "./base";
import { Monstera, Sansevieria, type DatiAds } from "./Arredi";

/* =============================================================
   Le stanze nuove: la sala Strategia & Funnel a vetri con il tavolo
   ovale in marmo, il tavolo Social rotondo (Instagram, TikTok,
   Facebook), il giardino interno con l'ulivo. Più palme e ulivi.
   ============================================================= */

type V3 = [number, number, number];
const Box = ({ p, s, r, m, ombra = true }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean }) => <mesh geometry={GEO.box} material={m} position={p} scale={s} rotation={r} castShadow={ombra} receiveShadow />;
const Cil = ({ p, s, r, m, ombra = true }: { p: V3; s: V3; r?: V3; m: THREE.Material; ombra?: boolean }) => <mesh geometry={GEO.cil} material={m} position={p} scale={s} rotation={r} castShadow={ombra} />;
const Sfera = ({ p, s, m, ombra = true }: { p: V3; s: V3 | number; m: THREE.Material; ombra?: boolean }) => <mesh geometry={GEO.sfera} material={m} position={p} scale={s} castShadow={ombra} />;

export type PostoTavolo = { id: string; x: number; z: number; rot: number; tipo: string; stato: StatoAgente; accento: string };

/** Portatile aperto sul tavolo, con lo schermo rivolto verso chi è seduto. */
function Portatile({ x, z, rot, tipo, stato, accento }: { x: number; z: number; rot: number; tipo: string; stato: StatoAgente; accento: string }) {
  const map = schermo(tipo, stato, accento);
  return (
    <group position={[x, 0.79, z]} rotation={[0, rot, 0]}>
      <Box p={[0, 0, 0.12]} s={[0.66, 0.02, 0.44]} m={mat("#c7cad2", 0.3, 0.8)} />
      <group position={[0, 0.01, -0.1]} rotation={[-0.32, 0, 0]}>
        <Box p={[0, 0.22, 0]} s={[0.66, 0.44, 0.015]} m={mat("#c7cad2", 0.3, 0.8)} />
        <mesh geometry={GEO.piano} position={[0, 0.22, 0.009]} scale={[0.6, 0.38, 1]}><meshBasicMaterial map={map} toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

/** Un portatile davanti a ogni posto: tra la sedia e il centro del tavolo. */
function portatili(posti: PostoTavolo[], distanza: number) {
  return posti.map((p) => {
    const dx = -Math.sin(p.rot), dz = -Math.cos(p.rot);
    return <Portatile key={p.id} x={p.x + dx * distanza} z={p.z + dz * distanza} rot={p.rot} tipo={p.tipo} stato={p.stato} accento={p.accento} />;
  });
}

/* ---------- Sala Strategia & Funnel ---------- */

export function SalaStrategia({ posti, ads, font }: { posti: PostoTavolo[]; ads: DatiAds; font: Font }) {
  const { x0, x1, z0, z1, portaX } = SALA;
  // lo schermo della sala mostra i numeri veri delle campagne del mese
  const funnel = useMemo(() => tela(900, 520, (c, w) => {
    rett(c, 0, 0, w, 520, 24, "#101522");
    c.fillStyle = "#9fb0d8"; c.font = `600 30px ${font.testo}`; c.letterSpacing = "3px";
    c.fillText(`CAMPAGNE · ${ads.mese.toUpperCase()}`, 44, 62);
    c.letterSpacing = "0px";
    c.fillStyle = "#ffffff"; c.font = `700 96px ${font.titoli}`;
    c.fillText(String(ads.contatti), 44, 170);
    c.fillStyle = "#9aa6c8"; c.font = `500 30px ${font.testo}`;
    c.fillText(`contatti · ${Math.round(ads.spesa)} € spesi${ads.contatti > 0 && ads.spesa > 0 ? ` · ${(ads.spesa / ads.contatti).toFixed(2).replace(".", ",")} € a contatto` : ""}`, 44, 214);
    const max = Math.max(1, ...ads.righe.map((r) => r.contatti));
    ads.righe.slice(0, 4).forEach((r, i) => {
      const y = 262 + i * 62;
      c.fillStyle = "#c7cde0"; c.font = `600 28px ${font.testo}`;
      c.fillText(r.nome.length > 18 ? r.nome.slice(0, 17) + "…" : r.nome, 44, y + 30);
      rett(c, 360, y + 8, w - 410, 30, 15, "#1d2540");
      rett(c, 360, y + 8, Math.max(30, ((w - 410) * r.contatti) / max), 30, 15, r.colore);
    });
    if (!ads.righe.length) { c.fillStyle = "#7f8aa8"; c.font = `500 30px ${font.testo}`; c.fillText("Nessun numero ancora questo mese", 44, 300); }
  }), [ads, font]);
  const insegna = useMemo(() => tela(1024, 128, (c, w, h) => {
    c.fillStyle = "rgba(255,255,255,0.9)"; c.font = `700 64px ${font.titoli}`; c.letterSpacing = "10px"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("STRATEGIA & FUNNEL", w / 2, h / 2);
  }), [font]);
  useEffect(() => () => { funnel.dispose(); insegna.dispose(); }, [funnel, insegna]);
  const telaio = matOttone();
  const largo = x1 - x0, fondo = z1 - z0;
  const [tx, tz] = TAVOLO_SALA;
  return (
    <group>
      {/* moquette verde scuro con bordo in ottone */}
      <RoundedBox args={[largo - 0.3, 0.02, fondo - 0.2]} radius={0.01} smoothness={2} position={[(x0 + x1) / 2, 0.011, (z0 + z1) / 2]} material={mat("#243b33", 0.95)} receiveShadow />
      <Box p={[(x0 + x1) / 2, 0.025, z1 - 0.12]} s={[largo - 0.3, 0.012, 0.05]} m={telaio} ombra={false} />
      {/* parete di fondo verde con boiserie */}
      <Box p={[(x0 + x1) / 2, 2.35, z0 + 0.06]} s={[largo, 4.3, 0.05]} m={mat("#1f3a32", 0.7)} ombra={false} />
      {[0, 1, 2, 3].map((i) => <Box key={i} p={[x0 + 1.9 + i * 3.4, 1.0, z0 + 0.1]} s={[2.9, 1.2, 0.02]} m={mat("#264a40", 0.65)} ombra={false} />)}
      {/* schermo con il funnel */}
      <group position={[tx, 2.5, z0 + 0.14]}>
        <RoundedBox args={[3.6, 2.08, 0.08]} radius={0.04} smoothness={2} material={matLucido("#0d1018")} castShadow />
        <mesh geometry={GEO.piano} position={[0, 0, 0.045]} scale={[3.48, 2.0, 1]}><meshBasicMaterial map={funnel} toneMapped={false} /></mesh>
      </group>
      {/* pareti di vetro: davanti con la porta, e sul lato */}
      <mesh geometry={GEO.box} material={MAT_VETRO} position={[(x0 + portaX - 0.75) / 2, 1.2, z1]} scale={[portaX - 0.75 - x0, 2.4, 0.04]} />
      <mesh geometry={GEO.box} material={MAT_VETRO} position={[(portaX + 0.75 + x1) / 2, 1.2, z1]} scale={[x1 - portaX - 0.75, 2.4, 0.04]} />
      <mesh geometry={GEO.box} material={MAT_VETRO} position={[x1, 1.2, (z0 + z1) / 2]} scale={[0.04, 2.4, fondo]} />
      <Box p={[(x0 + x1) / 2, 2.42, z1]} s={[largo, 0.06, 0.07]} m={telaio} />
      <Box p={[(x0 + x1) / 2, 0.03, z1]} s={[largo, 0.06, 0.07]} m={telaio} ombra={false} />
      <Box p={[x1, 2.42, (z0 + z1) / 2]} s={[0.07, 0.06, fondo]} m={telaio} />
      <Box p={[x1, 0.03, (z0 + z1) / 2]} s={[0.07, 0.06, fondo]} m={telaio} ombra={false} />
      {[portaX - 0.75, portaX + 0.75].map((x) => <Box key={x} p={[x, 1.2, z1]} s={[0.07, 2.4, 0.07]} m={telaio} />)}
      <mesh geometry={GEO.piano} position={[(x0 + portaX) / 2 - 0.5, 1.95, z1 + 0.03]} scale={[5.6, 0.7, 1]}>
        <meshBasicMaterial map={insegna} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* tavolo ovale in marmo con base in ottone */}
      <group position={[tx, 0, tz]}>
        <mesh geometry={GEO.cil} material={matMarmo()} position={[0, 0.75, 0]} scale={[6.6, 0.08, 2.1]} castShadow receiveShadow />
        <mesh geometry={GEO.cil} material={telaio} position={[0, 0.705, 0]} scale={[6.64, 0.012, 2.14]} />
        {[-1.8, 1.8].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Cil p={[0, 0.37, 0]} s={[0.2, 0.7, 0.2]} m={telaio} />
            <Cil p={[0, 0.02, 0]} s={[0.9, 0.04, 0.9]} m={telaio} />
          </group>
        ))}
        <Sfera p={[0, 0.86, 0]} s={[0.36, 0.14, 0.36]} m={mat("#2f7d4f", 0.7)} />
      </group>
      {portatili(posti, 0.98)}
      {/* libreria sul lato e piante negli angoli */}
      <group position={[x0 + 0.3, 0, (z0 + z1) / 2 - 0.4]}>
        <Box p={[0, 1.2, 0]} s={[0.4, 2.4, 3.6]} m={mat("#3a2a20", 0.5)} />
        {[0.5, 1.2, 1.9].map((y) => <Box key={y} p={[0.21, y, 0]} s={[0.02, 0.03, 3.4]} m={telaio} ombra={false} />)}
        {Array.from({ length: 18 }, (_, i) => <Box key={i} p={[0.12, 0.66 + Math.floor(i / 6) * 0.7, -1.5 + (i % 6) * 0.55 + (i % 2) * 0.1]} s={[0.22, 0.26 + (i % 3) * 0.04, 0.09 + (i % 2) * 0.05]} m={mat(["#5b2eff", "#f4f1ff", "#c39b55", "#1f3a32", "#e5484d", "#2f6bff"][i % 6], 0.6)} ombra={false} />)}
      </group>
      <Palma x={x0 + 0.9} z={z0 + 0.9} s={1.1} />
      <Monstera x={x1 - 0.9} z={z0 + 0.9} s={1.0} vaso="#2b2724" />
      <Sansevieria x={x1 - 0.8} z={z1 - 0.8} s={0.9} vaso="#c39b55" />
    </group>
  );
}

/* ---------- Tavolo social ---------- */

/** Icone delle piattaforme, disegnate a mano: niente immagini esterne. */
function useIcona(tipo: "instagram" | "tiktok" | "facebook") {
  return useMemo(() => tela(256, 256, (c, w, h) => {
    if (tipo === "instagram") {
      const g = c.createLinearGradient(0, h, w, 0);
      g.addColorStop(0, "#feda75"); g.addColorStop(0.35, "#fa7e1e"); g.addColorStop(0.65, "#d62976"); g.addColorStop(1, "#4f5bd5");
      rett(c, 0, 0, w, h, 60, "#000"); c.globalCompositeOperation = "source-atop"; c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalCompositeOperation = "source-over";
      c.strokeStyle = "#fff"; c.lineWidth = 16; c.beginPath(); c.roundRect(56, 56, 144, 144, 40); c.stroke();
      c.beginPath(); c.arc(128, 128, 34, 0, 7); c.stroke();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(170, 86, 10, 0, 7); c.fill();
    } else if (tipo === "tiktok") {
      rett(c, 0, 0, w, h, 60, "#111");
      const nota = (dx: number, dy: number, col: string) => { c.strokeStyle = col; c.lineWidth = 22; c.lineCap = "round"; c.beginPath(); c.moveTo(140 + dx, 60 + dy); c.lineTo(140 + dx, 160 + dy); c.stroke(); c.beginPath(); c.arc(112 + dx, 162 + dy, 28, 0, 7); c.stroke(); c.beginPath(); c.moveTo(140 + dx, 64 + dy); c.quadraticCurveTo(160 + dx, 100 + dy, 196 + dx, 100 + dy); c.stroke(); };
      nota(-5, -4, "#25f4ee"); nota(5, 4, "#fe2c55"); nota(0, 0, "#ffffff");
    } else {
      rett(c, 0, 0, w, h, 60, "#1877f2");
      c.fillStyle = "#fff"; c.font = "700 190px Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "alphabetic";
      c.fillText("f", w / 2 + 10, h - 30);
    }
  }), [tipo]);
}

function Totem({ x, z, rot, tipo }: { x: number; z: number; rot: number; tipo: "instagram" | "tiktok" | "facebook" }) {
  const t = useIcona(tipo);
  useEffect(() => () => t.dispose(), [t]);
  return (
    <group position={[x, 0.79, z]} rotation={[0, rot, 0]}>
      <Box p={[0, 0.02, 0]} s={[0.3, 0.04, 0.16]} m={matOttone()} />
      <mesh geometry={GEO.piano} position={[0, 0.2, 0]} scale={[0.32, 0.32, 1]}><meshBasicMaterial map={t} transparent toneMapped={false} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

/** Telefono sul cavalletto con la luce ad anello: per girare le storie. */
function SetTelefono({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {[0, 1, 2].map((i) => <Box key={i} p={[Math.sin(i * 2.1) * 0.2, 0.5, Math.cos(i * 2.1) * 0.2]} r={[Math.cos(i * 2.1) * 0.35, 0, -Math.sin(i * 2.1) * 0.35]} s={[0.025, 1.05, 0.025]} m={mat("#1e2029", 0.4)} />)}
      <Cil p={[0, 1.25, 0]} s={[0.03, 0.5, 0.03]} m={mat("#1e2029", 0.4)} />
      <mesh geometry={GEO.toro} material={matLed("#fff3e0", 2.2)} position={[0, 1.62, 0]} scale={[0.42, 0.42, 0.5]} />
      <Box p={[0, 1.62, 0.02]} s={[0.1, 0.2, 0.012]} m={matLucido("#111318")} />
    </group>
  );
}

export function TavoloSocial({ posti }: { posti: PostoTavolo[] }) {
  const [tx, tz] = TAVOLO_SOCIAL;
  return (
    <group>
      <mesh geometry={GEO.cil} material={mat("#f2e4ee", 0.95)} position={[tx, 0.011, tz + 0.4]} scale={[7.4, 0.022, 7.4]} receiveShadow />
      <mesh geometry={GEO.toro} material={matOttone()} position={[tx, 0.024, tz + 0.4]} rotation={[Math.PI / 2, 0, 0]} scale={[3.7, 3.7, 0.12]} />
      <group position={[tx, 0, tz]}>
        <mesh geometry={GEO.cil} material={matMarmo()} position={[0, 0.75, 0]} scale={[3.5, 0.08, 3.5]} castShadow receiveShadow />
        <mesh geometry={GEO.cil} material={matOttone()} position={[0, 0.705, 0]} scale={[3.54, 0.012, 3.54]} />
        <Cil p={[0, 0.37, 0]} s={[0.3, 0.7, 0.3]} m={matOttone()} />
        <Cil p={[0, 0.02, 0]} s={[1.3, 0.04, 1.3]} m={matOttone()} />
      </group>
      <Totem x={tx - 0.55} z={tz - 0.1} rot={0.5} tipo="instagram" />
      <Totem x={tx} z={tz + 0.35} rot={0} tipo="tiktok" />
      <Totem x={tx + 0.55} z={tz - 0.1} rot={-0.5} tipo="facebook" />
      {portatili(posti, 1.0)}
      <SetTelefono x={tx + 3.6} z={tz - 1.6} rot={-0.8} />
      <SetTelefono x={tx - 3.4} z={tz - 2.0} rot={0.7} />
      <Palma x={tx + 5.6} z={tz - 2.6} s={1.0} />
    </group>
  );
}

/* ---------- Giardino interno ---------- */

function Panchina({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[1.8, 0.1, 0.55]} radius={0.03} smoothness={2} position={[0, 0.42, 0]} material={mat("#8a5a3a", 0.5)} castShadow receiveShadow />
      <RoundedBox args={[1.8, 0.5, 0.08]} radius={0.03} smoothness={2} position={[0, 0.72, -0.3]} rotation={[-0.12, 0, 0]} material={mat("#8a5a3a", 0.5)} castShadow />
      {[-0.75, 0.75].map((l) => <Box key={l} p={[l, 0.2, 0]} s={[0.06, 0.4, 0.5]} m={matOttone()} />)}
    </group>
  );
}

export function Giardino({ x, z }: { x: number; z: number }) {
  const fiori = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + (i % 3) * 0.2, r = 1.6 + (i % 4) * 0.22;
    return { x: Math.cos(a) * r * 1.5, z: Math.sin(a) * r * 0.75, c: ["#f4f1ff", "#ffd84d", "#e88fb5", "#ffffff", "#b9a8ff"][i % 5] };
  }), []);
  return (
    <group position={[x, 0, z]}>
      {/* aiuola ovale con bordo in pietra */}
      <mesh geometry={GEO.cil} material={mat("#cfc6b8", 0.8)} position={[0, 0.12, 0]} scale={[8.6, 0.24, 4.2]} castShadow receiveShadow />
      <mesh geometry={GEO.cil} material={mat("#4f8a46", 0.95)} position={[0, 0.25, 0]} scale={[8.2, 0.04, 3.8]} receiveShadow />
      {fiori.map((f, i) => <Sfera key={i} p={[f.x, 0.33, f.z]} s={0.11} m={mat(f.c, 0.7)} ombra={false} />)}
      {[-2.8, -1.2, 1.2, 2.8].map((px, i) => <Sfera key={i} p={[px, 0.38, -1.2 + (i % 2) * 0.4]} s={[0.55, 0.35, 0.45]} m={mat(i % 2 ? "#3a7d47" : "#4f9a5a", 0.85)} />)}
      <Ulivo x={0} z={-0.1} s={1.15} />
      {/* lanterne */}
      {[-3.6, 3.6].map((px) => (
        <group key={px} position={[px, 0.26, 0.6]}>
          <Box p={[0, 0.25, 0]} s={[0.22, 0.5, 0.22]} m={mat("#1e2029", 0.4)} />
          <Box p={[0, 0.25, 0]} s={[0.17, 0.4, 0.17]} m={matLed("#ffd9a0", 1.8)} ombra={false} />
        </group>
      ))}
      <Panchina x={-2.6} z={2.5} />
      <Panchina x={2.6} z={2.5} />
    </group>
  );
}

/* ---------- Piante grandi ---------- */

/** Palma kentia: più fusti sottili e fronde lunghe che ricadono. */
/** Palma vera (modello 3D); quella disegnata resta come riserva mentre carica. */
export function Palma({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return <Pianta3D tipo="alta" x={x} z={z} altezza={2.5 * s} rot={x * 1.7} riserva={<group position={[-x, 0, -z]}><PalmaDisegnata x={x} z={z} s={s} /></group>} />;
}

function PalmaDisegnata({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  const fronde = useMemo(() => {
    const out: { fusto: number; a: number; inclina: number; l: number }[] = [];
    [0, 1, 2].forEach((f) => { for (let i = 0; i < 6; i++) out.push({ fusto: f, a: (i / 6) * Math.PI * 2 + f * 0.6, inclina: 0.7 + (i % 3) * 0.18, l: 0.95 + (i % 2) * 0.25 }); });
    return out;
  }, []);
  const fusti: V3[] = [[0, 0, 0], [0.12, 0, 0.08], [-0.1, 0, -0.06]];
  const altezze = [1.9, 1.5, 1.2];
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh geometry={GEO.vaso} material={mat("#2b2724", 0.35)} position={[0, 0.32, 0]} scale={[0.66, 0.64, 0.66]} castShadow receiveShadow />
      <Cil p={[0, 0.645, 0]} s={[0.6, 0.02, 0.6]} m={matOttone()} ombra={false} />
      {fusti.map((f, i) => <Cil key={i} p={[f[0], 0.64 + altezze[i] / 2, f[2]]} s={[0.05, altezze[i], 0.05]} m={mat("#6f7f4a", 0.8)} />)}
      {fronde.map((fr, i) => {
        const base = fusti[fr.fusto], h = 0.64 + altezze[fr.fusto];
        return (
          <group key={i} position={[base[0], h, base[2]]} rotation={[0, fr.a, 0]}>
            <group rotation={[fr.inclina, 0, 0]}>
              <mesh geometry={GEO.foglia} material={mat(i % 2 ? "#2f7d4f" : "#3d9160", 0.7)} position={[0, fr.l / 2, 0]} scale={[0.32, fr.l, 0.035]} castShadow />
            </group>
          </group>
        );
      })}
    </group>
  );
}

/** Ulivo: tronco contorto e chioma argentata. */
export function Ulivo({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  const chioma = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2, r = 0.55 + (i % 3) * 0.3;
    return { p: [Math.cos(a) * r, 2.3 + (i % 4) * 0.22 - r * 0.25, Math.sin(a) * r * 0.8] as V3, s: 0.42 + (i % 3) * 0.1 };
  }), []);
  return (
    <group position={[x, 0, z]} scale={s}>
      <Cil p={[0.05, 0.75, 0]} r={[0, 0, 0.12]} s={[0.22, 1.5, 0.22]} m={mat("#7b6a58", 0.95)} />
      <Cil p={[-0.25, 1.65, 0.05]} r={[0.2, 0, 0.6]} s={[0.12, 0.9, 0.12]} m={mat("#7b6a58", 0.95)} />
      <Cil p={[0.3, 1.7, -0.05]} r={[-0.2, 0, -0.55]} s={[0.11, 0.85, 0.11]} m={mat("#7b6a58", 0.95)} />
      {chioma.map((c, i) => <Sfera key={i} p={c.p} s={[c.s, c.s * 0.7, c.s]} m={mat(i % 2 ? "#8aa07a" : "#9db08d", 0.9)} />)}
    </group>
  );
}
