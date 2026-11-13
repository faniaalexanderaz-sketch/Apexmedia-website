export const SERVIZI_FORM = [
  { valore: "civili", nome: "Pulizie civili", riga: "Condominio, ufficio, studio, appartamento" },
  { valore: "industriali", nome: "Pulizie industriali", riga: "Capannone, magazzino, officina" },
  { valore: "pavimenti", nome: "Trattamento pavimenti", riga: "Monospazzola e lavasciuga" },
] as const;

export const COMUNI_FORM = [
  "Alessandria",
  "Valenza",
  "Casale Monferrato",
  "Tortona",
  "Novi Ligure",
  "Altro comune",
] as const;

export const FASCE_MQ = [
  "Fino a 100 m²",
  "Da 100 a 300 m²",
  "Da 300 a 1.000 m²",
  "Oltre 1.000 m²",
  "Non lo so",
] as const;

export const CHIAVI_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Lead = {
  servizio: (typeof SERVIZI_FORM)[number]["valore"];
  comune: string;
  mq: (typeof FASCE_MQ)[number];
  nome: string;
  telefono: string;
  email: string | null;
  pagina: string | null;
  utm: Partial<Record<(typeof CHIAVI_UTM)[number], string>>;
};

const testo = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const telefonoValido = (t: string) => t.replace(/\D/g, "").length >= 8 && /^[\d\s+().-]+$/.test(t);
export const emailValida = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** Valida i dati in arrivo dal form. Restituisce il lead pulito oppure un messaggio d'errore. */
export function validaLead(dati: unknown): { ok: true; lead: Lead } | { ok: false; errore: string } {
  if (!dati || typeof dati !== "object") return { ok: false, errore: "Richiesta non valida." };
  const d = dati as Record<string, unknown>;

  const servizio = SERVIZI_FORM.find((s) => s.valore === d.servizio)?.valore;
  if (!servizio) return { ok: false, errore: "Scegli il servizio." };

  const comune = testo(d.comune, 80);
  if (comune.length < 2) return { ok: false, errore: "Indica il comune." };

  const mq = FASCE_MQ.find((f) => f === d.mq);
  if (!mq) return { ok: false, errore: "Scegli i metri quadri." };

  const nome = testo(d.nome, 80);
  if (nome.length < 2) return { ok: false, errore: "Scrivi il tuo nome." };

  const telefono = testo(d.telefono, 30);
  if (!telefonoValido(telefono)) return { ok: false, errore: "Controlla il numero di telefono." };

  const email = testo(d.email, 120);
  if (email && !emailValida(email)) return { ok: false, errore: "Controlla l'indirizzo email." };

  if (d.consenso !== true) return { ok: false, errore: "Serve il consenso alla privacy." };

  const utm: Lead["utm"] = {};
  const u = (d.utm && typeof d.utm === "object" ? d.utm : {}) as Record<string, unknown>;
  for (const k of CHIAVI_UTM) {
    const v = testo(u[k], 150);
    if (v) utm[k] = v;
  }

  return {
    ok: true,
    lead: { servizio, comune, mq, nome, telefono, email: email || null, pagina: testo(d.pagina, 200) || null, utm },
  };
}
