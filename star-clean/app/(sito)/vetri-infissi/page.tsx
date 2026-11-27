import { PaginaServizio, metadataServizio } from "@/components/PaginaServizio";

export const metadata = metadataServizio("vetri-infissi");

export default function Pagina() {
  return <PaginaServizio slug="vetri-infissi" />;
}
