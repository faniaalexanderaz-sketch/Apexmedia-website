import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
  return res;
}
