import { NextRequest } from "next/server";
import { proxyLaravelRequest } from "@/lib/server/laravel";

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyLaravelRequest(request, params.path.join("/"));
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
