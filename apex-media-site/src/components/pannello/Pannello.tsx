import { cookies } from "next/headers";
import { connection } from "next/server";
import { sessione, type Ruolo } from "@/lib/admin-auth";
import { AZIONI, elencoSiti, leggiClick, seriePerGiorno, tabellaPer, totaliPerAzione, giornoLocale, type Azione, type ClickEvento, type GiornoSerie, type RigaTabella } from "@/lib/clicks";
import { CANALI, TRATTAMENTI_NOTI, elencaPrenotazioni, type Prenotazione } from "@/lib/bookings";
import { elencaNote, type NotaMensile } from "@/lib/notes";
import { COOKIE_LINGUA, DIZIONARIO, euro, formattaData, nomeMese, normalizzaLingua, type Dizionario, type Lingua } from "@/lib/pannello-i18n";
import { SITO_DEFAULT } from "@/lib/pannello-server";

/* =============================================================
   Pannello condiviso: /admin (modifica) e /jenny (sola lettura).
   Stessa UI; i form di modifica compaiono solo per l'admin e le API
   rifiutano comunque le scritture del ruolo cliente.
   ============================================================= */

const COLORI: Record<Azione, string> = { whatsapp: "#17b26a", telefono: "#2f6bff", prenota: "#5b2eff" };

type Props = {
  percorso: "/admin" | "/jenny";
  ruoloRichiesto: Ruolo;
  linguaDefault: Lingua;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function Pannello({ percorso, ruoloRichiesto, linguaDefault, searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  const c = await cookies();
  const lingua = normalizzaLingua(sp.lang ?? c.get(COOKIE_LINGUA)?.value, linguaDefault);
  const t = DIZIONARIO[lingua];
  const ruolo = await sessione();
  if (!ruolo || (ruoloRichiesto === "admin" && ruolo !== "admin")) return <Login t={t} lingua={lingua} percorso={percorso} errore={sp.errore} />;
  const puoModificare = ruolo === "admin";
  const sito = sp.sito || (puoModificare ? undefined : SITO_DEFAULT);
  return <Dashboard t={t} lingua={lingua} percorso={percorso} puoModificare={puoModificare} sito={sito} ok={sp.ok} errore={sp.errore} />;
}

function Login({ t, lingua, percorso, errore }: { t: Dizionario; lingua: Lingua; percorso: string; errore?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <div className="flex items-center justify-between">
        <p className="label-mono text-ink/50">{t.areaRiservata}</p>
        <SelettoreLingua lingua={lingua} next={percorso} />
      </div>
      <h1 className="h-display mt-3 text-4xl">{percorso === "/jenny" ? t.titoloCliente : t.titoloAdmin}</h1>
      <form method="post" action="/api/admin/login" className="mt-8 space-y-3">
        <input type="hidden" name="next" value={percorso} />
        <input type="hidden" name="lang" value={lingua} />
        <label className="block">
          <span className="label-mono text-ink/60">{t.password}</span>
          <input type="password" name="password" required autoFocus autoComplete="current-password" className="mt-2 w-full rounded-md border border-ink/15 bg-surface px-4 py-3 text-[17px] outline-none focus:border-ink" />
        </label>
        {errore === "troppi" ? <p className="text-sm text-red-600">{t.troppiTentativi}</p> : errore ? <p className="text-sm text-red-600">{t.erroreLogin}</p> : null}
        <button type="submit" className="w-full rounded-full bg-ink px-6 py-3 font-medium text-paper hover:bg-ink/85">{t.entra}</button>
      </form>
    </div>
  );
}

function SelettoreLingua({ lingua, next }: { lingua: Lingua; next: string }) {
  return (
    <form method="post" action="/api/admin/lang" className="flex items-center gap-1 rounded-full border border-ink/15 p-0.5 text-sm">
      <input type="hidden" name="next" value={next} />
      {(["it", "zh"] as Lingua[]).map((l) => (
        <button key={l} name="lang" value={l} className={`rounded-full px-3 py-1 ${lingua === l ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`} aria-pressed={lingua === l}>
          {l === "it" ? "IT" : "中文"}
        </button>
      ))}
    </form>
  );
}

async function Dashboard({ t, lingua, percorso, puoModificare, sito, ok, errore }: { t: Dizionario; lingua: Lingua; percorso: string; puoModificare: boolean; sito?: string; ok?: string; errore?: string }) {
  let click: ClickEvento[] = [], prenotazioni: Prenotazione[] = [], note: NotaMensile[] = [], siti: string[] = [];
  let erroreDb: string | null = null;
  try {
    [click, prenotazioni, note, siti] = await Promise.all([leggiClick(60, sito), elencaPrenotazioni(365, sito), elencaNote(sito ?? SITO_DEFAULT), puoModificare ? elencoSiti() : Promise.resolve([SITO_DEFAULT])]);
  } catch (e) {
    erroreDb = e instanceof Error ? e.message : "errore";
  }
  const next = sito ? `${percorso}?sito=${encodeURIComponent(sito)}` : percorso;
  const qs = sito ? `&sito=${encodeURIComponent(sito)}` : "";
  const sitoForm = sito ?? SITO_DEFAULT;

  // finestre temporali
  const oggi = giornoLocale(new Date().toISOString());
  const giornoFa = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return giornoLocale(d.toISOString()); };
  const da30 = giornoFa(29), da60 = giornoFa(59), da7 = giornoFa(6);
  const click30 = click.filter((r) => giornoLocale(r.creato_il) >= da30);
  const clickPrec = click.filter((r) => { const g = giornoLocale(r.creato_il); return g >= da60 && g < da30; });
  const pren30 = prenotazioni.filter((p) => p.data >= da30 && p.data <= oggi);
  const prenPrec = prenotazioni.filter((p) => p.data >= da60 && p.data < da30);
  const incasso = (arr: Prenotazione[]) => arr.reduce((s, p) => s + (p.importo ?? 0), 0);
  const totali = totaliPerAzione(click30);
  const serie = seriePerGiorno(click30, 30);
  const mesiRecenti = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - i); return d.toISOString().slice(0, 7); });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-mono text-ink/50">{t.areaRiservata}{!puoModificare && <> · {t.solaLettura}</>}</p>
          <h1 className="h-display mt-3 text-4xl lg:text-5xl">{sito ?? t.tuttiSiti}</h1>
          <p className="mt-3 text-ink/60">{t.sottotitolo}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelettoreLingua lingua={lingua} next={next} />
          {puoModificare && siti.length > 1 && (
            <form method="get" className="flex items-center gap-2">
              <select name="sito" defaultValue={sito ?? ""} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm">
                <option value="">{t.tuttiSiti}</option>
                {siti.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm hover:border-ink">{t.filtra}</button>
            </form>
          )}
          <form method="post" action="/api/admin/logout"><input type="hidden" name="next" value={percorso} /><button className="rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-ink">{t.esci}</button></form>
        </div>
      </header>

      {erroreDb && <Avviso tipo="errore">{t.erroreStorage} <span className="opacity-60">({erroreDb})</span></Avviso>}
      {ok && <Avviso tipo="ok">{messaggioOk(ok, t)}</Avviso>}
      {errore && !erroreDb && <Avviso tipo="errore">{t.errore}: {errore}</Avviso>}

      {/* HERO: 3 numeri grandi */}
      <section className="mt-10 grid gap-3 lg:grid-cols-3">
        <Numero titolo={t.click30} valore={click30.length} prec={clickPrec.length} sotto={`${AZIONI.reduce((s, a) => s + totali[a].oggi, 0)} ${t.oggi} · ${AZIONI.reduce((s, a) => s + totali[a].g7, 0)} ${t.ultimi7}`} t={t} />
        <Numero titolo={t.prenotazioni30} valore={pren30.length} prec={prenPrec.length} sotto={`${pren30.filter((p) => p.data === oggi).length} ${t.oggi} · ${pren30.filter((p) => p.data >= da7).length} ${t.ultimi7}`} t={t} />
        <Numero titolo={t.incasso30} valore={incasso(pren30)} prec={incasso(prenPrec)} formato={(n) => euro(n, lingua)} sotto={`${pren30.filter((p) => p.importo !== null).length}/${pren30.length} ${lingua === "zh" ? "条含金额" : "con importo"}`} t={t} />
      </section>

      {/* CLICK */}
      <Sezione titolo={t.sezClick} desc={t.descClick} azione={<a href={`/api/admin/export?tipo=click&giorni=30${qs}`} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm hover:border-ink">{t.esportaCsv}</a>}>
        <div className="grid gap-3 sm:grid-cols-3">
          {AZIONI.map((a) => <Card key={a} titolo={t[a]} colore={COLORI[a]} valore={totali[a].g30} sotto={`${totali[a].oggi} ${t.oggi} · ${totali[a].g7} ${t.ultimi7}`} />)}
        </div>
        <div className="mt-6 rounded-xl border border-ink/10 bg-surface p-5 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold tracking-tightest">{t.graficoTitolo}</h3>
            <ul className="flex flex-wrap gap-4 text-sm text-ink/70">{AZIONI.map((a) => <li key={a} className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLORI[a] }} />{t[a]}</li>)}</ul>
          </div>
          <Grafico serie={serie} t={t} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Tabella t={t} titolo={t.perSorgente} righe={tabellaPer(click30, "sorgente")} etichetta={(k) => t.sorgenti[k] ?? k} vuoto={t.nessunClick} />
          <Tabella t={t} titolo={t.perDispositivo} righe={tabellaPer(click30, "dispositivo")} etichetta={(k) => (k === "mobile" ? t.mobile : t.desktop)} vuoto={t.nessunClick} />
          <div className="lg:col-span-2"><Tabella t={t} titolo={t.perPagina} righe={tabellaPer(click30, "pagina")} etichetta={(k) => k} vuoto={t.nessunClick} /></div>
        </div>
        <p className="label-mono mt-4 text-ink/40">{t.notaSorgenti}</p>
      </Sezione>

      {/* PRENOTAZIONI */}
      <Sezione titolo={t.sezPrenotazioni} desc={t.descPrenotazioni} azione={<a href={`/api/admin/export?tipo=prenotazioni&giorni=365${qs}`} className="rounded-full border border-ink/15 bg-surface px-4 py-2 text-sm hover:border-ink">{t.esportaCsv}</a>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <TabellaSemplice titolo={t.perCanale} colonne={[t.voce, t.totale, t.importo]} righe={raggruppa(pren30, (p) => t.canali[p.canale] ?? p.canale, lingua)} vuoto={t.nessunaPrenotazione} />
          <TabellaSemplice titolo={t.perTrattamento} colonne={[t.voce, t.totale, t.importo]} righe={raggruppa(pren30, (p) => p.trattamento, lingua)} vuoto={t.nessunaPrenotazione} />
        </div>
        {puoModificare && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <form method="post" action="/api/admin/bookings" className="rounded-xl border border-ink/10 bg-surface p-5">
              <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sitoForm} /><input type="hidden" name="_azione" value="aggiungi" />
              <h3 className="font-display text-lg font-bold tracking-tightest">{t.aggiungi}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Campo etichetta={t.data}><input type="date" name="data" required defaultValue={oggi} className={INPUT} /></Campo>
                <Campo etichetta={t.trattamento}>
                  <select name="trattamento" required className={INPUT} defaultValue={TRATTAMENTI_NOTI[0]}>
                    {TRATTAMENTI_NOTI.map((n) => <option key={n} value={n}>{n}</option>)}
                    <option value="__altro">{t.altroTrattamento}</option>
                  </select>
                </Campo>
                <Campo etichetta={t.canale}>
                  <select name="canale" required className={INPUT} defaultValue="treatwell">{CANALI.map((c) => <option key={c} value={c}>{t.canali[c]}</option>)}</select>
                </Campo>
                <Campo etichetta={t.importo}><input type="text" inputMode="decimal" name="importo" placeholder="50" className={INPUT} /></Campo>
                <Campo etichetta={t.note}><input type="text" name="note" maxLength={160} className={INPUT} /></Campo>
                <Campo etichetta={t.altroTrattamento}><input type="text" name="trattamento_altro" maxLength={80} className={INPUT} /></Campo>
              </div>
              <button className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink/85">{t.salva}</button>
            </form>
            <form method="post" action="/api/admin/bookings" encType="multipart/form-data" className="rounded-xl border border-ink/10 bg-surface p-5">
              <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sitoForm} /><input type="hidden" name="_azione" value="importa" />
              <h3 className="font-display text-lg font-bold tracking-tightest">{t.importaCsv}</h3>
              <p className="mt-2 text-sm text-ink/60">{t.importaHint}</p>
              <input type="file" name="file" accept=".csv,text/csv" required className="mt-4 block w-full text-sm" />
              <button className="mt-4 rounded-full border border-ink/15 px-5 py-2 text-sm hover:border-ink">{t.importaCsv}</button>
            </form>
          </div>
        )}
        <div className="mt-6 overflow-hidden rounded-xl border border-ink/10 bg-surface">
          {prenotazioni.length === 0 ? <p className="px-5 py-6 text-sm text-ink/50">{t.nessunaPrenotazione}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="label-mono text-ink/50"><tr className="border-b border-ink/10">
                  <th className="px-5 py-3 text-left font-normal">{t.data}</th><th className="px-3 py-3 text-left font-normal">{t.trattamento}</th><th className="px-3 py-3 text-left font-normal">{t.canale}</th><th className="px-3 py-3 text-right font-normal">{t.importo}</th><th className="px-3 py-3 text-left font-normal">{t.note}</th>{puoModificare && <th className="px-5 py-3 text-right font-normal">{t.azioni}</th>}
                </tr></thead>
                <tbody>
                  {prenotazioni.slice(0, 200).map((p) => (
                    <tr key={p.id} className="border-b border-ink/5 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums">{formattaData(p.data, lingua)}</td>
                      <td className="px-3 py-3">{p.trattamento}</td>
                      <td className="px-3 py-3 text-ink/70">{t.canali[p.canale] ?? p.canale}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{p.importo !== null ? euro(p.importo, lingua) : "—"}</td>
                      <td className="max-w-[260px] truncate px-3 py-3 text-ink/70" title={p.note ?? ""}>{p.note ?? ""}</td>
                      {puoModificare && (
                        <td className="px-5 py-2 text-right">
                          <form method="post" action="/api/admin/bookings"><input type="hidden" name="next" value={next} /><input type="hidden" name="_azione" value="elimina" /><input type="hidden" name="id" value={p.id} />
                            <button className="rounded-full border border-ink/15 px-3 py-1 text-xs hover:border-red-500 hover:text-red-600">{t.elimina}</button></form>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Sezione>

      {/* NOTE MENSILI */}
      <Sezione titolo={t.sezNote} desc={t.descNote}>
        {puoModificare && (
          <form method="post" action="/api/admin/notes" className="rounded-xl border border-ink/10 bg-surface p-5">
            <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sitoForm} />
            <h3 className="font-display text-lg font-bold tracking-tightest">{t.scriviNota}</h3>
            <div className="mt-4 grid gap-3">
              <Campo etichetta={t.mese}><select name="mese" className={INPUT + " max-w-xs"} defaultValue={mesiRecenti[0]}>{mesiRecenti.map((m) => <option key={m} value={m}>{nomeMese(m, lingua)}</option>)}</select></Campo>
              <Campo etichetta={t.testoIt}><textarea name="it" rows={4} maxLength={2000} className={INPUT} /></Campo>
              <Campo etichetta={t.testoZh}><textarea name="zh" rows={4} maxLength={2000} className={INPUT} /></Campo>
            </div>
            <button className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink/85">{t.salva}</button>
          </form>
        )}
        <div className="mt-6 grid gap-4">
          {note.length === 0 ? <p className="text-sm text-ink/50">{t.nessunaNota}</p> : note.map((n) => (
            <article key={n.mese} className="rounded-xl border border-ink/10 bg-surface p-5 lg:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-bold tracking-tightest">{nomeMese(n.mese, lingua)}</h3>
                <span className="label-mono text-ink/40">{t.aggiornato} {formattaData(n.aggiornato_il, lingua)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-ink/85">{(lingua === "zh" ? n.zh : n.it) || (lingua === "zh" ? n.it : n.zh)}</p>
              {puoModificare && n.it && n.zh && <p className="mt-3 whitespace-pre-line border-t border-ink/10 pt-3 text-sm text-ink/55">{lingua === "zh" ? n.it : n.zh}</p>}
            </article>
          ))}
        </div>
      </Sezione>
    </div>
  );
}

/* ---------- pezzi ---------- */
const INPUT = "mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-[15px] outline-none focus:border-ink";

function messaggioOk(ok: string, t: Dizionario): string {
  if (ok.startsWith("importate:")) return `${ok.split(":")[1]} ${t.importate}`;
  return "✓";
}
function Avviso({ tipo, children }: { tipo: "ok" | "errore"; children: React.ReactNode }) {
  const cls = tipo === "ok" ? "border-verde/30 bg-verde/10 text-ink" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`mt-8 rounded-lg border p-4 text-sm ${cls}`}>{children}</div>;
}
function Sezione({ titolo, desc, azione, children }: { titolo: string; desc: string; azione?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/10 pb-4">
        <div><h2 className="h-display text-2xl lg:text-3xl">{titolo}</h2><p className="mt-1 text-ink/60">{desc}</p></div>
        {azione}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
function Campo({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="label-mono text-ink/60">{etichetta}</span>{children}</label>;
}
function Numero({ titolo, valore, prec, sotto, formato, t }: { titolo: string; valore: number; prec: number; sotto: string; formato?: (n: number) => string; t: Dizionario }) {
  const f = formato ?? ((n: number) => String(n));
  const delta = prec > 0 ? Math.round(((valore - prec) / prec) * 100) : null;
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-6 lg:p-7">
      <p className="label-mono text-ink/60">{titolo}</p>
      <p className="font-display mt-3 text-5xl font-bold tracking-tightest lg:text-6xl">{f(valore)}</p>
      <p className="mt-2 text-sm text-ink/55">{sotto}</p>
      {delta !== null && <p className={`mt-1 text-sm font-medium ${delta >= 0 ? "text-verde" : "text-red-600"}`}>{delta >= 0 ? "+" : ""}{delta}% {t.mesePrecedente}</p>}
    </div>
  );
}
function Card({ titolo, valore, sotto, colore }: { titolo: string; valore: number; sotto: string; colore?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-surface p-5">
      <p className="label-mono flex items-center gap-2 text-ink/60">{colore && <span className="inline-block h-2 w-2 rounded-full" style={{ background: colore }} />}{titolo}</p>
      <p className="font-display mt-3 text-4xl font-bold tracking-tightest">{valore}</p>
      <p className="mt-1 text-sm text-ink/55">{sotto}</p>
    </div>
  );
}
function Grafico({ serie, t }: { serie: GiornoSerie[]; t: Dizionario }) {
  const W = 900, H = 240, PAD_B = 28, PAD_T = 20;
  const max = Math.max(1, ...serie.map((g) => g.whatsapp + g.telefono + g.prenota));
  const passo = W / serie.length, larg = Math.max(6, passo * 0.62), scala = (H - PAD_B - PAD_T) / max;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-6 h-auto w-full" role="img" aria-label={t.graficoTitolo}>
      {[0.25, 0.5, 0.75, 1].map((f) => { const y = H - PAD_B - (H - PAD_B - PAD_T) * f; return <g key={f}><line x1="0" x2={W} y1={y} y2={y} stroke="currentColor" strokeOpacity=".08" /><text x="0" y={y - 4} fontSize="11" fill="currentColor" fillOpacity=".45" fontFamily="var(--font-mono)">{Math.round(max * f)}</text></g>; })}
      {serie.map((g, i) => {
        const x = i * passo + (passo - larg) / 2; let y = H - PAD_B;
        return (
          <g key={g.giorno}>
            <title>{`${g.etichetta}: ${g.whatsapp + g.telefono + g.prenota}`}</title>
            {AZIONI.map((a) => { const h = g[a] * scala; y -= h; return h > 0 ? <rect key={a} x={x} y={y} width={larg} height={h} fill={COLORI[a]} rx="2" /> : null; })}
            {(i % 5 === 0 || i === serie.length - 1) && <text x={x + larg / 2} y={H - 8} fontSize="11" textAnchor="middle" fill="currentColor" fillOpacity=".55" fontFamily="var(--font-mono)">{g.etichetta}</text>}
          </g>
        );
      })}
    </svg>
  );
}
function Tabella({ t, titolo, righe, etichetta, vuoto }: { t: Dizionario; titolo: string; righe: RigaTabella[]; etichetta: (k: string) => string; vuoto: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface">
      <h3 className="font-display border-b border-ink/10 px-5 py-4 text-lg font-bold tracking-tightest">{titolo}</h3>
      {righe.length === 0 ? <p className="px-5 py-6 text-sm text-ink/50">{vuoto}</p> : (
        <table className="w-full text-sm">
          <thead className="label-mono text-ink/50"><tr className="border-b border-ink/10"><th className="px-5 py-3 text-left font-normal">{t.voce}</th>{AZIONI.map((a) => <th key={a} className="px-3 py-3 text-right font-normal">{t[a]}</th>)}<th className="px-5 py-3 text-right font-normal">{t.totale}</th></tr></thead>
          <tbody>{righe.map((r) => <tr key={r.chiave} className="border-b border-ink/5 last:border-0"><td className="max-w-[320px] truncate px-5 py-3" title={r.chiave}>{etichetta(r.chiave)}</td>{AZIONI.map((a) => <td key={a} className="px-3 py-3 text-right tabular-nums text-ink/70">{r[a]}</td>)}<td className="px-5 py-3 text-right font-semibold tabular-nums">{r.totale}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
function raggruppa(pren: Prenotazione[], chiave: (p: Prenotazione) => string, lingua: Lingua): string[][] {
  const m = new Map<string, { n: number; imp: number }>();
  for (const p of pren) { const k = chiave(p); const v = m.get(k) ?? { n: 0, imp: 0 }; v.n++; v.imp += p.importo ?? 0; m.set(k, v); }
  return Array.from(m.entries()).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, String(v.n), v.imp ? euro(v.imp, lingua) : "—"]);
}
function TabellaSemplice({ titolo, colonne, righe, vuoto }: { titolo: string; colonne: string[]; righe: string[][]; vuoto: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface">
      <h3 className="font-display border-b border-ink/10 px-5 py-4 text-lg font-bold tracking-tightest">{titolo}</h3>
      {righe.length === 0 ? <p className="px-5 py-6 text-sm text-ink/50">{vuoto}</p> : (
        <table className="w-full text-sm">
          <thead className="label-mono text-ink/50"><tr className="border-b border-ink/10">{colonne.map((c, i) => <th key={c} className={`px-5 py-3 font-normal ${i === 0 ? "text-left" : "text-right"}`}>{c}</th>)}</tr></thead>
          <tbody>{righe.map((r) => <tr key={r[0]} className="border-b border-ink/5 last:border-0">{r.map((c, i) => <td key={i} className={`px-5 py-3 tabular-nums ${i === 0 ? "" : "text-right"} ${i === 1 ? "font-semibold" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
