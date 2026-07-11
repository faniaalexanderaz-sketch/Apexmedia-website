type EyebrowColor = "violet" | "blue" | "orange";

const colorMap: Record<EyebrowColor, string> = {
  violet: "text-violet-bright",
  blue: "text-blue-bright",
  orange: "text-orange-bright",
};

export default function Eyebrow({
  children,
  color = "violet",
  lines = false,
}: {
  children: string;
  color?: EyebrowColor;
  lines?: boolean;
}) {
  const content = (
    <span className={`eyebrow inline-flex items-center gap-2 text-[11px] uppercase ${colorMap[color]}`}>
      <span className={`h-1 w-1 rounded-full ${colorMap[color].replace("text-", "bg-")}`} />
      {children}
    </span>
  );

  if (!lines) return content;

  return (
    <span className="flex items-center justify-center gap-4">
      <span className="h-px w-8 bg-hairline sm:w-16" />
      {content}
      <span className="h-px w-8 bg-hairline sm:w-16" />
    </span>
  );
}
