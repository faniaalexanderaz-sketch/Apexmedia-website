import { useEffect, useRef } from 'react'
import { X, Phone, MapPin } from 'lucide-react'
import { navItems } from '../data/nav'
import { fullAddress, store } from '../data/store'
import { gsap, MEDIA, useGSAP } from '../lib/gsap'
import { Wordmark } from './Wordmark'

type Props = { open: boolean; onClose: () => void }

/**
 * Menu fullscreen per smartphone e tablet.
 * Apertura: il pannello cala dall'alto come un sipario, le voci salgono in sequenza.
 * Accessibilità: focus intrappolato nel pannello, Esc per chiudere, resto della pagina inerte.
 */
export function MobileMenu({ open, onClose }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        tl.current = gsap
          .timeline({ paused: true })
          .fromTo(
            panel.current,
            { clipPath: 'inset(0% 0% 100% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' },
          )
          .from('.mobile-menu__link-text', { yPercent: 110, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.32)
          .from('.mobile-menu__index', { autoAlpha: 0, duration: 0.6, stagger: 0.06 }, 0.45)
          .from('.mobile-menu__footer > *', { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.08 }, 0.55)
        return () => {
          tl.current = null
        }
      })
    },
    { scope: panel },
  )

  useEffect(() => {
    const el = panel.current
    if (!el) return
    const main = document.getElementById('main')
    const header = document.querySelector('.site-header')
    if (open) {
      el.hidden = false
      document.documentElement.classList.add('menu-open')
      main?.setAttribute('inert', '')
      header?.setAttribute('inert', '')
      if (tl.current) tl.current.timeScale(1).play(0)
      closeBtn.current?.focus()
    } else if (!el.hidden) {
      document.documentElement.classList.remove('menu-open')
      main?.removeAttribute('inert')
      header?.removeAttribute('inert')
      const finish = () => {
        el.hidden = true
        document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus({ preventScroll: true })
      }
      if (tl.current) tl.current.timeScale(1.6).reverse().eventCallback('onReverseComplete', finish)
      else finish()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panel.current) return
      const focusables = panel.current.querySelectorAll<HTMLElement>('a[href], button')
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // si chiude il menu e poi si scorre alla sezione, quando la pagina è di nuovo scorrevole
  const goTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    onClose()
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
      history.replaceState(null, '', `#${id}`)
    })
  }

  return (
    <div
      ref={panel}
      id="mobile-menu"
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden
    >
      <div className="mobile-menu__top">
        <Wordmark />
        <button ref={closeBtn} type="button" className="mobile-menu__close" onClick={onClose}>
          <span>Chiudi</span>
          <X aria-hidden="true" size={20} strokeWidth={1.4} />
        </button>
      </div>

      <nav aria-label="Menu principale">
        <ol className="mobile-menu__list">
          {navItems.map((item, i) => (
            <li key={item.id}>
              <a className="mobile-menu__link" href={`#${item.id}`} onClick={(e) => goTo(e, item.id)}>
                <span className="mobile-menu__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="mobile-menu__link-mask">
                  <span className="mobile-menu__link-text">{item.label}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mobile-menu__footer">
        <a className="btn btn--light btn--block" href={store.phone.href}>
          <Phone aria-hidden="true" size={16} strokeWidth={1.6} /> Chiama {store.phone.display}
        </a>
        <a className="mobile-menu__address" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden="true" size={16} strokeWidth={1.6} />
          <span>
            {fullAddress}
            <span className="visually-hidden"> (indicazioni su Google Maps, si apre in una nuova scheda)</span>
          </span>
        </a>
      </div>
    </div>
  )
}
