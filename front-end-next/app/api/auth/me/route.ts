import { NextRequest } from "next/server";
import { proxyLaravelRequest } from "@/lib/server/laravel";

export async function GET(request: NextRequest) {
  return proxyLaravelRequest(request, "auth/me", { requireAuth: true });
}
