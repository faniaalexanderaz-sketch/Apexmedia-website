"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, ErrorBanner, SkeletonBlock } from "./Card";
import { DateRangeTabs } from "./DateRangeTabs";
import { KpiCard } from "./KpiCard";
import { TrendChart } from "./TrendChart";
import { ChannelBreakdown } from "./ChannelBreakdown";
import { DeviceBreakdown } from "./DeviceBreakdown";
import { TopPagesTable } from "./TopPagesTable";
import { ConversionsPanel } from "./ConversionsPanel";
import type { DateRangeKey, ReportData } from "@/lib/types";
import { formatDuration, formatNumber, formatPercentage } from "@/lib/format";

export function ReportSection() {
  const [range, setRange] = useState<DateRangeKey>("7d");
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (r: DateRangeKey) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ga4/report?range=${r}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Errore sconosciuto.");
        setData(null);
      } else {
        setData(json);
        setError(null);
      }
    } catch {
      setError("Impossibile contattare l'API di reporting.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Report</h2>
        <DateRangeTabs value={range} onChange={setRange} />
      </div>

      {loading && !data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20" />
          ))}
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <KpiCard
              label="Utenti"
              displayValue={formatNumber(data.kpis.users)}
              currentRaw={data.kpis.users}
              previousRaw={data.previousKpis?.users ?? null}
            />
            <KpiCard
              label="Sessioni"
              displayValue={formatNumber(data.kpis.sessions)}
              currentRaw={data.kpis.sessions}
              previousRaw={data.previousKpis?.sessions ?? null}
            />
            <KpiCard
              label="Pageview"
              displayValue={formatNumber(data.kpis.pageviews)}
              currentRaw={data.kpis.pageviews}
              previousRaw={data.previousKpis?.pageviews ?? null}
            />
            <KpiCard
              label="Durata media"
              displayValue={formatDuration(data.kpis.avgSessionDuration)}
              currentRaw={data.kpis.avgSessionDuration}
              previousRaw={data.previousKpis?.avgSessionDuration ?? null}
            />
            <KpiCard
              label="Engagement rate"
              displayValue={formatPercentage(data.kpis.engagementRate * 100)}
              currentRaw={data.kpis.engagementRate}
              previousRaw={data.previousKpis?.engagementRate ?? null}
            />
          </div>

          <Card title="Trend sessioni">
            <TrendChart data={data.trend} />
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Traffico per canale">
              <ChannelBreakdown channels={data.channels} />
            </Card>
            <Card title="Dispositivo">
              <DeviceBreakdown devices={data.devices} />
            </Card>
          </div>

          <Card title="Top 10 pagine per pageview">
            <TopPagesTable pages={data.topPages} />
          </Card>

          <Card title="Eventi di conversione" subtitle="Click WhatsApp, telefono e widget Treatwell">
            <ConversionsPanel conversions={data.conversions} />
          </Card>
        </>
      )}
    </div>
  );
}
