import { NextRequest } from "next/server";
import { proxyLaravelRequest } from "@/lib/server/laravel";

export async function POST(request: NextRequest) {
  return proxyLaravelRequest(request, "auth/profile", { requireAuth: true });
}

export async function PATCH(request: NextRequest) {
  return proxyLaravelRequest(request, "auth/profile", { requireAuth: true });
}
