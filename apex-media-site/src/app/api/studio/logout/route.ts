import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_STUDIO } from "@/lib/studio/auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/studio/login", req.url), 303);
  res.cookies.delete(COOKIE_STUDIO);
  return res;
}
