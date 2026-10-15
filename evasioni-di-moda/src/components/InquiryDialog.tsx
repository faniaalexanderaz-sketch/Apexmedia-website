import { useEffect, useRef } from 'react'
import { MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { store, whatsappUrl } from '../data/store'
import { gsap, MEDIA } from '../lib/gsap'
import type { InquiryContent } from './Inquiry'
import { ResponsiveImage } from './ResponsiveImage'

type Props = { content: InquiryContent | null; onClose: () => void }

/**
 * Pannello di approfondimento per look, collezioni e ispirazioni.
 * Ogni apertura finisce su un'azione concreta: chiamare o venire in negozio.
 * Basato su <dialog> nativo: focus, Esc e inerzia della pagina gestiti dal browser.
 */
export function InquiryDialog({ content, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el || !content) return
    if (!el.open) el.showModal()
    document.documentElement.classList.add('dialog-open')
    if (window.matchMedia(MEDIA.motion).matches) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(
        el.querySelector('.inquiry__panel'),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' },
      )
      gsap.fromTo(el.querySelector('.inquiry__media img'), { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'expo.out' })
    }
  }, [content])

  const close = () => {
    const el = dialog.current
    if (!el) return
    const done = () => {
      el.close()
    }
    if (window.matchMedia(MEDIA.motion).matches) {
      gsap.to(el, { autoAlpha: 0, duration: 0.25, ease: 'power1.in', onComplete: done })
    } else done()
  }

  // evento "close": scatta sia con il pulsante sia con Esc
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const onNativeClose = () => {
      document.documentElement.classList.remove('dialog-open')
      gsap.set(el, { clearProps: 'opacity,visibility' })
      onClose()
    }
    el.addEventListener('close', onNativeClose)
    return () => el.removeEventListener('close', onNativeClose)
  }, [onClose])

  const whatsapp = content ? whatsappUrl(`Buongiorno, vorrei informazioni su ${content.topic}.`) : null

  return (
    <dialog
      ref={dialog}
      className="inquiry"
      aria-labelledby="inquiry-title"
      onClick={(e) => {
        // clic sullo sfondo scuro: chiude
        if (e.target === e.currentTarget) close()
      }}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
    >
      {content && (
        <div className="inquiry__panel">
          <div className="inquiry__media">
            <ResponsiveImage image={content.image} sizes="(min-width: 900px) 40vw, 100vw" />
          </div>
          <div className="inquiry__body">
            <button type="button" className="inquiry__close" onClick={close} aria-label="Chiudi">
              <X aria-hidden="true" size={20} strokeWidth={1.4} />
            </button>
            <p className="eyebrow inquiry__kicker">{content.kicker}</p>
            <h2 id="inquiry-title" className="inquiry__title">
              {content.title}
            </h2>
            {content.paragraphs.map((p) => (
              <p key={p} className="inquiry__text">
                {p}
              </p>
            ))}
            {content.tips && (
              <ol className="inquiry__tips">
                {content.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ol>
            )}
            {content.price && <p className="inquiry__price">{content.price}</p>}

            <div className="inquiry__cta">
              <p className="inquiry__cta-title">Ti piace? Vieni a provarlo.</p>
              <div className="inquiry__actions">
                <a className="btn btn--dark" href={store.phone.href}>
                  <Phone aria-hidden="true" size={16} strokeWidth={1.6} /> Chiama {store.phone.display}
                </a>
                <a className="btn btn--outline" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin aria-hidden="true" size={16} strokeWidth={1.6} /> Indicazioni
                  <span className="visually-hidden"> (Google Maps, si apre in una nuova scheda)</span>
                </a>
                {whatsapp && (
                  <a className="btn btn--outline" href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" size={16} strokeWidth={1.6} /> Scrivici su WhatsApp
                  </a>
                )}
              </div>
              <p className="inquiry__note">
                Immagine dimostrativa: disponibilità, taglie e prezzi si verificano in boutique.
              </p>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
