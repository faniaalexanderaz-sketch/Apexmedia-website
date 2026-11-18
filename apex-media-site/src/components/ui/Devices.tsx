import Image from "next/image";
import type { Shot } from "@/data/portfolio";

/*
 * Dispositivi disegnati in CSS (vedi .dev-* in globals.css): nessuna immagine di prodotto, nessun logo.
 * Le misure sono in cqw, quindi scalano con la larghezza che gli dai.
 * Gli attributi data-browser-* sono gli stessi della vecchia cornice: le animazioni li riusano.
 */

type ScreenProps = {
  shot: Shot;
  /** Screenshot a pagina intera: su desktop scorre dentro lo schermo */
  fullShot?: Shot;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Come ritagliare lo screenshot quando lo schermo ha un’altra forma */
  fit?: string;
};

function Screen({
  shot,
  fullShot,
  alt,
  sizes,
  priority = false,
  fit = "object-top",
}: ScreenProps) {
  return (
    <div className="dev-screen" data-browser-viewport>
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={`block h-full w-full object-cover ${fit}`}
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
      {/* Riflesso appena percepibile sul vetro e schermo "spento" che si accende all’ingresso */}
      <span className="dev-glare" aria-hidden="true" />
      <span className="dev-off" aria-hidden="true" data-device-off />
    </div>
  );
}

/** Monitor da scrivania: vetro nero, mento in alluminio, collo e piede. */
export function DeviceMonitor({
  className = "",
  ...screen
}: ScreenProps & { className?: string }) {
  return (
    <figure className={`dev-monitor ${className}`} data-browser-frame data-device>
      <div className="dev-monitor-body" data-device-body>
        <div className="dev-monitor-glass">
          <Screen {...screen} />
        </div>
        <div className="dev-monitor-chin" aria-hidden="true" />
      </div>
      <div className="dev-monitor-neck" aria-hidden="true" />
      <div className="dev-monitor-foot" aria-hidden="true" />
      <div className="dev-floor" aria-hidden="true" />
    </figure>
  );
}

/** Tablet in orizzontale: cornice nera sottile, bordo in alluminio, fotocamera sul lato lungo. */
export function DeviceTablet({
  className = "",
  ...screen
}: ScreenProps & { className?: string }) {
  return (
    <figure className={`dev-tablet ${className}`} data-browser-frame data-device>
      <div className="dev-tablet-body" data-device-body>
        <span className="dev-tablet-cam" aria-hidden="true" />
        <Screen fit="object-[center_top]" {...screen} />
      </div>
      <div className="dev-floor" aria-hidden="true" />
    </figure>
  );
}
