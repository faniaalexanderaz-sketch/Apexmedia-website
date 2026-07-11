type StepColor = "violet" | "blue" | "orange" | "foreground";

const colorMap: Record<StepColor, string> = {
  violet: "text-violet-bright",
  blue: "text-blue-bright",
  orange: "text-orange-bright",
  foreground: "text-foreground",
};

export default function MethodStep({
  number,
  color,
  title,
  description,
}: {
  number: string;
  color: StepColor;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-hairline bg-white/[0.02] p-8">
      <p className={`font-display text-5xl font-extrabold ${colorMap[color]}`}>{number}</p>
      <div className="mt-5 h-px w-10 bg-hairline" />
      <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
