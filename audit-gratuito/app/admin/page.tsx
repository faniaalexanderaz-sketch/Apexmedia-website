"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LABEL_BUDGET, LABEL_HA_SITO, LABEL_SETTORE, LABEL_STATO, LABEL_TEMPERATURA } from "@/lib/labels";
import type { Lead, Stato } from "@/lib/types";

type StatoPagina = "caricando" | "login" | "non_configurato" | "pronto" | "errore";

const BADGE_TEMPERATURA: Record<Lead["temperatura"], string> = {
  caldo: "bg-yellow/15 text-yellow border-yellow/30",
  medio: "bg-blue/15 text-blue border-blue/30",
  freddo: "bg-white/10 text-white/50 border-white/15",
};

function formattaData(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [statoPagina, setStatoPagina] = useState<StatoPagina>("caricando");
  const [lead, setLead] = useState<Lead[]>([]);
  const [password, setPassword] = useState("");
  const [erroreLogin, setErroreLogin] = useState("");
  const [loginInCorso, setLoginInCorso] = useState(false);

  async function caricaLead() {
    setStatoPagina("caricando");
    try {
      const risposta = await fetch("/api/admin/leads", { cache: "no-store" });
      if (risposta.status === 501) {
        setStatoPagina("non_configurato");
        return;
      }
      if (risposta.status === 401) {
        setStatoPagina("login");
        return;
      }
      const dati = await risposta.json();
      if (!dati.ok) {
        setStatoPagina("errore");
        return;
      }
      setLead(dati.lead);
      setStatoPagina("pronto");
    } catch {
      setStatoPagina("errore");
    }
  }

  useEffect(() => {
    caricaLead();
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginInCorso(true);
    setErroreLogin("");
    try {
      const risposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const dati = await risposta.json();
      if (!dati.ok) {
        setErroreLogin(dati.errore || "Password errata.");
        setLoginInCorso(false);
        return;
      }
      setPassword("");
      await caricaLead();
    } catch {
      setErroreLogin("Connessione non riuscita.");
    }
    setLoginInCorso(false);
  }

  async function cambiaStato(id: string, nuovoStato: Stato) {
    setLead((prev) => prev.map((l) => (l.id === id ? { ...l, stato: nuovoStato } : l)));
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stato: nuovoStato }),
    }).catch(() => {
      /* in caso di errore, un refresh manuale della pagina risincronizza lo stato */
    });
  }

  return (
    <div className="min-h-screen bg-bg px-5 py-10 font-body text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <span className="text-xs uppercase tracking-[0.14em] text-white/40">Pannello lead</span>
        </div>

        {statoPagina === "caricando" && <p className="text-white/50">Caricamento…</p>}

        {statoPagina === "non_configurato" && (
          <div className="glass-card max-w-lg rounded-2xl p-6 text-sm text-white/70">
            Il pannello non è ancora configurato. Aggiungi la variabile{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">ADMIN_PASSWORD</code> su Vercel per
            attivarlo.
          </div>
        )}

        {statoPagina === "errore" && (
          <div className="glass-card max-w-lg rounded-2xl p-6 text-sm text-red-300">
            Errore nel caricamento dei lead. Riprova tra poco.
          </div>
        )}

        {statoPagina === "login" && (
          <form onSubmit={handleLogin} className="glass-card mx-auto mt-16 max-w-sm rounded-2xl p-7">
            <h1 className="font-display text-lg font-bold">Accedi al pannello</h1>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[15px] outline-none focus:border-yellow/70"
            />
            {erroreLogin && <p className="mt-2 text-sm text-red-300">{erroreLogin}</p>}
            <button
              type="submit"
              disabled={loginInCorso}
              className="cta-yellow mt-4 w-full rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-60"
            >
              {loginInCorso ? "Accesso…" : "Entra"}
            </button>
          </form>
        )}

        {statoPagina === "pronto" && (
          <>
            <p className="mb-4 text-sm text-white/50">
              {lead.length} lead ricevuti — {lead.filter((l) => l.temperatura === "caldo").length} caldi
            </p>
            <div className="glass-card overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Contatto</th>
                    <th className="px-4 py-3 font-semibold">Attività</th>
                    <th className="px-4 py-3 font-semibold">Settore</th>
                    <th className="px-4 py-3 font-semibold">Sito</th>
                    <th className="px-4 py-3 font-semibold">Budget</th>
                    <th className="px-4 py-3 font-semibold">Punti</th>
                    <th className="px-4 py-3 font-semibold">Temp.</th>
                    <th className="px-4 py-3 font-semibold">Stato</th>
                  </tr>
                </thead>
                <tbody>
                  {lead.map((l) => (
                    <tr key={l.id} className="border-b border-white/5 align-top last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-white/50">{formattaData(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{l.nome}</div>
                        <div className="text-white/50">{l.telefono}</div>
                        <div className="text-white/50">{l.email}</div>
                      </td>
                      <td className="px-4 py-3 text-white/80">{l.nome_attivita}</td>
                      <td className="px-4 py-3 text-white/70">{LABEL_SETTORE[l.settore]}</td>
                      <td className="px-4 py-3 text-white/70">{LABEL_HA_SITO[l.ha_sito]}</td>
                      <td className="px-4 py-3 text-white/70">{LABEL_BUDGET[l.budget]}</td>
                      <td className="px-4 py-3 font-semibold text-white/80">{l.punteggio}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${BADGE_TEMPERATURA[l.temperatura]}`}
                        >
                          {LABEL_TEMPERATURA[l.temperatura]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={l.stato}
                          onChange={(e) => cambiaStato(l.id, e.target.value as Stato)}
                          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none focus:border-yellow/70"
                        >
                          {Object.entries(LABEL_STATO).map(([valore, etichetta]) => (
                            <option key={valore} value={valore}>
                              {etichetta}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {lead.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-white/40">
                        Nessun lead ricevuto ancora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
