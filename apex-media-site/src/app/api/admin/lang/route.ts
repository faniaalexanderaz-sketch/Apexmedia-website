import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_LINGUA, normalizzaLingua } from "@/lib/pannello-i18n";
import { percorsoSicuro } from "@/lib/pannello-server";

/** Cambia la lingua del pannello (cookie un anno) e torna alla pagina. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const lingua = normalizzaLingua(form.get("lang"), "it");
  const res = NextResponse.redirect(new URL(percorsoSicuro(form.get("next"), "/admin"), req.url), 303);
  res.cookies.set(COOKIE_LINGUA, lingua, { path: "/", maxAge: 365 * 86400, sameSite: "lax" });
  return res;
}
