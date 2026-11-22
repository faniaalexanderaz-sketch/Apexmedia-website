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
  await seminaStudioDemo(db);
}

/* -------------------------------------------------------------
   Studio Apex in demo: tre clienti con importi DI ESEMPIO (non sono
   i compensi veri), sei mesi di fatture, qualche lavoro degli agenti.
   ------------------------------------------------------------- */
async function seminaStudioDemo(db: PgDatabase<PgQueryResultHKT, typeof schema>): Promise<void> {
  const oggi = new Date();
  const giorno = (d: Date) => d.toISOString().slice(0, 10);
  const meseDa = (indietro: number) => new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - indietro, 1));
  const m = (indietro: number) => meseDa(indietro).toISOString().slice(0, 7);
  const fine = (indietro: number) => giorno(new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - indietro + 1, 0)));

  const clienti = await db.insert(schema.studioClienti).values([
    { nome: "Bagnarino Coworking", settore: "Coworking, Alessandria", colore: "#2f6bff", note: "Tono diretto, niente inglesismi. Obiettivo: prenotazioni delle scrivanie." },
    { nome: "Essenza d'Oriente", settore: "Centro olistico e massaggi", colore: "#17b26a", sito: SITO, note: "Spingere i trattamenti di coppia nei fine settimana." },
    { nome: "Antica Fioreria del Centro", settore: "Composizioni floreali, e-commerce", colore: "#d6409f", note: "Bottega dal 1953. Obiettivo: ordini online con spedizione." },
  ]).returning({ id: schema.studioClienti.id });
  const [bagnarino, essenza, fioreria] = clienti.map((c) => c.id);

  const servizi = await db.insert(schema.studioServizi).values([
    { clienteId: bagnarino, nome: "Gestione social", importo: "350", ricorrenza: "mensile", dal: m(5) + "-01" },
    { clienteId: bagnarino, nome: "Manutenzione sito", importo: "60", ricorrenza: "mensile", dal: m(3) + "-01" },
    { clienteId: essenza, nome: "Google Ads", importo: "250", ricorrenza: "mensile", dal: m(5) + "-01" },
    { clienteId: essenza, nome: "Gestione social", importo: "300", ricorrenza: "mensile", dal: m(2) + "-01" },
    { clienteId: fioreria, nome: "Gestione social", importo: "400", ricorrenza: "mensile", dal: m(4) + "-01" },
    { clienteId: fioreria, nome: "Meta Ads", importo: "200", ricorrenza: "mensile", dal: m(1) + "-01" },
  ]).returning({ id: schema.studioServizi.id, clienteId: schema.studioServizi.clienteId, nome: schema.studioServizi.nome, importo: schema.studioServizi.importo, dal: schema.studioServizi.dal });

  const fatture: (typeof schema.studioFatture.$inferInsert)[] = [];
  for (let i = 5; i >= 0; i--) {
    for (const s of servizi) {
      if (s.dal.slice(0, 7) > m(i)) continue;
      // mesi passati: pagate entro il 12 del mese dopo; mese in corso: una pagata, le altre da incassare; una del mese scorso è scaduta
      const scadutaDemo = i === 1 && s.clienteId === fioreria && s.nome === "Gestione social";
      const pagata = i > 1 || (i === 1 && !scadutaDemo) || (i === 0 && s.clienteId === bagnarino && oggi.getUTCDate() > 3);
      const incasso = i === 0 ? giorno(new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth(), Math.max(1, oggi.getUTCDate() - 2)))) : giorno(new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - i + 1, 4 + ((s.id * 3) % 9))));
      fatture.push({ clienteId: s.clienteId, servizioId: s.id, mese: m(i), descrizione: `${s.nome}, ${m(i).slice(5)}/${m(i).slice(0, 4)}`, importo: s.importo, emessaIl: m(i) + "-01", scadenza: fine(i), pagataIl: pagata ? (incasso > giorno(oggi) ? giorno(oggi) : incasso) : null });
    }
  }
  fatture.push({ clienteId: fioreria, descrizione: "Shooting foto catalogo di Natale", importo: "480", emessaIl: m(1) + "-10", scadenza: m(1) + "-25", pagataIl: m(1) + "-22" });
  fatture.push({ clienteId: bagnarino, descrizione: "Sito con prenotazione online", importo: "1800", emessaIl: m(4) + "-05", scadenza: m(4) + "-20", pagataIl: m(4) + "-18" });
  await db.insert(schema.studioFatture).values(fatture);

  await db.insert(schema.studioCampagne).values([
    { clienteId: fioreria, mese: m(1), canale: "Meta Ads", spesa: "180", contatti: 41, ricavo: "920" },
    { clienteId: fioreria, mese: m(0), canale: "Meta Ads", spesa: "150", contatti: 38, ricavo: "1040" },
    { clienteId: bagnarino, mese: m(2), canale: "Meta Ads", spesa: "90", contatti: 14, ricavo: null },
    { clienteId: bagnarino, mese: m(1), canale: "Meta Ads", spesa: "120", contatti: 23, ricavo: null },
    { clienteId: bagnarino, mese: m(0), canale: "Meta Ads", spesa: "110", contatti: 27, ricavo: null },
  ]);

  const min = (n: number) => new Date(Date.now() - n * 60_000);
  await db.insert(schema.studioLavori).values([
    { agente: "giulia", clienteId: bagnarino, titolo: "Reel: perché lavorare in coworking", brief: "Reel per Bagnarino: perché lavorare in coworking invece che da casa. 30 secondi, gira il titolare.", stato: "da_guardare", creatoIl: min(95), aggiornatoIl: min(42), risultato: "GANCI\n1. «Lavori da casa e a mezzogiorno sei ancora in pigiama?»\n2. «Tre cose che a casa non hai e qui sì.»\n3. «Ho smesso di lavorare dal divano. Ecco cosa è cambiato.»\n\nSCRIPT (gancio 1)\nLavori da casa e a mezzogiorno sei ancora in pigiama?\nSuccede a tutti. A casa c'è il frigo, il divano, la lavatrice che suona.\nQui a Bagnarino entri, ti siedi, lavori.\nWifi veloce, caffè incluso, e alle sei chiudi il portatile e hai finito davvero.\nLa prima giornata è in prova: prenotala dal link in bio.\n\nTESTO A SCHERMO\n0-2s  A mezzogiorno ancora in pigiama?\n2-10s Casa = distrazioni\n10-22s Bagnarino: entri, ti siedi, lavori\n22-30s Prima giornata in prova → link in bio\n\nDati di esempio." },
    { agente: "davide", clienteId: essenza, titolo: "Campagna Google: massaggi di coppia", brief: "Campagna Google per Essenza d'Oriente sui massaggi di coppia, 10 € al giorno.", stato: "da_guardare", creatoIl: min(300), aggiornatoIl: min(180), risultato: "STRUTTURA\nCampagna: Ricerca, Alessandria + 15 km\nGruppo 1: massaggio di coppia (corrispondenza a frase)\nGruppo 2: regalo massaggio\n\nANNUNCIO A\nTitolo 1: Massaggio di Coppia Alessandria\nTitolo 2: Prenota Online in 1 Minuto\nDescrizione: Un'ora insieme nella stessa sala. Scegli giorno e ora dal sito.\n\nBUDGET\n10 € al giorno. Fermare se il costo per contatto supera 6 € dopo 7 giorni.\n\nDati di esempio." },
    { agente: "chiara", clienteId: fioreria, titolo: "Caption: composizioni di Natale", brief: "Caption per il reel della Fioreria sulle composizioni di Natale.", stato: "in_coda", creatoIl: min(25), aggiornatoIl: min(25) },
    { agente: "sofia", clienteId: fioreria, titolo: "Piano editoriale di dicembre", brief: "Piano della settimana per la Fioreria: obiettivo ordini online per Natale.", stato: "in_coda", creatoIl: min(20), aggiornatoIl: min(20) },
    { agente: "luca", clienteId: essenza, titolo: "Carosello: 5 segnali che ti serve un massaggio", brief: "Carosello per Essenza d'Oriente: 5 segnali che ti serve un massaggio decontratturante.", stato: "fatto", creatoIl: min(3000), aggiornatoIl: min(2800), risultato: "Slide 1: «5 segnali che il tuo collo ti sta chiedendo aiuto»\n… Dati di esempio." },
    { agente: "simone", clienteId: bagnarino, titolo: "DM a chi commenta INFO", brief: "Chi commenta «INFO» sotto il reel di Bagnarino: cosa gli scriviamo in privato?", stato: "fatto", creatoIl: min(6000), aggiornatoIl: min(5800), risultato: "Primo messaggio: «Ciao! Ti mando subito i prezzi delle scrivanie. Ti serve per qualche giorno o tutto il mese?»\n… Dati di esempio." },
  ]);

  await db.insert(schema.studioRegole).values([
    { testo: "Mai lineette lunghe e mai frasi tipo «non è solo X, è Y»." },
    { testo: "Ogni contenuto chiude con una sola richiesta: prenota, scrivi o ordina." },
    { testo: "Parliamo ad attività locali di Alessandria: esempi concreti, niente inglesismi." },
    { testo: "Negli annunci Google metti sempre la città nel primo titolo.", agente: "davide" },
  ]);
  await db.insert(schema.settings).values({ sito: "studio", chiave: "obiettivo_mese", valore: "2000" });
}
