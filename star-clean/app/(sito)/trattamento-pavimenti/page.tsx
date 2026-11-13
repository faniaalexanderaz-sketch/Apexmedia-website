import { PaginaServizio, metadataServizio } from "@/components/PaginaServizio";

export const metadata = metadataServizio("trattamento-pavimenti");

export default function Pagina() {
  return <PaginaServizio slug="trattamento-pavimenti" />;
}
