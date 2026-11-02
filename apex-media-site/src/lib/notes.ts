import { elencaBlob, leggiJson, scriviJson } from "@/lib/blob-store";

/* =============================================================
   Note mensili: commento dell'admin sull'andamento, in italiano e
   cinese, visibile al cliente. Un blob per mese: notes/<sito>/<YYYY-MM>.json
   ============================================================= */

export type NotaMensile = { sito: string; mese: string; it: string; zh: string; aggiornato_il: string };
const PREFISSO = "notes/";
const MESE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function elencaNote(sito: string): Promise<NotaMensile[]> {
  const blobs = await elencaBlob(`${PREFISSO}${sito}/`);
  const note = await Promise.all(blobs.map((b) => leggiJson<NotaMensile>(b.pathname)));
  return note.filter((n): n is NotaMensile => !!n && MESE_RE.test(n.mese)).sort((a, b) => (a.mese < b.mese ? 1 : -1));
}

export async function salvaNota(sito: string, mese: string, it: string, zh: string): Promise<NotaMensile | string> {
  if (!MESE_RE.test(mese)) return "mese";
  const nota: NotaMensile = { sito, mese, it: it.trim().slice(0, 2000), zh: zh.trim().slice(0, 2000), aggiornato_il: new Date().toISOString() };
  await scriviJson(`${PREFISSO}${sito}/${mese}.json`, nota);
  return nota;
}
