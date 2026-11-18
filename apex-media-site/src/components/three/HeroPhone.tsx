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
import { ScrollTrigger } from "@/lib/gsap";

/* Il telefono dell’hero: arriva una richiesta, il telefono vibra, un anello si allarga dietro
   e il contatore sale di uno. Lo schermo è un canvas 2D usato come texture, ridisegnato solo
   quando qualcosa cambia. Tutto il movimento è guidato da GSAP; il canvas 3D disegna solo su richiesta. */

const SW = 540;
const SH = 1142;
/* Telefono bordeaux, sul modello della foto di riferimento: retro opaco, fascia fotocamere più chiara */
const BACK = "#4a1a23";
const GLASS = "#3f161d";
const PLATEAU = "#6a2a33";
const FRAME = "#5a222b";
const RING = "#3a1319";
/** Tasti sul telaio: x, y, altezza */
const BUTTONS: [number, number, number][] = [
  [0.512, 0.3, 0.26],
  [-0.512, 0.6, 0.09],
  [-0.512, 0.4, 0.15],
  [-0.512, 0.2, 0.15],
];
/** Obiettivi: due in colonna e uno a lato, a triangolo */
const LENSES: [number, number][] = [
  [0.285, 0.118],
  [0.285, -0.118],
  [0.07, 0],
];
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
  /** Avanzamento dello scroll lungo l’hero, 0 → 1: fa girare il telefono su sé stesso */
  spin: number;
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
  ctx.save();
  rounded(ctx, 0, 0, SW, SH, 72);
  ctx.clip();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SW, SH);

  // Barra di stato e isola
  ctx.fillStyle = INK;
  ctx.font = `600 26px ${fonts.sans}`;
  ctx.textBaseline = "middle";
  ctx.fillText("10:30", 44, 46);
  ctx.fillStyle = "#05060a";
  // Isola piccola, come sui modelli più recenti
  rounded(ctx, SW / 2 - 56, 26, 112, 34, 17);
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
      spin: 0,
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

  /** Lo scroll fa girare il telefono: 0 = di fronte, 1 = un giro completo */
  spinTo(progress: number) {
    this.st.spin = progress;
    this.onChange();
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

    // Mai fermo: finché è in vista il telefono dondola piano (un frame a ogni tick, solo in vista)
    const tick = () => {
      if (inView && !document.hidden) invalidate();
    };
    gsap.ticker.add(tick);

    // Scorrendo, il telefono fa un giro completo su sé stesso: da 0 quando la pagina è in cima
    // a 1 quando il telefono è uscito dallo schermo
    const box = (gl.domElement.closest("[data-hero-phone]") ?? gl.domElement) as HTMLElement;
    const spin = ScrollTrigger.create({
      trigger: box,
      start: () =>
        Math.max(0, box.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.85),
      end: () =>
        box.getBoundingClientRect().top + window.scrollY + box.offsetHeight - window.innerHeight * 0.12,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => screen.spinTo(self.progress),
    });

    // Solo con il mouse: il telefono si inclina appena verso il cursore
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: MouseEvent) =>
      screen.tilt((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2);
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      loop.kill();
      spin.kill();
      gsap.ticker.remove(tick);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("mousemove", onMove);
    };
  }, [animate, screen, gl, invalidate]);

  useFrame(() => {
    const st = screen.st;
    const g = group.current;
    if (g) {
      // Vibrazione: poche oscillazioni rapide che si spengono
      const b = st.buzz < 1 ? Math.sin(st.buzz * Math.PI * 12) * 0.045 * (1 - st.buzz) : 0;
      // Un giro completo, ma non a velocità costante: indugia di fronte (schermo visibile) e passa veloce sul retro
      const turn = st.spin * Math.PI * 2 - Math.sin(st.spin * Math.PI * 2) * 0.8;
      // Dondolio lento da fermo + giro completo con lo scroll, con il telefono che si piega un po’ mentre gira
      const t = animate ? performance.now() / 1000 : 0;
      g.rotation.set(
        -0.1 + st.ty * 0.06 + Math.sin(turn) * 0.14 + Math.sin(t * 0.9) * 0.025,
        -0.38 + st.tx * 0.12 + turn + Math.sin(t * 0.7) * 0.11,
        0.05 + b + Math.sin(turn * 2) * 0.05,
      );
      g.position.x = b * 0.5 + Math.sin(turn) * 0.12;
      g.position.y = Math.sin(t * 1.1) * 0.035;
    }
    if (ring.current && ringMat.current) {
      const s = 1 + st.ring * 1.25;
      ring.current.scale.set(s, s, s);
      ringMat.current.opacity = 0.75 * (1 - st.ring);
      ring.current.visible = st.ring < 0.999;
    }
  });

  const screenH = 0.952 * (SH / SW);
  const seg = light ? 8 : 16;
  const round = light ? 28 : 48;
  return (
    <group>
      {/* Anello che si allarga dietro al telefono quando arriva una richiesta: resta di fronte, non gira */}
      <mesh ref={ring} position={[0, 0.05, -0.6]}>
        <torusGeometry args={[0.95, 0.012, 12, 96]} />
        <meshStandardMaterial ref={ringMat} color={YELLOW} roughness={0.6} transparent opacity={0} />
      </mesh>

      <group ref={group}>
        {/* Corpo: retro bordeaux opaco, fianchi piatti in metallo satinato con spigoli appena smussati */}
        <Plate w={1.02} h={2.08} r={0.17} depth={0.1} bevel={0.012} segments={seg}>
          <meshStandardMaterial attach="material-0" color={BACK} roughness={0.62} metalness={0.25} />
          <meshStandardMaterial attach="material-1" color={FRAME} roughness={0.36} metalness={0.8} />
        </Plate>
        {/* Tasti sul telaio: accensione a destra, azione e volume a sinistra */}
        {BUTTONS.map(([x, y, h]) => (
          <RoundedBox key={`${x}${y}`} args={[0.012, h, 0.032]} radius={0.005} smoothness={2} position={[x, y, 0]}>
            <meshStandardMaterial color={FRAME} roughness={0.35} metalness={0.8} />
          </RoundedBox>
        ))}

        {/* ---- Retro ---- */}
        {/* Pannello in vetro satinato sotto le fotocamere, appena più scuro */}
        <Plate w={0.9} h={1.33} r={0.1} depth={0.004} segments={seg} position={[0, -0.31, -0.052]}>
          <meshStandardMaterial color={GLASS} roughness={0.75} metalness={0.15} />
        </Plate>
        {/* Fascia delle fotocamere: rialzata, larga quasi quanto il telefono */}
        <group position={[0, 0.72, -0.05]}>
          <Plate w={0.93} h={0.52} r={0.14} depth={0.03} bevel={0.008} segments={seg} position={[0, 0, -0.015]}>
            <meshStandardMaterial color={PLATEAU} roughness={0.5} metalness={0.35} />
          </Plate>
          {/* Tre obiettivi a triangolo (visti da dietro stanno a sinistra, quindi qui x è positivo) */}
          {LENSES.map(([x, y]) => (
            <group key={`${x}${y}`} position={[x, y, -0.036]} rotation-x={Math.PI / 2}>
              <mesh>
                <cylinderGeometry args={[0.108, 0.108, 0.03, round]} />
                <meshStandardMaterial color={RING} roughness={0.3} metalness={0.85} />
              </mesh>
              <mesh position={[0, -0.012, 0]}>
                <cylinderGeometry args={[0.088, 0.088, 0.012, round]} />
                <meshStandardMaterial color="#07080b" roughness={0.12} metalness={0.5} />
              </mesh>
              <mesh position={[0, -0.0185, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.002, round]} />
                <meshStandardMaterial color="#1a2233" roughness={0.1} metalness={0.7} />
              </mesh>
            </group>
          ))}
          {/* Flash, microfono e sensore, sul lato opposto */}
          <mesh position={[-0.3, 0.14, -0.031]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.042, 0.042, 0.004, round]} />
            <meshStandardMaterial color="#f1ede4" roughness={0.4} emissive="#f1ede4" emissiveIntensity={0.15} />
          </mesh>
          <mesh position={[-0.3, 0.02, -0.031]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.008, 0.008, 0.003, 12]} />
            <meshStandardMaterial color="#1a0a0d" roughness={0.6} />
          </mesh>
          <mesh position={[-0.3, -0.12, -0.031]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.046, 0.046, 0.004, round]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.2} metalness={0.4} />
          </mesh>
        </group>

        {/* ---- Fronte ---- */}
        {/* Vetro nero a filo del telaio, poi lo schermo con cornici sottili e uguali */}
        <Plate w={0.99} h={2.05} r={0.155} depth={0.004} segments={seg} position={[0, 0, 0.052]}>
          <meshStandardMaterial color="#050506" roughness={0.18} metalness={0.3} />
        </Plate>
        <mesh position={[0, 0, 0.0552]}>
          <planeGeometry args={[0.952, screenH]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} transparent />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Lastra con angoli arrotondati: un rettangolo arrotondato estruso, con smusso facoltativo sugli spigoli.
 * w, h e depth sono le misure esterne. Con due materiali: 0 = facce davanti e dietro, 1 = fianchi.
 */
function Plate({
  w,
  h,
  r,
  depth,
  bevel = 0,
  segments = 12,
  children,
  ...props
}: {
  w: number;
  h: number;
  r: number;
  depth: number;
  bevel?: number;
  segments?: number;
  children?: React.ReactNode;
  position?: [number, number, number];
}) {
  const geometry = useMemo(() => {
    const iw = w - bevel * 2;
    const ih = h - bevel * 2;
    const ir = Math.max(0.001, r - bevel);
    const x = -iw / 2;
    const y = -ih / 2;
    const s = new THREE.Shape();
    s.moveTo(x + ir, y);
    s.lineTo(x + iw - ir, y);
    s.absarc(x + iw - ir, y + ir, ir, -Math.PI / 2, 0, false);
    s.lineTo(x + iw, y + ih - ir);
    s.absarc(x + iw - ir, y + ih - ir, ir, 0, Math.PI / 2, false);
    s.lineTo(x + ir, y + ih);
    s.absarc(x + ir, y + ih - ir, ir, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + ir);
    s.absarc(x + ir, y + ir, ir, Math.PI, Math.PI * 1.5, false);
    const d = Math.max(0.0005, depth - bevel * 2);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d,
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 4,
      curveSegments: segments,
    });
    g.translate(0, 0, -d / 2);
    return g;
  }, [w, h, r, depth, bevel, segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} {...props}>
      {children}
    </mesh>
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
      // near e far stretti: più precisione in profondità, niente sfarfallio tra vetro e schermo
      camera={{ fov: 28, near: 2, far: 12, position: [0, 0.05, 5.4] }}
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
