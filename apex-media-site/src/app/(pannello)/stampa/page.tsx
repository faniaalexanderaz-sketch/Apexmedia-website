/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { sessione } from "@/lib/admin-auth";
import { COOKIE_LINGUA, DIZIONARIO, euro, formattaData, formattaDataOra, meseBreve, nomeMese, normalizzaLingua, numero } from "@/lib/pannello-i18n";
import { SITO_DEFAULT } from "@/lib/pannello-server";
import { MESE_RE, meseCorrente, statisticheMese } from "@/lib/stats";
import { AvviaStampa } from "@/components/pannello/StampaPdf";

export const metadata: Metadata = { title: "Report del mese", robots: { index: false, follow: false } };

/* Vista A4 del mese: intestazione con logo, i 4 numeri, i due grafici
   principali (SVG statici, così la stampa è fedele), la nota, la tabella.
   Si apre e lancia subito "Salva come PDF". */
export default function StampaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <Suspense fallback={null}><Stampa searchParams={searchParams} /></Suspense>;
}

async function Stampa({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const c = await cookies();
  const lingua = normalizzaLingua(sp.lang ?? c.get(COOKIE_LINGUA)?.value, "it");
  const t = DIZIONARIO[lingua];
  if (!(await sessione())) redirect(`/login?next=${encodeURIComponent("/admin")}&lang=${lingua}`);
  const mese = sp.mese && MESE_RE.test(sp.mese) ? sp.mese : meseCorrente();
  const s = await statisticheMese(SITO_DEFAULT, mese);
  const W = 640, H = 160;
  const maxP = Math.max(1, ...s.prenotazioniPerMese.map((m) => m.n));
  const maxC = Math.max(1, ...s.contattiPerGiorno.map((g) => g.n));
  const puntiArea = s.contattiPerGiorno.map((g, i) => `${(i / 29) * W},${H - (g.n / maxC) * (H - 10)}`).join(" ");
  return (
    <main className="p-wrap p-stampa" style={{ paddingTop: 24, maxWidth: 820 }}>
      <AvviaStampa />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--p-verde)", paddingBottom: 12 }}>
        <span className="p-logo"><img src="/essenza-logo.png" alt="" width={40} height={40} /><span><b>Essenza d&apos;Oriente</b><small>{t.pdf.titolo}</small></span></span>
        <div style={{ textAlign: "right" }}><h1 style={{ fontSize: 26 }}>{nomeMese(mese, lingua)}</h1><small style={{ color: "var(--p-muto)" }}>{t.pdf.generato} {formattaDataOra(new Date().toISOString(), lingua)}</small></div>
      </header>
      <div className="p-no-stampa" style={{ margin: "12px 0" }}><button className="p-btn p-btn-primario" type="button" data-stampa>{t.pdf.stampa}</button><script dangerouslySetInnerHTML={{ __html: "document.querySelector('[data-stampa]').addEventListener('click',function(){window.print()})" }} /></div>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>
        {[[t.hero.prenotazioni, numero(s.prenotazioni.valore, lingua), s.prenotazioni.delta], [t.hero.contatti, numero(s.contatti.valore, lingua), s.contatti.delta], [t.hero.costoContatto, euro(s.costoContatto.valore, lingua, 2), s.costoContatto.delta], [t.hero.spesa, euro(s.spesa.valore, lingua), s.spesa.delta]].map(([e, v, d]) => (
          <div key={String(e)} className="p-card" style={{ padding: 14 }}><div className="num" style={{ fontSize: 26, fontWeight: 700, color: "var(--p-oro-2)" }}>{v as string}</div><div style={{ fontSize: 12, color: "var(--p-testo-2)" }}>{e as string}</div>{d !== null && <div style={{ fontSize: 11, color: "var(--p-muto)" }}>{(d as number) > 0 ? "+" : ""}{d as number}% {t.hero.vsMese}</div>}</div>
        ))}
      </section>
      <section className="p-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 18 }}>{t.andamento.titolo}</h2>
        <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" aria-hidden="true">
          {s.prenotazioniPerMese.map((m, i) => { const bw = W / 12 * 0.6, x = i * (W / 12) + (W / 12 - bw) / 2, h = (m.n / maxP) * (H - 10); return <g key={m.mese}><rect x={x} y={H - h} width={bw} height={h} rx="5" fill={m.mese === mese ? "#c9a96e" : "#1f4d3a"} /><text x={x + bw / 2} y={H + 16} fontSize="10" textAnchor="middle" fill="#7d867f">{meseBreve(m.mese, lingua)}</text><text x={x + bw / 2} y={H - h - 4} fontSize="10" textAnchor="middle" fill="#1e1e1e">{m.n || ""}</text></g>; })}
        </svg>
      </section>
      <section className="p-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 18 }}>{t.contattiGiorno.titolo}</h2>
        <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" aria-hidden="true">
          <polygon points={`0,${H} ${puntiArea} ${W},${H}`} fill="#1f4d3a" opacity=".18" /><polyline points={puntiArea} fill="none" stroke="#1f4d3a" strokeWidth="2" />
          {s.contattiPerGiorno.map((g, i) => (i % 5 === 0 || i === 29) && <text key={g.giorno} x={(i / 29) * W} y={H + 16} fontSize="10" textAnchor="middle" fill="#7d867f">{g.etichetta}</text>)}
        </svg>
      </section>
      {s.treatwell.presente && (
        <section className="p-card" style={{ marginTop: 14, background: "#e6f7f6", borderColor: "#00b2a9" }}>
          <h2 style={{ fontSize: 18, color: "#008f88" }}>Treatwell · {t.treatwell.etichetta}</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>{t.treatwell.netto}: <b className="num">{euro(s.treatwell.netto, lingua)}</b> · {t.treatwell.lordo}: <b className="num">{euro(s.treatwell.lordo, lingua)}</b> · {t.treatwell.commissione} {s.treatwell.commissionePct}%: <b className="num">{euro(s.treatwell.commissione, lingua)}</b> · {t.treatwell.prenotazioni}: <b className="num">{s.treatwell.prenotazioni}</b> · {t.treatwell.scontrino}: <b className="num">{euro(s.treatwell.scontrino, lingua)}</b></p>
        </section>
      )}
      <section className="p-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 18 }}>{t.note.titolo}</h2>
        <p className="p-nota" style={{ fontSize: 14 }}>{s.nota ? (lingua === "zh" ? s.nota.zh || s.nota.it : s.nota.it || s.nota.zh) : t.note.vuoto}</p>
      </section>
      <section className="p-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 18 }}>{t.tabella.titolo}</h2>
        {s.prenotazioniMese.length === 0 ? <p className="p-sotto">{t.tabella.vuoto}</p> : (
          <table className="p-tabella" style={{ fontSize: 12 }}>
            <thead><tr><th>{t.tabella.data}</th><th>{t.tabella.trattamento}</th><th>{t.tabella.canale}</th><th className="dx">{t.tabella.importo}</th></tr></thead>
            <tbody>{s.prenotazioniMese.map((p) => <tr key={p.id}><td className="num">{formattaData(p.data, lingua)}</td><td>{p.trattamento}</td><td>{t.canali[p.canale]}</td><td className="dx num">{p.importo !== null ? euro(p.importo, lingua, 2) : "—"}</td></tr>)}</tbody>
          </table>
        )}
      </section>
      <p style={{ fontSize: 11, color: "var(--p-muto)", marginTop: 16 }}>{t.footer.powered} · infoapex.eu</p>
    </main>
  );
}
