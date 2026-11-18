/**
 * Ponte tra GSAP e le scene 3D: GSAP scrive i valori di avanzamento (0 → 1),
 * le scene li leggono a ogni frame. Con frameloop "demand" il canvas disegna solo
 * quando qualcuno chiama notify(): a sezione ferma non si consuma niente.
 */
export type SceneDriver = {
  values: Record<string, number>;
  /** true sotto 1024px: geometrie più leggere, niente ombre ricalcolate */
  light: boolean;
  listeners: Set<() => void>;
  notify: () => void;
};

export function createDriver(values: Record<string, number>): SceneDriver {
  const listeners = new Set<() => void>();
  return {
    values,
    light: false,
    listeners,
    notify: () => listeners.forEach((fn) => fn()),
  };
}
