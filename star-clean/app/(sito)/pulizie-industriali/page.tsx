import { PaginaServizio, metadataServizio } from "@/components/PaginaServizio";

export const metadata = metadataServizio("pulizie-industriali");

export default function Pagina() {
  return <PaginaServizio slug="pulizie-industriali" />;
}
