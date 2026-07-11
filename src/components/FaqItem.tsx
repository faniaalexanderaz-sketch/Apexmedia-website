"use client";

import { useState } from "react";

export default function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-hairline bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left"
      >
        <span className="font-display text-lg font-semibold sm:text-xl">{question}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open
              ? "rotate-45 bg-gradient-to-br from-orange to-orange-bright text-[#170c02]"
              : "border border-hairline text-foreground"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}
