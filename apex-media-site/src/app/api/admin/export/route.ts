import { NextResponse, type NextRequest } from "next/server";
import { sessioneValida } from "@/lib/admin-auth";
import { csv, leggiClick } from "@/lib/clicks";

/** GET /api/admin/export?giorni=30&sito=... — CSV degli eventi, solo con sessione admin. */
export async function GET(req: NextRequest) {
  if (!(await sessioneValida())) return new NextResponse("Non autorizzato", { status: 401 });
  const p = req.nextUrl.searchParams;
  const giorni = Math.min(365, Math.max(1, Number(p.get("giorni") ?? 30) || 30));
  const sito = p.get("sito") || undefined;
  const righe = await leggiClick(giorni, sito);
  const nome = `click-${sito ?? "tutti"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv(righe), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
