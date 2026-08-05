import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { TrendPoint } from "@/lib/types";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#24242E" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "#17171F",
              border: "1px solid #24242E",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            name="Sessioni"
            stroke="#5B2EFF"
            strokeWidth={2.5}
            dot={{ r: 2, fill: "#5B2EFF" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
