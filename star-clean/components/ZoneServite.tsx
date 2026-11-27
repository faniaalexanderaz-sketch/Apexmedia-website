import { sito } from "@/content/sito";
import { ChiusuraSezione } from "./Pulsanti";

/*
 * Mappa stilizzata della provincia: NON è un confine reale, solo un'idea della zona.
 * Coordinate ricavate da latitudine e longitudine dei comuni (x = (lon-8.38)/0.6*400, y = (45.2-lat)/0.52*420).
 */
const PUNTI: Record<string, { x: number; y: number; etichetta: "sinistra" | "destra" }> = {
  "Casale Monferrato": { x: 48, y: 53, etichetta: "destra" },
  Valenza: { x: 175, y: 151, etichetta: "destra" },
  Alessandria: { x: 157, y: 232, etichetta: "sinistra" },
  Tortona: { x: 323, y: 246, etichetta: "destra" },
  "Novi Ligure": { x: 271, y: 354, etichetta: "destra" },
};
const CENTRO = PUNTI.Alessandria;

export function MappaZone({ className = "" }: { className?: string }) {
  const comuni = sito.zone.filter((z) => PUNTI[z]);
  return (
    <svg viewBox="0 0 420 430" role="img" aria-label={`Mappa schematica delle zone servite: ${sito.zone.join(", ")}`} className={className}>
      <defs>
        <radialGradient id="alone" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7cc4ee" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7cc4ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M24 34C84 2 196 14 252 66c46 42 128 80 136 162 8 74-46 102-56 150-10 40-102 44-124 8-22-38-92-46-124-96-30-48-14-94-46-134C14 116-6 58 24 34Z"
        fill="#eef4f9"
        stroke="#0b345a"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      {/* fiume stilizzato */}
      <path d="M8 120c60 10 100 40 150 52s110-6 160 30 70 60 96 70" fill="none" stroke="#7cc4ee" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
      <circle cx={CENTRO.x} cy={CENTRO.y} r="70" fill="url(#alone)" />
      {comuni
        .filter((z) => z !== "Alessandria")
        .map((z) => (
          <line key={z} x1={CENTRO.x} y1={CENTRO.y} x2={PUNTI[z].x} y2={PUNTI[z].y} stroke="#0b345a" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 6" strokeLinecap="round" />
        ))}
      {comuni.map((z) => {
        const p = PUNTI[z];
        const centro = z === "Alessandria";
        return (
          <g key={z}>
            <circle cx={p.x} cy={p.y} r={centro ? 9 : 6} fill={centro ? "#0b345a" : "#fff"} stroke="#0b345a" strokeWidth="2" />
            <text
              x={p.etichetta === "destra" ? p.x + 14 : p.x - 14}
              y={p.y + 5}
              textAnchor={p.etichetta === "destra" ? "start" : "end"}
              fontSize={centro ? 17 : 15}
              fontWeight={centro ? 700 : 500}
              fill="#061e36"
              fontFamily="var(--font-inter), sans-serif"
            >
              {z}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Sezione "Zone servite": elenco dei comuni da content/sito.ts e mappa stilizzata. */
export function ZoneServite({ preventivo = "/preventivo" }: { preventivo?: string }) {
  return (
    <section className="sezione">
      <div className="contenitore griglia items-center gap-y-12">
        <div className="col-span-12 lg:col-span-5">
          <p className="occhiello">Zone servite</p>
          <h2 className="titolo-2 mt-6 max-w-[14ch]">Partiamo da Alessandria, arriviamo in tutta la provincia.</h2>
          <ul className="mt-8 flex flex-wrap gap-2">
            {sito.zone.map((z) => (
              <li key={z} className="border-linea text-blu-notte rounded-full border bg-white px-4 py-2 text-[0.9375rem] font-medium">
                {z}
              </li>
            ))}
            <li className="bg-cielo text-blu rounded-full px-4 py-2 text-[0.9375rem] font-medium">e tutta la provincia</li>
          </ul>
          <p className="testo-2 mt-6">Sei in un altro comune? Scrivilo nel modulo: ti diciamo subito se arriviamo.</p>
          <ChiusuraSezione href={preventivo} />
        </div>
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <div className="scheda p-4 sm:p-8">
            <MappaZone className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
