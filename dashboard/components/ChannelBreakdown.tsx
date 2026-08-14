import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChannelRow } from "@/lib/types";
import { formatNumber, formatPercentage } from "@/lib/format";

const COLORS = ["#5B2EFF", "#FFD84D", "#3DDC84", "#4EA1FF", "#FF7A9C", "#8C8CA1"];

export function ChannelBreakdown({ channels }: { channels: ChannelRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={channels}
              dataKey="sessions"
              nameKey="channel"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {channels.map((entry, i) => (
                <Cell key={entry.channel} fill={COLORS[i % COLORS.length]} />
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="pb-2 font-medium">Canale</th>
              <th className="pb-2 text-right font-medium">Sessioni</th>
              <th className="pb-2 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c, i) => (
              <tr key={c.channel} className="border-t border-bg-border">
                <td className="flex items-center gap-2 py-1.5 text-gray-300">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {c.channel}
                </td>
                <td className="py-1.5 text-right font-medium text-white">{formatNumber(c.sessions)}</td>
                <td className="py-1.5 text-right text-gray-500">{formatPercentage(c.percentage)}</td>
              </tr>
            ))}
            {channels.length === 0 && (
              <tr>
                <td colSpan={3} className="py-3 text-center text-gray-600">
                  Nessun dato disponibile
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
