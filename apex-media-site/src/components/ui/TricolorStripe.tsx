type Props = {
  className?: string;
  style?: React.CSSProperties;
  vertical?: boolean;
  "data-progress"?: string;
  "data-fill"?: string;
};

/** Firma grafica: viola → blu → giallo, 3px. */
export function TricolorStripe({ className = "", vertical = false, ...rest }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`flex ${vertical ? "h-full w-[3px] flex-col" : "h-[3px] w-full"} ${className}`}
      {...rest}
    >
      <span className="flex-1 bg-viola" />
      <span className="flex-1 bg-blu" />
      <span className="flex-1 bg-giallo" />
    </div>
  );
}
