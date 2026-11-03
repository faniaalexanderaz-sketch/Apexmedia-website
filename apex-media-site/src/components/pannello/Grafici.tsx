"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/* Grafici del pannello (Recharts, solo client, caricati lazy). */

const VERDE = "#1f4d3a", ORO = "#c9a96e", SALVIA = "#dce8e0", TW = "#00b2a9";
const stileTip = { borderRadius: 12, border: "1px solid #dce8e0", boxShadow: "0 8px 30px rgba(31,77,58,.12)", fontSize: 13 };

export function GraficoPrenotazioni({ dati, meseAttivo, etichettaMedia, unita }: { dati: { mese: string; etichetta: string; n: number }[]; meseAttivo: string; etichettaMedia: string; unita: string }) {
  const media = dati.length ? dati.reduce((s, d) => s + d.n, 0) / dati.length : 0;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dati} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
        <XAxis dataKey="etichetta" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#7d867f" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#7d867f" }} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(31,77,58,.06)" }} contentStyle={stileTip} formatter={(v) => [`${v} ${unita}`, ""]} />
        <ReferenceLine y={media} stroke={ORO} strokeDasharray="4 4" label={{ value: `${etichettaMedia} ${media.toFixed(1)}`, position: "insideTopRight", fontSize: 11, fill: "#b08f52" }} />
        <Bar dataKey="n" radius={[8, 8, 4, 4]} isAnimationActive>
          {dati.map((d) => <Cell key={d.mese} fill={d.mese === meseAttivo ? ORO : VERDE} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoContatti({ dati, unita }: { dati: { etichetta: string; n: number }[]; unita: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={dati} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gVerde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VERDE} stopOpacity={0.45} />
            <stop offset="100%" stopColor={VERDE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="etichetta" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#7d867f" }} interval={4} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#7d867f" }} allowDecimals={false} />
        <Tooltip contentStyle={stileTip} formatter={(v) => [`${v} ${unita}`, ""]} />
        <Area type="monotone" dataKey="n" stroke={VERDE} strokeWidth={2} fill="url(#gVerde)" dot={false} activeDot={{ r: 5, fill: ORO, stroke: "#fff", strokeWidth: 2 }} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GraficoSorgenti({ dati, totaleEtichetta }: { dati: { nome: string; n: number; pct: number }[]; totaleEtichetta: string }) {
  const [attivo, setAttivo] = useState<number | null>(null);
  const colori = [VERDE, ORO, "#6f9a85", SALVIA];
  const totale = dati.reduce((s, d) => s + d.n, 0);
  const centro = attivo !== null ? dati[attivo] : null;
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dati} dataKey="n" nameKey="nome" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none" onMouseEnter={(_, i) => setAttivo(i)} onMouseLeave={() => setAttivo(null)} isAnimationActive>
            {dati.map((d, i) => <Cell key={d.nome} fill={colori[i % colori.length]} opacity={attivo === null || attivo === i ? 1 : 0.4} />)}
          </Pie>
          <Tooltip contentStyle={stileTip} formatter={(v, n) => [`${v} (${Math.round((Number(v) / (totale || 1)) * 100)}%)`, String(n)]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", textAlign: "center" }}>
        <div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, color: centro ? "#b08f52" : VERDE, lineHeight: 1 }}>{centro ? `${centro.pct}%` : totale}</div>
          <div style={{ fontSize: 12, color: "#7d867f", marginTop: 4 }}>{centro ? centro.nome : totaleEtichetta}</div>
        </div>
      </div>
      <ul style={{ position: "absolute", left: 0, bottom: -4, listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#4f5a54" }}>
        {dati.map((d, i) => <li key={d.nome} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: colori[i % colori.length], display: "inline-block" }} />{d.nome} {d.pct}%</li>)}
      </ul>
    </div>
  );
}

export function GraficoTreatwell({ dati, meseAttivo, lingua }: { dati: { mese: string; etichetta: string; netto: number }[]; meseAttivo: string; lingua: "it" | "zh" }) {
  const formatta = (n: number) => new Intl.NumberFormat(lingua === "zh" ? "zh-CN" : "it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dati} margin={{ top: 6, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
        <XAxis dataKey="etichetta" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#4f5a54" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#4f5a54" }} />
        <Tooltip cursor={{ fill: "rgba(0,178,169,.08)" }} contentStyle={stileTip} formatter={(v) => [formatta(Number(v)), ""]} />
        <Bar dataKey="netto" radius={[6, 6, 3, 3]} isAnimationActive>
          {dati.map((d) => <Cell key={d.mese} fill={d.mese === meseAttivo ? "#008f88" : TW} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
