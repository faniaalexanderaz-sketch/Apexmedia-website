/**
 * Icone lineari del sito: un solo stile (24×24, tratto 1.5, estremità arrotondate).
 * Una per servizio, una per materiale, più le poche icone dell'interfaccia.
 */
const tracciati = {
  // servizi
  casa: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9v11h13V9" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  fabbrica: (
    <>
      <path d="M2.5 20.5h19" />
      <path d="M3.5 20.5V11l5 3v-3l5 3v-3l5 3V4.5h2.5v16" />
      <path d="M7 17h2M12 17h2" />
    </>
  ),
  pavimento: (
    <>
      <path d="M3 15.5 12 11l9 4.5-9 4.5-9-4.5Z" />
      <path d="m7.5 13.25 9 4.5M16.5 13.25l-9 4.5" />
      <path d="M12 3.5v4M9.5 5.5h5" />
    </>
  ),
  finestra: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="1.5" />
      <path d="M12 3.5v17M4 12h16" />
      <path d="m6.75 9.5 2.5-2.5M14.75 9.5l2.5-2.5" />
    </>
  ),
  tapparella: (
    <>
      <path d="M3.5 3.5h17v3h-17z" />
      <path d="M5 6.5v14M19 6.5v14" />
      <path d="M5 9.5h14M5 12.5h14M5 15.5h14" />
      <path d="M12 15.5v3" />
    </>
  ),
  // materiali
  marmo: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M3.5 9c3 0 4-2.5 7-2.5S14 9 20.5 8M8 20.5c0-3 2.5-4 5-4.5s4-2 3.5-5" />
    </>
  ),
  cementine: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M12 6.5 17.5 12 12 17.5 6.5 12Z" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  cemento: (
    <>
      <path d="M3.5 8.5 12 4.5l8.5 4-8.5 4-8.5-4Z" />
      <path d="m3.5 12.5 8.5 4 8.5-4M3.5 16.5l8.5 4 8.5-4" />
    </>
  ),
  cotto: (
    <>
      <path d="M3.5 3.5h17v17h-17z" />
      <path d="M3.5 9.25h17M3.5 14.75h17M9 3.5v5.75M15 9.25v5.5M9 14.75v5.75" />
    </>
  ),
  parquet: (
    <>
      <path d="m3.5 9 5-5 3 3-5 5zM12.5 9l5-5 3 3-5 5zM3.5 18l5-5 3 3-5 5zM12.5 18l5-5 3 3-5 5z" />
    </>
  ),
  // interfaccia
  telefono: (
    <path d="M5 3.5h3.5l1.5 4.5-2.25 1.5a11 11 0 0 0 6.75 6.75L16 14l4.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5Z" />
  ),
  freccia: <path d="M5 12h14M13 6l6 6-6 6" />,
  spunta: <path d="m4.5 12.5 5 5 10-11" />,
  famiglia: (
    <>
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16.5" cy="8.5" r="2" />
      <path d="M3.5 19.5v-2a4.5 4.5 0 0 1 9 0v2M13.5 19.5v-1.5a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  documento: (
    <>
      <path d="M6 3.5h8l4 4v13H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
    </>
  ),
  orologio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5v-1a7 7 0 0 1 14 0v1" />
    </>
  ),
  sopralluogo: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5.5 5.5" />
    </>
  ),
  spazzola: (
    <>
      <path d="M14.5 3.5 9 12.5" />
      <path d="M5.5 12.5h7l1 3h-9z" />
      <path d="M5 15.5 3.5 20.5M8 15.5l-.5 5M11 15.5l.5 5M14 15.5l1.5 5" />
    </>
  ),
  posizione: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
};

export type NomeIcona = keyof typeof tracciati;

export function Icona({ nome, className = "h-6 w-6", spessore = 1.5 }: { nome: NomeIcona; className?: string; spessore?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={spessore}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {tracciati[nome]}
    </svg>
  );
}

/** Logo WhatsApp semplificato (riconoscibile, nello stesso tratto). */
export function IconaWhatsApp({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.5 20.5 5 16.2A8.5 8.5 0 1 1 8 19.2Z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.75-2-1-1 .9a5 5 0 0 1-2.65-2.65l.9-1-1-2Z" />
    </svg>
  );
}
