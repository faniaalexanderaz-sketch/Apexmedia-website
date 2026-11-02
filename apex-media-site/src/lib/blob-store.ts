/* =============================================================
   Helper per Vercel Blob: tutto lo storage del pannello passa da qui.
   Solo lato server.
   ============================================================= */

export const ACCESSO = (process.env.BLOB_ACCESS === "public" ? "public" : "private") as "public" | "private";

/* In sviluppo (o nei test) senza Blob store: BLOB_LOCAL_DIR=cartella
   salva i blob come file su disco, stessa interfaccia. I nomi dei blob
   possono superare i 255 byte dei filesystem, quindi i file hanno un
   nome hash e un indice JSON ricorda il pathname vero. */
const LOCALE = process.env.BLOB_LOCAL_DIR || null;
type Indice = Record<string, { file: string; mtime: string }>;
async function fsLocale() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const crypto = await import("node:crypto");
  const base = LOCALE as string;
  await fs.mkdir(base, { recursive: true });
  const idxFile = path.join(base, "_index.json");
  let indice: Indice = {};
  try { indice = JSON.parse(await fs.readFile(idxFile, "utf8")) as Indice; } catch {}
  const salvaIndice = () => fs.writeFile(idxFile, JSON.stringify(indice), "utf8");
  const fileDi = (pathname: string) => path.join(base, crypto.createHash("sha1").update(pathname).digest("hex") + ".json");
  return { fs, base, indice, salvaIndice, fileDi };
}

export function codificaB64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}
export function decodificaB64<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function elencaBlob(prefix: string): Promise<{ pathname: string; uploadedAt: Date }[]> {
  if (LOCALE) {
    const { indice } = await fsLocale();
    return Object.entries(indice).filter(([k]) => k.startsWith(prefix)).map(([k, v]) => ({ pathname: k, uploadedAt: new Date(v.mtime) }));
  }
  const { list } = await import("@vercel/blob");
  const out: { pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const p = await list({ prefix, limit: 1000, cursor });
    for (const b of p.blobs) out.push({ pathname: b.pathname, uploadedAt: b.uploadedAt });
    cursor = p.hasMore ? p.cursor : undefined;
  } while (cursor);
  return out;
}

export async function scriviJson(pathname: string, obj: unknown): Promise<void> {
  if (LOCALE) {
    const { fs, indice, salvaIndice, fileDi } = await fsLocale();
    await fs.writeFile(fileDi(pathname), JSON.stringify(obj), "utf8");
    indice[pathname] = { file: fileDi(pathname), mtime: new Date().toISOString() };
    await salvaIndice();
    return;
  }
  const { put } = await import("@vercel/blob");
  await put(pathname, JSON.stringify(obj), {
    access: ACCESSO,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function leggiJson<T>(pathname: string): Promise<T | null> {
  if (LOCALE) {
    const { fs, fileDi } = await fsLocale();
    try { return JSON.parse(await fs.readFile(fileDi(pathname), "utf8")) as T; } catch { return null; }
  }
  const { get } = await import("@vercel/blob");
  const r = await get(pathname, { access: ACCESSO, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  const testo = await new Response(r.stream).text();
  try {
    return JSON.parse(testo) as T;
  } catch {
    return null;
  }
}

export async function eliminaBlob(pathnames: string | string[]): Promise<void> {
  if (LOCALE) {
    const { fs, indice, salvaIndice, fileDi } = await fsLocale();
    for (const p of ([] as string[]).concat(pathnames)) { await fs.rm(fileDi(p), { force: true }); delete indice[p]; }
    await salvaIndice();
    return;
  }
  const { del } = await import("@vercel/blob");
  await del(pathnames);
}

export function idCasuale(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
