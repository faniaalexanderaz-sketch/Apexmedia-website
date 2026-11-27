import type { Domanda } from "@/content/servizi";

export function Faq({ domande }: { domande: Domanda[] }) {
  return (
    <div className="grid gap-3">
      {domande.map((f) => (
        <details key={f.domanda} className="group scheda px-6 open:shadow-[var(--shadow-2)]">
          <summary className="text-blu-notte flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.0625rem] leading-snug font-semibold [&::-webkit-details-marker]:hidden">
            {f.domanda}
            <span className="bg-cielo text-blu flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-open:rotate-45">
              <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M8 1v14M1 8h14" />
              </svg>
            </span>
          </summary>
          <p className="testo-2 misura pb-6">{f.risposta}</p>
        </details>
      ))}
    </div>
  );
}
