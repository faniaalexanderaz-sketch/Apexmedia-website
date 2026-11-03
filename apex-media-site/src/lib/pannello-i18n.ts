import it from "@/i18n/pannello/it.json";
import zh from "@/i18n/pannello/zh-CN.json";

/* Testi del pannello: i file JSON in src/i18n/pannello sono la fonte. */
export type Lingua = "it" | "zh";
export type Dizionario = typeof it;
export const COOKIE_LINGUA = "eo_lang";
export const DIZIONARIO: Record<Lingua, Dizionario> = { it, zh: zh as Dizionario };

export function normalizzaLingua(v: unknown, predefinita: Lingua): Lingua {
  return v === "zh" || v === "zh-CN" ? "zh" : v === "it" ? "it" : predefinita;
}

/** "2026-11" → "novembre 2026" / "2026年11月" */
export function nomeMese(mese: string, lingua: Lingua): string {
  const [a, m] = mese.split("-");
  const i = Number(m) - 1;
  return lingua === "zh" ? `${a}年${i + 1}月` : `${DIZIONARIO.it.mesi[i]} ${a}`;
}
export function meseBreve(mese: string, lingua: Lingua): string {
  const [a, m] = mese.split("-");
  const i = Number(m) - 1;
  return lingua === "zh" ? `${i + 1}月` : `${DIZIONARIO.it.mesiBrevi[i]} ${a.slice(2)}`;
}
export function formattaData(iso: string, lingua: Lingua): string {
  const [a, m, g] = iso.slice(0, 10).split("-");
  return lingua === "zh" ? `${a}/${m}/${g}` : `${g}/${m}/${a}`;
}
export function formattaDataOra(iso: string, lingua: Lingua): string {
  return new Intl.DateTimeFormat(lingua === "zh" ? "zh-CN" : "it-IT", { timeZone: "Europe/Rome", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
export function euro(n: number, lingua: Lingua, decimali = 0): string {
  return new Intl.NumberFormat(lingua === "zh" ? "zh-CN" : "it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: decimali, minimumFractionDigits: decimali }).format(n);
}
export function numero(n: number, lingua: Lingua): string {
  return new Intl.NumberFormat(lingua === "zh" ? "zh-CN" : "it-IT").format(n);
}
export function riempi(s: string, dati: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(dati[k] ?? ""));
}
