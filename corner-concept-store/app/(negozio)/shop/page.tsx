import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/shop/Catalog";

export const metadata: Metadata = {
  title: "Catalogo",
  description:
    "Giacche e capispalla, felpe, denim, maglieria, accessori, vintage e donna: tutto il catalogo di CORNER Concept Store, con spedizione in tutta Italia in 24/48h.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogAtRequest searchParams={searchParams} />
    </Suspense>
  );
}

// I filtri vivono nell'URL: aspettando i parametri, il catalogo viene reso sul server già filtrato.
async function CatalogAtRequest({ searchParams }: Pick<PageProps<"/shop">, "searchParams">) {
  await searchParams;
  return <Catalog />;
}
