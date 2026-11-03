"use client";

/** Bottone "Esporta PDF": apre la vista di stampa del mese e lancia Salva come PDF. */
export function BottoneStampa({ href, testo }: { href: string; testo: string }) {
  return (
    <a className="p-btn" href={href} target="_blank" rel="noopener" onClick={(e) => { e.preventDefault(); const w = window.open(href, "_blank"); if (!w) window.location.href = href; }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
      {testo}
    </a>
  );
}

export function AvviaStampa() {
  if (typeof window !== "undefined") setTimeout(() => window.print(), 600);
  return null;
}
