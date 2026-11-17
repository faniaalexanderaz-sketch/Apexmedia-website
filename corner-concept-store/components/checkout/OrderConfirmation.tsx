"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useHydrated } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { euro } from "@/lib/format";
import { PAYMENT_LABELS, readOrder, type Order } from "@/lib/orders";
import { CARRIER } from "@/lib/shipping";
import { SITE, whatsappLink } from "@/lib/site";

function steps(order: Order): string[] {
  if (order.delivery === "ritiro") {
    return [
      "Mettiamo da parte i tuoi capi, con il tuo nome sopra.",
      "Ti scriviamo appena è tutto pronto.",
      `Passi in ${SITE.address.street} e dici il numero d'ordine. Fine.`,
    ];
  }
  return [
    `Pieghiamo e impacchettiamo in ${SITE.address.street}.`,
    `${CARRIER} ritira il pacco e ti manda il link per seguirlo.`,
    "Il corriere suona al tuo campanello. Se non ci sei, ripassa.",
  ];
}

export function OrderConfirmation() {
  const hydrated = useHydrated();
  const number = useSearchParams().get("n");
  const order = useMemo(() => (hydrated && number ? readOrder(number) : null), [hydrated, number]);

  if (!hydrated) {
    return (
      <div className="pagina py-16" aria-busy="true">
        <p className="text-sm text-marrone">Carichiamo il tuo ordine…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pagina py-16 md:py-24">
        <h1 className="titolo text-[2.5rem] md:text-6xl">Non troviamo questo ordine.</h1>
        <p className="mt-4 max-w-[48ch] text-[0.9375rem] leading-relaxed text-marrone">
          {number ? (
            <>
              L&apos;ordine <span className="cifre font-semibold text-verde">{number}</span> non risulta su questo dispositivo.{" "}
            </>
          ) : null}
          Se hai appena pagato, controlla l&apos;email di conferma oppure scrivici: lo ritroviamo noi.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(`Ciao Corner, vi scrivo per l'ordine ${number ?? ""}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="bottone bottone-pieno"
          >
            Scrivici su WhatsApp
          </a>
          <Link href="/shop" className="bottone bottone-contorno">
            Torna al catalogo
          </Link>
        </div>
      </div>
    );
  }

  const pickup = order.delivery === "ritiro";

  return (
    <>
      {/* seconda e ultima fascia di carta da parati del sito */}
      <div aria-hidden="true" className="carta-da-parati h-14 md:h-20" />

      <div className="pagina pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <p className="occhiello text-marrone">Ordine confermato</p>
            <h1 className="titolo mt-3 text-[2.75rem] [text-wrap:balance] md:text-[4.25rem]">
              Fatto, {order.customer.firstName}. {pickup ? "Te lo teniamo da parte." : "Lo stiamo già piegando."}
            </h1>

            <dl className="mt-8 grid border-t border-linea text-sm sm:grid-cols-2">
              <div className="border-b border-linea py-4 sm:pr-6">
                <dt className="occhiello text-marrone">Numero d&apos;ordine</dt>
                <dd className="cifre mt-2 text-xl font-semibold">{order.number}</dd>
              </div>
              <div className="border-b border-linea py-4 sm:border-l sm:pl-6">
                <dt className="occhiello text-marrone">{pickup ? "Ritiro" : "Consegna stimata"}</dt>
                <dd className="mt-2 text-[0.9375rem] font-semibold leading-snug">{order.estimate}</dd>
              </div>
              <div className="border-b border-linea py-4 sm:pr-6">
                <dt className="occhiello text-marrone">Email di conferma</dt>
                <dd className="mt-2 break-all">{order.customer.email}</dd>
              </div>
              <div className="border-b border-linea py-4 sm:border-l sm:pl-6">
                <dt className="occhiello text-marrone">{pickup ? "Dove" : "Indirizzo"}</dt>
                <dd className="mt-2 leading-snug">
                  {pickup ? (
                    <>
                      {SITE.name}, {SITE.address.street}, {SITE.address.city}
                    </>
                  ) : (
                    <>
                      {order.customer.firstName} {order.customer.lastName}
                      <br />
                      {order.customer.address}
                      <br />
                      {order.customer.zip} {order.customer.city} ({order.customer.province})
                    </>
                  )}
                </dd>
              </div>
            </dl>

            <h2 className="occhiello mt-10 text-marrone">Adesso cosa succede</h2>
            <ol className="mt-3 border-t border-linea">
              {steps(order).map((text, index) => (
                <li key={text} className="flex gap-4 border-b border-linea py-3.5 text-[0.9375rem]">
                  <span className="cifre w-6 shrink-0 text-sm font-semibold text-ruggine">0{index + 1}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border border-linea-forte p-5 md:p-6">
              <p className="titolo text-2xl md:text-[1.75rem]">Nel frattempo, seguici su Instagram.</p>
              <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-marrone">
                I nuovi arrivi e i drop di pezzi unici passano prima da @{SITE.instagram}. Chi ci segue arriva per primo.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="bottone bottone-pieno">
                  Segui @{SITE.instagram}
                </a>
                <Link href="/shop" className="bottone bottone-contorno">
                  Torna al catalogo
                </Link>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-marrone">
              Sito dimostrativo: non è stato addebitato nulla, nessuna email è partita e l&apos;ordine non verrà spedito.
            </p>
          </div>

          <aside className="lg:col-span-5" aria-label="Riepilogo dell'ordine">
            <div className="border border-linea-forte bg-carta p-5 md:p-7 lg:sticky lg:top-8">
              <h2 className="occhiello text-marrone">Riepilogo</h2>
              <ul className="mt-2">
                {order.lines.map((line) => (
                  <li key={`${line.slug}-${line.size}`} className="flex gap-3 border-b border-linea py-3">
                    <div className="relative h-[4.5rem] w-[3.6rem] shrink-0 overflow-hidden bg-ombra [container-type:inline-size]">
                      <ProductImage src={line.image} alt="" name={line.name} sizes="58px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.8125rem] font-medium leading-snug">{line.name}</p>
                      <p className="mt-1 text-xs text-marrone">
                        Taglia {line.size} · Quantità <span className="cifre">{line.qty}</span>
                      </p>
                    </div>
                    <p className="cifre shrink-0 text-[0.8125rem] font-semibold">{euro(line.lineTotal, { decimals: true })}</p>
                  </li>
                ))}
              </ul>
              <dl className="pt-4 text-sm">
                <div className="flex justify-between py-1.5">
                  <dt>Subtotale</dt>
                  <dd className="cifre">{euro(order.subtotal, { decimals: true })}</dd>
                </div>
                <div className="flex justify-between py-1.5">
                  <dt>{pickup ? "Ritiro in negozio" : `Spedizione ${CARRIER}`}</dt>
                  <dd className="cifre">{order.shipping === 0 ? "Gratis" : euro(order.shipping, { decimals: true })}</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-linea-forte pt-3">
                  <dt className="text-base font-semibold">Totale pagato</dt>
                  <dd className="cifre text-xl font-semibold">{euro(order.total, { decimals: true })}</dd>
                </div>
                <div className="mt-3 flex justify-between text-xs text-marrone">
                  <dt>Pagamento</dt>
                  <dd>{PAYMENT_LABELS[order.payment]}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
