import type { PaymentMethod } from "@/lib/orders";
import type { Delivery } from "@/lib/shipping";

export type CheckoutFields = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  zip: string;
  city: string;
  province: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
};

export type FieldName = keyof CheckoutFields;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const EMPTY_FIELDS: CheckoutFields = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address: "",
  zip: "",
  city: "",
  province: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
};

const digits = (value: string) => value.replace(/\D/g, "");

export function luhn(number: string): boolean {
  const d = digits(number);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i += 1) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  return digits(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const d = digits(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export const EXPIRED_CARD = "Questa carta risulta scaduta: controlla la data.";

/** Con now = null si controlla solo il formato (calcolo puro, va bene durante il render). */
function expiryError(value: string, now: Date | null): string | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return "Scrivi la scadenza come MM/AA, per esempio 08/29.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Il mese va da 01 a 12.";
  if (now && new Date(year, month, 1) <= now) return EXPIRED_CARD; // vale fino a fine mese
  return null;
}

/** Controlli sui dati di contatto e consegna: gli stessi girano anche sul server. */
export function validateCustomer(fields: CheckoutFields, delivery: Delivery): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
    errors.email = "Scrivi un'email valida: la usiamo per mandarti la conferma.";
  }
  if (digits(fields.phone).length < 8) {
    errors.phone = "Scrivi un numero di telefono: serve al corriere, o a noi per avvisarti.";
  }
  if (fields.firstName.trim().length < 2) errors.firstName = "Scrivi il tuo nome.";
  if (fields.lastName.trim().length < 2) errors.lastName = "Scrivi il tuo cognome.";

  if (delivery === "spedizione") {
    if (fields.address.trim().length < 5) errors.address = "Scrivi via e numero civico.";
    if (!/^\d{5}$/.test(fields.zip.trim())) errors.zip = "Il CAP ha cinque cifre.";
    if (fields.city.trim().length < 2) errors.city = "Scrivi la città.";
    if (!/^[A-Za-z]{2}$/.test(fields.province.trim())) errors.province = "Due lettere, per esempio AL.";
  }
  return errors;
}

export function validateCard(fields: CheckoutFields, now: Date | null): FieldErrors {
  const errors: FieldErrors = {};
  if (!luhn(fields.cardNumber)) errors.cardNumber = "Il numero di carta non torna: ricontrolla le cifre.";
  const expiry = expiryError(fields.cardExpiry, now);
  if (expiry) errors.cardExpiry = expiry;
  if (!/^\d{3,4}$/.test(fields.cardCvc.trim())) errors.cardCvc = "Tre o quattro cifre, sul retro della carta.";
  if (fields.cardName.trim().length < 3) errors.cardName = "Scrivi il nome come appare sulla carta.";
  return errors;
}

export function validateCheckout(
  fields: CheckoutFields,
  delivery: Delivery,
  payment: PaymentMethod,
  now: Date | null,
): FieldErrors {
  return { ...validateCustomer(fields, delivery), ...(payment === "carta" ? validateCard(fields, now) : {}) };
}

/** Ordine dei campi in pagina: serve a portare il fuoco sul primo errore. */
export const FIELD_ORDER: FieldName[] = [
  "email",
  "phone",
  "firstName",
  "lastName",
  "address",
  "zip",
  "city",
  "province",
  "cardNumber",
  "cardExpiry",
  "cardCvc",
  "cardName",
];
