import { useEffect, useState } from 'react'
import { MapPin, Phone } from 'lucide-react'
import { store } from '../data/store'

/**
 * Barra azioni per smartphone: chiamata e indicazioni sempre a un tocco.
 * Compare dopo l'hero e si ritira quando i contatti sono già in vista.
 */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const pastHero = window.scrollY > window.innerHeight * 0.85
      // dai contatti in giù i pulsanti sono già in pagina: la barra non serve
      const contact = document.getElementById('contatti')
      const contactReached = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.75 : false
      setVisible(pastHero && !contactReached)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="action-bar" data-visible={visible || undefined} aria-hidden={!visible} inert={!visible}>
      <a className="action-bar__btn" href={store.phone.href}>
        <Phone aria-hidden="true" size={17} strokeWidth={1.6} /> Chiama
      </a>
      <a className="action-bar__btn action-bar__btn--primary" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
        <MapPin aria-hidden="true" size={17} strokeWidth={1.6} /> Indicazioni
      </a>
    </div>
  )
}
