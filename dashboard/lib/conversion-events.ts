export interface ConversionEventConfig {
  key: string;
  label: string;
  gaEventName: string;
  description: string;
}

export const CONVERSION_EVENTS: ConversionEventConfig[] = [
  {
    key: "whatsapp_click",
    label: "Click WhatsApp",
    gaEventName: "click_whatsapp",
    description: "Click sul pulsante/link WhatsApp",
  },
  {
    key: "tel_click",
    label: "Click Telefono",
    gaEventName: "click_tel",
    description: "Click su un numero di telefono (tel:)",
  },
  {
    key: "treatwell_click",
    label: "Click Widget Treatwell",
    gaEventName: "click_treatwell",
    description: "Interazione con il widget di prenotazione Treatwell",
  },
];
