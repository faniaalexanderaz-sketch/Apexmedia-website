const PROBLEMI = [
  { label: "Caricamento lento", icon: "⏱" },
  { label: "Non ottimizzato mobile", icon: "📵" },
  { label: "Assente su Google", icon: "🔍" },
];

export function ScanMock() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[480px]">
      {/* badge fluttuanti — solo da tablet in su, per non affollare il mobile */}
      <div className="pointer-events-none absolute -right-6 top-8 z-20 hidden -rotate-3 items-center gap-2 rounded-xl border border-white/10 bg-[#0d0f1a]/90 px-3 py-2 text-xs font-semibold text-white/80 shadow-lg backdrop-blur sm:flex">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-yellow" />
        Caricamento lento
      </div>
      <div className="pointer-events-none absolute -left-8 bottom-16 z-20 hidden rotate-2 items-center gap-2 rounded-xl border border-white/10 bg-[#0d0f1a]/90 px-3 py-2 text-xs font-semibold text-white/80 shadow-lg backdrop-blur sm:flex">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-yellow" />
        Assente su Google
      </div>

      <div className="glass-card relative overflow-hidden rounded-2xl">
        {/* barra finta del browser */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 truncate rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/35">
            iltuosito.it
          </span>
        </div>

        {/* scheletro del sito */}
        <div className="space-y-3 p-5">
          <div className="h-3 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-white/[0.06]" />
          <div className="h-20 w-full rounded-lg bg-white/[0.05]" />
          <div className="flex gap-3">
            <div className="h-14 flex-1 rounded-lg bg-white/[0.05]" />
            <div className="h-14 flex-1 rounded-lg bg-white/[0.05]" />
          </div>
          <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
        </div>

        {/* linea di scansione tricolore, la firma del brand in movimento */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24 animate-scan bg-gradient-to-r from-purple/0 via-blue/60 to-yellow/0 opacity-70 blur-md"
        />
      </div>

      {/* chip impilate, sempre visibili (anche su mobile) */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:hidden">
        {PROBLEMI.map((p) => (
          <span
            key={p.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/70"
          >
            <span aria-hidden="true">{p.icon}</span>
            {p.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.14em] text-white/30">
        Esempio di audit
      </p>
    </div>
  );
}
