/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { sessione } from "@/lib/admin-auth";
import { COOKIE_LINGUA, DIZIONARIO, normalizzaLingua } from "@/lib/pannello-i18n";
import { percorsoSicuro } from "@/lib/pannello-server";

export const metadata: Metadata = { title: "Accesso · Pannello risultati", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <Suspense fallback={null}><Login searchParams={searchParams} /></Suspense>;
}

async function Login({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const next = percorsoSicuro(sp.next, "/admin");
  const c = await cookies();
  const lingua = normalizzaLingua(sp.lang ?? c.get(COOKIE_LINGUA)?.value, next.startsWith("/jenny") ? "zh" : "it");
  const t = DIZIONARIO[lingua];
  const ruolo = await sessione();
  if (ruolo) redirect(ruolo === "cliente" && next.startsWith("/admin") ? "/jenny" : next);
  return (
    <main className="p-login">
      <div className="p-card p-entra">
        <a className="p-logo" href="/login"><img src="/essenza-logo.png" alt="" width={36} height={36} /><span><b>Essenza d&apos;Oriente</b><small>{t.areaRiservata.split("·")[1]?.trim()}</small></span></a>
        <h1>{t.login.titolo}</h1>
        <p className="p-sotto" style={{ fontSize: 14, marginTop: 6 }}>{t.login.sotto}</p>
        <form method="post" action="/api/admin/login" style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input type="hidden" name="next" value={next} /><input type="hidden" name="lang" value={lingua} />
          <label className="p-campo">{t.login.password}<input type="password" name="password" required autoFocus autoComplete="current-password" className="p-input" /></label>
          {sp.errore === "troppi" ? <p className="p-avviso p-avviso-err" style={{ margin: 0 }}>{t.login.troppi}</p> : sp.errore ? <p className="p-avviso p-avviso-err" style={{ margin: 0 }}>{t.login.errore}</p> : null}
          <button className="p-btn p-btn-primario" style={{ minHeight: 48 }}>{t.login.entra}</button>
        </form>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <span className="p-lingua">
            <a href={`/login?next=${encodeURIComponent(next)}&lang=it`} style={{ textDecoration: "none" }}><button type="button" aria-pressed={lingua === "it"}>IT</button></a>
            <a href={`/login?next=${encodeURIComponent(next)}&lang=zh`} style={{ textDecoration: "none" }}><button type="button" aria-pressed={lingua === "zh"}>中文</button></a>
          </span>
        </div>
      </div>
    </main>
  );
}
