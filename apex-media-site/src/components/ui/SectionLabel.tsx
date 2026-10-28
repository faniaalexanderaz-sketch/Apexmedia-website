type Props = {
  numero: string;
  testo: string;
  className?: string;
  onDark?: boolean;
};

export function SectionLabel({
  numero,
  testo,
  className = "",
  onDark = false,
}: Props) {
  return (
    <p
      className={`label-mono flex items-center gap-2 ${onDark ? "text-paper/70" : "text-ink/60"} ${className}`}
    >
      <span className={onDark ? "text-paper" : "text-blu-deep"}>{numero}</span>
      <span aria-hidden="true">—</span>
      <span>{testo}</span>
    </p>
  );
}
