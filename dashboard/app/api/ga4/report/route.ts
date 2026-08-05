import { NextResponse } from "next/server";
import { getGa4Client, toErrorResponse } from "@/lib/ga4-client";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import type {
  ChannelRow,
  DateRangeKey,
  DeviceRow,
  KpiTotals,
  ReportData,
  TopPageRow,
  TrendPoint,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getDateRanges(range: DateRangeKey) {
  const days = range === "today" ? 1 : range === "7d" ? 7 : 30;
  const currentRange = { startDate: days === 1 ? "today" : `${days - 1}daysAgo`, endDate: "today" };
  const previousRange =
    days === 1
      ? { startDate: "yesterday", endDate: "yesterday" }
      : { startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` };
  return { currentRange, previousRange };
}

function num(v: string | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as DateRangeKey) ?? "7d";
    if (!["today", "7d", "30d"].includes(range)) {
      return NextResponse.json({ error: "Parametro range non valido." }, { status: 400 });
    }

    const { client, propertyId } = getGa4Client();
    const { currentRange, previousRange } = getDateRanges(range);

    const kpiMetrics = [
      { name: "totalUsers" },
      { name: "sessions" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "engagementRate" },
      { name: "bounceRate" },
    ];

    const [
      currentKpiResp,
      previousKpiResp,
      trendResp,
      channelResp,
      topPagesResp,
      deviceResp,
      conversionResp,
    ] = await Promise.all([
      client.runReport({ property: propertyId, dateRanges: [currentRange], metrics: kpiMetrics }),
      client.runReport({ property: propertyId, dateRanges: [previousRange], metrics: kpiMetrics }),
      client.runReport({
        property: propertyId,
        dateRanges: [currentRange],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      client.runReport({
        property: propertyId,
        dateRanges: [currentRange],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      client.runReport({
        property: propertyId,
        dateRanges: [currentRange],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property: propertyId,
        dateRanges: [currentRange],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }),
      client.runReport({
        property: propertyId,
        dateRanges: [currentRange],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
      }),
    ]);

    const parseKpis = (resp: (typeof currentKpiResp)[0]): KpiTotals => {
      const values = resp.rows?.[0]?.metricValues ?? [];
      return {
        users: num(values[0]?.value),
        sessions: num(values[1]?.value),
        pageviews: num(values[2]?.value),
        avgSessionDuration: num(values[3]?.value),
        engagementRate: num(values[4]?.value),
        bounceRate: num(values[5]?.value),
      };
    };

    const kpis = parseKpis(currentKpiResp[0]);
    const previousKpis = parseKpis(previousKpiResp[0]);

    const trend: TrendPoint[] = (trendResp[0].rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? "";
      const formatted =
        raw.length === 8 ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}` : raw;
      return { date: formatted, sessions: num(row.metricValues?.[0]?.value) };
    });

    const totalChannelSessions = (channelResp[0].rows ?? []).reduce(
      (sum, row) => sum + num(row.metricValues?.[0]?.value),
      0
    );
    const channels: ChannelRow[] = (channelResp[0].rows ?? []).map((row) => {
      const sessions = num(row.metricValues?.[0]?.value);
      return {
        channel: row.dimensionValues?.[0]?.value ?? "Sconosciuto",
        sessions,
        users: num(row.metricValues?.[1]?.value),
        percentage: totalChannelSessions > 0 ? (sessions / totalChannelSessions) * 100 : 0,
      };
    });

    const topPages: TopPageRow[] = (topPagesResp[0].rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      title: row.dimensionValues?.[1]?.value ?? "",
      pageviews: num(row.metricValues?.[0]?.value),
    }));

    const totalDeviceSessions = (deviceResp[0].rows ?? []).reduce(
      (sum, row) => sum + num(row.metricValues?.[0]?.value),
      0
    );
    const devices: DeviceRow[] = (deviceResp[0].rows ?? []).map((row) => {
      const sessions = num(row.metricValues?.[0]?.value);
      return {
        device: row.dimensionValues?.[0]?.value ?? "sconosciuto",
        sessions,
        percentage: totalDeviceSessions > 0 ? (sessions / totalDeviceSessions) * 100 : 0,
      };
    });

    const eventCounts = new Map<string, number>();
    for (const row of conversionResp[0].rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? "";
      eventCounts.set(name, num(row.metricValues?.[0]?.value));
    }
    const conversions = CONVERSION_EVENTS.map((cfg) => {
      const count = eventCounts.get(cfg.gaEventName) ?? 0;
      return {
        key: cfg.key,
        label: cfg.label,
        description: cfg.description,
        count,
        isConfiguring: count === 0,
      };
    });

    const data: ReportData = {
      range,
      kpis,
      previousKpis,
      trend,
      channels,
      topPages,
      devices,
      conversions,
    };

    return NextResponse.json(data);
  } catch (err) {
    const { message, status } = toErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
