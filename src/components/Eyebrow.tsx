export default function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold-bright">
      <span className="h-1 w-1 rounded-full bg-gold-bright" />
      {children}
    </span>
  );
}
