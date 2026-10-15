import { useEffect, useRef, useState } from 'react'
import { navItems } from '../data/nav'
import { Wordmark } from './Wordmark'
import { MobileMenu } from './MobileMenu'

type Theme = 'dark' | 'light'

/**
 * Header fisso: trasparente sopra l'hero, poi prende il fondo della sezione
 * che sta attraversando (avorio o inchiostro). Si nasconde scorrendo verso il basso
 * e ricompare appena si risale, così non copre mai i contenuti più del necessario.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [active, setActive] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const vh = window.innerHeight
      setScrolled(y > 24)
      const goingDown = y > lastY.current + 4
      const goingUp = y < lastY.current - 4
      if (goingDown && y > vh * 0.7) setHidden(true)
      else if (goingUp || y < vh * 0.7) setHidden(false)
      lastY.current = y

      // tema: la sezione che passa sotto l'header
      const probe = 36
      const sections = document.querySelectorAll<HTMLElement>('[data-header]')
      for (const section of sections) {
        const r = section.getBoundingClientRect()
        if (r.top <= probe && r.bottom > probe) {
          setTheme(section.dataset.header === 'dark' ? 'dark' : 'light')
          break
        }
      }

      // voce attiva: la sezione che occupa la linea a metà schermo
      let current: string | null = null
      for (const item of navItems) {
        const el = document.getElementById(item.id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= vh * 0.45 && r.bottom > vh * 0.45) current = item.id
      }
      setActive(current)
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

  // chi naviga da tastiera deve sempre vedere l'header quando ci entra
  const onFocus = () => setHidden(false)

  return (
    <>
      <header
        className="site-header"
        data-theme={theme}
        data-scrolled={scrolled || undefined}
        data-hidden={(hidden && !menuOpen) || undefined}
        data-intro
        onFocus={onFocus}
      >
        <div className="site-header__inner">
          <a className="site-header__brand" href="#top" aria-label="Evasioni di Moda, torna all'inizio">
            <Wordmark />
          </a>

          <nav className="site-nav" aria-label="Navigazione principale">
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    className="site-nav__link link-underline"
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'location' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a className="btn btn--header" href="#contatti">
            Vieni a trovarci
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className="menu-toggle__label">Menu</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
