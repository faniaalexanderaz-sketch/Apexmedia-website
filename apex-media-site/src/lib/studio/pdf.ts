import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { DatiFatturazione, Fattura, ModelloFattura } from "./tipi";

/* =============================================================
   La fattura in PDF, pronta da mandare al cliente: intestazione
   Apex Media col marchio, dati del cliente, descrizione, importi
   (regime forfettario o con IVA), bonifico con IBAN e causale.
   È la copia di cortesia: l'originale fiscale resta la fattura
   elettronica inviata tramite il Sistema di Interscambio.
   ============================================================= */

const VIOLA = rgb(0x5b / 255, 0x2e / 255, 1);
const INK = rgb(0.11, 0.1, 0.15);
const GRIGIO = rgb(0.42, 0.42, 0.48);
const CHIARO = rgb(0.955, 0.95, 0.975);
const LINEA = rgb(0.88, 0.87, 0.91);
const VERDE = rgb(0.09, 0.62, 0.38);

const W = 595.28, H = 841.89, M = 48;
const SOGLIA_BOLLO = 77.47, BOLLO = 2;

/** I caratteri standard del PDF non hanno emoji e simboli strani: li togliamo invece di far fallire tutto. */
function pulito(s: string): string {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...")
    .replace(/[^\x20-\x7e -ÿ€]/g, "").trim();
}
const euro = (n: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n).replace(/ /g, " ");
const dataIt = (d: string) => { const [a, m, g] = d.split("-"); return `${g}/${m}/${a}`; };
const meseIt = (m: string) => new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(m + "-15T12:00:00Z"));

/** Divide un testo in righe che stanno nella larghezza. */
function righe(t: string, f: PDFFont, size: number, larg: number): string[] {
  const out: string[] = [];
  for (const par of pulito(t).split(/\n/)) {
    let r = "";
    for (const p of par.split(" ")) {
      const prova = r ? `${r} ${p}` : p;
      if (f.widthOfTextAtSize(prova, size) > larg && r) { out.push(r); r = p; } else r = prova;
    }
    out.push(r);
  }
  return out;
}

export async function pdfFattura({ fattura: f, cliente, modello: m }: { fattura: Fattura; cliente: { nome: string; fatturazione: DatiFatturazione }; modello: ModelloFattura }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Fattura ${f.numero ?? ""} - ${cliente.nome}`);
  doc.setAuthor(m.intestazione || "Apex Media");
  doc.setCreator("Apex Studio");
  const p: PDFPage = doc.addPage([W, H]);
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const testo = (s: string, x: number, y: number, o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; destra?: boolean } = {}) => {
    const size = o.size ?? 10, font = o.font ?? reg, t = pulito(s);
    p.drawText(t, { x: o.destra ? x - font.widthOfTextAtSize(t, size) : x, y, size, font, color: o.color ?? INK });
  };

  // fascia viola in alto
  p.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: VIOLA });

  // marchio Apex (le due vele del logo) e nome
  const lx = M, ly = H - 92, k = 1.45;
  // drawSvgPath misura la y verso il basso partendo dall'angolo in alto: convertiamo
  const vela = (pts: [number, number][]) => p.drawSvgPath(`M ${pts.map(([a, b]) => `${lx + a * k} ${H - (ly + (26 - b) * k)}`).join(" L ")} Z`, { x: 0, y: H, color: VIOLA });
  vela([[14, 0], [0, 26], [7.2, 26], [17.6, 6.6]]);
  vela([[18.9, 9.2], [28, 26], [20.9, 26], [15.2, 15.6]]);
  vela([[13.4, 14.2], [17.3, 21.4], [9.5, 21.4]]);
  testo(m.intestazione || "Apex Media", lx + 50, ly + 18, { size: 20, font: bold });
  const emittente = [
    m.titolare,
    m.indirizzo,
    [m.piva && `P.IVA ${m.piva}`, m.cf && `C.F. ${m.cf}`].filter(Boolean).join("  ·  "),
    [m.email, m.telefono, m.sito].filter(Boolean).join("  ·  "),
  ].filter(Boolean);
  emittente.forEach((r, i) => testo(r, lx + 50, ly + 2 - i * 12, { size: 8.5, color: GRIGIO }));

  // titolo, numero e date a destra
  const xr = W - M;
  testo("FATTURA", xr, H - 70, { size: 24, font: bold, color: VIOLA, destra: true });
  testo(`N. ${f.numero ?? "-"}`, xr, H - 90, { size: 11, font: bold, destra: true });
  testo(`Data: ${dataIt(f.emessaIl)}`, xr, H - 105, { size: 9.5, color: GRIGIO, destra: true });
  testo(`Scadenza: ${dataIt(f.scadenza)}`, xr, H - 118, { size: 9.5, color: GRIGIO, destra: true });

  let y = H - 160;
  p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINEA });

  // destinatario
  const c = cliente.fatturazione;
  const dest = [
    c.ragioneSociale || cliente.nome,
    c.indirizzo,
    [c.cap, c.citta, c.provincia && `(${c.provincia})`].filter(Boolean).join(" "),
    c.piva && `P.IVA ${c.piva}`,
    c.cf && `C.F. ${c.cf}`,
    [c.sdi && `Codice destinatario ${c.sdi}`, c.pec && `PEC ${c.pec}`].filter(Boolean).join("  ·  "),
    c.email,
  ].filter((x): x is string => Boolean(x && x.trim()));
  const altoDest = 28 + dest.length * 13;
  y -= 18;
  p.drawRectangle({ x: M, y: y - altoDest, width: 290, height: altoDest, color: CHIARO });
  testo("DESTINATARIO", M + 14, y - 16, { size: 7.5, font: bold, color: VIOLA });
  dest.forEach((r, i) => testo(r, M + 14, y - 32 - i * 13, { size: i === 0 ? 11 : 9.5, font: i === 0 ? bold : reg, color: i === 0 ? INK : GRIGIO }));
  y -= altoDest + 30;

  // righe della fattura
  p.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 22, color: INK });
  testo("DESCRIZIONE", M + 12, y + 1, { size: 8, font: bold, color: rgb(1, 1, 1) });
  testo("IMPORTO", xr - 12, y + 1, { size: 8, font: bold, color: rgb(1, 1, 1), destra: true });
  y -= 28;
  const descr = righe(f.descrizione, reg, 10.5, W - 2 * M - 150);
  descr.forEach((r, i) => testo(r, M + 12, y - i * 14, { size: 10.5, font: i === 0 ? bold : reg }));
  testo(euro(f.importo), xr - 12, y, { size: 10.5, font: bold, destra: true });
  y -= descr.length * 14;
  if (f.mese) { testo(`Periodo di riferimento: ${meseIt(f.mese)}`, M + 12, y - 2, { size: 9, color: GRIGIO }); y -= 14; }
  y -= 10;
  p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINEA });

  // totali
  const forf = m.regime === "forfettario";
  const iva = forf ? 0 : Math.round(f.importo * m.aliquota) / 100;
  const bollo = forf && f.importo > SOGLIA_BOLLO ? BOLLO : 0;
  const bolloInFattura = bollo > 0 && m.bolloACliente ? bollo : 0;
  const totale = f.importo + iva + bolloInFattura;
  const voci: [string, number][] = [["Imponibile", f.importo]];
  if (!forf) voci.push([`IVA ${String(m.aliquota).replace(".", ",")}%`, iva]);
  if (bolloInFattura) voci.push(["Rimborso imposta di bollo", bolloInFattura]);
  y -= 20;
  voci.forEach(([n, v]) => { testo(n, xr - 130, y, { size: 9.5, color: GRIGIO, destra: true }); testo(euro(v), xr - 12, y, { size: 9.5, destra: true }); y -= 15; });
  y -= 6;
  p.drawRectangle({ x: xr - 230, y: y - 12, width: 230, height: 32, color: VIOLA });
  testo("TOTALE DA PAGARE", xr - 218, y, { size: 9, font: bold, color: rgb(1, 1, 1) });
  testo(euro(totale), xr - 12, y - 1, { size: 15, font: bold, color: rgb(1, 1, 1), destra: true });
  y -= 50;

  // pagamento
  if (m.iban || m.intestatarioConto) {
    const pag = [
      `Bonifico bancario entro il ${dataIt(f.scadenza)}`,
      m.iban && `IBAN ${m.iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim()}`,
      m.intestatarioConto && `Intestato a ${m.intestatarioConto}`,
      `Causale: Fattura ${f.numero ?? ""} - ${cliente.fatturazione.ragioneSociale || cliente.nome}`,
    ].filter((x): x is string => Boolean(x));
    const alto = 26 + pag.length * 14;
    p.drawRectangle({ x: M, y: y - alto + 10, width: W - 2 * M, height: alto, borderColor: LINEA, borderWidth: 1, color: rgb(1, 1, 1) });
    testo("PAGAMENTO", M + 14, y - 6, { size: 7.5, font: bold, color: VIOLA });
    pag.forEach((r, i) => testo(r, M + 14, y - 22 - i * 14, { size: 10, font: i === 1 ? bold : reg }));
    y -= alto + 16;
  }

  // diciture di legge e nota
  const note: string[] = [];
  if (forf) {
    note.push("Operazione senza applicazione dell'IVA, effettuata ai sensi dell'art. 1, commi da 54 a 89, della Legge n. 190/2014 (regime forfettario). Si richiede la non applicazione della ritenuta alla fonte a titolo d'acconto ai sensi dell'art. 1, comma 67, della Legge n. 190/2014.");
    if (bollo) note.push("Imposta di bollo da 2,00 euro assolta in modo virtuale ai sensi del D.M. 17/06/2014.");
  }
  if (m.nota) note.push(m.nota);
  for (const n of note) { for (const r of righe(n, reg, 8.5, W - 2 * M)) { testo(r, M, y, { size: 8.5, color: GRIGIO }); y -= 11.5; } y -= 5; }

  // timbro "pagata"
  if (f.pagataIl) {
    p.drawRectangle({ x: xr - 150, y: H - 250, width: 150, height: 34, borderColor: VERDE, borderWidth: 2, color: rgb(1, 1, 1), opacity: 0.9 });
    const t = `PAGATA IL ${dataIt(f.pagataIl)}`;
    testo(t, xr - 75 - bold.widthOfTextAtSize(t, 11) / 2, H - 238, { size: 11, font: bold, color: VERDE });
  }

  // piede
  p.drawLine({ start: { x: M, y: 52 }, end: { x: W - M, y: 52 }, thickness: 0.6, color: LINEA });
  testo("Copia di cortesia. Il documento valido ai fini fiscali è la fattura elettronica trasmessa tramite il Sistema di Interscambio.", M, 38, { size: 7.5, color: GRIGIO });
  testo([m.intestazione, m.sito].filter(Boolean).join("  ·  "), xr, 38, { size: 7.5, font: bold, color: VIOLA, destra: true });

  return doc.save();
}

/** Nome del file: Fattura-12-2026-Nome-Cliente.pdf */
export function nomeFile(numero: string | null, cliente: string): string {
  const pezzo = (s: string) => pulito(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `Fattura-${pezzo(numero ?? "bozza")}-${pezzo(cliente)}.pdf`;
}
