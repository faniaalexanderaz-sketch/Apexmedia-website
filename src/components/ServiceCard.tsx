export default function ServiceCard({
  index,
  total,
  category,
  title,
  description,
}: {
  index: number;
  total: number;
  category: string;
  title: string;
  description: string;
}) {
  const padded = String(index).padStart(2, "0");

  return (
    <div className="relative overflow-hidden border-b border-hairline px-2 py-10 first:pt-0 last:border-b-0 sm:px-4">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-2 select-none font-display text-[7rem] font-extrabold leading-none text-white/[0.04] sm:text-[9rem]"
      >
        {padded}
      </span>

      <div className="relative flex items-center justify-between">
        <span className="eyebrow text-xs text-muted">
          {padded} / {String(total).padStart(2, "0")}
        </span>
        <span className="eyebrow rounded-full border border-orange/40 px-3 py-1 text-[10px] uppercase text-orange-bright">
          {category}
        </span>
      </div>

      <h3 className="relative mt-8 font-display text-2xl font-bold sm:text-3xl">{title}</h3>
      <p className="relative mt-2 max-w-sm text-muted">{description}</p>

      <span className="eyebrow relative mt-6 inline-block text-xs text-muted transition-colors duration-500 hover:text-orange-bright">
        ESPLORA →
      </span>
    </div>
  );
}
