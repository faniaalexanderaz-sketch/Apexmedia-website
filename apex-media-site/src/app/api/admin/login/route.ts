import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN, creaToken, opzioniCookie, ruoloPerPassword } from "@/lib/admin-auth";
import { COOKIE_LINGUA, normalizzaLingua } from "@/lib/pannello-i18n";
import { percorsoSicuro } from "@/lib/pannello-server";
import { azzeraTentativi, registraTentativo, troppiTentativi } from "@/lib/rate-limit";

/** POST dal form di /login: un solo campo password, il ruolo dipende da quale password corrisponde. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const lingua = normalizzaLingua(form.get("lang"), "it");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sconosciuto";
  const tornaLogin = (errore: string) => NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}&lang=${lingua}&errore=${errore}`, req.url), 303);

  if (troppiTentativi(ip)) return tornaLogin("troppi");
  const ruolo = ruoloPerPassword(String(form.get("password") ?? ""));
  if (!ruolo) { registraTentativo(ip); return tornaLogin("1"); }
  azzeraTentativi(ip);

  const destinazione = ruolo === "cliente" && next.startsWith("/admin") ? "/jenny" : next;
  const res = NextResponse.redirect(new URL(destinazione, req.url), 303);
  res.cookies.set(COOKIE_ADMIN, await creaToken(ruolo), opzioniCookie);
  if (form.get("lang")) res.cookies.set(COOKIE_LINGUA, lingua, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
  return res;
}
