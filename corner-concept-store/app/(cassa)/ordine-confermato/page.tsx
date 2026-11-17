import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";

export const metadata: Metadata = {
  title: "Ordine confermato",
  robots: { index: false, follow: false },
};

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="pagina py-16" aria-busy="true">
          <p className="text-sm text-marrone">Carichiamo il tuo ordine…</p>
        </div>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}
