import { sito } from "@/content/sito";

/** Link WhatsApp con il messaggio già scritto. */
export const linkWhatsApp = (messaggio = "Ciao, vorrei un preventivo per una pulizia.") =>
  `https://wa.me/${sito.whatsapp}?text=${encodeURIComponent(messaggio)}`;
