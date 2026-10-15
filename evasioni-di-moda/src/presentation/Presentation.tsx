import { useRef } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { images } from '../data/images'
import { gsap, MEDIA, useGSAP } from '../lib/gsap'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from '../components/ResponsiveImage'
import { Wordmark } from '../components/Wordmark'
import { animationRules, animations, funnel, needs, nextSteps, sections, startingPoint, tech } from './content'

const SITE = '/'

const palette = [
  { name: 'Avorio', hex: '#F7F4EE', role: 'Superficie principale: luce, respiro, eleganza.', dark: false },
  { name: 'Sabbia', hex: '#EFE7DB', role: 'Seconde superfici: separa i capitoli senza spezzare.', dark: false },
  { name: 'Beige caldo', hex: '#E8DFD2', role: 'Cornici, mappa, dettagli.', dark: false },
  { name: 'Bordeaux', hex: '#642E3B', role: 'L’accento: pulsanti principali e parole chiave.', dark: true },
  { name: 'Champagne', hex: '#B8A17A', role: 'Piccoli ornamenti, mai testo.', dark: false },
  { name: 'Inchiostro', hex: '#171715', role: 'Testo e chiusura del sito.', dark: true },
]

const fonts = [
  {
    family: 'Bodoni Moda',
    className: 'type--display',
    sample: 'Lo stile è il tuo modo',
    role: 'Titoli e numeri. È il carattere delle copertine di moda: contrasto netto tra tratti spessi e sottilissimi. E si chiama, appunto, Moda.',
  },
  {
    family: 'Cormorant Garamond',
    className: 'type--serif',
    sample: 'di evadere.',
    role: 'Corsivi, citazioni e testi di accompagnamento: la voce morbida e personale del negozio.',
  },
  {
    family: 'Manrope',
    className: 'type--sans',
    sample: 'Chiama · Indicazioni',
    role: 'Navigazione, pulsanti, orari: chiarezza assoluta dove serve agire.',
  },
]

export function Presentation() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        gsap.fromTo(
          '.deck-progress__bar',
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
        )
        gsap.from('.deck-cover__arch', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
        gsap.from('.deck-cover__arch img', { scale: 1.3, duration: 2.4, ease: 'expo.out' })
        gsap.from('.deck-cover__line > span', {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.08,
          ease: 'expo.out',
          delay: 0.3,
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="deck">
      <a className="skip-link" href="#deck-main">
        Vai al contenuto
      </a>
      <header className="deck-bar">
        <span className="deck-bar__brand">
          <span className="deck-bar__agency">Apex Media</span>
          <span aria-hidden="true">×</span>
          <Wordmark />
        </span>
        <a className="btn btn--primary btn--small" href={SITE} data-magnetic>
          Apri il sito <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
        </a>
        <span className="deck-progress" aria-hidden="true">
          <span className="deck-progress__bar" />
        </span>
      </header>

      <main id="deck-main">
        {/* copertina */}
        <section className="deck-cover">
          <div className="deck-cover__text">
            <p className="eyebrow deck-cover__eyebrow">Il progetto digitale · Evasioni di Moda, Alessandria</p>
            <h1 className="deck-cover__title">
              <span className="deck-cover__line">
                <span>Da scheda Google</span>
              </span>
              <span className="deck-cover__line">
                <span>
                  a <em>boutique digitale.</em>
                </span>
              </span>
            </h1>
            <p className="deck-cover__lead">
              Cosa abbiamo costruito, perché ogni scelta è stata fatta così e cosa porta al negozio: più persone che
              chiamano, chiedono indicazioni ed entrano.
            </p>
            <div className="deck-cover__actions">
              <a className="btn btn--primary" href={SITE} data-magnetic>
                Guarda il sito <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
              </a>
              <a className="btn btn--outline" href="#partenza" data-magnetic>
                Leggi il progetto
              </a>
            </div>
          </div>
          <div className="deck-cover__arch">
            <ResponsiveImage image={images.heroCappottoCammello} sizes="(min-width: 900px) 36vw, 80vw" priority />
          </div>
        </section>

        <Chapter id="partenza" index={1} label="Il punto di partenza" title={<>Oggi il negozio <em>non si vede.</em></>}>
          <div className="deck-cards deck-cards--3" data-reveal="stagger">
            {startingPoint.map((c) => (
              <article key={c.title} className="deck-card">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </article>
            ))}
          </div>
        </Chapter>

        <Chapter index={2} label="L’obiettivo" title={<>Una sola cosa conta: <em>farvi entrare.</em></>} tone="sand">
          <div className="deck-goal">
            <p className="deck-goal__statement" data-reveal="scrub">
              Il sito non è un catalogo e non è un e-commerce. È una vetrina che lavora giorno e notte per trasformare chi
              vi cerca in qualcuno che chiama, chiede la strada e varca la porta di Corso Acqui.
            </p>
            <ul className="deck-goal__kpi" data-reveal="stagger">
              <li>
                <strong>Chiamate</strong> dal pulsante “Chiama”
              </li>
              <li>
                <strong>Indicazioni</strong> aperte sul navigatore
              </li>
              <li>
                <strong>Messaggi</strong> WhatsApp, quando attivo
              </li>
              <li>
                <strong>Visite</strong> in negozio
              </li>
            </ul>
          </div>
        </Chapter>

        <Chapter index={3} label="Il percorso del cliente" title={<>Dalla ricerca <em>alla porta.</em></>}>
          <ol className="deck-funnel" data-reveal="stagger">
            {funnel.map((f, i) => (
              <li key={f.step}>
                <span className="deck-funnel__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{f.step}</h3>
                <p>{f.text}</p>
                <p className="deck-funnel__site">
                  <span>Sul sito:</span> {f.site}
                </p>
              </li>
            ))}
          </ol>
        </Chapter>

        <Chapter index={4} label="La pagina, sezione per sezione" title={<>Ogni blocco <em>ha un compito.</em></>} tone="paper">
          <ol className="deck-sections">
            {sections.map((s, i) => (
              <li key={s.name} className="deck-section" data-reveal="fade">
                <span className="deck-section__n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="deck-section__name">{s.name}</h3>
                <div className="deck-section__what">
                  <span className="deck-label">Cosa fa</span>
                  <p>{s.what}</p>
                </div>
                <div className="deck-section__why">
                  <span className="deck-label">Perché</span>
                  <p>{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </Chapter>

        <Chapter index={5} label="Identità visiva" title={<>Colori, caratteri, <em>fotografia.</em></>}>
          <div className="deck-palette" data-reveal="stagger">
            {palette.map((c) => (
              <div key={c.hex} className="deck-swatch">
                <span className="deck-swatch__chip" style={{ background: c.hex }} data-dark={c.dark || undefined}>
                  {c.hex}
                </span>
                <h3>{c.name}</h3>
                <p>{c.role}</p>
              </div>
            ))}
          </div>
          <p className="deck-note" data-reveal="fade">
            La versione precedente era più scura: abbiamo portato il sito su superfici avorio e sabbia, più luminose e
            accoglienti, lasciando al bordeaux il ruolo di accento.
          </p>

          <div className="deck-type">
            {fonts.map((f) => (
              <div key={f.family} className="deck-type__row" data-reveal="fade">
                <p className={`deck-type__sample ${f.className}`}>{f.sample}</p>
                <div>
                  <h3>{f.family}</h3>
                  <p>{f.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="deck-photo">
            <figure className="deck-photo__img" data-reveal="image">
              <span data-reveal-inner>
                <ResponsiveImage image={images.storiaStender} sizes="(min-width: 900px) 30vw, 80vw" />
              </span>
            </figure>
            <div data-reveal="fade">
              <h3>Fotografia e forma ad arco</h3>
              <p>
                Luce naturale, toni caldi, colori uniformati con un unico trattamento: foto di provenienza diversa sembrano
                un unico servizio. L’arco, ripetuto nell’hero e nel racconto del negozio, richiama vetrine e portici: diventa
                un segno riconoscibile del marchio.
              </p>
              <p className="deck-note">Le foto attuali sono dimostrative: con gli scatti reali del negozio il sito diventa ancora più vostro.</p>
            </div>
          </div>
        </Chapter>

        <Chapter index={6} label="Animazioni" title={<>Movimento <em>con un motivo.</em></>} tone="sand">
          <div className="deck-cards deck-cards--anim" data-reveal="stagger">
            {animations.map((a, i) => (
              <article key={a.name} className="deck-card">
                <span className="deck-card__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{a.name}</h3>
                <p>{a.why}</p>
              </article>
            ))}
          </div>
          <ul className="deck-rules" data-reveal="stagger">
            {animationRules.map((r) => (
              <li key={r}>
                <Check aria-hidden="true" size={16} strokeWidth={1.8} /> {r}
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter index={7} label="Tecnica, velocità, SEO locale" title={<>Bello, ma soprattutto <em>veloce.</em></>}>
          <div className="deck-cards deck-cards--3" data-reveal="stagger">
            {tech.map((t) => (
              <article key={t.title} className="deck-card">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </Chapter>

        <Chapter index={8} label="Cosa ci serve da voi" title={<>Per renderlo <em>vostro al 100%.</em></>} tone="paper">
          <ul className="deck-checklist" data-reveal="stagger">
            {needs.map((n) => (
              <li key={n}>
                <span className="deck-checklist__box" aria-hidden="true" />
                {n}
              </li>
            ))}
          </ul>
        </Chapter>

        <Chapter index={9} label="Prossimi passi" title={<>Dal sito <em>ai clienti.</em></>}>
          <ol className="deck-steps" data-reveal="stagger">
            {nextSteps.map((s, i) => (
              <li key={s.title}>
                <span className="deck-steps__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </Chapter>

        <section className="deck-close" data-header="dark">
          <p className="eyebrow">Apex Media</p>
          <h2 className="deck-close__title" data-reveal="title">
            Il prossimo cliente <em>vi sta già cercando.</em>
          </h2>
          <a className="btn btn--light" href={SITE} data-magnetic>
            Apri il sito demo <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </a>
        </section>
      </main>
    </div>
  )
}

type ChapterProps = {
  id?: string
  index: number
  label: string
  title: React.ReactNode
  tone?: 'sand' | 'paper'
  children: React.ReactNode
}

function Chapter({ id, index, label, title, tone, children }: ChapterProps) {
  return (
    <section id={id} className={`deck-chapter${tone ? ` deck-chapter--${tone}` : ''}`}>
      <div className="container">
        <header className="deck-chapter__head">
          <span className="deck-chapter__index" data-count={index}>
            {String(index).padStart(2, '0')}
          </span>
          <div>
            <p className="eyebrow deck-chapter__label" data-reveal="fade">
              {label}
            </p>
            <h2 className="deck-chapter__title" data-reveal="title">
              {title}
            </h2>
          </div>
        </header>
        <span className="deck-rule" data-reveal="line" aria-hidden="true" />
        {children}
      </div>
    </section>
  )
}
