import type { ReactNode } from "react";

type GlowColor = "violet" | "blue" | "orange";

const borderMap: Record<GlowColor, string> = {
  violet: "border-violet/30 shadow-[0_0_60px_-20px_rgba(139,109,246,0.45)]",
  blue: "border-blue/30 shadow-[0_0_60px_-20px_rgba(91,155,245,0.45)]",
  orange: "border-orange/30 shadow-[0_0_60px_-20px_rgba(245,166,35,0.45)]",
};

export default function GlowCard({
  children,
  color = "violet",
  className = "",
}: {
  children: ReactNode;
  color?: GlowColor;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border bg-white/[0.02] p-8 backdrop-blur-sm ${borderMap[color]} ${className}`}
    >
      {children}
    </div>
  );
}
