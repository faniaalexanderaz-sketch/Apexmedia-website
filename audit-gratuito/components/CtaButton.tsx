import { IconArrowRight } from "./icons";

export function CtaButton({
  className = "",
  label = "Richiedi il mio audit gratuito",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href="#form"
      className={`cta-yellow group inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-bold tracking-tight shadow-[0_10px_40px_-8px_rgba(255,216,77,0.45)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_14px_50px_-8px_rgba(255,216,77,0.6)] active:scale-[0.98] sm:text-base ${className}`}
    >
      {label}
      <IconArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  );
}
