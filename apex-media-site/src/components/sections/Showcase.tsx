import fs from "node:fs";
import path from "node:path";
import { showcase } from "@/data/showcase";
import { portfolio, type Shot } from "@/data/portfolio";
import { ShowcaseStage, type StageItem } from "./ShowcaseStage";

/** Misure di ripiego per uno screenshot di cui non conosciamo l’altezza: servono solo a riservare lo spazio. */
const UNKNOWN = { width: 1600, height: 5200 };

/**
 * Sceglie, per ogni sito, quale immagine mostrare nel portatile: lo screenshot in /public/showcase/
 * se esiste, altrimenti quello a pagina intera già presente nel portfolio.
 * Il controllo avviene in fase di build: la pagina resta statica.
 */
export function Showcase() {
  const items: StageItem[] = showcase.flatMap((s) => {
    const own = fs.existsSync(path.join(process.cwd(), "public", s.image));
    const fallback = portfolio.find((p) => p.slug === s.fallback)?.shots.full;
    const shot: Shot | undefined = own
      ? {
          src: s.image,
          width: s.width ?? UNKNOWN.width,
          height: s.height ?? UNKNOWN.height,
        }
      : fallback;
    if (!shot) return [];
    return [
      {
        name: s.name,
        work: s.work,
        url: s.url,
        domain: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        shot,
      },
    ];
  });
  if (items.length === 0) return null;
  return <ShowcaseStage items={items} />;
}
