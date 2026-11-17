import { LOGO } from "./logo-data";

const PILL_COLORS = ["var(--color-terracotta)", "var(--color-oliva)", "var(--color-terracotta)"];

/** I tracciati stanno qui una volta sola; i loghi in pagina li richiamano con <use>. */
export function LogoSprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      <defs>
        <path id="corner-parola" d={LOGO.parola} />
        <path id="corner-citta" d={LOGO.citta} />
      </defs>
    </svg>
  );
}

type LogoProps = {
  /** "completo": parola, tre pillole e ALESSANDRIA. "compatto": senza la città, per le misure piccole. */
  variant?: "completo" | "compatto";
  className?: string;
  /** null quando il logo sta dentro un link che ha già il suo nome accessibile. */
  label?: string | null;
};

export function Logo({ variant = "completo", className, label = "CORNER Concept Store, Alessandria" }: LogoProps) {
  const a11y = label === null ? { "aria-hidden": true as const } : { role: "img" as const, "aria-label": label };
  return (
    <svg viewBox={LOGO.viewBox} className={className} {...a11y}>
      {/* a misure piccole le grazie sottili del Bodoni spariscono: un filo di contorno le tiene in vita */}
      <use
        href="#corner-parola"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={variant === "compatto" ? 5 : 3}
        strokeLinejoin="round"
      />
      {LOGO.pillole.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.w / 2} fill={PILL_COLORS[i]} />
      ))}
      {variant === "completo" ? <use href="#corner-citta" fill="currentColor" /> : null}
    </svg>
  );
}
