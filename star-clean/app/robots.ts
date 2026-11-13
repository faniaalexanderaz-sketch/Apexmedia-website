import type { MetadataRoute } from "next";
import { sito, urlSito } from "@/content/sito";

export default function robots(): MetadataRoute.Robots {
  if (sito.demo) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/grazie", "/api/"] },
    sitemap: `${urlSito()}/sitemap.xml`,
  };
}
