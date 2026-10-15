import { useEffect, useRef } from 'react'
import { ArrowRight, ShoppingBag, Store, X } from 'lucide-react'
import { formatPrice } from '../../data/products'
import { store } from '../../data/store'
import { paths } from '../../router'
import { gsap, MEDIA } from '../../lib/gsap'
import { ResponsiveImage } from '../ResponsiveImage'
import { useBag } from './Bag'

/** Pannello laterale con i capi da ritirare: si apre a ogni aggiunta e dall'icona nell'header. */
export function BagDrawer() {
  const bag = useBag()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (bag.isOpen && !el.open) {
      el.showModal()
      document.documentElement.classList.add('dialog-open')
      if (window.matchMedia(MEDIA.motion).matches) {
        gsap.fromTo(el.querySelector('.bag__panel'), { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' })
        gsap.from(el.querySelectorAll('.bag__item'), { opacity: 0, x: 30, duration: 0.6, stagger: 0.06, delay: 0.2 })
      }
    }
  }, [bag.isOpen])

  const close = () => {
    const el = ref.current
    if (!el) return
    const done = () => el.close()
    if (window.matchMedia(MEDIA.motion).matches) {
      gsap.to(el.querySelector('.bag__panel'), { xPercent: 100, duration: 0.45, ease: 'power3.in', onComplete: done })
    } else done()
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onClose = () => {
      document.documentElement.classList.remove('dialog-open')
      bag.close()
    }
    el.addEventListener('close', onClose)
    return () => el.removeEventListener('close', onClose)
  }, [bag])

  return (
    <dialog
      ref={ref}
      className="bag"
      aria-labelledby="bag-title"
      onClick={(e) => e.target === e.currentTarget && close()}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
    >
      <div className="bag__panel">
        <header className="bag__head">
          <h2 id="bag-title" className="bag__title">
            Da ritirare in negozio <span>({bag.count})</span>
          </h2>
          <button type="button" className="bag__close" onClick={close} aria-label="Chiudi">
            <X aria-hidden="true" size={20} strokeWidth={1.4} />
          </button>
        </header>

        {bag.items.length === 0 ? (
          <div className="bag__empty">
            <ShoppingBag aria-hidden="true" size={28} strokeWidth={1.2} />
            <p>Non hai ancora scelto nessun capo.</p>
            <a className="btn btn--primary" href={paths.shop()}>
              Sfoglia le collezioni
            </a>
          </div>
        ) : (
          <>
            <ul className="bag__list">
              {bag.items.map((i) => (
                <li key={`${i.slug}-${i.size}`} className="bag__item">
                  <a className="bag__thumb" href={paths.product(i.slug)}>
                    <ResponsiveImage image={i.product.image} sizes="96px" alt="" />
                  </a>
                  <div className="bag__info">
                    <a className="bag__name" href={paths.product(i.slug)}>
                      {i.product.name}
                    </a>
                    <p className="bag__meta">
                      Taglia {i.size}
                      {i.qty > 1 && ` · ${i.qty} pezzi`}
                    </p>
                    <p className="bag__price">{formatPrice(i.price * i.qty)}</p>
                  </div>
                  <button
                    type="button"
                    className="bag__remove"
                    onClick={() => bag.remove(i.slug, i.size)}
                    aria-label={`Rimuovi ${i.product.name}, taglia ${i.size}`}
                  >
                    Rimuovi
                  </button>
                </li>
              ))}
            </ul>
            <footer className="bag__foot">
              <p className="bag__total">
                <span>Totale indicativo</span>
                <strong>{formatPrice(bag.total)}</strong>
              </p>
              <p className="bag__pickup">
                <Store aria-hidden="true" size={16} strokeWidth={1.5} />
                Ritiro gratuito in {store.address.street}. Paghi in negozio, solo ciò che ti piace.
              </p>
              <a className="btn btn--primary btn--block" href={paths.booking}>
                Completa la prenotazione <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
              </a>
              <button type="button" className="text-link bag__continue" onClick={close}>
                Continua a guardare
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
