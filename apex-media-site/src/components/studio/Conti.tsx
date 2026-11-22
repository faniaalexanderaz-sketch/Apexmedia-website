"use client";

import { useMemo, useState } from "react";
import { daIncassare, dataBreve, euro, giorniTra, incassatoNelMese, incassatoNellAnno, iniziali, meseDi, nomeCliente, nomeMese, ricorrente, riepilogoCampagne, scaduta, servizioAttivoNelMese, somma, ultimiMesi } from "@/lib/studio/calcoli";
import type { Cliente, Fattura } from "@/lib/studio/tipi";
import { ImportoModificabile } from "./Moduli";
import { useStudio } from "./StudioApp";

/* =============================================================
   Conti: quanto entra ogni mese, cosa è stato incassato, cosa manca,
   e per ogni cliente servizi, fatture e resa delle campagne.
   ============================================================= */

function Barre({ serie, obiettivo }: { serie: { mese: string; valore: number; previsto: number }[]; obiettivo: number }) {
  const [su, setSu] = useState<number | null>(null);
  const max = Math.max(1, obiettivo, ...serie.map((s) => Math.max(s.valore, s.previsto)));
  const attivo = su ?? serie.length - 1;
  return (
    <div className="st-barre">
      <p className="st-barre-testa"><b>{euro(serie[attivo].valore)}</b> incassati a {nomeMese(serie[attivo].mese, true)} {serie[attivo].mese.slice(0, 4)}{serie[attivo].previsto > 0 ? <span> · ricorrente {euro(serie[attivo].previsto)}</span> : null}</p>
      <div className="st-barre-area" role="img" aria-label={`Incassi degli ultimi ${serie.length} mesi: ${serie.map((s) => `${nomeMese(s.mese)} ${euro(s.valore)}`).join(", ")}`}>
        {obiettivo > 0 ? <i className="st-barre-obiettivo" style={{ bottom: `${(obiettivo / max) * 100}%` }}><span>obiettivo {euro(obiettivo)}</span></i> : null}
        {serie.map((s, i) => (
          <button key={s.mese} type="button" className="st-barra-col" aria-pressed={attivo === i} onMouseEnter={() => setSu(i)} onFocus={() => setSu(i)} onMouseLeave={() => setSu(null)} onBlur={() => setSu(null)} aria-label={`${nomeMese(s.mese, true)}: ${euro(s.valore)}`}>
            <span className="st-barra-previsto" style={{ height: `${(s.previsto / max) * 100}%` }} />
            <span className="st-barra-piena" style={{ height: `${(s.valore / max) * 100}%` }} />
            <em>{nomeMese(s.mese)}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

function Scintilla({ valori }: { valori: number[] }) {
  if (valori.filter((v) => v > 0).length < 2) return null;
  const max = Math.max(...valori, 1);
  const punti = valori.map((v, i) => `${(i / (valori.length - 1)) * 100},${28 - (v / max) * 24}`).join(" ");
  return <svg className="st-scintilla" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points={punti} /></svg>;
}

function SchedaCliente({ c }: { c: Cliente }) {
  const { dati, apri, azione, avvisa } = useStudio();
  const mese = dati.oggi.slice(0, 7);
  const servizi = dati.servizi.filter((s) => s.clienteId === c.id);
  const attivi = servizi.filter((s) => servizioAttivoNelMese(s, mese));
  const altri = servizi.filter((s) => !attivi.includes(s));
  const quota = ricorrente(dati, mese, c.id);
  const aperte = daIncassare(dati.fatture, c.id);
  const scadute = aperte.filter((f) => scaduta(f, dati.oggi));
  const mesi6 = ultimiMesi(6, mese);
  const righe = dati.campagne.filter((k) => k.clienteId === c.id);
  const delMese = righe.filter((k) => k.mese === mese);
  const ultime = delMese.length ? delMese : righe.filter((k) => k.mese === righe.map((r) => r.mese).sort().at(-1));
  const riep = riepilogoCampagne(ultime);
  const meseCampagna = ultime[0]?.mese;

  return (
    <article className="st-cliente" id={`cliente-${c.id}`} data-pausa={!c.attivo || undefined}>
      <header>
        <span className="st-sigla" style={{ background: c.colore }}>{iniziali(c.nome)}</span>
        <div><h3>{c.nome}</h3><p>{c.settore || "Settore non indicato"}{c.attivo ? "" : " · in pausa"}</p></div>
        <div className="st-cliente-quota"><b>{euro(quota)}</b><small>al mese</small></div>
        <button type="button" className="st-btn st-btn-testo" onClick={() => apri({ tipo: "cliente", cliente: c })}>Modifica</button>
      </header>

      <section>
        <h4>Servizi</h4>
        {servizi.length === 0 ? <p className="st-vuoto-riga">Nessun servizio: aggiungi quanto ti paga e per cosa. Poi tocchi l&apos;importo per cambiarlo.</p> : (
          <ul className="st-servizi">
            {attivi.map((s) => <li key={s.id}><button type="button" className="st-servizio-nome" onClick={() => apri({ tipo: "servizio", servizio: s })}><span>{s.nome}</span><small>dal {dataBreve(s.dal)} {s.dal.slice(0, 4)}</small></button><ImportoModificabile valore={s.importo} suffisso="/mese" etichetta={`Prezzo di ${s.nome}`} salva={async (v) => { const r = await azione("servizio.prezzo", { id: s.id, importo: v }); if (r.ok) avvisa(`${s.nome}: prezzo aggiornato.`); return r.ok; }} /></li>)}
            {altri.map((s) => <li key={s.id} data-spento><button type="button" className="st-servizio-nome" onClick={() => apri({ tipo: "servizio", servizio: s })}><span>{s.nome}</span><small>{s.ricorrenza === "una_tantum" ? `una volta, ${dataBreve(s.dal)} ${s.dal.slice(0, 4)}` : s.al && meseDi(s.al) < mese ? `chiuso il ${dataBreve(s.al)}` : `parte il ${dataBreve(s.dal)}`}</small></button><ImportoModificabile valore={s.importo} etichetta={`Prezzo di ${s.nome}`} salva={async (v) => { const r = await azione("servizio.prezzo", { id: s.id, importo: v }); return r.ok; }} /></li>)}
          </ul>
        )}
        <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "servizio", clienteId: c.id })}>+ Servizio</button>
      </section>

      <section>
        <h4>Incassi</h4>
        <dl className="st-numeri">
          <div><dt>Incassato nel {mese.slice(0, 4)}</dt><dd>{euro(incassatoNellAnno(dati.fatture, mese.slice(0, 4), c.id))}</dd></div>
          <div data-allarme={scadute.length > 0 || undefined}><dt>Da incassare</dt><dd>{euro(somma(aperte))}</dd>{scadute.length ? <small>{euro(somma(scadute))} già scaduti</small> : aperte.length ? <small>{aperte.length === 1 ? "1 fattura aperta" : `${aperte.length} fatture aperte`}</small> : null}</div>
        </dl>
        <button type="button" className="st-btn st-btn-mini" onClick={() => apri({ tipo: "fattura", clienteId: c.id })}>+ Fattura</button>
      </section>

      <section>
        <h4>Campagna{meseCampagna ? <small> {nomeMese(meseCampagna, true)}{ultime.some((k) => k.auto) ? " · dal sito" : ""}</small> : null}</h4>
        {ultime.length === 0 ? <p className="st-vuoto-riga">Ancora nessun numero: segna spesa e contatti del mese.</p> : (
          <>
            <dl className="st-numeri st-numeri-4">
              <div><dt>Spesa</dt><dd>{euro(riep.spesa)}</dd></div>
              <div><dt>Contatti</dt><dd>{riep.contatti}</dd></div>
              <div><dt>Costo per contatto</dt><dd>{riep.costoContatto === null ? "—" : euro(riep.costoContatto, true)}</dd></div>
              <div data-buono={riep.ritorno !== null && riep.ritorno >= 3 ? true : undefined}><dt>Ritorno</dt><dd>{riep.ritorno === null ? "—" : `${riep.ritorno.toFixed(1).replace(".", ",")}×`}</dd></div>
            </dl>
            <div className="st-andamento"><small>Contatti, ultimi 6 mesi</small><Scintilla valori={mesi6.map((m) => righe.filter((k) => k.mese === m).reduce((t, k) => t + k.contatti, 0))} /></div>
          </>
        )}
        <button type="button" className="st-btn st-btn-mini" onClick={() => apri(ultime.length === 1 && !ultime[0].auto && ultime[0].mese === mese ? { tipo: "campagna", campagna: ultime[0] } : { tipo: "campagna", clienteId: c.id })}>{delMese.some((k) => !k.auto) ? "Aggiorna numeri" : "+ Numeri del mese"}</button>
      </section>
    </article>
  );
}

type Filtro = "aperte" | "pagate" | "tutte";

export function Conti() {
  const { dati, apri, azione, incassa, avvisa } = useStudio();
  const [filtro, setFiltro] = useState<Filtro>("aperte");
  const mese = dati.oggi.slice(0, 7);
  const anno = mese.slice(0, 4);

  const calc = useMemo(() => {
    const aperte = daIncassare(dati.fatture);
    const scadute = aperte.filter((f) => scaduta(f, dati.oggi));
    const mesi = ultimiMesi(12, mese);
    return {
      ricorrente: ricorrente(dati, mese),
      incassatoMese: incassatoNelMese(dati.fatture, mese),
      incassatoPrec: incassatoNelMese(dati.fatture, mesi[10]),
      aperte, scadute,
      anno: incassatoNellAnno(dati.fatture, anno),
      serie: mesi.map((m) => ({ mese: m, valore: incassatoNelMese(dati.fatture, m), previsto: ricorrente(dati, m) })),
      ultimi: dati.fatture.filter((f) => f.pagataIl).sort((a, b) => (b.pagataIl ?? "").localeCompare(a.pagataIl ?? "") || b.id - a.id).slice(0, 7),
      daGenerare: dati.servizi.filter((s) => servizioAttivoNelMese(s, mese) && dati.clienti.find((c) => c.id === s.clienteId)?.attivo && !dati.fatture.some((f) => f.servizioId === s.id && f.mese === mese)).length,
    };
  }, [dati, mese, anno]);

  const elenco = useMemo(() => {
    const f = filtro === "aperte" ? dati.fatture.filter((x) => !x.pagataIl) : filtro === "pagate" ? dati.fatture.filter((x) => x.pagataIl) : dati.fatture;
    return [...f].sort((a, b) => (filtro === "aperte" ? a.scadenza.localeCompare(b.scadenza) : (b.pagataIl ?? b.emessaIl).localeCompare(a.pagataIl ?? a.emessaIl)));
  }, [dati.fatture, filtro]);

  const attivi = dati.clienti.filter((c) => c.attivo);
  const pausa = dati.clienti.filter((c) => !c.attivo);
  const perc = dati.obiettivoMese > 0 ? Math.min(100, Math.round((calc.incassatoMese / dati.obiettivoMese) * 100)) : null;

  if (dati.clienti.length === 0) {
    return (
      <div className="st-pagina">
        <div className="st-benvenuto">
          <h1>Parti dal primo cliente</h1>
          <p>Aggiungi chi ti paga e quanto al mese. Da lì arrivano le entrate ricorrenti, le fatture da incassare e i numeri delle campagne.</p>
          <button type="button" className="st-btn st-btn-pieno st-btn-grande" onClick={() => apri({ tipo: "cliente" })}>Aggiungi il primo cliente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="st-pagina">
      <header className="st-pagina-testa">
        <div><h1>Conti</h1><p>{nomeMese(mese, true).replace(/^./, (l) => l.toUpperCase())} {anno}: quanto entra, cosa è entrato, cosa manca.</p></div>
        <div className="st-pagina-azioni">
          {calc.daGenerare > 0 ? <button type="button" className="st-btn" onClick={async () => { const r = await azione("fatture.genera", { mese }); if (r.ok) avvisa(calc.daGenerare === 1 ? "Creata la fattura del mese." : `Create ${calc.daGenerare} fatture del mese.`); }}>Crea le {calc.daGenerare === 1 ? "fattura" : `${calc.daGenerare} fatture`} di {nomeMese(mese, true)}</button> : null}
          <button type="button" className="st-btn" onClick={() => apri({ tipo: "fattura" })}>+ Fattura</button>
          <button type="button" className="st-btn st-btn-pieno" onClick={() => apri({ tipo: "cliente" })}>+ Cliente</button>
        </div>
      </header>

      <section className="st-kpi" aria-label="Numeri del mese">
        <div className="st-kpi-carta"><small>Entrate ricorrenti</small><b>{euro(calc.ricorrente)}<i>/mese</i></b><p>{attivi.length === 1 ? "1 cliente attivo" : `${attivi.length} clienti attivi`} · {euro(calc.ricorrente * 12)} in un anno</p></div>
        <div className="st-kpi-carta st-kpi-soldi">
          <small>Incassato a {nomeMese(mese, true)}</small><b>{euro(calc.incassatoMese)}</b>
          {perc !== null ? <><span className="st-avanzamento" role="progressbar" aria-valuenow={perc} aria-valuemin={0} aria-valuemax={100} aria-label="Avanzamento verso l'obiettivo"><i style={{ width: `${perc}%` }} /></span><p>{perc}% dell&apos;obiettivo di {euro(dati.obiettivoMese)} · <button type="button" className="st-link" onClick={() => apri({ tipo: "obiettivo" })}>cambia</button></p></>
            : <p>{calc.incassatoPrec > 0 ? `${euro(calc.incassatoPrec)} il mese scorso · ` : ""}<button type="button" className="st-link" onClick={() => apri({ tipo: "obiettivo" })}>imposta un obiettivo</button></p>}
        </div>
        <div className="st-kpi-carta" data-allarme={calc.scadute.length > 0 || undefined}><small>Da incassare</small><b>{euro(somma(calc.aperte))}</b><p>{calc.aperte.length === 0 ? "Tutto incassato" : calc.scadute.length ? `${euro(somma(calc.scadute))} già scaduti (${calc.scadute.length})` : calc.aperte.length === 1 ? "1 fattura, nessuna scaduta" : `${calc.aperte.length} fatture, nessuna scaduta`}</p></div>
        <div className="st-kpi-carta"><small>Incassato nel {anno}</small><b>{euro(calc.anno)}</b><p>media {euro(calc.anno / Math.max(1, Number(mese.slice(5))))} al mese</p></div>
      </section>

      <section className="st-due">
        <div className="st-carta"><h2>Soldi entrati, ultimi 12 mesi</h2><Barre serie={calc.serie} obiettivo={dati.obiettivoMese} /></div>
        <div className="st-carta">
          <h2>Ultimi incassi</h2>
          {calc.ultimi.length === 0 ? <p className="st-vuoto-riga">Ancora nessun incasso. Quando segni una fattura come pagata compare qui.</p> : (
            <ul className="st-incassi">
              {calc.ultimi.map((f) => <li key={f.id}><span className="st-sigla st-sigla-mini" style={{ background: dati.clienti.find((c) => c.id === f.clienteId)?.colore }}>{iniziali(nomeCliente(dati.clienti, f.clienteId))}</span><div><b>{nomeCliente(dati.clienti, f.clienteId)}</b><small>{f.descrizione} · {dataBreve(f.pagataIl ?? "")}</small></div><em>+ {euro(f.importo)}</em></li>)}
            </ul>
          )}
        </div>
      </section>

      <section aria-label="Clienti">
        <div className="st-sezione-testa"><h2>Clienti</h2><p>Quanto paga ciascuno, cosa manca e come rende la campagna.</p></div>
        <div className="st-clienti">{attivi.map((c) => <SchedaCliente key={c.id} c={c} />)}</div>
        {pausa.length ? <details className="st-archivio"><summary>In pausa ({pausa.length})</summary><div className="st-clienti">{pausa.map((c) => <SchedaCliente key={c.id} c={c} />)}</div></details> : null}
      </section>

      <section aria-label="Fatture" id="fatture">
        <div className="st-sezione-testa">
          <h2>Fatture</h2>
          <div className="st-segmento" role="radiogroup" aria-label="Quali fatture">
            {(["aperte", "pagate", "tutte"] as Filtro[]).map((f) => <button key={f} type="button" role="radio" aria-checked={filtro === f} onClick={() => setFiltro(f)}>{f === "aperte" ? `Da incassare${calc.aperte.length ? ` (${calc.aperte.length})` : ""}` : f === "pagate" ? "Incassate" : "Tutte"}</button>)}
          </div>
        </div>
        {elenco.length === 0 ? <p className="st-carta st-vuoto-riga">{filtro === "aperte" ? "Niente da incassare." : "Nessuna fattura qui."}</p> : (
          <ul className="st-fatture">
            {elenco.slice(0, 60).map((f) => <RigaFattura key={f.id} f={f} oggi={dati.oggi} cliente={dati.clienti.find((c) => c.id === f.clienteId)} incassa={() => incassa(f)} apri={() => apri({ tipo: "fattura", fattura: f })} annulla={async () => { await azione("fattura.paga", { id: f.id, pagata: false }); }} />)}
          </ul>
        )}
      </section>
    </div>
  );
}

function RigaFattura({ f, oggi, cliente, incassa, apri, annulla }: { f: Fattura; oggi: string; cliente?: Cliente; incassa: () => void; apri: () => void; annulla: () => void }) {
  const ritardo = scaduta(f, oggi) ? giorniTra(f.scadenza, oggi) : 0;
  const mancano = !f.pagataIl && !ritardo ? giorniTra(oggi, f.scadenza) : 0;
  return (
    <li className="st-fattura" data-stato={f.pagataIl ? "pagata" : ritardo ? "scaduta" : "aperta"}>
      <span className="st-sigla st-sigla-mini" style={{ background: cliente?.colore ?? "#9aa0ad" }}>{iniziali(cliente?.nome ?? "?")}</span>
      <button type="button" className="st-fattura-testo" onClick={apri}><b>{cliente?.nome ?? "Cliente eliminato"}</b><small>{f.descrizione}</small></button>
      <span className="st-fattura-stato">{f.pagataIl ? `incassata il ${dataBreve(f.pagataIl)}` : ritardo ? `scaduta da ${ritardo === 1 ? "1 giorno" : `${ritardo} giorni`}` : mancano === 0 ? "scade oggi" : `scade tra ${mancano === 1 ? "1 giorno" : `${mancano} giorni`}`}</span>
      <b className="st-fattura-importo">{euro(f.importo)}</b>
      {f.pagataIl ? <button type="button" className="st-btn st-btn-testo st-btn-mini" onClick={annulla}>Annulla incasso</button> : <button type="button" className="st-btn st-btn-soldi st-btn-mini" onClick={incassa}>Segna incassata</button>}
    </li>
  );
}
