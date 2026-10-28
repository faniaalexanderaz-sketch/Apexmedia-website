import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "link";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold select-none";

/* Riempimento che scorre da sinistra (pseudo-elemento con scaleX), nessuna ombra. */
const fill =
  "relative isolate overflow-hidden rounded-sm whitespace-nowrap transition-colors duration-300 before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ink before:transition-transform before:duration-[420ms] before:ease-[cubic-bezier(.2,.8,.2,1)] before:content-[''] hover:before:scale-x-100 focus-visible:before:scale-x-100";

const variants: Record<Variant, string> = {
  primary: `${fill} bg-giallo text-ink hover:text-giallo focus-visible:text-giallo`,
  secondary: `${fill} bg-transparent text-ink border border-ink hover:text-paper focus-visible:text-paper`,
  link: "u-link text-ink text-left px-0 hover:text-viola",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 text-[16px]",
  sm: "min-h-11 px-3.5 text-[14px] sm:px-4 sm:text-[15px]",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };
type AnchorProps = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: AnchorProps | ButtonProps) {
  const { variant = "primary", size = "md", className = "", children, ...rest } = props;
  const cls = `${base} ${variants[variant]} ${variant === "link" ? "" : sizes[size]} ${className}`;
  if ("href" in rest && typeof rest.href === "string") {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...a} className={cls}>
        {children}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...b} className={cls}>
      {children}
    </button>
  );
}
