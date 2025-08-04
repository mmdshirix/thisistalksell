import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sql = getSql()
  const { id: chatbotId } = params
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ isAuthenticated: false, message: "No token provided" }, { status: 401 })
  }

  try {
    const decoded = verifyAdminToken(token)
    if (decoded.chatbotId === chatbotId) {
      // Optionally, verify user exists in DB for extra security
      const user = await sql`SELECT id FROM admin_users WHERE id = ${decoded.userId} AND chatbot_id = ${chatbotId}`
      if (user.length > 0) {
        return NextResponse.json({ isAuthenticated: true, userId: decoded.userId })
      }
    }
    return NextResponse.json(
      { isAuthenticated: false, message: "Invalid token or chatbot ID mismatch" },
      { status: 401 },
    )
  } catch (error) {
    console.error("Authentication check failed:", error)
    return NextResponse.json({ isAuthenticated: false, message: "Authentication failed" }, { status: 401 })
  }
}
