import type { MetadataRoute } from "next";
import { servizi } from "@/content/servizi";
import { urlSito } from "@/content/sito";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSito();
  return [
    { url: base, priority: 1 },
    ...servizi.map((s) => ({ url: `${base}/${s.slug}`, priority: 0.9 })),
    { url: `${base}/preventivo`, priority: 0.8 },
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/cookie`, priority: 0.2 },
  ];
}
