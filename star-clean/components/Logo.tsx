import Image from "next/image";

/**
 * Simbolo reale del cliente (public/logo/mark.png, da non modificare) con il nome composto in Montserrat.
 * Il simbolo ha parti bianche: su fondo chiaro sta dentro un riquadro petrolio, come nel logo originale.
 */
export function Logo({ chiaro = false }: { chiaro?: boolean }) {
  const simbolo = <Image src="/logo/mark.png" alt="" width={400} height={263} className={chiaro ? "h-12 w-auto" : "h-auto w-[58px] max-w-none"} />;
  return (
    <span className={`inline-flex items-center gap-2 ${chiaro ? "text-white" : "text-petrolio"}`}>
      {chiaro ? simbolo : <span className="bg-petrolio rounded-ui flex h-11 w-11 items-center justify-center overflow-hidden">{simbolo}</span>}
      <span className="text-[1.125rem] leading-none tracking-[0.04em] uppercase">
        <span className="font-extrabold">Star</span> <span className="font-medium">Clean</span>
      </span>
    </span>
  );
}
