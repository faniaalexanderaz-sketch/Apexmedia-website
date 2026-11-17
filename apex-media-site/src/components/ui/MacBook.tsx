import type { ReactNode } from "react";

/**
 * Portatile disegnato solo in CSS (vedi .mac in globals.css): coperchio con cornice scura,
 * schermo, base in alluminio. Nessuna immagine e nessun marchio.
 * Tutte le misure sono in cqw, quindi scala con la larghezza che gli dai.
 */
export function MacBook({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mac ${className}`} data-mac>
      <div className="mac-lid" data-mac-lid>
        <div className="mac-bezel">
          <span className="mac-cam" aria-hidden="true" />
          <div className="mac-screen" data-mac-screen>
            {children}
            <span className="mac-veil" data-mac-veil aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="mac-base" aria-hidden="true">
        <span className="mac-scoop" />
      </div>
      <div className="mac-shadow" aria-hidden="true" />
    </div>
  );
}
