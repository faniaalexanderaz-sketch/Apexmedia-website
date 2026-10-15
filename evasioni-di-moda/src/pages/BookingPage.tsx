import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, MapPin, Phone, Store } from 'lucide-react'
import { formatPrice } from '../data/products'
import { fullAddress, store } from '../data/store'
import { nextPickupDays, type PickupDay } from '../lib/hours'
import { paths } from '../router'
import { useReveal } from '../hooks/useReveal'
import { ResponsiveImage } from '../components/ResponsiveImage'
import { useBag, type BagLine } from '../components/shop/Bag'

type Done = { code: string; demo: boolean; items: BagLine[]; total: number; day: string; slot: string; name: string; phone: string }

/** Completa la prenotazione: pochi campi, nessun pagamento, conferma immediata con codice. */
export function BookingPage() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const bag = useBag()
  const [days, setDays] = useState<PickupDay[]>([])
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [done, setDone] = useState<Done | null>(null)

  // i giorni dipendono dall'ora attuale: calcolati solo nel browser
  useEffect(() => {
    const d = nextPickupDays()
    setDays(d)
    if (d[0]) {
      setDay(d[0].value)
      setSlot(d[0].slots[0]?.value ?? '')
    }
  }, [])

  const selectedDay = days.find((d) => d.value === day)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (form.get('website')) return // campo trappola per i bot
    setStatus('sending')
    const payload = {
      nome: String(form.get('nome') || '').trim(),
      telefono: String(form.get('telefono') || '').trim(),
      email: String(form.get('email') || '').trim(),
      giorno: selectedDay?.label ?? day,
      fascia: selectedDay?.slots.find((s) => s.value === slot)?.label ?? slot,
      note: String(form.get('note') || '').trim(),
      articoli: bag.items.map((i) => ({ nome: i.product.name, slug: i.slug, taglia: i.size, quantita: i.qty, prezzo: i.price })),
    }
    try {
      const res = await fetch('/api/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Errore')
      setDone({ code: data.code, demo: Boolean(data.demo), items: bag.items, total: bag.total, day: payload.giorno, slot: payload.fascia, name: payload.nome, phone: payload.telefono })
      bag.clear()
      window.scrollTo({ top: 0 })
    } catch {
      setStatus('error')
    }
  }

  if (done) {
    return (
      <div ref={root} className="booking booking--done" data-header="light">
        <div className="container booking__done">
          <span className="booking__check" aria-hidden="true">
            <Check size={30} strokeWidth={1.6} />
          </span>
          <p className="eyebrow">Prenotazione ricevuta · codice {done.code}</p>
          <h1 className="booking__title">
            Grazie {done.name.split(' ')[0]}, <em>ti aspettiamo.</em>
          </h1>
          <p className="booking__lead">
            Teniamo da parte i tuoi capi per <strong>{done.day}</strong>, {done.slot.toLowerCase()}. Ti contattiamo al{' '}
            {done.phone} per confermare. Paghi in negozio, solo ciò che ti piace.
          </p>
          <ul className="booking__summary-list">
            {done.items.map((i) => (
              <li key={`${i.slug}-${i.size}`}>
                <span>
                  {i.product.name} · taglia {i.size}
                  {i.qty > 1 && ` × ${i.qty}`}
                </span>
                <span>{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="booking__done-actions">
            <a className="btn btn--primary" href={store.directionsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" size={16} strokeWidth={1.5} /> Indicazioni per {store.address.street}
            </a>
            <a className="btn btn--outline" href={paths.shop()}>
              Continua a guardare
            </a>
          </div>
          {done.demo && (
            <p className="booking__demo">
              Modalità demo: la prenotazione non è stata inviata al negozio. Alla messa online arriva via email allo staff.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div ref={root} className="booking" data-header="light">
      <div className="container">
        <a className="text-link booking__back" href={paths.shop()}>
          <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.5} /> Torna alle collezioni
        </a>
        <h1 className="booking__title" data-reveal="title">
          Prenota e <em>ritira.</em>
        </h1>

        {bag.items.length === 0 ? (
          <div className="booking__empty">
            <p>La tua selezione è vuota: scegli un capo e la taglia, poi torna qui.</p>
            <a className="btn btn--primary" href={paths.shop()}>
              Sfoglia le collezioni
            </a>
          </div>
        ) : (
          <div className="booking__grid">
            <form className="booking__form" onSubmit={submit}>
              <fieldset>
                <legend>I tuoi dati</legend>
                <label className="field">
                  <span>Nome e cognome</span>
                  <input name="nome" required autoComplete="name" minLength={2} />
                </label>
                <label className="field">
                  <span>Telefono</span>
                  <input name="telefono" type="tel" required autoComplete="tel" inputMode="tel" pattern="[0-9\s\+\(\)\.\-]{6,}" />
                  <small>Ti chiamiamo solo per confermare il ritiro.</small>
                </label>
                <label className="field">
                  <span>Email (facoltativa)</span>
                  <input name="email" type="email" autoComplete="email" />
                </label>
                <label className="field field--trap" aria-hidden="true">
                  <span>Sito web</span>
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </fieldset>

              <fieldset>
                <legend>Quando passi a ritirare?</legend>
                <label className="field">
                  <span>Giorno</span>
                  <select
                    value={day}
                    onChange={(e) => {
                      setDay(e.target.value)
                      const d = days.find((x) => x.value === e.target.value)
                      setSlot(d?.slots[0]?.value ?? '')
                    }}
                    required
                  >
                    {days.length === 0 && <option value="">Caricamento…</option>}
                    {days.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="slots" role="radiogroup" aria-label="Fascia oraria">
                  {selectedDay?.slots.map((s) => (
                    <label key={s.value} className="size">
                      <input type="radio" name="fascia" value={s.value} checked={slot === s.value} onChange={() => setSlot(s.value)} />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
                <label className="field">
                  <span>Note (facoltative)</span>
                  <textarea name="note" rows={3} placeholder="Es. vorrei provare anche la taglia successiva" />
                </label>
              </fieldset>

              <label className="consent">
                <input type="checkbox" required />
                <span>
                  Acconsento all’uso dei miei dati solo per gestire questa prenotazione. Nessun pagamento online, nessun
                  impegno all’acquisto.
                </span>
              </label>

              {status === 'error' && (
                <p className="booking__error" role="alert">
                  Non siamo riusciti a inviare la prenotazione. Riprova oppure chiamaci al{' '}
                  <a className="link-underline" href={store.phone.href}>
                    {store.phone.display}
                  </a>
                  .
                </p>
              )}

              <button type="submit" className="btn btn--primary btn--block" disabled={status === 'sending'} data-magnetic>
                <Store aria-hidden="true" size={17} strokeWidth={1.5} />
                {status === 'sending' ? 'Invio in corso…' : 'Conferma la prenotazione'}
              </button>
            </form>

            <aside className="booking__summary" aria-label="Riepilogo">
              <h2 className="booking__summary-title">Riepilogo</h2>
              <ul className="booking__items">
                {bag.items.map((i) => (
                  <li key={`${i.slug}-${i.size}`}>
                    <span className="booking__thumb">
                      <ResponsiveImage image={i.product.image} sizes="72px" alt="" />
                    </span>
                    <span className="booking__item-info">
                      <strong>{i.product.name}</strong>
                      <small>
                        Taglia {i.size}
                        {i.qty > 1 && ` × ${i.qty}`}
                      </small>
                    </span>
                    <span>{formatPrice(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="booking__total">
                <span>Totale da pagare al ritiro</span>
                <strong>{formatPrice(bag.total)}</strong>
              </p>
              <ul className="booking__perks">
                <li>
                  <Store aria-hidden="true" size={15} strokeWidth={1.5} /> Ritiro in {fullAddress}
                </li>
                <li>
                  <Check aria-hidden="true" size={15} strokeWidth={1.8} /> Teniamo i capi da parte per 48 ore
                </li>
                <li>
                  <Phone aria-hidden="true" size={15} strokeWidth={1.5} /> Domande? {store.phone.display}
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
