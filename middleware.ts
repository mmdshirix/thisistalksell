import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// رمز عبور کلی سیستم
const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

// مسیرهایی که نیاز به احراز هویت کلی ندارند
const PUBLIC_PATHS = [
  "/system-login",
  "/api/system-auth",
  "/api/widget-loader",
  "/widget-loader",
  "/launcher/",
  "/widget/",
  "/_next/",
  "/favicon.ico",
  "/placeholder",
  "/api/chat", // برای widget ها
]

// مسیرهای پنل ادمین که فقط احراز هویت خودشان را می‌خواهند
const ADMIN_PANEL_PATHS = ["/admin-panel/", "/api/admin-panel/"]

// بررسی اینکه آیا مسیر عمومی است یا خیر
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

// بررسی اینکه آیا مسیر پنل ادمین است یا خیر
function isAdminPanelPath(pathname: string): boolean {
  return ADMIN_PANEL_PATHS.some((path) => pathname.startsWith(path))
}

// بررسی احراز هویت کلی از کوکی
function isSystemAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get("system-auth")
  return authCookie?.value === "authenticated"
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // اگر مسیر عمومی است، ادامه بده
  if (isPublicPath(pathname)) {
    const response = NextResponse.next()

    // اضافه کردن CORS headers برای widget
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // برای widget-related paths، frame restrictions را حذف کن
    if (
      pathname.startsWith("/widget/") ||
      pathname.includes("widget-loader") ||
      pathname.startsWith("/api/chatbots/") ||
      pathname.startsWith("/launcher/")
    ) {
      response.headers.delete("X-Frame-Options")
      response.headers.set("Content-Security-Policy", "frame-ancestors *")
    }

    return response
  }

  // اگر مسیر پنل ادمین است، فقط احراز هویت خودش را بررسی کن
  if (isAdminPanelPath(pathname)) {
    const response = NextResponse.next()
    return response
  }

  // برای بقیه مسیرها، بررسی احراز هویت کلی
  if (!isSystemAuthenticated(request)) {
    // هدایت به صفحه لاگین کلی
    const loginUrl = new URL("/system-login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // کاربر احراز هویت شده، ادامه بده
  const response = NextResponse.next()

  // اضافه کردن CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
