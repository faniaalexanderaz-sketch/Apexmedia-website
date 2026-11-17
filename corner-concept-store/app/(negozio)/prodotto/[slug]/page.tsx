import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/product/BuyBox";
import { Gallery } from "@/components/product/Gallery";
import { ProductCard, ProductCell } from "@/components/ProductCard";
import { due } from "@/lib/format";
import { categoryName, getProduct, isSoldOut, pairings, products, type Product } from "@/lib/products";
import { SITE } from "@/lib/site";
import { isUnsplash } from "@/lib/unsplash";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

const absoluteImage = (src: string) => (isUnsplash(src) ? `${src}&w=1200&q=75&auto=format` : `${SITE.url}${src}`);

export async function generateMetadata({ params }: PageProps<"/prodotto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Capo non trovato" };
  const image = product.images[0]?.src;
  return {
    title: `${product.name}, ${product.brand}`,
    description: product.description,
    alternates: { canonical: `/prodotto/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description: product.description,
      url: `/prodotto/${product.slug}`,
      images: image ? [{ url: absoluteImage(image), alt: product.images[0].alt }] : undefined,
    },
  };
}

function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: `CRN-${product.id}`,
    color: product.color,
    category: categoryName(product.categories[0]),
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => absoluteImage(i.src)),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/prodotto/${product.slug}`,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability: isSoldOut(product) ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: product.vintage ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
}

function Scheda({ product }: { product: Product }) {
  return (
    <>
      <div>
        <h2 className="occhiello text-marrone">La scheda</h2>
        <ul className="mt-4 border-t border-linea text-[0.875rem]">
          {product.details.map((line) => (
            <li key={line} className="border-b border-linea py-2.5">
              {line}
            </li>
          ))}
          <li className="border-b border-linea py-2.5">Colore: {product.color}</li>
        </ul>
      </div>
      <p className="cifre mt-6 text-xs text-marrone">
        Art. {product.id}
        {product.dropNumber ? ` · Drop Vintage Barbour Days, pezzo N° ${due(product.dropNumber)}` : ""}
      </p>
    </>
  );
}

export default async function ProductPage({ params }: PageProps<"/prodotto/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = product.categories[0];
  const pairs = pairings(product).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto w-full max-w-[90rem] pb-10 lg:px-8 lg:pb-20 xl:px-10">
        <nav aria-label="Percorso" className="px-4 py-3 text-xs text-marrone md:px-8 lg:px-0 lg:py-4">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href="/shop" className="link-riga">
                Catalogo
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/shop?categoria=${category}`} className="link-riga">
                {categoryName(category)}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid gap-x-10 lg:grid-cols-12 xl:gap-x-14">
          <div className="lg:col-span-7">
            <Gallery product={product} details={<Scheda product={product} />} />
          </div>

          <div className="px-4 pt-2 md:px-8 lg:col-span-5 lg:px-0 lg:pt-0">
            <div className="lg:sticky lg:top-32">
              <BuyBox product={product} />
            </div>
            {/* su mobile la scheda sta sotto l'acquisto */}
            <div className="mt-8 lg:hidden">
              <Scheda product={product} />
            </div>
          </div>
        </div>
      </div>

      {pairs.length > 0 ? (
        <section aria-labelledby="abbinalo-titolo" className="border-t border-linea">
          <div className="pagina pb-28 pt-12 md:py-20 lg:pb-20">
            <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <p className="occhiello text-marrone">Lo abbiamo provato così</p>
                <h2 id="abbinalo-titolo" className="titolo mt-3 text-[2.25rem] md:text-5xl">
                  Abbinalo con
                </h2>
              </div>
              <ul className="grid grid-cols-2 border-l border-t border-linea md:grid-cols-3 lg:col-span-9">
                {pairs.map((p) => (
                  <ProductCell key={p.slug}>
                    <ProductCard product={p} sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 32vw" />
                  </ProductCell>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
