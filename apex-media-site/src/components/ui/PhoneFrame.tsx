import Image from "next/image";
import type { Shot } from "@/data/portfolio";

type Props = {
  shot: Shot;
  alt: string;
  /** Posizione e larghezza le decide chi lo usa (es. "absolute bottom-0 left-0 w-[24%]") */
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Telefono disegnato in CSS, raggio 12px, bordo inchiostro. */
export function PhoneFrame({
  shot,
  alt,
  className = "",
  sizes = "20vw",
  priority = false,
}: Props) {
  return (
    <figure className={className} data-phone-frame>
      <div className="relative aspect-[390/844] overflow-hidden rounded-lg border-[3px] border-ink bg-ink">
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/60"
        />
        <Image
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className="block h-full w-full rounded-[9px] object-cover object-top"
        />
      </div>
    </figure>
  );
}
