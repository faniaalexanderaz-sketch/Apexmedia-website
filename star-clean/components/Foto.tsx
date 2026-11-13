import Image, { getImageProps } from "next/image";

type Props = {
  /** percorso in /public. Se manca compare il segnaposto dichiarato. */
  src?: string | null;
  alt: string;
  /** cosa deve mostrare la foto: compare solo nel segnaposto */
  richiesta: string;
  className?: string;
  sizes?: string;
  /** foto sopra la piega: si carica subito */
  subito?: boolean;
  scuro?: boolean;
};

/** Foto del sito. Finché manca, mostra un riquadro che dice quale foto serve. */
export function Foto({ src, alt, richiesta, className = "", sizes = "100vw", subito, scuro }: Props) {
  if (src) {
    return (
      <div className={`rounded-ui relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={subito ? "eager" : "lazy"}
          fetchPriority={subito ? "high" : "auto"}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Foto da inserire: ${richiesta}`}
      className={`rounded-ui relative overflow-hidden border ${scuro ? "border-linea-chiara bg-petrolio-scuro text-white" : "border-linea text-petrolio bg-[#dfe8ea]"} ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <p className="text-[0.75rem] font-bold tracking-[0.12em] uppercase opacity-70">Foto da inserire</p>
        <p className="mt-2 max-w-[22em] text-[0.9375rem] leading-snug font-bold">{richiesta}</p>
      </div>
    </div>
  );
}

/**
 * Foto dell'hero con due tagli: orizzontale su mobile, verticale su desktop.
 * Il browser scarica solo quello che serve allo schermo in uso.
 */
export function FotoHero({ orizzontale, verticale, alt, className = "" }: { orizzontale: string; verticale: string; alt: string; className?: string }) {
  const {
    props: { srcSet: desktop },
  } = getImageProps({ alt, src: verticale, width: 1080, height: 1350, sizes: "480px" });
  const {
    props: { srcSet: mobile, ...resto },
  } = getImageProps({ alt, src: orizzontale, width: 1920, height: 1275, sizes: "100vw" });

  return (
    <div className={`rounded-ui relative overflow-hidden ${className}`}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktop} sizes="480px" />
        <source srcSet={mobile} sizes="100vw" />
        <img {...resto} alt={alt} loading="eager" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
    </div>
  );
}
