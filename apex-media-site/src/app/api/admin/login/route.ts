import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN, creaToken, opzioniCookie, passwordCorretta } from "@/lib/admin-auth";

const tentativi = new Map<string, { n: number; fino: number }>();

/** POST dal form di login: imposta il cookie di sessione e torna su /admin. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sconosciuto";
  const stato = tentativi.get(ip);
  if (stato && stato.n >= 8 && stato.fino > Date.now()) {
    return NextResponse.redirect(new URL("/admin?errore=troppi", req.url), 303);
  }
  const form = await req.formData();
  const pw = String(form.get("password") ?? "");
  if (!pw || !passwordCorretta(pw)) {
    const prossimo = { n: (stato?.n ?? 0) + 1, fino: Date.now() + 15 * 60_000 };
    tentativi.set(ip, prossimo);
    return NextResponse.redirect(new URL("/admin?errore=1", req.url), 303);
  }
  tentativi.delete(ip);
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(COOKIE_ADMIN, await creaToken(), opzioniCookie);
  return res;
}
