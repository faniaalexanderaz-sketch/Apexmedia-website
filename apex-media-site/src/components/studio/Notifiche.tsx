"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTE } from "@/lib/studio/agenti";
import type { Promemoria } from "@/lib/studio/promemoria";
import { Avatar } from "./Lavori";
import { useStudio } from "./StudioApp";

/* Elenco dei promemoria sotto la campanella: chi te lo dice, cosa, e il bottone per farlo subito. */

export function RigaPromemoria({ p, compatta }: { p: Promemoria; compatta?: boolean }) {
  const { esegui, rimanda } = useStudio();
  const [occupato, setOccupato] = useState(false);
  return (
    <li className="st-promemoria" data-tono={p.tono}>
      <Avatar agente={p.agente} grande={!compatta} />
      <div>
        <small>{AGENTE[p.agente] ? (AGENTE[p.agente].nome !== AGENTE[p.agente].breve ? `${AGENTE[p.agente].breve} · ${AGENTE[p.agente].nome}` : AGENTE[p.agente].nome) : "Il team"}</small>
        <b>{p.frase}</b>
        <p>{p.dettaglio}</p>
        <span>
          <button type="button" className={`st-btn st-btn-mini ${p.tono === "soldi" || p.azione.tipo === "incassa" ? "st-btn-soldi" : "st-btn-pieno"}`} disabled={occupato} onClick={async () => { setOccupato(true); try { await esegui(p); } finally { setOccupato(false); } }}>{p.bottone}</button>
          <button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={() => rimanda(p)}>Più tardi</button>
        </span>
      </div>
    </li>
  );
}

export function Notifiche({ chiudi }: { chiudi: () => void }) {
  const { promemoria } = useStudio();
  const box = useRef<HTMLDivElement>(null);
  const chiudiRef = useRef(chiudi);
  useEffect(() => { chiudiRef.current = chiudi; });
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => { if (e.key === "Escape") chiudiRef.current(); };
    const fuori = (e: PointerEvent) => { const t = e.target as HTMLElement; if (box.current && !box.current.contains(t) && !t.closest(".st-campanella")) chiudiRef.current(); };
    document.addEventListener("keydown", tasto);
    document.addEventListener("pointerdown", fuori);
    return () => { document.removeEventListener("keydown", tasto); document.removeEventListener("pointerdown", fuori); };
  }, []);
  return (
    <div ref={box} className="st-notifiche" role="dialog" aria-label="Promemoria">
      <header><b>Promemoria</b><small>{promemoria.length === 0 ? "niente in sospeso" : promemoria.length === 1 ? "1 cosa" : `${promemoria.length} cose`}</small><button type="button" className="st-x" onClick={chiudi} aria-label="Chiudi">×</button></header>
      {promemoria.length === 0 ? <p className="st-vuoto-riga st-notifiche-vuoto">Tutto in ordine. Quando qualcuno del team ha bisogno di te, lo trovi qui e lo vedi camminare fino alla tua scrivania.</p> : (
        <ul>{promemoria.map((p) => <RigaPromemoria key={p.id} p={p} />)}</ul>
      )}
    </div>
  );
}
