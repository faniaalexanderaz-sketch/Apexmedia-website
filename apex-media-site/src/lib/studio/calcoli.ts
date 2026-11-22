import type { Campagna, Cliente, Dati, Fattura, Lavoro, Servizio } from "./tipi";

/* Conti dello Studio: funzioni pure, usate sia dal server sia dal browser. */

export const MESI_BREVI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
export const MESI_LUNGHI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

export function euro(n: number, decimali = false): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", useGrouping: "always", minimumFractionDigits: decimali ? 2 : 0, maximumFractionDigits: decimali ? 2 : 0 }).format(n);
}
export function meseDi(data: string): string { return data.slice(0, 7); }
export function nomeMese(mese: string, lungo = false): string {
  const i = Number(mese.slice(5, 7)) - 1;
  return (lungo ? MESI_LUNGHI : MESI_BREVI)[i] ?? mese;
}
export function dataBreve(data: string): string {
  return `${Number(data.slice(8, 10))} ${MESI_BREVI[Number(data.slice(5, 7)) - 1]}`;
}
export function mesePrima(mese: string, n = 1): string {
  const [a, m] = mese.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 - n, 1)).toISOString().slice(0, 7);
}
export function ultimiMesi(n: number, fine: string): string[] {
  return Array.from({ length: n }, (_, i) => mesePrima(fine, n - 1 - i));
}
export function giorniTra(da: string, a: string): number {
  return Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(da + "T00:00:00Z")) / 86400_000);
}
export function aggiungiGiorni(data: string, n: number): string {
  return new Date(Date.parse(data + "T00:00:00Z") + n * 86400_000).toISOString().slice(0, 10);
}
export function fineMese(mese: string): string {
  const [a, m] = mese.split("-").map(Number);
  return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10);
}

/** Un servizio mensile è attivo in un mese se è iniziato entro quel mese e non è finito prima. */
export function servizioAttivoNelMese(s: Servizio, mese: string): boolean {
  return s.ricorrenza === "mensile" && meseDi(s.dal) <= mese && (!s.al || meseDi(s.al) >= mese);
}

/** Entrate ricorrenti del mese: somma dei servizi mensili attivi dei clienti attivi. */
export function ricorrente(d: Pick<Dati, "servizi" | "clienti">, mese: string, clienteId?: number): number {
  const attivi = new Set(d.clienti.filter((c) => c.attivo).map((c) => c.id));
  return d.servizi
    .filter((s) => attivi.has(s.clienteId) && (clienteId === undefined || s.clienteId === clienteId) && servizioAttivoNelMese(s, mese))
    .reduce((t, s) => t + s.importo, 0);
}

export function incassatoNelMese(fatture: Fattura[], mese: string, clienteId?: number): number {
  return fatture.filter((f) => f.pagataIl && meseDi(f.pagataIl) === mese && (clienteId === undefined || f.clienteId === clienteId)).reduce((t, f) => t + f.importo, 0);
}
export function incassatoNellAnno(fatture: Fattura[], anno: string, clienteId?: number): number {
  return fatture.filter((f) => f.pagataIl?.startsWith(anno) && (clienteId === undefined || f.clienteId === clienteId)).reduce((t, f) => t + f.importo, 0);
}
export function daIncassare(fatture: Fattura[], clienteId?: number): Fattura[] {
  return fatture.filter((f) => !f.pagataIl && (clienteId === undefined || f.clienteId === clienteId)).sort((a, b) => a.scadenza.localeCompare(b.scadenza));
}
export function scaduta(f: Fattura, oggi: string): boolean { return !f.pagataIl && f.scadenza < oggi; }
export function somma(fatture: Fattura[]): number { return fatture.reduce((t, f) => t + f.importo, 0); }

export type RiepilogoCampagna = { spesa: number; contatti: number; ricavo: number | null; costoContatto: number | null; ritorno: number | null };
export function riepilogoCampagne(righe: Campagna[]): RiepilogoCampagna {
  const spesa = righe.reduce((t, r) => t + r.spesa, 0);
  const contatti = righe.reduce((t, r) => t + r.contatti, 0);
  const conRicavo = righe.filter((r) => r.ricavo !== null);
  const ricavo = conRicavo.length ? conRicavo.reduce((t, r) => t + (r.ricavo ?? 0), 0) : null;
  return { spesa, contatti, ricavo, costoContatto: contatti > 0 && spesa > 0 ? spesa / contatti : null, ritorno: ricavo !== null && spesa > 0 ? ricavo / spesa : null };
}

export function nomeCliente(clienti: Cliente[], id: number | null): string {
  return id === null ? "" : clienti.find((c) => c.id === id)?.nome ?? "Cliente eliminato";
}
export function iniziali(nome: string): string {
  const parti = nome.replace(/[’']/g, " ").split(/\s+/).filter((p) => p.length > 1 && !/^(di|del|della|d|e|il|la)$/i.test(p));
  return ((parti[0]?.[0] ?? "?") + (parti[1]?.[0] ?? "")).toUpperCase();
}

/** Quanto tempo fa, in parole: "adesso", "12 min fa", "3 ore fa", "2 giorni fa". */
export function tempoFa(iso: string, adesso = Date.now()): string {
  const min = Math.max(0, Math.round((adesso - Date.parse(iso)) / 60_000));
  if (min < 1) return "adesso";
  if (min < 60) return `${min} min fa`;
  const ore = Math.round(min / 60);
  if (ore < 24) return ore === 1 ? "1 ora fa" : `${ore} ore fa`;
  const g = Math.round(ore / 24);
  return g === 1 ? "ieri" : `${g} giorni fa`;
}

export type StatoAgente = "attesa" | "lavora" | "coda" | "libero";
/** Lo stato di un agente dipende dai suoi lavori aperti: prima ciò che aspetta te. */
export function statoAgente(lavori: Lavoro[], agente: string): { stato: StatoAgente; lavoro: Lavoro | null; aperti: number } {
  const miei = lavori.filter((l) => l.agente === agente && l.stato !== "fatto");
  const pick = (s: Lavoro["stato"]) => miei.filter((l) => l.stato === s).sort((a, b) => a.aggiornatoIl.localeCompare(b.aggiornatoIl))[0] ?? null;
  const g = pick("da_guardare"), w = pick("in_lavorazione"), c = pick("in_coda");
  if (g) return { stato: "attesa", lavoro: g, aperti: miei.length };
  if (w) return { stato: "lavora", lavoro: w, aperti: miei.length };
  if (c) return { stato: "coda", lavoro: c, aperti: miei.length };
  return { stato: "libero", lavoro: null, aperti: 0 };
}

export function saluto(ora: number): string {
  return ora < 5 ? "Buonanotte" : ora < 13 ? "Buongiorno" : ora < 18 ? "Buon pomeriggio" : "Buonasera";
}
export function elenco(nomi: string[]): string {
  if (nomi.length <= 2) return nomi.join(" e ");
  return `${nomi.slice(0, 2).join(", ")} e ${nomi.length - 2 === 1 ? "un altro" : `altri ${nomi.length - 2}`}`;
}
