"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { site } from "@/data/site";
import { AGENTE, AGENTI, POSTI_RELAX, ZONE, type ZonaId } from "@/lib/studio/agenti";
import { daIncassare, elenco, euro, giorniTra, incassatoNelMese, iniziali, nomeCliente, nomeMese, ricorrente, riepilogoCampagne, saluto, scaduta, somma, statoAgente, tempoFa, type StatoAgente } from "@/lib/studio/calcoli";
import { Avatar } from "./Lavori";
import { useStudio } from "./StudioApp";
import type { AgenteScena, ClienteScena, Selezione } from "./scena/Scena";

/* =============================================================
   Ufficio: la scena 3D con sopra il saluto, i filtri per zona, la
   barra "Tocca a te" e il pannello di chi è stato scelto.
   ============================================================= */

const Scena = dynamic(() => import("./scena/Scena"), { ssr: false, loading: () => <div className="st-scena-attesa" role="status"><span className="st-attesa-punto" />Accendo le luci dell&apos;ufficio…</div> });

const MAX_AL_TAVOLO = 6;
const STATO_TESTO: Record<StatoAgente, string> = { attesa: "ti aspetta", lavora: "sta lavorando", coda: "ha un lavoro in coda", libero: "libero" };

function useLargo(): number {
  const [w, setW] = useState(1280);
  useEffect(() => { const f = () => setW(window.innerWidth); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return w;
}

export function Ufficio({ attivo }: { attivo: boolean }) {
  const { dati, apri, vai, incassa, faiLavorare } = useStudio();
  const [zona, setZona] = useState<ZonaId | "tutto">("tutto");
  const [selezione, setSelezione] = useState<Selezione>(null);
  const largo = useLargo();
  const stretto = largo < 760;
  const mese = dati.oggi.slice(0, 7);

  const modello = useMemo(() => {
    const stati = AGENTI.map((a) => ({ a, ...statoAgente(dati.lavori, a.id) }));
    // chi è libero va in area relax finché ci sono posti; il Direttore resta sempre alla sua scrivania
    let posto = 0;
    const agenti: AgenteScena[] = stati.map(({ a, stato, lavoro }) => ({ id: a.id, stato, titolo: lavoro?.titolo ?? null, relax: stato === "libero" && a.id !== "direttore" && posto < POSTI_RELAX.length ? posto++ : null }));
    const attivi = dati.clienti.filter((c) => c.attivo);
    const clienti: ClienteScena[] = attivi.slice(0, MAX_AL_TAVOLO).map((c) => ({ id: c.id, nome: c.nome, colore: c.colore, quota: ricorrente(dati, mese, c.id), scaduto: somma(daIncassare(dati.fatture, c.id).filter((f) => scaduta(f, dati.oggi))) }));
    const conta = (s: StatoAgente) => stati.filter((x) => x.stato === s).length;
    return {
      stati, agenti, clienti, altriClienti: Math.max(0, attivi.length - MAX_AL_TAVOLO),
      conteggi: { attesa: dati.lavori.filter((l) => l.stato === "da_guardare").length, lavora: dati.lavori.filter((l) => l.stato === "in_lavorazione").length, coda: dati.lavori.filter((l) => l.stato === "in_coda").length, liberi: conta("libero") },
      cassa: { incassato: incassatoNelMese(dati.fatture, mese), obiettivo: dati.obiettivoMese, ricorrente: ricorrente(dati, mese), mese: nomeMese(mese, true) },
      inAttesa: stati.filter((x) => x.stato === "attesa").map((x) => x.a.nome),
      alLavoro: conta("lavora"), liberi: conta("libero"),
    };
  }, [dati, mese]);

  const daGuardare = dati.lavori.filter((l) => l.stato === "da_guardare").sort((a, b) => a.aggiornatoIl.localeCompare(b.aggiornatoIl));
  const scadute = dati.fatture.filter((f) => scaduta(f, dati.oggi));
  const inCoda = dati.lavori.filter((l) => l.stato === "in_coda");

  const scegli = (s: Selezione) => { setSelezione(s); if (s) setZona("tutto"); };
  const pannelloAperto = selezione !== null;
  const coperto = useMemo(() => ({ destra: pannelloAperto && !stretto ? 400 : 0, basso: pannelloAperto && stretto ? Math.round(typeof window === "undefined" ? 380 : window.innerHeight * 0.52) : stretto ? 216 : 150, alto: stretto ? 70 : 84 }), [pannelloAperto, stretto]);

  return (
    <div className="st-ufficio" data-pannello={pannelloAperto || undefined}>
      <div className="st-scena">
        <Scena attivo={attivo} agenti={modello.agenti} clienti={modello.clienti} altriClienti={modello.altriClienti} cassa={modello.cassa} conteggi={modello.conteggi} regole={dati.regole.length} zona={zona} selezione={selezione} coperto={coperto} onSeleziona={scegli} onCassa={() => vai("conti")} onNuovoCliente={() => apri({ tipo: "cliente" })} />
      </div>

      <div className="st-saluto">
        <h1>{saluto(dati.ora)}, {site.founders[0].split(" ")[0]}</h1>
        <p>
          {modello.inAttesa.length ? <><b className="st-t-attesa">{elenco(modello.inAttesa)}</b> {modello.inAttesa.length === 1 ? "ti aspetta" : "ti aspettano"}. </> : null}
          {scadute.length ? <><b className="st-t-allarme">{scadute.length === 1 ? "1 fattura scaduta" : `${scadute.length} fatture scadute`}</b>. </> : null}
          {modello.alLavoro ? <><b className="st-t-lavora">{modello.alLavoro === 1 ? "1 sta lavorando" : `${modello.alLavoro} stanno lavorando`}</b>, </> : null}
          {modello.liberi === AGENTI.length ? "Sono tutti liberi." : `${modello.liberi} ${modello.liberi === 1 ? "è libero" : "sono liberi"}.`}
        </p>
      </div>

      <div className="st-zone" role="group" aria-label="Inquadra una zona">
        <button type="button" aria-pressed={zona === "tutto" && !selezione} onClick={() => { setZona("tutto"); setSelezione(null); }}>Tutto</button>
        {ZONE.map((z) => <button key={z.id} type="button" aria-pressed={zona === z.id && !selezione} onClick={() => { setSelezione(null); setZona(z.id); }}>{z.nome}</button>)}
      </div>

      <section className="st-dock" aria-label="Tocca a te">
        <div className="st-dock-titolo"><b>Tocca a te</b><small>{daGuardare.length + scadute.length === 0 ? "niente in sospeso" : `${daGuardare.length + scadute.length} ${daGuardare.length + scadute.length === 1 ? "cosa" : "cose"}`}</small></div>
        <div className="st-dock-scorri">
          {daGuardare.map((l) => (
            <article key={`l${l.id}`} className="st-dock-carta" data-tono="attesa">
              <Avatar agente={l.agente} grande />
              <div><small>{AGENTE[l.agente]?.nome} · da guardare</small><b>{l.titolo}</b><p>{(l.risultato ?? "").replace(/\s+/g, " ").slice(0, 110)}</p>
                <span><button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => { scegli({ tipo: "agente", id: l.agente }); apri({ tipo: "risultato", lavoroId: l.id }); }}>Guarda <i aria-hidden="true">▸</i></button><button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={() => scegli({ tipo: "agente", id: l.agente })}>Vai da {AGENTE[l.agente]?.nome}</button></span>
              </div>
            </article>
          ))}
          {scadute.map((f) => (
            <article key={`f${f.id}`} className="st-dock-carta" data-tono="allarme">
              <span className="st-sigla" style={{ background: dati.clienti.find((c) => c.id === f.clienteId)?.colore }}>{iniziali(nomeCliente(dati.clienti, f.clienteId))}</span>
              <div><small>Fattura scaduta da {giorniTra(f.scadenza, dati.oggi)} giorni</small><b>{nomeCliente(dati.clienti, f.clienteId)} · {euro(f.importo)}</b><p>{f.descrizione}</p>
                <span><button type="button" className="st-btn st-btn-soldi st-btn-mini" onClick={() => incassa(f)}>Segna incassata</button><button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={() => vai("conti")}>Apri i conti</button></span>
              </div>
            </article>
          ))}
          {inCoda.slice(0, 4).map((l) => (
            <article key={`c${l.id}`} className="st-dock-carta" data-tono="coda">
              <Avatar agente={l.agente} grande />
              <div><small>In coda · {AGENTE[l.agente]?.nome}</small><b>{l.titolo}</b><p>{l.brief.replace(/\s+/g, " ").slice(0, 110)}</p>
                <span>{dati.ai ? <button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => void faiLavorare(l.id)}>Fai partire</button> : <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>Apri</button>}</span>
              </div>
            </article>
          ))}
          {daGuardare.length + scadute.length + inCoda.length === 0 ? (
            <article className="st-dock-carta st-dock-vuoto"><div><b>Nessuno ti sta aspettando.</b><p>Dai un lavoro al team: scegli un agente in ufficio o scrivi la richiesta e lascia decidere al Direttore.</p><span><button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => apri({ tipo: "lavoro" })}>+ Nuovo lavoro</button>{dati.clienti.length === 0 ? <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "cliente" })}>+ Primo cliente</button> : null}</span></div></article>
          ) : null}
        </div>
      </section>

      {selezione?.tipo === "agente" ? <PannelloAgente id={selezione.id} chiudi={() => setSelezione(null)} /> : null}
      {selezione?.tipo === "cervello" ? <PannelloCervello chiudi={() => setSelezione(null)} /> : null}
      {selezione?.tipo === "cliente" ? <PannelloCliente id={selezione.id} chiudi={() => setSelezione(null)} /> : null}
    </div>
  );
}

/* ---------- Pannello di un agente ---------- */

function PannelloAgente({ id, chiudi }: { id: string; chiudi: () => void }) {
  const { dati, apri, nuovoLavoro, azione, avvisa, faiLavorare } = useStudio();
  const a = AGENTE[id];
  const { stato, lavoro } = statoAgente(dati.lavori, id);
  const [testo, setTesto] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [mando, setMando] = useState(false);
  const ultimi = dati.lavori.filter((l) => l.agente === id).slice(0, 6);
  const regole = dati.regole.filter((r) => r.agente === null || r.agente === id);
  if (!a) return null;

  return (
    <aside className="st-pannello" aria-label={a.nome}>
      <header className="st-pannello-testa">
        <Avatar agente={id} grande />
        <div><h2>{a.nome}</h2><p>{a.ruolo} · <span data-stato={stato}>{STATO_TESTO[stato]}</span>{lavoro ? ` · ${tempoFa(lavoro.aggiornatoIl)}` : ""}</p></div>
        <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button>
      </header>
      <div className="st-pannello-corpo">
        {lavoro ? (
          <section className="st-blocco" data-tono={stato}>
            <h3>{stato === "attesa" ? `Ti aspetta da ${tempoFa(lavoro.aggiornatoIl).replace(" fa", "")}` : stato === "lavora" ? "Sta facendo adesso" : "In coda"}</h3>
            <b>{lavoro.titolo}</b>{lavoro.clienteId ? <small>{nomeCliente(dati.clienti, lavoro.clienteId)}</small> : null}
            {stato === "attesa" && lavoro.risultato ? <p className="st-estratto">{lavoro.risultato.slice(0, 260)}{lavoro.risultato.length > 260 ? "…" : ""}</p> : null}
            {stato === "lavora" ? <p className="st-lavora"><span className="st-attesa-punto" />Sta scrivendo. Di solito consegna in meno di un minuto.</p> : null}
            <div className="st-blocco-azioni">
              {stato === "attesa" ? <><button type="button" className="st-btn st-btn-pieno" onClick={() => apri({ tipo: "risultato", lavoroId: lavoro.id })}>Guarda qui <i aria-hidden="true">▸</i></button><button type="button" className="st-btn" onClick={async () => { const r = await azione("lavoro.stato", { id: lavoro.id, stato: "fatto" }); if (r.ok) avvisa("Approvato."); }}>Approva</button></> : null}
              {stato === "coda" ? <>{dati.ai ? <button type="button" className="st-btn st-btn-pieno" onClick={() => void faiLavorare(lavoro.id)}>Fai partire</button> : null}<button type="button" className="st-btn" onClick={() => apri({ tipo: "risultato", lavoroId: lavoro.id })}>Apri</button></> : null}
            </div>
          </section>
        ) : null}

        <form className="st-blocco" onSubmit={async (e) => { e.preventDefault(); if (!testo.trim() || mando) return; setMando(true); const ok = await nuovoLavoro({ agente: id, clienteId: clienteId || null, brief: testo }); setMando(false); if (ok) setTesto(""); }}>
          <h3>Scrivi a {a.nome}</h3>
          <textarea value={testo} onChange={(e) => setTesto(e.target.value)} rows={3} maxLength={6000} placeholder={a.esempio} aria-label={`Cosa serve da ${a.nome}`} />
          <div className="st-scrivi-riga">
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : "")} aria-label="Cliente">
              <option value="">Nessun cliente</option>
              {dati.clienti.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <button className="st-btn st-btn-pieno" disabled={mando || !testo.trim()}>{mando ? "Mando…" : "Manda"}</button>
          </div>
          <small className="st-nota">{dati.ai ? `${a.nome} parte subito e te lo riporta da guardare.` : "Senza chiave Claude il lavoro resta in coda: lo trovi qui e nella scheda Lavori."}</small>
        </form>

        <details className="st-blocco st-cosa-fa">
          <summary>Cosa fa {a.nome}</summary>
          <p>{a.inBreve}</p>
          <ul>{a.skill.map((s) => <li key={s.nome}><code>{s.nome}</code>{s.cosa}</li>)}</ul>
          <h4>Istruzioni con cui lavora</h4>
          <p className="st-istruzioni">{a.istruzioni}</p>
          {regole.length ? <><h4>Regole che legge dal cervello condiviso</h4><ul className="st-regole-mini">{regole.map((r) => <li key={r.id}>{r.testo}</li>)}</ul></> : null}
        </details>

        <section className="st-blocco">
          <h3>Le ultime cose</h3>
          {ultimi.length === 0 ? <p className="st-vuoto-riga">Ancora niente.</p> : (
            <ul className="st-ultimi">{ultimi.map((l) => <li key={l.id}><button type="button" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}><i data-stato={l.stato} /><span>{l.titolo}</span><small>{tempoFa(l.aggiornatoIl)}</small></button></li>)}</ul>
          )}
        </section>
      </div>
    </aside>
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
        <div><h2>Cervello condiviso</h2><p>{dati.regole.length === 0 ? "Nessuna regola ancora" : dati.regole.length === 1 ? "1 regola" : `${dati.regole.length} regole`} · le leggono prima di ogni lavoro</p></div>
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
          <h3>Regole</h3>
          {dati.regole.length === 0 ? <p className="st-vuoto-riga">Scrivi la prima: tono, parole da evitare, come chiudere un contenuto.</p> : (
            <ul className="st-regole">{dati.regole.map((r) => <li key={r.id}><p>{r.testo}</p><small>{r.agente ? `solo ${AGENTE[r.agente]?.nome ?? r.agente}` : "tutti"}</small><button type="button" className="st-x" aria-label="Elimina regola" onClick={() => azione("regola.elimina", { id: r.id })}>×</button></li>)}</ul>
          )}
        </section>
      </div>
    </aside>
  );
}

/* ---------- Pannello di un cliente ---------- */

function PannelloCliente({ id, chiudi }: { id: number; chiudi: () => void }) {
  const { dati, apri, vai, incassa } = useStudio();
  const c = dati.clienti.find((x) => x.id === id);
  if (!c) return null;
  const mese = dati.oggi.slice(0, 7);
  const aperte = daIncassare(dati.fatture, id);
  const righe = dati.campagne.filter((k) => k.clienteId === id);
  const ultimoMese = righe.map((r) => r.mese).sort().at(-1);
  const riep = riepilogoCampagne(righe.filter((k) => k.mese === ultimoMese));
  const servizi = dati.servizi.filter((s) => s.clienteId === id && s.ricorrenza === "mensile" && !s.al);
  const lavori = dati.lavori.filter((l) => l.clienteId === id && l.stato !== "fatto");
  return (
    <aside className="st-pannello" aria-label={c.nome}>
      <header className="st-pannello-testa">
        <span className="st-sigla st-sigla-grande" style={{ background: c.colore }}>{iniziali(c.nome)}</span>
        <div><h2>{c.nome}</h2><p>{c.settore || "Cliente"}</p></div>
        <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button>
      </header>
      <div className="st-pannello-corpo">
        <section className="st-blocco">
          <h3>Quanto paga</h3>
          <p className="st-cifra">{euro(ricorrente(dati, mese, id))}<i>/mese</i></p>
          {servizi.length ? <ul className="st-ultimi">{servizi.map((s) => <li key={s.id}><button type="button" onClick={() => apri({ tipo: "servizio", servizio: s })}><i data-stato="fatto" /><span>{s.nome}</span><small>{euro(s.importo)}</small></button></li>)}</ul> : <p className="st-vuoto-riga">Nessun servizio mensile.</p>}
          <div className="st-blocco-azioni"><button type="button" className="st-btn" onClick={() => apri({ tipo: "servizio", clienteId: id })}>+ Servizio</button><button type="button" className="st-btn" onClick={() => apri({ tipo: "fattura", clienteId: id })}>+ Fattura</button></div>
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
          <div className="st-blocco-azioni"><button type="button" className="st-btn" onClick={() => apri({ tipo: "campagna", clienteId: id })}>+ Numeri del mese</button></div>
        </section>
        <section className="st-blocco">
          <h3>Lavori aperti</h3>
          {lavori.length ? <ul className="st-ultimi">{lavori.map((l) => <li key={l.id}><button type="button" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}><i data-stato={l.stato} /><span>{l.titolo}</span><small>{AGENTE[l.agente]?.nome}</small></button></li>)}</ul> : <p className="st-vuoto-riga">Nessun lavoro aperto per questo cliente.</p>}
          <div className="st-blocco-azioni"><button type="button" className="st-btn st-btn-pieno" onClick={() => apri({ tipo: "lavoro", clienteId: id })}>+ Lavoro per {c.nome.split(" ")[0]}</button><button type="button" className="st-btn st-btn-testo" onClick={() => vai("conti")}>Apri nei conti</button></div>
        </section>
      </div>
    </aside>
  );
}
