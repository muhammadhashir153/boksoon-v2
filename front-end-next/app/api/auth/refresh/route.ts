import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  authCookieOptions,
  authCookieOptionsWithMaxAge
} from "@/lib/server/auth";
import { refreshTokens } from "@/lib/server/laravel";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: "No refresh token available." },
      { status: 401 }
    );
  }

  const refreshed = await refreshTokens(refreshToken);
  if (!refreshed) {
    const response = NextResponse.json(
      { success: false, message: "Refresh token is invalid or expired." },
      { status: 401 }
    );
    response.cookies.set(ACCESS_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
    return response;
  }

  const response = NextResponse.json({
    success: true,
    message: "Token refreshed.",
    data: refreshed
  });
  const accessMaxAge = refreshed.expires_in && refreshed.expires_in > 0 ? refreshed.expires_in : ACCESS_COOKIE_MAX_AGE;
  response.cookies.set(ACCESS_COOKIE, refreshed.access_token, authCookieOptionsWithMaxAge(accessMaxAge));
  response.cookies.set(REFRESH_COOKIE, refreshed.refresh_token, authCookieOptionsWithMaxAge(REFRESH_COOKIE_MAX_AGE));
  return response;
}
