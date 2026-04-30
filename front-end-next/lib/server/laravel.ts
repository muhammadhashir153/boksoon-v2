import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, authCookieOptions } from "./auth";
import { absoluteLaravelUrl } from "./config";

type LaravelResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

type RefreshResult = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

async function parseLaravelResponse<T>(response: Response): Promise<LaravelResult<T>> {
  const text = await response.text();
  if (!text) {
    return {
      success: response.ok,
      message: response.ok ? "OK" : "Request failed."
    };
  }

  try {
    return JSON.parse(text) as LaravelResult<T>;
  } catch {
    return {
      success: response.ok,
      message: text
    };
  }
}

export async function laravelFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string
) {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(absoluteLaravelUrl(path), {
    ...init,
    headers,
    cache: init.cache || "no-store"
  });

  return {
    response,
    payload: await parseLaravelResponse<T>(response)
  };
}

export async function refreshTokens(refreshToken: string) {
  const { response, payload } = await laravelFetch<RefreshResult>("auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok || !payload.success || !payload.data) {
    return null;
  }

  return payload.data;
}

function copySearchParams(request: NextRequest, basePath: string) {
  const url = new URL(absoluteLaravelUrl(basePath));
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url;
}

async function buildForwardBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return JSON.stringify(json);
  }

  if (contentType.includes("multipart/form-data")) {
    return await request.formData();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
      params.append(key, String(value));
    });
    return params;
  }

  return await request.text();
}

async function doProxy(request: NextRequest, laravelPath: string, accessToken?: string) {
  const url = copySearchParams(request, laravelPath);
  const body = await buildForwardBody(request);
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers.set("Content-Type", contentType);
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(url, {
    method: request.method,
    headers,
    body: body as BodyInit | null | undefined,
    cache: "no-store"
  });
}

export async function proxyLaravelRequest(
  request: NextRequest,
  laravelPath: string,
  options: { requireAuth?: boolean } = {}
) {
  const cookieStore = cookies();
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value || cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value || cookieStore.get(REFRESH_COOKIE)?.value;

  let response = await doProxy(request, laravelPath, accessToken);

  if (options.requireAuth && response.status === 401 && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      accessToken = refreshed.access_token;
      response = await doProxy(request, laravelPath, accessToken);
      const payload = await response.text();
      const nextResponse = new NextResponse(payload, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/json"
        }
      });
      nextResponse.cookies.set(ACCESS_COOKIE, refreshed.access_token, authCookieOptions);
      nextResponse.cookies.set(REFRESH_COOKIE, refreshed.refresh_token, authCookieOptions);
      return nextResponse;
    }
  }

  const output = await response.text();
  const nextResponse = new NextResponse(output, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/json"
    }
  });

  if (options.requireAuth && response.status === 401) {
    nextResponse.cookies.delete(ACCESS_COOKIE);
    nextResponse.cookies.delete(REFRESH_COOKIE);
  }

  return nextResponse;
}

export async function fetchPublicResource<T>(path: string) {
  const { response, payload } = await laravelFetch<T>(path);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to fetch resource.");
  }

  return payload.data as T;
}

export async function fetchProtectedResource<T>(path: string) {
  const cookieStore = cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  // If access token is missing but refresh token is still valid, try to continue this request.
  if (!accessToken && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
    }
  }

  if (!accessToken) {
    throw new Error("Authentication required.");
  }

  let { response, payload } = await laravelFetch<T>(path, {}, accessToken);

  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      ({ response, payload } = await laravelFetch<T>(path, {}, refreshed.access_token));
    }
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to fetch protected resource.");
  }

  return payload.data as T;
}
