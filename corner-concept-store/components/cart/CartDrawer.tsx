"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart, useCartUI } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { ChiudiPannello, Pannello } from "@/components/ui/Pannello";
import { cartStore, type CartLine } from "@/lib/cart";
import { euro } from "@/lib/format";
import { isSoldOut, productHref, products, type Product } from "@/lib/products";
import { FREE_SHIPPING_FROM, RETURN_DAYS, missingForFreeShipping } from "@/lib/shipping";

/** Un accessorio a taglia unica che da solo porta alla spedizione gratuita. */
function pickSuggestion(lines: CartLine[], missing: number): Product | null {
  if (missing <= 0) return null;
  const inCart = new Set(lines.map((l) => l.slug));
  const candidates = products
    .filter((p) => p.sizeType === "unica" && !inCart.has(p.slug) && !isSoldOut(p) && p.price >= missing)
    .sort((a, b) => a.price - b.price);
  return candidates[0] ?? null;
}

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const missing = missingForFreeShipping(subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_FROM);
  return (
    <div>
      <p className="text-[0.8125rem] leading-snug" aria-live="polite">
        {missing > 0 ? (
          <>
            Ti mancano <strong className="cifre font-semibold">{euro(missing, { decimals: true })}</strong> per la
            spedizione gratuita
          </>
        ) : (
          <strong className="font-semibold">La spedizione è gratuita</strong>
        )}
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-ombra"
        role="progressbar"
        aria-label="Avanzamento verso la spedizione gratuita"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_FROM}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_FROM)}
      >
        <div
          className="h-full origin-left rounded-full bg-verde transition-transform duration-200 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

function Quantity({ line }: { line: CartLine }) {
  if (line.max <= 1) {
    return <p className="text-xs text-marrone">{line.product.unique ? "Pezzo unico" : "Ultimo pezzo in questa taglia"}</p>;
  }
  return (
    <div className="inline-flex items-center rounded-full border border-linea-forte">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center text-lg leading-none"
        aria-label={`Togli un pezzo: ${line.product.name}`}
        onClick={() => cartStore.setQty(line.slug, line.size, line.qty - 1)}
      >
        −
      </button>
      <span className="cifre min-w-6 text-center text-sm font-semibold" aria-label={`Quantità ${line.qty}`}>
        {line.qty}
      </span>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center text-lg leading-none disabled:opacity-35"
        aria-label={`Aggiungi un pezzo: ${line.product.name}`}
        disabled={line.qty >= line.max}
        onClick={() => cartStore.setQty(line.slug, line.size, line.qty + 1)}
      >
        +
      </button>
    </div>
  );
}

export function CartDrawer() {
  const { isOpen, close } = useCartUI();
  const { lines, subtotal, count } = useCart();
  const missing = missingForFreeShipping(subtotal);
  const suggestion = useMemo(() => pickSuggestion(lines, missing), [lines, missing]);

  return (
    <Pannello open={isOpen} onClose={close} side="destra" labelledBy="carrello-titolo">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-linea px-5 py-2.5">
          <h2 id="carrello-titolo" className="titolo text-[1.625rem]">
            Carrello
            {count > 0 ? <span className="cifre ml-2 align-middle font-sans text-sm font-medium text-marrone">{count}</span> : null}
          </h2>
          <ChiudiPannello onClose={close} />
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-5 pb-16">
            <p className="titolo text-3xl">Qui non c&apos;è ancora niente.</p>
            <p className="mt-3 max-w-[32ch] text-sm text-marrone">
              I nuovi arrivi sono un buon punto di partenza: ci sono giacche, denim e qualche pezzo unico.
            </p>
            <Link href="/shop?ordina=novita" onClick={close} className="bottone bottone-pieno mt-6 self-start">
              Vedi i nuovi arrivi
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-linea px-5 py-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>

            <ul className="flex-1 overflow-y-auto overscroll-contain">
              {lines.map((line) => (
                <li key={`${line.slug}-${line.size}`} className="flex gap-4 border-b border-linea px-5 py-4">
                  <Link
                    href={productHref(line.product)}
                    onClick={close}
                    className="relative block h-[6.25rem] w-20 shrink-0 overflow-hidden bg-ombra [container-type:inline-size]"
                    aria-label={line.product.name}
                  >
                    <ProductImage src={line.product.images[0]?.src} alt="" name={line.product.name} sizes="80px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="occhiello text-marrone">{line.product.brand}</p>
                        <Link
                          href={productHref(line.product)}
                          onClick={close}
                          className="mt-1 block text-sm font-medium leading-snug hover:underline hover:decoration-1 hover:underline-offset-4"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-marrone">Taglia {line.size}</p>
                      </div>
                      <p className="cifre shrink-0 text-sm font-semibold">{euro(line.lineTotal)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <Quantity line={line} />
                      <button
                        type="button"
                        onClick={() => cartStore.remove(line.slug, line.size)}
                        className="link-riga min-h-10 text-xs text-marrone"
                        aria-label={`Rimuovi dal carrello: ${line.product.name}`}
                      >
                        Rimuovi
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {suggestion ? (
              <div className="flex items-center gap-3 border-t border-linea bg-carta px-5 py-3">
                <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-ombra [container-type:inline-size]">
                  <ProductImage src={suggestion.images[0]?.src} alt="" name={suggestion.name} sizes="44px" />
                </div>
                <p className="min-w-0 flex-1 text-xs leading-snug">
                  Con il <span className="font-semibold">{suggestion.name.toLowerCase()}</span> ({euro(suggestion.price)}) la
                  spedizione diventa gratuita.
                </p>
                <button
                  type="button"
                  className="pillola shrink-0 hover:border-verde hover:bg-verde hover:text-crema"
                  onClick={() => cartStore.add(suggestion.slug, suggestion.sizes[0].label)}
                >
                  Aggiungi
                </button>
              </div>
            ) : null}

            <div className="border-t border-linea px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Subtotale</p>
                <p className="cifre text-lg font-semibold">{euro(subtotal, { decimals: true })}</p>
              </div>
              <p className="mt-1 text-xs text-marrone">IVA inclusa. La spedizione si calcola al checkout.</p>
              <Link href="/checkout" onClick={close} className="bottone bottone-pieno mt-4 w-full">
                Vai al checkout
              </Link>
              <p className="mt-3 text-center text-[0.6875rem] leading-relaxed text-marrone">
                Carta, PayPal, Satispay, Klarna · Reso entro {RETURN_DAYS} giorni
              </p>
            </div>
          </>
        )}
      </div>
    </Pannello>
  );
}
