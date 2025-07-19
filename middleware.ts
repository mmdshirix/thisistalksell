import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

// مسیرهای عمومی که نیاز به احراز هویت ندارند
const PUBLIC_PATHS = [
  "/system-login",
  "/api/system-auth",
  "/api/system-logout",
  "/api/widget-loader",
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

  // بررسی مسیرهای عمومی
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path) || pathname === path)

  if (isPublicPath) {
    return NextResponse.next()
  }

  // بررسی احراز هویت
  const authCookie = request.cookies.get("system-auth")

  if (!authCookie || authCookie.value !== "authenticated") {
    return NextResponse.redirect(new URL("/system-login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
