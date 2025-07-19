import { type NextRequest, NextResponse } from "next/server"

// رمز عبور کلی سیستم
const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SYSTEM_PASSWORD) {
      // ایجاد response با کوکی احراز هویت
      const response = NextResponse.json({ success: true })

      // تنظیم کوکی احراز هویت (30 روز)
      response.cookies.set("system-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 روز
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    console.error("System auth error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
