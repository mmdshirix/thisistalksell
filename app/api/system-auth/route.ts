import { type NextRequest, NextResponse } from "next/server"

const SYSTEM_PASSWORD = "Mmd38163816@S#iri"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === SYSTEM_PASSWORD) {
      const response = NextResponse.json({ success: true })

      // تنظیم کوکی امن
      response.cookies.set("system-auth", SYSTEM_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 روز
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
