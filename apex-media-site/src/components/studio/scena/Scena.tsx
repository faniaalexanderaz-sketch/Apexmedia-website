"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Environment, Html, Lightformer, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { AGENTE, AGENTI, FONDO, LARGO, TAVOLO_SALA, TAVOLO_SOCIAL, ZONE, instrada, type Punto, type ZonaId } from "@/lib/studio/agenti";
import type { SchermoTv } from "@/lib/studio/tipi";
import { euro, type StatoAgente } from "@/lib/studio/calcoli";
import type { Tono } from "@/lib/studio/promemoria";
import { AngoloGiochi, Cassa, Cervello, Pendenti, Ficus, Monstera, Muro, Pavimento, Percorso, RepartoCliente, Relax, Sansevieria, Scrivania, ScrittaPavimento, StudioVideo, Tappeto, TuaScrivania, Vetro, type ContiCliente, type Conteggi, type DatiAds, type DatiCassa, type PostoScrivania } from "./Arredi";
import { AngoloFumatori, Giardino, Palma, SalaStrategia, TavoloSocial, Ulivo, type PostoTavolo } from "./Stanze";
import { useFont } from "./base";
import { Statico } from "./Statico";
import { comandi } from "./comandi";
import { precaricaPiante } from "./Piante3D";

precaricaPiante();
import { Personaggio, Sedia, type Umore } from "./Personaggio";

/* =============================================================
   L'ufficio di Apex Media in 3D. Tutto segue i dati: chi lavora sta
   alla scrivania, chi ha qualcosa da dirti cammina fino alla tua
   scrivania e te lo dice in un fumetto, chi è libero va in area
   relax e ogni tanto cambia posto, ogni cliente ha il suo reparto.
   ============================================================= */

export type Fumetto = { id: string; frase: string; bottone: string; tono: Tono };
export type AgenteScena = { id: string; stato: StatoAgente; titolo: string | null; meta: Punto; umore: Umore; tazza: boolean; fumo?: boolean; fumetto: Fumetto | null };
export type ClienteScena = { id: number; nome: string; colore: string; quota: number; scaduto: number; conti: ContiCliente };
export type Selezione = { tipo: "agente"; id: string } | { tipo: "cervello" } | { tipo: "cliente"; id: number } | null;

export type PropsScena = {
  attivo: boolean;
  nome: string;
  agenti: AgenteScena[];
  clienti: ClienteScena[];
  altriClienti: number;
  cassa: DatiCassa;
  ads: DatiAds;
  conteggi: Conteggi;
  regole: number;
  inAttesa: number;
  /** "vicino" = vista d'ingresso ravvicinata, "tutto" = panoramica */
  zona: ZonaId | "tutto" | "vicino";
  selezione: Selezione;
  coperto: { destra: number; basso: number; alto: number; sinistra: number };
  onSeleziona: (s: Selezione) => void;
  onFumetto: (idPromemoria: string) => void;
  onCassa: () => void;
  onNuovoCliente: () => void;
  onTuaScrivania: () => void;
  tv: SchermoTv;
  onTv: () => void;
};

const CERVELLO: [number, number] = [-5.2, -12.4];
const CASSA_X = 16.5;
const TUA: [number, number] = [0, 4.2];
const DIRETTORE = AGENTE.direttore.posto;
const Z_CLIENTI = 12.6;
const PASSO_CLIENTI = 7.3;

export function postoReparto(i: number, n: number): [number, number] {
  return [(i - (n - 1) / 2) * PASSO_CLIENTI, Z_CLIENTI];
}

const AZIONE: Record<StatoAgente, string | null> = { attesa: "Guarda", lavora: null, coda: "Apri", libero: null };
const SOTTO: Record<StatoAgente, string> = { attesa: "ti aspetta", lavora: "sta lavorando", coda: "in coda", libero: "libero" };

/* ---------- Telecamera ---------- */

function Regia({ zona, selezione, agenti, clienti, coperto }: Pick<PropsScena, "zona" | "selezione" | "agenti" | "clienti" | "coperto">) {
  const ctrl = useRef<CameraControlsImpl>(null);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const prima = useRef(true);
  const vista = useRef("");
  // persone e reparti si muovono di continuo: la telecamera li legge solo quando scegli tu dove andare
  const ultimi = useRef({ agenti, clienti, alto: size.height });
  useEffect(() => { ultimi.current = { agenti, clienti, alto: size.height }; });

  // da lontano le etichette mostrano solo il nome, da vicino anche cosa stanno facendo
  useFrame((_, dt) => {
    const c = ctrl.current;
    if (!c) return;
    // joystick del telefono: sinistro sposta sul pavimento, destro gira la vista
    const passo = Math.min(dt, 0.05);
    if (comandi.mx || comandi.my) {
      const v = (3 + c.distance * 0.45) * passo;
      void c.truck(comandi.mx * v, 0, false);
      void c.forward(-comandi.my * v, false);
    }
    if (comandi.vx || comandi.vy) void c.rotate(-comandi.vx * 1.8 * passo, -comandi.vy * 1.1 * passo, false);
    const v = c.distance < 34 ? "vicino" : "insieme";
    if (v !== vista.current) { vista.current = v; const box = gl.domElement.closest<HTMLElement>(".st-scena"); if (box) box.dataset.vista = v; }
  });

  const trovaMira = () => {
    const { agenti, clienti } = ultimi.current;
    if (selezione?.tipo === "agente") { const a = agenti.find((x) => x.id === selezione.id); if (a) return { x: a.meta.x, z: a.meta.z - 0.4, ampiezza: 9, fondo: 6.5, y: 0.9 }; }
    if (selezione?.tipo === "cervello") return { x: CERVELLO[0], z: CERVELLO[1] + 0.8, ampiezza: 9, fondo: 6.5, y: 1.4 };
    if (selezione?.tipo === "cliente") { const i = clienti.findIndex((c) => c.id === selezione.id); if (i >= 0) { const [x, z] = postoReparto(i, clienti.length); return { x, z, ampiezza: 9.5, fondo: 7, y: 0.9 }; } }
    const z = ZONE.find((q) => q.id === zona);
    if (z) return { x: z.centro[0], z: z.centro[1], ampiezza: z.ampiezza, fondo: Math.min(14, z.ampiezza * 0.62), y: z.centro[1] < -9 ? 2 : 0.9 };
    // vista d'ingresso: il cuore dell'ufficio da vicino, non tutta la pianta
    if (zona === "vicino") return size.width < 760 ? { x: 0, z: 1.6, ampiezza: 6, fondo: 4, y: 1.25, basso: true } : { x: 0, z: -1.2, ampiezza: 12, fondo: 7, y: 1.25, basso: true };
    return null;
  };

  useEffect(() => {
    const c = ctrl.current;
    if (!c || size.width < 10) return;
    const mira = trovaMira();
    const size2 = { width: size.width, height: ultimi.current.alto };
    const stretto = size.width < 760;
    const liberoW = Math.max(200, size.width - coperto.destra - coperto.sinistra), liberoH = Math.max(200, size2.height - coperto.basso - coperto.alto);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * (size.width / size2.height);
    const elev = THREE.MathUtils.degToRad(mira && "basso" in mira ? 17 : mira ? 34 : 54);
    const ampiezza = mira ? (stretto ? Math.min(mira.ampiezza, 12) : mira.ampiezza) : stretto ? 22 : LARGO + 2;
    const fondo = mira ? mira.fondo : stretto ? 18 : FONDO + 2;
    const distW = (ampiezza / 2 / tanH) * (size.width / liberoW);
    const distD = ((fondo * Math.sin(elev) + 4.5 * Math.cos(elev)) / 2 / tanV) * (size2.height / liberoH);
    const dist = Math.max(distW, distD, 4);
    const perPx = (2 * dist * tanH) / size.width;
    const tx = (mira?.x ?? 0) + ((coperto.destra - coperto.sinistra) / 2) * perPx;
    const tz = (mira?.z ?? (stretto ? 0 : 0.4)) + (((coperto.basso - coperto.alto) / 2) * perPx) / Math.sin(elev);
    const ty = mira ? mira.y : 0.6;
    c.minDistance = 2.2;
    c.maxDistance = Math.max(dist * 1.15, (LARGO / 2 / tanH) * 1.3);
    void c.setLookAt(tx, ty + dist * Math.sin(elev), tz + dist * Math.cos(elev), tx, ty, tz, !prima.current);
    prima.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- la telecamera si muove solo quando scegli una zona o una persona
  }, [selezione, zona, size.width, coperto.destra, coperto.sinistra, coperto.basso, coperto.alto, camera]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    const A = CameraControlsImpl.ACTION;
    c.mouseButtons.left = A.TRUCK; c.mouseButtons.right = A.ROTATE; c.mouseButtons.middle = A.DOLLY; c.mouseButtons.wheel = A.DOLLY;
    // come una mappa: un dito trascina l'ufficio (su, giù, destra, sinistra sul pavimento),
    // due dita pizzicano per avvicinarsi e, ruotando, girano la vista
    c.touches.one = A.TOUCH_TRUCK; c.touches.two = A.TOUCH_DOLLY_ROTATE; c.touches.three = A.TOUCH_ROTATE;
    c.verticalDragToForward = true;
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __camera: c });
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-LARGO / 2, 0, -FONDO / 2 - 1), new THREE.Vector3(LARGO / 2, 3, FONDO / 2 + 6)));
  }, []);

  return <CameraControls ref={ctrl} makeDefault smoothTime={0.45} draggingSmoothTime={0.12} dollySpeed={0.6} truckSpeed={2.2} minPolarAngle={0.25} maxPolarAngle={1.42} dollyToCursor />;
}

/* ---------- Etichette e fumetti ---------- */

function Pillola({ stato, nome, sotto, azione, scelto, onClick, punto }: { stato: StatoAgente | "cliente" | "cosa" | "tu"; nome: string; sotto?: string | null; azione?: string | null; scelto?: boolean; onClick: () => void; punto?: string }) {
  return (
    <button type="button" className="st-pillola" data-stato={stato} data-scelto={scelto || undefined} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <i style={punto ? { background: punto } : undefined} />
      <span><b>{nome}</b>{sotto ? <small>{sotto}</small> : null}</span>
      {azione ? <em>{azione} <span aria-hidden="true">▸</span></em> : null}
    </button>
  );
}

function Nuvola({ nome, f, lato, onClick }: { nome: string; f: Fumetto; lato: "sinistra" | "destra"; onClick: () => void }) {
  return (
    <button type="button" className="st-fumetto" data-tono={f.tono} data-lato={lato} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <small><i aria-hidden="true">!</i>{nome}</small>
      <b>{f.frase}</b>
      <em>{f.bottone} <span aria-hidden="true">▸</span></em>
    </button>
  );
}

function Etichetta({ y, children }: { y: number; children: React.ReactNode }) {
  return <Html position={[0, y, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>{children}</Html>;
}

/* ---------- Scena ---------- */

function Ufficio3D(p: PropsScena & { livello: Livello; ombre: number }) {
  const font = useFont();
  const perId = useMemo(() => Object.fromEntries(p.agenti.map((a) => [a.id, a])), [p.agenti]);
  // lo schermo si spegne se l'agente non è alla scrivania
  const posto = (id: string): PostoScrivania => {
    const a = perId[id];
    const via = a && Math.hypot(a.meta.x - AGENTE[id].posto[0], a.meta.z - AGENTE[id].posto[1]) > 0.1;
    return { x: AGENTE[id].posto[0], tipo: AGENTE[id].schermo, stato: via ? "libero" : a?.stato ?? "libero", accento: AGENTE[id].felpa };
  };
  const tavolo = (ids: string[]): PostoTavolo[] => ids.map((id) => ({ ...posto(id), id, z: AGENTE[id].posto[1], rot: AGENTE[id].rot ?? 0 }));
  const fila = (ids: string[], led: string, larga?: boolean) => <Scrivania z={AGENTE[ids[0]].posto[1]} posti={ids.map(posto)} led={led} larga={larga} />;
  const n = p.clienti.length;

  return (
    <>
      <color attach="background" args={["#e9ebf1"]} />
      <hemisphereLight args={["#ffffff", "#d9cbb3", 0.55]} />
      <directionalLight position={[-14, 30, 16]} intensity={2.4} color="#fff6ea" castShadow shadow-mapSize={[p.ombre, p.ombre]} shadow-bias={-0.0003} shadow-normalBias={0.04}>
        <orthographicCamera attach="shadow-camera" args={[-27, 27, 22, -22, 1, 90]} />
      </directionalLight>
      {/* luce vera: foto HDR di un salotto (Poly Haven, CC0) più i pannelli luminosi dell'ufficio */}
      <Suspense fallback={<Environment resolution={128} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 6]} scale={[30, 14, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} position={[-20, 6, 10]} scale={[12, 8, 1]} rotation={[0, Math.PI / 2, 0]} color="#ffeedd" />
        <Lightformer form="rect" intensity={0.7} position={[20, 6, -6]} scale={[12, 8, 1]} rotation={[0, -Math.PI / 2, 0]} color="#dfe6ff" />
        <Lightformer form="rect" intensity={0.6} position={[0, 4, -20]} scale={[30, 6, 1]} color="#c9b8ff" />
      </Environment>}>
        <Environment files="/studio/3d/salotto.hdr" resolution={256} frames={1} environmentIntensity={0.45}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 6]} scale={[30, 14, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} position={[-20, 6, 10]} scale={[12, 8, 1]} rotation={[0, Math.PI / 2, 0]} color="#ffeedd" />
        <Lightformer form="rect" intensity={0.7} position={[20, 6, -6]} scale={[12, 8, 1]} rotation={[0, -Math.PI / 2, 0]} color="#dfe6ff" />
        <Lightformer form="rect" intensity={0.6} position={[0, 4, -20]} scale={[30, 6, 1]} color="#c9b8ff" />
        </Environment>
      </Suspense>
      {/* luci calde dei reparti: insegna, cervello, lampada relax, sala strategia, tavolo social, giardino */}
      {p.livello > 0 ? (
        <>
          <pointLight position={[0, 3, -15.3]} color="#8b6dff" intensity={9} distance={9} decay={2} />
          <pointLight position={[CERVELLO[0], 2.2, CERVELLO[1]]} color="#7b5cff" intensity={4} distance={5} />
          <pointLight position={[-15, 1.9, 3.1]} color="#ffd9a0" intensity={3} distance={5} />
          <pointLight position={[TAVOLO_SALA[0], 3.2, TAVOLO_SALA[1]]} color="#ffe2b8" intensity={6} distance={9} />
          <pointLight position={[TAVOLO_SOCIAL[0], 3.0, TAVOLO_SOCIAL[1]]} color="#ffd6f0" intensity={4} distance={7} />
          <pointLight position={[16, 2.6, 4.7]} color="#fff0d0" intensity={4} distance={7} />
        </>
      ) : null}

      <Statico chiave={`${font.pronto}|${p.clienti.map((c) => c.id).join(",")}|${p.altriClienti > 0}`}>
      <Pavimento riflessi={p.livello > 1} />
      <Muro font={font} n={p.conteggi} />

      {/* tappeti dei reparti e nomi a terra */}
      <Tappeto x={1.8} z={-11.4} w={10.2} d={4.6} c="#e9e1d3" />
      <Tappeto x={-16} z={-3.6} w={8.4} d={4.4} c="#efe6da" />
      <ScrittaPavimento x={-20.2} z={-1.3} nome="Contenuti" sotto="reel e caroselli" font={font} />
      <ScrittaPavimento x={-4.4} z={-1.3} nome="Studio video" sotto="montaggio, riprese, sottotitoli" font={font} />
      <ScrittaPavimento x={10.0} z={1.2} nome="Tavolo social" sotto="Instagram, TikTok, Facebook" font={font} />
      <ScrittaPavimento x={-22.2} z={8.0} nome="Area relax" sotto="chi è libero si ferma qui" font={font} />
      <ScrittaPavimento x={10.4} z={8.0} nome="Giardino" sotto="ulivo e panchine" font={font} />
      <ScrittaPavimento x={18.6} z={0.9} nome="Fumatori" sotto="pausa sigaretta" font={font} />
      <ScrittaPavimento x={-2.4} z={-8.6} nome="Regia" sotto="direzione, controllo, memoria" font={font} />
      <ScrittaPavimento x={12.6} z={-8.6} nome="Cassa" sotto="incassi, fatture, solleciti" font={font} />

      {/* scrivanie e tavoli */}
      {fila(["direttore"], "#7b5cff", true)}
      {fila(["revisore"], "#7b5cff")}
      {fila(["sara"], "#35e08f")}
      {fila(["giulia", "luca"], "#ff8a3d")}
      {fila(["matteo"], "#ff4d6d", true)}
      <SalaStrategia posti={tavolo(["sofia", "marco", "elena", "davide"])} ads={p.ads} font={font} />
      <TavoloSocial posti={tavolo(["chiara", "simone", "alice"])} />
      <Giardino x={16} z={4.3} />
      <AngoloFumatori />

      <StudioVideo x={3.6} z={-5.4} />
      <Pendenti punti={[[0, -12.1], [4.2, -12.4], [-16, -4.7], [-2.6, -4.7], [15, -12.4], [15.5, -3.6], [-15.5, -12.2], [-13.8, -11.4], [0, 3.6], [-17.6, 4.6], [-9.4, 4.8]]} />

      {/* agenti: sedie fisse, persone che si muovono */}
      {AGENTI.map((a) => <Sedia key={`s${a.id}`} x={a.posto[0]} z={a.posto[1]} rot={a.rot ?? 0} c={a.reparto === "strategia" ? "#1f2a26" : undefined} />)}
      {AGENTI.map((a, i) => {
        const s = perId[a.id];
        if (!s) return null;
        const scelto = p.selezione?.tipo === "agente" && p.selezione.id === a.id;
        const apri = () => p.onSeleziona({ tipo: "agente", id: a.id });
        const allaScrivania = Math.hypot(s.meta.x - a.posto[0], s.meta.z - a.posto[1]) < 0.1;
        const sfalsa = allaScrivania && AGENTI.filter((b) => b.posto[1] === a.posto[1]).findIndex((b) => b.id === a.id) % 2 === 1 ? 0.5 : 0;
        return (
          <Personaggio key={a.id} meta={s.meta} instrada={instrada} umore={s.umore} divisa={a.id === "direttore" ? "#20232e" : "#5b2eff"} accento={a.felpa} pelle={a.pelle} capelli={a.capelli} coloreCapelli={a.coloreCapelli} extra={a.extra} fase={i} tazza={s.tazza} fumo={s.fumo} selezionato={scelto} scala={1.12} onClick={apri}>
            {s.fumetto ? (
              <Etichetta y={Math.abs(s.meta.x) < 3 ? 2.2 : Math.abs(s.meta.x) < 6 ? 3.3 : 2.5}><Nuvola nome={a.breve} f={s.fumetto} lato={s.meta.x < 0 ? "sinistra" : "destra"} onClick={() => p.onFumetto(s.fumetto!.id)} /></Etichetta>
            ) : (
              <Etichetta y={(s.meta.posa === "in_piedi" ? 2.15 : 2.0) + sfalsa}>
                <Pillola stato={s.stato} nome={a.breve} sotto={s.titolo ?? (allaScrivania ? SOTTO[s.stato] : "in pausa")} azione={AZIONE[s.stato]} scelto={scelto} onClick={apri} />
              </Etichetta>
            )}
          </Personaggio>
        );
      })}

      {p.agenti.filter((a) => a.id !== "direttore" && a.stato === "lavora").map((a, i) => <Percorso key={a.id} da={[DIRETTORE[0], DIRETTORE[1] + 0.9]} a={AGENTE[a.id].posto} fase={i} />)}

      <Cervello x={CERVELLO[0]} z={CERVELLO[1]} attivo={p.selezione?.tipo === "cervello"} onClick={() => p.onSeleziona({ tipo: "cervello" })}>
        <Etichetta y={3.5}><Pillola stato="cosa" nome="Cervello condiviso" sotto={p.regole === 0 ? "nessuna regola" : p.regole === 1 ? "1 regola" : `${p.regole} regole`} scelto={p.selezione?.tipo === "cervello"} onClick={() => p.onSeleziona({ tipo: "cervello" })} punto="#7b5cff" /></Etichetta>
      </Cervello>

      <Relax />
      <AngoloGiochi x={-17.6} y={0.7} z={1.95} tv={p.tv} onClick={p.onTv} />

      <TuaScrivania x={TUA[0]} z={TUA[1]} nome={p.nome} accesa={p.inAttesa > 0} font={font} onClick={p.onTuaScrivania} />
      <group position={[TUA[0] + 2.6, 0, TUA[1] - 0.2]}>
        <Etichetta y={1.5}><Pillola stato="tu" nome="La tua scrivania" sotto={p.inAttesa ? `${p.inAttesa} ${p.inAttesa === 1 ? "promemoria" : "promemoria"}` : "niente in sospeso"} azione={p.inAttesa ? "Vedi" : null} onClick={p.onTuaScrivania} punto={p.inAttesa ? "#ffc93d" : "#2fd08a"} /></Etichetta>
      </group>

      <Cassa x={CASSA_X} dati={p.cassa} font={font} onClick={p.onCassa}>
        <Etichetta y={2.3}><Pillola stato="cosa" nome="Cassa" sotto={`${euro(p.cassa.incassato)} a ${p.cassa.mese}`} azione="Conti" onClick={p.onCassa} punto="#35e08f" /></Etichetta>
      </Cassa>

      {/* reparti dei clienti, uno accanto all'altro, separati da pareti di vetro */}
      {n === 0 ? (
        <group position={[0, 0, Z_CLIENTI]}>
          <Tappeto x={0} z={0.4} w={10} d={5.8} c="#efe9dc" />
          <Etichetta y={1.2}><Pillola stato="cosa" nome="Reparti clienti" sotto="aggiungi il primo cliente" azione="Aggiungi" onClick={p.onNuovoCliente} punto="#2fd08a" /></Etichetta>
        </group>
      ) : null}
      {p.clienti.map((c, i) => {
        const [x, z] = postoReparto(i, n);
        const scelto = p.selezione?.tipo === "cliente" && p.selezione.id === c.id;
        const apri = () => p.onSeleziona({ tipo: "cliente", id: c.id });
        return (
          <group key={c.id}>
            <RepartoCliente x={x} z={z} nome={c.nome} colore={c.colore} conti={c.conti} quota={`${euro(c.quota)} al mese`} font={font} onClick={apri} />
            {i < n - 1 ? <Vetro x={x + PASSO_CLIENTI / 2} z={z + 0.4} lungo={5.2} /> : null}
            <Sedia x={x} z={z - 0.85} rot={Math.PI} c="#e9e4d8" />
            <Personaggio meta={{ x, z: z - 0.85, rot: Math.PI, posa: "seduto", y: 0 }} instrada={instrada} umore="ospite" divisa={c.colore} accento="#ffffff" pelle={["#f2cfae", "#e3b089", "#f4d3b3", "#d9a77f"][i % 4]} capelli={(["corti", "caschetto", "ciuffo", "chignon", "ricci"] as const)[i % 5]} coloreCapelli={["#3a2a20", "#7a5a3c", "#1f1a17", "#b98a4a"][i % 4]} fase={i + 20} selezionato={scelto} ospite onClick={apri}>
              <Etichetta y={2.15}><Pillola stato="cliente" nome={c.nome} sotto={c.scaduto > 0 ? `${euro(c.scaduto)} scaduti` : c.conti.scaduti ? `${c.conti.scaduti} lavori in ritardo` : `${c.conti.daFare + c.conti.inCorso + c.conti.daGuardare} lavori aperti`} azione="Apri" scelto={scelto} onClick={apri} punto={c.scaduto > 0 || c.conti.scaduti ? "#e5484d" : c.colore} /></Etichetta>
            </Personaggio>
          </group>
        );
      })}
      {p.altriClienti > 0 ? <group position={[21, 0, Z_CLIENTI - 3]}><Etichetta y={1.2}><Pillola stato="cosa" nome={`+ ${p.altriClienti} clienti`} azione="Conti" onClick={p.onCassa} punto="#2fd08a" /></Etichetta></group> : null}

      {/* piante grandi negli angoli e lungo i reparti */}
      <Palma x={-7.6} z={-15.4} s={1.15} />
      <Palma x={6.4} z={-15.4} s={1.15} />
      <Sansevieria x={-7.3} z={-5.4} s={0.95} vaso="#c39b55" />
      <Monstera x={-21.8} z={-6.0} s={1.0} vaso="#2b2724" />
      <Monstera x={21.7} z={8.0} s={1.05} vaso="#2b2724" />
      <Sansevieria x={7.4} z={2.6} s={0.9} vaso="#c39b55" />
      <Palma x={-5.6} z={2.4} s={0.95} />
      <Palma x={5.6} z={2.4} s={0.95} />
      <Ulivo x={-21.4} z={15.6} s={0.9} />
      <Ulivo x={21.4} z={15.6} s={0.9} />
      <Ficus x={-12.2} z={-7.2} s={0.9} vaso="#2b2724" />

      </Statico>

      <Regia zona={p.zona} selezione={p.selezione} agenti={p.agenti} clienti={p.clienti} coperto={p.coperto} />
      {p.livello > 1 ? (
        <EffectComposer multisampling={4}>
          <N8AO halfRes quality="performance" aoRadius={1.4} distanceFalloff={1} intensity={2.4} color="#2b2440" />
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      ) : p.livello > 0 ? (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      ) : null}
    </>
  );
}

/* Qualità: 2 = massima (computer), 1 = alta (telefono), 0 = leggera.
   Si parte dal massimo che il dispositivo regge; se i fotogrammi calano
   davvero, la scena scende di un gradino da sola invece di scattare. */
type Livello = 0 | 1 | 2;

function livelloIniziale(): Livello {
  if (typeof window === "undefined") return 1;
  const q = new URLSearchParams(window.location.search);
  if (q.get("alta") === "1") return 2;
  if (q.get("leggera") === "1") return 0;
  return window.matchMedia("(pointer: coarse)").matches ? 1 : 2;
}

/** Alcuni telefoni danno un buffer di profondità a 16 bit: lì il pavimento "sfarfalla". Lo misuriamo prima. */
function profonditaCorta(): boolean {
  try {
    const c = document.createElement("canvas");
    const g = (c.getContext("webgl2") ?? c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!g) return false;
    const bit = g.getParameter(g.DEPTH_BITS) as number;
    g.getExtension("WEBGL_lose_context")?.loseContext();
    return bit > 0 && bit < 24;
  } catch { return false; }
}

export default function Scena(p: PropsScena) {
  const [inizio] = useState(livelloIniziale);
  const [livello, setLivello] = useState<Livello>(inizio);
  const [profondita] = useState(() => typeof window !== "undefined" && profonditaCorta());
  const ombre = inizio === 2 ? 4096 : inizio === 1 ? 2048 : 1536;
  const [persa, setPersa] = useState(false);
  if (persa) {
    return (
      <div className="st-niente3d" role="alert">
        <p>La grafica 3D si è fermata su questo computer.</p>
        <p>Conti, Lavori, chat e promemoria funzionano lo stesso.</p>
        <button type="button" className="st-btn st-btn-pieno" onClick={() => window.location.reload()}>Riprova il 3D</button>
      </div>
    );
  }
  return (
    <Canvas flat shadows frameloop={p.attivo ? "always" : "never"} dpr={livello > 0 ? [1, 2] : [1, 1.25]} camera={{ fov: 50, near: 0.6, far: 140, position: [0, 40, 34] }} gl={{ antialias: true, powerPreference: "high-performance", logarithmicDepthBuffer: profondita }}
      onCreated={({ gl, scene }) => { if (process.env.NODE_ENV !== "production") Object.assign(window, { __studio: { gl, scene } }); gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setPersa(true); }); }}
      onPointerMissed={() => p.onSeleziona(null)} fallback={<p className="st-niente3d">Questo dispositivo non mostra il 3D. Usa le schede Lavori e Conti: funzionano uguale.</p>}>
      <PerformanceMonitor flipflops={2} onDecline={() => setLivello((l) => (l > 0 ? ((l - 1) as Livello) : l))} onFallback={() => setLivello(0)} />
      {livello > 1 ? <SoftShadows size={22} samples={12} focus={0.5} /> : null}
      <Ufficio3D {...p} livello={livello} ombre={ombre} />
    </Canvas>
  );
}
