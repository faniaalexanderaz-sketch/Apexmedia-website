import type { NextRequest } from "next/server";
import { controlla } from "@/lib/studio/api";
import { immagineTv } from "@/lib/studio/dati";

/** L'immagine che hai messo sulla TV del relax (solo dentro lo Studio). */
export async function GET(req: NextRequest) {
  const no = await controlla(req);
  if (no) return no;
  const dato = await immagineTv();
  if (!dato) return new Response("Nessuna immagine", { status: 404 });
  const [testa, corpo] = dato.split(",", 2);
  const tipo = testa.slice(5, testa.indexOf(";"));
  return new Response(Buffer.from(corpo, "base64"), { headers: { "content-type": tipo, "cache-control": "private, max-age=31536000, immutable" } });
}
