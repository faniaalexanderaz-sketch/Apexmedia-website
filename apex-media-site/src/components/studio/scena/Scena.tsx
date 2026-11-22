"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, Html } from "@react-three/drei";
import * as THREE from "three";
import { AGENTE, AGENTI, POSTI_RELAX, ZONE, type ZonaId } from "@/lib/studio/agenti";
import { euro, type StatoAgente } from "@/lib/studio/calcoli";
import { Cassa, Cervello, FONDO, LARGO, Lavagna, Percorso, Pianta, Pavimento, Quadro, Relax, Scrivania, ScrittaPavimento, Tabellone, Tappeto, TavoloClienti, postoCliente, type Conteggi, type DatiCassa } from "./Arredi";
import { C, useFont } from "./base";
import { Personaggio, Sedia } from "./Personaggio";

/* =============================================================
   L'ufficio: una lastra chiara vista dall'alto, con i reparti, la
   regia al centro, l'area relax, la sala clienti e la cassa.
   Tutto quello che si vede dipende dai dati: chi lavora sta alla
   scrivania, chi è libero va sul divano, i clienti siedono al tavolo,
   le monete crescono con gli incassi del mese.
   ============================================================= */

export type AgenteScena = { id: string; stato: StatoAgente; titolo: string | null; relax: number | null };
export type ClienteScena = { id: number; nome: string; colore: string; quota: number; scaduto: number };
export type Selezione = { tipo: "agente"; id: string } | { tipo: "cervello" } | { tipo: "cliente"; id: number } | null;

export type PropsScena = {
  /** false quando si guarda un'altra scheda: la scena smette di disegnare */
  attivo: boolean;
  agenti: AgenteScena[];
  clienti: ClienteScena[];
  altriClienti: number;
  cassa: DatiCassa;
  conteggi: Conteggi;
  regole: number;
  zona: ZonaId | "tutto";
  selezione: Selezione;
  /** spazio coperto dall'interfaccia, in pixel: la scena si sposta per restare al centro della parte libera */
  coperto: { destra: number; basso: number; alto: number };
  onSeleziona: (s: Selezione) => void;
  onCassa: () => void;
  onNuovoCliente: () => void;
};

const CERVELLO: [number, number] = [-5.2, -7.5];
const CLIENTI: [number, number] = [1.2, 7.4];
const CASSA_X = 12.2;
const DIRETTORE = AGENTE.direttore.posto;

const AZIONE: Record<StatoAgente, string | null> = { attesa: "Guarda", lavora: null, coda: "Apri", libero: null };
const SOTTO: Record<StatoAgente, string> = { attesa: "ti aspetta", lavora: "sta lavorando", coda: "in coda", libero: "libero" };

function dove(a: AgenteScena): { x: number; z: number; rot: number; y: number; posa: "seduto" | "in_piedi" } {
  if (a.relax !== null && POSTI_RELAX[a.relax]) return POSTI_RELAX[a.relax];
  const [x, z] = AGENTE[a.id].posto;
  return { x, z, rot: 0, y: 0, posa: "seduto" };
}

/* ---------- Telecamera ---------- */

function Regia({ zona, selezione, agenti, coperto }: Pick<PropsScena, "zona" | "selezione" | "agenti" | "coperto">) {
  const ctrl = useRef<CameraControlsImpl>(null);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const gl = useThree((s) => s.gl);
  const prima = useRef(true);
  const vista = useRef("");

  // da lontano le pillole mostrano solo il nome, da vicino anche cosa stanno facendo
  useFrame(() => {
    const c = ctrl.current;
    if (!c) return;
    const v = c.distance < 30 ? "vicino" : "insieme";
    if (v !== vista.current) { vista.current = v; const box = gl.domElement.closest<HTMLElement>(".st-scena"); if (box) box.dataset.vista = v; }
  });

  // dove guardare: la persona scelta, la zona scelta, oppure tutto l'ufficio
  const mira = useMemo(() => {
    if (selezione?.tipo === "agente") { const a = agenti.find((x) => x.id === selezione.id); if (a) { const p = dove(a); return { x: p.x, z: p.z - 0.4, ampiezza: 8.5, fondo: 6 }; } }
    if (selezione?.tipo === "cervello") return { x: CERVELLO[0], z: CERVELLO[1] + 0.6, ampiezza: 8.5, fondo: 6 };
    if (selezione?.tipo === "cliente") return { x: CLIENTI[0], z: CLIENTI[1], ampiezza: 10, fondo: 7 };
    const z = ZONE.find((q) => q.id === zona);
    // le zone contro il muro si inquadrano più in alto, così tabellone e schermo della cassa restano visibili
    if (z) return { x: z.centro[0], z: z.centro[1], ampiezza: z.ampiezza, fondo: z.ampiezza * 0.62, y: z.centro[1] < -5 ? 1.9 : undefined };
    return null;
  }, [selezione, zona, agenti]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c || size.width < 10) return;
    const stretto = size.width < 760;
    const liberoW = Math.max(200, size.width - coperto.destra), liberoH = Math.max(200, size.height - coperto.basso - coperto.alto);
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const tanV = Math.tan(vfov / 2), tanH = tanV * (size.width / size.height);
    const elev = THREE.MathUtils.degToRad(mira ? 50 : 53);
    // su schermi stretti la vista d'insieme non può mostrare tutto: parte dal centro e si scorre
    const ampiezza = mira ? (stretto ? Math.min(mira.ampiezza, 7.5) : mira.ampiezza) : stretto ? 19 : LARGO + 2.5;
    const fondo = mira ? mira.fondo : stretto ? 16 : FONDO + 2;
    const distW = (ampiezza / 2 / tanH) * (size.width / liberoW);
    const distD = ((fondo * Math.sin(elev) + 3.2 * Math.cos(elev)) / 2 / tanV) * (size.height / liberoH);
    const dist = Math.max(distW, distD, 9);
    // sposta il bersaglio per centrare la scena nella parte non coperta dall'interfaccia
    const perPx = (2 * dist * tanH) / size.width;
    const tx = (mira?.x ?? 0) + (coperto.destra / 2) * perPx;
    const tz = (mira?.z ?? (stretto ? -1.5 : 0.2)) + (((coperto.basso - coperto.alto) / 2) * perPx) / Math.sin(elev);
    const ty = mira ? ("y" in mira && mira.y !== undefined ? mira.y : 0.9) : 0.4;
    c.minDistance = 8;
    c.maxDistance = Math.max(dist * 1.15, (LARGO / 2 / tanH) * 1.3);
    void c.setLookAt(tx, ty + dist * Math.sin(elev), tz + dist * Math.cos(elev), tx, ty, tz, !prima.current);
    prima.current = false;
  }, [mira, size.width, size.height, coperto.destra, coperto.basso, coperto.alto, camera]);

  useEffect(() => {
    const c = ctrl.current;
    if (!c) return;
    const A = CameraControlsImpl.ACTION;
    // trascinare sposta, la rotella avvicina; ruotare resta possibile con il tasto destro o tre dita
    c.mouseButtons.left = A.TRUCK; c.mouseButtons.right = A.ROTATE; c.mouseButtons.middle = A.DOLLY; c.mouseButtons.wheel = A.DOLLY;
    c.touches.one = A.TOUCH_TRUCK; c.touches.two = A.TOUCH_DOLLY_TRUCK; c.touches.three = A.TOUCH_ROTATE;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(-LARGO / 2, 0, -FONDO / 2 - 1), new THREE.Vector3(LARGO / 2 + 4, 2, FONDO / 2 + 6)));
  }, []);

  return <CameraControls ref={ctrl} makeDefault smoothTime={0.42} draggingSmoothTime={0.12} dollySpeed={0.6} truckSpeed={1.6} minPolarAngle={0.3} maxPolarAngle={1.12} minAzimuthAngle={-0.7} maxAzimuthAngle={0.7} dollyToCursor />;
}

/* ---------- Etichette ---------- */

function Pillola({ stato, nome, sotto, azione, scelto, onClick, punto }: { stato: StatoAgente | "cliente" | "cosa"; nome: string; sotto?: string | null; azione?: string | null; scelto?: boolean; onClick: () => void; punto?: string }) {
  return (
    <button type="button" className="st-pillola" data-stato={stato} data-scelto={scelto || undefined} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <i style={punto ? { background: punto } : undefined} />
      <span><b>{nome}</b>{sotto ? <small>{sotto}</small> : null}</span>
      {azione ? <em>{azione} <span aria-hidden="true">▸</span></em> : null}
    </button>
  );
}

function Etichetta({ y, children }: { y: number; children: React.ReactNode }) {
  return <Html position={[0, y, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>{children}</Html>;
}

/* ---------- Scena ---------- */

function Ufficio3D(p: PropsScena) {
  const font = useFont();
  const perId = useMemo(() => Object.fromEntries(p.agenti.map((a) => [a.id, a])), [p.agenti]);
  const stato = (id: string): StatoAgente => perId[id]?.stato ?? "libero";
  // lo schermo si spegne se l'agente è al divano
  const posto = (id: string) => ({ x: AGENTE[id].posto[0], tipo: AGENTE[id].schermo, stato: perId[id]?.relax != null ? ("libero" as const) : stato(id), accento: AGENTE[id].felpa });
  const fila = (ids: string[]) => <Scrivania z={AGENTE[ids[0]].posto[1]} posti={ids.map(posto)} />;
  const posti = p.clienti.map((_, i) => postoCliente(CLIENTI[0], CLIENTI[1], i, p.clienti.length));

  return (
    <>
      <color attach="background" args={[C.sfondo]} />
      <hemisphereLight args={["#ffffff", "#efe6d6", 1.95]} />
      <directionalLight position={[-10, 24, 13]} intensity={1.75} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04}>
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 20, -20, 1, 70]} />
      </directionalLight>

      <Pavimento />

      {/* tappeti delle zone e scritte a terra */}
      <Tappeto x={-11.9} z={-5.9} w={7.4} d={5.2} c="#efeafd" />
      <Tappeto x={0} z={1.5} w={11.6} d={4.6} c="#fdeee0" />
      <Tappeto x={11.5} z={-2.9} w={7.2} d={4.2} c="#e4f5ec" />
      <Tappeto x={11.5} z={4.1} w={7.2} d={4.2} c="#fff5d2" />
      <mesh position={[DIRETTORE[0], 0.014, DIRETTORE[1] - 0.45]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.75, 3.0, 64]} /><meshLambertMaterial color="#edd9a6" /></mesh>
      {ZONE.filter((z) => !["regia", "cassa", "clienti"].includes(z.id)).map((z) => <ScrittaPavimento key={z.id} x={z.centro[0] - (z.id === "contenuti" ? 5.6 : z.id === "relax" ? 4.0 : 3.4)} z={z.centro[1] + (z.id === "contenuti" ? 2.75 : z.id === "relax" ? 3.65 : z.id === "strategia" ? 2.45 : 2.25)} nome={z.nome} sotto={z.sotto} font={font} />)}
      <ScrittaPavimento x={CLIENTI[0] + 3.7} z={CLIENTI[1] + 2.3} nome="Sala clienti" sotto="un posto per ogni cliente" font={font} />

      {/* muro di fondo */}
      <Tabellone n={p.conteggi} font={font} />
      <Lavagna x={-12} />
      <Quadro x={-8.2} c={C.viola} />
      <Quadro x={-6.4} c={C.giallo} largo={1.5} />
      <Quadro x={6.6} c={C.blu} largo={1.5} />

      {/* scrivanie */}
      {fila(["direttore"])}
      {fila(["revisore"])}
      {fila(["sofia", "marco"])}
      {fila(["giulia", "luca", "chiara", "matteo"])}
      {fila(["davide", "elena"])}
      {fila(["simone", "alice"])}

      {/* agenti */}
      {AGENTI.map((a, i) => {
        const s = perId[a.id] ?? { id: a.id, stato: "libero" as const, titolo: null, relax: null };
        const vicini = AGENTI.filter((b) => b.posto[1] === a.posto[1]).map((b) => b.id);
        const sfalsa = s.relax === null && vicini.indexOf(a.id) % 2 === 1 ? 0.55 : 0;
        const d = dove(s);
        const scelto = p.selezione?.tipo === "agente" && p.selezione.id === a.id;
        const apri = () => p.onSeleziona({ tipo: "agente", id: a.id });
        return (
          <group key={a.id}>
            <Sedia x={a.posto[0]} z={a.posto[1]} />
            <Personaggio x={d.x} z={d.z} rot={d.rot} y={d.y} posa={d.posa} umore={s.stato} felpa={a.felpa} pelle={a.pelle} capelli={a.capelli} coloreCapelli={a.coloreCapelli} fase={i} tazza={s.relax !== null} selezionato={scelto} onClick={apri}>
              <Etichetta y={(d.posa === "in_piedi" ? 2.3 : 2.15) + sfalsa}>
                <Pillola stato={s.stato} nome={a.nome} sotto={s.titolo ?? (s.relax !== null ? "in pausa" : SOTTO[s.stato])} azione={AZIONE[s.stato]} scelto={scelto} onClick={apri} />
              </Etichetta>
            </Personaggio>
          </group>
        );
      })}

      {/* percorsi dal Direttore a chi ha un lavoro aperto */}
      {p.agenti.filter((a) => a.id !== "direttore" && a.stato !== "libero").map((a, i) => <Percorso key={a.id} da={[DIRETTORE[0], DIRETTORE[1] + 0.9]} a={AGENTE[a.id].posto} stato={a.stato} fase={i} />)}

      <Cervello x={CERVELLO[0]} z={CERVELLO[1]} attivo={p.selezione?.tipo === "cervello"} onClick={() => p.onSeleziona({ tipo: "cervello" })}>
        <Etichetta y={3.5}><Pillola stato="cosa" nome="Cervello condiviso" sotto={p.regole === 0 ? "nessuna regola ancora" : p.regole === 1 ? "1 regola" : `${p.regole} regole`} scelto={p.selezione?.tipo === "cervello"} onClick={() => p.onSeleziona({ tipo: "cervello" })} punto={C.viola} /></Etichetta>
      </Cervello>

      <Relax />

      {/* sala clienti: ogni cliente è una persona seduta al tavolo */}
      <TavoloClienti x={CLIENTI[0]} z={CLIENTI[1]} vuota={p.clienti.length === 0} onClick={p.onNuovoCliente} />
      {p.clienti.length === 0 ? (
        <group position={[CLIENTI[0], 0, CLIENTI[1]]}><Etichetta y={1.9}><Pillola stato="cosa" nome="Sala clienti" sotto="aggiungi il primo cliente" azione="Aggiungi" onClick={p.onNuovoCliente} punto={C.verde} /></Etichetta></group>
      ) : null}
      {p.clienti.map((c, i) => {
        const q = posti[i];
        const scelto = p.selezione?.tipo === "cliente" && p.selezione.id === c.id;
        const apri = () => p.onSeleziona({ tipo: "cliente", id: c.id });
        return (
          <group key={c.id}>
            <Sedia x={q.x} z={q.z} rot={q.rot} c="#e9e4d8" />
            <Personaggio x={q.x} z={q.z} rot={q.rot} umore="ospite" felpa={c.colore} pelle={["#f2cfae", "#e3b089", "#f4d3b3", "#d9a77f"][i % 4]} capelli={(["corti", "caschetto", "ciuffo", "chignon", "ricci"] as const)[i % 5]} coloreCapelli={["#3a2a20", "#7a5a3c", "#1f1a17", "#b98a4a"][i % 4]} fase={i + 20} selezionato={scelto} onClick={apri}>
              <Etichetta y={2.15 + (i % 2 ? 0.55 : 0)}><Pillola stato="cliente" nome={c.nome} sotto={c.scaduto > 0 ? `${euro(c.scaduto)} scaduti` : `${euro(c.quota)} al mese`} scelto={scelto} onClick={apri} punto={c.scaduto > 0 ? C.rosso : c.colore} /></Etichetta>
            </Personaggio>
          </group>
        );
      })}
      {p.altriClienti > 0 ? <group position={[CLIENTI[0] + 3.3, 0, CLIENTI[1] - 1.2]}><Etichetta y={1.2}><Pillola stato="cosa" nome={`+ ${p.altriClienti} clienti`} onClick={p.onCassa} punto={C.verde} /></Etichetta></group> : null}

      <Cassa x={CASSA_X} dati={p.cassa} font={font} onClick={p.onCassa}>
        <Etichetta y={2.5}><Pillola stato="cosa" nome="Cassa" sotto={`${euro(p.cassa.incassato)} a ${p.cassa.mese}`} azione="Conti" onClick={p.onCassa} punto={C.verde} /></Etichetta>
      </Cassa>

      {/* piante */}
      <Pianta x={-16.2} z={-10.2} s={1.15} />
      <Pianta x={-7.3} z={-2.4} />
      <Pianta x={7.2} z={-9.9} s={1.1} />
      <Pianta x={7.4} z={1.0} />
      <Pianta x={16.2} z={9.9} s={1.2} />
      <Pianta x={-16.1} z={10.0} s={1.25} vaso="#f0e2c6" />
      <Pianta x={-2.4} z={10.2} s={0.95} />
      <Pianta x={16.2} z={0.6} s={0.9} />

      <Regia zona={p.zona} selezione={p.selezione} agenti={p.agenti} coperto={p.coperto} />
    </>
  );
}

export default function Scena(p: PropsScena) {
  return (
    <Canvas flat shadows frameloop={p.attivo ? "always" : "never"} dpr={[1, 1.75]} camera={{ fov: 27, near: 1, far: 220, position: [0, 34, 28] }} gl={{ antialias: true, powerPreference: "high-performance" }} onPointerMissed={() => p.onSeleziona(null)} fallback={<p className="st-niente3d">Questo dispositivo non mostra il 3D. Usa le schede Lavori e Conti: funzionano uguale.</p>}>
      <Ufficio3D {...p} />
    </Canvas>
  );
}
