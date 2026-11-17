"use client";

import { useCart, useCartUI } from "@/components/cart/CartProvider";

export function CartButton() {
  const { open } = useCartUI();
  const { count } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count ? `Apri il carrello: ${count} ${count === 1 ? "capo" : "capi"}` : "Apri il carrello: vuoto"}
      className="group inline-flex min-h-11 items-center gap-2 text-[0.8125rem] font-semibold tracking-wide"
    >
      <span className="underline-offset-4 group-hover:underline group-hover:decoration-1">Carrello</span>
      <span
        aria-hidden="true"
        className={`cifre inline-flex h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold leading-none ${
          count ? "bg-arancio text-notte" : "border border-linea-forte text-marrone"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
