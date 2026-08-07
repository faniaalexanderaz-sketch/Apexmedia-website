type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconSpeed({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13 L16 9" />
      <path d="M9 4.5 L15 4.5" />
    </svg>
  );
}

export function IconNoConvert({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 4 L5 20 L19 20" />
      <path d="M8 16 L11 11 L14 13 L19 6" />
      <path d="M15.5 6 L19 6 L19 9.5" opacity="0.5" />
      <path d="M16 4 L20 8 M20 4 L16 8" stroke="#FFD84D" />
    </svg>
  );
}

export function IconInvisible({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.2 15.2 L20 20" />
      <path d="M8 8 L13 13 M13 8 L8 13" stroke="#FFD84D" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 12.5 L9.5 18 L20 6" />
    </svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M6 3 h3 l2 5 -2.5 2 a12 12 0 0 0 6.5 6.5 l2 -2.5 5 2 v3 a2 2 0 0 1 -2.2 2 A17 17 0 0 1 4 5.2 A2 2 0 0 1 6 3 Z" />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.5 7 L12 13 L19.5 7" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 12 L20 12" />
      <path d="M14 6 L20 12 L14 18" />
    </svg>
  );
}
