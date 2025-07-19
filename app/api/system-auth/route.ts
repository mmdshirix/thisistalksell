import { type NextRequest, NextResponse } from "next/server"

const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SYSTEM_PASSWORD) {
      const response = NextResponse.json({ success: true })

      // تنظیم کوکی امن
      response.cookies.set("system-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 روز
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ error: "رمز عبور اشتباه است" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "خطا در پردازش درخواست" }, { status: 500 })
  }
}
