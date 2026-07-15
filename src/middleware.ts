import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("drivewell_session");

  // Protect admin sub-paths (dashboard, settings, etc.)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Exclude the login page itself
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    if (!session || session.value !== "authorized_session_token_value") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
