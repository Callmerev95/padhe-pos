import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow the public login page and static/_next resources
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // If there's no session cookie, redirect to login
  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `from=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Middleware should only run for protected dashboard routes.
// Excluding `/api` entirely avoids accidental blocking of API routes.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/categories/:path*",
    "/products/:path*",
    "/pos/:path*",
    "/reports/:path*",
    "/user/:path*",
    "/settings/:path*",
    "/transactions/:path*",
  ],
};
