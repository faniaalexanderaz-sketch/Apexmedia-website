import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ApexMark } from "@/components/ui/Logo";
import { dentroLoStudio, passwordImpostata } from "@/lib/studio/auth";

export const metadata: Metadata = { title: "Accesso allo Studio", robots: { index: false, follow: false } };

export default function Pagina({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return <Suspense fallback={null}><Accesso searchParams={searchParams} /></Suspense>;
}

async function Accesso({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await connection();
  const sp = await searchParams;
  if (await dentroLoStudio()) redirect("/studio");
  const pronta = passwordImpostata();
  return (
    <main className="st-login">
      <form className="st-login-card" method="post" action="/api/studio/login">
        <span className="st-marchio"><ApexMark size={24} /><b>APEX<i> STUDIO</i></b></span>
        <h1>Entra nello studio</h1>
        <p>L&apos;ufficio degli agenti, i conti e i clienti di Apex Media.</p>
        <label className="st-campo">Password
          <input type="password" name="password" required autoFocus autoComplete="current-password" disabled={!pronta} />
        </label>
        {!pronta ? <p className="st-nota st-nota-err">Nessuna password impostata. Aggiungi <code>STUDIO_PASSWORD</code> nelle variabili d&apos;ambiente di Vercel e rifai il deploy.</p>
          : sp.errore === "troppi" ? <p className="st-nota st-nota-err">Troppi tentativi. Aspetta un minuto e riprova.</p>
          : sp.errore ? <p className="st-nota st-nota-err">Password sbagliata.</p> : null}
        <button className="st-btn st-btn-pieno" disabled={!pronta}>Entra</button>
      </form>
    </main>
  );
}
