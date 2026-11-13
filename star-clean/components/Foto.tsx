import Image from "next/image";

type Props = {
  /** percorso in /public. Se manca compare il segnaposto dichiarato. */
  src?: string | null;
  alt: string;
  /** cosa deve mostrare la foto reale: compare solo nel segnaposto */
  richiesta: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  scuro?: boolean;
};

/**
 * Foto reale del cliente. Finché non c'è, mostra un riquadro che dice quale foto serve:
 * niente stock e niente immagini generate al posto delle foto vere.
 */
export function Foto({ src, alt, richiesta, className = "", sizes = "100vw", priority, scuro }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-ui ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Foto da inserire: ${richiesta}`}
      className={`relative overflow-hidden rounded-ui border ${scuro ? "border-linea-chiara bg-petrolio-scuro text-white" : "border-linea bg-[#dfe8ea] text-petrolio"} ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <p className="text-[0.75rem] font-bold tracking-[0.12em] uppercase opacity-70">Foto reale da inserire</p>
        <p className="mt-2 max-w-[22em] text-[0.9375rem] leading-snug font-bold">{richiesta}</p>
      </div>
    </div>
  );
}
