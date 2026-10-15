import { navItems } from '../data/nav'
import { fullAddress, store } from '../data/store'
import { Wordmark } from './Wordmark'

export function Footer() {
  return (
    <footer className="site-footer" data-header="dark">
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
          <p suppressHydrationWarning>© {new Date().getFullYear()} {store.name} · Alessandria</p>
          <p>
            Demo realizzata da Apex Media. Fotografie dimostrative (Unsplash), non rappresentano capi disponibili in
            negozio.
          </p>
        </div>
      </div>
    </footer>
  )
}
