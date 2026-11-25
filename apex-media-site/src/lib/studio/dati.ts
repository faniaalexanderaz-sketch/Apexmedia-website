import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db, modalitaDemo, schema } from "@/db";
import { AGENTE, scegliAgente } from "./agenti";
import { pianoDelMese } from "./piano";
import { aggiungiGiorni, fineMese, mesePrima, servizioAttivoNelMese } from "./calcoli";
import { CANALI, type Campagna, type Dati, type Ricorrenza, type StatoLavoro } from "./tipi";

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

  const [clienti, servizi, fatture, campagne, lavori, regole, obiettivo] = await Promise.all([
    d.select().from(S.studioClienti).orderBy(asc(S.studioClienti.id)),
    d.select().from(S.studioServizi).orderBy(asc(S.studioServizi.id)),
    d.select().from(S.studioFatture).orderBy(desc(S.studioFatture.emessaIl), desc(S.studioFatture.id)),
    d.select().from(S.studioCampagne).orderBy(desc(S.studioCampagne.mese)),
    d.select().from(S.studioLavori).orderBy(desc(S.studioLavori.aggiornatoIl)).limit(300),
    d.select().from(S.studioRegole).orderBy(desc(S.studioRegole.id)),
    d.select().from(S.settings).where(and(eq(S.settings.sito, SITO_IMPOSTAZIONI), eq(S.settings.chiave, "obiettivo_mese"))).limit(1),
  ]);

  const manuali: Campagna[] = campagne.map((r) => ({ id: r.id, clienteId: r.clienteId, mese: r.mese, canale: r.canale, spesa: num(r.spesa), contatti: r.contatti, ricavo: r.ricavo === null ? null : num(r.ricavo) }));
  const auto = await campagneTracciate(clienti, oggi, manuali).catch((e) => { console.error("[studio] tracciamento", e); return []; });

  return {
    demo: modalitaDemo(),
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
    oggi, ora,
    obiettivoMese: num(obiettivo[0]?.valore),
    clienti: clienti.map((c) => ({ id: c.id, nome: c.nome, settore: c.settore, colore: c.colore, sito: c.sito, attivo: c.attivo, note: c.note })),
    servizi: servizi.map((s) => ({ id: s.id, clienteId: s.clienteId, nome: s.nome, importo: num(s.importo), ricorrenza: s.ricorrenza as Ricorrenza, dal: s.dal, al: s.al })),
    fatture: fatture.map((f) => ({ id: f.id, clienteId: f.clienteId, servizioId: f.servizioId, mese: f.mese, descrizione: f.descrizione, importo: num(f.importo), emessaIl: f.emessaIl, scadenza: f.scadenza, pagataIl: f.pagataIl })),
    campagne: [...manuali, ...auto],
    lavori: lavori.map((l) => ({ id: l.id, agente: l.agente, clienteId: l.clienteId, titolo: l.titolo, brief: l.brief, stato: l.stato as StatoLavoro, risultato: l.risultato, revisione: l.revisione, scadenza: l.scadenza, creatoIl: l.creatoIl.toISOString(), aggiornatoIl: l.aggiornatoIl.toISOString() })),
    regole: regole.map((r) => ({ id: r.id, testo: r.testo, agente: r.agente, creatoIl: r.creatoIl.toISOString() })),
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
      };
      if (c.id) { await d.update(S.studioFatture).set(v).where(eq(S.studioFatture.id, id(c.id))); return id(c.id); }
      const [r] = await d.insert(S.studioFatture).values({ ...v, pagataIl: v.pagataIl ?? null }).returning({ id: S.studioFatture.id });
      return r.id;
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
      const piano = pianoDelMese({ ...cl, sito: cl.sito }, servizi, m, oggi);
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
    case "obiettivo.salva": {
      const valore = String(importo(c.valore, "Obiettivo", true));
      await d.insert(S.settings).values({ sito: SITO_IMPOSTAZIONI, chiave: "obiettivo_mese", valore, aggiornatoIl: new Date() }).onConflictDoUpdate({ target: [S.settings.sito, S.settings.chiave], set: { valore, aggiornatoIl: new Date() } });
      return;
    }
    default:
      throw new Errore("Azione sconosciuta.");
  }
}
