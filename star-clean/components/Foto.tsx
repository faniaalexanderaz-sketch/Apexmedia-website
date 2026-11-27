import Image, { getImageProps } from "next/image";
import { Passata } from "./anim/Passata";
import { Icona, type NomeIcona } from "./Icona";

type Props = {
  /** percorso in /public. Se manca compare un pannello con l'icona del servizio e la foto richiesta. */
  src?: string | null;
  alt: string;
  /** cosa deve mostrare la foto: compare solo nel pannello sostitutivo */
  richiesta: string;
  icona?: NomeIcona;
  className?: string;
  sizes?: string;
  /** foto sopra la piega: si carica subito */
  subito?: boolean;
};

/** Foto del sito con l'effetto "passata". Finché manca, mostra un pannello di marca che dice quale foto serve. */
export function Foto({ src, alt, richiesta, icona = "spazzola", className = "", sizes = "100vw", subito }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-[var(--radius-foto)] bg-cielo ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} loading={subito ? "eager" : "lazy"} fetchPriority={subito ? "high" : "auto"} className="object-cover" />
        <Passata ritardo={subito ? 0.4 : 0} />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`Foto da inserire: ${richiesta}`}
      className={`from-blu to-blu-notte relative overflow-hidden rounded-[var(--radius-foto)] bg-linear-to-br text-white ${className}`}
    >
      {/* righe come lamelle di luce: richiamano vetri e tapparelle senza fingere una foto */}
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_38px,rgb(255_255_255/0.06)_38px,rgb(255_255_255/0.06)_40px)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-28 w-28 items-center justify-center rounded-[32px] bg-white/10 ring-1 ring-white/15">
          <Icona nome={icona} className="text-riflesso h-14 w-14" spessore={1.25} />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <p className="text-[0.75rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Foto da inserire</p>
        <p className="mt-1 max-w-[22em] text-[0.9375rem] leading-snug font-medium text-white/85">{richiesta}</p>
      </div>
      <Passata />
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
  } = getImageProps({ alt, src: verticale, width: 1080, height: 1350, sizes: "520px" });
  const {
    props: { srcSet: mobile, ...resto },
  } = getImageProps({ alt, src: orizzontale, width: 1920, height: 1275, sizes: "100vw" });

  return (
    <div className={`bg-cielo relative overflow-hidden rounded-[var(--radius-foto)] ${className}`}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktop} sizes="520px" />
        <source srcSet={mobile} sizes="100vw" />
        <img {...resto} alt={alt} loading="eager" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <Passata ritardo={0.5} />
    </div>
  );
}
