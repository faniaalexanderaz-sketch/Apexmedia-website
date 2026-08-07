export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold ${className}`}>
      <span
        aria-hidden="true"
        className="grid h-7 w-7 place-items-center rounded-[7px]"
        style={{ background: "linear-gradient(135deg, #5B2EFF 0%, #2F6BFF 55%, #FFD84D 100%)" }}
      >
        <span className="h-[9px] w-[9px] rounded-[2px] bg-bg" />
      </span>
      <span className="tracking-tight">
        Apex<span className="text-yellow">Media</span>
      </span>
    </span>
  );
}
