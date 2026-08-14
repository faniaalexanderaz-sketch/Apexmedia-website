"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, ErrorBanner, SkeletonBlock } from "./Card";
import { LiveIndicator } from "./LiveIndicator";
import type { RealtimeData } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const POLL_MS = 30_000;

export function RealtimeSection() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ga4/realtime", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Errore sconosciuto.");
      } else {
        setData(json);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch {
      setError("Impossibile contattare l'API realtime.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  return (
    <Card
      title="Adesso"
      subtitle={lastUpdated ? `Aggiornato alle ${lastUpdated.toLocaleTimeString("it-IT")}` : undefined}
      action={<LiveIndicator />}
    >
      {loading && !data && (
        <div className="space-y-3">
          <SkeletonBlock className="h-16" />
          <SkeletonBlock className="h-32" />
        </div>
      )}

      {error && !data && <ErrorBanner message={error} />}

      {data && (
        <div className="space-y-5">
          {error && (
            <p className="rounded-lg border border-negative/30 bg-negative/10 px-3 py-1.5 text-xs text-negative">
              Ultimo aggiornamento non riuscito — dati mostrati potrebbero non essere aggiornati. {error}
            </p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-brand-yellow">{formatNumber(data.activeUsers)}</span>
            <span className="text-sm text-gray-400">utenti attivi in questo momento</span>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">Pageview — ultimi 30 minuti</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pageviewsByMinute}>
                  <XAxis
                    dataKey="minute"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    interval={4}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#17171F",
                      border: "1px solid #24242E",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#9ca3af" }}
                    cursor={{ fill: "rgba(91,46,255,0.1)" }}
                  />
                  <Bar dataKey="pageviews" fill="#5B2EFF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Pagine più visitate ora</p>
              <ul className="space-y-1.5">
                {data.topPages.length === 0 && <li className="text-xs text-gray-600">Nessun dato</li>}
                {data.topPages.map((p) => (
                  <li key={p.path} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-gray-300" title={p.path}>
                      {p.path}
                    </span>
                    <span className="shrink-0 font-medium text-white">{p.activeUsers}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Città</p>
              <ul className="space-y-1.5">
                {data.byCity.length === 0 && <li className="text-xs text-gray-600">Nessun dato</li>}
                {data.byCity.map((c) => (
                  <li key={c.city} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-gray-300">{c.city}</span>
                    <span className="shrink-0 font-medium text-white">{c.activeUsers}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Dispositivo</p>
              <ul className="space-y-1.5">
                {data.byDevice.length === 0 && <li className="text-xs text-gray-600">Nessun dato</li>}
                {data.byDevice.map((d) => (
                  <li key={d.device} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate capitalize text-gray-300">{d.device}</span>
                    <span className="shrink-0 font-medium text-white">{d.activeUsers}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
