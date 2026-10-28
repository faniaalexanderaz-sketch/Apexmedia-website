type Props = { className?: string; style?: React.CSSProperties; "data-progress"?: string };

/** Firma grafica: viola → blu → giallo, 3px. */
export function TricolorStripe({ className = "", ...rest }: Props) {
  return (
    <div aria-hidden="true" className={`flex h-[3px] w-full ${className}`} {...rest}>
      <span className="h-full flex-1 bg-viola" />
      <span className="h-full flex-1 bg-blu" />
      <span className="h-full flex-1 bg-giallo" />
    </div>
  );
}
