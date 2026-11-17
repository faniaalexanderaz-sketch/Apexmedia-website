import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/chi-siamo", "/spedizioni-e-resi", "/contatti"];
  return [
    ...pages.map((path) => ({ url: `${SITE.url}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${SITE.url}/prodotto/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
