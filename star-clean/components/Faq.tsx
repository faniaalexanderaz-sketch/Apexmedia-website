import { faq } from "@/content/faq";

export function Faq() {
  return (
    <div className="border-linea border-t">
      {faq.map((f) => (
        <details key={f.domanda} className="group border-linea border-b">
          <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-[1.125rem] leading-snug font-bold [&::-webkit-details-marker]:hidden">
            {f.domanda}
            <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="shrink-0 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 0v16M0 8h16" />
            </svg>
          </summary>
          <p className="testo-2 misura pb-6">{f.risposta}</p>
        </details>
      ))}
    </div>
  );
}
