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

/** Telefono disegnato in CSS (vedi .dev-phone in globals.css): corpo scuro, bordo metallico, isola in alto. */
export function PhoneFrame({
  shot,
  alt,
  className = "",
  sizes = "20vw",
  priority = false,
}: Props) {
  return (
    <figure className={`dev-phone ${className}`} data-phone-frame data-device>
      <div className="dev-phone-body" data-device-body>
        <div className="dev-screen">
          <Image
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={alt}
            sizes={sizes}
            priority={priority}
            className="block h-full w-full object-cover object-top"
          />
          <span className="dev-island" aria-hidden="true" />
          <span className="dev-glare" aria-hidden="true" />
          <span className="dev-off" aria-hidden="true" data-device-off />
        </div>
      </div>
    </figure>
  );
}
