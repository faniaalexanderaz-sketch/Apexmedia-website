import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, lastModified: new Date("2026-10-28"), changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/privacy`, lastModified: new Date("2026-10-28"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
