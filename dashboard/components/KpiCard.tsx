import { computeDelta, formatPercentage } from "@/lib/format";

export function KpiCard({
  label,
  displayValue,
  currentRaw,
  previousRaw,
  invertGood = false,
}: {
  label: string;
  displayValue: string;
  currentRaw: number;
  previousRaw: number | null;
  invertGood?: boolean;
}) {
  const delta = computeDelta(currentRaw, previousRaw);
  const isGood = delta !== null ? (invertGood ? delta < 0 : delta > 0) : null;

  return (
    <div className="rounded-xl border border-bg-border bg-bg-panel p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">{displayValue}</p>
      {delta !== null ? (
        <p
          className={`mt-1 text-xs font-medium ${
            isGood ? "text-positive" : delta === 0 ? "text-gray-500" : "text-negative"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {formatPercentage(delta)} vs periodo prec.
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-600">—</p>
      )}
    </div>
  );
}
