"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { REGOLE_FISSE } from "@/lib/studio/regole";
import { AGENTE, AGENTI, FUMATORI, POSTI_FUMO, POSTI_RELAX, POSTI_VISITA, ZONE, postoScrivania, type Punto, type ZonaId } from "@/lib/studio/agenti";
import { dataBreve, daIncassare, euro, giorniTra, incassatoNelMese, iniziali, nomeMese, ricorrente, riepilogoCampagne, saluto, scaduta, servizioAttivoNelMese, somma, statoAgente, type StatoAgente } from "@/lib/studio/calcoli";
import { visite } from "@/lib/studio/promemoria";
import type { Lavoro } from "@/lib/studio/tipi";
import { Avatar } from "./Lavori";
import { ImportoModificabile } from "./Moduli";
import { RigaPromemoria } from "./Notifiche";
import { Confine3D, webglDisponibile } from "@/components/three/Confine3D";
import { ChatAgente, ElencoTeam, StrisciaTeam } from "./Team";
import { Joystick } from "./Joystick";
import { useStudio } from "./StudioApp";
import type { AgenteScena, ClienteScena, Selezione } from "./scena/Scena";

/* =============================================================
   Ufficio: la scena 3D con sopra il saluto, i filtri per zona, la
   barra dei promemoria e il pannello di chi è stato scelto.
   Qui si decide dove sta ognuno: alla scrivania se lavora, davanti
   alla tua scrivania se deve dirti qualcosa, in area relax se è libero.
   ============================================================= */

/* Il riquadro "Da fare per te" si può ridurre a una pillola, ingrandire o tenere normale.
   La scelta resta ricordata su questo dispositivo. */
type Dock = "normale" | "chiuso" | "grande";
const CHIAVE_DOCK = "studio-dock";
const ascoltaDock = new Set<() => void>();
function leggiDock(): Dock {
  try { const v = localStorage.getItem(CHIAVE_DOCK); if (v === "chiuso" || v === "grande" || v === "normale") return v; } catch { /* niente memoria */ }
  // sul telefono si parte con lo studio libero: le cose da fare stanno nella pillola
  return typeof window !== "undefined" && window.innerWidth < 760 ? "chiuso" : "normale";
}
function scriviDock(v: Dock) { try { localStorage.setItem(CHIAVE_DOCK, v); } catch { /* niente memoria: vale solo adesso */ } ascoltaDock.forEach((f) => f()); }
const iscriviDock = (f: () => void) => { ascoltaDock.add(f); return () => { ascoltaDock.delete(f); }; };

const Scena = dynamic(() => import("./scena/Scena"), { ssr: false, loading: () => <div className="st-scena-attesa" role="status"><span className="st-attesa-punto" />Accendo le luci dell&apos;ufficio…</div> });

const MAX_REPARTI = 6;

function useLargo(): number {
  const [w, setW] = useState(1280);
  useEffect(() => { const f = () => setW(window.innerWidth); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return w;
}

/** Ogni 30 secondi chi è libero cambia posto in area relax: va al caffè, gioca a ping pong, si siede. */
function useGiro(): number {
  const [g, setG] = useState(0);
  useEffect(() => { const t = setInterval(() => setG((x) => x + 1), 30_000); return () => clearInterval(t); }, []);
  return g;
}

/** Orologio della pausa sigaretta: scatta ogni 5 secondi. */
function useFumo(): number {
  const [g, setG] = useState(0);
  useEffect(() => { const t = setInterval(() => setG((x) => x + 1), 5_000); return () => clearInterval(t); }, []);
  return g;
}

export function Ufficio({ attivo }: { attivo: boolean }) {
  const { dati, apri, vai, promemoria, esegui } = useStudio();
  const [zona, setZona] = useState<ZonaId | "tutto" | "vicino">("vicino");
  const [teamChiuso, setTeamChiuso] = useState<boolean | null>(null);
  const [selezione, setSelezione] = useState<Selezione>(null);
  const [elenco, setElenco] = useState(false);
  const dock = useSyncExternalStore(iscriviDock, leggiDock, () => "normale" as Dock);
  const largo = useLargo();
  // il 3D parte solo se il browser lo permette davvero; altrimenti resta tutto il resto dello Studio
  const [treD, setTreD] = useState<boolean | null>(null);
  useEffect(() => { const t = setTimeout(() => setTreD(webglDisponibile()), 0); return () => clearTimeout(t); }, []);
  const giro = useGiro();
  const fumo = useFumo();
  const stretto = largo < 760;
  // elenco del team: aperto su schermi larghi, ridotto a icone su tablet, striscia di volti su telefono
  const team = stretto ? "striscia" : (teamChiuso ?? largo < 1100) ? "chiuso" : "aperto";
  const larghezzaTeam = team === "aperto" ? 292 : team === "chiuso" ? 78 : 0;
  const mese = dati.oggi.slice(0, 7);

  const modello = useMemo(() => {
    const stati = AGENTI.map((a) => ({ a, ...statoAgente(dati.lavori, a.id) }));
    // chi ha qualcosa da dirti viene alla tua scrivania (uno per agente, i più urgenti)
    const vis = visite(promemoria, POSTI_VISITA.length);
    // ognuno ha il suo posto preferito davanti alla scrivania: chi resta non si sposta quando un altro se ne va
    const occupati = new Set<number>();
    const daVisita = new Map(vis.map((p) => {
      let k = AGENTI.findIndex((a) => a.id === p.agente) % POSTI_VISITA.length;
      while (occupati.has(k)) k = (k + 1) % POSTI_VISITA.length;
      occupati.add(k);
      return [p.agente, { p, posto: POSTI_VISITA[k] }];
    }));
    const liberi = stati.filter((x) => x.stato === "libero" && x.a.id !== "direttore" && !daVisita.has(x.a.id)).map((x) => x.a.id);
    const agenti: AgenteScena[] = stati.map(({ a, stato, lavoro }) => {
      const v = daVisita.get(a.id);
      let meta: Punto = postoScrivania(a.id), umore: AgenteScena["umore"] = stato, tazza = false, sigaretta = false;
      const f = FUMATORI.indexOf(a.id);
      if (v) { meta = v.posto; umore = "visita"; }
      // chi fuma ed è libero, ogni minuto esce in giardino: cammina, fuma una decina di secondi, rientra
      else if (stato === "libero" && f >= 0 && (fumo + f * 4) % 12 < 5) { meta = POSTI_FUMO[f]; sigaretta = true; }
      else if (stato === "libero") {
        const k = liberi.indexOf(a.id);
        if (k >= 0 && k < POSTI_RELAX.length) { meta = POSTI_RELAX[(k + giro) % POSTI_RELAX.length]; tazza = meta.attivita === "caffe"; }
      }
      return { id: a.id, stato, titolo: lavoro?.titolo ?? null, meta, umore, tazza, fumo: sigaretta, fumetto: v ? { id: v.p.id, frase: v.p.frase, bottone: v.p.bottone, tono: v.p.tono } : null };
    });
    const attivi = dati.clienti.filter((c) => c.attivo);
    const clienti: ClienteScena[] = attivi.slice(0, MAX_REPARTI).map((c) => {
      const suoi = dati.lavori.filter((l) => l.clienteId === c.id);
      return {
        id: c.id, nome: c.nome, colore: c.colore, quota: ricorrente(dati, mese, c.id),
        scaduto: somma(daIncassare(dati.fatture, c.id).filter((f) => scaduta(f, dati.oggi))),
        conti: {
          daFare: suoi.filter((l) => l.stato === "in_coda").length, inCorso: suoi.filter((l) => l.stato === "in_lavorazione").length,
          daGuardare: suoi.filter((l) => l.stato === "da_guardare").length, fatti: suoi.filter((l) => l.stato === "fatto" && l.aggiornatoIl.slice(0, 7) === mese).length,
          scaduti: suoi.filter((l) => l.stato !== "fatto" && l.stato !== "da_guardare" && l.scadenza && l.scadenza < dati.oggi).length,
        },
      };
    });
    const delMese = dati.campagne.filter((k) => k.mese === mese);
    const ads = {
      mese: nomeMese(mese, true), spesa: delMese.reduce((t, k) => t + k.spesa, 0), contatti: delMese.reduce((t, k) => t + k.contatti, 0),
      righe: attivi.map((c) => ({ nome: c.nome, colore: c.colore, contatti: delMese.filter((k) => k.clienteId === c.id).reduce((t, k) => t + k.contatti, 0) })).filter((r) => r.contatti > 0).sort((a, b) => b.contatti - a.contatti),
    };
    const conta = (s: StatoAgente) => stati.filter((x) => x.stato === s).length;
    return {
      agenti, clienti, ads, altriClienti: Math.max(0, attivi.length - MAX_REPARTI),
      conteggi: { attesa: dati.lavori.filter((l) => l.stato === "da_guardare").length, lavora: dati.lavori.filter((l) => l.stato === "in_lavorazione").length, coda: dati.lavori.filter((l) => l.stato === "in_coda").length, liberi: conta("libero") },
      cassa: { incassato: incassatoNelMese(dati.fatture, mese), obiettivo: dati.obiettivoMese, ricorrente: ricorrente(dati, mese), mese: nomeMese(mese, true) },
      visitatori: vis.map((p) => AGENTE[p.agente]?.nome ?? ""), alLavoro: conta("lavora"),
    };
  }, [dati, mese, promemoria, giro, fumo]);

  const scegli = (s: Selezione) => { setSelezione(s); if (s) setZona("vicino"); };
  const inVisita = useMemo(() => new Set(modello.agenti.filter((a) => a.fumetto).map((a) => a.id)), [modello.agenti]);
  const sceltoAgente = selezione?.tipo === "agente" ? selezione.id : null;
  const pannelloAperto = selezione !== null;
  const coperto = useMemo(() => ({ destra: pannelloAperto && !stretto ? 420 : 0, sinistra: larghezzaTeam, basso: pannelloAperto && stretto ? Math.round(typeof window === "undefined" ? 380 : window.innerHeight * 0.6) : dock === "chiuso" ? (stretto ? 50 : 20) : stretto ? 120 : 110, alto: stretto ? 70 : 60 }), [pannelloAperto, stretto, larghezzaTeam, dock]);
  const daScadere = promemoria.filter((p) => p.tono === "allarme").length;

  return (
    <div className="st-ufficio" data-pannello={pannelloAperto || undefined} data-team={team} style={{ "--team": `${larghezzaTeam}px` } as React.CSSProperties}>
      <div className="st-scena">
        {treD === false ? <Senza3D /> : treD ? (
          <Confine3D alternativa={<Senza3D />}>
        <Scena attivo={attivo} nome={site.founders[0].split(" ")[0]} agenti={modello.agenti} clienti={modello.clienti} altriClienti={modello.altriClienti} cassa={modello.cassa} ads={modello.ads} conteggi={modello.conteggi} regole={dati.regole.length} inAttesa={promemoria.length}
          zona={zona} selezione={selezione} coperto={coperto} onSeleziona={scegli}
          onFumetto={(id) => { const p = promemoria.find((x) => x.id === id); if (p) void esegui(p); }}
          onCassa={() => vai("conti")} onNuovoCliente={() => apri({ tipo: "cliente" })} onTuaScrivania={() => { setSelezione(null); setZona("tu"); setElenco(true); if (dock === "chiuso") scriviDock("normale"); }} />
      </Confine3D>
        ) : null}
      </div>

      {team === "striscia" ? (
        <div className="st-saluto">
          <h1>{saluto(dati.ora)}, {site.founders[0].split(" ")[0]}</h1>
          <Riassunto visitatori={modello.visitatori} urgenti={daScadere} alLavoro={modello.alLavoro} />
          <StrisciaTeam scelto={sceltoAgente} onScegli={(id) => scegli({ tipo: "agente", id })} />
        </div>
      ) : (
        <ElencoTeam scelto={sceltoAgente} inVisita={inVisita} onScegli={(id) => scegli({ tipo: "agente", id })} chiuso={team === "chiuso"} onChiudi={() => setTeamChiuso(team === "aperto")}
          testa={<div className="st-team-saluto"><h1>{saluto(dati.ora)}, {site.founders[0].split(" ")[0]}</h1><Riassunto visitatori={modello.visitatori} urgenti={daScadere} alLavoro={modello.alLavoro} /></div>} />
      )}

      {treD ? <Joystick /> : null}
      <div className="st-zone" role="group" aria-label="Inquadra una zona">
        <button type="button" aria-pressed={zona === "vicino" && !selezione} onClick={() => { setZona("vicino"); setSelezione(null); }}>Studio</button>
        <button type="button" aria-pressed={zona === "tutto" && !selezione} onClick={() => { setZona("tutto"); setSelezione(null); }}>Tutto</button>
        {ZONE.map((z) => <button key={z.id} type="button" aria-pressed={zona === z.id && !selezione} onClick={() => { setSelezione(null); setZona(z.id); }}>{z.nome}</button>)}
        {modello.clienti.map((c) => <button key={`c${c.id}`} type="button" className="st-zona-cliente" aria-pressed={selezione?.tipo === "cliente" && selezione.id === c.id} onClick={() => scegli({ tipo: "cliente", id: c.id })}><i style={{ background: c.colore }} />{c.nome}</button>)}
      </div>

      {dock === "chiuso" ? (
        <button type="button" className="st-dock-pillola" onClick={() => scriviDock("normale")} aria-label="Apri Da fare per te">
          <b>Da fare</b>{promemoria.length ? <em>{promemoria.length}</em> : <small>niente</small>}
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      ) : null}
      <section className="st-dock" aria-label="Promemoria" data-aperto={elenco || undefined} data-dock={dock} hidden={dock === "chiuso"}>
        <div className="st-dock-titolo"><b>Da fare per te</b><small>{promemoria.length === 0 ? "niente in sospeso" : `${promemoria.length} ${promemoria.length === 1 ? "cosa" : "cose"}`}</small>
          <span className="st-dock-tasti">
            <button type="button" onClick={() => scriviDock(dock === "grande" ? "normale" : "grande")} aria-label={dock === "grande" ? "Rimpicciolisci" : "Ingrandisci"} title={dock === "grande" ? "Rimpicciolisci" : "Ingrandisci"}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">{dock === "grande" ? <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}</svg>
            </button>
            <button type="button" onClick={() => { scriviDock("chiuso"); setElenco(false); }} aria-label="Chiudi e guarda lo studio" title="Chiudi">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </span>
        </div>
        <ul className="st-dock-scorri">
          {promemoria.slice(0, 12).map((p) => <RigaPromemoria key={p.id} p={p} compatta />)}
          {promemoria.length === 0 ? (
            <li className="st-promemoria st-dock-vuoto"><div><b>Nessuno ti sta aspettando.</b><p>Dai un lavoro al team, oppure apri il reparto di un cliente e prepara il mese.</p><span><button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => apri({ tipo: "lavoro" })}>+ Nuovo lavoro</button>{dati.clienti.length === 0 ? <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "cliente" })}>+ Primo cliente</button> : null}</span></div></li>
          ) : null}
        </ul>
      </section>

      {selezione?.tipo === "agente" ? <ChatAgente key={selezione.id} id={selezione.id} chiudi={() => setSelezione(null)} /> : null}
      {selezione?.tipo === "cervello" ? <PannelloCervello chiudi={() => setSelezione(null)} /> : null}
      {selezione?.tipo === "cliente" ? <PannelloCliente id={selezione.id} chiudi={() => setSelezione(null)} /> : null}
    </div>
  );
}

/** Al posto dell'ufficio quando il browser non può mostrare il 3D. */
function Senza3D() {
  return (
    <div className="st-niente3d" role="status">
      <p><b>La grafica 3D non è disponibile in questo browser adesso.</b></p>
      <p>Team, chat, promemoria, Conti e Lavori funzionano lo stesso. Di solito il 3D torna chiudendo del tutto il browser (Cmd+Q) o riavviando il computer.</p>
      <button type="button" className="st-btn st-btn-pieno" onClick={() => window.location.reload()}>Riprova</button>
    </div>
  );
}

/** Una riga sotto il saluto: chi è venuto da te, cosa è urgente, chi lavora. */
function Riassunto({ visitatori, urgenti, alLavoro }: { visitatori: string[]; urgenti: number; alLavoro: number }) {
  return (
    <p>
      {visitatori.length ? <><b className="st-t-attesa">{visitatori.length === 1 ? visitatori[0] : `${visitatori.slice(0, -1).join(", ")} e ${visitatori.at(-1)}`}</b> {visitatori.length === 1 ? "è venuto" : "sono venuti"} alla tua scrivania. </> : null}
      {urgenti ? <><b className="st-t-allarme">{urgenti === 1 ? "1 cosa urgente" : `${urgenti} cose urgenti`}</b>. </> : null}
      {alLavoro ? <><b className="st-t-lavora">{alLavoro === 1 ? "1 sta lavorando" : `${alLavoro} stanno lavorando`}</b>. </> : null}
      {!visitatori.length && !alLavoro ? "Tutto tranquillo." : null}
    </p>
  );
}

/* ---------- Pannello del cervello condiviso ---------- */

function PannelloCervello({ chiudi }: { chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const [testo, setTesto] = useState("");
  const [per, setPer] = useState("");
  return (
    <aside className="st-pannello" aria-label="Cervello condiviso">
      <header className="st-pannello-testa">
        <span className="st-avatar st-avatar-grande st-avatar-cervello" aria-hidden="true" />
        <div><h2>Cervello condiviso</h2><p>{REGOLE_FISSE.length + dati.regole.length} regole · le leggono prima di ogni lavoro</p></div>
        <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button>
      </header>
      <div className="st-pannello-corpo">
        <form className="st-blocco" onSubmit={async (e) => { e.preventDefault(); if (!testo.trim()) return; const r = await azione("regola.salva", { testo, agente: per || null }); if (r.ok) { setTesto(""); avvisa("Regola salvata: la leggeranno dal prossimo lavoro."); } }}>
          <h3>Nuova regola</h3>
          <textarea value={testo} onChange={(e) => setTesto(e.target.value)} rows={2} maxLength={600} placeholder="Es. Mai promettere risultati in numeri negli annunci." aria-label="Testo della regola" />
          <div className="st-scrivi-riga">
            <select value={per} onChange={(e) => setPer(e.target.value)} aria-label="Per chi vale"><option value="">Vale per tutti</option>{AGENTI.map((a) => <option key={a.id} value={a.id}>Solo {a.nome}</option>)}</select>
            <button className="st-btn st-btn-pieno" disabled={!testo.trim()}>Salva</button>
          </div>
          <small className="st-nota">Quando chiedi una modifica a un lavoro puoi salvarla qui con una spunta: la correzione vale anche le volte dopo.</small>
        </form>
        <section className="st-blocco">
          <h3>Le tue regole</h3>
          {dati.regole.length === 0 ? <p className="st-vuoto-riga">Aggiungi le tue: tono, parole da evitare, come chiudere un contenuto.</p> : (
            <ul className="st-regole">{dati.regole.map((r) => <li key={r.id}><p>{r.testo}</p><small>{r.agente ? `solo ${AGENTE[r.agente]?.nome ?? r.agente}` : "tutti"}</small><button type="button" className="st-x" aria-label="Elimina regola" onClick={() => azione("regola.elimina", { id: r.id })}>×</button></li>)}</ul>
          )}
        </section>
        <section className="st-blocco">
          <h3>Regole fisse · valgono sempre per tutti</h3>
          <ul className="st-regole st-regole-fisse">{REGOLE_FISSE.map((r) => <li key={r.titolo}><p><b>{r.titolo}.</b> {r.testo}</p></li>)}</ul>
          <small className="st-nota">Sono scritte nello Studio e non si cancellano, neanche svuotando i dati di esempio.</small>
        </section>
      </div>
    </aside>
  );
}

/* ---------- Reparto di un cliente ---------- */

/** I mestieri del reparto: chi fa cosa per il cliente, nell'ordine in cui servono. */
const MESTIERI: { nome: string; agenti: string[]; nuovo: string; brief: (c: string) => string }[] = [
  { nome: "Piano e strategia", agenti: ["sofia", "marco", "direttore"], nuovo: "sofia", brief: (c) => `Piano editoriale del mese per ${c}.` },
  { nome: "Post e caroselli", agenti: ["luca"], nuovo: "luca", brief: (c) => `Carosello per ${c}: ` },
  { nome: "Reel", agenti: ["giulia"], nuovo: "giulia", brief: (c) => `Reel per ${c}: ` },
  { nome: "Video e montaggio", agenti: ["matteo"], nuovo: "matteo", brief: (c) => `Montaggio video per ${c}: ` },
  { nome: "Caption e storie", agenti: ["chiara", "revisore"], nuovo: "chiara", brief: (c) => `Caption per ${c}: ` },
  { nome: "Campagne", agenti: ["davide"], nuovo: "davide", brief: (c) => `Campagna per ${c}: ` },
  { nome: "Sito e landing", agenti: ["elena"], nuovo: "elena", brief: (c) => `Pagina per ${c}: ` },
  { nome: "Pubblicazione e DM", agenti: ["alice", "simone"], nuovo: "alice", brief: (c) => `Calendario uscite per ${c}.` },
  { nome: "Solleciti", agenti: ["sara"], nuovo: "sara", brief: (c) => `Sollecito di pagamento per ${c}.` },
];

const STATO_BREVE: Record<Lavoro["stato"], string> = { in_coda: "in coda", in_lavorazione: "al lavoro", da_guardare: "da guardare", fatto: "fatto" };

function RigaLavoro({ l }: { l: Lavoro }) {
  const { dati, apri } = useStudio();
  const g = l.scadenza ? giorniTra(dati.oggi, l.scadenza) : null;
  const ritardo = g !== null && g < 0 && l.stato !== "fatto" && l.stato !== "da_guardare";
  return (
    <li>
      <button type="button" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>
        <i data-stato={ritardo ? "scaduta" : l.stato} />
        <span>{l.titolo}</span>
        <small data-ritardo={ritardo || undefined}>{AGENTE[l.agente]?.nome} · {l.scadenza && l.stato !== "fatto" ? (ritardo ? `in ritardo dal ${dataBreve(l.scadenza)}` : g === 0 ? "oggi" : `entro il ${dataBreve(l.scadenza)}`) : STATO_BREVE[l.stato]}</small>
      </button>
    </li>
  );
}

function PannelloCliente({ id, chiudi }: { id: number; chiudi: () => void }) {
  const { dati, apri, vai, incassa, azione, avvisa } = useStudio();
  const [fatti, setFatti] = useState(false);
  const [preparo, setPreparo] = useState(false);
  const c = dati.clienti.find((x) => x.id === id);
  if (!c) return null;
  const mese = dati.oggi.slice(0, 7);
  const aperte = daIncassare(dati.fatture, id);
  const righe = dati.campagne.filter((k) => k.clienteId === id);
  const ultimoMese = righe.map((r) => r.mese).sort().at(-1);
  const riep = riepilogoCampagne(righe.filter((k) => k.mese === ultimoMese));
  const servizi = dati.servizi.filter((s) => s.clienteId === id && servizioAttivoNelMese(s, mese));
  const lavori = dati.lavori.filter((l) => l.clienteId === id);
  const aperti = lavori.filter((l) => l.stato !== "fatto");
  const chiusi = lavori.filter((l) => l.stato === "fatto");
  const prepara = async () => { setPreparo(true); const r = await azione("mese.prepara", { clienteId: id }); setPreparo(false); if (r.ok) avvisa(r.nuovoId ? `Mese di ${c.nome} preparato: ${r.nuovoId} lavori affidati al team.` : "Il mese era già preparato: nessun lavoro nuovo."); };

  return (
    <aside className="st-pannello st-pannello-cliente" aria-label={`Reparto ${c.nome}`}>
      <header className="st-pannello-testa">
        <span className="st-sigla st-sigla-grande" style={{ background: c.colore }}>{iniziali(c.nome)}</span>
        <div><h2>{c.nome}</h2><p>{c.settore || "Cliente"} · reparto</p></div>
        <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button>
      </header>
      <div className="st-pannello-corpo">
        <section className="st-blocco">
          <h3>Quanto ti paga</h3>
          <p className="st-cifra">{euro(ricorrente(dati, mese, id))}<i>/mese</i></p>
          {servizi.length ? (
            <ul className="st-servizi-pannello">
              {servizi.map((s) => <li key={s.id}><button type="button" onClick={() => apri({ tipo: "servizio", servizio: s })}>{s.nome}</button><ImportoModificabile valore={s.importo} suffisso={s.ricorrenza === "mensile" ? "/mese" : undefined} etichetta={`Prezzo di ${s.nome}`} salva={async (v) => { const r = await azione("servizio.prezzo", { id: s.id, importo: v }); if (r.ok) avvisa(`${s.nome}: prezzo aggiornato.`); return r.ok; }} /></li>)}
            </ul>
          ) : <p className="st-vuoto-riga">Nessun servizio attivo: aggiungi cosa fai per {c.nome} e quanto ti paga.</p>}
          <small className="st-nota">Tocca un importo per cambiarlo.</small>
          <div className="st-blocco-azioni"><button type="button" className="st-btn" onClick={() => apri({ tipo: "servizio", clienteId: id })}>+ Servizio</button><button type="button" className="st-btn st-btn-testo" onClick={() => apri({ tipo: "cliente", cliente: c })}>Modifica cliente</button></div>
        </section>

        <section className="st-blocco" data-tono={aperti.some((l) => l.scadenza && l.scadenza < dati.oggi && l.stato !== "da_guardare") ? "allarme" : undefined}>
          <h3>Da fare · {aperti.length}</h3>
          {aperti.length === 0 ? <p className="st-vuoto-riga">Niente in corso. Prepara il mese: il team prende post, reel, video e campagna dai servizi del cliente.</p> : null}
          <button type="button" className="st-btn st-btn-pieno" disabled={preparo} onClick={prepara}>{preparo ? "Preparo…" : `Prepara ${nomeMese(mese, true)}`}</button>
          <div className="st-mestieri">
            {MESTIERI.map((m) => {
              const suoi = aperti.filter((l) => m.agenti.includes(l.agente));
              if (!suoi.length && !["Post e caroselli", "Reel", "Video e montaggio", "Campagne"].includes(m.nome)) return null;
              return (
                <div key={m.nome} className="st-mestiere">
                  <header><Avatar agente={m.nuovo} /><b>{m.nome}</b><small>{m.agenti.map((a) => AGENTE[a]?.nome).join(", ")}</small>
                    <button type="button" className="st-btn st-btn-mini" aria-label={`Nuovo lavoro: ${m.nome}`} onClick={() => apri({ tipo: "lavoro", agente: m.nuovo, clienteId: id })}>+</button></header>
                  {suoi.length ? <ul className="st-ultimi">{suoi.map((l) => <RigaLavoro key={l.id} l={l} />)}</ul> : <p className="st-vuoto-riga">Niente in corso.</p>}
                </div>
              );
            })}
          </div>
          {chiusi.length ? <button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={() => setFatti((v) => !v)}>{fatti ? "Nascondi i fatti" : `Vedi i fatti (${chiusi.length})`}</button> : null}
          {fatti ? <ul className="st-ultimi">{chiusi.slice(0, 15).map((l) => <RigaLavoro key={l.id} l={l} />)}</ul> : null}
        </section>

        {aperte.length ? (
          <section className="st-blocco" data-tono={aperte.some((f) => scaduta(f, dati.oggi)) ? "allarme" : undefined}>
            <h3>Da incassare · {euro(somma(aperte))}</h3>
            <ul className="st-ultimi">{aperte.map((f) => <li key={f.id}><div><i data-stato={scaduta(f, dati.oggi) ? "scaduta" : "in_coda"} /><span>{f.descrizione}</span><small>{euro(f.importo)}</small><button type="button" className="st-btn st-btn-soldi st-btn-mini" onClick={() => incassa(f)}>Incassata</button></div></li>)}</ul>
          </section>
        ) : null}

        <section className="st-blocco">
          <h3>Campagna{ultimoMese ? ` · ${nomeMese(ultimoMese, true)}` : ""}</h3>
          {ultimoMese ? (
            <dl className="st-numeri"><div><dt>Spesa</dt><dd>{euro(riep.spesa)}</dd></div><div><dt>Contatti</dt><dd>{riep.contatti}</dd></div><div><dt>Costo per contatto</dt><dd>{riep.costoContatto === null ? "—" : euro(riep.costoContatto, true)}</dd></div><div><dt>Ritorno</dt><dd>{riep.ritorno === null ? "—" : `${riep.ritorno.toFixed(1).replace(".", ",")}×`}</dd></div></dl>
          ) : <p className="st-vuoto-riga">Nessun numero ancora.</p>}
          <div className="st-blocco-azioni"><button type="button" className="st-btn" onClick={() => apri({ tipo: "campagna", clienteId: id })}>+ Numeri del mese</button><button type="button" className="st-btn st-btn-testo" onClick={() => vai("conti")}>Apri nei conti</button></div>
        </section>
      </div>
    </aside>
  );
}
