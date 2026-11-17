import { NextResponse } from "next/server";
import type { Order, OrderLine, OrderRequest, PaymentMethod } from "@/lib/orders";
import { getProduct, stockOf } from "@/lib/products";
import { estimateDelivery, shippingCost, type Delivery } from "@/lib/shipping";
import { EMPTY_FIELDS, validateCustomer } from "@/lib/validation";

// DEMO: qui arriva l'ordine. I prezzi si ricalcolano dal catalogo (mai fidarsi di quelli del browser)
// e si controllano le giacenze. In produzione questo è il punto dove creare il pagamento Stripe
// (PaymentIntent in modalità test, poi live) e salvare l'ordine. I dati della carta non passano mai da qui.

const PAYMENTS: PaymentMethod[] = ["carta", "paypal", "satispay", "klarna"];
const DELIVERIES: Delivery[] = ["spedizione", "ritiro"];

function orderNumber(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `CRN-${get("year")}${get("month")}${get("day")}-${random}`;
}

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return fail("Richiesta non valida.");
  }

  if (!body || !Array.isArray(body.items) || body.items.length === 0) return fail("Il carrello è vuoto.");
  if (!DELIVERIES.includes(body.delivery)) return fail("Scegli come ricevere l'ordine.");
  if (!PAYMENTS.includes(body.payment)) return fail("Scegli un metodo di pagamento.");

  const customer = body.customer ?? ({} as OrderRequest["customer"]);
  const fieldErrors = validateCustomer(
    {
      ...EMPTY_FIELDS,
      email: String(customer.email ?? ""),
      phone: String(customer.phone ?? ""),
      firstName: String(customer.firstName ?? ""),
      lastName: String(customer.lastName ?? ""),
      address: String(customer.address ?? ""),
      zip: String(customer.zip ?? ""),
      city: String(customer.city ?? ""),
      province: String(customer.province ?? ""),
    },
    body.delivery,
  );
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Controlla i dati inseriti.", fields: fieldErrors }, { status: 422 });
  }

  const lines: OrderLine[] = [];
  for (const item of body.items) {
    const product = getProduct(String(item.slug));
    const qty = Math.floor(Number(item.qty));
    if (!product || !Number.isFinite(qty) || qty < 1) return fail("C'è un capo non valido nel carrello.");
    const stock = stockOf(product, String(item.size));
    if (stock < qty) {
      return fail(`${product.name}, taglia ${item.size}: non è più disponibile nella quantità richiesta.`, 409);
    }
    lines.push({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      size: String(item.size),
      qty,
      unitPrice: product.price,
      lineTotal: product.price * qty,
      image: product.images[0]?.src ?? null,
    });
  }

  const now = new Date();
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shipping = shippingCost(subtotal, body.delivery);
  const total = Math.round((subtotal + shipping) * 100) / 100;

  const order: Order = {
    number: orderNumber(now),
    createdAt: now.toISOString(),
    lines,
    subtotal,
    shipping,
    total,
    delivery: body.delivery,
    payment: body.payment,
    estimate: estimateDelivery(body.delivery, now).text,
    customer: {
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      ...(body.delivery === "spedizione"
        ? {
            address: customer.address?.trim(),
            zip: customer.zip?.trim(),
            city: customer.city?.trim(),
            province: customer.province?.trim().toUpperCase(),
          }
        : {}),
    },
  };

  return NextResponse.json({ order });
}
