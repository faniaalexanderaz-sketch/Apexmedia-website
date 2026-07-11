import Link from "next/link";

type Tone = "plain" | "orange" | "blueviolet";

const priceClass: Record<Tone, string> = {
  plain: "text-foreground",
  orange: "text-orange-bright",
  blueviolet: "text-gradient-price",
};

const bulletClass: Record<Tone, string> = {
  plain: "bg-violet-bright",
  orange: "bg-orange-bright",
  blueviolet: "bg-blue-bright",
};

const cardClass: Record<Tone, string> = {
  plain: "border-hairline bg-white/[0.02]",
  orange: "border-orange/50 bg-gradient-to-b from-orange/10 to-transparent shadow-[0_0_80px_-25px_rgba(245,166,35,0.5)]",
  blueviolet: "border-blue/30 bg-gradient-to-b from-[#1a1330] to-[#0d0a13] shadow-[0_0_80px_-25px_rgba(91,155,245,0.35)]",
};

const ctaClass: Record<Tone, string> = {
  plain: "border border-hairline text-foreground hover:border-violet/50",
  orange: "bg-gradient-to-r from-orange to-orange-bright text-[#170c02] font-semibold",
  blueviolet: "border border-blue/40 text-blue-bright hover:bg-blue/10",
};

export default function PricingCard({
  tier,
  badge,
  tagline,
  price,
  features,
  ctaLabel,
  tone,
  featured = false,
}: {
  tier: string;
  badge: string;
  tagline: string;
  price: number;
  features: string[];
  ctaLabel: string;
  tone: Tone;
  featured?: boolean;
}) {
  return (
    <div className={`relative rounded-3xl border p-8 ${cardClass[tone]}`}>
      {featured && (
        <span className="eyebrow absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange to-orange-bright px-4 py-1 text-[10px] uppercase text-[#170c02]">
          Più scelto
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="eyebrow text-xs uppercase text-muted">{tier}</span>
        <span className="eyebrow rounded-full border border-hairline px-3 py-1 text-[10px] uppercase text-muted">
          {badge}
        </span>
      </div>

      <p className="accent mt-4 text-muted">{tagline}</p>

      <p className="mt-6 flex items-end gap-2">
        <span className="text-lg text-muted">€</span>
        <span className={`font-display text-6xl font-extrabold ${priceClass[tone]}`}>{price}</span>
        <span className="eyebrow text-sm text-muted">/mese</span>
      </p>

      <div className="mt-6 border-t border-hairline pt-6">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-foreground/85">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass[tone]}`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/#contatti"
        className={`eyebrow mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs uppercase transition-transform duration-500 hover:scale-[1.02] ${ctaClass[tone]}`}
      >
        {ctaLabel} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
