import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/ordine-confermato", "/api/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
