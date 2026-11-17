"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCart, useHydrated } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { cartStore, type CartLine } from "@/lib/cart";
import { euro } from "@/lib/format";
import { PAYMENT_LABELS, saveOrder, type Order, type OrderRequest, type PaymentMethod } from "@/lib/orders";
import {
  CARRIER,
  FREE_SHIPPING_FROM,
  RETURN_DAYS,
  SHIPPING_COST,
  missingForFreeShipping,
  shippingCost,
  type Delivery,
} from "@/lib/shipping";
import { SITE } from "@/lib/site";
import {
  EMPTY_FIELDS,
  EXPIRED_CARD,
  FIELD_ORDER,
  formatCardNumber,
  formatExpiry,
  validateCheckout,
  type CheckoutFields,
  type FieldErrors,
  type FieldName,
} from "@/lib/validation";

const TEST_CARD = { cardNumber: "4242 4242 4242 4242", cardExpiry: "12/30", cardCvc: "123" };

const PAY_BUTTON: Record<PaymentMethod, (total: string) => string> = {
  carta: (total) => `Paga ${total}`,
  paypal: (total) => `Paga ${total} con PayPal`,
  satispay: (total) => `Paga ${total} con Satispay`,
  klarna: () => "Paga in 3 rate con Klarna",
};

type FieldProps = {
  name: FieldName;
  label: string;
  values: CheckoutFields;
  errors: FieldErrors;
  shown: Partial<Record<FieldName, boolean>>;
  onChange: (name: FieldName, value: string) => void;
  onBlur: (name: FieldName) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  placeholder?: string;
  maxLength?: number;
  hint?: string;
  className?: string;
};

function Field({
  name,
  label,
  values,
  errors,
  shown,
  onChange,
  onBlur,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  maxLength,
  hint,
  className = "",
}: FieldProps) {
  const id = useId();
  const error = shown[name] ? errors[name] : undefined;
  const describedBy = [error ? `${id}-errore` : null, hint ? `${id}-aiuto` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[0.8125rem] font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={name}
        data-field={name}
        type={type}
        value={values[name]}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="campo"
      />
      {hint && !error ? (
        <p id={`${id}-aiuto`} className="mt-1.5 text-xs text-marrone">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-errore`} role="alert" className="mt-1.5 text-xs font-semibold text-errore">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-linea py-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-3">
        <span className="cifre text-sm font-semibold text-ruggine">0{n}</span>
        <span className="titolo text-[1.75rem] md:text-[2rem]">{title}</span>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  note,
  price,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note?: string;
  price?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`border ${checked ? "border-verde bg-carta" : "border-linea-forte"} transition-colors duration-150`}>
      <label className="flex min-h-[3.5rem] cursor-pointer items-start gap-3 px-4 py-3.5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="mt-[0.2rem] h-4 w-4 shrink-0 accent-[var(--color-verde)]"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          {note ? <span className="mt-0.5 block text-[0.8125rem] leading-snug text-marrone">{note}</span> : null}
        </span>
        {price ? <span className="cifre shrink-0 text-sm font-semibold">{price}</span> : null}
      </label>
      {checked && children ? <div className="border-t border-linea px-4 pb-4 pt-4">{children}</div> : null}
    </div>
  );
}

function SummaryLines({ lines }: { lines: CartLine[] }) {
  return (
    <ul>
      {lines.map((line) => (
        <li key={`${line.slug}-${line.size}`} className="flex gap-3 border-b border-linea py-3">
          <div className="relative h-[4.5rem] w-[3.6rem] shrink-0 overflow-hidden bg-ombra [container-type:inline-size]">
            <ProductImage src={line.product.images[0]?.src} alt="" name={line.product.name} sizes="58px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.8125rem] font-medium leading-snug">{line.product.name}</p>
            <p className="mt-1 text-xs text-marrone">
              Taglia {line.size} · Quantità <span className="cifre">{line.qty}</span>
            </p>
          </div>
          <p className="cifre shrink-0 text-[0.8125rem] font-semibold">{euro(line.lineTotal, { decimals: true })}</p>
        </li>
      ))}
    </ul>
  );
}

function Totals({ subtotal, shipping, delivery }: { subtotal: number; shipping: number; delivery: Delivery }) {
  return (
    <dl className="text-sm">
      <div className="flex justify-between py-1.5">
        <dt>Subtotale</dt>
        <dd className="cifre">{euro(subtotal, { decimals: true })}</dd>
      </div>
      <div className="flex justify-between py-1.5">
        <dt>{delivery === "ritiro" ? "Ritiro in negozio" : `Spedizione ${CARRIER}`}</dt>
        <dd className="cifre">{shipping === 0 ? "Gratis" : euro(shipping, { decimals: true })}</dd>
      </div>
      <div className="mt-2 flex items-baseline justify-between border-t border-linea-forte pt-3">
        <dt className="text-base font-semibold">Totale</dt>
        <dd className="cifre text-xl font-semibold">{euro(subtotal + shipping, { decimals: true })}</dd>
      </div>
      <p className="mt-1 text-right text-xs text-marrone">IVA inclusa</p>
    </dl>
  );
}

export function CheckoutForm() {
  const hydrated = useHydrated();
  const { lines, subtotal, count } = useCart();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<CheckoutFields>(EMPTY_FIELDS);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [delivery, setDelivery] = useState<Delivery>("spedizione");
  const [payment, setPayment] = useState<PaymentMethod>("carta");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  // la scadenza rifiutata all'ultimo invio: "scaduta" dipende dalla data, e la data si legge solo al clic
  const [expiredValue, setExpiredValue] = useState<string | null>(null);

  // Se si torna a questa pagina dopo un ordine, lo stato "fatto" non deve restare appeso.
  useLayoutEffect(() => {
    return () => setStatus("idle");
  }, []);

  const shipping = shippingCost(subtotal, delivery);
  const total = subtotal + shipping;
  const missing = missingForFreeShipping(subtotal);

  const errors = useMemo(() => {
    const result = validateCheckout(values, delivery, payment, null);
    if (payment === "carta" && !result.cardExpiry && expiredValue !== null && values.cardExpiry === expiredValue) {
      result.cardExpiry = EXPIRED_CARD;
    }
    return result;
  }, [values, delivery, payment, expiredValue]);
  const shown = useMemo(() => {
    if (!submitted) return touched;
    return Object.fromEntries(FIELD_ORDER.map((name) => [name, true])) as Record<FieldName, boolean>;
  }, [submitted, touched]);

  const onChange = (name: FieldName, raw: string) => {
    let value = raw;
    if (name === "cardNumber") value = formatCardNumber(raw);
    if (name === "cardExpiry") value = formatExpiry(raw);
    if (name === "cardCvc" || name === "zip") value = raw.replace(/\D/g, "");
    if (name === "province") value = raw.replace(/[^A-Za-z]/g, "").toUpperCase();
    setValues((current) => ({ ...current, [name]: value }));
  };
  const onBlur = (name: FieldName) => setTouched((current) => ({ ...current, [name]: true }));
  const field = { values, errors, shown, onChange, onBlur };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);

    const current = validateCheckout(values, delivery, payment, new Date());
    setExpiredValue(current.cardExpiry === EXPIRED_CARD ? values.cardExpiry : null);
    const firstInvalid = FIELD_ORDER.find((name) => current[name]);
    if (firstInvalid) {
      const input = formRef.current?.querySelector<HTMLInputElement>(`[data-field="${firstInvalid}"]`);
      input?.focus({ preventScroll: true });
      input?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setStatus("sending");
    // Al server vanno carrello, consegna e contatti. I dati della carta restano nel browser.
    const payload: OrderRequest = {
      items: lines.map((l) => ({ slug: l.slug, size: l.size, qty: l.qty })),
      delivery,
      payment,
      customer: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        zip: values.zip,
        city: values.city,
        province: values.province,
      },
    };

    try {
      const [response] = await Promise.all([
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        new Promise((resolve) => setTimeout(resolve, 900)),
      ]);
      const data = (await response.json()) as { order?: Order; error?: string };
      if (!response.ok || !data.order) {
        setServerError(data.error ?? "Il pagamento non è andato a buon fine. Riprova tra un momento.");
        setStatus("idle");
        return;
      }
      saveOrder(data.order);
      setStatus("done");
      cartStore.clear();
      router.push(`/ordine-confermato?n=${encodeURIComponent(data.order.number)}`);
    } catch {
      setServerError("Non riusciamo a raggiungere il server. Controlla la connessione e riprova: non ti è stato addebitato nulla.");
      setStatus("idle");
    }
  }

  if (!hydrated) {
    return (
      <div className="pagina py-10 md:py-16" aria-busy="true">
        <p className="titolo text-[2.5rem] md:text-6xl">Checkout</p>
        <p className="mt-4 text-sm text-marrone">Carichiamo il tuo carrello…</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="pagina py-16 md:py-24" role="status">
        <p className="titolo text-[2.5rem] md:text-6xl">Ordine ricevuto.</p>
        <p className="mt-4 text-sm text-marrone">Ti portiamo alla conferma…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="pagina py-16 md:py-24">
        <h1 className="titolo text-[2.5rem] md:text-6xl">Il carrello è vuoto.</h1>
        <p className="mt-4 max-w-[44ch] text-[0.9375rem] text-marrone">
          Per fare il checkout serve almeno un capo. I nuovi arrivi sono un buon punto di partenza.
        </p>
        <Link href="/shop?ordina=novita" className="bottone bottone-pieno mt-7">
          Vedi i nuovi arrivi
        </Link>
      </div>
    );
  }

  const totalText = euro(total, { decimals: true });
  const sending = status === "sending";

  return (
    <div className="pagina pb-16 pt-8 md:pb-24 md:pt-12">
      <h1 className="titolo text-[2.5rem] md:text-6xl">Checkout</h1>
      <p className="mt-3 text-sm text-marrone">
        Nessuna registrazione: bastano un&apos;email e un indirizzo. Ci vogliono due minuti.
      </p>

      {/* riepilogo richiudibile, solo su mobile */}
      <details className="group mt-6 border border-linea-forte lg:hidden">
        <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
          <span className="font-semibold">
            Riepilogo, {count} {count === 1 ? "capo" : "capi"}
            <span aria-hidden="true" className="ml-2 inline-block text-xs transition-transform duration-150 group-open:rotate-180">
              ↓
            </span>
          </span>
          <span className="cifre font-semibold">{totalText}</span>
        </summary>
        <div className="border-t border-linea px-4 pb-4">
          <SummaryLines lines={lines} />
          <div className="pt-3">
            <Totals subtotal={subtotal} shipping={shipping} delivery={delivery} />
          </div>
        </div>
      </details>

      <div className="mt-8 grid gap-x-12 lg:grid-cols-12 xl:gap-x-16">
        <form ref={formRef} onSubmit={onSubmit} noValidate className="lg:col-span-7">
          <Step n={1} title="I tuoi dati">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field {...field} name="email" label="Email" type="email" autoComplete="email" inputMode="email" hint="Qui arriva la conferma d'ordine." className="sm:col-span-2" />
              <Field {...field} name="firstName" label="Nome" autoComplete="given-name" />
              <Field {...field} name="lastName" label="Cognome" autoComplete="family-name" />
              <Field {...field} name="phone" label="Telefono" type="tel" autoComplete="tel" inputMode="tel" hint="Lo usa solo il corriere, o noi per avvisarti del ritiro." className="sm:col-span-2" />
            </div>
          </Step>

          <Step n={2} title="Consegna">
            <fieldset>
              <legend className="sr-only">Come vuoi ricevere l&apos;ordine</legend>
              <div className="grid gap-3">
                <Choice
                  name="consegna"
                  value="spedizione"
                  checked={delivery === "spedizione"}
                  onChange={() => setDelivery("spedizione")}
                  title={`Spedizione ${CARRIER}, 24/48h`}
                  note={
                    missing > 0
                      ? `In tutta Italia. Gratis sopra i ${FREE_SHIPPING_FROM} €: ti mancano ${euro(missing, { decimals: true })}.`
                      : "In tutta Italia, con tracking."
                  }
                  price={subtotal >= FREE_SHIPPING_FROM ? "Gratis" : euro(SHIPPING_COST, { decimals: true })}
                >
                  <div className="grid gap-4 sm:grid-cols-6">
                    <Field {...field} name="address" label="Via e numero civico" autoComplete="street-address" className="sm:col-span-6" />
                    <Field {...field} name="zip" label="CAP" autoComplete="postal-code" inputMode="numeric" maxLength={5} className="sm:col-span-2" />
                    <Field {...field} name="city" label="Città" autoComplete="address-level2" className="sm:col-span-3" />
                    <Field {...field} name="province" label="Prov." autoComplete="address-level1" maxLength={2} placeholder="AL" className="sm:col-span-1" />
                  </div>
                </Choice>
                <Choice
                  name="consegna"
                  value="ritiro"
                  checked={delivery === "ritiro"}
                  onChange={() => setDelivery("ritiro")}
                  title={`Ritiro in negozio, ${SITE.address.street}`}
                  note="Te lo teniamo da parte. Lunedì 9:30–19:30, da martedì a sabato 9:30–12:30 e 15:30–19:30."
                  price="Gratis"
                />
              </div>
            </fieldset>
          </Step>

          <Step n={3} title="Pagamento">
            <fieldset>
              <legend className="sr-only">Metodo di pagamento</legend>
              <div className="grid gap-3">
                <Choice
                  name="pagamento"
                  value="carta"
                  checked={payment === "carta"}
                  onChange={() => setPayment("carta")}
                  title={PAYMENT_LABELS.carta}
                  note="Visa, Mastercard, American Express"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border border-dashed border-linea-forte px-3 py-2.5 text-xs leading-relaxed text-marrone">
                    <p>
                      <strong className="font-semibold text-verde">Modalità demo:</strong> nessun addebito, i dati della carta non
                      lasciano il browser.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setValues((current) => ({
                          ...current,
                          ...TEST_CARD,
                          cardName: `${current.firstName} ${current.lastName}`.trim() || "Mario Rossi",
                        }));
                      }}
                      className="link-riga min-h-9 font-semibold text-verde"
                    >
                      Usa la carta di prova
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field {...field} name="cardNumber" label="Numero della carta" autoComplete="cc-number" inputMode="numeric" placeholder="1234 5678 9012 3456" maxLength={23} className="col-span-2" />
                    <Field {...field} name="cardExpiry" label="Scadenza" autoComplete="cc-exp" inputMode="numeric" placeholder="MM/AA" maxLength={5} />
                    <Field {...field} name="cardCvc" label="CVC" autoComplete="cc-csc" inputMode="numeric" placeholder="123" maxLength={4} />
                    <Field {...field} name="cardName" label="Intestatario" autoComplete="cc-name" className="col-span-2" />
                  </div>
                </Choice>
                <Choice
                  name="pagamento"
                  value="paypal"
                  checked={payment === "paypal"}
                  onChange={() => setPayment("paypal")}
                  title={PAYMENT_LABELS.paypal}
                  note="Confermi l'ordine e paghi dal tuo conto PayPal."
                />
                <Choice
                  name="pagamento"
                  value="satispay"
                  checked={payment === "satispay"}
                  onChange={() => setPayment("satispay")}
                  title={PAYMENT_LABELS.satispay}
                  note="Confermi dall'app Satispay sul telefono."
                />
                <Choice
                  name="pagamento"
                  value="klarna"
                  checked={payment === "klarna"}
                  onChange={() => setPayment("klarna")}
                  title={PAYMENT_LABELS.klarna}
                  note={`Tre rate da ${euro(total / 3, { decimals: true })}, la prima oggi.`}
                />
              </div>
            </fieldset>
          </Step>

          <div className="border-t border-linea pt-6">
            <div className="mb-5 lg:hidden">
              <Totals subtotal={subtotal} shipping={shipping} delivery={delivery} />
            </div>

            {serverError ? (
              <p role="alert" className="mb-4 border border-errore px-4 py-3 text-sm font-semibold text-errore">
                {serverError}
              </p>
            ) : null}
            {submitted && Object.keys(errors).length > 0 ? (
              <p role="alert" className="mb-4 text-sm font-semibold text-errore">
                Manca qualcosa: ti abbiamo portato al primo campo da sistemare.
              </p>
            ) : null}

            <button type="submit" disabled={sending} className="bottone bottone-pieno w-full text-[0.9375rem]">
              {sending ? "Pagamento in corso…" : PAY_BUTTON[payment](totalText)}
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-marrone">
              Pagamento sicuro · Reso entro {RETURN_DAYS} giorni · Confermando accetti le{" "}
              <Link href="/spedizioni-e-resi" className="link-riga">
                condizioni di spedizione e reso
              </Link>{" "}
              e l&apos;
              <Link href="/privacy" className="link-riga">
                informativa privacy
              </Link>
              .
            </p>
          </div>
        </form>

        {/* riepilogo fisso a destra */}
        <aside className="hidden lg:col-span-5 lg:block" aria-label="Riepilogo dell'ordine">
          <div className="sticky top-8 border border-linea-forte bg-carta p-6 xl:p-7">
            <h2 className="occhiello text-marrone">
              Il tuo ordine, {count} {count === 1 ? "capo" : "capi"}
            </h2>
            <div className="mt-2 max-h-[40dvh] overflow-y-auto overscroll-contain">
              <SummaryLines lines={lines} />
            </div>
            <div className="pt-4">
              <Totals subtotal={subtotal} shipping={shipping} delivery={delivery} />
            </div>
            <p className="mt-5 border-t border-linea pt-4 text-xs leading-relaxed text-marrone">
              {delivery === "ritiro"
                ? `Ritiri in ${SITE.address.street}: ti scriviamo appena è pronto.`
                : `Parte da ${SITE.address.street} con ${CARRIER}. Gli ordini entro le 13 partono in giornata.`}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
