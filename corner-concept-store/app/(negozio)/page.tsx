import { CategoryIndex } from "@/components/home/CategoryIndex";
import { Drop } from "@/components/home/Drop";
import { Gnute } from "@/components/home/Gnute";
import { Hero } from "@/components/home/Hero";
import { Negozio } from "@/components/home/Negozio";
import { NewArrivals } from "@/components/home/NewArrivals";
import { SITE } from "@/lib/site";

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: SITE.name,
  url: SITE.url,
  image: `${SITE.url}/brand/hero-vetrina.jpg`,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Modena 15",
    postalCode: SITE.address.zip,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.province,
    addressCountry: SITE.address.country,
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "09:30", closes: "19:30" },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:30",
      closes: "12:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "15:30",
      closes: "19:30",
    },
  ],
  sameAs: [SITE.instagramUrl],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <CategoryIndex />
      <Drop />
      <NewArrivals />
      <Gnute />
      <Negozio />
    </>
  );
}
