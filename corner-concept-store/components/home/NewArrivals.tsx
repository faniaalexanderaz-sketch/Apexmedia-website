import Link from "next/link";
import { ProductCard, ProductCell, ProductGrid } from "@/components/ProductCard";
import { newArrivals, products } from "@/lib/products";

export function NewArrivals() {
  const items = newArrivals(8);
  return (
    <section aria-labelledby="arrivi-titolo" className="border-b border-linea">
      <div className="pagina py-12 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="occhiello text-marrone">Appesi questa settimana</p>
            <h2 id="arrivi-titolo" className="titolo mt-3 text-[2.25rem] md:text-5xl">
              Nuovi arrivi
            </h2>
          </div>
          <Link href="/shop" className="link-riga inline-flex min-h-11 items-center text-sm font-semibold">
            Tutto il catalogo, {products.length} capi
          </Link>
        </div>

        <ProductGrid className="mt-8">
          {items.map((p) => (
            <ProductCell key={p.slug}>
              <ProductCard product={p} />
            </ProductCell>
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}
