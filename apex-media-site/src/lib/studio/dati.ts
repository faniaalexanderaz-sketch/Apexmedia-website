import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db, modalitaDemo, schema } from "@/db";
import { AGENTE, scegliAgente } from "./agenti";
import { pianoDelMese } from "./piano";
import { aggiungiGiorni, fineMese, mesePrima, servizioAttivoNelMese } from "./calcoli";
import { CANALI, MODELLO_VUOTO, type Campagna, type Dati, type DatiFatturazione, type Fattura, type ModelloFattura, type Ricorrenza, type SchermoTv, type StatoLavoro } from "./tipi";

/* =============================================================
   Dati dello Studio: lettura completa e tutte le modifiche.
   Tutte le tabelle (Studio e pannello) si creano da sole al primo accesso, così non
   serve lanciare nessun comando dopo il deploy.
   ============================================================= */

const S = schema;
const SITO_IMPOSTAZIONI = "studio";

let pronto: Promise<void> | null = null;
async function assicuraTabelle(): Promise<void> {
  const { SCHEMA_SQL } = await import("@/db/schema.sql");
  const d = await db();
  for (const pezzo of SCHEMA_SQL.split("--> statement-breakpoint")) {
    const s = pezzo.trim();
    if (!s) continue;
    // le colonne aggiunte dopo vanno create prima degli indici che le usano
    if (s.startsWith('CREATE UNIQUE INDEX "studio_lavori_chiave_uq"')) await aggiungiColonne(d);
    await d.execute(sql.raw(s.replace(/^CREATE TABLE "/, 'CREATE TABLE IF NOT EXISTS "').replace(/^CREATE (UNIQUE )?INDEX "/, 'CREATE $1INDEX IF NOT EXISTS "')));
  }
  await aggiungiColonne(d);
}
/** Colonne nate dopo la prima versione: su un database già creato vanno aggiunte a mano. */
async function aggiungiColonne(d: Awaited<ReturnType<typeof db>>): Promise<void> {
  await d.execute(sql.raw('ALTER TABLE "studio_lavori" ADD COLUMN IF NOT EXISTS "scadenza" text'));
  await d.execute(sql.raw('ALTER TABLE "studio_lavori" ADD COLUMN IF NOT EXISTS "chiave" text'));
  await d.execute(sql.raw(`ALTER TABLE "studio_clienti" ADD COLUMN IF NOT EXISTS "fatturazione" text DEFAULT '{}' NOT NULL`));
  await d.execute(sql.raw('ALTER TABLE "studio_fatture" ADD COLUMN IF NOT EXISTS "numero" text'));
}
function tabelle(): Promise<void> {
  if (!pronto) pronto = assicuraTabelle().catch((e) => { pronto = null; throw e; });
  return pronto;
}

export function adessoRoma(): { oggi: string; ora: number } {
  const d = new Date();
  return {
    oggi: new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(d),
    ora: Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", hourCycle: "h23" }).format(d)),
  };
}

const num = (v: string | number | null | undefined) => (v === null || v === undefined ? 0 : Number(v));

/** Numeri delle campagne ricavati dal tracciamento dei siti (click, spesa, prenotazioni) per i clienti con un dominio collegato. */
async function campagneTracciate(clienti: { id: number; sito: string | null }[], oggi: string, manuali: Campagna[]): Promise<Campagna[]> {
  const conSito = clienti.filter((c) => c.sito);
  if (!conSito.length) return [];
  const d = await db();
  const daMese = mesePrima(oggi.slice(0, 7), 5);
  const out: Campagna[] = [];
  let id = -1;
  for (const c of conSito) {
    const sito = c.sito as string;
    const mese = sql<string>`to_char(${S.clicks.creatoIl} at time zone 'Europe/Rome', 'YYYY-MM')`;
    const [click, spese, pren] = await Promise.all([
      d.select({ mese, n: sql<number>`count(*)` }).from(S.clicks).where(and(eq(S.clicks.sito, sito), gte(S.clicks.creatoIl, new Date(daMese + "-01T00:00:00Z")))).groupBy(mese),
      d.select({ mese: S.monthlyAdspend.mese, importo: S.monthlyAdspend.importo }).from(S.monthlyAdspend).where(and(eq(S.monthlyAdspend.sito, sito), gte(S.monthlyAdspend.mese, daMese))),
      d.select({ mese: sql<string>`substr(${S.bookings.data}, 1, 7)`, tot: sql<string>`coalesce(sum(${S.bookings.importo}), 0)` }).from(S.bookings).where(and(eq(S.bookings.sito, sito), gte(S.bookings.data, daMese + "-01"))).groupBy(sql`substr(${S.bookings.data}, 1, 7)`),
    ]);
    const mesi = new Set([...click.map((r) => r.mese), ...spese.map((r) => r.mese)]);
    for (const m of mesi) {
      if (manuali.some((r) => r.clienteId === c.id && r.mese === m)) continue; // i numeri inseriti a mano vincono
      const spesa = num(spese.find((r) => r.mese === m)?.importo);
      const contatti = num(click.find((r) => r.mese === m)?.n);
      const ricavo = pren.find((r) => r.mese === m);
      if (!spesa && !contatti) continue;
      out.push({ id: id--, clienteId: c.id, mese: m, canale: "Dal sito", spesa, contatti, ricavo: ricavo ? num(ricavo.tot) : null, auto: true });
    }
  }
  return out;
}

export async function caricaDati(): Promise<Dati> {
  await tabelle();
  const d = await db();
  const { oggi, ora } = adessoRoma();

  // un lavoro rimasto "in lavorazione" oltre 10 minuti (scheda chiusa, errore) torna in coda
  await d.update(S.studioLavori).set({ stato: "in_coda" }).where(and(eq(S.studioLavori.stato, "in_lavorazione"), lt(S.studioLavori.aggiornatoIl, new Date(Date.now() - 10 * 60_000))));

  const [clienti, servizi, fatture, campagne, lavori, regole, obiettivo, tv, modello] = await Promise.all([
    d.select().from(S.studioClienti).orderBy(asc(S.studioClienti.id)),
    d.select().from(S.studioServizi).orderBy(asc(S.studioServizi.id)),
    d.select().from(S.studioFatture).orderBy(desc(S.studioFatture.emessaIl), desc(S.studioFatture.id)),
    d.select().from(S.studioCampagne).orderBy(desc(S.studioCampagne.mese)),
    d.select().from(S.studioLavori).orderBy(desc(S.studioLavori.aggiornatoIl)).limit(300),
    d.select().from(S.studioRegole).orderBy(desc(S.studioRegole.id)),
    d.select().from(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "obiettivo_mese"))).limit(1),
    d.select({ valore: S.settings.valore, quando: S.settings.aggiornatoIl }).from(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "tv"))).limit(1),
    leggiModello(),
  ]);

  const manuali: Campagna[] = campagne.map((r) => ({ id: r.id, clienteId: r.clienteId, mese: r.mese, canale: r.canale, spesa: num(r.spesa), contatti: r.contatti, ricavo: r.ricavo === null ? null : num(r.ricavo) }));
  const auto = await campagneTracciate(clienti, oggi, manuali).catch((e) => { console.error("[studio] tracciamento", e); return []; });

  return {
    demo: modalitaDemo(),
    ai: Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY),
    oggi, ora,
    obiettivoMese: num(obiettivo[0]?.valore),
    tv: leggiTv(tv[0]),
    modelloFattura: modello,
    clienti: clienti.map((c) => ({ id: c.id, nome: c.nome, settore: c.settore, colore: c.colore, sito: c.sito, attivo: c.attivo, note: c.note, fatturazione: leggiJson<DatiFatturazione>(c.fatturazione, {}) })),
    servizi: servizi.map((s) => ({ id: s.id, clienteId: s.clienteId, nome: s.nome, importo: num(s.importo), ricorrenza: s.ricorrenza as Ricorrenza, dal: s.dal, al: s.al })),
    fatture: fatture.map((f) => ({ id: f.id, clienteId: f.clienteId, servizioId: f.servizioId, mese: f.mese, descrizione: f.descrizione, importo: num(f.importo), emessaIl: f.emessaIl, scadenza: f.scadenza, pagataIl: f.pagataIl, numero: f.numero })),
    campagne: [...manuali, ...auto],
    lavori: lavori.map((l) => ({ id: l.id, agente: l.agente, clienteId: l.clienteId, titolo: l.titolo, brief: l.brief, stato: l.stato as StatoLavoro, risultato: l.risultato, revisione: l.revisione, scadenza: l.scadenza, creatoIl: l.creatoIl.toISOString(), aggiornatoIl: l.aggiornatoIl.toISOString() })),
    regole: regole.map((r) => ({ id: r.id, testo: r.testo, agente: r.agente, creatoIl: r.creatoIl.toISOString() })),
  };
}

function leggiJson<T>(s: string | null | undefined, riserva: T): T {
  try { const v = JSON.parse(s ?? ""); return v && typeof v === "object" ? (v as T) : riserva; } catch { return riserva; }
}

/** Il tuo modello di fattura (intestazione, regime, IBAN), salvato nelle impostazioni. */
export async function leggiModello(): Promise<ModelloFattura> {
  const d = await db();
  const [r] = await d.select({ valore: S.settings.valore }).from(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "fattura_modello"))).limit(1);
  return { ...MODELLO_VUOTO, ...leggiJson<Partial<ModelloFattura>>(r?.valore, {}) };
}

/** Tutto quello che serve per stampare una fattura. Al primo PDF le dà il numero progressivo dell'anno. */
export async function fatturaPerPdf(n: number): Promise<{ fattura: Fattura; cliente: { nome: string; fatturazione: DatiFatturazione }; modello: ModelloFattura } | null> {
  await tabelle();
  const d = await db();
  const [f] = await d.select().from(S.studioFatture).where(eq(S.studioFatture.id, n)).limit(1);
  if (!f) return null;
  let numero = f.numero;
  if (!numero) {
    const anno = f.emessaIl.slice(0, 4);
    const usati = await d.select({ numero: S.studioFatture.numero }).from(S.studioFatture).where(sql`${S.studioFatture.numero} like ${"%/" + anno}`);
    const max = usati.reduce((m, r) => Math.max(m, parseInt(r.numero ?? "", 10) || 0), 0);
    numero = `${max + 1}/${anno}`;
    await d.update(S.studioFatture).set({ numero }).where(eq(S.studioFatture.id, n));
  }
  const [c] = await d.select().from(S.studioClienti).where(eq(S.studioClienti.id, f.clienteId)).limit(1);
  return {
    fattura: { id: f.id, clienteId: f.clienteId, servizioId: f.servizioId, mese: f.mese, descrizione: f.descrizione, importo: num(f.importo), emessaIl: f.emessaIl, scadenza: f.scadenza, pagataIl: f.pagataIl, numero },
    cliente: { nome: c?.nome ?? "Cliente", fatturazione: leggiJson<DatiFatturazione>(c?.fatturazione, {}) },
    modello: await leggiModello(),
  };
}

/* ---------- Validazione ---------- */

export class Errore extends Error {}
type Corpo = Record<string, unknown>;

const DATA_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MESE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function testo(v: unknown, campo: string, max: number, obbligatorio = true): string {
  const s = typeof v === "string" ? v.trim().slice(0, max) : "";
  if (obbligatorio && !s) throw new Errore(`Manca: ${campo}.`);
  return s;
}
function importo(v: unknown, campo: string, ammettiZero = false): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || (!ammettiZero && n === 0) || n > 10_000_000) throw new Errore(`${campo}: scrivi un importo valido.`);
  return Math.round(n * 100) / 100;
}
function data(v: unknown, campo: string): string {
  if (typeof v !== "string" || !DATA_RE.test(v)) throw new Errore(`${campo}: data non valida.`);
  return v;
}
function mese(v: unknown): string {
  if (typeof v !== "string" || !MESE_RE.test(v)) throw new Errore("Mese non valido.");
  return v;
}
function id(v: unknown, campo = "elemento"): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Errore(`Manca: ${campo}.`);
  return n;
}
/** Tiene solo i campi di testo previsti, puliti e corti. */
function pulisciOggetto(o: Record<string, unknown>, campi: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of campi) if (typeof o[k] === "string") out[k] = (o[k] as string).trim().slice(0, 300);
  return out;
}
async function clienteEsiste(n: number): Promise<number> {
  const [c] = await (await db()).select({ id: S.studioClienti.id }).from(S.studioClienti).where(eq(S.studioClienti.id, n)).limit(1);
  if (!c) throw new Errore("Cliente non trovato.");
  return n;
}

/* ---------- Modifiche ---------- */

/** Esegue una modifica. Ritorna l'id creato, se ce n'è uno. */
export async function esegui(tipo: string, c: Corpo): Promise<number | undefined> {
  await tabelle();
  const d = await db();
  const { oggi } = adessoRoma();

  switch (tipo) {
    case "cliente.salva": {
      const v = {
        nome: testo(c.nome, "nome del cliente", 80),
        settore: testo(c.settore, "settore", 120, false),
        colore: /^#[0-9a-f]{6}$/i.test(String(c.colore)) ? String(c.colore) : "#5b2eff",
        sito: testo(c.sito, "sito", 100, false).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "") || null,
        attivo: c.attivo !== false,
        note: testo(c.note, "note", 2000, false),
        ...(c.fatturazione && typeof c.fatturazione === "object" ? { fatturazione: JSON.stringify(pulisciOggetto(c.fatturazione as Record<string, unknown>, ["ragioneSociale", "piva", "cf", "indirizzo", "cap", "citta", "provincia", "email", "pec", "sdi"])) } : {}),
      };
      if (c.id) { await d.update(S.studioClienti).set(v).where(eq(S.studioClienti.id, id(c.id))); return id(c.id); }
      const [r] = await d.insert(S.studioClienti).values(v).returning({ id: S.studioClienti.id });
      return r.id;
    }
    case "cliente.elimina": {
      const n = id(c.id);
      await d.delete(S.studioServizi).where(eq(S.studioServizi.clienteId, n));
      await d.delete(S.studioFatture).where(eq(S.studioFatture.clienteId, n));
      await d.delete(S.studioCampagne).where(eq(S.studioCampagne.clienteId, n));
      await d.update(S.studioLavori).set({ clienteId: null }).where(eq(S.studioLavori.clienteId, n));
      await d.delete(S.studioClienti).where(eq(S.studioClienti.id, n));
      return;
    }
    case "servizio.salva": {
      const ricorrenza: Ricorrenza = c.ricorrenza === "una_tantum" ? "una_tantum" : "mensile";
      const v = {
        clienteId: await clienteEsiste(id(c.clienteId, "cliente")),
        nome: testo(c.nome, "nome del servizio", 80),
        importo: String(importo(c.importo, "Importo")),
        ricorrenza,
        dal: data(c.dal || oggi, "Inizio"),
        al: c.al ? data(c.al, "Fine") : null,
      };
      if (v.al && v.al < v.dal) throw new Errore("La fine non può venire prima dell'inizio.");
      if (c.id) { await d.update(S.studioServizi).set(v).where(eq(S.studioServizi.id, id(c.id))); return id(c.id); }
      const [r] = await d.insert(S.studioServizi).values(v).returning({ id: S.studioServizi.id });
      // un lavoro una tantum diventa subito una fattura da incassare
      if (ricorrenza === "una_tantum") {
        await d.insert(S.studioFatture).values({ clienteId: v.clienteId, servizioId: r.id, mese: v.dal.slice(0, 7), descrizione: v.nome, importo: v.importo, emessaIl: v.dal, scadenza: aggiungiGiorni(v.dal, 15) }).onConflictDoNothing();
      }
      return r.id;
    }
    case "servizio.prezzo": {
      await d.update(S.studioServizi).set({ importo: String(importo(c.importo, "Importo")) }).where(eq(S.studioServizi.id, id(c.id)));
      return;
    }
    case "studio.svuota": {
      // cancella clienti, servizi, fatture, campagne e lavori: lo studio riparte vuoto. Le regole del cervello restano
      if (c.conferma !== "SVUOTA") throw new Errore("Per cancellare tutto scrivi SVUOTA.");
      for (const t of [S.studioFatture, S.studioServizi, S.studioCampagne, S.studioLavori, S.studioClienti]) await d.delete(t);
      await d.delete(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "obiettivo_mese")));
      return;
    }
    case "servizio.chiudi": {
      await d.update(S.studioServizi).set({ al: c.al ? data(c.al, "Fine") : oggi }).where(eq(S.studioServizi.id, id(c.id)));
      return;
    }
    case "servizio.elimina": {
      await d.delete(S.studioServizi).where(eq(S.studioServizi.id, id(c.id)));
      return;
    }
    case "fattura.salva": {
      const emessaIl = data(c.emessaIl || oggi, "Data");
      const v = {
        clienteId: await clienteEsiste(id(c.clienteId, "cliente")),
        descrizione: testo(c.descrizione, "descrizione", 160),
        importo: String(importo(c.importo, "Importo")),
        emessaIl,
        scadenza: c.scadenza ? data(c.scadenza, "Scadenza") : aggiungiGiorni(emessaIl, 15),
        pagataIl: c.pagata === true ? (c.pagataIl ? data(c.pagataIl, "Data incasso") : oggi) : c.pagata === false ? null : undefined,
        ...(typeof c.numero === "string" ? { numero: c.numero.trim().slice(0, 20) || null } : {}),
      };
      if (c.id) { await d.update(S.studioFatture).set(v).where(eq(S.studioFatture.id, id(c.id))); return id(c.id); }
      const [r] = await d.insert(S.studioFatture).values({ ...v, pagataIl: v.pagataIl ?? null }).returning({ id: S.studioFatture.id });
      return r.id;
    }
    case "fattura.rinnova": {
      // stessa fattura (cliente, servizio, importo) con la data di oggi: per il rinnovo del mese
      const [f] = await d.select().from(S.studioFatture).where(eq(S.studioFatture.id, id(c.id))).limit(1);
      if (!f) throw new Errore("Fattura non trovata.");
      const m = oggi.slice(0, 7);
      if (f.servizioId) {
        const [gia] = await d.select({ id: S.studioFatture.id }).from(S.studioFatture).where(and(eq(S.studioFatture.servizioId, f.servizioId), eq(S.studioFatture.mese, m))).limit(1);
        if (gia) return gia.id;
      }
      const modello = await leggiModello();
      // se la descrizione finiva con il mese ("Gestione social, 10/2026" o "…, ottobre 2026") lo porta a quello di oggi
      const descr = f.descrizione.replace(/,?\s*((0?[1-9]|1[0-2])\/\d{4}|(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(\s+\d{4})?)\s*$/i, "").trim();
      const nomeMese = `${m.slice(5)}/${m.slice(0, 4)}`;
      const [r] = await d.insert(S.studioFatture).values({
        clienteId: f.clienteId, servizioId: f.servizioId, mese: f.servizioId ? m : null, descrizione: `${descr}, ${nomeMese}`.slice(0, 160), importo: f.importo,
        emessaIl: oggi, scadenza: aggiungiGiorni(oggi, modello.giorniScadenza || 15),
      }).returning({ id: S.studioFatture.id });
      return r.id;
    }
    case "fattura.modello": {
      const m = c.modello && typeof c.modello === "object" ? (c.modello as Record<string, unknown>) : {};
      const testi = pulisciOggetto(m, ["intestazione", "titolare", "indirizzo", "piva", "cf", "email", "telefono", "sito", "iban", "intestatarioConto", "nota"]);
      const valore = JSON.stringify({
        ...MODELLO_VUOTO, ...testi,
        regime: m.regime === "ordinario" ? "ordinario" : "forfettario",
        aliquota: Math.min(100, Math.max(0, Number(m.aliquota) || 22)),
        bolloACliente: m.bolloACliente !== false,
        giorniScadenza: Math.min(365, Math.max(0, Math.round(Number(m.giorniScadenza) || 15))),
      });
      await d.insert(S.settings).values({ sito: SITO_IMPOSTAZIONI, chiave: "fattura_modello", valore, aggiornatoIl: new Date() }).onConflictDoUpdate({ target: [S.settings.sito, S.settings.chiave], set: { valore, aggiornatoIl: new Date() } });
      return;
    }
    case "fattura.paga": {
      await d.update(S.studioFatture).set({ pagataIl: c.pagata === false ? null : c.pagataIl ? data(c.pagataIl, "Data incasso") : oggi }).where(eq(S.studioFatture.id, id(c.id)));
      return;
    }
    case "fattura.elimina": {
      await d.delete(S.studioFatture).where(eq(S.studioFatture.id, id(c.id)));
      return;
    }
    case "fatture.genera": {
      // una fattura per ogni servizio mensile attivo nel mese, se non c'è già
      const m = mese(c.mese || oggi.slice(0, 7));
      const [servizi, clienti] = await Promise.all([d.select().from(S.studioServizi), d.select().from(S.studioClienti)]);
      const attivi = new Set(clienti.filter((x) => x.attivo).map((x) => x.id));
      const righe = servizi
        .filter((s) => attivi.has(s.clienteId) && servizioAttivoNelMese({ ...s, importo: num(s.importo), ricorrenza: s.ricorrenza as Ricorrenza }, m))
        .map((s) => ({ clienteId: s.clienteId, servizioId: s.id, mese: m, descrizione: `${s.nome}, ${m.slice(5)}/${m.slice(0, 4)}`, importo: s.importo, emessaIl: m === oggi.slice(0, 7) ? oggi : m + "-01", scadenza: fineMese(m) }));
      if (righe.length) await d.insert(S.studioFatture).values(righe).onConflictDoNothing();
      return;
    }
    case "campagna.salva": {
      const v = {
        clienteId: await clienteEsiste(id(c.clienteId, "cliente")),
        mese: mese(c.mese),
        canale: (CANALI as readonly string[]).includes(String(c.canale)) ? String(c.canale) : "Altro",
        spesa: String(importo(c.spesa, "Spesa", true)),
        contatti: Math.max(0, Math.min(1_000_000, Math.round(Number(c.contatti) || 0))),
        ricavo: c.ricavo === null || c.ricavo === undefined || c.ricavo === "" ? null : String(importo(c.ricavo, "Fatturato generato", true)),
      };
      await d.insert(S.studioCampagne).values(v).onConflictDoUpdate({ target: [S.studioCampagne.clienteId, S.studioCampagne.mese, S.studioCampagne.canale], set: { spesa: v.spesa, contatti: v.contatti, ricavo: v.ricavo } });
      return;
    }
    case "campagna.elimina": {
      await d.delete(S.studioCampagne).where(eq(S.studioCampagne.id, id(c.id)));
      return;
    }
    case "lavoro.crea": {
      const brief = testo(c.brief, "cosa serve", 6000);
      const titolo = testo(c.titolo, "titolo", 120, false) || brief.split(/[\n.!?]/)[0].slice(0, 90);
      const agente = typeof c.agente === "string" && AGENTE[c.agente] && c.agente !== "auto" ? c.agente : scegliAgente(`${titolo} ${brief}`);
      const [r] = await d.insert(S.studioLavori).values({ agente, clienteId: c.clienteId ? await clienteEsiste(id(c.clienteId)) : null, titolo, brief, stato: "in_coda", scadenza: c.scadenza ? data(c.scadenza, "Scadenza") : null }).returning({ id: S.studioLavori.id });
      return r.id;
    }
    case "lavoro.modifica": {
      const v: Partial<typeof S.studioLavori.$inferInsert> = { aggiornatoIl: new Date() };
      if ("scadenza" in c) v.scadenza = c.scadenza ? data(c.scadenza, "Scadenza") : null;
      if (typeof c.agente === "string" && AGENTE[c.agente]) v.agente = c.agente;
      if (typeof c.titolo === "string" && c.titolo.trim()) v.titolo = testo(c.titolo, "titolo", 120);
      await d.update(S.studioLavori).set(v).where(eq(S.studioLavori.id, id(c.id)));
      return;
    }
    case "mese.prepara": {
      // i lavori standard del mese per un cliente, dai suoi servizi attivi; rifarlo non crea doppioni
      const n = await clienteEsiste(id(c.clienteId, "cliente"));
      const m = c.mese ? mese(c.mese) : oggi.slice(0, 7);
      const [cl] = await d.select().from(S.studioClienti).where(eq(S.studioClienti.id, n)).limit(1);
      const servizi = (await d.select().from(S.studioServizi).where(eq(S.studioServizi.clienteId, n))).map((x) => ({ ...x, importo: num(x.importo), ricorrenza: x.ricorrenza as Ricorrenza }));
      const piano = pianoDelMese({ ...cl, sito: cl.sito, fatturazione: leggiJson<DatiFatturazione>(cl.fatturazione, {}) }, servizi, m, oggi);
      const creati = await d.insert(S.studioLavori).values(piano.map((p) => ({ agente: p.agente, clienteId: n, titolo: p.titolo, brief: p.brief, stato: "in_coda", scadenza: p.scadenza, chiave: p.chiave }))).onConflictDoNothing().returning({ id: S.studioLavori.id });
      return creati.length;
    }
    case "lavoro.stato": {
      const stato = String(c.stato) as StatoLavoro;
      if (!["in_coda", "in_lavorazione", "da_guardare", "fatto"].includes(stato)) throw new Errore("Stato non valido.");
      const v: Partial<typeof S.studioLavori.$inferInsert> = { stato, aggiornatoIl: new Date() };
      if (typeof c.risultato === "string") v.risultato = c.risultato.trim().slice(0, 40_000) || null;
      if (typeof c.revisione === "string") v.revisione = c.revisione.trim().slice(0, 4000) || null;
      await d.update(S.studioLavori).set(v).where(eq(S.studioLavori.id, id(c.id)));
      return;
    }
    case "lavoro.elimina": {
      await d.delete(S.studioLavori).where(eq(S.studioLavori.id, id(c.id)));
      return;
    }
    case "lavori.svuota": {
      await d.delete(S.studioLavori).where(inArray(S.studioLavori.stato, ["fatto"]));
      return;
    }
    case "regola.salva": {
      const [r] = await d.insert(S.studioRegole).values({ testo: testo(c.testo, "regola", 600), agente: typeof c.agente === "string" && AGENTE[c.agente] ? c.agente : null }).returning({ id: S.studioRegole.id });
      return r.id;
    }
    case "regola.elimina": {
      await d.delete(S.studioRegole).where(eq(S.studioRegole.id, id(c.id)));
      return;
    }
    case "tv.salva": {
      const tipo = c.tipo_tv;
      if (tipo === "gioco") { await d.delete(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "tv"))); return; }
      let valore: string;
      if (tipo === "immagine") {
        const img = typeof c.dato === "string" ? c.dato : "";
        if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(img)) throw new Errore("Immagine non valida: usa una foto JPG, PNG o WebP.");
        if (img.length > 3_000_000) throw new Errore("Immagine troppo grande.");
        valore = JSON.stringify({ tipo, dato: img });
      } else if (tipo === "video") {
        const url = typeof c.dato === "string" ? c.dato.trim() : "";
        if (!/^https:\/\/\S+$/i.test(url) || url.length > 1000) throw new Errore("Serve un link che inizia con https://");
        valore = JSON.stringify({ tipo, src: url });
      } else throw new Errore("Scegli cosa mostrare sulla TV.");
      await d.insert(S.settings).values({ sito: SITO_IMPOSTAZIONI, chiave: "tv", valore, aggiornatoIl: new Date() }).onConflictDoUpdate({ target: [S.settings.sito, S.settings.chiave], set: { valore, aggiornatoIl: new Date() } });
      return;
    }
    case "obiettivo.salva": {
      const valore = String(importo(c.valore, "Obiettivo", true));
      await d.insert(S.settings).values({ sito: SITO_IMPOSTAZIONI, chiave: "obiettivo_mese", valore, aggiornatoIl: new Date() }).onConflictDoUpdate({ target: [S.settings.sito, S.settings.chiave], set: { valore, aggiornatoIl: new Date() } });
      return;
    }
    default:
      throw new Errore("Azione sconosciuta.");
  }
}

/** La TV: nei dati va solo cosa mostrare; l'immagine vera la serve /api/studio/tv. */
function leggiTv(r: { valore: string; quando: Date } | undefined): SchermoTv {
  if (!r) return { tipo: "gioco" };
  try {
    const v = JSON.parse(r.valore) as { tipo?: string; src?: string };
    if (v.tipo === "immagine") return { tipo: "immagine", versione: String(r.quando.getTime()) };
    if (v.tipo === "video" && typeof v.src === "string") return { tipo: "video", src: v.src };
  } catch { /* valore rovinato: si torna al gioco */ }
  return { tipo: "gioco" };
}

/** L'immagine caricata per la TV, come data URL; null se non c'è. */
export async function immagineTv(): Promise<string | null> {
  await tabelle();
  const d = await db();
  const [r] = await d.select({ valore: S.settings.valore }).from(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "tv"))).limit(1);
  if (!r) return null;
  try { const v = JSON.parse(r.valore) as { tipo?: string; dato?: string }; return v.tipo === "immagine" && v.dato ? v.dato : null; } catch { return null; }
}
