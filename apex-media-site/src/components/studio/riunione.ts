/* La riunione: chi viene convocato lascia quello che fa e viene alla tua
   scrivania per un minuto, poi torna al suo posto. Passa da un evento del
   browser, così la finestra del computer e la scena 3D restano separate. */

export const EVENTO_RIUNIONE = "apex-studio-riunione";
export const DURATA_RIUNIONE = 60_000;
export type Riunione = { ids: string[]; fino: number };

export function convocaRiunione(ids: string[]) {
  window.dispatchEvent(new CustomEvent<Riunione>(EVENTO_RIUNIONE, { detail: { ids, fino: Date.now() + DURATA_RIUNIONE } }));
}
