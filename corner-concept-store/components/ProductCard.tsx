import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { EtichetteProdotto } from "@/components/ui/Etichette";
import { euro } from "@/lib/format";
import { isSoldOut, productHref, type Product } from "@/lib/products";

type Props = {
  product: Product;
  sizes?: string;
  eager?: boolean;
  /** Sfondo verde scuro (sezione drop): testi in crema. */
  onDark?: boolean;
};

const DEFAULT_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 32vw";

export function ProductCard({ product, sizes = DEFAULT_SIZES, eager = false, onDark = false }: Props) {
  const [first, second] = product.images;
  const sold = isSoldOut(product);

  return (
    <Link
      href={productHref(product)}
      className={`group flex h-full flex-col focus-visible:outline-offset-[-2px] ${onDark ? "text-crema" : "text-verde"}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ombra [container-type:inline-size]">
        <ProductImage
          src={first?.src}
          alt={first?.alt ?? product.name}
          name={product.name}
          sizes={sizes}
          eager={eager}
          className={sold ? "opacity-60 grayscale" : ""}
        />
        {second && !sold ? (
          // seconda foto solo dove esiste il passaggio del mouse: sui telefoni non viene nemmeno scaricata
          <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:block">
            <ProductImage src={second.src} alt="" name={product.name} sizes={sizes} />
          </div>
        ) : null}
        <EtichetteProdotto product={product} className="absolute left-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-4 pt-3 md:px-4">
        <p className={`occhiello truncate ${onDark ? "text-ocra" : "text-marrone"}`}>{product.brand}</p>
        <div className="mt-1.5 flex flex-1 flex-col gap-1.5 md:flex-row md:items-start md:justify-between md:gap-4">
          <h3 className="text-[0.875rem] font-medium leading-snug [text-wrap:pretty] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {product.name}
          </h3>
          <p className={`cifre mt-auto shrink-0 text-[0.875rem] font-semibold md:mt-0 ${sold ? "line-through decoration-1" : ""}`}>
            {euro(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** Griglia da catalogo: celle separate da filetti, non card staccate. */
export function ProductGrid({
  children,
  className = "",
  wide = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** true: fino a 4 colonne (pagine larghe). false: 3 colonne (accanto ai filtri). */
  wide?: boolean;
}) {
  return (
    <ul
      className={`grid grid-cols-2 border-l border-t border-linea md:grid-cols-3 ${wide ? "xl:grid-cols-4" : ""} ${className}`}
    >
      {children}
    </ul>
  );
}

export function ProductCell({ children }: { children: React.ReactNode }) {
  return <li className="border-b border-r border-linea">{children}</li>;
}
