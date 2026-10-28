import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "link";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-semibold select-none transition-colors";

const variants: Record<Variant, string> = {
  primary:
    "bg-giallo text-ink rounded-sm whitespace-nowrap hover:bg-ink hover:text-paper",
  secondary:
    "bg-transparent text-ink rounded-sm border border-ink whitespace-nowrap hover:bg-ink hover:text-paper",
  link:
    "bg-transparent text-ink text-left underline underline-offset-[6px] decoration-1 hover:text-viola px-0",
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
