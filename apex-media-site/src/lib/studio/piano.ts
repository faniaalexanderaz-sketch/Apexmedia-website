import { aggiungiGiorni, fineMese, nomeMese, servizioAttivoNelMese } from "./calcoli";
import type { Cliente, Servizio } from "./tipi";

/* =============================================================
   "Prepara il mese": dai servizi attivi di un cliente nasce la lista
   dei lavori standard del mese, ciascuno con il suo agente e la sua
   scadenza. Ogni lavoro ha una chiave, così rifarlo non crea doppioni.
   Per cambiare cosa si prepara basta toccare REGOLE qui sotto.
   ============================================================= */

export type LavoroPiano = { agente: string; titolo: string; brief: string; scadenza: string; chiave: string };

type Regola = {
  /** parole nel nome del servizio che attivano la regola */
  se: RegExp;
  lavori: { agente: string; titolo: (m: string, s: string) => string; brief: string; giorno: number | "fine" }[];
};

const REGOLE: Regola[] = [
  {
    se: /social|instagram|tiktok social|contenuti/i,
    lavori: [
      { agente: "sofia", titolo: (m) => `Piano editoriale di ${m}`, brief: "Piano dei contenuti del mese: cosa esce, quale formato, quando, con l'obiettivo di ogni contenuto.", giorno: 3 },
      { agente: "giulia", titolo: (m) => `4 reel di ${m}`, brief: "Quattro reel del mese: per ognuno tre ganci, script, testo a schermo e scaletta.", giorno: 20 },
      { agente: "luca", titolo: (m) => `4 caroselli di ${m}`, brief: "Quattro caroselli del mese: copertina e testo slide per slide.", giorno: 20 },
      { agente: "chiara", titolo: (m) => `Caption e storie di ${m}`, brief: "Caption dei contenuti del mese e una sequenza di storie a settimana.", giorno: 22 },
      { agente: "alice", titolo: (m) => `Calendario uscite di ${m}`, brief: "Giorno e ora di ogni contenuto del mese, con la lista di controllo prima di pubblicare.", giorno: 5 },
      { agente: "simone", titolo: (m) => `DM e commenti di ${m}`, brief: "Risposte tipo ai commenti e ai messaggi del mese, con i solleciti.", giorno: "fine" },
    ],
  },
  {
    se: /ads|google|meta|facebook|tiktok ads|campagn|sponsor/i,
    lavori: [
      { agente: "davide", titolo: (m, s) => `${s}: controllo e ottimizzazione di ${m}`, brief: "Controlla la campagna: costo per contatto, annunci da cambiare, budget del mese, parole chiave da escludere.", giorno: 10 },
      { agente: "marco", titolo: (m, s) => `Report ${s} di ${m}`, brief: "Numeri del mese della campagna: cosa ha funzionato, cosa fermare, tre azioni per il mese dopo.", giorno: "fine" },
    ],
  },
  {
    se: /video|reel|montaggio|youtube/i,
    lavori: [{ agente: "matteo", titolo: (m) => `Montaggio video di ${m}`, brief: "Scaletta di montaggio dei video del mese: tagli, sottotitoli, grafiche, copertine.", giorno: 18 }],
  },
  {
    se: /sito|landing|pagina|e-?commerce|manutenzione/i,
    lavori: [{ agente: "elena", titolo: (m) => `Controllo sito e conversioni di ${m}`, brief: "Controlla la pagina principale: cosa frena i contatti, un test da fare questo mese.", giorno: 15 }],
  },
  {
    se: /shooting|foto/i,
    lavori: [{ agente: "matteo", titolo: (m) => `Shooting di ${m}: lista scatti`, brief: "Lista degli scatti da fare, inquadrature e uso previsto di ogni foto.", giorno: 8 }],
  },
];

export function pianoDelMese(cliente: Cliente, servizi: Servizio[], mese: string, oggi: string): LavoroPiano[] {
  const m = nomeMese(mese, true);
  const attivi = servizi.filter((s) => s.clienteId === cliente.id && (servizioAttivoNelMese(s, mese) || (s.ricorrenza === "una_tantum" && s.dal.slice(0, 7) === mese)));
  const out: LavoroPiano[] = [];
  const visti = new Set<string>();
  const data = (g: number | "fine") => {
    const d = g === "fine" ? fineMese(mese) : `${mese}-${String(g).padStart(2, "0")}`;
    // una scadenza già passata diventa "fra due giorni"
    return d < oggi ? aggiungiGiorni(oggi, 2) : d;
  };
  for (const s of attivi) {
    for (const r of REGOLE) {
      if (!r.se.test(s.nome)) continue;
      for (const l of r.lavori) {
        const chiave = `mese:${cliente.id}:${mese}:${l.agente}:${l.titolo("x", s.nome).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        if (visti.has(chiave)) continue;
        visti.add(chiave);
        out.push({ agente: l.agente, titolo: l.titolo(m, s.nome), brief: `${l.brief}\nServizio: ${s.nome}.`, scadenza: data(l.giorno), chiave });
      }
    }
  }
  if (out.length === 0) {
    out.push({ agente: "direttore", titolo: `Piano di lavoro di ${m}`, brief: "Cosa facciamo questo mese per il cliente, chi lo fa e in che ordine.", scadenza: data(5), chiave: `mese:${cliente.id}:${mese}:direttore:piano` });
  }
  return out;
}
