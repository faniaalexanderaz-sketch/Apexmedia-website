import { PaginaServizio, metadataServizio } from "@/components/PaginaServizio";

export const metadata = metadataServizio("tapparelle-persiane");

export default function Pagina() {
  return <PaginaServizio slug="tapparelle-persiane" />;
}
