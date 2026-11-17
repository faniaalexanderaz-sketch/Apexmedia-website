import type { Delivery } from "@/lib/shipping";

export type PaymentMethod = "carta" | "paypal" | "satispay" | "klarna";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  carta: "Carta di credito o debito",
  paypal: "PayPal",
  satispay: "Satispay",
  klarna: "Klarna, 3 rate senza interessi",
};

export type OrderLine = {
  slug: string;
  name: string;
  brand: string;
  size: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  image: string | null;
};

export type Order = {
  number: string;
  createdAt: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  delivery: Delivery;
  payment: PaymentMethod;
  estimate: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    zip?: string;
    city?: string;
    province?: string;
  };
};

export type OrderRequest = {
  items: { slug: string; size: string; qty: number }[];
  delivery: Delivery;
  payment: PaymentMethod;
  customer: Order["customer"];
};

const KEY = "corner.ordini.v1";

export function saveOrder(order: Order) {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Order>;
    all[order.number] = order;
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // senza localStorage la conferma mostra comunque il numero d'ordine dall'URL
  }
}

export function readOrder(number: string): Order | null {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Order>;
    return all[number] ?? null;
  } catch {
    return null;
  }
}
