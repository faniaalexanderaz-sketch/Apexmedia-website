import { createHash } from "node:crypto";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/* =============================================================
   Dati demo: 12 mesi di click, prenotazioni (anche Treatwell con
   cliente anonimo), spesa Ads, una nota e la commissione. Servono
   quando non c'è ancora un database collegato. Generazione
   deterministica: stessi numeri a ogni avvio.
   ============================================================= */

const SITO = "essenzadoriente.it";
const TRATT: [string, number][] = [["Massaggio Oli Essenziali", 60], ["Tuina Shiatsu", 50], ["Riflessologia Plantare", 35], ["Massaggio Spa", 90], ["Coppettazione", 25], ["Gua Sha", 25], ["Pulizia delle Orecchie", 25], ["Pedicure", 35]];

export async function seminaDemo(db: PgDatabase<PgQueryResultHKT, typeof schema>): Promise<void> {
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const clienti = Array.from({ length: 60 }, (_, i) => createHash("sha256").update("eo-cliente:cliente " + i).digest("hex").slice(0, 24));
  const oggi = new Date();
  const visti = new Set<string>();
  const click: (typeof schema.clicks.$inferInsert)[] = [];
  const pren: (typeof schema.bookings.$inferInsert)[] = [];
  const spese: (typeof schema.monthlyAdspend.$inferInsert)[] = [];
  const dedup = new Set<string>();

  for (let m = 11; m >= 0; m--) {
    const base = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - m, 1));
    const mese = base.toISOString().slice(0, 7);
    const giorniMese = m === 0 ? Math.max(1, oggi.getUTCDate()) : new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
    const crescita = 1 + (11 - m) * 0.08;
    for (let g = 1; g <= giorniMese; g++) {
      const data = `${mese}-${String(g).padStart(2, "0")}`;
      const nc = Math.round((2 + rnd() * 5) * crescita);
      for (let i = 0; i < nc; i++) {
        const r = rnd();
        const [sorgente, gclid, utm] = r < 0.5 ? ["google_ads", true, null] : r < 0.7 ? ["instagram", false, "instagram"] : r < 0.95 ? ["organico", false, null] : ["altro", false, "newsletter"];
        const azione = rnd() < 0.45 ? "prenota" : rnd() < 0.7 ? "whatsapp" : "telefono";
        const ora = `${String(Math.floor(9 + rnd() * 13)).padStart(2, "0")}:${String(Math.floor(rnd() * 60)).padStart(2, "0")}:00+01:00`;
        click.push({ creatoIl: new Date(`${data}T${ora}`), sito: SITO, azione, pagina: rnd() < 0.6 ? "/" : "/trattamenti/" + TRATT[Math.floor(rnd() * 8)][0].toLowerCase().replace(/ /g, "-") + ".html", utmSource: utm, utmMedium: utm ? "social" : null, gclid: gclid as boolean, sorgente: sorgente as string, dispositivo: rnd() < 0.7 ? "mobile" : "desktop" });
      }
      const np = Math.round((0.8 + rnd() * 2.2) * crescita);
      for (let i = 0; i < np; i++) {
        const [tr, prezzo] = TRATT[Math.floor(rnd() * 8)];
        const r = rnd();
        const canale = r < 0.55 ? "treatwell" : r < 0.75 ? "telefono" : r < 0.9 ? "whatsapp" : "walk-in";
        let clienteHash: string | null = null, nuovoCliente: boolean | null = null, dedupKey: string | null = null;
        if (canale === "treatwell") {
          clienteHash = clienti[Math.floor(rnd() * clienti.length)];
          nuovoCliente = !visti.has(clienteHash); visti.add(clienteHash);
          dedupKey = createHash("sha256").update([data, tr.toLowerCase(), prezzo, clienteHash].join("|")).digest("hex").slice(0, 32);
          if (dedup.has(dedupKey)) continue;
          dedup.add(dedupKey);
        }
        pren.push({ sito: SITO, data, trattamento: tr, canale, importo: prezzo.toFixed(2), note: null, clienteHash, nuovoCliente, dedupKey });
      }
    }
    spese.push({ sito: SITO, mese, importo: String(Math.round(220 + rnd() * 120)) });
  }

  for (let i = 0; i < click.length; i += 500) await db.insert(schema.clicks).values(click.slice(i, i + 500));
  for (let i = 0; i < pren.length; i += 500) await db.insert(schema.bookings).values(pren.slice(i, i + 500));
  await db.insert(schema.monthlyAdspend).values(spese);
  const prec = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
  await db.insert(schema.monthlyNotes).values({ sito: SITO, mese: prec, it: "Dati di esempio. Il mese scorso è andato bene: prenotazioni in crescita, trainate da Google Ads, e costo per contatto in calo. Per il mese in corso proponiamo di spingere la riflessologia plantare, che ha il miglior ritorno.", zh: "示例数据。上个月表现不错：预约增长，主要来自 Google 广告，每次联系成本下降。本月建议重点推广足底反射疗法，它的回报最好。" });
  await db.insert(schema.settings).values({ sito: SITO, chiave: "treatwell_commissione", valore: "20" });
}
