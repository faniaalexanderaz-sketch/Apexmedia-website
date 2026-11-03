/* eslint-disable @next/next/no-img-element */
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Ruolo } from "@/lib/admin-auth";
import { sessione } from "@/lib/admin-auth";
import { CANALI, TRATTAMENTI_NOTI, chiaviEsistenti, type Prenotazione } from "@/lib/bookings";
import { COOKIE_LINGUA, DIZIONARIO, euro, formattaData, formattaDataOra, meseBreve, nomeMese, normalizzaLingua, numero, riempi, type Dizionario, type Lingua } from "@/lib/pannello-i18n";
import { SITO_DEFAULT } from "@/lib/pannello-server";
import { MESE_RE, meseCorrente, mesiDisponibili, statisticheMese, type Confronto, type StatMese } from "@/lib/stats";
import { parseTreatwell } from "@/lib/treatwell";
import { modalitaDemo } from "@/db";
import { leggiFileTemporaneo } from "@/lib/treatwell-temp";
import { CountUp, type Formato } from "./CountUp";
import { GraficoContattiLazy, GraficoPrenotazioniLazy, GraficoSorgentiLazy, GraficoTreatwellLazy, Scena3DLazy } from "./Lazy";
import { BottoneStampa } from "./StampaPdf";

/* =============================================================
   Pannello risultati: stesso componente per /admin (modifica) e
   /jenny (sola lettura). I controlli di modifica esistono solo
   per l'admin; le API rifiutano comunque le scritture del cliente.
   ============================================================= */

type Params = Promise<Record<string, string | undefined>>;
type Props = { percorso: "/admin" | "/jenny"; ruoloRichiesto: Ruolo; linguaDefault: Lingua; searchParams: Params };
type Anteprima = { esito: ReturnType<typeof parseTreatwell>; nuove: ReturnType<typeof parseTreatwell>["righe"]; gia: number };

export async function Pannello({ percorso, ruoloRichiesto, linguaDefault, searchParams }: Props) {
  await connection();
  const sp = await searchParams;
  const c = await cookies();
  const lingua = normalizzaLingua(sp.lang ?? c.get(COOKIE_LINGUA)?.value, linguaDefault);
  const t = DIZIONARIO[lingua];
  const ruolo = await sessione();
  if (!ruolo || (ruoloRichiesto === "admin" && ruolo !== "admin")) redirect(`/login?next=${encodeURIComponent(percorso)}&lang=${lingua}`);
  const puoModificare = ruolo === "admin";
  const sito = SITO_DEFAULT;
  const mese = sp.mese && MESE_RE.test(sp.mese) ? sp.mese : meseCorrente();
  const next = `${percorso}?mese=${mese}`;

  let stat: StatMese | null = null, mesi: string[] = [], erroreDb: string | null = null;
  try {
    [stat, mesi] = await Promise.all([statisticheMese(sito, mese), mesiDisponibili(sito)]);
  } catch (e) {
    erroreDb = e instanceof Error ? e.message : "db";
  }

  let anteprima: Anteprima | null = null;
  if (puoModificare && sp.anteprima) anteprima = await anteprimaTreatwell(sp.anteprima, sito).catch(() => null);
  const logoTw = existsSync(path.join(process.cwd(), "public", "treatwell-logo.svg"));

  return (
    <>
      <Header t={t} lingua={lingua} percorso={percorso} next={next} mese={mese} mesi={mesi} ruolo={ruolo!} />
      <main className="p-wrap" style={{ paddingTop: 24 }}>
        {erroreDb && (
          <div className="p-avviso p-avviso-err"><span>{t.stati.errore} <small style={{ opacity: 0.8 }}>{t.stati.erroreDb}</small></span><a className="p-btn p-btn-sm" href={next}>{t.stati.riprova}</a></div>
        )}
        {modalitaDemo() && <div className="p-avviso" style={{ background: "#fbf3df", color: "#7a5a1e" }}>{t.stati.demo}</div>}
        {sp.ok && <div className="p-avviso p-avviso-ok">{messaggioOk(sp.ok, t)}</div>}
        {sp.errore && !erroreDb && <div className="p-avviso p-avviso-err">{t.errori.generico}: {messaggioErrore(sp.errore, t)}</div>}

        {anteprima && <AnteprimaTreatwell t={t} lingua={lingua} a={anteprima} next={next} sito={sito} token={sp.anteprima!} />}

        {stat && (
          <>
            {/* 2. HERO */}
            <section className="p-sezione p-hero-wrap">
              <div>
                <h1 style={{ fontSize: 30, marginBottom: 14 }}>{t.hero.titolo} <span style={{ color: "var(--p-oro-2)", fontStyle: "italic", fontWeight: 500 }}>· {nomeMese(mese, lingua)}</span></h1>
                <div className="p-hero">
                  <Kpi i={0} t={t} etichetta={t.hero.prenotazioni} tip={t.hero.prenotazioniTip} c={stat.prenotazioni} formato="intero" lingua={lingua} />
                  <Kpi i={1} t={t} etichetta={t.hero.contatti} tip={t.hero.contattiTip} c={stat.contatti} formato="intero" lingua={lingua} />
                  <Kpi i={2} t={t} etichetta={t.hero.costoContatto} tip={t.hero.costoContattoTip} c={stat.costoContatto} formato="euro2" lingua={lingua} inverso />
                  <Kpi i={3} t={t} etichetta={t.hero.spesa} tip={t.hero.spesaTip} c={stat.spesa} formato="euro" lingua={lingua} />
                </div>
              </div>
              <div className="p-entra" style={{ animationDelay: "0.35s" }}><Scena3DLazy /></div>
            </section>

            {stat.vuoto && <Vuoto t={t} />}

            {/* 3. ANDAMENTO */}
            <section className="p-sezione p-card p-entra" style={{ animationDelay: "0.4s" }}>
              <div className="p-card-testa"><div><h2>{t.andamento.titolo}</h2><p className="p-sotto">{t.andamento.sotto}</p></div></div>
              <div className="p-grafico p-grafico-scroll"><div style={{ height: "100%" }}><GraficoPrenotazioniLazy dati={stat.prenotazioniPerMese.map((m) => ({ ...m, etichetta: meseBreve(m.mese, lingua) }))} meseAttivo={mese} etichettaMedia={t.andamento.media} unita={lingua === "zh" ? "个预约" : "prenotazioni"} /></div></div>
              <p className="p-frase">{fraseAndamento(stat, t, lingua)}</p>
            </section>

            {/* 4. DUE GRAFICI */}
            <section className="p-sezione p-griglia-2">
              <div className="p-card p-entra" style={{ animationDelay: "0.45s" }}>
                <div className="p-card-testa"><div><h2>{t.contattiGiorno.titolo}</h2><p className="p-sotto">{t.contattiGiorno.sotto}</p></div></div>
                <div className="p-grafico p-grafico-scroll"><div style={{ height: "100%" }}><GraficoContattiLazy dati={stat.contattiPerGiorno} unita={t.contattiGiorno.contatti} /></div></div>
              </div>
              <div className="p-card p-entra" style={{ animationDelay: "0.5s" }}>
                <div className="p-card-testa"><div><h2>{t.sorgenti.titolo}</h2><p className="p-sotto">{t.sorgenti.sotto}</p></div></div>
                {stat.contatti.valore === 0 ? <p className="p-vuoto" style={{ padding: 24 }}>{t.sorgenti.vuoto}</p> : (
                  <div className="p-grafico"><GraficoSorgentiLazy dati={stat.sorgenti.map((s) => ({ nome: t.sorgenti[s.sorgente], n: s.n, pct: s.pct }))} totaleEtichetta={t.hero.contatti} /></div>
                )}
              </div>
            </section>

            {/* 5. CANALI */}
            <section className="p-sezione p-card p-entra" style={{ animationDelay: "0.55s" }}>
              <div className="p-card-testa"><div><h2>{t.canali.titolo}</h2><p className="p-sotto">{t.canali.sotto}</p></div></div>
              {stat.prenotazioni.valore === 0 ? <p className="p-vuoto" style={{ padding: 16 }}>{t.canali.vuoto}</p> : (
                <div className="p-barre">
                  {stat.canali.map((cn) => (
                    <div className="p-barra" key={cn.canale}>
                      <span>{t.canali[cn.canale]}</span>
                      <div className="p-barra-track"><div className={`p-barra-fill${cn.canale === "treatwell" ? " tw" : ""}`} style={{ width: `${cn.pct}%` }} /></div>
                      <span><b className="num">{cn.n}</b><small className="num">{cn.pct}%</small></span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* TREATWELL */}
            <section className="p-sezione p-entra" id="treatwell" style={{ animationDelay: "0.6s" }}>
              <Treatwell t={t} lingua={lingua} stat={stat} mese={mese} puoModificare={puoModificare} next={next} sito={sito} logo={logoTw} />
            </section>

            {/* 6. NOTE */}
            <section className="p-sezione p-card p-entra" style={{ animationDelay: "0.65s" }}>
              <div className="p-card-testa"><div><h2>{t.note.titolo}</h2><p className="p-sotto">{t.note.sotto}</p></div>{stat.nota && <span className="p-sotto">{t.note.aggiornato}: {formattaDataOra(stat.nota.aggiornato_il, lingua)}</span>}</div>
              {puoModificare ? (
                <div className="p-griglia-2">
                  <form method="post" action="/api/admin/notes" className="p-form-griglia" style={{ gridTemplateColumns: "1fr" }}>
                    <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="mese" value={mese} />
                    <label className="p-campo">{t.note.it}<textarea name="it" className="p-textarea" defaultValue={stat.nota?.it ?? ""} maxLength={2000} /></label>
                    <label className="p-campo">{t.note.zh}<textarea name="zh" className="p-textarea" defaultValue={stat.nota?.zh ?? ""} maxLength={2000} /></label>
                    <div><button className="p-btn p-btn-primario">{t.note.salva}</button></div>
                  </form>
                  <form method="post" action="/api/admin/adspend" className="p-form-griglia" style={{ gridTemplateColumns: "1fr", alignContent: "start" }}>
                    <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="mese" value={mese} />
                    <label className="p-campo">{t.note.spesa}<input name="importo" inputMode="decimal" className="p-input" defaultValue={stat.spesa.valore ? String(stat.spesa.valore) : ""} placeholder="300" required /></label>
                    <div><button className="p-btn">{t.note.salvaSpesa}</button></div>
                    {stat.nota && (stat.nota.it || stat.nota.zh) && <p className="p-nota" style={{ fontSize: 14, color: "var(--p-testo-2)" }}>{lingua === "zh" ? stat.nota.it : stat.nota.zh}</p>}
                  </form>
                </div>
              ) : stat.nota && (stat.nota.it || stat.nota.zh) ? (
                <p className="p-nota">{(lingua === "zh" ? stat.nota.zh : stat.nota.it) || (lingua === "zh" ? stat.nota.it : stat.nota.zh)}</p>
              ) : <p className="p-sotto">{t.note.vuoto}</p>}
            </section>

            {/* 7. TABELLA */}
            <section className="p-sezione p-card p-entra" style={{ animationDelay: "0.7s" }}>
              <TabellaPrenotazioni t={t} lingua={lingua} stat={stat} puoModificare={puoModificare} next={next} sito={sito} ordina={sp.ordina} modifica={sp.modifica} mese={mese} />
            </section>

            <footer className="p-footer">
              <span>{t.footer.aggiornati} {formattaDataOra(stat.aggiornatoIl, lingua)}</span>
              <a href="https://infoapex.eu" target="_blank" rel="noopener"><span className="apex">A</span>{t.footer.powered}</a>
            </footer>
          </>
        )}
      </main>
    </>
  );
}

/* ---------- header ---------- */
function Header({ t, lingua, percorso, next, mese, mesi, ruolo }: { t: Dizionario; lingua: Lingua; percorso: string; next: string; mese: string; mesi: string[]; ruolo: Ruolo }) {
  const stampa = `/stampa?mese=${mese}&lang=${lingua}`;
  return (
    <header className="p-header">
      <div className="p-wrap p-header-in">
        <a className="p-logo" href={percorso}>
          <img src="/essenza-logo.png" alt="" width={36} height={36} />
          <span><b>Essenza d&apos;Oriente</b><small>{t.areaRiservata.split("·")[1]?.trim()}</small></span>
        </a>
        <span className="p-titolo-centro">{t.titolo}</span>
        <div className="p-azioni p-no-stampa">
          <form method="get" action={percorso} style={{ display: "inline-flex", gap: 6 }}>
            <select name="mese" className="p-select" defaultValue={mese} aria-label={t.header.mese}>
              {(mesi.includes(mese) ? mesi : [mese, ...mesi]).map((m) => <option key={m} value={m}>{nomeMese(m, lingua)}</option>)}
            </select>
            <button className="p-btn p-btn-sm" style={{ minHeight: 44 }}>{t.header.filtra}</button>
          </form>
          <form method="post" action="/api/admin/lang" className="p-lingua">
            <input type="hidden" name="next" value={next} />
            <button name="lang" value="it" aria-pressed={lingua === "it"}>IT</button>
            <button name="lang" value="zh" aria-pressed={lingua === "zh"}>中文</button>
          </form>
          <BottoneStampa href={stampa} testo={t.header.esportaPdf} />
          <span className="p-ruolo"><span className="p-avatar">{ruolo === "admin" ? "A" : "J"}</span>{ruolo === "admin" ? t.ruoloAdmin : t.ruoloCliente}</span>
          <form method="post" action="/api/admin/logout"><input type="hidden" name="next" value="/login" /><button className="p-btn p-btn-sm" style={{ minHeight: 44 }}>{t.header.esci}</button></form>
        </div>
      </div>
    </header>
  );
}

/* ---------- KPI ---------- */
function Kpi({ i, t, etichetta, tip, c, formato, lingua, inverso }: { i: number; t: Dizionario; etichetta: string; tip: string; c: Confronto; formato: Formato; lingua: Lingua; inverso?: boolean }) {
  const delta = c.delta;
  const migliora = delta === null ? null : inverso ? delta < 0 : delta > 0;
  const cls = delta === null || delta === 0 ? "p-badge-neutro" : migliora ? "p-badge-su" : "p-badge-giu";
  return (
    <div className="p-card p-kpi p-entra" style={{ animationDelay: `${0.05 + i * 0.08}s` }}>
      <div className="valore"><CountUp valore={c.valore} formato={formato} lingua={lingua} /></div>
      <div className="etichetta">{etichetta} <span className="p-tip" tabIndex={0}>?<span>{tip}</span></span></div>
      <span className={`p-badge ${cls}`}>{delta === null ? (c.prec === null ? t.hero.nuovo : "—") : `${delta > 0 ? "+" : ""}${delta}%`} <small style={{ fontWeight: 400 }}>{t.hero.vsMese}</small></span>
    </div>
  );
}

function fraseAndamento(stat: StatMese, t: Dizionario, lingua: Lingua): string {
  const n = stat.prenotazioni.valore, p = stat.prenotazioni.prec, d = stat.prenotazioni.delta;
  const m = nomeMese(stat.mese, lingua), prec = nomeMese(stat.prec, lingua);
  if (p === null || p === 0) return riempi(t.andamento.fraseSenzaPrec, { mese: m, n });
  const delta = d === null || d === 0 ? t.andamento.stabile : d > 0 ? riempi(t.andamento.inPiu, { p: d }) : riempi(t.andamento.inMeno, { p: lingua === "zh" ? Math.abs(d) : d });
  return riempi(t.andamento.frase, { mese: m, n, delta, prec });
}

function Vuoto({ t }: { t: Dizionario }) {
  return (
    <div className="p-sezione p-card p-vuoto p-entra">
      <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="62" r="38" fill="#dce8e0" /><path d="M40 64c8-14 32-14 40 0" stroke="#1f4d3a" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="48" cy="52" r="3" fill="#1f4d3a" /><circle cx="72" cy="52" r="3" fill="#1f4d3a" /><path d="M60 14v10M60 96v10M14 60h10M96 60h10" stroke="#c9a96e" strokeWidth="3" strokeLinecap="round" /></svg>
      <b>{t.stati.nessunDato}</b><span>{t.stati.nessunDatoSotto}</span>
    </div>
  );
}

/* ---------- Treatwell ---------- */
function Treatwell({ t, lingua, stat, mese, puoModificare, next, sito, logo }: { t: Dizionario; lingua: Lingua; stat: StatMese; mese: string; puoModificare: boolean; next: string; sito: string; logo: boolean }) {
  const tw = stat.treatwell;
  const titolo = <h2>{logo ? <img src="/treatwell-logo.svg" alt="Treatwell" /> : t.treatwell.titolo}<span className="tw-eti">{t.treatwell.etichetta}</span></h2>;
  const delta = (v: number, p: number | undefined | null) => (p ? `${v >= p ? "+" : ""}${Math.round(((v - p) / p) * 100)}% ${t.hero.vsMese}` : "");
  if (!tw.presente) {
    return (
      <div className="p-tw-vuoto">
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><div className="p-tw" style={{ padding: "10px 18px", boxShadow: "none" }}>{titolo}</div></div>
        <p style={{ margin: 0 }}>{puoModificare ? t.treatwell.vuotoAdmin : t.treatwell.vuotoCliente}</p>
        {puoModificare && <div style={{ display: "flex", justifyContent: "center" }}><ImportTreatwell t={t} next={next} sito={sito} /></div>}
      </div>
    );
  }
  return (
    <div className="p-tw">
      {titolo}
      <div className="p-tw-griglia">
        <div className="p-tw-kpi grande"><div className="v"><CountUp valore={tw.netto} formato="euro" lingua={lingua} /></div><div className="e">{t.treatwell.netto}</div>{tw.prec && <div className="d" style={{ color: "var(--p-testo-2)" }}>{delta(tw.netto, tw.prec.netto)}</div>}</div>
        <div className="p-tw-kpi"><div className="v"><CountUp valore={tw.lordo} formato="euro" lingua={lingua} /></div><div className="e">{t.treatwell.lordo}</div>{tw.prec && <div className="d">{delta(tw.lordo, tw.prec.lordo)}</div>}</div>
        <div className="p-tw-kpi"><div className="v"><CountUp valore={tw.commissione} formato="euro" lingua={lingua} /></div><div className="e">{t.treatwell.commissione} · {tw.commissionePct}%</div></div>
        <div className="p-tw-kpi"><div className="v"><CountUp valore={tw.prenotazioni} formato="intero" lingua={lingua} /></div><div className="e">{t.treatwell.prenotazioni}</div>{tw.prec && <div className="d">{delta(tw.prenotazioni, tw.prec.prenotazioni)}</div>}</div>
        <div className="p-tw-kpi"><div className="v"><CountUp valore={tw.scontrino} formato="euro" lingua={lingua} /></div><div className="e">{t.treatwell.scontrino}</div>{tw.prec && <div className="d">{delta(tw.scontrino, tw.prec.scontrino)}</div>}</div>
      </div>
      <div className="p-tw-basso">
        <div className="p-tw-sub">
          <h3>{t.treatwell.grafico}</h3>
          <div style={{ height: 180 }}><GraficoTreatwellLazy dati={tw.perMese.map((m) => ({ ...m, etichetta: meseBreve(m.mese, lingua) }))} meseAttivo={mese} lingua={lingua} /></div>
        </div>
        <div className="p-tw-sub">
          <h3>{t.treatwell.top}</h3>
          <ol className="p-tw-top" style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {tw.top.map((x, i) => <li key={x.trattamento}><span>{i + 1}</span><span>{x.trattamento}</span><span className="num">×{x.n}</span><b className="num">{euro(x.incasso, lingua)}</b></li>)}
          </ol>
          {(tw.nuovi > 0 || tw.ritorno > 0) && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--p-testo-2)" }}>
              <b className="num" style={{ color: "var(--p-tw-3)" }}>{tw.nuovi}</b> {t.treatwell.nuovi} · <b className="num" style={{ color: "var(--p-tw-3)" }}>{tw.ritorno}</b> {t.treatwell.ritorno}
            </p>
          )}
        </div>
      </div>
      {puoModificare && (
        <div className="p-tw-azioni">
          <ImportTreatwell t={t} next={next} sito={sito} />
          <form method="post" action="/api/admin/settings" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="chiave" value="treatwell_commissione" />
            <label style={{ fontSize: 13 }}>{t.treatwell.commissioneImposta}</label>
            <input name="valore" className="p-input" inputMode="decimal" defaultValue={String(tw.commissionePct)} style={{ background: "rgba(255,255,255,.95)", color: "var(--p-testo)" }} />
            <button className="p-btn p-btn-sm">{t.treatwell.salva}</button>
          </form>
        </div>
      )}
    </div>
  );
}

function ImportTreatwell({ t, next, sito }: { t: Dizionario; next: string; sito: string }) {
  return (
    <form method="post" action="/api/admin/treatwell" encType="multipart/form-data" style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
      <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="_azione" value="anteprima" />
      <input type="file" name="file" accept=".csv,text/csv" required style={{ fontSize: 13, maxWidth: 220 }} />
      <button className="p-btn p-btn-sm" style={{ color: "#fff", background: "var(--p-tw-3)", borderColor: "var(--p-tw-3)" }}>{t.treatwell.importa}</button>
    </form>
  );
}

async function anteprimaTreatwell(token: string, sito: string): Promise<Anteprima | null> {
  const testo = await leggiFileTemporaneo(token);
  if (testo === null) return null;
  const esito = parseTreatwell(testo, sito);
  const esistenti = await chiaviEsistenti(sito, esito.righe.map((r) => r.dedup_key));
  return { esito, nuove: esito.righe.filter((r) => !esistenti.has(r.dedup_key)), gia: esito.righe.filter((r) => esistenti.has(r.dedup_key)).length };
}

function AnteprimaTreatwell({ t, lingua, a, next, sito, token }: { t: Dizionario; lingua: Lingua; a: Anteprima; next: string; sito: string; token: string }) {
  return (
    <section className="p-sezione p-card" style={{ borderColor: "var(--p-tw)" }}>
      <div className="p-card-testa"><div><h2>{t.treatwell.anteprima}</h2><p className="p-sotto">{t.treatwell.anteprimaSotto}</p></div></div>
      {a.esito.errore ? <p className="p-avviso p-avviso-err">{t.treatwell.colonneMancanti} <small>({a.esito.colonne.join(", ")})</small></p> : (
        <>
          <p style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 14 }}>
            <span><b className="num" style={{ color: "var(--p-tw-3)" }}>{a.nuove.length}</b> {t.treatwell.daImportare}</span>
            <span><b className="num">{a.gia}</b> {t.treatwell.giaPresenti}</span>
            <span><b className="num">{a.esito.scartate}</b> {t.treatwell.scartate}</span>
          </p>
          <div className="p-tabella-scroll" style={{ maxHeight: 280, overflowY: "auto" }}>
            <table className="p-tabella">
              <thead><tr><th>{t.tabella.data}</th><th>{t.tabella.trattamento}</th><th className="dx">{t.tabella.importo}</th><th>{t.treatwell.cliente}</th></tr></thead>
              <tbody>{a.nuove.slice(0, 200).map((r) => <tr key={r.dedup_key}><td className="num">{formattaData(r.data, lingua)}</td><td>{r.trattamento}</td><td className="dx num">{r.importo !== null ? euro(r.importo, lingua, 2) : "—"}</td><td><span className="p-tag">{r.cliente_hash ? r.cliente_hash.slice(0, 6) : "—"}{r.nuovo_cliente === true ? ` · ${t.treatwell.nuovoCliente}` : r.nuovo_cliente === false ? ` · ${t.treatwell.clienteRitorno}` : ""}</span></td></tr>)}</tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <form method="post" action="/api/admin/treatwell"><input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="_azione" value="conferma" /><input type="hidden" name="token" value={token} /><button className="p-btn p-btn-tw" disabled={a.nuove.length === 0}>{t.treatwell.conferma}</button></form>
            <a className="p-btn" href={next}>{t.treatwell.annulla}</a>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- tabella prenotazioni ---------- */
function TabellaPrenotazioni({ t, lingua, stat, puoModificare, next, sito, ordina, modifica, mese }: { t: Dizionario; lingua: Lingua; stat: StatMese; puoModificare: boolean; next: string; sito: string; ordina?: string; modifica?: string; mese: string }) {
  const [campo, verso] = (ordina ?? "data-desc").split("-") as [keyof Prenotazione, string];
  const righe = [...stat.prenotazioniMese].sort((a, b) => {
    const x = a[campo] ?? "", y = b[campo] ?? "";
    const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
    return verso === "asc" ? r : -r;
  });
  const linkOrdina = (c: string) => `${next}&ordina=${c}-${campo === c && verso === "desc" ? "asc" : "desc"}`;
  const freccia = (c: string) => (campo === c ? (verso === "asc" ? " ↑" : " ↓") : "");
  const inModifica = righe.find((p) => p.id === modifica);
  return (
    <>
      <div className="p-card-testa">
        <div><h2>{t.tabella.titolo}</h2><p className="p-sotto">{t.tabella.sotto} · {nomeMese(mese, lingua)}</p></div>
        {puoModificare && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a className="p-btn p-btn-primario p-btn-sm" href="#nuova">{t.tabella.aggiungi}</a><a className="p-btn p-btn-sm" href="#treatwell" style={{ borderColor: "var(--p-tw)", color: "var(--p-tw-3)" }}>{t.tabella.importa}</a></div>}
      </div>
      {puoModificare && (
        <form id="nuova" method="post" action="/api/admin/bookings" className="p-form-griglia" style={{ marginBottom: 18, padding: 16, background: "var(--p-salvia-2)", borderRadius: 12 }}>
          <input type="hidden" name="next" value={next} /><input type="hidden" name="sito" value={sito} /><input type="hidden" name="_azione" value={inModifica ? "modifica" : "aggiungi"} />{inModifica && <input type="hidden" name="id" value={inModifica.id} />}
          <label className="p-campo">{t.tabella.data}<input type="date" name="data" className="p-input" required defaultValue={inModifica?.data ?? `${mese}-01`} /></label>
          <label className="p-campo">{t.tabella.trattamento}<select name="trattamento" className="p-select" style={{ width: "100%" }} defaultValue={inModifica && !TRATTAMENTI_NOTI.includes(inModifica.trattamento) ? "__altro" : inModifica?.trattamento ?? TRATTAMENTI_NOTI[0]}>{TRATTAMENTI_NOTI.map((n) => <option key={n} value={n}>{n}</option>)}<option value="__altro">{t.tabella.altroTrattamento}</option></select></label>
          <label className="p-campo">{t.tabella.canale}<select name="canale" className="p-select" style={{ width: "100%" }} defaultValue={inModifica?.canale ?? "treatwell"}>{CANALI.map((c) => <option key={c} value={c}>{t.canali[c]}</option>)}</select></label>
          <label className="p-campo">{t.tabella.importo}<input name="importo" inputMode="decimal" className="p-input" placeholder="50" defaultValue={inModifica?.importo ?? ""} /></label>
          <label className="p-campo">{t.tabella.note}<input name="note" className="p-input" maxLength={160} defaultValue={inModifica?.note ?? ""} /></label>
          <label className="p-campo">{t.tabella.altroTrattamento}<input name="trattamento_altro" className="p-input" maxLength={80} defaultValue={inModifica && !TRATTAMENTI_NOTI.includes(inModifica.trattamento) ? inModifica.trattamento : ""} /></label>
          <div className="largo" style={{ display: "flex", gap: 8 }}><button className="p-btn p-btn-primario">{t.tabella.salva}</button>{inModifica && <a className="p-btn" href={next}>{t.tabella.annulla}</a>}</div>
        </form>
      )}
      {righe.length === 0 ? <p className="p-vuoto" style={{ padding: 20 }}>{t.tabella.vuoto}</p> : (
        <div className="p-tabella-scroll">
          <table className="p-tabella">
            <thead><tr>
              <th><a href={linkOrdina("data")}>{t.tabella.data}{freccia("data")}</a></th>
              <th><a href={linkOrdina("trattamento")}>{t.tabella.trattamento}{freccia("trattamento")}</a></th>
              <th><a href={linkOrdina("canale")}>{t.tabella.canale}{freccia("canale")}</a></th>
              <th className="dx"><a href={linkOrdina("importo")}>{t.tabella.importo}{freccia("importo")}</a></th>
              <th>{t.tabella.note}</th>
              {puoModificare && <th className="dx">{t.tabella.azioni}</th>}
            </tr></thead>
            <tbody>
              {righe.map((p) => (
                <tr key={p.id}>
                  <td className="num">{formattaData(p.data, lingua)}</td>
                  <td>{p.trattamento}</td>
                  <td><span className={`p-tag${p.canale === "treatwell" ? " tw" : ""}`}>{t.canali[p.canale]}</span></td>
                  <td className="dx num">{p.importo !== null ? euro(p.importo, lingua, 2) : "—"}</td>
                  <td style={{ color: "var(--p-testo-2)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.note ?? ""}>{p.note ?? ""}</td>
                  {puoModificare && (
                    <td className="dx" style={{ whiteSpace: "nowrap" }}>
                      <a className="p-btn p-btn-sm" href={`${next}&modifica=${p.id}#nuova`}>{t.tabella.modifica}</a>{" "}
                      <form method="post" action="/api/admin/bookings" style={{ display: "inline" }}><input type="hidden" name="next" value={next} /><input type="hidden" name="_azione" value="elimina" /><input type="hidden" name="id" value={p.id} /><button className="p-btn p-btn-sm p-btn-pericolo">{t.tabella.elimina}</button></form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ---------- messaggi ---------- */
function messaggioOk(ok: string, t: Dizionario): string {
  if (ok.startsWith("importate:")) return riempi(t.ok.importate, { n: ok.split(":")[1] });
  return (t.ok as Record<string, string>)[ok] ?? "✓";
}
function messaggioErrore(e: string, t: Dizionario): string {
  if (e.startsWith("righe:")) return riempi(t.errori.righe, { n: e.split(":")[1] });
  return (t.errori as Record<string, string>)[e] ?? e;
}
