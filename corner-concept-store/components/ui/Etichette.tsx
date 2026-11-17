import type { Product } from "@/lib/products";
import { isSoldOut, scarcityLabel } from "@/lib/products";

/** "Pezzo unico": l'unico posto, insieme al contatore del carrello, dove compare l'arancione. */
export function PezzoUnico({ className = "" }: { className?: string }) {
  return (
    <span className={`pillola-piccola border-linea-forte bg-crema text-verde ${className}`}>
      <span aria-hidden="true" className="h-2.5 w-1 rounded-full bg-arancio" />
      Pezzo unico
    </span>
  );
}

export function Venduto({ className = "" }: { className?: string }) {
  return <span className={`pillola-piccola border-verde bg-verde text-crema ${className}`}>Venduto</span>;
}

export function Scarsita({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`pillola-piccola border-linea-forte bg-crema text-verde ${className}`}>{label}</span>;
}

/** Etichette di un capo, nell'ordine in cui contano per chi compra. */
export function EtichetteProdotto({ product, className = "" }: { product: Product; className?: string }) {
  const sold = isSoldOut(product);
  const scarcity = scarcityLabel(product);
  if (!sold && !product.unique && !scarcity) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {sold ? <Venduto /> : null}
      {!sold && product.unique ? <PezzoUnico /> : null}
      {!sold && scarcity ? <Scarsita label={scarcity} /> : null}
    </div>
  );
}
