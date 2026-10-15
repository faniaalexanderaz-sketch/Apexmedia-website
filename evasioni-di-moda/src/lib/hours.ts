import { store, type TimeRange } from '../data/store'

export const DAY_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const pretty = (t: string) => t.replace(/^0/, '')

/** Ora corrente in Italia, indipendente dal fuso del visitatore. */
function nowInRome(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export type OpenStatus = { open: boolean; label: string }

/** "Aperto ora · chiude alle 19:30" / "Chiuso · riapre lunedì alle 9:00" */
export function openStatus(date = new Date()): OpenStatus | null {
  const hours = store.hours
  if (!hours) return null
  const { day, minutes } = nowInRome(date)
  const today: TimeRange[] = hours[day] ?? []

  for (const [from, to] of today) {
    if (minutes >= toMinutes(from) && minutes < toMinutes(to)) {
      return { open: true, label: `Aperto ora · chiude alle ${pretty(to)}` }
    }
  }
  const laterToday = today.find(([from]) => toMinutes(from) > minutes)
  if (laterToday) return { open: false, label: `Chiuso ora · riapre alle ${pretty(laterToday[0])}` }

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7
    const first = hours[d]?.[0]
    if (first) {
      const when = i === 1 ? 'domani' : DAY_NAMES[d].toLowerCase()
      return { open: false, label: `Chiuso ora · riapre ${when} alle ${pretty(first[0])}` }
    }
  }
  return null
}

/** Righe raggruppate per la tabella orari: giorni consecutivi con lo stesso orario. */
export function hoursRows(): { days: string; hours: string }[] {
  const hours = store.hours
  if (!hours) return []
  const order = [1, 2, 3, 4, 5, 6, 0]
  const fmt = (r: TimeRange[] = []) => (r.length ? r.map(([a, b]) => `${pretty(a)}–${pretty(b)}`).join(' · ') : 'Chiuso')
  const rows: { start: number; end: number; hours: string }[] = []
  for (const d of order) {
    const h = fmt(hours[d])
    const last = rows[rows.length - 1]
    if (last && last.hours === h) last.end = d
    else rows.push({ start: d, end: d, hours: h })
  }
  return rows.map((r) => ({
    days: r.start === r.end ? DAY_NAMES[r.start] : `${DAY_NAMES[r.start]} – ${DAY_NAMES[r.end]}`,
    hours: r.hours,
  }))
}

export type PickupDay = { value: string; label: string; slots: { value: string; label: string }[] }

/** Prossimi giorni di apertura (ora italiana), per scegliere quando ritirare. */
export function nextPickupDays(count = 6, date = new Date()): PickupDay[] {
  const hours = store.hours
  if (!hours) return []
  const out: PickupDay[] = []
  const fmt = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long' })
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' })
  const { minutes } = nowInRome(date)
  for (let i = 0; out.length < count && i < 21; i++) {
    const d = new Date(date.getTime() + i * 86_400_000)
    const { day } = nowInRome(d)
    const ranges = (hours[day] ?? []).filter(([, to]) => i > 0 || toMinutes(to) - 30 > minutes)
    if (!ranges.length) continue
    const label = fmt.format(d)
    out.push({
      value: iso.format(d),
      label: (i === 0 ? 'Oggi, ' : i === 1 ? 'Domani, ' : '') + label,
      slots: ranges.map(([a, b]) => ({
        value: `${a}-${b}`,
        label: `${toMinutes(a) < 13 * 60 ? 'Mattina' : 'Pomeriggio'} (${pretty(a)}–${pretty(b)})`,
      })),
    })
  }
  return out
}
