import Image from "next/image";
import type { Shot } from "@/data/portfolio";

type Props = {
  url: string;
  shot: Shot;
  /** Screenshot a pagina intera: in fase 2 scorrerà dentro la cornice */
  fullShot?: Shot;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onDark?: boolean;
};

/** Cornice browser minimale disegnata in CSS: barra con 3 pallini e URL in mono. */
export function BrowserFrame({
  url,
  shot,
  fullShot,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
  onDark = false,
}: Props) {
  return (
    <figure
      className={`overflow-hidden rounded-md border bg-surface ${onDark ? "border-paper/20" : "border-ink/15"} ${className}`}
      data-browser-frame
      data-full-src={fullShot?.src}
      data-full-height={fullShot?.height}
    >
      <div className="flex h-8 items-center gap-3 border-b border-ink/10 bg-paper px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="block size-2 rounded-full bg-ink/20" />
          <i className="block size-2 rounded-full bg-ink/20" />
          <i className="block size-2 rounded-full bg-ink/20" />
        </span>
        <span className="truncate font-mono text-[11px] tracking-wide text-ink/60">{url}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden" data-browser-viewport>
        <Image
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt={alt}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          sizes={sizes}
          className="block h-full w-full object-cover object-top"
        />
      </div>
    </figure>
  );
}
