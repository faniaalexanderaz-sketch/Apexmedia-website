import type { NextRequest } from "next/server";
import { controlla } from "@/lib/studio/api";
import { fatturaPerPdf } from "@/lib/studio/dati";
import { nomeFile, pdfFattura } from "@/lib/studio/pdf";

/** La fattura in PDF, da aprire, salvare o condividere (solo dentro lo Studio). ?scarica=1 la scarica come file. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/studio/fatture/[id]/pdf">) {
  const no = await controlla(req);
  if (no) return no;
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return new Response("Fattura non valida", { status: 400 });
  const dati = await fatturaPerPdf(n);
  if (!dati) return new Response("Fattura non trovata", { status: 404 });
  const pdf = await pdfFattura(dati);
  const nome = nomeFile(dati.fattura.numero, dati.cliente.fatturazione.ragioneSociale || dati.cliente.nome);
  const modo = req.nextUrl.searchParams.get("scarica") === "1" ? "attachment" : "inline";
  return new Response(Buffer.from(pdf), {
    headers: { "content-type": "application/pdf", "content-disposition": `${modo}; filename="${nome}"`, "cache-control": "private, no-store" },
  });
}
