import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { DeviceRow } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const COLORS: Record<string, string> = {
  mobile: "#5B2EFF",
  desktop: "#FFD84D",
  tablet: "#3DDC84",
};
const FALLBACK = "#8C8CA1";

export function DeviceBreakdown({ devices }: { devices: DeviceRow[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={devices} dataKey="sessions" nameKey="device" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {devices.map((entry) => (
              <Cell key={entry.device} fill={COLORS[entry.device] ?? FALLBACK} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#17171F",
              border: "1px solid #24242E",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => formatNumber(value)}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            formatter={(value: string) => <span className="text-xs capitalize text-gray-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
