import { NextResponse, type NextRequest } from "next/server";
import { csv, leggiClick } from "@/lib/clicks";
import { csvPrenotazioni, elencaPrenotazioni } from "@/lib/bookings";
import { autorizza } from "@/lib/pannello-server";

/** GET /api/admin/export?tipo=click|prenotazioni&giorni=30&sito=... — CSV, per entrambi i ruoli. */
export async function GET(req: NextRequest) {
  const auth = await autorizza(req, "qualsiasi");
  if (auth instanceof NextResponse) return auth;
  const p = req.nextUrl.searchParams;
  const tipo = p.get("tipo") === "prenotazioni" ? "prenotazioni" : "click";
  const giorni = Math.min(730, Math.max(1, Number(p.get("giorni") ?? (tipo === "click" ? 30 : 365)) || 30));
  const sito = p.get("sito") || undefined;
  const corpo = tipo === "click" ? csv(await leggiClick(giorni, sito)) : csvPrenotazioni(await elencaPrenotazioni(giorni, sito));
  const nome = `${tipo}-${sito ?? "tutti"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(corpo, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${nome}"`, "Cache-Control": "no-store" },
  });
}
