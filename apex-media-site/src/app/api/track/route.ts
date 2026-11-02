import { NextResponse, type NextRequest } from "next/server";
import { AZIONI, classificaSorgente, inserisciClick, type Azione } from "@/lib/clicks";

/* =============================================================
   POST /api/track — riceve un click (whatsapp / telefono / prenota)
   dai siti clienti e lo salva su Vercel Blob. Nessun dato personale.
   CORS: solo le origini in TRACK_ALLOWED_ORIGINS (separate da virgola)
   più il sito Apex stesso.
   ============================================================= */

const ORIGINI_DEFAULT = ["https://essenzadoriente.it", "https://www.essenzadoriente.it", "https://infoapex.eu", "https://www.infoapex.eu"];

function origini(): string[] {
  const extra = (process.env.TRACK_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const lista = [...ORIGINI_DEFAULT, ...extra];
  if (process.env.NODE_ENV !== "production") lista.push("http://localhost:3000", "http://127.0.0.1:8765", "http://localhost:8765");
  return lista;
}

function cors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get("origin") ?? "";
  if (origini().includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
  }
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

export function OPTIONS(req: NextRequest) {
  return cors(req, new NextResponse(null, { status: 204 }));
}

const taglia = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s || null;
};

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  if (origin && !origini().includes(origin)) return cors(req, NextResponse.json({ ok: false }, { status: 403 }));

  let corpo: Record<string, unknown>;
  try {
    // sendBeacon manda text/plain: leggiamo il testo e facciamo il parse a mano
    corpo = JSON.parse(await req.text());
  } catch {
    return cors(req, NextResponse.json({ ok: false, errore: "json" }, { status: 400 }));
  }

  const azione = taglia(corpo.azione, 20) as Azione | null;
  if (!azione || !AZIONI.includes(azione)) return cors(req, NextResponse.json({ ok: false, errore: "azione" }, { status: 400 }));

  const sito = (taglia(corpo.sito, 100) ?? new URL(origin || "https://sconosciuto").hostname).replace(/^www\./, "");
  const pagina = (taglia(corpo.pagina, 300) ?? "/").split("?")[0];
  const utm_source = taglia(corpo.utm_source, 100);
  const utm_medium = taglia(corpo.utm_medium, 100);
  const gclid = corpo.gclid === true || corpo.gclid === 1 || corpo.gclid === "1";
  const dispositivo = corpo.dispositivo === "mobile" ? "mobile" : "desktop";

  try {
    await inserisciClick({ sito, azione, pagina, utm_source, utm_medium, gclid, sorgente: classificaSorgente(utm_source, utm_medium, gclid), dispositivo });
  } catch (e) {
    console.error("[track]", e);
    return cors(req, NextResponse.json({ ok: false, errore: "db" }, { status: 500 }));
  }
  return cors(req, NextResponse.json({ ok: true }));
}
