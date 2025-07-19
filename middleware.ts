import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers to all responses
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // For widget-related paths, completely remove frame restrictions
  if (
    request.nextUrl.pathname.startsWith("/widget/") ||
    request.nextUrl.pathname.includes("widget-loader.js") ||
    request.nextUrl.pathname.startsWith("/api/chatbots/")
  ) {
    // Remove all frame restrictions for widget
    response.headers.delete("X-Frame-Options")
    response.headers.set("Content-Security-Policy", "frame-ancestors *")
  }

  return response
}

export const config = {
  matcher: ["/api/:path*", "/widget/:path*", "/widget-loader.js"],
}
