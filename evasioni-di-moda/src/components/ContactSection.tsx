import { useRef, useState } from 'react'
import { ArrowUpRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { fullAddress, store, whatsappUrl } from '../data/store'
import { useReveal } from '../hooks/useReveal'
import { SectionHeading } from './SectionHeading'

/** Contatti e localizzazione: tutto ciò che serve per chiamare o arrivare in negozio. */
export function ContactSection() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const whatsapp = whatsappUrl('Buongiorno, ho visto il vostro sito e vorrei qualche informazione.')

  return (
    <section ref={root} id="contatti" className="section contact" data-header="light" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__info">
          <SectionHeading
            index={5}
            label="Contatti"
            id="contact-title"
            title={
              <>
                Vieni in <em>boutique.</em>
              </>
            }
          />

          <address className="contact__address" data-reveal="fade">
            <span className="contact__label">
              <MapPin aria-hidden="true" size={15} strokeWidth={1.6} /> Indirizzo
            </span>
            <span className="contact__address-line">{store.address.street}</span>
            <span className="contact__address-city">
              {store.address.postalCode} {store.address.city} ({store.address.province})
            </span>
          </address>

          <div className="contact__row" data-reveal="fade">
            <span className="contact__label">
              <Phone aria-hidden="true" size={15} strokeWidth={1.6} /> Telefono
            </span>
            <a className="contact__phone link-underline" href={store.phone.href}>
              {store.phone.display}
            </a>
          </div>

          <div className="contact__row" data-reveal="fade">
            <span className="contact__label">
              <Clock aria-hidden="true" size={15} strokeWidth={1.6} /> Orari
            </span>
            {store.hours ? (
              <dl className="contact__hours">
                {store.hours.map((d) => (
                  <div key={d.day}>
                    <dt>{d.day}</dt>
                    <dd>{d.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="contact__hours-note">
                Per gli orari aggiornati <a className="link-underline" href={store.phone.href}>chiamaci al {store.phone.display}</a>:
                ti rispondiamo volentieri.
              </p>
            )}
          </div>

          <div className="contact__actions" data-reveal="stagger">
            <a className="btn btn--dark" href={store.phone.href}>
              <Phone aria-hidden="true" size={16} strokeWidth={1.6} /> Chiama la boutique
            </a>
            <a className="btn btn--outline" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" size={16} strokeWidth={1.6} /> Indicazioni stradali
              <span className="visually-hidden"> (Google Maps, si apre in una nuova scheda)</span>
            </a>
            {whatsapp && (
              <a className="btn btn--outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" size={16} strokeWidth={1.6} /> WhatsApp
              </a>
            )}
          </div>

          {store.socials.length > 0 && (
            <ul className="contact__socials">
              {store.socials.map((s) => (
                <li key={s.url}>
                  <a className="link-underline" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapCard />
      </div>
    </section>
  )
}

/**
 * Mappa con caricamento su richiesta: Google Maps (e i suoi cookie) entra in pagina
 * solo quando il visitatore lo chiede. Prima si vede una "cartolina" del negozio.
 */
function MapCard() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="map-card" data-reveal="fade" data-delay="0.2">
      {loaded ? (
        <iframe
          className="map-card__frame"
          title={`Mappa: ${store.name}, ${fullAddress}`}
          src={store.mapEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="map-card__placeholder">
          <svg className="map-card__lines" viewBox="0 0 400 500" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <path d="M-20 140 C 90 120, 160 190, 420 160" />
            <path d="M-20 330 C 120 300, 230 360, 420 320" />
            <path d="M120 -20 C 140 140, 110 300, 170 520" />
            <path d="M300 -20 C 280 160, 320 330, 260 520" />
            <path d="M-20 420 L 420 60" className="map-card__main-road" />
          </svg>
          <span className="map-card__pin" aria-hidden="true">
            <MapPin size={22} strokeWidth={1.4} />
          </span>
          <div className="map-card__caption">
            <p className="eyebrow">Ci trovi qui</p>
            <p className="map-card__street">Corso Acqui 94</p>
            <p className="map-card__city">Alessandria</p>
          </div>
          <div className="map-card__buttons">
            <button type="button" className="btn btn--light btn--small" onClick={() => setLoaded(true)}>
              Mostra la mappa
            </button>
            <a className="text-link text-link--light" href={store.mapsUrl} target="_blank" rel="noopener noreferrer">
              Apri in Google Maps <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
              <span className="visually-hidden"> (si apre in una nuova scheda)</span>
            </a>
          </div>
          <p className="map-card__privacy">Caricando la mappa accetti i cookie di Google Maps.</p>
        </div>
      )}
    </div>
  )
}
