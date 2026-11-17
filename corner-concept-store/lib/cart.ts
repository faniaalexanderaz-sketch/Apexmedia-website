// Carrello in localStorage, letto con useSyncExternalStore: niente differenze tra server e browser.

import { getProduct, stockOf, type Product } from "@/lib/products";

export type CartItem = { slug: string; size: string; qty: number };
export type CartLine = CartItem & { product: Product; lineTotal: number; max: number };

const KEY = "corner.carrello.v1";
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function sanitize(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return EMPTY;
  const clean: CartItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const { slug, size, qty } = raw as Partial<CartItem>;
    if (typeof slug !== "string" || typeof size !== "string") continue;
    const product = getProduct(slug);
    if (!product) continue;
    const max = stockOf(product, size);
    const n = Math.min(Math.max(1, Math.floor(Number(qty) || 1)), max);
    if (max < 1) continue;
    clean.push({ slug, size, qty: n });
  }
  return clean.length ? clean : EMPTY;
}

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items.length ? items : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // localStorage pieno o bloccato: il carrello vive comunque in memoria per questa visita
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  cache = null;
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,

  /** Aggiunge un capo. Ritorna quanti pezzi sono stati aggiunti davvero (0 se la taglia è finita). */
  add(slug: string, size: string, qty = 1): number {
    const product = getProduct(slug);
    if (!product) return 0;
    const max = stockOf(product, size);
    const items = read();
    const existing = items.find((i) => i.slug === slug && i.size === size);
    const current = existing?.qty ?? 0;
    const next = Math.min(current + qty, max);
    if (next === current) return 0;
    write(
      existing
        ? items.map((i) => (i === existing ? { ...i, qty: next } : i))
        : [...items, { slug, size, qty: next }],
    );
    return next - current;
  },

  setQty(slug: string, size: string, qty: number) {
    const product = getProduct(slug);
    if (!product) return;
    const max = stockOf(product, size);
    const n = Math.min(Math.max(0, Math.floor(qty)), max);
    const items = read();
    write(
      n === 0
        ? items.filter((i) => !(i.slug === slug && i.size === size))
        : items.map((i) => (i.slug === slug && i.size === size ? { ...i, qty: n } : i)),
    );
  },

  remove(slug: string, size: string) {
    write(read().filter((i) => !(i.slug === slug && i.size === size)));
  },

  clear() {
    write(EMPTY);
  },
};

export function toLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    lines.push({ ...item, product, lineTotal: product.price * item.qty, max: stockOf(product, item.size) });
  }
  return lines;
}

export function subtotalOf(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function countOf(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
