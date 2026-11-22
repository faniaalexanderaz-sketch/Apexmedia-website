import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_STUDIO, creaTokenStudio, opzioniCookieStudio, passwordGiusta } from "@/lib/studio/auth";
import { azzeraTentativi, registraTentativo, troppiTentativi } from "@/lib/rate-limit";

/** POST dal form di /studio/login: una password, 5 tentativi al minuto per IP. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const ip = "studio:" + (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sconosciuto");
  const torna = (errore: string) => NextResponse.redirect(new URL(`/studio/login?errore=${errore}`, req.url), 303);

  if (troppiTentativi(ip)) return torna("troppi");
  if (!passwordGiusta(String(form.get("password") ?? ""))) { registraTentativo(ip); return torna("1"); }
  azzeraTentativi(ip);

  const res = NextResponse.redirect(new URL("/studio", req.url), 303);
  res.cookies.set(COOKIE_STUDIO, await creaTokenStudio(), opzioniCookieStudio);
  return res;
}
