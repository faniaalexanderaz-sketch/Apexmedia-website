import Link from "next/link";

type Props = {
  className?: string;
  /** Su sfondo scuro il wordmark passa a carta */
  onDark?: boolean;
  href?: string;
};

/**
 * Marchio Apex: la geometria del logo originale (triangolo con tratto destro
 * staccato e piccolo triangolo interno) ridisegnata in un solo colore.
 * L’originale in cristallo è in /public/brand/apex-logo-original.webp.
 */
export function ApexMark({
  className = "",
  size = 26,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * (26 / 28)}
      viewBox="0 0 28 26"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M14 0 L0 26 L7.2 26 L17.6 6.6 Z" />
      <path d="M18.9 9.2 L28 26 L20.9 26 L15.2 15.6 Z" />
      <path d="M13.4 14.2 L17.3 21.4 L9.5 21.4 Z" />
    </svg>
  );
}

export function Logo({ className = "", onDark = false, href = "/" }: Props) {
  return (
    <Link
      href={href}
      aria-label="Apex Media, vai all’inizio"
      className={`inline-flex items-center gap-2.5 ${onDark ? "text-paper" : "text-ink"} ${className}`}
    >
      <ApexMark />
      <span className="font-display text-[17px] font-bold sm:text-[19px] leading-none tracking-tightest">
        APEX<span className="text-viola"> MEDIA</span>
      </span>
    </Link>
  );
}
