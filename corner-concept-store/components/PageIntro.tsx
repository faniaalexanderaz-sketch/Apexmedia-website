export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="border-b border-linea">
      <div className="pagina py-10 md:py-16">
        <p className="occhiello text-marrone">{eyebrow}</p>
        <h1 className="titolo mt-3 max-w-[16ch] text-[2.75rem] [text-wrap:balance] md:text-[4.5rem]">{title}</h1>
        {children ? <div className="mt-5 max-w-[56ch] text-[0.9375rem] leading-relaxed text-marrone md:text-base">{children}</div> : null}
      </div>
    </header>
  );
}

/** Blocco di testo con etichetta a sinistra, come le voci di un regolamento stampato. */
export function Voce({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-2 border-b border-linea py-7 md:grid-cols-12 md:py-9">
      <h2 className="titolo text-[1.75rem] md:col-span-4 md:text-[2rem]">{label}</h2>
      <div className="space-y-3 text-[0.9375rem] leading-relaxed md:col-span-7 md:col-start-6">{children}</div>
    </div>
  );
}
