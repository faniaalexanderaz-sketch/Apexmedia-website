import { cookies } from "next/headers";

/* =============================================================
   Sessione del pannello: cookie HttpOnly firmato (HMAC-SHA256).
   Due ruoli: "admin" (ADMIN_PASSWORD, vede e modifica) e "cliente"
   (CLIENT_PASSWORD, sola lettura). Il token porta il ruolo; la
   chiave di firma deriva da entrambe le password, quindi cambiarne
   una invalida tutte le sessioni.
   ============================================================= */

export type Ruolo = "admin" | "cliente";
export const COOKIE_ADMIN = "apex_admin";
const DURATA_GIORNI = 30;

function chiave(): string {
  const a = process.env.ADMIN_PASSWORD ?? "";
  const c = process.env.CLIENT_PASSWORD ?? "";
  if (!a) throw new Error("ADMIN_PASSWORD mancante");
  return `${a}|${c}`;
}

async function hmac(messaggio: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(chiave()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Buffer.from(await crypto.subtle.sign("HMAC", k, enc.encode(messaggio))).toString("base64url");
}

function uguali(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function creaToken(ruolo: Ruolo): Promise<string> {
  const scad = Date.now() + DURATA_GIORNI * 86400_000;
  return `${ruolo}.${scad}.${await hmac(`${ruolo}:${scad}`)}`;
}

export async function verificaToken(token: string | undefined): Promise<Ruolo | null> {
  if (!token) return null;
  const [ruolo, scad, firma] = token.split(".");
  if ((ruolo !== "admin" && ruolo !== "cliente") || !scad || !firma || Number(scad) < Date.now()) return null;
  return uguali(await hmac(`${ruolo}:${scad}`), firma) ? ruolo : null;
}

/** Ritorna il ruolo corrispondente alla password, o null. */
export function ruoloPerPassword(tentativo: string): Ruolo | null {
  const a = process.env.ADMIN_PASSWORD ?? "";
  const c = process.env.CLIENT_PASSWORD ?? "";
  if (a && uguali(a, tentativo)) return "admin";
  if (c && uguali(c, tentativo)) return "cliente";
  return null;
}

export async function sessione(): Promise<Ruolo | null> {
  const c = await cookies();
  return verificaToken(c.get(COOKIE_ADMIN)?.value);
}

export const opzioniCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURATA_GIORNI * 86400,
};
