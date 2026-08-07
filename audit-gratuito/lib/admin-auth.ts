import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "apex_admin";
const DURATA_SECONDI = 60 * 60 * 24 * 14; // 14 giorni

function impronta(valore: string): string {
  return createHash("sha256").update(`${valore}::apex-audit-admin`).digest("hex");
}

export function adminConfigurato(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function passwordCorretta(password: string): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  return password === process.env.ADMIN_PASSWORD;
}

export async function impostaCookieSessione(): Promise<void> {
  const valore = impronta(process.env.ADMIN_PASSWORD as string);
  const store = await cookies();
  store.set(COOKIE_NAME, valore, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: DURATA_SECONDI,
  });
}

export async function sessioneValida(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  return Boolean(cookie) && cookie === impronta(process.env.ADMIN_PASSWORD as string);
}

export async function cancellaCookieSessione(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
