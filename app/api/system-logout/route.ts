import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // حذف کوکی احراز هویت
  response.cookies.delete("system-auth")

  return response
}
