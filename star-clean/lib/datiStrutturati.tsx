import { servizi, type Domanda, type Servizio } from "@/content/servizi";
import { sito, urlSito } from "@/content/sito";

/** Dati strutturati (JSON-LD): LocalBusiness unico + un Service per ogni servizio, ad Alessandria e provincia. */
const idAzienda = () => `${urlSito()}/#azienda`;
const idServizio = (s: Servizio) => `${urlSito()}/${s.slug}#servizio`;

const areaServita = () => [
  { "@type": "AdministrativeArea", name: sito.provincia },
  ...sito.zone.map((z) => ({ "@type": "City", name: z })),
];

export function azienda() {
  const base = urlSito();
  return {
    "@type": "LocalBusiness",
    "@id": idAzienda(),
    name: sito.nome,
    url: base,
    image: `${base}/foto/furgone.webp`,
    description: `Impresa di pulizie di famiglia, ad Alessandria da ${sito.anniAttivita} anni.`,
    ...(sito.telefono.segnaposto ? {} : { telephone: sito.telefono.href.replace("tel:", "") }),
    address: { "@type": "PostalAddress", addressLocality: "Alessandria", addressRegion: "AL", addressCountry: "IT" },
    areaServed: areaServita(),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servizi di pulizia",
      itemListElement: servizi.map((s) => ({ "@type": "Offer", itemOffered: { "@id": idServizio(s) } })),
    },
  };
}

export function servizio(s: Servizio) {
  return {
    "@type": "Service",
    "@id": idServizio(s),
    name: s.nome,
    serviceType: s.nome,
    description: s.metaDescrizione,
    url: `${urlSito()}/${s.slug}`,
    provider: { "@id": idAzienda() },
    areaServed: areaServita(),
  };
}

export function domande(elenco: Domanda[]) {
  return {
    "@type": "FAQPage",
    mainEntity: elenco.map((f) => ({ "@type": "Question", name: f.domanda, acceptedAnswer: { "@type": "Answer", text: f.risposta } })),
  };
}

export function grafo(...nodi: object[]) {
  return { "@context": "https://schema.org", "@graph": nodi };
}

export function JsonLd({ dati }: { dati: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dati).replace(/</g, "\\u003c") }} />;
}
