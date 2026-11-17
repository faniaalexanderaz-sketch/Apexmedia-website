"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useCartUI } from "@/components/cart/CartProvider";
import { SizeGuide } from "@/components/product/SizeGuide";
import { EtichetteProdotto } from "@/components/ui/Etichette";
import { ChiudiPannello, Pannello } from "@/components/ui/Pannello";
import { cartStore } from "@/lib/cart";
import { euro } from "@/lib/format";
import { isSoldOut, type Product } from "@/lib/products";
import { CARRIER, FREE_SHIPPING_FROM, RETURN_DAYS, SHIPPING_COST } from "@/lib/shipping";
import { SITE, whatsappLink } from "@/lib/site";

export function BuyBox({ product }: { product: Product }) {
  const soldOut = isSoldOut(product);
  const available = product.sizes.filter((s) => s.stock > 0);
  const [size, setSize] = useState<string | null>(available.length === 1 ? available[0].label : null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const { open } = useCartUI();
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const uid = useId();

  const selected = product.sizes.find((s) => s.label === size);
  const single = product.sizes.length === 1;

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(cta);
    // in fondo alla pagina la barra si fa da parte: non deve coprire il piè di pagina
    const footer = document.querySelector("footer");
    const footerObserver = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    if (footer) footerObserver.observe(footer);
    return () => {
      observer.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const stickyHidden = ctaVisible || footerVisible;

  const add = () => {
    if (!size) {
      setError(true);
      sizesRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      sizesRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    const added = cartStore.add(product.slug, size);
    setNotice(added === 0 ? "È già nel carrello: in questa taglia non ne abbiamo altri." : null);
    open();
  };

  const lowStock =
    selected && !product.unique && selected.stock <= 2
      ? selected.stock === 1
        ? `Ultimo pezzo in taglia ${selected.label}`
        : `Ultimi 2 pezzi in taglia ${selected.label}`
      : null;

  return (
    <div>
      <p className="occhiello text-marrone">{product.brand}</p>
      <h1 className="titolo mt-2 text-[2.125rem] [text-wrap:balance] md:text-[2.75rem]">{product.name}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className={`cifre text-2xl font-semibold ${soldOut ? "line-through decoration-1" : ""}`}>{euro(product.price)}</p>
        <EtichetteProdotto product={product} />
      </div>
      {!soldOut ? (
        <p className="mt-1.5 text-[0.8125rem] text-marrone">
          oppure 3 rate da <span className="cifre font-semibold text-verde">{euro(product.price / 3, { decimals: true })}</span>{" "}
          senza interessi con Klarna
        </p>
      ) : null}

      <p className="mt-5 max-w-[52ch] text-[0.9375rem] leading-relaxed">{product.description}</p>
      {product.measurements ? (
        <p className="cifre mt-3 text-[0.8125rem] leading-relaxed text-marrone">
          <span className="font-semibold text-verde">Misure di questo pezzo.</span> {product.measurements}
        </p>
      ) : null}

      {/* taglie */}
      <fieldset ref={sizesRef} className="mt-7" aria-describedby={error ? `${uid}-errore` : undefined}>
        <div className="flex items-baseline justify-between">
          <legend className="float-left text-sm font-semibold">
            Taglia{selected ? <span className="font-normal text-marrone">: {selected.label}</span> : null}
          </legend>
          {product.sizeType !== "unica" ? (
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              aria-haspopup="dialog"
              className="link-riga -my-2 min-h-11 text-[0.8125rem] font-medium"
            >
              Guida taglie
            </button>
          ) : null}
        </div>
        <div className="clear-both mt-2.5 flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const out = s.stock === 0;
            return (
              <label
                key={s.label}
                className={`pillola min-w-[3.25rem] text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-verde ${
                  out
                    ? "cursor-not-allowed border-linea text-marrone/50 line-through decoration-1"
                    : "cursor-pointer has-[:checked]:border-verde has-[:checked]:bg-verde has-[:checked]:text-crema hover:border-verde"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-taglia`}
                  value={s.label}
                  checked={size === s.label}
                  disabled={out}
                  onChange={() => {
                    setSize(s.label);
                    setError(false);
                    setNotice(null);
                  }}
                  className="sr-only"
                />
                {s.label}
                {out ? <span className="sr-only"> esaurita</span> : null}
              </label>
            );
          })}
        </div>
        {error ? (
          <p id={`${uid}-errore`} role="alert" className="mt-2.5 text-sm font-semibold text-errore">
            Scegli una taglia per aggiungerlo al carrello.
          </p>
        ) : null}
        {lowStock ? <p className="mt-2.5 text-[0.8125rem] font-semibold text-ruggine">{lowStock}</p> : null}
        {single && product.unique && !soldOut ? (
          <p className="mt-2.5 text-[0.8125rem] text-marrone">Ne esiste uno solo, in questa taglia.</p>
        ) : null}
      </fieldset>

      {/* azione principale */}
      <div className="mt-6">
        {soldOut ? (
          <>
            <button type="button" disabled className="bottone bottone-pieno w-full">
              Venduto
            </button>
            <a
              href={whatsappLink(`Ciao Corner, avvisatemi se arriva un altro pezzo come: ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="bottone bottone-contorno mt-3 w-full"
            >
              Avvisami se ne arriva un altro
            </a>
          </>
        ) : (
          <button ref={ctaRef} type="button" onClick={add} className="bottone bottone-pieno w-full text-[0.9375rem]">
            Aggiungi al carrello
            <span aria-hidden="true">·</span>
            <span className="cifre">{euro(product.price)}</span>
          </button>
        )}
        {notice ? (
          <p role="status" className="mt-2.5 text-[0.8125rem] font-medium text-ruggine">
            {notice}
          </p>
        ) : null}
        <p className="mt-3 text-center text-xs leading-relaxed text-marrone">
          Pagamento sicuro · Reso entro {RETURN_DAYS} giorni · Spedizione tracciata {CARRIER}
        </p>
      </div>

      {/* spedizione, ritiro, resi, pagamenti */}
      <dl className="mt-7 border-t border-linea text-[0.8125rem] leading-relaxed">
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-4 border-b border-linea py-3">
          <dt className="font-semibold">Spedizione</dt>
          <dd className="text-marrone">
            {CARRIER}, in tutta Italia in 24/48h.{" "}
            {product.price >= FREE_SHIPPING_FROM ? (
              <span className="font-semibold text-verde">Questo capo viaggia gratis.</span>
            ) : (
              <>
                {euro(SHIPPING_COST, { decimals: true })}, gratis sopra i {FREE_SHIPPING_FROM} €.
              </>
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-4 border-b border-linea py-3">
          <dt className="font-semibold">Ritira in negozio</dt>
          <dd className="text-marrone">
            {SITE.address.street}, <span className="font-semibold text-verde">gratis</span>. Lo scegli al checkout e te lo
            teniamo da parte.
          </dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-4 border-b border-linea py-3">
          <dt className="font-semibold">Resi</dt>
          <dd className="text-marrone">Hai {RETURN_DAYS} giorni dalla consegna per ripensarci, anche sui pezzi unici.</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-4 border-b border-linea py-3">
          <dt className="font-semibold">Pagamenti</dt>
          <dd className="text-marrone">Carta, PayPal, Satispay, Klarna in 3 rate.</dd>
        </div>
      </dl>

      <Pannello open={guideOpen} onClose={() => setGuideOpen(false)} side="centro" labelledBy={`${uid}-guida`}>
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-center justify-between border-b border-linea px-5 py-2.5">
            <h2 id={`${uid}-guida`} className="titolo text-[1.625rem]">
              Guida taglie
            </h2>
            <ChiudiPannello onClose={() => setGuideOpen(false)} />
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 py-5">
            <SizeGuide sizeType={product.sizeType} productName={product.name} />
          </div>
        </div>
      </Pannello>

      {/* su mobile il bottone segue lo scorrimento */}
      {!soldOut ? (
        <div
          aria-hidden={stickyHidden}
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-crema px-4 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 transition-transform duration-200 ease-out lg:hidden ${
            stickyHidden ? "pointer-events-none translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-medium">{product.name}</p>
              <p className="cifre text-[0.8125rem] text-marrone">
                <span className="font-semibold text-verde">{euro(product.price)}</span>
                {selected ? ` · Taglia ${selected.label}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={add}
              tabIndex={stickyHidden ? -1 : 0}
              className="bottone bottone-pieno min-h-12 shrink-0 px-5"
            >
              {size ? "Aggiungi al carrello" : "Scegli la taglia"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
