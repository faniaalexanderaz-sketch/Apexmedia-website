import Image from "next/image";
import type { Shot } from "@/data/portfolio";
import { ExternalIcon } from "./Icons";

type Props = {
  url: string;
  shot: Shot;
  /** Screenshot a pagina intera: su desktop scorre dentro la cornice (fase 2) */
  fullShot?: Shot;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onDark?: boolean;
  /** Se presente, la cornice è un link al sito (nuova scheda) e la barra URL mostra "Visita il sito" al passaggio del mouse */
  href?: string;
  /** Nome del cliente per l’evento click_portfolio */
  trackClient?: string;
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
  href,
  trackClient,
}: Props) {
  const frame = (
    <figure
      className={`overflow-hidden rounded-md border bg-surface ${onDark ? "border-paper/20" : "border-ink/15"} ${className}`}
      data-browser-frame
    >
      <div className="flex h-8 items-center gap-3 border-b border-ink/10 bg-paper px-3">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <i className="block size-2 rounded-full bg-ink/20" />
          <i className="block size-2 rounded-full bg-ink/20" />
          <i className="block size-2 rounded-full bg-ink/20" />
        </span>
        <span className="url-swap min-w-0 flex-1 font-mono text-[11px] tracking-wide text-ink/60">
          <span className="truncate">{url}</span>
          {href ? (
            <span className="inline-flex items-center gap-1.5 text-ink" aria-hidden="true">
              Visita il sito <ExternalIcon size={11} />
            </span>
          ) : null}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden" data-browser-viewport>
        <Image
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt={alt}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          // L’immagine LCP si decodifica nel primo paint invece di aspettare che il thread principale si liberi
          decoding={priority ? "sync" : "async"}
          sizes={sizes}
          className="block h-full w-full object-cover object-top"
        />
        {fullShot && fullShot.height > 0 ? (
          <Image
            src={fullShot.src}
            width={fullShot.width}
            height={fullShot.height}
            alt=""
            aria-hidden="true"
            hidden
            loading="lazy"
            sizes={sizes}
            data-full-img
            className="absolute inset-x-0 top-0 h-auto w-full will-change-transform"
          />
        ) : null}
      </div>
    </figure>
  );

  if (!href) return frame;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      aria-label={`Apri ${url} in una nuova scheda`}
      data-track={trackClient ? "click_portfolio" : undefined}
      data-track-cliente={trackClient}
    >
      {frame}
    </a>
  );
}
