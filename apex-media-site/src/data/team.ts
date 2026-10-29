export type Member = {
  name: string;
  /** SEGNAPOSTO: ruolo da confermare */
  role: string;
  /** Foto verticale (3:4). Finché è null la sezione "Chi siamo" non viene mostrata. */
  photo: { src: string; width: number; height: number } | null;
};

export const team: Member[] = [
  { name: "Alex Fania", role: "[RUOLO]", photo: null },
  { name: "Federico Delfino", role: "[RUOLO]", photo: null },
];

export const teamIntro =
  "Siamo Alex e Federico. Ogni cliente lo seguiamo noi, di persona: parli con chi fa davvero il lavoro.";

/** La sezione si mostra solo se tutte le foto ci sono. */
export const showTeam = team.every((m) => m.photo !== null);
