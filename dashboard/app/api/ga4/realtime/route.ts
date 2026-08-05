import { NextResponse } from "next/server";
import { getGa4Client, toErrorResponse } from "@/lib/ga4-client";
import type { RealtimeData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { client, propertyId } = getGa4Client();

    const [totalsResponse, byMinuteResponse, pagesResponse, dimensionResponse] = await Promise.all([
      client.runRealtimeReport({
        property: propertyId,
        metrics: [{ name: "activeUsers" }],
      }),
      client.runRealtimeReport({
        property: propertyId,
        dimensions: [{ name: "minutesAgo" }],
        metrics: [{ name: "screenPageViews" }],
      }),
      client.runRealtimeReport({
        property: propertyId,
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
        limit: 10,
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
      client.runRealtimeReport({
        property: propertyId,
        dimensions: [{ name: "city" }, { name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
        limit: 10,
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
    ]);

    const activeUsers = Number(totalsResponse[0]?.rows?.[0]?.metricValues?.[0]?.value ?? 0);

    const byMinuteRaw = new Map<number, number>();
    for (const row of byMinuteResponse[0]?.rows ?? []) {
      const minutesAgo = Number(row.dimensionValues?.[0]?.value ?? 0);
      const pageviews = Number(row.metricValues?.[0]?.value ?? 0);
      byMinuteRaw.set(minutesAgo, pageviews);
    }
    const pageviewsByMinute = Array.from({ length: 30 }, (_, i) => {
      const minutesAgo = 29 - i;
      return {
        minute: minutesAgo === 0 ? "ora" : `-${minutesAgo}m`,
        pageviews: byMinuteRaw.get(minutesAgo) ?? 0,
      };
    });

    const topPages = (pagesResponse[0]?.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "(sconosciuto)",
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const cityTotals = new Map<string, number>();
    const deviceTotals = new Map<string, number>();
    for (const row of dimensionResponse[0]?.rows ?? []) {
      const city = row.dimensionValues?.[0]?.value ?? "Sconosciuta";
      const device = row.dimensionValues?.[1]?.value ?? "sconosciuto";
      const users = Number(row.metricValues?.[0]?.value ?? 0);
      cityTotals.set(city, (cityTotals.get(city) ?? 0) + users);
      deviceTotals.set(device, (deviceTotals.get(device) ?? 0) + users);
    }

    const byCity = Array.from(cityTotals.entries())
      .map(([city, activeUsers]) => ({ city, activeUsers }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 8);

    const byDevice = Array.from(deviceTotals.entries())
      .map(([device, activeUsers]) => ({ device, activeUsers }))
      .sort((a, b) => b.activeUsers - a.activeUsers);

    const data: RealtimeData = { activeUsers, pageviewsByMinute, topPages, byCity, byDevice };

    return NextResponse.json(data);
  } catch (err) {
    const { message, status } = toErrorResponse(err);
    return NextResponse.json({ error: message }, { status });
  }
}
