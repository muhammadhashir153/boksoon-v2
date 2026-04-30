import { AdminShell } from "@/components/admin/AdminShell";
import { adminRouteAllowed, defaultAdminRouteForRole, normalizeAdminRole } from "@/lib/admin-routes";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/server/auth";
import { laravelFetch, refreshTokens } from "@/lib/server/laravel";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerStore = headers();
  const pathname =
    headerStore.get("x-admin-pathname") ||
    headerStore.get("x-pathname") ||
    headerStore.get("x-invoke-path") ||
    headerStore.get("next-url") ||
    headerStore.get("x-matched-path") ||
    "";

  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/verify-email" ||
    pathname.startsWith("/admin/verify-email/");

  if (isPublicAdminRoute) {
    return <>{children}</>;
  }

  const cookieStore = cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!accessToken && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
    }
  }

  if (!accessToken) {
    redirect("/admin/login");
  }

  let { response, payload } = await laravelFetch("auth/me", {}, accessToken);
  if ((!response.ok || !payload.success) && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed?.access_token) {
      ({ response, payload } = await laravelFetch("auth/me", {}, refreshed.access_token));
    }
  }

  if (!response.ok || !payload.success) {
    redirect("/admin/login");
  }

  const normalizedRole = normalizeAdminRole((payload.data as { role_name?: string } | undefined)?.role_name);
  if (!adminRouteAllowed(pathname || "/admin", normalizedRole)) {
    redirect(defaultAdminRouteForRole(normalizedRole));
  }

  return <AdminShell>{children}</AdminShell>;
}
