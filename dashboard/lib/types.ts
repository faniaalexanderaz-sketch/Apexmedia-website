export type DateRangeKey = "today" | "7d" | "30d";

export interface RealtimeData {
  activeUsers: number;
  pageviewsByMinute: { minute: string; pageviews: number }[];
  topPages: { path: string; activeUsers: number }[];
  byCity: { city: string; activeUsers: number }[];
  byDevice: { device: string; activeUsers: number }[];
}

export interface KpiTotals {
  users: number;
  sessions: number;
  pageviews: number;
  avgSessionDuration: number;
  engagementRate: number;
  bounceRate: number;
}

export interface TrendPoint {
  date: string;
  sessions: number;
}

export interface ChannelRow {
  channel: string;
  sessions: number;
  users: number;
  percentage: number;
}

export interface TopPageRow {
  path: string;
  title: string;
  pageviews: number;
}

export interface DeviceRow {
  device: string;
  sessions: number;
  percentage: number;
}

export interface ConversionRow {
  key: string;
  label: string;
  description: string;
  count: number;
  isConfiguring: boolean;
}

export interface ReportData {
  range: DateRangeKey;
  kpis: KpiTotals;
  previousKpis: KpiTotals | null;
  trend: TrendPoint[];
  channels: ChannelRow[];
  topPages: TopPageRow[];
  devices: DeviceRow[];
  conversions: ConversionRow[];
}
