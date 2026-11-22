import { cookies } from "next/headers";

/* =============================================================
   Accesso allo Studio (/studio): una sola password, cookie HttpOnly
   firmato (HMAC-SHA256) valido 30 giorni.
   Password: STUDIO_PASSWORD; se manca vale ADMIN_PASSWORD (quella
   dell'admin dei pannelli). La password del cliente non apre mai lo Studio.
   ============================================================= */

export const COOKIE_STUDIO = "apex_studio";
const DURATA_GIORNI = 30;

const pulisci = (s: string) => s.replace(/\s+/g, "");

function password(): string {
  return pulisci(process.env.STUDIO_PASSWORD || process.env.ADMIN_PASSWORD || "");
}
export function passwordImpostata(): boolean { return password().length > 0; }

async function hmac(messaggio: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode("studio|" + password()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Buffer.from(await crypto.subtle.sign("HMAC", k, enc.encode(messaggio))).toString("base64url");
}

function uguali(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export function passwordGiusta(tentativo: string): boolean {
  const p = password();
  return p.length > 0 && uguali(p, pulisci(tentativo));
}

export async function creaTokenStudio(): Promise<string> {
  const scad = Date.now() + DURATA_GIORNI * 86400_000;
  return `${scad}.${await hmac(`studio:${scad}`)}`;
}

export async function tokenValido(token: string | undefined): Promise<boolean> {
  if (!token || !passwordImpostata()) return false;
  const [scad, firma] = token.split(".");
  if (!scad || !firma || !(Number(scad) > Date.now())) return false;
  return uguali(await hmac(`studio:${scad}`), firma);
}

export async function dentroLoStudio(): Promise<boolean> {
  return tokenValido((await cookies()).get(COOKIE_STUDIO)?.value);
}

export const opzioniCookieStudio = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURATA_GIORNI * 86400,
};
