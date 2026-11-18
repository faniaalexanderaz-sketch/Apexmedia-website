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
import { heroPhone, type HeroNotification } from "@/data/hero";

/* Il telefono dell’hero: arriva una richiesta, il telefono vibra, un anello si allarga dietro
   e il contatore sale di uno. Lo schermo è un canvas 2D usato come texture, ridisegnato solo
   quando qualcosa cambia. Tutto il movimento è guidato da GSAP; il canvas 3D disegna solo su richiesta. */

const SW = 540;
const SH = 1156;
const BODY = "#121317";
const PAPER = "#f6f5f1";
const INK = "#0b0d14";
const MUTED = "#6b6862";
const YELLOW = "#FFD84D";
const KIND_COLOR: Record<string, string> = {
  messaggio: "#17b26a",
  prenotazione: YELLOW,
  chiamata: INK,
  modulo: "#2f6bff",
};
const KIND_LETTER: Record<string, string> = {
  messaggio: "M",
  prenotazione: "P",
  chiamata: "C",
  modulo: "S",
};
const CARD_H = 148;
const CARD_GAP = 16;
const LIST_Y = 430;
const VISIBLE = 4;

type State = {
  count: number;
  prev: number;
  roll: number;
  arrive: number;
  cards: number[];
  buzz: number;
  ring: number;
  tx: number;
  ty: number;
};

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
  return t + "…";
}

/** Disegna lo schermo del telefono nello stato attuale */
function drawScreen(ctx: CanvasRenderingContext2D, st: State, fonts: { display: string; sans: string }) {
  ctx.clearRect(0, 0, SW, SH);
  ctx.fillStyle = BODY;
  ctx.fillRect(0, 0, SW, SH);
  ctx.save();
  rounded(ctx, 0, 0, SW, SH, 64);
  ctx.clip();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SW, SH);

  // Barra di stato e isola
  ctx.fillStyle = INK;
  ctx.font = `600 26px ${fonts.sans}`;
  ctx.textBaseline = "middle";
  ctx.fillText("10:30", 44, 46);
  ctx.fillStyle = "#05060a";
  rounded(ctx, SW / 2 - 78, 22, 156, 46, 23);
  ctx.fill();
  ctx.fillStyle = INK;
  [0, 1, 2, 3].forEach((i) => ctx.fillRect(SW - 128 + i * 11, 54 - i * 5, 7, 8 + i * 5));
  rounded(ctx, SW - 76, 36, 38, 20, 5);
  ctx.fill();

  // Contatore: il numero vecchio sale e sparisce, il nuovo arriva da sotto
  ctx.fillStyle = MUTED;
  ctx.font = `500 27px ${fonts.sans}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`${heroPhone.label}, ${heroPhone.period}`, 44, 150);
  ctx.save();
  ctx.beginPath();
  ctx.rect(30, 166, SW - 60, 196);
  ctx.clip();
  ctx.fillStyle = INK;
  ctx.font = `700 178px ${fonts.display}`;
  const r = st.roll;
  const shift = 200;
  if (r < 1) {
    ctx.globalAlpha = 1 - r;
    ctx.fillText(String(st.prev), 36, 340 - r * shift);
  }
  ctx.globalAlpha = r;
  ctx.fillText(String(st.count), 36, 340 + (1 - r) * shift);
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.fillStyle = "rgba(11,13,20,0.1)";
  ctx.fillRect(44, 392, SW - 88, 2);

  // Notifiche: la più recente entra dall’alto, le altre scendono di un posto
  const a = st.arrive;
  const step = CARD_H + CARD_GAP;
  st.cards.slice(0, VISIBLE + 1).forEach((idx, i) => {
    const n = heroPhone.notifications[idx] as HeroNotification;
    const y = LIST_Y + i * step - (1 - a) * step;
    let alpha = 1;
    if (i === 0) alpha = a;
    if (i === VISIBLE) alpha = 1 - a;
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.shadowColor = "rgba(20,18,14,0.10)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#ffffff";
    rounded(ctx, 30, y, SW - 60, CARD_H, 30);
    ctx.fill();
    ctx.restore();
    const color = KIND_COLOR[n.kind] ?? INK;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(94, y + CARD_H / 2, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color === YELLOW ? INK : "#ffffff";
    ctx.font = `700 32px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(KIND_LETTER[n.kind] ?? "•", 94, y + CARD_H / 2 + 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = INK;
    ctx.font = `700 28px ${fonts.sans}`;
    ctx.fillText(fit(ctx, n.title, 280), 148, y + 62);
    ctx.fillStyle = MUTED;
    ctx.font = `500 22px ${fonts.sans}`;
    ctx.fillText("ora", SW - 92, y + 62);
    ctx.font = `400 25px ${fonts.sans}`;
    ctx.fillText(fit(ctx, n.text, SW - 210), 148, y + 102);
    ctx.globalAlpha = 1;
  });

  // Fondo dello schermo: sfuma la lista e lascia la barra home
  const g = ctx.createLinearGradient(0, SH - 190, 0, SH - 60);
  g.addColorStop(0, "rgba(246,245,241,0)");
  g.addColorStop(1, PAPER);
  ctx.fillStyle = g;
  ctx.fillRect(0, SH - 190, SW, 190);
  ctx.fillStyle = INK;
  rounded(ctx, SW / 2 - 70, SH - 26, 140, 8, 4);
  ctx.fill();
  ctx.restore();
}

/** Schermo del telefono: canvas 2D, texture e stato. Si modifica solo attraverso i suoi metodi. */
class Screen {
  st: State;
  texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private fonts = { display: "system-ui, sans-serif", sans: "system-ui, sans-serif" };
  private onChange: () => void = () => {};
  private next: number;

  constructor(animate: boolean) {
    const n = heroPhone.notifications.length;
    this.st = {
      count: animate ? heroPhone.start : heroPhone.start + 1,
      prev: heroPhone.start - 1,
      roll: 1,
      arrive: 1,
      cards: Array.from({ length: VISIBLE }, (_, i) => (VISIBLE - 1 - i) % n),
      buzz: 1,
      ring: 1,
      tx: 0,
      ty: 0,
    };
    this.next = VISIBLE % n;
    const c = document.createElement("canvas");
    c.width = SW;
    c.height = SH;
    this.ctx = c.getContext("2d")!;
    this.texture = new THREE.CanvasTexture(c);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  connect(onChange: () => void, maxAnisotropy: number) {
    this.onChange = onChange;
    this.texture.anisotropy = Math.min(4, maxAnisotropy);
  }

  /** Stessi caratteri del sito: li prende dal titolo e dal testo della pagina */
  useSiteFonts() {
    const h1 = document.querySelector("h1");
    this.fonts = {
      display: h1 ? getComputedStyle(h1).fontFamily : this.fonts.display,
      sans: getComputedStyle(document.body).fontFamily,
    };
  }

  draw() {
    drawScreen(this.ctx, this.st, this.fonts);
    this.texture.needsUpdate = true;
    this.onChange();
  }

  /** Arriva una richiesta: notifica nuova in cima, contatore +1, vibrazione e anello */
  arrive() {
    const st = this.st;
    const n = heroPhone.notifications.length;
    st.cards = [this.next, ...st.cards].slice(0, VISIBLE + 1);
    this.next = (this.next + 1) % n;
    st.prev = st.count;
    st.count += 1;
    gsap.fromTo(st, { arrive: 0, roll: 0 }, {
      arrive: 1, roll: 1, duration: 0.75, ease: "power3.out", onUpdate: () => this.draw(),
    });
    gsap.fromTo(st, { buzz: 0 }, { buzz: 1, duration: 0.55, ease: "none", onUpdate: this.onChange });
    gsap.fromTo(st, { ring: 0 }, { ring: 1, duration: 1.3, ease: "power2.out", onUpdate: this.onChange });
  }

  /** Inclinazione verso il cursore, da -1 a 1 su entrambi gli assi */
  tilt(x: number, y: number) {
    gsap.to(this.st, { tx: x, ty: y, duration: 0.9, ease: "power3.out", overwrite: "auto", onUpdate: this.onChange });
  }

  dispose() {
    gsap.killTweensOf(this.st);
    this.texture.dispose();
  }
}

function Phone({ animate, onReady }: { animate: boolean; onReady: () => void }) {
  const { invalidate, gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshStandardMaterial>(null);
  const [light] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
  const [screen] = useState(() => new Screen(animate));

  useEffect(() => {
    screen.connect(invalidate, gl.capabilities.getMaxAnisotropy());
    screen.draw();
    // Ridisegno con i caratteri del sito appena sono caricati, poi il canvas può comparire
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      screen.useSiteFonts();
      screen.draw();
      requestAnimationFrame(onReady);
    });
    return () => screen.dispose();
  }, [screen, gl, invalidate, onReady]);

  // Una richiesta ogni pochi secondi, solo mentre il telefono è in vista e la scheda è aperta
  useEffect(() => {
    if (!animate) return;
    const loop = gsap.timeline({ repeat: -1, paused: true });
    loop.to({}, { duration: heroPhone.every }).call(() => screen.arrive());
    let inView = false;
    const sync = () => (inView && !document.hidden ? loop.play() : loop.pause());
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(gl.domElement);
    document.addEventListener("visibilitychange", sync);
    // Solo con il mouse: il telefono si inclina appena verso il cursore
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: MouseEvent) =>
      screen.tilt((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      loop.kill();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("mousemove", onMove);
    };
  }, [animate, screen, gl]);

  useFrame(() => {
    const st = screen.st;
    const g = group.current;
    if (g) {
      // Vibrazione: poche oscillazioni rapide che si spengono
      const b = st.buzz < 1 ? Math.sin(st.buzz * Math.PI * 12) * 0.045 * (1 - st.buzz) : 0;
      g.rotation.set(-0.1 + st.ty * 0.06, -0.38 + st.tx * 0.12, 0.05 + b);
      g.position.x = b * 0.5;
    }
    if (ring.current && ringMat.current) {
      const s = 1 + st.ring * 1.25;
      ring.current.scale.set(s, s, s);
      ringMat.current.opacity = 0.75 * (1 - st.ring);
      ring.current.visible = st.ring < 0.999;
    }
  });

  const screenH = 0.94 * (SH / SW);
  return (
    <group ref={group}>
      {/* Anello che si allarga dietro al telefono quando arriva una richiesta */}
      <mesh ref={ring} position={[0, 0.05, -0.25]}>
        <torusGeometry args={[0.95, 0.012, 12, 96]} />
        <meshStandardMaterial ref={ringMat} color={YELLOW} roughness={0.6} transparent opacity={0} />
      </mesh>
      {/* Telaio metallico e corpo */}
      <RoundedBox args={[1.035, 2.095, 0.09]} radius={0.14} smoothness={light ? 3 : 6}>
        <meshStandardMaterial color="#8e9198" roughness={0.35} metalness={0.7} />
      </RoundedBox>
      <RoundedBox args={[1, 2.06, 0.11]} radius={0.13} smoothness={light ? 3 : 6}>
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.2} />
      </RoundedBox>
      {/* Schermo */}
      <mesh position={[0, 0, 0.0565]}>
        <planeGeometry args={[0.94, screenH]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function HeroPhone({ onReady }: { onReady: () => void }) {
  const animate = useMemo(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const light = useMemo(() => window.matchMedia("(max-width: 1023px)").matches, []);
  return (
    <Canvas
      frameloop="demand"
      dpr={light ? [1, 1.5] : [1, 2]}
      camera={{ fov: 28, position: [0, 0.05, 5.4] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <hemisphereLight args={["#ffffff", "#d9d2c5", 0.9]} />
      <directionalLight position={[-3, 5, 6]} intensity={2} color="#fffaf0" />
      <directionalLight position={[4, 1, 2]} intensity={0.6} color="#f1ece2" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[-2, 3, 4]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[4, 0, 2]} rotation-y={-Math.PI / 3} scale={[3, 4, 1]} />
      </Environment>
      <Phone animate={animate} onReady={onReady} />
      <ContactShadows
        position={[0, -1.3, 0]}
        scale={4}
        far={2.4}
        blur={2.8}
        opacity={0.32}
        color="#2a2620"
        frames={1}
        resolution={light ? 256 : 512}
      />
    </Canvas>
  );
}
