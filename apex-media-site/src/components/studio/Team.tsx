"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AGENTE, AGENTI } from "@/lib/studio/agenti";
import { dataBreve, nomeCliente, saluto, statoAgente, tempoFa, type StatoAgente } from "@/lib/studio/calcoli";
import { TITOLARE, richiestaCompleta } from "@/lib/studio/regole";
import type { Dati, Lavoro } from "@/lib/studio/tipi";
import { Avatar } from "./Lavori";
import { useStudio } from "./StudioApp";

/* =============================================================
   Il team a portata di mano: l'elenco a sinistra, diviso per stanza,
   e la chat con ogni agente. In chat ogni messaggio è un lavoro:
   tu scrivi, l'agente risponde con il lavoro fatto, tu approvi o
   chiedi una modifica senza uscire dalla conversazione.
   ============================================================= */

export const STANZE: { nome: string; ids: string[] }[] = [
  { nome: "Regia", ids: ["direttore", "revisore"] },
  { nome: "Strategia & Funnel", ids: ["sofia", "marco", "elena", "davide"] },
  { nome: "Contenuti e video", ids: ["giulia", "luca", "matteo"] },
  { nome: "Tavolo social", ids: ["chiara", "simone", "alice"] },
  { nome: "Amministrazione", ids: ["sara"] },
];

const STATO: Record<StatoAgente, string> = { attesa: "ti ha consegnato un lavoro", lavora: "sta lavorando", coda: "ha un lavoro in coda", libero: "libero" };

/* ---------- Elenco del team ---------- */

export function ElencoTeam({ scelto, inVisita, onScegli, chiuso, onChiudi, testa }: { scelto: string | null; inVisita: Set<string>; onScegli: (id: string) => void; chiuso: boolean; onChiudi: () => void; testa: React.ReactNode }) {
  const { dati } = useStudio();
  const stati = useMemo(() => Object.fromEntries(AGENTI.map((a) => [a.id, statoAgente(dati.lavori, a.id)])), [dati.lavori]);
  const daGuardare = (id: string) => dati.lavori.filter((l) => l.agente === id && l.stato === "da_guardare").length;
  return (
    <aside className="st-team" data-chiuso={chiuso || undefined} aria-label="Il tuo team">
      <div className="st-team-testa">
        {chiuso ? null : testa}
        <button type="button" className="st-team-piega" onClick={onChiudi} aria-label={chiuso ? "Apri l'elenco del team" : "Riduci l'elenco del team"} aria-expanded={!chiuso}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d={chiuso ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="st-team-scorri">
        {STANZE.map((st) => (
          <section key={st.nome}>
            {chiuso ? null : <h3>{st.nome}</h3>}
            <ul>
              {st.ids.map((id) => {
                const a = AGENTE[id], s = stati[id], n = daGuardare(id), visita = inVisita.has(id);
                return (
                  <li key={id}>
                    <button type="button" aria-current={scelto === id || undefined} onClick={() => onScegli(id)} title={chiuso ? `${a.nome}, ${a.ruolo}` : undefined}>
                      <span className="st-team-avatar"><Avatar agente={id} grande /><i data-stato={s.stato} /></span>
                      {chiuso ? null : (
                        <span className="st-team-testo">
                          {a.nome !== a.breve ? <small className="st-team-nome">{a.nome}</small> : null}
                          <b>{a.ruolo}</b>
                          <small>{visita ? "è alla tua scrivania" : s.lavoro && s.stato !== "libero" ? s.lavoro.titolo : STATO[s.stato]}</small>
                        </span>
                      )}
                      {n ? <em className="st-conta" aria-label={`${n} da guardare`}>{n}</em> : visita && !chiuso ? <em className="st-team-visita" aria-hidden="true">!</em> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}

/** Su telefono: una striscia di volti in alto, si scorre col dito. */
export function StrisciaTeam({ scelto, onScegli }: { scelto: string | null; onScegli: (id: string) => void }) {
  const { dati } = useStudio();
  return (
    <nav className="st-striscia" aria-label="Il tuo team">
      {AGENTI.map((a) => {
        const s = statoAgente(dati.lavori, a.id);
        return (
          <button key={a.id} type="button" aria-current={scelto === a.id || undefined} onClick={() => onScegli(a.id)}>
            <span className="st-team-avatar"><Avatar agente={a.id} grande /><i data-stato={s.stato} /></span>
            <small>{a.breve}</small>
          </button>
        );
      })}
    </nav>
  );
}

/* ---------- Chat con un agente ---------- */

/** Senza chiave API: apre Claude (il tuo abbonamento) con la richiesta completa già scritta, e la copia negli appunti. */
export function apriInClaude(l: Lavoro, dati: Dati): string {
  const a = AGENTE[l.agente];
  const c = l.clienteId ? dati.clienti.find((x) => x.id === l.clienteId) : null;
  const testo = richiestaCompleta({
    nome: a?.nome ?? l.agente, ruolo: a?.ruolo ?? "", istruzioni: a?.istruzioni ?? "",
    regole: dati.regole.filter((r) => r.agente === null || r.agente === l.agente).map((r) => r.testo),
    cliente: c ? { nome: c.nome, settore: c.settore, note: c.note } : null,
    titolo: l.titolo, brief: l.brief, revisione: l.revisione, precedente: l.risultato,
  });
  void navigator.clipboard?.writeText(testo).catch(() => null);
  window.open(`https://claude.ai/new?q=${encodeURIComponent(testo)}`, "_blank", "noopener");
  return testo;
}

function Messaggio({ l, nome, onModifica }: { l: Lavoro; nome: string; onModifica: (l: Lavoro) => void }) {
  const { dati, apri, azione, avvisa, faiLavorare } = useStudio();
  const [tutto, setTutto] = useState(false);
  const testo = l.brief || l.titolo;
  const copia = async () => { try { await navigator.clipboard.writeText(l.risultato ?? ""); avvisa("Copiato."); } catch { avvisa("Non riesco a copiare: apri il lavoro e seleziona il testo.", "errore"); } };
  const ritardo = l.scadenza && l.scadenza < dati.oggi && (l.stato === "in_coda" || l.stato === "in_lavorazione");
  return (
    <>
      <li className="st-msg st-msg-mio">
        <div>
          <p>{testo.length > 420 && !tutto ? `${testo.slice(0, 420)}…` : testo}</p>
          <small>{l.clienteId ? `${nomeCliente(dati.clienti, l.clienteId)} · ` : ""}{l.scadenza ? `entro il ${dataBreve(l.scadenza)} · ` : ""}{tempoFa(l.creatoIl)}</small>
        </div>
      </li>
      {l.revisione ? <li className="st-msg st-msg-mio"><div><p><b>Correzione:</b> {l.revisione}</p></div></li> : null}
      <li className="st-msg st-msg-suo" data-stato={l.stato} data-ritardo={ritardo || undefined}>
        <Avatar agente={l.agente} />
        <div>
          {l.stato === "in_coda" ? (
            <>
              <p>{ritardo ? `${TITOLARE}, sono in ritardo su «${l.titolo}»: era per il ${dataBreve(l.scadenza as string)}. Recupero subito.` : `Ok ${TITOLARE}, ci penso io: «${l.titolo}».${l.scadenza ? ` Te lo consegno entro il ${dataBreve(l.scadenza)}.` : " Te lo porto qui appena è pronto."}`}</p>
              {dati.ai ? <span className="st-msg-azioni"><button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => void faiLavorare(l.id)}>Fai partire</button></span>
                : <small>Senza chiave: tocca «Fai in Claude», si apre Claude con tutto già scritto (è anche copiato). Poi torna qui e incolla la risposta.</small>}
              {!dati.ai ? <span className="st-msg-azioni"><button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={() => { apriInClaude(l, dati); avvisa("Richiesta copiata e aperta in Claude. Quando risponde, copia e incolla qui."); }}>Fai in Claude</button><button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>Incolla risposta</button></span> : null}
            </>
          ) : l.stato === "in_lavorazione" ? (
            <p className="st-msg-scrive" aria-label={`${nome} sta scrivendo`}><i /><i /><i /></p>
          ) : (
            <>
              <p className="st-msg-risultato">{(l.risultato ?? "").length > (l.stato === "fatto" ? 220 : 700) ? `${(l.risultato ?? "").slice(0, l.stato === "fatto" ? 220 : 700)}…` : l.risultato}</p>
              {l.stato === "fatto" ? <small className="st-msg-ok">Approvato · {tempoFa(l.aggiornatoIl)}</small> : null}
              <span className="st-msg-azioni">
                <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>Leggi tutto</button>
                {l.stato === "da_guardare" ? (
                  <>
                    <button type="button" className="st-btn st-btn-pieno st-btn-mini" onClick={async () => { const r = await azione("lavoro.stato", { id: l.id, stato: "fatto" }); if (r.ok) avvisa(`Approvato. ${nome} è libero.`); }}>Approva</button>
                    <button type="button" className="st-btn st-btn-mini" onClick={() => onModifica(l)}>Chiedi una modifica</button>
                  </>
                ) : null}
                <button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={copia}>Copia</button>
              </span>
            </>
          )}
        </div>
      </li>
      {testo.length > 420 ? <li className="st-msg-altro"><button type="button" className="st-link" onClick={() => setTutto((v) => !v)}>{tutto ? "Mostra meno" : "Mostra tutta la richiesta"}</button></li> : null}
    </>
  );
}

export function ChatAgente({ id, chiudi }: { id: string; chiudi: () => void }) {
  const { dati, nuovoLavoro, azione, avvisa, faiLavorare } = useStudio();
  const a = AGENTE[id];
  const { stato } = statoAgente(dati.lavori, id);
  const [testo, setTesto] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [scadenza, setScadenza] = useState("");
  const [mando, setMando] = useState(false);
  const [info, setInfo] = useState(false);
  const [correggi, setCorreggi] = useState<Lavoro | null>(null);
  const [ricorda, setRicorda] = useState(true);
  const fondo = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const lavori = useMemo(() => dati.lavori.filter((l) => l.agente === id).sort((x, y) => x.creatoIl.localeCompare(y.creatoIl)).slice(-20), [dati.lavori, id]);
  const regole = dati.regole.filter((r) => r.agente === null || r.agente === id);
  const firma = lavori.map((l) => `${l.id}:${l.stato}`).join("|");

  // scende all'ultimo messaggio quando arriva qualcosa di nuovo
  useEffect(() => { const f = fondo.current; if (f) f.scrollTop = f.scrollHeight; }, [firma, id]);
  if (!a) return null;

  const manda = async () => {
    if (!testo.trim() || mando) return;
    setMando(true);
    try {
      if (correggi) {
        if (ricorda) await azione("regola.salva", { testo, agente: id });
        const r = await azione("lavoro.stato", { id: correggi.id, stato: "in_coda", revisione: testo });
        if (r.ok) {
          setTesto(""); setCorreggi(null);
          if (dati.ai) void faiLavorare(correggi.id); else avvisa(`Correzione mandata a ${a.nome}: il lavoro è tornato in coda.`);
        }
      } else if (await nuovoLavoro({ agente: id, clienteId: clienteId || null, brief: testo, scadenza: scadenza || null })) {
        setTesto(""); setScadenza("");
      }
    } finally { setMando(false); }
  };

  return (
    <aside className="st-pannello st-chat" aria-label={`Chat con ${a.nome}`}>
      <header className="st-pannello-testa">
        <span className="st-team-avatar"><Avatar agente={id} grande /><i data-stato={stato} /></span>
        <div><h2>{a.ruolo}</h2><p>{a.nome !== a.breve ? `${a.nome} · ` : ""}<span data-stato={stato}>{STATO[stato]}</span></p></div>
        <button type="button" className="st-btn st-btn-testo st-btn-mini" aria-expanded={info} onClick={() => setInfo((v) => !v)}>Cosa fa</button>
        <button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi la chat">×</button>
      </header>

      {info ? (
        <div className="st-chat-info">
          <p>{a.inBreve}</p>
          <ul>{a.skill.map((s) => <li key={s.nome}><code>{s.nome}</code>{s.cosa}</li>)}</ul>
          <h4>Istruzioni con cui lavora</h4>
          <p className="st-istruzioni">{a.istruzioni}</p>
          {regole.length ? <><h4>Regole che legge dal cervello condiviso</h4><ul className="st-regole-mini">{regole.map((r) => <li key={r.id}>{r.testo}</li>)}</ul></> : null}
        </div>
      ) : null}

      <div className="st-chat-corpo" ref={fondo}>
        <ul className="st-msgs">
          <li className="st-msg st-msg-suo">
            <Avatar agente={id} />
            <div><p>{saluto(dati.ora)} {TITOLARE}! {a.nome !== a.breve ? `Sono ${a.nome}, ` : "Sono il "}{a.ruolo.toLowerCase()}. Cosa facciamo oggi?</p><small>{a.inBreve} Scrivimi qui: ogni messaggio diventa un lavoro e te lo riporto in questa chat.</small></div>
          </li>
          {lavori.map((l) => <Messaggio key={l.id} l={l} nome={a.nome} onModifica={(x) => { setCorreggi(x); setTesto(""); setTimeout(() => campo.current?.focus(), 0); }} />)}
        </ul>
      </div>

      <form className="st-chat-scrivi" onSubmit={(e) => { e.preventDefault(); void manda(); }}>
        {correggi ? (
          <div className="st-chat-correggi">
            <span>Correzione per <b>{correggi.titolo}</b></span>
            <button type="button" className="st-x" aria-label="Annulla la correzione" onClick={() => setCorreggi(null)}>×</button>
          </div>
        ) : null}
        <textarea ref={campo} value={testo} onChange={(e) => setTesto(e.target.value)} rows={2} maxLength={6000} placeholder={correggi ? "Cosa va cambiato? Es. il gancio è troppo lungo, massimo 8 parole." : `Scrivi a ${a.nome}… es. ${a.esempio}`} aria-label={correggi ? "Correzione" : `Messaggio per ${a.nome}`}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void manda(); } }} />
        <div className="st-chat-riga">
          {correggi ? (
            <label className="st-spunta st-chat-ricorda"><input type="checkbox" checked={ricorda} onChange={(e) => setRicorda(e.target.checked)} /> Ricordalo le prossime volte</label>
          ) : (
            <>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : "")} aria-label="Per quale cliente">
                <option value="">Nessun cliente</option>
                {dati.clienti.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input type="date" value={scadenza} min={dati.oggi} onChange={(e) => setScadenza(e.target.value)} aria-label="Per quando (facoltativo)" title="Per quando (facoltativo)" />
            </>
          )}
          <button className="st-btn st-btn-pieno" disabled={mando || !testo.trim()}>{mando ? "Mando…" : correggi ? `Rimanda a ${a.nome}` : "Manda"}</button>
        </div>
      </form>
    </aside>
  );
}
