import { NextResponse } from "next/server";
import { cancellaCookieSessione } from "@/lib/admin-auth";

export async function POST() {
  await cancellaCookieSessione();
  return NextResponse.json({ ok: true });
}
