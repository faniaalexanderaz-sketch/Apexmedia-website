import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json(
      { error: "DASHBOARD_PASSWORD non configurata sul server." },
      { status: 500 }
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Password non corretta." }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
