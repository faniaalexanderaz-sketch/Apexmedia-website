import { useRef } from 'react'
import { ArrowUpRight, Star } from 'lucide-react'
import { reviews, type Review } from '../data/reviews'
import { store } from '../data/store'
import { gsap, MEDIA, useGSAP } from '../lib/gsap'
import { useReveal } from '../hooks/useReveal'
import { SectionHeading } from './SectionHeading'

/**
 * Recensioni su due nastri che scorrono in direzioni opposte: tante voci,
 * lette di sfuggita, costruiscono fiducia senza chiedere di cliccare.
 * Il nastro si ferma al passaggio del mouse o al focus, per leggere con calma.
 * Con movimento ridotto i nastri diventano liste scorrevoli a mano.
 */
export function Reviews() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const hasSamples = reviews.some((r) => r.sample)
  const half = Math.ceil(reviews.length / 2)
  const rows = [reviews.slice(0, half), reviews.slice(half)]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        root.current!.classList.add('is-animated')
        const loops = gsap.utils.toArray<HTMLElement>('.reviews__track').map((track, i) => {
          const loop =
            i % 2 === 0
              ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 })
              : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 68, ease: 'none', repeat: -1 })
          const row = track.parentElement!
          const slow = () => gsap.to(loop, { timeScale: 0, duration: 0.6, overwrite: true })
          const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true })
          row.addEventListener('mouseenter', slow)
          row.addEventListener('mouseleave', resume)
          row.addEventListener('focusin', slow)
          row.addEventListener('focusout', resume)
          return () => {
            row.removeEventListener('mouseenter', slow)
            row.removeEventListener('mouseleave', resume)
            row.removeEventListener('focusin', slow)
            row.removeEventListener('focusout', resume)
          }
        })
        return () => {
          loops.forEach((off) => off())
          root.current?.classList.remove('is-animated')
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="recensioni" className="section reviews" data-header="light" aria-labelledby="reviews-title">
      <div className="container reviews__head">
        <SectionHeading
          index={4}
          label="Recensioni"
          id="reviews-title"
          title={
            <>
              Cosa dicono <em>di noi.</em>
            </>
          }
          intro="Le parole dei clienti contano più delle nostre: ecco perché le mettiamo in primo piano."
        />
        <div className="reviews__actions" data-reveal="fade" data-delay="0.2">
          {hasSamples && (
            <p className="reviews__sample-note">
              Anteprima: testi d'esempio. Qui scorreranno le recensioni Google reali del negozio.
            </p>
          )}
          <a className="text-link" href={store.reviewsUrl} target="_blank" rel="noopener noreferrer">
            Leggi e lascia una recensione su Google <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
            <span className="visually-hidden"> (si apre in una nuova scheda)</span>
          </a>
        </div>
      </div>

      <div className="reviews__rows" data-reveal="fade">
        {rows.map((row, i) => (
          <div className="reviews__row" key={i}>
            <ul className="reviews__track">
              {row.map((r, j) => (
                <ReviewCard key={`a${j}`} review={r} />
              ))}
              {row.map((r, j) => (
                <ReviewCard key={`b${j}`} review={r} duplicate />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewCard({ review, duplicate = false }: { review: Review; duplicate?: boolean }) {
  return (
    <li className="review" aria-hidden={duplicate || undefined} data-duplicate={duplicate || undefined}>
      <p className="review__stars" aria-label={`${review.rating} stelle su 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} aria-hidden="true" size={14} strokeWidth={1.4} fill={i < review.rating ? 'currentColor' : 'none'} />
        ))}
      </p>
      <blockquote className="review__text">“{review.text}”</blockquote>
      <p className="review__author">
        {review.author}
        <span>{review.sample ? 'Testo d’esempio' : review.source}</span>
      </p>
    </li>
  )
}
