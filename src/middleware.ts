import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "chrome-extension://",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
    return response;
  }

  // Add CORS headers to actual responses
  const response = NextResponse.next();
  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
