/** Marchio tipografico provvisorio: si sostituisce con il logo vettoriale appena arriva. */
export function Logo({ chiaro = false }: { chiaro?: boolean }) {
  return (
    <span
      className={`inline-flex items-baseline gap-[6px] text-[1.25rem] leading-none tracking-[0.04em] uppercase ${chiaro ? "text-white" : "text-petrolio"}`}
    >
      <span className="font-extrabold">Star</span>
      <span className="font-medium">Clean</span>
      <span aria-hidden className="bg-turchese inline-block h-[6px] w-[6px]" />
    </span>
  );
}
