import { NextRequest } from "next/server";
import { proxyLaravelRequest } from "@/lib/server/laravel";

export async function PATCH(request: NextRequest) {
  return proxyLaravelRequest(request, "auth/password", { requireAuth: true });
}
