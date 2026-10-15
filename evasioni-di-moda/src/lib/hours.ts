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
