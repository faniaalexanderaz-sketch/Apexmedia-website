import { CalendarCheck, Shirt, Store } from 'lucide-react'

const steps = [
  { icon: Shirt, title: 'Scegli capo e taglia', text: 'Sfoglia le collezioni e seleziona la tua taglia.' },
  { icon: CalendarCheck, title: 'Prenota online', text: 'Lasci nome e telefono e scegli il giorno di ritiro. Nessun pagamento online.' },
  { icon: Store, title: 'Ritira e prova', text: 'Lo teniamo da parte per te: lo provi in boutique e paghi solo se ti piace.' },
]

/** I tre passi del "prenota e ritira": ripetuti dove serve togliere dubbi prima del clic. */
export function HowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`how${compact ? ' how--compact' : ''}`} data-reveal="stagger">
      {steps.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="how__step">
          <span className="how__n">{String(i + 1).padStart(2, '0')}</span>
          <Icon aria-hidden="true" size={22} strokeWidth={1.3} className="how__icon" />
          <h3 className="how__title">{title}</h3>
          <p className="how__text">{text}</p>
        </li>
      ))}
    </ol>
  )
}
