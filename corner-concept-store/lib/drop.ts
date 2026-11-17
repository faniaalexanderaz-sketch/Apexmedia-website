// "Vintage Barbour Days": il drop chiude il sabato alle 19:30, come sulla locandina del negozio.
// DEMO: la scadenza si rinnova ogni settimana. In produzione va messa la data vera del drop
// in DROP.closesAt (ISO, es. "2026-11-28T19:30:00+01:00"): un conto alla rovescia finto non si fa.

export const DROP = {
  title: "Vintage Barbour Days",
  closesAt: null as string | null,
  closingWeekday: 6, // sabato
  closingHour: 19,
  closingMinute: 30,
} as const;

const ROME = "Europe/Rome";

function romeWallClock(instant: number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour"), mi: get("minute"), s: get("second") };
}

// Istante UTC che corrisponde a una data e ora "da orologio" ad Alessandria.
function romeToInstant(y: number, mo: number, d: number, h: number, mi: number): number {
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 2; i += 1) {
    const w = romeWallClock(guess);
    const shown = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);
    guess -= shown - Date.UTC(y, mo - 1, d, h, mi);
  }
  return guess;
}

export function dropClosesAt(now: number): number {
  if (DROP.closesAt) return new Date(DROP.closesAt).getTime();
  const w = romeWallClock(now);
  const weekday = new Date(Date.UTC(w.y, w.mo - 1, w.d)).getUTCDay();
  let daysAhead = (DROP.closingWeekday - weekday + 7) % 7;
  let target = romeToInstant(w.y, w.mo, w.d + daysAhead, DROP.closingHour, DROP.closingMinute);
  if (target <= now) {
    daysAhead += 7;
    target = romeToInstant(w.y, w.mo, w.d + daysAhead, DROP.closingHour, DROP.closingMinute);
  }
  return target;
}

export function countdownParts(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}
