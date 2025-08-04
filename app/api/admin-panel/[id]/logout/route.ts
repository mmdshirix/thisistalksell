import { NextResponse } from "next/server"

export async function POST() {
  // For a simple token-based authentication, logout is often client-side
  // by simply deleting the token. If server-side session management is used,
  // this would invalidate the session.
  return NextResponse.json({ message: "Logged out successfully" })
}
