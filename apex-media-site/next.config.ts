import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Il font dell’immagine Open Graph viene letto da disco a runtime: va incluso nel bundle serverless
  outputFileTracingIncludes: { "/opengraph-image": ["./src/app/fonts/*"] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
