import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("drivewell_session");

  // Protect admin dashboard
  if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    if (!session || session.value !== "authorized_session_token_value") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if logged in and accessing login page
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    if (session && session.value === "authorized_session_token_value") {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
