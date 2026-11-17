// Formattazione a mano, identica su server e browser: niente differenze di Intl in idratazione.

const NBSP = " ";

export function euro(value: number, options: { decimals?: boolean } = {}): string {
  const cents = Math.round(value * 100);
  const whole = Math.floor(cents / 100);
  const rest = cents % 100;
  const wholeText = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const showDecimals = options.decimals ?? rest !== 0;
  return showDecimals ? `${wholeText},${String(rest).padStart(2, "0")}${NBSP}€` : `${wholeText}${NBSP}€`;
}

export function pezzi(n: number): string {
  return n === 1 ? "1 capo" : `${n} capi`;
}

export function due(n: number): string {
  return String(n).padStart(2, "0");
}
