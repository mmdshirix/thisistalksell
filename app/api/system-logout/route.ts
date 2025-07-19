import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // حذف کوکی احراز هویت
  response.cookies.set("system-auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })

  return response
}
