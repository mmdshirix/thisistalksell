import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

// مسیرهای عمومی که نیاز به احراز هویت ندارند
const PUBLIC_PATHS = [
  "/system-login",
  "/api/system-auth",
  "/api/system-logout",
  "/api/widget-loader",
  "/widget-loader.js",
  "/widget-loader",
  "/api/chat",
  "/api/messages",
  "/api/tickets",
  "/api/upload",
  "/api/scrape-website",
  "/api/deepseek-models",
  "/api/test-deepseek",
  "/launcher/",
  "/widget/",
  "/admin-panel/",
  "/api/admin-panel/",
  "/api/chatbots/",
  "/api/widget-settings/",
  "/_next/",
  "/favicon.ico",
  "/public/",
  "/placeholder.svg",
  "/placeholder.jpg",
  "/placeholder-logo.svg",
  "/placeholder-logo.png",
  "/placeholder-user.jpg",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  const response = NextResponse.next()

  // اضافه کردن CORS headers برای همه درخواست‌ها
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // برای widget-related paths، frame restrictions را حذف کن
  if (
    pathname.startsWith("/widget/") ||
    pathname.includes("widget-loader") ||
    pathname.startsWith("/api/chatbots/") ||
    pathname.startsWith("/launcher/") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/messages") ||
    pathname.startsWith("/api/tickets")
  ) {
    response.headers.delete("X-Frame-Options")
    response.headers.set("Content-Security-Policy", "frame-ancestors *")
  }

  // بررسی مسیرهای عمومی
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path) || pathname === path)

  if (isPublicPath) {
    return response
  }

  // بررسی احراز هویت
  const authCookie = request.cookies.get("system-auth")

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.redirect(new URL("/system-login", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
