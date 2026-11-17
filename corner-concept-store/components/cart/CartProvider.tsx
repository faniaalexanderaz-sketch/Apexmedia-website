"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { cartStore, countOf, subtotalOf, toLines } from "@/lib/cart";

type CartUI = { isOpen: boolean; open: () => void; close: () => void };

const CartUIContext = createContext<CartUI | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const value = useMemo<CartUI>(
    () => ({ isOpen, open: () => setOpen(true), close: () => setOpen(false) }),
    [isOpen],
  );
  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>;
}

export function useCartUI(): CartUI {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI va usato dentro <CartProvider>");
  return ctx;
}

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  return useMemo(() => {
    const lines = toLines(items);
    return { items, lines, subtotal: subtotalOf(lines), count: countOf(items) };
  }, [items]);
}

const noop = () => () => {};

/** false sul server e durante l'idratazione, true subito dopo: serve dove il contenuto dipende dal carrello. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
