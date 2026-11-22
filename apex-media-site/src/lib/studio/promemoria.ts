import { AGENTE } from "./agenti";
import { aggiungiGiorni, dataBreve, euro, giorniTra, nomeCliente, nomeMese, scaduta, servizioAttivoNelMese } from "./calcoli";
import type { Dati } from "./tipi";

/* =============================================================
   Promemoria: le cose che qualcuno del team deve ricordarti.
   Ognuno ha l'agente che te lo dice (in ufficio cammina fino alla
   tua scrivania), una frase breve per il fumetto e un'azione.
   Funzione pura: stessi dati, stessi promemoria.
   ============================================================= */

export type Tono = "attesa" | "allarme" | "scadenza" | "soldi" | "info";

export type AzionePromemoria =
  | { tipo: "risultato"; lavoroId: number }
  | { tipo: "incassa"; fatturaId: number }
  | { tipo: "sollecito"; fatturaId: number }
  | { tipo: "fatture" }
  | { tipo: "campagna"; clienteId: number }
  | { tipo: "prepara"; clienteId: number };

export type Promemoria = {
  id: string;
  agente: string;
  tono: Tono;
  /** frase del fumetto, detta dall'agente */
  frase: string;
  /** riga di dettaglio per l'elenco */
  dettaglio: string;
  /** testo del bottone */
  bottone: string;
  azione: AzionePromemoria;
  clienteId: number | null;
  /** più alto = più urgente */
  peso: number;
};

const ADS = /ads|google|meta|facebook|tiktok ads|campagn|sponsor/i;

export function promemoria(d: Dati): Promemoria[] {
  const out: Promemoria[] = [];
  const oggi = d.oggi, mese = oggi.slice(0, 7), giorno = Number(oggi.slice(8, 10));
  const cliente = (id: number | null) => nomeCliente(d.clienti, id);
  const attivi = new Set(d.clienti.filter((c) => c.attivo).map((c) => c.id));

  // 1. lavori consegnati che aspettano te
  for (const l of d.lavori.filter((x) => x.stato === "da_guardare")) {
    out.push({
      id: `guarda:${l.id}`, agente: l.agente, tono: "attesa",
      frase: `Ho finito: ${l.titolo}`, dettaglio: `${AGENTE[l.agente]?.nome ?? "Un agente"} ha consegnato${l.clienteId ? ` per ${cliente(l.clienteId)}` : ""}.`,
      bottone: "Guarda", azione: { tipo: "risultato", lavoroId: l.id }, clienteId: l.clienteId, peso: 80,
    });
  }

  // 2. scadenze dei lavori non ancora consegnati
  for (const l of d.lavori.filter((x) => x.scadenza && (x.stato === "in_coda" || x.stato === "in_lavorazione"))) {
    const g = giorniTra(oggi, l.scadenza as string);
    if (g > 1) continue;
    const per = l.clienteId ? ` per ${cliente(l.clienteId)}` : "";
    out.push({
      id: `scade:${l.id}`, agente: l.agente, tono: g < 0 ? "allarme" : "scadenza",
      frase: g < 0 ? `Sono in ritardo: ${l.titolo}` : g === 0 ? `Scade oggi: ${l.titolo}` : `Scade domani: ${l.titolo}`,
      dettaglio: `${g < 0 ? `Scaduto il ${dataBreve(l.scadenza as string)}` : g === 0 ? "Scade oggi" : "Scade domani"}${per}. ${l.stato === "in_lavorazione" ? "Ci sta lavorando." : "È ancora in coda."}`,
      bottone: d.ai && l.stato === "in_coda" ? "Fai partire" : "Apri", azione: { tipo: "risultato", lavoroId: l.id }, clienteId: l.clienteId, peso: g < 0 ? 90 : g === 0 ? 75 : 55,
    });
  }

  // 3. fatture scadute e in scadenza: te lo dice Sara
  for (const f of d.fatture.filter((x) => !x.pagataIl && attivi.has(x.clienteId))) {
    const g = giorniTra(oggi, f.scadenza);
    if (scaduta(f, oggi)) {
      out.push({
        id: `scaduta:${f.id}`, agente: "sara", tono: "allarme",
        frase: `${cliente(f.clienteId)} deve ancora pagare ${euro(f.importo)}`,
        dettaglio: `${f.descrizione}, scaduta da ${-g === 1 ? "1 giorno" : `${-g} giorni`}.`,
        bottone: "Scrivi sollecito", azione: { tipo: "sollecito", fatturaId: f.id }, clienteId: f.clienteId, peso: 85 + Math.min(10, -g / 3),
      });
    } else if (g <= 3) {
      out.push({
        id: `scadenza:${f.id}`, agente: "sara", tono: "soldi",
        frase: `${g === 0 ? "Oggi" : g === 1 ? "Domani" : `Tra ${g} giorni`} scade la fattura di ${cliente(f.clienteId)}`,
        dettaglio: `${f.descrizione}: ${euro(f.importo)}.`,
        bottone: "Segna incassata", azione: { tipo: "incassa", fatturaId: f.id }, clienteId: f.clienteId, peso: 50,
      });
    }
  }

  // 4. fatture del mese ancora da creare
  const daCreare = d.servizi.filter((s) => attivi.has(s.clienteId) && servizioAttivoNelMese(s, mese) && !d.fatture.some((f) => f.servizioId === s.id && f.mese === mese));
  if (daCreare.length) {
    out.push({
      id: `fatture:${mese}`, agente: "sara", tono: "soldi",
      frase: daCreare.length === 1 ? `C'è una fattura di ${nomeMese(mese, true)} da creare` : `Ci sono ${daCreare.length} fatture di ${nomeMese(mese, true)} da creare`,
      dettaglio: [...new Set(daCreare.map((s) => cliente(s.clienteId)))].join(", "),
      bottone: "Crea le fatture", azione: { tipo: "fatture" }, clienteId: null, peso: giorno >= 5 ? 60 : 40,
    });
  }

  for (const c of d.clienti.filter((x) => x.attivo)) {
    const suoi = d.servizi.filter((s) => s.clienteId === c.id && servizioAttivoNelMese(s, mese));

    // 5. numeri della campagna del mese mancanti (dopo il 5 del mese)
    if (giorno >= 5 && suoi.some((s) => ADS.test(s.nome)) && !d.campagne.some((k) => k.clienteId === c.id && k.mese === mese)) {
      out.push({
        id: `numeri:${c.id}:${mese}`, agente: "davide", tono: "info",
        frase: `Mi segni i numeri della campagna di ${c.nome}?`,
        dettaglio: `Spesa e contatti di ${nomeMese(mese, true)}: servono per sapere quanto rende.`,
        bottone: "Segna i numeri", azione: { tipo: "campagna", clienteId: c.id }, clienteId: c.id, peso: 35,
      });
    }

    // 6. nessun lavoro per il cliente in questo mese
    const delMese = d.lavori.some((l) => l.clienteId === c.id && (l.creatoIl.slice(0, 7) === mese || l.scadenza?.slice(0, 7) === mese));
    if (suoi.length && !delMese) {
      out.push({
        id: `prepara:${c.id}:${mese}`, agente: "sofia", tono: "info",
        frase: `Prepariamo il mese di ${c.nome}?`,
        dettaglio: `Nessun lavoro ancora per ${nomeMese(mese, true)}: creo post, reel e campagna dai suoi servizi.`,
        bottone: "Prepara il mese", azione: { tipo: "prepara", clienteId: c.id }, clienteId: c.id, peso: 45,
      });
    }
  }

  return out.sort((a, b) => b.peso - a.peso);
}

/** Un promemoria per agente, i più urgenti: sono quelli che vengono a parlarti in ufficio. */
export function visite(lista: Promemoria[], quanti: number): Promemoria[] {
  const visti = new Set<string>();
  const out: Promemoria[] = [];
  for (const p of lista) {
    if (visti.has(p.agente) || !AGENTE[p.agente]) continue;
    visti.add(p.agente);
    out.push(p);
    if (out.length >= quanti) break;
  }
  return out;
}

/** Il brief del sollecito che Sara scrive per una fattura scaduta. */
export function briefSollecito(d: Dati, fatturaId: number): { titolo: string; brief: string; clienteId: number } | null {
  const f = d.fatture.find((x) => x.id === fatturaId);
  if (!f) return null;
  const g = giorniTra(f.scadenza, d.oggi);
  return {
    clienteId: f.clienteId,
    titolo: `Sollecito: ${nomeCliente(d.clienti, f.clienteId)}, ${euro(f.importo)}`,
    brief: `Sollecito di pagamento per ${nomeCliente(d.clienti, f.clienteId)}.\nFattura: ${f.descrizione}, ${euro(f.importo)}, emessa il ${dataBreve(f.emessaIl)}, scaduta il ${dataBreve(f.scadenza)} (${g} giorni fa).\nScrivi il messaggio WhatsApp, l'email e il secondo sollecito da mandare tra 7 giorni (${dataBreve(aggiungiGiorni(d.oggi, 7))}).`,
  };
}
