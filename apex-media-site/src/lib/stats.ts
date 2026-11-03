import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/db";
import { giornoLocale, leggiClick, type ClickEvento, type Sorgente } from "@/lib/clicks";
import { prenotazioniTra, type Canale, type Prenotazione } from "@/lib/bookings";
import { elencaNote, elencaSpese, type NotaMensile } from "@/lib/notes";
import { commissioneTreatwell } from "@/lib/settings";

/* =============================================================
   Tutti i numeri del pannello per un mese scelto, con confronto
   al mese precedente. Fuso Europe/Rome.
   ============================================================= */

export const MESE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function meseCorrente(): string {
  return giornoLocale(new Date().toISOString()).slice(0, 7);
}
export function mesePrecedente(m: string): string {
  const [a, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(a, mm - 2, 1));
  return d.toISOString().slice(0, 7);
}
export function ultimiMesi(n: number, fine = meseCorrente()): string[] {
  const out: string[] = [];
  let m = fine;
  for (let i = 0; i < n; i++) { out.unshift(m); m = mesePrecedente(m); }
  return out;
}
function primoGiorno(m: string) { return `${m}-01`; }
function ultimoGiorno(m: string) {
  const [a, mm] = m.split("-").map(Number);
  return new Date(Date.UTC(a, mm, 0)).toISOString().slice(0, 10);
}
export function meseDi(p: Prenotazione) { return p.data.slice(0, 7); }
export function meseDiClick(c: ClickEvento) { return giornoLocale(c.creato_il).slice(0, 7); }

export type Confronto = { valore: number; prec: number | null; delta: number | null };
function confronta(valore: number, prec: number | null): Confronto {
  return { valore, prec, delta: prec === null || prec === 0 ? null : Math.round(((valore - prec) / prec) * 100) };
}

export type Treatwell = {
  lordo: number; commissionePct: number; commissione: number; netto: number;
  prenotazioni: number; scontrino: number; nuovi: number; ritorno: number; ignoti: number;
  prec: { lordo: number; netto: number; prenotazioni: number; scontrino: number } | null;
  perMese: { mese: string; netto: number; lordo: number; n: number }[];
  top: { trattamento: string; n: number; incasso: number }[];
  presente: boolean;
};

export type StatMese = {
  mese: string; prec: string; mesi12: string[];
  prenotazioni: Confronto; contatti: Confronto; costoContatto: Confronto; spesa: Confronto;
  prenotazioniPerMese: { mese: string; n: number }[];
  contattiPerGiorno: { giorno: string; etichetta: string; n: number }[];
  sorgenti: { sorgente: Sorgente; n: number; pct: number }[];
  canali: { canale: Canale; n: number; pct: number }[];
  treatwell: Treatwell;
  nota: NotaMensile | null;
  prenotazioniMese: Prenotazione[];
  aggiornatoIl: string;
  vuoto: boolean;
};

export async function statisticheMese(sito: string, mese: string): Promise<StatMese> {
  const prec = mesePrecedente(mese);
  const mesi12 = ultimiMesi(12, mese);
  const daMesi = primoGiorno(mesi12[0]);
  const aMese = ultimoGiorno(mese);
  const [pren12, click, note, spese, commissionePct] = await Promise.all([
    prenotazioniTra(sito, daMesi, aMese),
    leggiClick(400, sito),
    elencaNote(sito),
    elencaSpese(sito),
    commissioneTreatwell(sito),
  ]);

  const prenM = pren12.filter((p) => meseDi(p) === mese);
  const prenP = pren12.filter((p) => meseDi(p) === prec);
  const clickM = click.filter((c) => meseDiClick(c) === mese);
  const clickP = click.filter((c) => meseDiClick(c) === prec);
  const spesaM = spese.find((s) => s.mese === mese)?.importo ?? 0;
  const spesaP = spese.find((s) => s.mese === prec)?.importo ?? null;
  const costo = (sp: number | null, n: number) => (sp && n ? sp / n : 0);

  // contatti per giorno: 30 giorni fino alla fine del mese scelto (o a oggi se è il mese corrente)
  const fine = mese === meseCorrente() ? giornoLocale(new Date().toISOString()) : aMese;
  const giorni: { giorno: string; etichetta: string; n: number }[] = [];
  const f = new Date(fine + "T12:00:00Z");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(f); d.setUTCDate(d.getUTCDate() - i);
    const g = d.toISOString().slice(0, 10);
    giorni.push({ giorno: g, etichetta: `${g.slice(8, 10)}/${g.slice(5, 7)}`, n: 0 });
  }
  const mappa = new Map(giorni.map((g) => [g.giorno, g]));
  for (const c of click) { const v = mappa.get(giornoLocale(c.creato_il)); if (v) v.n++; }

  const conta = <K extends string>(arr: { k: K }[], chiavi: readonly K[]) => {
    const tot = arr.length || 1;
    return chiavi.map((k) => { const n = arr.filter((x) => x.k === k).length; return { k, n, pct: Math.round((n / tot) * 100) }; });
  };
  const sorgenti = conta(clickM.map((c) => ({ k: c.sorgente })), ["google_ads", "instagram", "organico", "altro"] as const).map((x) => ({ sorgente: x.k, n: x.n, pct: x.pct }));
  const canali = conta(prenM.map((p) => ({ k: p.canale })), ["treatwell", "telefono", "whatsapp", "walk-in"] as const).map((x) => ({ canale: x.k, n: x.n, pct: x.pct }));

  // Treatwell
  const twM = prenM.filter((p) => p.canale === "treatwell");
  const twP = prenP.filter((p) => p.canale === "treatwell");
  const somma = (arr: Prenotazione[]) => arr.reduce((s, p) => s + (p.importo ?? 0), 0);
  const lordo = somma(twM), commissione = lordo * commissionePct / 100, netto = lordo - commissione;
  const lordoP = somma(twP);
  const topMap = new Map<string, { n: number; incasso: number }>();
  for (const p of twM) { const v = topMap.get(p.trattamento) ?? { n: 0, incasso: 0 }; v.n++; v.incasso += p.importo ?? 0; topMap.set(p.trattamento, v); }
  const treatwell: Treatwell = {
    lordo, commissionePct, commissione, netto,
    prenotazioni: twM.length, scontrino: twM.length ? lordo / twM.length : 0,
    nuovi: twM.filter((p) => p.nuovo_cliente === true).length, ritorno: twM.filter((p) => p.nuovo_cliente === false).length, ignoti: twM.filter((p) => p.nuovo_cliente === null).length,
    prec: twP.length ? { lordo: lordoP, netto: lordoP * (1 - commissionePct / 100), prenotazioni: twP.length, scontrino: lordoP / twP.length } : null,
    perMese: mesi12.map((m) => { const arr = pren12.filter((p) => p.canale === "treatwell" && meseDi(p) === m); const l = somma(arr); return { mese: m, lordo: l, netto: l * (1 - commissionePct / 100), n: arr.length }; }),
    top: Array.from(topMap.entries()).map(([trattamento, v]) => ({ trattamento, ...v })).sort((a, b) => b.n - a.n || b.incasso - a.incasso).slice(0, 5),
    presente: twM.length > 0,
  };

  const ultimo = [...click.map((c) => c.creato_il), ...pren12.map((p) => p.creato_il), ...note.map((n) => n.aggiornato_il)].sort().pop() ?? new Date().toISOString();
  return {
    mese, prec, mesi12,
    prenotazioni: confronta(prenM.length, prenP.length),
    contatti: confronta(clickM.length, clickP.length),
    costoContatto: confronta(costo(spesaM, clickM.length), spesaP === null ? null : costo(spesaP, clickP.length)),
    spesa: confronta(spesaM, spesaP),
    prenotazioniPerMese: mesi12.map((m) => ({ mese: m, n: pren12.filter((p) => meseDi(p) === m).length })),
    contattiPerGiorno: giorni,
    sorgenti, canali, treatwell,
    nota: note.find((n) => n.mese === mese) ?? null,
    prenotazioniMese: prenM,
    aggiornatoIl: ultimo,
    vuoto: prenM.length === 0 && clickM.length === 0 && spesaM === 0 && !note.find((n) => n.mese === mese),
  };
}

/** Mesi che hanno almeno un dato (per il selettore). */
export async function mesiDisponibili(sito: string): Promise<string[]> {
  const d = await db();
  const [pren, spese, note] = await Promise.all([
    d.select({ data: schema.bookings.data }).from(schema.bookings).where(eq(schema.bookings.sito, sito)),
    d.select({ mese: schema.monthlyAdspend.mese }).from(schema.monthlyAdspend).where(eq(schema.monthlyAdspend.sito, sito)),
    d.select({ mese: schema.monthlyNotes.mese }).from(schema.monthlyNotes).where(eq(schema.monthlyNotes.sito, sito)),
  ]);
  const s = new Set<string>([meseCorrente(), mesePrecedente(meseCorrente())]);
  pren.forEach((p) => s.add(p.data.slice(0, 7))); spese.forEach((x) => s.add(x.mese)); note.forEach((x) => s.add(x.mese));
  return Array.from(s).sort().reverse();
}

export { and, gte, lte };
