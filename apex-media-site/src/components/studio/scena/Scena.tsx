"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Environment, Html, Lightformer, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { AGENTE, AGENTI, FONDO, LARGO, TAGLIO, TAVOLO_SALA, TAVOLO_SOCIAL, ZONE, instrada, type Punto, type ZonaId } from "@/lib/studio/agenti";
import type { SchermoTv } from "@/lib/studio/tipi";
import { euro, type StatoAgente } from "@/lib/studio/calcoli";
import type { Tono } from "@/lib/studio/promemoria";
import { AngoloGiochi, Cassa, Cervello, Pendenti, Ficus, Monstera, Muro, Pavimento, Percorso, RepartoCliente, Relax, Sansevieria, Scrivania, ScrittaPavimento, StudioVideo, Tappeto, TuaScrivania, Vetro, type ContiCliente, type Conteggi, type DatiAds, type DatiCassa, type PostoScrivania } from "./Arredi";
import { AngoloFumatori, Palma, SalaStrategia, TavoloSocial, Ulivo, type PostoTavolo } from "./Stanze";
import { GiardinoNuovo, Spa } from "./Esterni";
import { useFont } from "./base";
import { Statico } from "./Statico";
import { LedArcobaleno } from "./LedArcobaleno";
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
  const turno = useRef(0);
  const lontano = useRef(30);
  const vista = useRef("");
  // persone e reparti si muovono di continuo: la telecamera li legge solo quando scegli tu dove andare
  const ultimi = useRef({ agenti, clienti, alto: size.height });
  useEffect(() => { ultimi.current = { agenti, clienti, alto: size.height }; });

  // da lontano le etichette mostrano solo il nome, da vicino anche cosa stanno facendo
  useFrame(() => {
    const c = ctrl.current;
    if (!c) return;
    // la telecamera ruota sul posto: conta quanto è lontana dalla zona che sta guardando
    const v = lontano.current < 34 ? "vicino" : "insieme";
    if (v !== vista.current) { vista.current = v; const box = gl.domElement.closest<HTMLElement>(".st-scena"); if (box) box.dataset.vista = v; }
  });

  // vista in prima persona: in piedi, poco sopra le teste, vicino a quello che guardi
  const trovaMira = () => {
    const { agenti, clienti } = ultimi.current;
    if (selezione?.tipo === "agente") { const a = agenti.find((x) => x.id === selezione.id); if (a) return { x: a.meta.x, z: a.meta.z - 0.3, ampiezza: 5.5, fondo: 3, y: 1.1, gradi: 13 }; }
    if (selezione?.tipo === "cervello") return { x: CERVELLO[0], z: CERVELLO[1] + 0.8, ampiezza: 6.5, fondo: 3.5, y: 1.6, gradi: 13 };
    if (selezione?.tipo === "cliente") { const i = clienti.findIndex((c) => c.id === selezione.id); if (i >= 0) { const [x, z] = postoReparto(i, clienti.length); return { x, z, ampiezza: 7, fondo: 4, y: 1.1, gradi: 14 }; } }
    const z = ZONE.find((q) => q.id === zona);
    if (z) return { x: z.centro[0], z: z.centro[1], ampiezza: z.ampiezza * 0.72, fondo: Math.min(8, z.ampiezza * 0.4), y: z.centro[1] < -9 ? 1.7 : 1.1, gradi: 16 };
    // vista d'ingresso: il cuore dell'ufficio, ad altezza d'occhi
    if (zona === "vicino") return size.width < 760 ? { x: 0, z: 2.2, ampiezza: 5, fondo: 3, y: 1.3, gradi: 12 } : { x: 0, z: -0.6, ampiezza: 9.5, fondo: 5, y: 1.3, gradi: 12 };
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
    const elev = THREE.MathUtils.degToRad(mira ? mira.gradi : 50);
    const ampiezza = mira ? (stretto ? Math.min(mira.ampiezza, 12) : mira.ampiezza) : stretto ? 22 : LARGO + 11;
    const fondo = mira ? mira.fondo : stretto ? 18 : FONDO + 2;
    const distW = (ampiezza / 2 / tanH) * (size.width / liberoW);
    const distD = ((fondo * Math.sin(elev) + 4.5 * Math.cos(elev)) / 2 / tanV) * (size2.height / liberoH);
    const dist = Math.max(distW, distD, 4);
    const perPx = (2 * dist * tanH) / size.width;
    const tx = (mira?.x ?? (stretto ? 0 : 4.6)) + ((coperto.destra - coperto.sinistra) / 2) * perPx;
    const tz = (mira?.z ?? (stretto ? 0 : 0.4)) + (((coperto.basso - coperto.alto) / 2) * perPx) / Math.sin(elev);
    const ty = mira ? mira.y : 0.6;
    // si guarda solo in orizzontale: l'inclinazione resta quella scelta per la zona
    const polare = Math.PI / 2 - elev;
    c.minPolarAngle = polare; c.maxPolarAngle = polare;
    c.minDistance = 0; c.maxDistance = Infinity;
    const cx = tx, cy = ty + dist * Math.sin(elev), cz = tz + dist * Math.cos(elev);
    lontano.current = dist;
    const giro = ++turno.current;
    // prima vola fino alla zona, poi il punto attorno a cui gira diventa la telecamera stessa:
    // trascinando col dito si gira la testa sul posto, non ci si sposta
    const k = 0.02 / dist;
    void c.zoomTo(1, !prima.current);
    void c.setLookAt(cx, cy, cz, tx, ty, tz, !prima.current).then(() => {
      if (giro !== turno.current) return;
      void c.setLookAt(cx, cy, cz, cx + (tx - cx) * k, cy + (ty - cy) * k, cz + (tz - cz) * k, false);
    });
    prima.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- la telecamera si muove solo quando scegli una zona o una persona
  }, [selezione, zona, size.width, coperto.destra, coperto.sinistra, coperto.basso, coperto.alto, camera]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    const A = CameraControlsImpl.ACTION;
    // studio fermo: niente spostamenti né zoom; col dito (o il mouse) si gira solo lo sguardo a destra e sinistra.
    // Per cambiare stanza si toccano le zone in basso.
    // zoom: due dita (o la rotellina) avvicinano la visuale senza spostarsi, come un binocolo
    c.mouseButtons.left = A.ROTATE; c.mouseButtons.right = A.NONE; c.mouseButtons.middle = A.NONE; c.mouseButtons.wheel = A.ZOOM;
    c.touches.one = A.TOUCH_ROTATE; c.touches.two = A.TOUCH_ZOOM; c.touches.three = A.NONE;
    c.minZoom = 1; c.maxZoom = 5;
    c.azimuthRotateSpeed = 0.45; c.polarRotateSpeed = 0;
    if (process.env.NODE_ENV !== "production") Object.assign(window, { __camera: c });
  }, []);

  return <CameraControls ref={ctrl} makeDefault smoothTime={0.5} draggingSmoothTime={0.15} dollySpeed={0.45} />;
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

function Ufficio3D(p: PropsScena & { livello: Livello; carico: Livello; ombre: number }) {
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
      <color attach="background" args={["#08080d"]} />
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
      <ScrittaPavimento x={9.2} z={8.1} nome="Giardino" sotto="prato, fiori e panchine" font={font} />
      <ScrittaPavimento x={23.6} z={8.1} nome="Spa" sotto="jacuzzi e lettini" font={font} />
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
      <GiardinoNuovo alta={p.livello > 1} />
      <Spa alta={p.livello > 1} />
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
          <Personaggio key={a.id} meta={s.meta} instrada={instrada} umore={s.umore} divisa={a.id === "direttore" ? "#20232e" : "#5b2eff"} accento={a.felpa} pelle={a.pelle} capelli={a.capelli} taglio={TAGLIO[a.id]} donna={a.donna} barba={a.barba} coloreCapelli={a.coloreCapelli} extra={a.extra} fase={i} tazza={s.tazza} fumo={s.fumo} selezionato={scelto} onClick={apri}>
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
        <Etichetta y={1.5}><Pillola stato="tu" nome="Il tuo computer" sotto={p.inAttesa ? `riunione · ${p.inAttesa} promemoria` : "riunione con il team"} azione="Entra" onClick={p.onTuaScrivania} punto={p.inAttesa ? "#ffc93d" : "#2fd08a"} /></Etichetta>
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
            <Personaggio meta={{ x, z: z - 0.85, rot: Math.PI, posa: "seduto", y: 0 }} instrada={instrada} umore="ospite" divisa={c.colore} accento="#ffffff" pelle={["#f2cfae", "#e3b089", "#f4d3b3", "#d9a77f"][i % 4]} capelli={(["corti", "caschetto", "ciuffo", "chignon", "ricci"] as const)[i % 5]} taglio={(["corti", "lunghi", "ciuffo", "coda", "ricci", "caschetto"] as const)[i % 6]} donna={i % 6 === 1 || i % 6 === 3 || i % 6 === 5} barba={i % 6 === 2} coloreCapelli={["#3a2a20", "#7a5a3c", "#1f1a17", "#b98a4a"][i % 4]} fase={i + 20} selezionato={scelto} ospite onClick={apri}>
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

      <LedArcobaleno />
      <Regia zona={p.zona} selezione={p.selezione} agenti={p.agenti} clienti={p.clienti} coperto={p.coperto} />
      <Preriscalda />
      {/* gli effetti finali seguono il carico del momento: toglierli non ricompila i materiali */}
      {p.livello > 1 && p.carico > 1 ? (
        <EffectComposer multisampling={4}>
          <N8AO halfRes quality="performance" aoRadius={1.4} distanceFalloff={1} intensity={2.4} color="#2b2440" />
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      ) : p.livello > 0 && p.carico > 0 ? (
        <EffectComposer multisampling={p.livello > 1 ? 4 : 0}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      ) : null}
    </>
  );
}

/* Qualità: 2 = massima (computer), 1 = alta (telefono), 0 = leggera.
   Il livello si sceglie una volta all'apertura e non cambia più: luci, ombre e
   riflessi diversi costringono la scheda grafica a ricostruire tutti i materiali,
   e sul telefono questo bloccava la scena per qualche secondo. Se i fotogrammi
   calano, scende solo il "carico": meno pixel e meno effetti finali. */
type Livello = 0 | 1 | 2;

/** Prepara in anticipo i materiali di tutto quello che c'è (anche nascosto: telefoni, costumi, oggetti in mano),
    così non si compilano a metà animazione. Riparte quando finiscono di arrivare i modelli 3D. */
function Preriscalda() {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera);
  useEffect(() => {
    let vivo = true;
    const scalda = () => {
      if (!vivo) return;
      const nascosti: THREE.Object3D[] = [];
      scene.traverse((o) => { if (!o.visible && !o.userData.fuso) { nascosti.push(o); o.visible = true; } });
      try { gl.compile(scene, camera); } catch { /* niente: si compilerà al bisogno */ }
      for (const o of nascosti) o.visible = false;
    };
    const t1 = setTimeout(scalda, 1500), t2 = setTimeout(scalda, 9000);
    const m = THREE.DefaultLoadingManager, prima = m.onLoad;
    m.onLoad = () => { prima?.(); setTimeout(scalda, 300); };
    return () => { vivo = false; clearTimeout(t1); clearTimeout(t2); m.onLoad = prima; };
  }, [gl, scene, camera]);
  return null;
}

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
  const [fisso] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("alta") === "1");
  const livello = inizio;
  const [carico, setCarico] = useState<Livello>(inizio);
  const [profondita] = useState(() => typeof window !== "undefined" && profonditaCorta());
  const ombre = inizio === 2 ? 4096 : inizio === 1 ? 1024 : 1024;
  // telefono: al massimo 1,5 pixel per punto (gli schermi a 3x costano il quadruplo senza vedersi meglio)
  // nitidezza: si parte al massimo (2 pixel per punto, anche sul telefono); se il telefono fatica scende a 1,5 e poi a 1
  const dpr: number | [number, number] = carico >= inizio ? [1, 2] : carico === inizio - 1 ? [1, 1.5] : 1;
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
    <Canvas shadows frameloop={p.attivo ? "always" : "never"} dpr={dpr} camera={{ fov: 50, near: 0.6, far: 140, position: [0, 40, 34] }} gl={{ antialias: true, powerPreference: "high-performance", logarithmicDepthBuffer: profondita, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.08 }}
      onCreated={({ gl, scene }) => { if (process.env.NODE_ENV !== "production") Object.assign(window, { __studio: { gl, scene } }); gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setPersa(true); }); }}
      onPointerMissed={() => p.onSeleziona(null)} fallback={<p className="st-niente3d">Questo dispositivo non mostra il 3D. Usa le schede Lavori e Conti: funzionano uguale.</p>}>
      {/* con ?alta=1 la qualità resta al massimo anche se i fotogrammi calano */}
      {!fisso ? <PerformanceMonitor bounds={(r) => (r > 90 ? [50, 90] : [24, 50])} flipflops={3} onDecline={() => setCarico((l) => (l > 0 ? ((l - 1) as Livello) : l))} onFallback={() => setCarico(0)} /> : null}
      {livello > 1 ? <SoftShadows size={22} samples={12} focus={0.5} /> : null}
      <Ufficio3D {...p} livello={livello} carico={carico} ombre={ombre} />
    </Canvas>
  );
}
