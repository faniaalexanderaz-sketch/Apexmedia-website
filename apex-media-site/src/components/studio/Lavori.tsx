"use client";

import { AGENTE } from "@/lib/studio/agenti";
import { nomeCliente, tempoFa } from "@/lib/studio/calcoli";
import type { Lavoro, StatoLavoro } from "@/lib/studio/tipi";
import { useStudio } from "./StudioApp";

/* Lavori: tutto quello che è stato chiesto agli agenti, per stato. */

const COLONNE: { stato: StatoLavoro; nome: string; vuoto: string }[] = [
  { stato: "da_guardare", nome: "Da guardare", vuoto: "Niente che aspetta te." },
  { stato: "in_lavorazione", nome: "Ci stanno lavorando", vuoto: "Nessun agente al lavoro." },
  { stato: "in_coda", nome: "In coda", vuoto: "Coda vuota." },
  { stato: "fatto", nome: "Fatti", vuoto: "Ancora niente di approvato." },
];

export function Avatar({ agente, grande }: { agente: string; grande?: boolean }) {
  const a = AGENTE[agente];
  return <span className={`st-avatar${grande ? " st-avatar-grande" : ""}`} style={{ background: a?.felpa ?? "#9aa0ad" }} aria-hidden="true"><i style={{ background: a?.pelle }} /><b style={{ background: a?.coloreCapelli }} /></span>;
}

function Carta({ l }: { l: Lavoro }) {
  const { dati, apri, faiLavorare } = useStudio();
  const a = AGENTE[l.agente];
  return (
    <li className="st-lavoro" data-stato={l.stato}>
      <button type="button" className="st-lavoro-corpo" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>
        <span className="st-lavoro-chi"><Avatar agente={l.agente} />{a?.nome ?? l.agente}{l.clienteId ? <em>{nomeCliente(dati.clienti, l.clienteId)}</em> : null}</span>
        <b>{l.titolo}</b>
        <small>{l.stato === "in_lavorazione" ? "sta scrivendo…" : tempoFa(l.aggiornatoIl)}</small>
      </button>
      {l.stato === "in_coda" && dati.ai ? <button type="button" className="st-btn st-btn-mini" onClick={() => void faiLavorare(l.id)}>Fai partire</button> : null}
    </li>
  );
}

export function Lavori() {
  const { dati, apri, azione, avvisa } = useStudio();
  const fatti = dati.lavori.filter((l) => l.stato === "fatto").length;
  return (
    <div className="st-pagina">
      <header className="st-pagina-testa">
        <div><h1>Lavori</h1><p>{dati.ai ? "Gli agenti sono collegati a Claude: ogni lavoro parte da solo e torna da guardare." : "Gli agenti non sono ancora collegati a Claude: i lavori restano in coda finché non li fai tu o colleghi la chiave."}</p></div>
        <div className="st-pagina-azioni">
          {fatti > 0 ? <button type="button" className="st-btn st-btn-testo" onClick={async () => { if (window.confirm(`Eliminare i ${fatti} lavori già fatti?`)) { const r = await azione("lavori.svuota"); if (r.ok) avvisa("Archivio svuotato."); } }}>Svuota i fatti</button> : null}
          <button type="button" className="st-btn st-btn-pieno" onClick={() => apri({ tipo: "lavoro" })}>+ Nuovo lavoro</button>
        </div>
      </header>
      {!dati.ai ? <p className="st-carta st-collega"><b>Per farli lavorare da soli</b> aggiungi la variabile <code>ANTHROPIC_API_KEY</code> nel progetto Vercel e rifai il deploy. Senza chiave lo studio funziona lo stesso come bacheca: apri un lavoro, copia il brief con le istruzioni dell&apos;agente e incolla il risultato.</p> : null}
      <div className="st-colonne">
        {COLONNE.map((c) => {
          const righe = dati.lavori.filter((l) => l.stato === c.stato);
          return (
            <section key={c.stato} className="st-colonna" data-stato={c.stato} aria-label={c.nome}>
              <h2>{c.nome}<span>{righe.length}</span></h2>
              {righe.length === 0 ? <p className="st-vuoto-riga">{c.vuoto}</p> : <ul>{righe.slice(0, 40).map((l) => <Carta key={l.id} l={l} />)}</ul>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
