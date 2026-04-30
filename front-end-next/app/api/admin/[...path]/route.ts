import { NextRequest } from "next/server";
import { proxyLaravelRequest } from "@/lib/server/laravel";

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyLaravelRequest(request, `admin/${params.path.join("/")}`, { requireAuth: true });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
