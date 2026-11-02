import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN } from "@/lib/admin-auth";
import { percorsoSicuro } from "@/lib/pannello-server";

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const next = percorsoSicuro(form?.get("next"), "/admin");
  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
  return res;
}
