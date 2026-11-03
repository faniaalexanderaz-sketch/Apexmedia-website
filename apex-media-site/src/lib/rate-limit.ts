/* Limite semplice in memoria per i tentativi di login: 5 al minuto per IP. */
const tentativi = new Map<string, number[]>();

export function troppiTentativi(chiave: string, max = 5, finestraMs = 60_000): boolean {
  const ora = Date.now();
  const lista = (tentativi.get(chiave) ?? []).filter((t) => ora - t < finestraMs);
  tentativi.set(chiave, lista);
  return lista.length >= max;
}
export function registraTentativo(chiave: string): void {
  const lista = tentativi.get(chiave) ?? [];
  lista.push(Date.now());
  tentativi.set(chiave, lista);
}
export function azzeraTentativi(chiave: string): void {
  tentativi.delete(chiave);
}
