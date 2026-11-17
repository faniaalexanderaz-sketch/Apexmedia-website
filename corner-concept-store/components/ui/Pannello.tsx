"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  side: "destra" | "sinistra" | "basso" | "centro";
  labelledBy: string;
  children: ReactNode;
};

/**
 * Pannello modale su <dialog> nativo: focus intrappolato, Esc e sfondo inerte li gestisce il browser.
 */
export function Pannello({ open, onClose, side, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`pannello pannello-${side}`}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        // un clic sullo sfondo arriva sul dialog stesso, non sul contenuto
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

export function ChiudiPannello({ onClose, label = "Chiudi" }: { onClose: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="-mr-2 inline-flex min-h-11 items-center px-2 text-[0.8125rem] font-semibold tracking-wide underline decoration-1 underline-offset-4 hover:no-underline"
    >
      {label}
    </button>
  );
}
