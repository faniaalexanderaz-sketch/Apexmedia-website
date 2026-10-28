import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const updated = new Date("2026-10-28");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/portfolio`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.2 },
  ];
}
