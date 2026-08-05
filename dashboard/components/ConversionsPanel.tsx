import type { ConversionRow } from "@/lib/types";
import { formatNumber } from "@/lib/format";

export function ConversionsPanel({ conversions }: { conversions: ConversionRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {conversions.map((c) => (
        <div key={c.key} className="rounded-xl border border-bg-border bg-bg-panel p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-gray-400">{c.label}</p>
            {c.isConfiguring && (
              <span className="whitespace-nowrap rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-yellow">
                In configurazione
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(c.count)}</p>
          <p className="mt-1 text-[11px] text-gray-600">{c.description}</p>
        </div>
      ))}
    </div>
  );
}
