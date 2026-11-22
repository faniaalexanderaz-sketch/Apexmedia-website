import { boolean, index, integer, numeric, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/* =============================================================
   Schema Vercel Postgres (Drizzle). Si applica con `npm run db:push`.
   Nessun dato personale in nessuna tabella.
   ============================================================= */

/** Click sui bottoni di contatto dei siti clienti (whatsapp / telefono / prenota). */
export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
    sito: text("sito").notNull(),
    azione: text("azione").notNull(), // whatsapp | telefono | prenota
    pagina: text("pagina").notNull(),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    gclid: boolean("gclid").notNull().default(false), // solo presenza, mai il valore
    sorgente: text("sorgente").notNull(), // google_ads | instagram | organico | altro
    dispositivo: text("dispositivo").notNull(), // mobile | desktop
  },
  (t) => [index("clicks_sito_data_idx").on(t.sito, t.creatoIl)],
);

/** Prenotazioni registrate a mano o importate da CSV. */
export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
    sito: text("sito").notNull(),
    data: text("data").notNull(), // YYYY-MM-DD
    trattamento: text("trattamento").notNull(),
    canale: text("canale").notNull(), // treatwell | telefono | whatsapp | walk-in
    importo: numeric("importo", { precision: 10, scale: 2 }),
    note: text("note"),
    clienteHash: text("cliente_hash"), // hash del nome cliente (Treatwell), mai il nome
    nuovoCliente: boolean("nuovo_cliente"), // true = nuovo, false = di ritorno, null = ignoto
    dedupKey: text("dedup_key"), // sha256(data|trattamento|prezzo|cliente_hash) per evitare doppioni da CSV
  },
  (t) => [index("bookings_sito_data_idx").on(t.sito, t.data), uniqueIndex("bookings_dedup_uq").on(t.sito, t.dedupKey)],
);

/** Impostazioni per sito (es. commissione Treatwell in %). */
export const settings = pgTable(
  "settings",
  {
    id: serial("id").primaryKey(),
    sito: text("sito").notNull(),
    chiave: text("chiave").notNull(),
    valore: text("valore").notNull(),
    aggiornatoIl: timestamp("aggiornato_il", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("settings_sito_chiave_uq").on(t.sito, t.chiave)],
);

/** Nota mensile dell'admin, in italiano e cinese, visibile al cliente. */
export const monthlyNotes = pgTable(
  "monthly_notes",
  {
    id: serial("id").primaryKey(),
    sito: text("sito").notNull(),
    mese: text("mese").notNull(), // YYYY-MM
    it: text("it").notNull().default(""),
    zh: text("zh").notNull().default(""),
    aggiornatoIl: timestamp("aggiornato_il", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("monthly_notes_sito_mese_uq").on(t.sito, t.mese)],
);

/** Spesa pubblicitaria del mese (Google Ads e simili). */
export const monthlyAdspend = pgTable(
  "monthly_adspend",
  {
    id: serial("id").primaryKey(),
    sito: text("sito").notNull(),
    mese: text("mese").notNull(), // YYYY-MM
    importo: numeric("importo", { precision: 10, scale: 2 }).notNull(),
    aggiornatoIl: timestamp("aggiornato_il", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("monthly_adspend_sito_mese_uq").on(t.sito, t.mese)],
);

export type ClickRiga = typeof clicks.$inferSelect;
export type BookingRiga = typeof bookings.$inferSelect;
export type NotaRiga = typeof monthlyNotes.$inferSelect;
export type AdspendRiga = typeof monthlyAdspend.$inferSelect;
export type SettingRiga = typeof settings.$inferSelect;

/* =============================================================
   Studio Apex (/studio): clienti, servizi, fatture, campagne,
   lavori degli agenti e regole del cervello condiviso.
   Le tabelle si creano da sole al primo accesso (src/db/studio-ddl.ts).
   ============================================================= */

export const studioClienti = pgTable("studio_clienti", {
  id: serial("id").primaryKey(),
  creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
  nome: text("nome").notNull(),
  settore: text("settore").notNull().default(""),
  colore: text("colore").notNull().default("#5b2eff"),
  sito: text("sito"), // dominio tracciato da /api/track, facoltativo
  attivo: boolean("attivo").notNull().default(true),
  note: text("note").notNull().default(""),
});

export const studioServizi = pgTable(
  "studio_servizi",
  {
    id: serial("id").primaryKey(),
    creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
    clienteId: integer("cliente_id").notNull(),
    nome: text("nome").notNull(),
    importo: numeric("importo", { precision: 10, scale: 2 }).notNull(),
    ricorrenza: text("ricorrenza").notNull().default("mensile"), // mensile | una_tantum
    dal: text("dal").notNull(), // YYYY-MM-DD
    al: text("al"), // YYYY-MM-DD, null = ancora attivo
  },
  (t) => [index("studio_servizi_cliente_idx").on(t.clienteId)],
);

export const studioFatture = pgTable(
  "studio_fatture",
  {
    id: serial("id").primaryKey(),
    creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
    clienteId: integer("cliente_id").notNull(),
    servizioId: integer("servizio_id"),
    mese: text("mese"), // YYYY-MM di competenza, per le fatture generate dai servizi
    descrizione: text("descrizione").notNull(),
    importo: numeric("importo", { precision: 10, scale: 2 }).notNull(),
    emessaIl: text("emessa_il").notNull(), // YYYY-MM-DD
    scadenza: text("scadenza").notNull(), // YYYY-MM-DD
    pagataIl: text("pagata_il"), // YYYY-MM-DD, null = da incassare
  },
  (t) => [index("studio_fatture_cliente_idx").on(t.clienteId), uniqueIndex("studio_fatture_servizio_mese_uq").on(t.servizioId, t.mese)],
);

export const studioCampagne = pgTable(
  "studio_campagne",
  {
    id: serial("id").primaryKey(),
    clienteId: integer("cliente_id").notNull(),
    mese: text("mese").notNull(), // YYYY-MM
    canale: text("canale").notNull(), // Google Ads | Meta Ads | TikTok Ads | Altro
    spesa: numeric("spesa", { precision: 10, scale: 2 }).notNull(),
    contatti: integer("contatti").notNull().default(0),
    ricavo: numeric("ricavo", { precision: 10, scale: 2 }), // fatturato generato per il cliente, se noto
  },
  (t) => [uniqueIndex("studio_campagne_uq").on(t.clienteId, t.mese, t.canale)],
);

export const studioLavori = pgTable(
  "studio_lavori",
  {
    id: serial("id").primaryKey(),
    creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
    aggiornatoIl: timestamp("aggiornato_il", { withTimezone: true }).notNull().defaultNow(),
    agente: text("agente").notNull(),
    clienteId: integer("cliente_id"),
    titolo: text("titolo").notNull(),
    brief: text("brief").notNull().default(""),
    stato: text("stato").notNull().default("in_coda"), // in_coda | in_lavorazione | da_guardare | fatto
    risultato: text("risultato"),
    revisione: text("revisione"), // ultima correzione chiesta
    scadenza: text("scadenza"), // YYYY-MM-DD, facoltativa
    chiave: text("chiave"), // per i lavori creati da "Prepara il mese": evita i doppioni
  },
  (t) => [index("studio_lavori_stato_idx").on(t.stato), uniqueIndex("studio_lavori_chiave_uq").on(t.chiave)],
);

export const studioRegole = pgTable("studio_regole", {
  id: serial("id").primaryKey(),
  creatoIl: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
  testo: text("testo").notNull(),
  agente: text("agente"), // null = vale per tutti
});
