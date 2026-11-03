import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/* File CSV Treatwell in attesa di conferma: salvato per pochi minuti in
   una cartella temporanea del server, identificato da un token casuale.
   Serve solo per l'anteprima → conferma; poi viene cancellato. */

const DIR = path.join(tmpdir(), "apex-treatwell");
const TTL_MS = 15 * 60_000;

export async function salvaFileTemporaneo(testo: string): Promise<string> {
  await mkdir(DIR, { recursive: true });
  const token = randomBytes(12).toString("hex");
  await writeFile(path.join(DIR, token + ".csv"), JSON.stringify({ t: Date.now(), testo }), "utf8");
  return token;
}

export async function leggiFileTemporaneo(token: string): Promise<string | null> {
  if (!/^[a-f0-9]{24}$/.test(token)) return null;
  try {
    const { t, testo } = JSON.parse(await readFile(path.join(DIR, token + ".csv"), "utf8")) as { t: number; testo: string };
    if (Date.now() - t > TTL_MS) return null;
    return testo;
  } catch {
    return null;
  }
}

export async function cancellaFileTemporaneo(token: string): Promise<void> {
  if (!/^[a-f0-9]{24}$/.test(token)) return;
  await unlink(path.join(DIR, token + ".csv")).catch(() => {});
}

export const impronta = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 10);
