import Image from "next/image";

export default function PortfolioCard({
  image,
  imageAlt,
  client,
  handle,
  category,
  work,
  quote,
  objective,
}: {
  image: string;
  imageAlt: string;
  client: string;
  handle: string;
  category: string;
  work: string;
  quote: string;
  objective: string;
}) {
  return (
    <div className="rounded-3xl border border-hairline bg-white/[0.02] p-4 sm:p-6">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl">
        <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(min-width: 640px) 320px, 80vw" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="eyebrow rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase text-foreground backdrop-blur">
            Brand · Social
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M1 0.5L9 5L1 9.5V0.5Z" />
            </svg>
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
          <p className="font-display text-lg font-bold text-foreground">{client}</p>
          <p className="eyebrow text-[10px] text-muted">{handle}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 px-2">
        <div>
          <p className="font-display text-xl font-bold">{client}</p>
          <p className="eyebrow text-[11px] uppercase text-muted">{category}</p>
        </div>
        <div>
          <span className="eyebrow text-[10px] uppercase text-violet-bright">Lavoro</span>
          <p className="mt-1 text-sm text-foreground/85">{work}</p>
        </div>
        <p className="accent text-lg text-muted">&ldquo;{quote}&rdquo;</p>
        <div>
          <span className="eyebrow text-[10px] uppercase text-orange-bright">Obiettivo</span>
          <p className="mt-1 text-sm text-foreground/85">{objective}</p>
        </div>
      </div>
    </div>
  );
}
