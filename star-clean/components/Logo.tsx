import Image from "next/image";

/**
 * Simbolo reale del cliente (public/logo/mark.png, da non modificare) con il nome composto nel carattere dei titoli.
 * Il simbolo ha parti bianche: su fondo chiaro sta dentro un riquadro blu, come nel logo originale.
 */
export function Logo({ chiaro = false }: { chiaro?: boolean }) {
  const simbolo = <Image src="/logo/mark.png" alt="" width={400} height={263} sizes={chiaro ? "73px" : "54px"} className={chiaro ? "h-12 w-auto" : "h-auto w-[54px] max-w-none"} />;
  return (
    <span className={`inline-flex items-center gap-3 ${chiaro ? "text-white" : "text-blu-notte"}`}>
      {chiaro ? simbolo : <span className="bg-blu flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px]">{simbolo}</span>}
      <span className="font-titoli text-[1.1875rem] leading-none tracking-[0.02em] uppercase">
        <span className="font-bold">Star</span> <span className="font-semibold opacity-80">Clean</span>
      </span>
    </span>
  );
}
