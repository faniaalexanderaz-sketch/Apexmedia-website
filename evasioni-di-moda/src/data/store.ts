// Dati del negozio. Tutto ciò che compare nel sito come informazione di contatto
// passa da qui: nessun recapito è scritto altrove nei componenti.
// I campi null restano nascosti finché il titolare non li conferma.

/** Fascia oraria "HH:MM" – "HH:MM" */
export type TimeRange = [string, string]

/** Orario settimanale: chiave = giorno (0 domenica … 6 sabato), valore = fasce di apertura */
export type WeeklyHours = Record<number, TimeRange[]>

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
  /** Pagina per lasciare una recensione / leggere quelle esistenti su Google */
  reviewsUrl:
    'https://www.google.com/maps/search/?api=1&query=Evasioni%20di%20Moda%2C%20Corso%20Acqui%2094%2C%2015121%20Alessandria',
  /** Mappa incorporata, caricata solo su richiesta del visitatore */
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Evasioni%20di%20Moda%2C%20Corso%20Acqui%2094%2C%2015121%20Alessandria&z=16&output=embed',

  /** Numero WhatsApp in formato internazionale senza "+" (es. "393331234567").
   *  Da inserire solo dopo averlo verificato con il negozio. */
  whatsapp: null as string | null,

  /** Orari di apertura. Fonte: scheda pubblica del negozio (Nextdoor).
   *  DA CONFERMARE con il titolare prima della messa online definitiva. */
  hours: {
    0: [],
    1: [['09:00', '12:30'], ['15:30', '19:30']],
    2: [['09:00', '12:30'], ['15:30', '19:30']],
    3: [['09:00', '12:30'], ['15:30', '19:30']],
    4: [['09:00', '12:30'], ['15:30', '19:30']],
    5: [['09:00', '12:30'], ['15:30', '19:30']],
    6: [['09:00', '12:30'], ['15:30', '19:30']],
  } as WeeklyHours | null,

  /** Cosa tratta il negozio (dalla scheda pubblica): usato nei testi */
  offer: {
    audience: 'Uomo e donna',
    categories: 'Abbigliamento, calzature e accessori',
    styles: 'Fashion, sportivo, classico',
  },

  /** true finché il sito è una demo: recensioni d'esempio etichettate, pagina non indicizzata */
  demo: true,

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
