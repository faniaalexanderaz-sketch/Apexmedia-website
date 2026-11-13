import { PaginaServizio, metadataServizio } from "@/components/PaginaServizio";

export const metadata = metadataServizio("pulizie-civili");

export default function Pagina() {
  return <PaginaServizio slug="pulizie-civili" />;
}
