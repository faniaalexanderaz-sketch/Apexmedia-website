"use client";

import { AGENTE } from "@/lib/studio/agenti";
import { dataBreve, nomeCliente, tempoFa } from "@/lib/studio/calcoli";
import type { Lavoro, StatoLavoro } from "@/lib/studio/tipi";
import { useStudio } from "./StudioApp";

/* Lavori: tutto quello che è stato chiesto agli agenti, per stato. */

const COLONNE: { stato: StatoLavoro; nome: string; vuoto: string }[] = [
  { stato: "da_guardare", nome: "Da guardare", vuoto: "Niente che aspetta te." },
  { stato: "in_lavorazione", nome: "Ci stanno lavorando", vuoto: "Nessun agente al lavoro." },
  { stato: "in_coda", nome: "In coda", vuoto: "Coda vuota." },
  { stato: "fatto", nome: "Fatti", vuoto: "Ancora niente di approvato." },
];

/* Ritratti: ognuno ha la sua faccia, donne e uomini, capelli e accessori diversi. */
type Taglio = "corti" | "rasati" | "ricci" | "ciuffo" | "lunghi" | "caschetto" | "chignon" | "coda" | "onde";
const TAGLIO: Record<string, Taglio> = {
  direttore: "rasati", revisore: "caschetto", sofia: "chignon", marco: "corti", giulia: "onde", luca: "ricci", chiara: "coda",
  matteo: "ciuffo", davide: "corti", elena: "caschetto", simone: "ricci", alice: "lunghi", sara: "chignon",
};

function Capelli({ t, c }: { t: Taglio; c: string }) {
  switch (t) {
    case "lunghi": return <path d="M14.6 21c0-8 4-12.5 9.4-12.5S33.4 13 33.4 21c-2.6-3.6-5.6-5.1-9.6-5.1-2.6 0-6.4 1.8-9.2 5.1z" fill={c} />;
    case "onde": return <path d="M14.8 22c-.6-8.6 4-13.4 9.4-13.4 5.6 0 10 4.6 9 13.2-1.6-4-3.6-5.6-6-6.4-1.4 2-4.6 3-8.4 2.6-1.6.6-3 2-4 4z" fill={c} />;
    case "caschetto": return <path d="M15 22.5c-.4-8.4 3.8-13 9-13s9.6 4.4 9 13c-.6-3.8-2-6.4-4.4-7.6-3.2 2.2-8.4 2.6-12 1.6-.8 1.6-1.4 3.6-1.6 6z" fill={c} />;
    case "chignon": return <><circle cx="24" cy="8.6" r="4.4" fill={c} /><path d="M15.4 21c0-7.4 3.8-11.6 8.6-11.6s8.6 4.2 8.6 11.6c-2.4-3.6-5.2-5-8.6-5s-6.2 1.4-8.6 5z" fill={c} /></>;
    case "coda": return <path d="M15.4 21c0-7.4 3.8-11.6 8.6-11.6s8.6 4.2 8.6 11.6c-1.4-3.8-4.4-5.6-8.6-5.6-3.2 0-6.2 1.6-8.6 5.6z" fill={c} />;
    case "ricci": return <g fill={c}>{[[16.5, 16], [19.5, 12.5], [23.5, 11], [27.5, 12], [31, 15], [32.4, 19], [15.4, 19.6]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" />)}</g>;
    case "ciuffo": return <path d="M15.4 20.6c0-7 3.8-11.2 8.8-11.2 2.6 0 5 1 6.6 2.8 2-.2 3.4 1 3.4 3-1 .2-1.6.6-1.6 1.6v3.4c-2.6-3-6.4-4.4-10-3.8-3 .4-5.4 1.8-7.2 4.2z" fill={c} />;
    case "rasati": return <path d="M15.8 19.4c.4-6.4 3.8-9.8 8.2-9.8s7.8 3.4 8.2 9.8c-2.4-2.4-5.2-3.4-8.2-3.4s-5.8 1-8.2 3.4z" fill={c} />;
    default: return <path d="M15.4 20.4c0-7 3.8-11 8.6-11s8.6 4 8.6 11c-1.8-3-4.8-4.6-8.6-4.6s-6.8 1.6-8.6 4.6z" fill={c} />;
  }
}

function CapelliDietro({ t, c }: { t: Taglio; c: string }) {
  if (t === "lunghi") return <path d="M14.4 21c0-8 4.2-12.4 9.6-12.4S33.6 13 33.6 21v14c-2.4 1.6-5 1.4-6.4-.2h-6.4c-1.4 1.6-4 1.8-6.4.2z" fill={c} />;
  if (t === "onde") return <path d="M14.2 21.6c0-8.4 4.2-13 9.8-13s9.8 4.6 9.8 13c0 4 1.4 6.4.2 9.8-1.6 3-5 3-6.4 1.6h-7.2c-1.4 1.4-4.8 1.4-6.4-1.6-1.2-3.4.2-5.8.2-9.8z" fill={c} />;
  if (t === "caschetto") return <path d="M14.6 22c0-8 4-12.4 9.4-12.4S33.4 14 33.4 22v6.6c-1.6 1.4-3.6 1.4-4.6 0h-9.6c-1 1.4-3 1.4-4.6 0z" fill={c} />;
  if (t === "coda") return <path d="M31 12c4 1 6 5 5.6 10-.4 4.6-1.6 8-.4 11-3-.6-4.4-3.6-4.2-7.4.2-3.4-.4-6.2-1-8z" fill={c} />;
  return null;
}

export function Avatar({ agente, grande }: { agente: string; grande?: boolean }) {
  const a = AGENTE[agente];
  const colore = a?.felpa ?? "#9aa0ad", pelle = a?.pelle ?? "#f0c9a4", capelli = a?.coloreCapelli ?? "#3a2a20";
  const t = TAGLIO[agente] ?? (a?.donna ? "lunghi" : "corti");
  const divisa = agente === "direttore" ? "#20232e" : "#5b2eff";
  return (
    <span className={`st-avatar${grande ? " st-avatar-grande" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="24" fill={colore} />
        <circle cx="24" cy="24" r="20.5" fill="#fff" opacity="0.82" />
        <clipPath id={`av-${agente}`}><circle cx="24" cy="24" r="20.5" /></clipPath>
        <g clipPath={`url(#av-${agente})`}><g transform="translate(24 27) scale(1.14) translate(-24 -27)">
        <CapelliDietro t={t} c={capelli} />
        {/* spalle con la divisa Apex e colletto bianco */}
        <path d="M7 48c1.2-8.6 7.4-13.4 17-13.4S39.8 39.4 41 48z" fill={divisa} />
        <path d="M19.4 35.2 24 41l4.6-5.8c-1.4-.5-3-.7-4.6-.7s-3.2.2-4.6.7z" fill="#fff" />
        <rect x="21.4" y="28" width="5.2" height="7.6" rx="2.4" fill={pelle} />
        <circle cx="15.6" cy="22.6" r="2" fill={pelle} /><circle cx="32.4" cy="22.6" r="2" fill={pelle} />
        <ellipse cx="24" cy="21.6" rx="8.4" ry="9.6" fill={pelle} />
        {a?.barba ? <path d="M15.8 22.4c.4 6.2 3.8 9.8 8.2 9.8s7.8-3.6 8.2-9.8c-1 2.6-2.4 4-4 4.4-1.2-1-2.6-1.4-4.2-1.4s-3 .4-4.2 1.4c-1.6-.4-3-1.8-4-4.4z" fill={capelli} opacity="0.9" /> : null}
        <Capelli t={t} c={capelli} />
        {/* occhi, sopracciglia, bocca */}
        <circle cx="20.6" cy="22" r="1.15" fill="#1d1b22" /><circle cx="27.4" cy="22" r="1.15" fill="#1d1b22" />
        <path d={a?.donna ? "M18.8 19.2q1.8-1 3.6-.2M25.6 19q1.8-.8 3.6.2" : "M18.6 19.2q2-.9 4 0M25.4 19.2q2-.9 4 0"} stroke={capelli} strokeWidth={a?.donna ? 0.8 : 1.2} strokeLinecap="round" fill="none" />
        {a?.donna ? <><circle cx="18.6" cy="25" r="1.6" fill="#f29b8a" opacity="0.45" /><circle cx="29.4" cy="25" r="1.6" fill="#f29b8a" opacity="0.45" /></> : null}
        <path d="M21.4 26.4q2.6 2.2 5.2 0" stroke={a?.donna ? "#c2566a" : "#8a4a3c"} strokeWidth={a?.donna ? 1.3 : 1.1} strokeLinecap="round" fill="none" />
        {a?.donna ? <><circle cx="15.6" cy="25" r="0.9" fill="#f2b632" /><circle cx="32.4" cy="25" r="0.9" fill="#f2b632" /></> : null}
        {a?.extra === "occhiali" ? <g stroke="#1d1b22" strokeWidth="0.9" fill="#ffffff22"><circle cx="20.4" cy="22" r="2.9" /><circle cx="27.6" cy="22" r="2.9" /><path d="M23.3 22h1.4" /></g> : null}
        {a?.extra === "cuffie" || a?.extra === "microfono" ? <g><path d="M14.8 22a9.2 9.2 0 0 1 18.4 0" stroke="#1d1b22" strokeWidth="1.6" fill="none" /><rect x="13" y="20" width="3.4" height="6" rx="1.6" fill="#1d1b22" /><rect x="31.6" y="20" width="3.4" height="6" rx="1.6" fill="#1d1b22" />{a.extra === "microfono" ? <path d="M15 25.6q1 4.4 5.6 4.8" stroke="#1d1b22" strokeWidth="1" fill="none" /> : null}</g> : null}
        </g></g>
      </svg>
    </span>
  );
}

function Carta({ l }: { l: Lavoro }) {
  const { dati, apri, faiLavorare } = useStudio();
  const a = AGENTE[l.agente];
  return (
    <li className="st-lavoro" data-stato={l.stato}>
      <button type="button" className="st-lavoro-corpo" onClick={() => apri({ tipo: "risultato", lavoroId: l.id })}>
        <span className="st-lavoro-chi"><Avatar agente={l.agente} />{a?.ruolo ?? l.agente}{l.clienteId ? <em>{nomeCliente(dati.clienti, l.clienteId)}</em> : null}</span>
        <b>{l.titolo}</b>
        <small data-ritardo={(l.scadenza && l.stato !== "fatto" && l.stato !== "da_guardare" && l.scadenza < dati.oggi) || undefined}>{l.stato === "in_lavorazione" ? "sta scrivendo…" : l.scadenza && l.stato !== "fatto" ? (l.scadenza < dati.oggi && l.stato !== "da_guardare" ? `in ritardo dal ${dataBreve(l.scadenza)}` : l.scadenza === dati.oggi ? "scade oggi" : `entro il ${dataBreve(l.scadenza)}`) : tempoFa(l.aggiornatoIl)}</small>
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
