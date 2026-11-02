import type { Metadata } from "next";
import { Suspense } from "react";
import { sessioneValida } from "@/lib/admin-auth";
import {
  AZIONI,
  elencoSiti,
  leggiClick,
  seriePerGiorno,
  tabellaPer,
  totaliPerAzione,
  type Azione,
  type GiornoSerie,
  type RigaTabella,
} from "@/lib/clicks";

export const metadata: Metadata = {
  title: "Dashboard click",
  robots: { index: false, follow: false },
};

const NOMI: Record<Azione, string> = { whatsapp: "WhatsApp", telefono: "Telefono", prenota: "Prenota" };
const COLORI: Record<Azione, string> = { whatsapp: "#17b26a", telefono: "#2f6bff", prenota: "#5b2eff" };
const NOMI_SORGENTE: Record<string, string> = { google_ads: "Google Ads", instagram: "Instagram / Meta", organico: "Organico / diretto", altro: "Altro" };

type Params = Promise<{ sito?: string; errore?: string }>;

export default function AdminPage({ searchParams }: { searchParams: Params }) {
  return (
    <main className="min-h-dvh bg-paper text-ink">
      <Suspense fallback={<p className="label-mono p-10 text-ink/50">Caricamento…</p>}>
        <Contenuto searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenuto({ searchParams }: { searchParams: Params }) {
  const { sito, errore } = await searchParams;
  if (!(await sessioneValida())) return <Login errore={errore} />;
  return <Dashboard sito={sito} />;
}

function Login({ errore }: { errore?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="label-mono text-ink/50">Apex Media · area riservata</p>
      <h1 className="h-display mt-3 text-4xl">Dashboard click</h1>
      <form method="post" action="/api/admin/login" className="mt-8 space-y-3">
        <label className="block">
          <span className="label-mono text-ink/60">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-2 w-full rounded-md border border-ink/15 bg-surface px-4 py-3 text-[17px] outline-none focus:border-ink"
          />
        </label>
        {errore === "troppi" ? (
          <p className="text-sm text-red-600">Troppi tentativi: riprova tra 15 minuti.</p>
        ) : errore ? (
          <p className="text-sm text-red-600">Password non corretta.</p>
        ) : null}
        <button type="submit" className="w-full rounded-full bg-ink px-6 py-3 font-medium text-paper hover:bg-ink/85">
          Entra
        </button>
      </form>
    </div>
  );
}

async function Dashboard({ sito }: { sito?: string }) {
  let righe: Awaited<ReturnType<typeof leggiClick>> = [];
  let siti: string[] = [];
  let erroreDb: string | null = null;
  try {
    [righe, siti] = await Promise.all([leggiClick(30, sito), elencoSiti()]);
  } catch (e) {
    erroreDb = e instanceof Error ? e.message : "Errore di lettura";
  }
  const totali = totaliPerAzione(righe);
  const serie = seriePerGiorno(righe, 30);
  const perSorgente = tabellaPer(righe, "sorgente");
  const perPagina = tabellaPer(righe, "pagina");
  const perDispositivo = tabellaPer(righe, "dispositivo");
  const totale30 = AZIONI.reduce((s, a) => s + totali[a].g30, 0);
  const qs = sito ? `?sito=${encodeURIComponent(sito)}` : "";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-mono text-ink/50">Apex Media · dashboard click</p>
          <h1 className="h-display mt-3 text-4xl lg:text-5xl">{sito ?? "Tutti i siti"}</h1>
          <p className="mt-3 text-ink/60">
            Click su WhatsApp, telefono e Prenota negli ultimi 30 giorni · fuso Europe/Rome
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {siti.length > 1 && (
            <form method="get" className="flex items-center gap-2">
              <select
                name="sito"
                defaultValue={sito ?? ""}
                className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm"
              >
                <option value="">Tutti i siti</option>
                {siti.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm hover:border-ink">Filtra</button>
            </form>
          )}
          <a
            href={`/api/admin/export${qs}${qs ? "&" : "?"}giorni=30`}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink/85"
          >
            Esporta CSV
          </a>
          <form method="post" action="/api/admin/logout">
            <button className="rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-ink">Esci</button>
          </form>
        </div>
      </header>

      {erroreDb && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Non riesco a leggere lo storage: {erroreDb}. Controlla che su Vercel il progetto abbia un Blob store collegato (variabile BLOB_READ_WRITE_TOKEN).
        </div>
      )}

      {/* totali */}
      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card titolo="Totale 30 giorni" valore={totale30} sotto={`${AZIONI.reduce((s, a) => s + totali[a].oggi, 0)} oggi`} />
        {AZIONI.map((a) => (
          <Card
            key={a}
            titolo={NOMI[a]}
            colore={COLORI[a]}
            valore={totali[a].g30}
            sotto={`${totali[a].oggi} oggi · ${totali[a].g7} negli ultimi 7 giorni`}
          />
        ))}
      </section>

      {/* grafico */}
      <section className="mt-10 rounded-xl border border-ink/10 bg-surface p-5 lg:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tightest">Click al giorno, ultimi 30 giorni</h2>
          <ul className="flex flex-wrap gap-4 text-sm text-ink/70">
            {AZIONI.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLORI[a] }} />
                {NOMI[a]}
              </li>
            ))}
          </ul>
        </div>
        <Grafico serie={serie} />
      </section>

      {/* tabelle */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Tabella titolo="Per sorgente" righe={perSorgente} etichetta={(k) => NOMI_SORGENTE[k] ?? k} />
        <Tabella titolo="Per dispositivo" righe={perDispositivo} etichetta={(k) => (k === "mobile" ? "Mobile" : "Desktop")} />
        <div className="lg:col-span-2">
          <Tabella titolo="Per pagina" righe={perPagina} etichetta={(k) => k} />
        </div>
      </section>

      <p className="label-mono mt-10 text-ink/40">
        Sorgente: Google Ads = gclid presente o utm_source=google · Instagram = utm_source instagram/ig/facebook/meta · Organico = nessun parametro · Altro = altri utm.
        Nessun dato personale salvato.
      </p>
    </div>
  );
}

function Card({ titolo, valore, sotto, colore }: { titolo: string; valore: number; sotto: string; colore?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-surface p-5">
      <p className="label-mono flex items-center gap-2 text-ink/60">
        {colore && <span className="inline-block h-2 w-2 rounded-full" style={{ background: colore }} />}
        {titolo}
      </p>
      <p className="font-display mt-3 text-4xl font-bold tracking-tightest">{valore}</p>
      <p className="mt-1 text-sm text-ink/55">{sotto}</p>
    </div>
  );
}

function Grafico({ serie }: { serie: GiornoSerie[] }) {
  const W = 900, H = 240, PAD_B = 28, PAD_T = 20;
  const max = Math.max(1, ...serie.map((g) => g.whatsapp + g.telefono + g.prenota));
  const passo = W / serie.length;
  const larg = Math.max(6, passo * 0.62);
  const scala = (H - PAD_B - PAD_T) / max;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 h-auto w-full" role="img" aria-label="Grafico dei click giornalieri">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = H - PAD_B - (H - PAD_B - PAD_T) * f;
        return (
          <g key={f}>
            <line x1="0" x2={W} y1={y} y2={y} stroke="currentColor" strokeOpacity=".08" />
            <text x="0" y={y - 4} fontSize="11" fill="currentColor" fillOpacity=".45" fontFamily="var(--font-mono)">
              {Math.round(max * f)}
            </text>
          </g>
        );
      })}
      {serie.map((g, i) => {
        const x = i * passo + (passo - larg) / 2;
        let y = H - PAD_B;
        const totale = g.whatsapp + g.telefono + g.prenota;
        return (
          <g key={g.giorno}>
            <title>{`${g.etichetta}: ${totale} click (WhatsApp ${g.whatsapp}, telefono ${g.telefono}, Prenota ${g.prenota})`}</title>
            {AZIONI.map((a) => {
              const h = g[a] * scala;
              y -= h;
              return h > 0 ? <rect key={a} x={x} y={y} width={larg} height={h} fill={COLORI[a]} rx="2" /> : null;
            })}
            {(i % 5 === 0 || i === serie.length - 1) && (
              <text x={x + larg / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity=".55" fontFamily="var(--font-mono)">
                {g.etichetta}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Tabella({ titolo, righe, etichetta }: { titolo: string; righe: RigaTabella[]; etichetta: (k: string) => string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface">
      <h2 className="font-display border-b border-ink/10 px-5 py-4 text-lg font-bold tracking-tightest">{titolo}</h2>
      {righe.length === 0 ? (
        <p className="px-5 py-6 text-sm text-ink/50">Nessun click negli ultimi 30 giorni.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="label-mono text-ink/50">
            <tr className="border-b border-ink/10">
              <th className="px-5 py-3 text-left font-normal">Voce</th>
              {AZIONI.map((a) => (
                <th key={a} className="px-3 py-3 text-right font-normal">
                  {NOMI[a]}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-normal">Totale</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r) => (
              <tr key={r.chiave} className="border-b border-ink/5 last:border-0">
                <td className="max-w-[320px] truncate px-5 py-3" title={r.chiave}>
                  {etichetta(r.chiave)}
                </td>
                {AZIONI.map((a) => (
                  <td key={a} className="px-3 py-3 text-right tabular-nums text-ink/70">
                    {r[a]}
                  </td>
                ))}
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{r.totale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
