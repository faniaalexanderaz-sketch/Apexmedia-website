export const FREE_SHIPPING_FROM = 150;
export const SHIPPING_COST = 6.9;
export const RETURN_DAYS = 14;
export const CARRIER = "BRT";

export type Delivery = "spedizione" | "ritiro";

export function shippingCost(subtotal: number, delivery: Delivery): number {
  if (delivery === "ritiro") return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
}

export function missingForFreeShipping(subtotal: number): number {
  return Math.max(0, Math.round((FREE_SHIPPING_FROM - subtotal) * 100) / 100);
}

// ---- tempi stimati, calcolati sull'ora di Alessandria ----

const ROME = "Europe/Rome";

function romeNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

// Giorno "di calendario" a mezzogiorno UTC: si sommano i giorni senza inciampare nell'ora legale.
function calendarDay(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function nextMatching(date: Date, ok: (weekday: number) => boolean, includeToday: boolean): Date {
  let d = includeToday ? date : addDays(date, 1);
  while (!ok(d.getUTCDay())) d = addDays(d, 1);
  return d;
}

const weekdayIt = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });

function label(date: Date): string {
  return weekdayIt.format(date);
}

const isWorkingDay = (weekday: number) => weekday >= 1 && weekday <= 5; // il corriere consegna da lunedì a venerdì
const isShopDay = (weekday: number) => weekday >= 1 && weekday <= 6; // negozio aperto da lunedì a sabato

export type Estimate = { delivery: Delivery; text: string };

export function estimateDelivery(delivery: Delivery, now: Date): Estimate {
  const t = romeNow(now);
  const today = calendarDay(t.year, t.month, t.day);

  if (delivery === "ritiro") {
    const ready = nextMatching(today, isShopDay, false);
    return { delivery, text: `Pronto in negozio da ${label(ready)}, dalle 9:30` };
  }

  // Gli ordini entro le 13 dei giorni feriali partono in giornata.
  const shipsToday = isWorkingDay(today.getUTCDay()) && t.hour < 13;
  const shipDay = shipsToday ? today : nextMatching(today, isWorkingDay, false);
  const first = nextMatching(shipDay, isWorkingDay, false);
  const last = nextMatching(first, isWorkingDay, false);
  return { delivery, text: `Consegna tra ${label(first)} e ${label(last)}` };
}
