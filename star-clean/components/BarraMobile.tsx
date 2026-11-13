import Link from "next/link";
import { sito } from "@/content/sito";

/** Barra fissa in basso, solo su mobile: le due azioni che contano sempre a portata di pollice. */
export function BarraMobile() {
  return (
    <div
      className="border-linea fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-white p-2 md:hidden"
      style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
    >
      <a href={sito.telefono.href} className="btn btn-linea">Chiama</a>
      <Link href="/preventivo" className="btn btn-giallo">Preventivo</Link>
    </div>
  );
}
