import { Errore } from "./dati";

/* =============================================================
   Ripiego gratuito: se manca ANTHROPIC_API_KEY ma c'è GEMINI_API_KEY,
   gli agenti scrivono con Gemini di Google (piano gratuito di AI
   Studio). Il modello si sceglie da solo tra i "flash" disponibili
   per la chiave; si può forzare con GEMINI_MODEL. Se il limite
   gratuito di un modello è finito, prova con il fratello "lite".
   ============================================================= */

const BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";

export const geminiCollegato = () => Boolean(process.env.GEMINI_API_KEY);

let elenco: { quando: number; modelli: string[] } | null = null;

type Modello = { name: string; supportedGenerationMethods?: string[] };

/** I modelli "flash" che la chiave può usare, dal migliore al più leggero. */
async function modelli(chiave: string): Promise<string[]> {
  if (process.env.GEMINI_MODEL) return [process.env.GEMINI_MODEL, ...(process.env.GEMINI_MODEL.includes("lite") ? [] : [`${process.env.GEMINI_MODEL}-lite`])];
  if (elenco && Date.now() - elenco.quando < 6 * 3600_000) return elenco.modelli;
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": chiave } });
  if (r.status === 400 || r.status === 401 || r.status === 403) throw new Errore("La chiave GEMINI_API_KEY non è valida.");
  if (!r.ok) throw new Errore(`Gemini non risponde (${r.status}). Riprova.`);
  const j = (await r.json()) as { models?: Modello[] };
  const nomi = (j.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((n) => /^gemini-[\d.]+-flash(-lite)?(-latest)?$/.test(n) || n === "gemini-flash-latest" || n === "gemini-flash-lite-latest");
  // versione più alta prima, a pari versione flash prima di lite
  const versione = (n: string) => Number(n.match(/gemini-([\d.]+)/)?.[1] ?? 99);
  nomi.sort((a, b) => versione(b) - versione(a) || Number(a.includes("lite")) - Number(b.includes("lite")));
  const scelti = nomi.length ? nomi : ["gemini-flash-latest", "gemini-flash-lite-latest"];
  elenco = { quando: Date.now(), modelli: scelti };
  return scelti;
}

type Risposta = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string }; error?: { message?: string } };

export async function scriviConGemini(system: string, richiesta: string, nome: string): Promise<{ testo: string; tronco: boolean }> {
  const chiave = process.env.GEMINI_API_KEY;
  if (!chiave) throw new Errore("Manca GEMINI_API_KEY.");
  let ultimo = "";
  for (const m of (await modelli(chiave)).slice(0, 4)) {
    const r = await fetch(`${BASE}/models/${m}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": chiave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: richiesta }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
      }),
    });
    if (r.status === 429 || r.status === 404 || r.status === 503) { ultimo = `${m}: ${r.status}`; continue; }
    if (r.status === 400 || r.status === 401 || r.status === 403) {
      const j = (await r.json().catch(() => ({}))) as Risposta;
      if (/api key/i.test(j.error?.message ?? "")) throw new Errore("La chiave GEMINI_API_KEY non è valida.");
      console.error("[studio] gemini", r.status, j.error?.message);
      throw new Errore(`Gemini ha rifiutato la richiesta (${r.status}). Prova a riformularla.`);
    }
    if (!r.ok) { ultimo = `${m}: ${r.status}`; continue; }
    const j = (await r.json()) as Risposta;
    if (j.promptFeedback?.blockReason) throw new Errore(`${nome} non può occuparsi di questa richiesta. Prova a riformularla.`);
    const c = j.candidates?.[0];
    const testo = (c?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
    if (!testo) throw new Errore(`${nome} non ha prodotto nulla. Riprova.`);
    return { testo, tronco: c?.finishReason === "MAX_TOKENS" };
  }
  console.error("[studio] gemini esaurito", ultimo);
  throw new Errore("Per oggi il limite gratuito di Gemini è finito (o è occupato). Riprova più tardi o collega la chiave Claude.");
}
