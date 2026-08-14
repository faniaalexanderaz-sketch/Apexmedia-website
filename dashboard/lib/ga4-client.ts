import { BetaAnalyticsDataClient } from "@google-analytics/data";

let cachedClient: BetaAnalyticsDataClient | null = null;

function getCredentials() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (!propertyId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      "Configurazione GA4 mancante: verifica GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY nelle variabili d'ambiente."
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return { propertyId, clientEmail, privateKey };
}

export function getGa4Client(): { client: BetaAnalyticsDataClient; propertyId: string } {
  const { propertyId, clientEmail, privateKey } = getCredentials();

  if (!cachedClient) {
    cachedClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  return { client: cachedClient, propertyId: `properties/${propertyId}` };
}

export class Ga4ApiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "Ga4ApiError";
    this.status = status;
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof Ga4ApiError) {
    return { message: err.message, status: err.status };
  }
  if (err instanceof Error) {
    return { message: err.message, status: 502 };
  }
  return { message: "Errore sconosciuto durante la chiamata a Google Analytics.", status: 500 };
}
