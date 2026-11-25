"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Environment, Html, Lightformer, SoftShadows } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import * as THREE from "three";
import { AGENTE, AGENTI, FONDO, LARGO, ZONE, instrada, type Punto, type ZonaId } from "@/lib/studio/agenti";
import { euro, type StatoAgente } from "@/lib/studio/calcoli";
import type { Tono } from "@/lib/studio/promemoria";
import { Cassa, Cervello, Ficus, Monstera, Muro, Pavimento, Percorso, RepartoCliente, Relax, Sansevieria, Scrivania, ScrittaPavimento, StudioVideo, Tappeto, TuaScrivania, Vetro, type ContiCliente, type Conteggi, type DatiAds, type DatiCassa, type PostoScrivania } from "./Arredi";
import { Giardino, Palma, SalaStrategia, TavoloSocial, Ulivo, type PostoTavolo } from "./Stanze";
import { useFont } from "./base";
import { Personaggio, Sedia, type Umore } from "./Personaggio";

/* =============================================================
   L'ufficio di Apex Media in 3D. Tutto segue i dati: chi lavora sta
   alla scrivania, chi ha qualcosa da dirti cammina fino alla tua
   scrivania e te lo dice in un fumetto, chi è libero va in area
   relax e ogni tanto cambia posto, ogni cliente ha il suo reparto.
   ============================================================= */

export type Fumetto = { id: string; frase: string; bottone: string; tono: Tono };
export type AgenteScena = { id: string; stato: StatoAgente; titolo: string | null; meta: Punto; umore: Umore; tazza: boolean; fumetto: Fumetto | null };
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

  // da lontano le etichette mostrano solo il nome, da vicino anche cosa stanno facendo
  useFrame(() => {
    const c = ctrl.current;
    if (!c) return;
    const v = c.distance < 34 ? "vicino" : "insieme";
    if (v !== vista.current) { vista.current = v; const box = gl.domElement.closest<HTMLElement>(".st-scena"); if (box) box.dataset.vista = v; }
  });

  const mira = useMemo(() => {
    if (selezione?.tipo === "agente") { const a = agenti.find((x) => x.id === selezione.id); if (a) return { x: a.meta.x, z: a.meta.z - 0.4, ampiezza: 9, fondo: 6.5, y: 0.9 }; }
    if (selezione?.tipo === "cervello") return { x: CERVELLO[0], z: CERVELLO[1] + 0.8, ampiezza: 9, fondo: 6.5, y: 1.4 };
    if (selezione?.tipo === "cliente") { const i = clienti.findIndex((c) => c.id === selezione.id); if (i >= 0) { const [x, z] = postoReparto(i, clienti.length); return { x, z, ampiezza: 9.5, fondo: 7, y: 0.9 }; } }
    const z = ZONE.find((q) => q.id === zona);
    if (z) return { x: z.centro[0], z: z.centro[1], ampiezza: z.ampiezza, fondo: Math.min(14, z.ampiezza * 0.62), y: z.centro[1] < -9 ? 2 : 0.9 };
    // vista d'ingresso: il cuore dell'ufficio da vicino, non tutta la pianta
    if (zona === "vicino") return size.width < 760 ? { x: 0, z: 3.2, ampiezza: 12, fondo: 9, y: 0.8 } : { x: 0, z: 0.4, ampiezza: 28, fondo: 19, y: 0.8 };
    return null;
  }, [selezione, zona, agenti, clienti, size.width]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c || size.width < 10) return;
    const stretto = size.width < 760;
    const liberoW = Math.max(200, size.width - coperto.destra - coperto.sinistra), liberoH = Math.max(200, size.height - coperto.basso - coperto.alto);
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * (size.width / size.height);
    const elev = THREE.MathUtils.degToRad(mira ? 48 : 54);
    const ampiezza = mira ? (stretto ? Math.min(mira.ampiezza, 12) : mira.ampiezza) : stretto ? 22 : LARGO + 2;
    const fondo = mira ? mira.fondo : stretto ? 18 : FONDO + 2;
    const distW = (ampiezza / 2 / tanH) * (size.width / liberoW);
    const distD = ((fondo * Math.sin(elev) + 4.5 * Math.cos(elev)) / 2 / tanV) * (size.height / liberoH);
    const dist = Math.max(distW, distD, 9);
    const perPx = (2 * dist * tanH) / size.width;
    const tx = (mira?.x ?? 0) + ((coperto.destra - coperto.sinistra) / 2) * perPx;
    const tz = (mira?.z ?? (stretto ? 0 : 0.4)) + (((coperto.basso - coperto.alto) / 2) * perPx) / Math.sin(elev);
    const ty = mira ? mira.y : 0.6;
    c.minDistance = 7;
    c.maxDistance = Math.max(dist * 1.15, (LARGO / 2 / tanH) * 1.3);
    void c.setLookAt(tx, ty + dist * Math.sin(elev), tz + dist * Math.cos(elev), tx, ty, tz, !prima.current);
    prima.current = false;
  }, [mira, size.width, size.height, coperto.destra, coperto.sinistra, coperto.basso, coperto.alto, camera]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    const A = CameraControlsImpl.ACTION;
    c.mouseButtons.left = A.TRUCK; c.mouseButtons.right = A.ROTATE; c.mouseButtons.middle = A.DOLLY; c.mouseButtons.wheel = A.DOLLY;
    c.touches.one = A.TOUCH_TRUCK; c.touches.two = A.TOUCH_DOLLY_TRUCK; c.touches.three = A.TOUCH_ROTATE;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-LARGO / 2, 0, -FONDO / 2 - 1), new THREE.Vector3(LARGO / 2, 3, FONDO / 2 + 6)));
  }, []);

  return <CameraControls ref={ctrl} makeDefault smoothTime={0.45} draggingSmoothTime={0.12} dollySpeed={0.6} truckSpeed={1.6} minPolarAngle={0.3} maxPolarAngle={1.12} minAzimuthAngle={-0.7} maxAzimuthAngle={0.7} dollyToCursor />;
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

function Ufficio3D(p: PropsScena & { qualita: boolean }) {
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
      <directionalLight position={[-14, 30, 16]} intensity={2.4} color="#fff6ea" castShadow shadow-mapSize={p.qualita ? [4096, 4096] : [2048, 2048]} shadow-bias={-0.0003} shadow-normalBias={0.04}>
        <orthographicCamera attach="shadow-camera" args={[-27, 27, 22, -22, 1, 90]} />
      </directionalLight>
      <Environment resolution={128} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 6]} scale={[30, 14, 1]} rotation={[Math.PI / 2, 0, 0]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.9} position={[-20, 6, 10]} scale={[12, 8, 1]} rotation={[0, Math.PI / 2, 0]} color="#ffeedd" />
        <Lightformer form="rect" intensity={0.7} position={[20, 6, -6]} scale={[12, 8, 1]} rotation={[0, -Math.PI / 2, 0]} color="#dfe6ff" />
        <Lightformer form="rect" intensity={0.6} position={[0, 4, -20]} scale={[30, 6, 1]} color="#c9b8ff" />
      </Environment>

      <Pavimento />
      <Muro font={font} n={p.conteggi} />

      {/* tappeti dei reparti e nomi a terra */}
      <Tappeto x={1.8} z={-11.4} w={10.2} d={4.6} c="#e9e1d3" />
      <Tappeto x={-16} z={-3.6} w={8.4} d={4.4} c="#efe6da" />
      <ScrittaPavimento x={-20.2} z={-1.3} nome="Contenuti" sotto="reel e caroselli" font={font} />
      <ScrittaPavimento x={-4.4} z={-1.3} nome="Studio video" sotto="montaggio, riprese, sottotitoli" font={font} />
      <ScrittaPavimento x={10.0} z={1.2} nome="Tavolo social" sotto="Instagram, TikTok, Facebook" font={font} />
      <ScrittaPavimento x={-22.2} z={8.0} nome="Area relax" sotto="chi è libero si ferma qui" font={font} />
      <ScrittaPavimento x={10.4} z={8.0} nome="Giardino" sotto="ulivo e panchine" font={font} />
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

      <StudioVideo x={3.6} z={-5.4} />

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
          <Personaggio key={a.id} meta={s.meta} instrada={instrada} umore={s.umore} divisa={a.id === "direttore" ? "#20232e" : "#5b2eff"} accento={a.felpa} pelle={a.pelle} capelli={a.capelli} coloreCapelli={a.coloreCapelli} extra={a.extra} fase={i} tazza={s.tazza} selezionato={scelto} scala={1.12} onClick={apri}>
            {s.fumetto ? (
              <Etichetta y={Math.abs(s.meta.x) < 3 ? 2.2 : Math.abs(s.meta.x) < 6 ? 3.3 : 2.5}><Nuvola nome={a.nome} f={s.fumetto} lato={s.meta.x < 0 ? "sinistra" : "destra"} onClick={() => p.onFumetto(s.fumetto!.id)} /></Etichetta>
            ) : (
              <Etichetta y={(s.meta.posa === "in_piedi" ? 2.15 : 2.0) + sfalsa}>
                <Pillola stato={s.stato} nome={a.nome} sotto={s.titolo ?? (allaScrivania ? SOTTO[s.stato] : "in pausa")} azione={AZIONE[s.stato]} scelto={scelto} onClick={apri} />
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
      <Palma x={7.7} z={-15.4} s={1.15} />
      <Sansevieria x={-7.3} z={-5.4} s={0.95} vaso="#c39b55" />
      <Monstera x={-21.8} z={-6.0} s={1.0} vaso="#2b2724" />
      <Monstera x={21.7} z={8.0} s={1.05} vaso="#2b2724" />
      <Sansevieria x={7.4} z={2.6} s={0.9} vaso="#c39b55" />
      <Palma x={-5.6} z={2.4} s={0.95} />
      <Palma x={5.6} z={2.4} s={0.95} />
      <Ulivo x={-21.4} z={15.6} s={0.9} />
      <Ulivo x={21.4} z={15.6} s={0.9} />
      <Ficus x={-12.2} z={-7.2} s={0.9} vaso="#2b2724" />

      <Regia zona={p.zona} selezione={p.selezione} agenti={p.agenti} clienti={p.clienti} coperto={p.coperto} />
      {p.qualita ? (
        <EffectComposer multisampling={4}>
          <N8AO halfRes quality="performance" aoRadius={1.4} distanceFalloff={1} intensity={2.4} color="#2b2440" />
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export default function Scena(p: PropsScena) {
  // effetti pesanti (occlusione, bagliore, ombre morbide) solo su schermi grandi con mouse
  const [qualita] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 900px) and (hover: hover)").matches);
  return (
    <Canvas flat shadows frameloop={p.attivo ? "always" : "never"} dpr={qualita ? [1, 1.75] : [1, 1.5]} camera={{ fov: 27, near: 1, far: 260, position: [0, 40, 34] }} gl={{ antialias: !qualita, powerPreference: "high-performance" }} onPointerMissed={() => p.onSeleziona(null)} fallback={<p className="st-niente3d">Questo dispositivo non mostra il 3D. Usa le schede Lavori e Conti: funzionano uguale.</p>}>
      {qualita ? <SoftShadows size={22} samples={12} focus={0.5} /> : null}
      <Ufficio3D {...p} qualita={qualita} />
    </Canvas>
  );
}
