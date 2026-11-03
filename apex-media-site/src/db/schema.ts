import { boolean, index, numeric, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
