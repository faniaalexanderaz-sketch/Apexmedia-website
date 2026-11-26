"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AGENTE, AGENTI, ZONE, scegliAgente } from "@/lib/studio/agenti";
import { regoleFisseTesto } from "@/lib/studio/regole";
import { aggiungiGiorni, dataBreve, euro, nomeCliente, tempoFa } from "@/lib/studio/calcoli";
import { CANALI, COLORI_CLIENTE, SERVIZI_SUGGERITI } from "@/lib/studio/tipi";
import { portfolio } from "@/data/portfolio";
import { useStudio, type Modale } from "./StudioApp";
import { apriInClaude } from "./Team";

/* Tutte le finestre dello Studio: cliente, servizio, fattura, campagna, lavoro, risultato, obiettivo. */

export function Finestra({ titolo, sotto, chiudi, children, larga }: { titolo: string; sotto?: string; chiudi: () => void; children: React.ReactNode; larga?: boolean }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const chiudiRef = useRef(chiudi);
  useEffect(() => { chiudiRef.current = chiudi; });
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => { if (e.key === "Escape") chiudiRef.current(); };
    document.addEventListener("keydown", tasto);
    const prima = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>("[data-primo], input:not([type=hidden]), textarea, select")?.focus();
    return () => { document.removeEventListener("keydown", tasto); prima?.focus?.(); };
  }, []);
  return (
    <div className="st-velo" onMouseDown={(e) => { if (e.target === e.currentTarget) chiudi(); }}>
      <div ref={box} className={`st-finestra${larga ? " st-finestra-larga" : ""}`} role="dialog" aria-modal="true" aria-labelledby={id}>
        <header className="st-finestra-testa">
          <div><h2 id={id}>{titolo}</h2>{sotto ? <p>{sotto}</p> : null}</div>
          <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button>
        </header>
        {children}
      </div>
    </div>
  );
}

function useInvio() {
  const [occupato, setOccupato] = useState(false);
  const invia = async (fn: () => Promise<boolean | void>) => { if (occupato) return; setOccupato(true); try { await fn(); } finally { setOccupato(false); } };
  return { occupato, invia };
}

function SceltaCliente({ valore, cambia, facoltativo }: { valore: number | ""; cambia: (v: number | "") => void; facoltativo?: boolean }) {
  const { dati } = useStudio();
  return (
    <label className="st-campo">Cliente{facoltativo ? <small> facoltativo</small> : null}
      <select value={valore} onChange={(e) => cambia(e.target.value ? Number(e.target.value) : "")} required={!facoltativo}>
        <option value="">{facoltativo ? "Nessun cliente (lavoro interno)" : "Scegli…"}</option>
        {dati.clienti.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.attivo ? "" : " (in pausa)"}</option>)}
      </select>
    </label>
  );
}

function Piede({ occupato, salva, chiudi, elimina }: { occupato: boolean; salva: string; chiudi: () => void; elimina?: () => void }) {
  return (
    <footer className="st-finestra-piede">
      {elimina ? <button type="button" className="st-btn st-btn-pericolo" onClick={elimina} disabled={occupato}>Elimina</button> : <span />}
      <div>
        <button type="button" className="st-btn st-btn-testo" onClick={chiudi}>Annulla</button>
        <button className="st-btn st-btn-pieno" disabled={occupato}>{occupato ? "Salvo…" : salva}</button>
      </div>
    </footer>
  );
}

/* ---------- Cliente ---------- */

function ModuloCliente({ m, chiudi }: { m: Extract<Modale, { tipo: "cliente" }>; chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const c = m.cliente;
  const { occupato, invia } = useInvio();
  const [nome, setNome] = useState(c?.nome ?? "");
  const [settore, setSettore] = useState(c?.settore ?? "");
  const [colore, setColore] = useState(c?.colore ?? COLORI_CLIENTE[dati.clienti.length % COLORI_CLIENTE.length]);
  const [sito, setSito] = useState(c?.sito ?? "");
  const [note, setNote] = useState(c?.note ?? "");
  const [attivo, setAttivo] = useState(c?.attivo ?? true);
  const [servizio, setServizio] = useState("Gestione social");
  const [quota, setQuota] = useState("");
  // clienti del portfolio non ancora inseriti: un tocco e il nome è compilato
  const suggeriti = c ? [] : portfolio.filter((p) => !dati.clienti.some((x) => x.nome.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])));

  return (
    <Finestra titolo={c ? "Modifica cliente" : "Nuovo cliente"} sotto={c ? undefined : "Compare subito nella sala clienti dell'ufficio e nei conti."} chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => {
        const r = await azione("cliente.salva", { id: c?.id, nome, settore, colore, sito, note, attivo });
        if (!r.ok) return;
        if (!c && quota.trim() && r.nuovoId) await azione("servizio.salva", { clienteId: r.nuovoId, nome: servizio, importo: quota, ricorrenza: "mensile", dal: dati.oggi });
        avvisa(c ? "Cliente aggiornato." : `${nome} è entrato in sala clienti.`);
        chiudi();
      }); }}>
        {suggeriti.length ? (
          <div className="st-chips" aria-label="Clienti dal portfolio">
            {suggeriti.map((p) => <button key={p.slug} type="button" className="st-chip" onClick={() => { setNome(p.name.replace("’", "'")); setSettore(p.sector); setSito(p.domain.endsWith("vercel.app") ? "" : p.domain); }}>{p.name}</button>)}
          </div>
        ) : null}
        <label className="st-campo">Nome<input data-primo value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={80} placeholder="Es. Bagnarino Coworking" /></label>
        <label className="st-campo">Settore<small> facoltativo</small><input value={settore} onChange={(e) => setSettore(e.target.value)} maxLength={120} placeholder="Es. Coworking, Alessandria" /></label>
        <fieldset className="st-campo st-colori"><legend>Colore in ufficio</legend>
          {COLORI_CLIENTE.map((k) => <button key={k} type="button" aria-label={`Colore ${k}`} aria-pressed={colore === k} style={{ background: k }} onClick={() => setColore(k)} />)}
        </fieldset>
        {!c ? (
          <div className="st-riga">
            <label className="st-campo">Primo servizio<input list="st-servizi" value={servizio} onChange={(e) => setServizio(e.target.value)} maxLength={80} /></label>
            <label className="st-campo">Quanto paga al mese<small> facoltativo</small><span className="st-euro"><input inputMode="decimal" value={quota} onChange={(e) => setQuota(e.target.value)} placeholder="350" /></span></label>
          </div>
        ) : null}
        <datalist id="st-servizi">{SERVIZI_SUGGERITI.map((s) => <option key={s} value={s} />)}</datalist>
        <label className="st-campo">Dominio del sito<small> facoltativo: se il sito manda i click al pannello, i numeri della campagna arrivano da soli</small><input value={sito} onChange={(e) => setSito(e.target.value)} maxLength={100} placeholder="essenzadoriente.it" inputMode="url" autoCapitalize="none" /></label>
        <label className="st-campo">Note per gli agenti<small> tono, obiettivo, cose da non dire</small><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} /></label>
        {c ? <label className="st-spunta"><input type="checkbox" checked={attivo} onChange={(e) => setAttivo(e.target.checked)} /> Cliente attivo<small> se lo togli resta in archivio e non conta nelle entrate ricorrenti</small></label> : null}
        <Piede occupato={occupato} salva={c ? "Salva" : "Aggiungi cliente"} chiudi={chiudi} elimina={c ? () => { if (window.confirm(`Eliminare ${c.nome} con tutti i suoi servizi, fatture e campagne? Non si può annullare.`)) void invia(async () => { const r = await azione("cliente.elimina", { id: c.id }); if (r.ok) { avvisa("Cliente eliminato."); chiudi(); } }); } : undefined} />
      </form>
    </Finestra>
  );
}

/* ---------- Servizio ---------- */

function ModuloServizio({ m, chiudi }: { m: Extract<Modale, { tipo: "servizio" }>; chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const s = m.servizio;
  const { occupato, invia } = useInvio();
  const [clienteId, setClienteId] = useState<number | "">(s?.clienteId ?? m.clienteId ?? "");
  const [nome, setNome] = useState(s?.nome ?? "");
  const [importo, setImporto] = useState(s ? String(s.importo) : "");
  const [ricorrenza, setRicorrenza] = useState(s?.ricorrenza ?? "mensile");
  const [dal, setDal] = useState(s?.dal ?? dati.oggi);
  const [al, setAl] = useState(s?.al ?? "");
  return (
    <Finestra titolo={s ? "Modifica servizio" : "Nuovo servizio"} sotto={s ? undefined : "Un servizio mensile entra subito nelle entrate ricorrenti."} chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => {
        const r = await azione("servizio.salva", { id: s?.id, clienteId, nome, importo, ricorrenza, dal, al: al || null });
        if (r.ok) { avvisa(s ? "Servizio aggiornato." : ricorrenza === "mensile" ? `Servizio aggiunto: + ${euro(Number(importo.replace(",", ".")) || 0)} al mese.` : "Servizio aggiunto, con la sua fattura da incassare."); chiudi(); }
      }); }}>
        <SceltaCliente valore={clienteId} cambia={setClienteId} />
        <label className="st-campo">Servizio<input data-primo list="st-servizi-2" value={nome} onChange={(e) => setNome(e.target.value)} required maxLength={80} placeholder="Es. Gestione social" /></label>
        <datalist id="st-servizi-2">{SERVIZI_SUGGERITI.map((x) => <option key={x} value={x} />)}</datalist>
        <div className="st-segmento" role="radiogroup" aria-label="Quanto spesso paga">
          <button type="button" role="radio" aria-checked={ricorrenza === "mensile"} onClick={() => setRicorrenza("mensile")}>Ogni mese</button>
          <button type="button" role="radio" aria-checked={ricorrenza === "una_tantum"} onClick={() => setRicorrenza("una_tantum")}>Una volta sola</button>
        </div>
        <div className="st-riga">
          <label className="st-campo">{ricorrenza === "mensile" ? "Importo al mese" : "Importo"}<span className="st-euro"><input inputMode="decimal" value={importo} onChange={(e) => setImporto(e.target.value)} required placeholder="350" /></span></label>
          <label className="st-campo">{ricorrenza === "mensile" ? "Da quando" : "Data"}<input type="date" value={dal} onChange={(e) => setDal(e.target.value)} required /></label>
        </div>
        {s && ricorrenza === "mensile" ? <label className="st-campo">Finisce il<small> lascia vuoto se è ancora attivo</small><input type="date" value={al} onChange={(e) => setAl(e.target.value)} /></label> : null}
        <Piede occupato={occupato} salva={s ? "Salva" : "Aggiungi servizio"} chiudi={chiudi} elimina={s ? () => { if (window.confirm("Eliminare questo servizio? Le fatture già emesse restano.")) void invia(async () => { const r = await azione("servizio.elimina", { id: s.id }); if (r.ok) { avvisa("Servizio eliminato."); chiudi(); } }); } : undefined} />
      </form>
    </Finestra>
  );
}

/* ---------- Fattura ---------- */

function ModuloFattura({ m, chiudi }: { m: Extract<Modale, { tipo: "fattura" }>; chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const f = m.fattura;
  const { occupato, invia } = useInvio();
  const [clienteId, setClienteId] = useState<number | "">(f?.clienteId ?? m.clienteId ?? "");
  const [descrizione, setDescrizione] = useState(f?.descrizione ?? "");
  const [importo, setImporto] = useState(f ? String(f.importo) : "");
  const [emessaIl, setEmessaIl] = useState(f?.emessaIl ?? dati.oggi);
  const [scadenza, setScadenza] = useState(f?.scadenza ?? aggiungiGiorni(dati.oggi, 15));
  const [pagata, setPagata] = useState(Boolean(f?.pagataIl));
  const [pagataIl, setPagataIl] = useState(f?.pagataIl ?? dati.oggi);
  return (
    <Finestra titolo={f ? "Modifica fattura" : "Nuova fattura"} chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => {
        const r = await azione("fattura.salva", { id: f?.id, clienteId, descrizione, importo, emessaIl, scadenza, pagata, pagataIl });
        if (r.ok) { avvisa(pagata && !f?.pagataIl ? `+ ${euro(Number(importo.replace(",", ".")) || 0)} incassati da ${nomeCliente(r.dati.clienti, Number(clienteId))}` : f ? "Fattura aggiornata." : "Fattura aggiunta: è tra quelle da incassare.", pagata && !f?.pagataIl ? "soldi" : "ok"); chiudi(); }
      }); }}>
        <SceltaCliente valore={clienteId} cambia={setClienteId} />
        <label className="st-campo">Per cosa<input data-primo value={descrizione} onChange={(e) => setDescrizione(e.target.value)} required maxLength={160} placeholder="Es. Gestione social, novembre" /></label>
        <div className="st-riga">
          <label className="st-campo">Importo<span className="st-euro"><input inputMode="decimal" value={importo} onChange={(e) => setImporto(e.target.value)} required placeholder="350" /></span></label>
          <label className="st-campo">Emessa il<input type="date" value={emessaIl} onChange={(e) => { setEmessaIl(e.target.value); if (!f && e.target.value) setScadenza(aggiungiGiorni(e.target.value, 15)); }} required /></label>
        </div>
        <label className="st-campo">Scade il<input type="date" value={scadenza} onChange={(e) => setScadenza(e.target.value)} required /></label>
        <label className="st-spunta"><input type="checkbox" checked={pagata} onChange={(e) => setPagata(e.target.checked)} /> Già incassata</label>
        {pagata ? <label className="st-campo">Incassata il<input type="date" value={pagataIl} onChange={(e) => setPagataIl(e.target.value)} required /></label> : null}
        <Piede occupato={occupato} salva={f ? "Salva" : "Aggiungi fattura"} chiudi={chiudi} elimina={f ? () => { if (window.confirm("Eliminare questa fattura?")) void invia(async () => { const r = await azione("fattura.elimina", { id: f.id }); if (r.ok) { avvisa("Fattura eliminata."); chiudi(); } }); } : undefined} />
      </form>
    </Finestra>
  );
}

/* ---------- Campagna ---------- */

function ModuloCampagna({ m, chiudi }: { m: Extract<Modale, { tipo: "campagna" }>; chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const k = m.campagna;
  const { occupato, invia } = useInvio();
  const [clienteId, setClienteId] = useState<number | "">(k?.clienteId ?? m.clienteId ?? "");
  const [mese, setMese] = useState(k?.mese ?? dati.oggi.slice(0, 7));
  const [canale, setCanale] = useState(k?.canale ?? "Meta Ads");
  const [spesa, setSpesa] = useState(k ? String(k.spesa) : "");
  const [contatti, setContatti] = useState(k ? String(k.contatti) : "");
  const [ricavo, setRicavo] = useState(k?.ricavo != null ? String(k.ricavo) : "");
  const n = (v: string) => Number(v.replace(",", ".")) || 0;
  const cpl = n(contatti) > 0 && n(spesa) > 0 ? n(spesa) / n(contatti) : null;
  const ritorno = n(ricavo) > 0 && n(spesa) > 0 ? n(ricavo) / n(spesa) : null;
  return (
    <Finestra titolo={k ? "Numeri della campagna" : "Come sta andando la campagna"} sotto="Un mese alla volta, per canale. Se salvi due volte lo stesso mese e canale, i numeri si aggiornano." chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => {
        const r = await azione("campagna.salva", { clienteId, mese, canale, spesa: spesa || "0", contatti: n(contatti), ricavo: ricavo.trim() === "" ? null : ricavo });
        if (r.ok) { avvisa("Numeri della campagna salvati."); chiudi(); }
      }); }}>
        <SceltaCliente valore={clienteId} cambia={setClienteId} />
        <div className="st-riga">
          <label className="st-campo">Mese<input type="month" value={mese} onChange={(e) => setMese(e.target.value)} required /></label>
          <label className="st-campo">Canale<select value={canale} onChange={(e) => setCanale(e.target.value)}>{CANALI.map((x) => <option key={x}>{x}</option>)}</select></label>
        </div>
        <div className="st-riga">
          <label className="st-campo">Spesa pubblicitaria<span className="st-euro"><input data-primo inputMode="decimal" value={spesa} onChange={(e) => setSpesa(e.target.value)} placeholder="150" /></span></label>
          <label className="st-campo">Contatti arrivati<input inputMode="numeric" value={contatti} onChange={(e) => setContatti(e.target.value)} placeholder="38" /></label>
        </div>
        <label className="st-campo">Fatturato portato al cliente<small> facoltativo: serve per il ritorno sulla spesa</small><span className="st-euro"><input inputMode="decimal" value={ricavo} onChange={(e) => setRicavo(e.target.value)} placeholder="1040" /></span></label>
        <p className="st-anteprima" aria-live="polite">
          <span><small>Costo per contatto</small><b>{cpl === null ? "—" : euro(cpl, true)}</b></span>
          <span><small>Ritorno sulla spesa</small><b>{ritorno === null ? "—" : `${ritorno.toFixed(1).replace(".", ",")}×`}</b></span>
        </p>
        <Piede occupato={occupato} salva="Salva numeri" chiudi={chiudi} elimina={k && !k.auto ? () => { if (window.confirm("Eliminare questi numeri?")) void invia(async () => { const r = await azione("campagna.elimina", { id: k.id }); if (r.ok) { avvisa("Numeri eliminati."); chiudi(); } }); } : undefined} />
      </form>
    </Finestra>
  );
}

/* ---------- Nuovo lavoro ---------- */

function ModuloLavoro({ m, chiudi }: { m: Extract<Modale, { tipo: "lavoro" }>; chiudi: () => void }) {
  const { dati, nuovoLavoro } = useStudio();
  const { occupato, invia } = useInvio();
  const [brief, setBrief] = useState("");
  const [agente, setAgente] = useState(m.agente ?? "auto");
  const [clienteId, setClienteId] = useState<number | "">(m.clienteId ?? "");
  const [scadenza, setScadenza] = useState("");
  const scelto = agente === "auto" ? (brief.trim().length > 8 ? AGENTE[scegliAgente(brief)] : null) : AGENTE[agente];
  return (
    <Finestra titolo="Nuovo lavoro" sotto={dati.ai ? "Scrivi cosa serve: l'agente parte subito e te lo riporta da guardare." : "Scrivi cosa serve: il lavoro va in coda all'agente giusto."} chiudi={chiudi} larga>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => { if (await nuovoLavoro({ agente, clienteId: clienteId || null, brief, scadenza: scadenza || null })) chiudi(); }); }}>
        <label className="st-campo">Cosa serve<textarea data-primo value={brief} onChange={(e) => setBrief(e.target.value)} required rows={5} maxLength={6000} placeholder={scelto?.esempio ?? "Es. Reel per Bagnarino: perché lavorare in coworking invece che da casa."} /></label>
        <div className="st-riga">
          <SceltaCliente valore={clienteId} cambia={setClienteId} facoltativo />
          <label className="st-campo">Per quando<small> facoltativo: te lo ricorda</small><input type="date" value={scadenza} min={dati.oggi} onChange={(e) => setScadenza(e.target.value)} /></label>
        </div>
        <fieldset className="st-campo st-squadra"><legend>Chi lo fa</legend>
          <button type="button" className="st-chip" aria-pressed={agente === "auto"} onClick={() => setAgente("auto")}>Decide il Direttore</button>
          {ZONE.filter((z) => AGENTI.some((a) => a.reparto === z.id)).map((z) => (
            <div key={z.id}><small>{z.nome}</small>
              {AGENTI.filter((a) => a.reparto === z.id).map((a) => (
                <button key={a.id} type="button" className="st-chip" aria-pressed={agente === a.id} onClick={() => setAgente(a.id)}><i style={{ background: a.felpa }} />{a.nome}<em>{a.ruolo}</em></button>
              ))}
            </div>
          ))}
        </fieldset>
        <p className="st-nota" aria-live="polite">{scelto ? <>Lo prende <b>{scelto.nome}</b> ({scelto.ruolo.toLowerCase()}).</> : "Il Direttore sceglie l'agente dalle parole della richiesta."}</p>
        <footer className="st-finestra-piede"><span />
          <div><button type="button" className="st-btn st-btn-testo" onClick={chiudi}>Annulla</button><button className="st-btn st-btn-pieno" disabled={occupato}>{occupato ? "Mando…" : "Manda"}</button></div>
        </footer>
      </form>
    </Finestra>
  );
}

/* ---------- Risultato di un lavoro ---------- */

const STATI: Record<string, string> = { in_coda: "In coda", in_lavorazione: "Ci sta lavorando", da_guardare: "Da guardare", fatto: "Fatto" };

function ModuloRisultato({ m, chiudi }: { m: Extract<Modale, { tipo: "risultato" }>; chiudi: () => void }) {
  const { dati, azione, avvisa, faiLavorare } = useStudio();
  const { occupato, invia } = useInvio();
  const l = dati.lavori.find((x) => x.id === m.lavoroId);
  const [correzione, setCorrezione] = useState("");
  const [modifica, setModifica] = useState(false);
  const [ricorda, setRicorda] = useState(true);
  const [aMano, setAMano] = useState("");
  if (!l) return <Finestra titolo="Lavoro non trovato" chiudi={chiudi}><p className="st-modulo">Questo lavoro è stato eliminato.</p></Finestra>;
  const a = AGENTE[l.agente];
  const copia = async (t: string, cosa: string) => { try { await navigator.clipboard.writeText(t); avvisa(`${cosa} copiato.`); } catch { avvisa("Non riesco a copiare: seleziona il testo a mano.", "errore"); } };

  return (
    <Finestra titolo={l.titolo} sotto={`${a?.nome ?? l.agente} · ${STATI[l.stato]}${l.clienteId ? ` · ${nomeCliente(dati.clienti, l.clienteId)}` : ""} · ${tempoFa(l.aggiornatoIl)}`} chiudi={chiudi} larga>
      <div className="st-modulo">
        <details className="st-brief" open={!l.risultato}><summary>La richiesta</summary><p>{l.brief}</p>{l.revisione ? <p><b>Correzione chiesta:</b> {l.revisione}</p> : null}</details>
        {l.stato !== "fatto" ? (
          <label className="st-campo st-campo-linea">Scadenza
            <input type="date" defaultValue={l.scadenza ?? ""} onChange={(e) => { void azione("lavoro.modifica", { id: l.id, scadenza: e.target.value || null }).then((r) => { if (r.ok) avvisa(e.target.value ? `Scadenza: ${dataBreve(e.target.value)}. ${a?.nome} te la ricorderà.` : "Scadenza tolta."); }); }} />
          </label>
        ) : null}

        {l.stato === "in_lavorazione" ? <p className="st-lavora"><span className="st-attesa-punto" />{a?.nome} ci sta lavorando. Di solito consegna in meno di un minuto.</p> : null}
        {l.risultato ? <pre className="st-risultato">{l.risultato}</pre> : null}

        {l.stato === "in_coda" && !dati.ai ? (
          <div className="st-amano">
            <p className="st-nota">Senza chiave API il lavoro lo fai fare a Claude con il tuo abbonamento: tocca «Fai in Claude», copia la risposta e incollala qui sotto.</p>
            <span className="st-blocco-azioni"><button type="button" className="st-btn st-btn-pieno" onClick={() => { apriInClaude(l, dati); avvisa("Richiesta copiata e aperta in Claude."); }}>Fai in Claude</button><button type="button" className="st-btn" onClick={() => copia(`${a?.istruzioni ?? ""}\n\n${regoleFisseTesto()}\n\n${l.brief}`, "Brief")}>Copia solo il testo</button></span>
            <label className="st-campo">Risultato<textarea value={aMano} onChange={(e) => setAMano(e.target.value)} rows={5} placeholder="Incolla qui il lavoro finito" /></label>
          </div>
        ) : null}

        {modifica ? (
          <div className="st-amano">
            <label className="st-campo">Cosa va cambiato<textarea data-primo value={correzione} onChange={(e) => setCorrezione(e.target.value)} rows={3} maxLength={600} placeholder="Es. Il gancio è troppo lungo: massimo 8 parole." /></label>
            <label className="st-spunta"><input type="checkbox" checked={ricorda} onChange={(e) => setRicorda(e.target.checked)} /> Ricordalo le prossime volte<small> la correzione entra nel cervello condiviso come regola di {a?.nome}</small></label>
          </div>
        ) : null}

        <footer className="st-finestra-piede">
          <button type="button" className="st-btn st-btn-pericolo" disabled={occupato} onClick={() => { if (window.confirm("Eliminare questo lavoro?")) void invia(async () => { const r = await azione("lavoro.elimina", { id: l.id }); if (r.ok) chiudi(); }); }}>Elimina</button>
          <div>
            {l.risultato ? <button type="button" className="st-btn" onClick={() => copia(l.risultato ?? "", "Risultato")}>Copia</button> : null}
            {modifica ? (
              <button type="button" className="st-btn st-btn-pieno" disabled={occupato || !correzione.trim()} onClick={() => void invia(async () => {
                if (ricorda) await azione("regola.salva", { testo: correzione, agente: l.agente });
                const r = await azione("lavoro.stato", { id: l.id, stato: "in_coda", revisione: correzione });
                if (!r.ok) return;
                if (dati.ai) { void faiLavorare(l.id); avvisa(`${a?.nome} sta rifacendo il lavoro.`); } else avvisa("Correzione salvata: il lavoro è tornato in coda.");
                chiudi();
              })}>Rimanda a {a?.nome}</button>
            ) : (
              <>
                {l.stato === "da_guardare" ? <button type="button" className="st-btn" disabled={occupato} onClick={() => setModifica(true)}>Chiedi una modifica</button> : null}
                {l.stato === "in_coda" && dati.ai ? <button type="button" className="st-btn st-btn-pieno" onClick={() => { void faiLavorare(l.id); chiudi(); }}>Fai partire</button> : null}
                {l.stato === "in_coda" && !dati.ai ? <button type="button" className="st-btn st-btn-pieno" disabled={occupato || !aMano.trim()} onClick={() => void invia(async () => { const r = await azione("lavoro.stato", { id: l.id, stato: "da_guardare", risultato: aMano }); if (r.ok) { setAMano(""); avvisa("Risultato salvato: è da guardare."); } })}>Salva risultato</button> : null}
                {l.stato === "da_guardare" ? <button type="button" className="st-btn st-btn-pieno" disabled={occupato} onClick={() => void invia(async () => { const r = await azione("lavoro.stato", { id: l.id, stato: "fatto" }); if (r.ok) { avvisa("Approvato."); chiudi(); } })}>Approva</button> : null}
                {l.stato === "fatto" ? <button type="button" className="st-btn" disabled={occupato} onClick={() => void invia(async () => { await azione("lavoro.stato", { id: l.id, stato: "da_guardare" }); })}>Riapri</button> : null}
              </>
            )}
          </div>
        </footer>
      </div>
    </Finestra>
  );
}

/* ---------- Obiettivo del mese ---------- */

function ModuloObiettivo({ chiudi }: { chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const { occupato, invia } = useInvio();
  const [valore, setValore] = useState(dati.obiettivoMese ? String(dati.obiettivoMese) : "");
  return (
    <Finestra titolo="Obiettivo del mese" sotto="Quanto vuoi incassare ogni mese. La cassa in ufficio si riempie man mano che entrano i soldi." chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => { const r = await azione("obiettivo.salva", { valore: valore || "0" }); if (r.ok) { avvisa("Obiettivo salvato."); chiudi(); } }); }}>
        <label className="st-campo">Obiettivo di incasso mensile<span className="st-euro"><input data-primo inputMode="decimal" value={valore} onChange={(e) => setValore(e.target.value)} placeholder="2000" /></span></label>
        <Piede occupato={occupato} salva="Salva obiettivo" chiudi={chiudi} />
      </form>
    </Finestra>
  );
}

/* ---------- La TV del relax ---------- */

/** Riduce la foto a 1280×720 al massimo e la trasforma in JPEG leggero. */
function fotoPerTv(file: File): Promise<string> {
  return new Promise((ok, ko) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1280 / img.width, 720 / img.height);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      ok(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => ko(new Error("Non riesco a leggere questa immagine."));
    img.src = URL.createObjectURL(file);
  });
}

function ModuloTv({ chiudi }: { chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const { occupato, invia } = useInvio();
  const [link, setLink] = useState(dati.tv.tipo === "video" ? dati.tv.src : "");
  const salva = (tipo_tv: string, dato?: string, testo?: string) => invia(async () => { const r = await azione("tv.salva", { tipo_tv, dato }); if (r.ok) { avvisa(testo ?? "TV aggiornata."); chiudi(); } });
  return (
    <Finestra titolo="Cosa c'è sulla TV" sotto="La TV del relax, quella davanti al divano. Scegli tu cosa trasmette." chiudi={chiudi}>
      <div className="st-modulo st-tv">
        <button type="button" className="st-btn" aria-pressed={dati.tv.tipo === "gioco"} disabled={occupato} onClick={() => void salva("gioco", undefined, "Sulla TV torna il gioco.")}>Il gioco «Apex Drive»</button>
        <label className="st-campo">Una tua immagine
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={occupato} onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; void fotoPerTv(f).then((d) => salva("immagine", d, "Immagine sulla TV.")).catch((er: Error) => avvisa(er.message, "errore")); }} />
        </label>
        <form className="st-campo" onSubmit={(e) => { e.preventDefault(); void salva("video", link, "Video sulla TV."); }}>
          Un tuo video (link diretto a un file .mp4)
          <span className="st-scrivi-riga"><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/video.mp4" inputMode="url" /><button className="st-btn st-btn-pieno" disabled={occupato || !link.trim()}>Metti</button></span>
          <small className="st-nota">Serve il link al file, non a YouTube o Instagram: quelle pagine non si possono trasmettere dentro un altro sito. Se il video non parte, sulla TV resta il gioco.</small>
        </form>
      </div>
    </Finestra>
  );
}

/* ---------- Cancella i dati di esempio ---------- */

function ModuloSvuota({ chiudi }: { chiudi: () => void }) {
  const { dati, azione, avvisa } = useStudio();
  const { occupato, invia } = useInvio();
  const [conferma, setConferma] = useState("");
  return (
    <Finestra titolo="Cancella i dati di esempio" sotto="Lo studio riparte vuoto: clienti, servizi, fatture, campagne e lavori. Le regole del cervello restano." chiudi={chiudi}>
      <form className="st-modulo" onSubmit={(e) => { e.preventDefault(); void invia(async () => { const r = await azione("studio.svuota", { conferma }); if (r.ok) { avvisa("Studio vuoto: aggiungi il tuo primo cliente da Conti."); chiudi(); } }); }}>
        {dati.demo ? <p className="st-nota st-nota-avviso">Sei in modalità demo: senza database anche i dati che inserisci dopo spariscono al prossimo riavvio del server. Per tenerli collega il database su Vercel.</p> : null}
        <label className="st-campo">Scrivi SVUOTA per confermare<input data-primo value={conferma} onChange={(e) => setConferma(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" /></label>
        <Piede occupato={occupato || conferma !== "SVUOTA"} salva="Cancella tutto" chiudi={chiudi} />
      </form>
    </Finestra>
  );
}

/* ---------- Importo che si cambia con un tocco ---------- */

/** Mostra un importo; toccandolo diventa un campo: Invio o uscire dal campo salva, Esc annulla. */
export function ImportoModificabile({ valore, salva, suffisso, etichetta }: { valore: number; salva: (n: string) => Promise<boolean>; suffisso?: string; etichetta: string }) {
  const [modifica, setModifica] = useState(false);
  const [testo, setTesto] = useState("");
  const fatto = useRef(false);
  const chiudi = async (tieni: boolean) => {
    if (fatto.current) return;
    fatto.current = true;
    if (tieni && testo.trim() && Number(testo.replace(",", ".")) !== valore) await salva(testo);
    setModifica(false);
  };
  if (!modifica) {
    return <button type="button" className="st-importo" title={`Cambia ${etichetta}`} aria-label={`${etichetta}: ${euro(valore)}. Tocca per cambiarlo`} onClick={(e) => { e.stopPropagation(); fatto.current = false; setTesto(String(valore).replace(".", ",")); setModifica(true); }}>{euro(valore)}{suffisso ? <i>{suffisso}</i> : null}<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M11 2.5 13.5 5 6 12.5H3.5V10L11 2.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></button>;
  }
  return (
    <span className="st-importo-campo st-euro" onClick={(e) => e.stopPropagation()}>
      <input autoFocus inputMode="decimal" aria-label={etichetta} value={testo} onChange={(e) => setTesto(e.target.value)} onFocus={(e) => e.target.select()}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void chiudi(true); } if (e.key === "Escape") { e.preventDefault(); void chiudi(false); } }}
        onBlur={() => void chiudi(true)} />
    </span>
  );
}

export function Moduli({ modale, chiudi }: { modale: Modale; chiudi: () => void }) {
  switch (modale.tipo) {
    case "cliente": return <ModuloCliente m={modale} chiudi={chiudi} />;
    case "servizio": return <ModuloServizio m={modale} chiudi={chiudi} />;
    case "fattura": return <ModuloFattura m={modale} chiudi={chiudi} />;
    case "campagna": return <ModuloCampagna m={modale} chiudi={chiudi} />;
    case "lavoro": return <ModuloLavoro m={modale} chiudi={chiudi} />;
    case "risultato": return <ModuloRisultato m={modale} chiudi={chiudi} />;
    case "obiettivo": return <ModuloObiettivo chiudi={chiudi} />;
    case "tv": return <ModuloTv chiudi={chiudi} />;
    case "svuota": return <ModuloSvuota chiudi={chiudi} />;
  }
}
