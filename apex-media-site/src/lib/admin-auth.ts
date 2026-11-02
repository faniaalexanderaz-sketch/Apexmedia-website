import { cookies } from "next/headers";

/* =============================================================
   Sessione admin: cookie HttpOnly firmato (HMAC-SHA256) derivato da
   ADMIN_PASSWORD. Cambiare la password invalida tutte le sessioni.
   ============================================================= */

export const COOKIE_ADMIN = "apex_admin";
const DURATA_GIORNI = 30;

function password(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("ADMIN_PASSWORD mancante");
  return p;
}

async function hmac(messaggio: string): Promise<string> {
  const enc = new TextEncoder();
  const chiave = await crypto.subtle.importKey("raw", enc.encode(password()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", chiave, enc.encode(messaggio));
  return Buffer.from(firma).toString("base64url");
}

/** Token: scadenza + firma. */
export async function creaToken(): Promise<string> {
  const scadenza = Date.now() + DURATA_GIORNI * 86400_000;
  return `${scadenza}.${await hmac(`admin:${scadenza}`)}`;
}

export async function verificaToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [scad, firma] = token.split(".");
  if (!scad || !firma || Number(scad) < Date.now()) return false;
  const attesa = await hmac(`admin:${scad}`);
  if (attesa.length !== firma.length) return false;
  let diff = 0;
  for (let i = 0; i < attesa.length; i++) diff |= attesa.charCodeAt(i) ^ firma.charCodeAt(i);
  return diff === 0;
}

export function passwordCorretta(tentativo: string): boolean {
  const attesa = password();
  if (attesa.length !== tentativo.length) return false;
  let diff = 0;
  for (let i = 0; i < attesa.length; i++) diff |= attesa.charCodeAt(i) ^ tentativo.charCodeAt(i);
  return diff === 0;
}

export async function sessioneValida(): Promise<boolean> {
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
