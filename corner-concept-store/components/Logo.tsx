import { LOGO } from "./logo-data";

/** I tracciati stanno qui una volta sola; i loghi in pagina li richiamano con <use>. */
export function LogoSprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <path id="corner-parola" d={LOGO.parola} />
        <path id="corner-citta" d={LOGO.citta} />
        <path id="corner-citta-a" d={LOGO.cittaA} />
        <path id="corner-citta-testata" d={LOGO.cittaTestata} />
        <path id="corner-citta-testata-a" d={LOGO.cittaTestataA} />
      </defs>
    </svg>
  );
}

type LogoProps = {
  /**
   * "completo": come sul biglietto da visita. "testata": stesso logo con ALESSANDRIA un po' più grande,
   * per restare leggibile a misure piccole. "pillole": senza la città, come all'interno del biglietto.
   */
  variant?: "completo" | "testata" | "pillole";
  className?: string;
  /** null quando il logo sta dentro un link che ha già il suo nome accessibile. */
  label?: string | null;
};

export function Logo({ variant = "completo", className, label = "CORNER Concept Store, Alessandria" }: LogoProps) {
  const a11y = label === null ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": label };
  const city = variant === "testata" ? "corner-citta-testata" : "corner-citta";
  return (
    <svg viewBox={LOGO.viewBox} className={className} {...a11y}>
      <use href="#corner-parola" fill="currentColor" />
      {LOGO.pillole.map((p) => (
        <rect key={p.x} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.w / 2} fill={p.fill} />
      ))}
      {variant !== "pillole" ? (
        <>
          <use href={`#${city}`} fill="currentColor" />
          {/* le tre A stanno sulle pillole chiare: restano scure anche quando il logo è in crema */}
          <use href={`#${city}-a`} fill="var(--color-notte)" />
        </>
      ) : null}
    </svg>
  );
}
