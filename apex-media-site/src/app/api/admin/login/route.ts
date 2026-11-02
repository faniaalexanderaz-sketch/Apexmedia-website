import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN, creaToken, opzioniCookie, ruoloPerPassword } from "@/lib/admin-auth";
import { COOKIE_LINGUA, normalizzaLingua } from "@/lib/pannello-i18n";
import { conMessaggio, percorsoSicuro } from "@/lib/pannello-server";

const tentativi = new Map<string, { n: number; fino: number }>();

/** POST dal form di login: riconosce il ruolo dalla password e imposta il cookie di sessione. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const next = percorsoSicuro(form.get("next"), "/admin");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sconosciuto";
  const stato = tentativi.get(ip);
  if (stato && stato.n >= 8 && stato.fino > Date.now()) return NextResponse.redirect(new URL(conMessaggio(next, "errore", "troppi"), req.url), 303);

  const ruolo = ruoloPerPassword(String(form.get("password") ?? ""));
  if (!ruolo) {
    tentativi.set(ip, { n: (stato?.n ?? 0) + 1, fino: Date.now() + 15 * 60_000 });
    return NextResponse.redirect(new URL(conMessaggio(next, "errore", "1"), req.url), 303);
  }
  tentativi.delete(ip);
  // il cliente che entra da /admin viene portato alla sua pagina
  const destinazione = ruolo === "cliente" && next.startsWith("/admin") ? "/jenny" : next;
  const res = NextResponse.redirect(new URL(destinazione, req.url), 303);
  res.cookies.set(COOKIE_ADMIN, await creaToken(ruolo), opzioniCookie);
  const lingua = form.get("lang");
  if (lingua) res.cookies.set(COOKIE_LINGUA, normalizzaLingua(lingua, "it"), { ...opzioniCookie, httpOnly: false, maxAge: 365 * 86400 });
  return res;
}
