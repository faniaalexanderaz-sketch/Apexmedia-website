const COOKIE_NAME = "eo_dashboard_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret(): string {
  return process.env.DASHBOARD_PASSWORD ?? "";
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(signature);
}

export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const signature = await sign(issuedAt);
  return `${issuedAt}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !getSecret()) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = await sign(issuedAt);
  if (!timingSafeEqualHex(expected, signature)) return false;

  const age = Date.now() - Number(issuedAt);
  return age >= 0 && age <= MAX_AGE_SECONDS * 1000;
}

export function checkPassword(candidate: string): boolean {
  const secret = getSecret();
  if (!secret || !candidate) return false;
  if (candidate.length !== secret.length) return false;
  return timingSafeEqualHex(
    Buffer.from(candidate).toString("hex"),
    Buffer.from(secret).toString("hex")
  );
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
