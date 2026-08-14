import type { DateRangeKey } from "@/lib/types";

const OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Oggi" },
  { key: "7d", label: "7 giorni" },
  { key: "30d", label: "30 giorni" },
];

export function DateRangeTabs({
  value,
  onChange,
}: {
  value: DateRangeKey;
  onChange: (v: DateRangeKey) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-bg-border bg-bg-panel p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            value === opt.key
              ? "bg-brand-purple text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
