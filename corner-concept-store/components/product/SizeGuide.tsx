import type { SizeType } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

type Table = { caption: string; head: string[]; rows: string[][]; note: string };

const TABLES: Record<Exclude<SizeType, "unica">, Table> = {
  abbigliamento: {
    caption: "Giacche, felpe e maglieria",
    head: ["Taglia", "Petto", "Spalle", "Lunghezza"],
    rows: [
      ["S", "104", "45", "68"],
      ["M", "110", "47", "70"],
      ["L", "116", "49", "72"],
      ["XL", "122", "51", "74"],
    ],
    note: "Misure del capo steso, in centimetri. Il petto è la circonferenza. Per i pezzi vintage vale la misura scritta nella scheda.",
  },
  denim: {
    caption: "Denim",
    head: ["Taglia", "Vita", "Fianchi", "Interno gamba"],
    rows: [
      ["30", "78", "98", "81"],
      ["31", "80", "100", "81"],
      ["32", "83", "103", "82"],
      ["33", "85", "105", "82"],
      ["34", "88", "108", "83"],
      ["36", "93", "113", "84"],
    ],
    note: "Misure in centimetri. Il denim grezzo cede di circa una taglia in vita dopo le prime settimane.",
  },
  donna: {
    caption: "Donna",
    head: ["Taglia", "IT", "Petto", "Fianchi"],
    rows: [
      ["XS", "40", "84", "90"],
      ["S", "42", "88", "94"],
      ["M", "44", "92", "98"],
      ["L", "46", "96", "102"],
    ],
    note: "Misure del corpo, in centimetri.",
  },
};

export function SizeGuide({ sizeType, productName }: { sizeType: SizeType; productName: string }) {
  if (sizeType === "unica") return null;
  const table = TABLES[sizeType];
  return (
    <div>
      <table className="w-full border-collapse text-sm">
        <caption className="occhiello pb-3 text-left text-marrone">{table.caption}</caption>
        <thead>
          <tr className="border-y border-linea">
            {table.head.map((h) => (
              <th key={h} scope="col" className="py-2.5 pr-3 text-left text-xs font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-b border-linea">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="cifre py-2.5 pr-3 text-left font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="cifre py-2.5 pr-3">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs leading-relaxed text-marrone">{table.note}</p>
      <p className="mt-5 text-sm leading-relaxed">
        Indeciso tra due taglie?{" "}
        <a
          href={whatsappLink(`Ciao Corner, mi aiutate con la taglia di: ${productName}?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-riga font-semibold"
        >
          Scrivici su WhatsApp
        </a>
        : ti diciamo come veste.
      </p>
    </div>
  );
}
