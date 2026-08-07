import type { ReactNode } from "react";
import { TriStripe } from "./TriStripe";

export function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  align?: "center" | "left";
}) {
  const alignment =
    align === "center" ? "mx-auto items-center text-center" : "items-start text-left";

  return (
    <div className={`flex max-w-[640px] flex-col ${alignment}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-[1.85rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <TriStripe className="mt-5" />
    </div>
  );
}
