import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./lib/server/auth";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-pathname", request.nextUrl.pathname);

  const isPublicAdminRoute =
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname.startsWith("/admin/login/") ||
    request.nextUrl.pathname === "/admin/verify-email" ||
    request.nextUrl.pathname.startsWith("/admin/verify-email/");

  if (
    !request.nextUrl.pathname.startsWith("/admin") ||
    isPublicAdminRoute
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  const hasAccessToken = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  const hasRefreshToken = Boolean(request.cookies.get(REFRESH_COOKIE)?.value);

  if (!hasAccessToken && !hasRefreshToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};
