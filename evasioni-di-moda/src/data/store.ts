// Dati del negozio. Tutto ciò che compare nel sito come informazione di contatto
// passa da qui: nessun recapito è scritto altrove nei componenti.
// I campi null restano nascosti finché il titolare non li conferma.

export type DayHours = {
  /** es. "Lunedì" */
  day: string
  /** es. "15:30 – 19:30" oppure "Chiuso" */
  hours: string
}

export type SocialLink = { label: string; url: string }

export const store = {
  name: 'Evasioni di Moda',
  tagline: 'Boutique di abbigliamento ad Alessandria',
  address: {
    street: 'Corso Acqui 94',
    postalCode: '15121',
    city: 'Alessandria',
    province: 'AL',
    country: 'IT',
    countryName: 'Italia',
  },
  phone: {
    display: '0131 381843',
    href: 'tel:+390131381843',
    e164: '+390131381843',
  },
  /** Ricerca Google Maps per nome + indirizzo: apre la scheda del negozio */
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Evasioni%20di%20Moda%2C%20Corso%20Acqui%2094%2C%2015121%20Alessandria',
  /** Navigazione diretta verso il negozio */
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Evasioni%20di%20Moda%2C%20Corso%20Acqui%2094%2C%2015121%20Alessandria',
  /** Mappa incorporata, caricata solo su richiesta del visitatore */
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Evasioni%20di%20Moda%2C%20Corso%20Acqui%2094%2C%2015121%20Alessandria&z=16&output=embed',

  /** Numero WhatsApp in formato internazionale senza "+" (es. "393331234567").
   *  Da inserire solo dopo averlo verificato con il negozio. */
  whatsapp: null as string | null,

  /** Orari di apertura: da confermare con il negozio prima della pubblicazione. */
  hours: null as DayHours[] | null,

  /** Profili social ufficiali: da inserire solo se verificati. */
  socials: [] as SocialLink[],

  /** URL pubblico del sito (es. "https://www.evasionidimoda.it"), usato per canonical e Open Graph. */
  siteUrl: null as string | null,
}

export const fullAddress = `${store.address.street}, ${store.address.postalCode} ${store.address.city} (${store.address.province})`

export function whatsappUrl(message: string): string | null {
  if (!store.whatsapp) return null
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`
}
