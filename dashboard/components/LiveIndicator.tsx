export function LiveIndicator({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-positive">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
      </span>
      {label}
    </span>
  );
}
