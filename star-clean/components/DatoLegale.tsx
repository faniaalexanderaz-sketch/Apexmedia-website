import { sito } from "@/content/sito";

/** Mostra un dato aziendale nelle pagine legali, o "da inserire" finché manca. */
export function DatoLegale({ campo }: { campo: keyof typeof sito.legale }) {
  const v = sito.legale[campo];
  return v ? <>{v}</> : <mark className="bg-giallo/40 px-1">da inserire</mark>;
}
