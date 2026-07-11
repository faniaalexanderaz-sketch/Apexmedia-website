import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "cream" | "ghost";
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-orange to-orange-bright text-[#170c02] font-semibold hover:brightness-105",
    cream: "bg-[#f5f1e8] text-[#171018] font-accent italic",
    ghost: "border border-hairline text-foreground hover:border-violet/50 hover:text-violet-bright",
  };

  const iconWrap = {
    primary: "bg-black/10",
    cream: "bg-gradient-to-br from-orange to-orange-bright text-[#170c02]",
    ghost: "bg-white/5",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      <span>{children}</span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${iconWrap[variant]}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 12L12 2M12 2H4M12 2V10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
