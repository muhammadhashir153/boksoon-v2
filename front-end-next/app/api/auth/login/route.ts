import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_MAX_AGE,
  authCookieOptionsWithMaxAge
} from "@/lib/server/auth";
import { laravelFetch } from "@/lib/server/laravel";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { response, payload } = await laravelFetch<{
    access_token: string;
    refresh_token: string;
    user: Record<string, unknown>;
  }>("auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const nextResponse = NextResponse.json(payload, { status: response.status });

  if (response.ok && payload.success && payload.data) {
    nextResponse.cookies.set(ACCESS_COOKIE, payload.data.access_token, authCookieOptionsWithMaxAge(ACCESS_COOKIE_MAX_AGE));
    nextResponse.cookies.set(REFRESH_COOKIE, payload.data.refresh_token, authCookieOptionsWithMaxAge(REFRESH_COOKIE_MAX_AGE));
  }

  return nextResponse;
}
