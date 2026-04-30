export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Boksoon Kim Organization",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  laravelApiBaseUrl:
    process.env.LARAVEL_API_BASE_URL ||
    "http://127.0.0.1:8100/api/v1"
};

export function absoluteSiteUrl(path = "/") {
  return new URL(path, appConfig.siteUrl).toString();
}

export function absoluteLaravelUrl(path: string) {
  return new URL(path.replace(/^\//, ""), `${appConfig.laravelApiBaseUrl}/`).toString();
}
