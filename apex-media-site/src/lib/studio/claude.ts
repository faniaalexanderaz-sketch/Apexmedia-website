import Anthropic from "@anthropic-ai/sdk";
import { and, eq, isNull, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { AGENTE } from "./agenti";
import { Errore } from "./dati";
import { geminiCollegato, scriviConGemini } from "./gemini";
import { regoleFisseTesto } from "./regole";

/* =============================================================
   Fa lavorare un agente su un lavoro: una chiamata a Claude con le
   istruzioni dell'agente, le regole del cervello condiviso e il
   contesto del cliente. Il risultato torna "da guardare".
   Serve ANTHROPIC_API_KEY; il modello si cambia con STUDIO_MODEL.
   ============================================================= */

const S = schema;
const MODELLO = process.env.STUDIO_MODEL || "claude-opus-5-5";

/** Claude se c'è la sua chiave, altrimenti Gemini (gratuito) se c'è quella di Google. */
export function aiCollegata(): boolean { return Boolean(process.env.ANTHROPIC_API_KEY) || geminiCollegato(); }

export async function faiLavorare(lavoroId: number): Promise<void> {
  if (!aiCollegata()) throw new Errore("Gli agenti non sono ancora collegati: manca ANTHROPIC_API_KEY (o GEMINI_API_KEY) nelle variabili di Vercel.");
  const d = await db();
  const [lavoro] = await d.select().from(S.studioLavori).where(eq(S.studioLavori.id, lavoroId)).limit(1);
  if (!lavoro) throw new Errore("Lavoro non trovato.");
  const agente = AGENTE[lavoro.agente];
  if (!agente) throw new Errore("Agente non trovato.");
  if (lavoro.stato === "in_lavorazione") throw new Errore(`${agente.nome} ci sta già lavorando.`);

  const [regole, cliente] = await Promise.all([
    d.select().from(S.studioRegole).where(or(isNull(S.studioRegole.agente), eq(S.studioRegole.agente, agente.id))),
    lavoro.clienteId ? d.select().from(S.studioClienti).where(eq(S.studioClienti.id, lavoro.clienteId)).limit(1) : Promise.resolve([]),
  ]);

  await d.update(S.studioLavori).set({ stato: "in_lavorazione", aggiornatoIl: new Date() }).where(eq(S.studioLavori.id, lavoroId));

  // Parte stabile in testa (istruzioni dell'agente), parte variabile in coda: regole, cliente, richiesta.
  const system = [
    `Ti chiami ${agente.nome}, ${agente.ruolo.toLowerCase()} di Apex Media.`,
    agente.istruzioni,
    regoleFisseTesto(),
    "Scrivi in italiano. Dopo la riga d'apertura per il titolare, consegna il lavoro finito, pronto da usare, senza altre premesse e senza chiedere conferme: se manca un'informazione fai l'ipotesi più ragionevole e dichiarala in una riga in fondo.",
    regole.length ? "Regole aggiunte dal titolare, da rispettare sempre:\n" + regole.map((r) => `- ${r.testo}`).join("\n") : "",
  ].filter(Boolean).join("\n\n");

  const c = cliente[0];
  const richiesta = [
    c ? `Cliente: ${c.nome}${c.settore ? ` (${c.settore})` : ""}.${c.note ? `\nNote sul cliente: ${c.note}` : ""}` : "",
    `Richiesta: ${lavoro.titolo}`,
    lavoro.brief && lavoro.brief !== lavoro.titolo ? lavoro.brief : "",
    lavoro.revisione && lavoro.risultato ? `Questa è la versione precedente:\n<versione_precedente>\n${lavoro.risultato}\n</versione_precedente>\n\nCorrezione richiesta: ${lavoro.revisione}\nRiscrivi il lavoro applicando la correzione.` : "",
  ].filter(Boolean).join("\n\n");

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      const g = await scriviConGemini(system, richiesta, agente.nome);
      const fine = g.tronco ? "\n\n[Risposta interrotta: chiedi di continuare o restringi la richiesta.]" : "";
      await d.update(S.studioLavori).set({ stato: "da_guardare", risultato: g.testo + fine, aggiornatoIl: new Date() }).where(and(eq(S.studioLavori.id, lavoroId), eq(S.studioLavori.stato, "in_lavorazione")));
      return;
    }
    const client = new Anthropic();
    const risposta = await client.beta.messages
      .stream({
        model: MODELLO,
        max_tokens: 16000,
        output_config: { effort: "high" },
        // se il modello declina per i filtri di sicurezza, l'API riprova da sola su un modello di riserva
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
        messages: [{ role: "user", content: richiesta }],
      })
      .finalMessage();

    if (risposta.stop_reason === "refusal") throw new Errore(`${agente.nome} non può occuparsi di questa richiesta. Prova a riformularla.`);
    const testo = risposta.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    if (!testo) throw new Errore(`${agente.nome} non ha prodotto nulla. Riprova.`);
    const tronco = risposta.stop_reason === "max_tokens" ? "\n\n[Risposta interrotta: chiedi di continuare o restringi la richiesta.]" : "";

    await d.update(S.studioLavori).set({ stato: "da_guardare", risultato: testo + tronco, aggiornatoIl: new Date() }).where(and(eq(S.studioLavori.id, lavoroId), eq(S.studioLavori.stato, "in_lavorazione")));
  } catch (e) {
    await d.update(S.studioLavori).set({ stato: "in_coda", aggiornatoIl: new Date() }).where(eq(S.studioLavori.id, lavoroId));
    if (e instanceof Errore) throw e;
    if (e instanceof Anthropic.AuthenticationError) throw new Errore("La chiave ANTHROPIC_API_KEY non è valida.");
    if (e instanceof Anthropic.RateLimitError) throw new Errore("Troppe richieste in questo momento. Riprova tra un minuto.");
    if (e instanceof Anthropic.APIError) { console.error("[studio] claude", e.status, e.message); throw new Errore(`Errore dal servizio AI (${e.status ?? "rete"}). Riprova.`); }
    throw e;
  }
}
