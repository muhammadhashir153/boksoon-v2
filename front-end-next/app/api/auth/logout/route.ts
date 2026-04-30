import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authCookieOptions } from "@/lib/server/auth";
import { laravelFetch } from "@/lib/server/laravel";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  const { response, payload } = await laravelFetch("auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  }, accessToken);

  const nextResponse = NextResponse.json(payload, { status: response.status });
  nextResponse.cookies.set(ACCESS_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
  nextResponse.cookies.set(REFRESH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
  return nextResponse;
}
