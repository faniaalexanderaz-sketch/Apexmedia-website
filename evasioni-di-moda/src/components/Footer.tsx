import { useRef } from 'react'
import { navItems } from '../data/nav'
import { fullAddress, store } from '../data/store'
import { gsap, MEDIA, useGSAP, EASE_EDITORIAL } from '../lib/gsap'
import { Wordmark } from './Wordmark'

export function Footer() {
  const root = useRef<HTMLElement>(null)

  // il wordmark gigante sale lettera per lettera quando il footer entra in vista
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        gsap.from('.site-footer__wordmark .wordmark__word, .site-footer__wordmark .wordmark__di', {
          yPercent: 110,
          duration: 1.4,
          stagger: 0.12,
          ease: EASE_EDITORIAL,
          scrollTrigger: { trigger: '.site-footer__wordmark', start: 'top 95%', once: true },
        })
        gsap.from('.site-footer__top > *', {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="site-footer" data-header="dark">
      <div className="container">
        <div className="site-footer__top">
          <p className="site-footer__claim">
            Lo stile è il tuo modo di <em>evadere.</em>
          </p>
          <nav aria-label="Navigazione nel footer">
            <ul className="site-footer__nav">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a className="link-underline" href={`#${item.id}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="site-footer__contact">
            <p>{store.name}</p>
            <p>{fullAddress}</p>
            <p>
              <a className="link-underline" href={store.phone.href}>
                Tel. {store.phone.display}
              </a>
            </p>
            <p>
              <a className="link-underline" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
                Indicazioni stradali<span className="visually-hidden"> (si apre in una nuova scheda)</span>
              </a>
            </p>
          </div>
        </div>

        <a className="site-footer__wordmark" href="#top" aria-label="Evasioni di Moda, torna all'inizio">
          <Wordmark className="wordmark--display" />
        </a>

        <div className="site-footer__bottom">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} {store.name} · Alessandria
          </p>
          {store.demo && (
            <p>
              Demo realizzata da Apex Media · fotografie dimostrative (Unsplash), non rappresentano capi in negozio ·{' '}
              <a className="link-underline site-footer__project" href="/presentazione/">
                Scopri il progetto
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
