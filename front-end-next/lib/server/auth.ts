export const ACCESS_COOKIE = "ngo_access_token";
export const REFRESH_COOKIE = "ngo_refresh_token";

function readMaxAge(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

export const ACCESS_COOKIE_MAX_AGE = readMaxAge("AUTH_ACCESS_COOKIE_MAX_AGE", 60 * 15);
export const REFRESH_COOKIE_MAX_AGE = readMaxAge("AUTH_REFRESH_COOKIE_MAX_AGE", 60 * 60 * 24 * 30);

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export function authCookieOptionsWithMaxAge(maxAge: number) {
  return {
    ...authCookieOptions,
    maxAge
  };
}

